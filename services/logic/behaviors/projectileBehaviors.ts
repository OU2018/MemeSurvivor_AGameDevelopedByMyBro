
import { IGameEngine, Projectile } from "../../../types";
import { emitParticles } from "../utils";
import { GameEventType } from "../events/events";
import { MapSystem } from "../systems/MapSystem";

export type BehaviorFn = (engine: IGameEngine, proj: Projectile) => void;

// Legacy helper for stopped explosives (e.g. older mines)
export const handleStoppedExplosive = (engine: IGameEngine, proj: Projectile) => {
    proj.stopTimer = (proj.stopTimer || 0) - 1;
    if (proj.stopTimer <= 0) {
        proj.isExploding = true;
        
        // Emit Explosion Event
        engine.emit(GameEventType.PROJECTILE_EXPLODE, { 
            x: proj.x, 
            y: proj.y, 
            radius: proj.maxExplosionRadius,
            style: proj.renderStyle,
            isCyber: proj.renderStyle === 'cyber_explosion' || (!proj.isEnemy && engine.state.player.characterId === '007')
        });

        proj.color = proj.isEnemy ? '#ef4444' : '#fbbf24'; 
        proj.hitIds = [];
        
        // Enemy "Retreat" (退) splitting mechanic
        if (proj.isEnemy && proj.text === '退') {
            const angle = proj.angle || 0;
            const spawnSplit = (offset: number) => {
                engine.state.projectiles.push({
                    id: Math.random().toString(),
                    x: proj.x, y: proj.y,
                    radius: proj.radius * 0.5,
                    emoji: '退',
                    vx: Math.cos(angle + offset) * 6,
                    vy: Math.sin(angle + offset) * 6,
                    damage: proj.damage * 0.7,
                    life: 100,
                    isEnemy: true,
                    color: proj.color,
                    text: '退',
                    pierce: 0,
                    hitIds: [],
                    isExplosive: false,
                    sourceType: proj.sourceType,
                    active: true
                });
            };
            spawnSplit(-0.4);
            spawnSplit(0.4);
        }
    }
};

export const BEHAVIORS: Record<string, BehaviorFn> = {
    // Moves linearly using vx/vy
    'move_linear': (engine, proj) => {
        proj.x += proj.vx;
        proj.y += proj.vy;
    },

    // Applies friction to velocity (Decelerate)
    'friction': (engine, proj) => {
        proj.vx *= 0.95;
        proj.vy *= 0.95;
    },

    // Sine wave motion perpendicular to direction (Glitchy effect for 1024)
    'sine_wave': (engine, proj) => {
        const t = engine.state.timeAlive;
        const freq = 0.2;
        const amp = 3; 
        // Calculate perpendicular vector
        const speed = Math.hypot(proj.vx, proj.vy);
        if (speed > 0.1) {
            const nx = -proj.vy / speed;
            const ny = proj.vx / speed;
            const offset = Math.sin(t * freq) * amp;
            proj.x += nx * offset;
            proj.y += ny * offset;
        }
    },

    // Handles standard life decay
    'decay_life': (engine, proj) => {
        proj.life--;
    },

    // Handles bounds checking via MapSystem
    'check_bounds': (engine, proj) => {
        MapSystem.checkProjectile(engine, proj);
    },

    // New: Stick the projectile to the player's position (for melee swings)
    'stick_to_player': (engine, proj) => {
        proj.x = engine.state.player.x;
        proj.y = engine.state.player.y;
    },

    // HOMING BEHAVIOR (Generic)
    'homing': (engine, proj) => {
        let targetX: number | null = null;
        let targetY: number | null = null;

        // If Enemy Projectile -> Target Player
        if (proj.isEnemy) {
            const p = engine.state.player;
            targetX = p.x;
            targetY = p.y;
        } 
        // If Player Projectile -> Target Enemy
        else {
            // Find nearest enemy if no targetId
            if (!proj.targetId) {
                let nearest = null;
                let minDst = 600; // Detection range
                
                // Optimization: Check if we already have a valid target ID to save loop
                if (proj.targetId) {
                    const existing = engine.state.enemies.find(e => e.id === proj.targetId);
                    if (existing && existing.hp > 0 && !existing.isTransitioning && !existing.isUnstable) {
                        nearest = existing;
                    } else {
                        proj.targetId = undefined; // Target lost/dead
                    }
                }

                if (!nearest) {
                    for(const e of engine.state.enemies) {
                        if (e.isTransitioning || e.hp <= 0 || e.isUnstable) continue;
                        const d = Math.hypot(e.x - proj.x, e.y - proj.y);
                        if (d < minDst) {
                            minDst = d;
                            nearest = e;
                        }
                    }
                    if (nearest) proj.targetId = nearest.id;
                }
            }

            if (proj.targetId) {
                const target = engine.state.enemies.find(e => e.id === proj.targetId);
                if (target) {
                    targetX = target.x;
                    targetY = target.y;
                } else {
                    proj.targetId = undefined;
                }
            }
        }

        // Execute Steering
        if (targetX !== null && targetY !== null) {
            const angle = Math.atan2(targetY - proj.y, targetX - proj.x);
            // Steer velocity towards target
            const speed = Math.hypot(proj.vx, proj.vy);
            const turnRate = 0.15; // How fast it turns
            
            const currentAngle = Math.atan2(proj.vy, proj.vx);
            let diff = angle - currentAngle;
            while (diff > Math.PI) diff -= 2 * Math.PI;
            while (diff < -Math.PI) diff += 2 * Math.PI;
            
            const newAngle = currentAngle + diff * turnRate;
            proj.vx = Math.cos(newAngle) * speed;
            proj.vy = Math.sin(newAngle) * speed;
        }
    },

    // --- NEW: NEON FOUNTAIN (Burst + Hover + Dynamic Tracking) ---
    'neon_fountain': (engine, proj) => {
        // 0. Init Trail History
        if (!proj.trailHistory) proj.trailHistory = [];
        
        // 1. Delay Phase (Staggered Launch)
        if (proj.fireCooldown && proj.fireCooldown > 0) {
            proj.fireCooldown--;
            // Stick to player while waiting to launch
            const p = engine.state.player;
            proj.x = p.x;
            proj.y = p.y;
            proj.z = 20; // Player height
            return;
        }

        // Limit trail history length optimization (shorter trail for mass quantity)
        proj.trailHistory.push({ x: proj.x, y: proj.y, z: proj.z || 0 });
        if (proj.trailHistory.length > 15) proj.trailHistory.shift();

        // 2. Physics: Gravity & Velocity
        const gravity = 0.8;
        proj.vz = (proj.vz || 0) - gravity;
        proj.z = (proj.z || 0) + proj.vz;
        
        // 3. Movement Logic
        
        // Phase A: Ejection & Hover (High Z)
        // If moving up OR just started falling (Hover phase at apex)
        if (proj.vz > -5 && (proj.z || 0) > 100) {
            // Apply drag to spread out nicely
            proj.vx *= 0.95;
            proj.vy *= 0.95;
        } 
        // Phase B: Snapshot Homing Strike (Falling fast)
        else if ((proj.z || 0) > 0) {
            // UPDATE TARGET: If target alive, update snapshot
            if (proj.targetId) {
                const target = engine.state.enemies.find(e => e.id === proj.targetId);
                if (target && target.hp > 0 && !target.isTransitioning) {
                    proj.tx = target.x;
                    proj.ty = target.y;
                } else {
                    // Target dead/lost, keep last tx/ty
                    proj.targetId = undefined;
                }
            }

            // Use Snapshot Coordinates (tx, ty)
            let tx = proj.tx !== undefined ? proj.tx : proj.x;
            let ty = proj.ty !== undefined ? proj.ty : proj.y;
            
            // Homing Acceleration
            const dx = tx - proj.x;
            const dy = ty - proj.y;
            const dist = Math.hypot(dx, dy);
            
            // Only home if far enough to need correction
            if (dist > 10) {
                const accel = 1.5; // Strong homing
                proj.vx += (dx / dist) * accel;
                proj.vy += (dy / dist) * accel;
                
                // Terminal velocity for horizontal to prevent glitching
                const maxSpeed = 30;
                const speed = Math.hypot(proj.vx, proj.vy);
                if (speed > maxSpeed) {
                    proj.vx = (proj.vx / speed) * maxSpeed;
                    proj.vy = (proj.vy / speed) * maxSpeed;
                }
            }
        }

        proj.x += proj.vx;
        proj.y += proj.vy;

        // 4. Ground Collision (Trigger Explosion)
        if ((proj.z || 0) <= 0) {
            proj.z = 0;
            proj.life = 0; // Trigger explode_on_expire
            // Add final point to history
            proj.trailHistory.push({ x: proj.x, y: proj.y, z: 0 });
        }
    },

    // --- NEW: ISOMETRIC 3D MOVEMENT (Legacy/Standard) ---
    // Simulates a projectile arcing through 3D space and hitting the "ground"
    'isometric_move': (engine, proj) => {
        // Move horizontal (Ground plane)
        proj.x += proj.vx;
        proj.y += proj.vy;
        
        // Move vertical (Height)
        proj.z = (proj.z || 0) + (proj.vz || 0);
        proj.vz = (proj.vz || 0) - (proj.gravity || 0.5); // Apply Gravity
        
        // Ground Collision Check
        if (proj.z <= 0) {
            proj.z = 0;
            // Force explosion trigger
            proj.life = 0; 
            // Note: explode_on_expire must be included in behaviors list to trigger explosion logic
        }
    },

    // --- NEW: Gravity Arc (Legacy support, can be removed if not used) ---
    'gravity_arc': (engine, proj) => {
        const gravity = 0.5;
        proj.vy += gravity;
    },

    // --- NEW: Z-Axis Gravity Arc (Pseudo 3D) ---
    'z_gravity_arc': (engine, proj) => {
        proj.vy += 0.5; // Gravity
        if (proj.scale === undefined) proj.scale = 1.0;
        if (proj.vy < 0) proj.scale += 0.05;
        else proj.scale -= 0.08;
        proj.scale = Math.max(0.6, Math.min(2.5, proj.scale));
    },

    // --- NEW: Delayed Homing (for Pinball / Neon Missile) ---
    'delayed_homing': (engine, proj) => {
        if (proj.aiTimer !== undefined && proj.aiTimer > 0) {
            proj.aiTimer--;
        }
        if ((proj.aiTimer === undefined || proj.aiTimer <= 0) || proj.vy > 5) {
            if (!proj.targetId) {
                let target = null;
                let minDst = 1200; 
                for(const e of engine.state.enemies) {
                    if (e.isTransitioning || e.hp <= 0) continue;
                    const d = Math.hypot(e.x - proj.x, e.y - proj.y);
                    if (d < minDst) {
                        minDst = d;
                        target = e;
                    }
                }
                if (target) proj.targetId = target.id;
            }
            if (proj.targetId) {
                const target = engine.state.enemies.find(e => e.id === proj.targetId);
                if (target) {
                    const angle = Math.atan2(target.y - proj.y, target.x - proj.x);
                    const accel = 1.5;
                    proj.vx += Math.cos(angle) * accel;
                    proj.vy += Math.sin(angle) * accel;
                    const maxSpeed = 30;
                    const speed = Math.hypot(proj.vx, proj.vy);
                    if (speed > maxSpeed) {
                        proj.vx = (proj.vx / speed) * maxSpeed;
                        proj.vy = (proj.vy / speed) * maxSpeed;
                    }
                } else {
                    proj.targetId = undefined;
                }
            }
        }
    },

    // Explode when life reaches 0 (Time fuse or triggered manually)
    'explode_on_expire': (engine, proj) => {
        if (proj.life <= 0 && !proj.isExploding) {
            proj.isExploding = true;
            
            // UPDATED: 60 frames for Neon Missiles (longer fade), 30 for others
            // This allows the implosion beam visual to play out
            proj.life = (proj.renderStyle === 'neon_missile') ? 60 : 30;
            
            proj.vx = 0;
            proj.vy = 0;
            proj.hitIds = []; // Reset hit list for explosion AOE
            
            // Note: If renderStyle was 'code_explosion' (from shockwave item), it stays 'code_explosion'
            if (!proj.renderStyle || proj.renderStyle === 'text') {
                proj.renderStyle = 'cyber_explosion';
            }
            
            // Emit Explosion Event
            engine.emit(GameEventType.PROJECTILE_EXPLODE, { 
                x: proj.x, 
                y: proj.y, 
                radius: proj.maxExplosionRadius,
                style: proj.renderStyle,
                isCyber: proj.renderStyle === 'cyber_explosion' || (!proj.isEnemy && engine.state.player.characterId === '007')
            });

            if (!proj.isEnemy) proj.color = '#fbbf24'; 
        }
    },

    // Handle active explosion expansion physics
    'update_explosion': (engine, proj) => {
        if (proj.isExploding) {
            // Ease-Out Expansion Physics
            const targetRadius = proj.maxExplosionRadius || 100;
            // Slower expansion to match 30 frames (approx 0.1 factor)
            const expansionSpeed = (targetRadius - proj.radius) * 0.1; 
            
            // Minimum speed to ensure it finishes
            if (expansionSpeed < 0.2 && proj.radius >= targetRadius - 2) {
                // Done expanding, but wait for life to drain
            } else {
                proj.radius += Math.max(0.5, expansionSpeed);
            }
        }
    },

    // Handle trail emission (Particles)
    'emit_trail': (engine, proj) => {
        if (!proj.trailConfig) return;
        const conf = proj.trailConfig;
        conf.timer--;
        if (conf.timer <= 0) {
            conf.timer = conf.interval;
            // Emission logic based on type
            if (conf.type === 'pixel') {
                emitParticles(engine, {
                    x: proj.x, y: proj.y, color: conf.color, count: 1, life: 15, size: 4, type: 'rect', speed: 0, scaleDelta: -0.05, rotation: Math.random() * Math.PI
                });
            } else if (conf.type === 'smoke') {
                emitParticles(engine, {
                    x: proj.x, y: proj.y, color: conf.color, count: 1, life: 30, size: conf.size || 6, type: 'circle', speed: 0.5, alpha: 0.6, scaleDelta: 0.02
                });
            } else if (conf.type === 'spark') {
                emitParticles(engine, {
                    x: proj.x, y: proj.y, color: conf.color, count: 1, life: 10, size: 3, type: 'spark', speed: 0, blendMode: 'lighter'
                });
            } else if (conf.type === 'line') {
                // For Mind Waves
                emitParticles(engine, {
                    x: proj.x, y: proj.y, color: conf.color, count: 1, life: 10, size: 2, type: 'circle', speed: 0, alpha: 0.5
                });
            }
        }
    },

    // New: Sweep Bullet Behavior (Deletes enemy projectiles on contact)
    'sweep_bullets': (engine, proj) => {
        const projectiles = engine.state.projectiles;
        for (let i = projectiles.length - 1; i >= 0; i--) {
            const enemyProj = projectiles[i];
            // Only target active ENEMY projectiles
            if (!enemyProj.isEnemy || !enemyProj.active || enemyProj.life <= 0) continue;
            
            // Simple circle collision
            const dist = Math.hypot(proj.x - enemyProj.x, proj.y - enemyProj.y);
            if (dist < proj.radius + enemyProj.radius) {
                enemyProj.life = 0; // Destroy bullet
                const midX = (proj.x + enemyProj.x) / 2;
                const midY = (proj.y + enemyProj.y) / 2;
                const waterColors = ['#94a3b8', '#bae6fd', '#ffffff']; 
                emitParticles(engine, {
                    x: midX, y: midY, 
                    color: waterColors[Math.floor(Math.random() * waterColors.length)], 
                    count: 8, 
                    speed: 6,
                    life: 25,
                    type: 'circle',
                    blendMode: 'source-over'
                });
            }
        }
    }
};
