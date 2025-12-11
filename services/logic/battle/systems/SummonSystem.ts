
import { IGameEngine } from "../../../types";
import { spawnFloatingText, spawnParticles } from "../../utils";
import { SUMMON_STATS } from "../../../../data/summons/summonStats";
import { SummonFactory } from "./SummonFactory";
import { MapSystem } from "../../systems/MapSystem";
import { GameEventType } from "../../events/events";
import { PlayerHitHandler } from "../../systems/collision/PlayerHitHandler"; // For damage calculation if needed

export const SummonSystem = {
    update: (engine: IGameEngine, p: any) => {
        // FIX: If collision system stopped it, trigger death immediately
        if (p.isStopped) {
            if (p.hp !== undefined) p.hp = 0;
            else p.life = 0;
        }

        // --- PASSIVE REGEN (Team Pizza) ---
        if (p.hpRegen && p.hpRegen > 0 && p.hp < p.maxHp) {
            if (engine.state.timeAlive % 60 === 0) { // Once per second
                p.hp = Math.min(p.maxHp, p.hp + p.hpRegen);
                spawnFloatingText(engine, p.x, p.y - 20, "💚", "#22c55e");
            }
        }

        // Update life if it has HP (destructible)
        if (p.hp !== undefined && p.hp <= 0) {
            // SE04 Explosive Contract or Native Explosion
            // CODE MOUNTAIN also explodes now on death (Refactoring)
            if (p.isExplosive || p.summonType === 'code_mountain') {
                p.isExploding = true;
                p.life = 15; // Fast explosion visual life
                p.radius += 10; 
                
                // Code Mountain Explosion Config
                if (p.summonType === 'code_mountain') {
                     p.maxExplosionRadius = 250; // Massive explosion
                     p.damage = 100; // High damage
                     spawnFloatingText(engine, p.x, p.y, "REFACTORED!", "#84cc16", 'chat');
                } else {
                     p.damage = (p.damage || 20) * (engine.state.player.items.includes('爆炸合同') ? 2 : 1); 
                }
                
                engine.audio.playExplosion();
                
                // Visuals: Only spawn big text for main trolls, not minis (reduce clutter)
                if (p.summonType !== 'troll_mini' && p.summonType !== 'code_mountain') {
                    spawnFloatingText(engine, p.x, p.y, "💥", "#ef4444");
                }
                
                // Reset hitIds so explosion can hit enemies again
                p.hitIds = [];

                // SS01: Macro - SPLIT LOGIC
                if (p.summonType === 'troll' && engine.state.player.items.includes('键盘宏')) {
                    // Visual feedback for split
                    spawnParticles(engine, p.x, p.y, '#38bdf8', 12); 
                    spawnFloatingText(engine, p.x, p.y - 40, "小号+2!", "#38bdf8", 'chat');

                    const spawnMini = () => {
                        // Explicitly create 'troll_mini'
                        const mini = SummonFactory.createSummon(engine, 'troll_mini', p.x, p.y);
                        if (mini) {
                            // Ejection physics: Pop out randomly
                            const angle = Math.random() * Math.PI * 2;
                            const speed = 10 + Math.random() * 5; 
                            mini.vx = Math.cos(angle) * speed;
                            mini.vy = Math.sin(angle) * speed;
                            mini.aiState = 'ejecting'; // Start in ejection mode
                        }
                    };
                    spawnMini();
                    spawnMini();
                }

                // OPTIMIZATION: Scorch marks for big trolls only
                if (p.summonType === 'troll') {
                     engine.state.zones.push({
                         id: Math.random().toString(),
                         x: p.x, y: p.y,
                         radius: p.radius * 0.8,
                         type: 'scorch',
                         life: 60, // Shortened from 120
                         maxLife: 60,
                         color: '#1e3a8a', // Dark blue burn for cyber trolls
                         emoji: ''
                     });
                }

                return; 
            }
            
            p.life = 0; // Die normally
            return;
        }

        // Retrieve config based on type
        const config = SUMMON_STATS[p.summonType];
        // Fallback values if config missing
        const patrolRange = config?.patrolRange || 250;
        const detectRange = p.detectRangeOverride || config?.detectRange || 500;
        const patrolSpeed = config?.patrolSpeed || 3;
        
        // Increase base speeds for logic
        let chargeSpeed = config?.chargeSpeed || 12;
        if (p.summonType === 'troll') chargeSpeed = 16; // Updated to catch boss
        if (p.summonType === 'temp_worker') chargeSpeed = 9; // Updated

        const attackRange = p.attackRangeOverride || config?.attackRange || 400;
        const fireRate = (p as any).fireRateOverride || config?.fireRate || 60;

        // --- TEMP WORKER (临时工) ---
        if (p.summonType === 'temp_worker') {
            // Behavior: Continuous charge at nearest enemy. Hits once and dies.
            if (!p.targetId) {
                // Find nearest
                let nearest = null;
                let minDst = Infinity;
                for (const e of engine.state.enemies) {
                    if (e.isTransitioning) continue;
                    const d = Math.hypot(e.x - p.x, e.y - p.y);
                    if (d < minDst) {
                        minDst = d;
                        nearest = e;
                    }
                }
                if (nearest && minDst < detectRange) {
                    p.targetId = nearest.id;
                } else {
                    // Wander
                    const angle = Math.random() * Math.PI * 2;
                    p.vx += Math.cos(angle) * 0.5;
                    p.vy += Math.sin(angle) * 0.5;
                }
            } else {
                const target = engine.state.enemies.find((e: any) => e.id === p.targetId);
                if (target) {
                    const angle = Math.atan2(target.y - p.y, target.x - p.x);
                    // Fast acceleration & re-aiming
                    p.vx = Math.cos(angle) * chargeSpeed;
                    p.vy = Math.sin(angle) * chargeSpeed;
                } else {
                    p.targetId = undefined;
                }
            }
            
            // Friction (if lost target)
            if (!p.targetId) {
                p.vx *= 0.9; 
                p.vy *= 0.9;
            }
            p.x += p.vx;
            p.y += p.vy;

            // Map Constraint (Slide instead of getting stuck/dying)
            MapSystem.constrain(engine, p);
        }

        // --- TROLL (水军) & MINI TROLL ---
        else if (p.summonType === 'troll' || p.summonType === 'troll_mini') {
            // Logic: Patrol -> Detect -> Charge -> Explode

            if (!p.aiState) p.aiState = 'idle';

            // EJECTION STATE (For Mini Trolls popping out)
            if (p.aiState === 'ejecting') {
                // Decelerate until slow enough to patrol
                p.vx *= 0.92;
                p.vy *= 0.92;
                if (Math.hypot(p.vx, p.vy) < patrolSpeed) {
                    p.aiState = 'idle';
                }
            }
            else if (p.aiState === 'idle') {
                // Orbit player or wander
                const player = engine.state.player;
                const distToPlayer = Math.hypot(player.x - p.x, player.y - p.y);
                
                if (distToPlayer > patrolRange) {
                    const angle = Math.atan2(player.y - p.y, player.x - p.x);
                    p.vx += Math.cos(angle) * 0.2;
                    p.vy += Math.sin(angle) * 0.2;
                } else {
                    // Random jitter
                    p.vx += (Math.random() - 0.5) * 0.5;
                    p.vy += (Math.random() - 0.5) * 0.5;
                }
                
                // Cap speed
                const speed = Math.hypot(p.vx, p.vy);
                if (speed > patrolSpeed) {
                    p.vx = (p.vx / speed) * patrolSpeed;
                    p.vy = (p.vy / speed) * patrolSpeed;
                }

                // Look for target
                let nearest = null;
                let minDst = Infinity;
                for (const e of engine.state.enemies) {
                    if (e.isTransitioning) continue;
                    const d = Math.hypot(e.x - p.x, e.y - p.y);
                    if (d < minDst) {
                        minDst = d;
                        nearest = e;
                    }
                }

                if (nearest && minDst < detectRange) {
                    p.aiState = 'charge';
                    p.targetId = nearest.id;
                    spawnFloatingText(engine, p.x, p.y - 30, "!", p.color); // Use unit color for alert
                }
            }
            else if (p.aiState === 'charge') {
                const target = engine.state.enemies.find((e: any) => e.id === p.targetId);
                if (target) {
                    const angle = Math.atan2(target.y - p.y, target.x - p.x);
                    // Improved Steering
                    const steerForce = 3.0; // Increased steering
                    p.vx += Math.cos(angle) * steerForce;
                    p.vy += Math.sin(angle) * steerForce;
                    
                    const speed = Math.hypot(p.vx, p.vy);
                    if (speed > chargeSpeed) {
                        p.vx = (p.vx / speed) * chargeSpeed;
                        p.vy = (p.vy / speed) * chargeSpeed;
                    }
                    
                    if (Math.random() < 0.1) spawnFloatingText(engine, p.x, p.y, "冲!", p.color, 'chat');
                } else {
                    p.aiState = 'idle';
                    p.targetId = undefined;
                }
            }

            p.x += p.vx;
            p.y += p.vy;

            // Map Constraint
            MapSystem.constrain(engine, p);
        }

        // --- CHATBOT (客服机器人) ---
        else if (p.summonType === 'chatbot') {
            // Logic: Stationary Turret, Rapid Fire
            p.vx = 0;
            p.vy = 0;

            if (p.fireCooldown === undefined) p.fireCooldown = 0;
            p.fireCooldown--;

            if (p.fireCooldown <= 0) {
                let nearest = null;
                let minDst = Infinity;
                // Larger range for turret
                for (const e of engine.state.enemies) {
                    const d = Math.hypot(e.x - p.x, e.y - p.y);
                    if (d < minDst) {
                        minDst = d;
                        nearest = e;
                    }
                }

                if (nearest && minDst < attackRange) {
                    // SS03: 24h Power Cost Logic
                    if (engine.state.player.items.includes('24小时电源')) {
                        if (Math.random() < 0.33) {
                            if (engine.state.player.gold < 1) {
                                p.fireCooldown = 30;
                                spawnFloatingText(engine, p.x, p.y - 20, "没钱!", "#ef4444");
                                return;
                            }
                            engine.state.player.gold--; 
                            if (Math.random() < 0.5) spawnFloatingText(engine, p.x, p.y - 20, "-1💰", "#fbbf24", 'gold');
                        }
                    }

                    const angle = Math.atan2(nearest.y - p.y, nearest.x - p.x);
                    engine.state.projectiles.push({
                        id: Math.random().toString(),
                        x: p.x, y: p.y,
                        radius: 6,
                        emoji: '您好',
                        vx: Math.cos(angle) * 8,
                        vy: Math.sin(angle) * 8,
                        damage: p.damage || 5,
                        life: Math.floor(60 * (p.rangeMultiplier || 1)), 
                        isEnemy: false,
                        color: '#a855f7',
                        text: '您好',
                        pierce: 0,
                        hitIds: [],
                        angle: angle,
                        sourceType: 'summon', 
                        critChance: p.critChance 
                    });
                    p.fireCooldown = fireRate; 
                }
            }
        }

        // --- INTERN (实习生) ---
        else if (p.summonType === 'intern') {
            // Logic: Follow player, shoot occasionally
            const player = engine.state.player;
            const dx = player.x - p.x;
            const dy = player.y - p.y;
            const dist = Math.hypot(dx, dy);

            if (dist > 100) {
                p.x += (dx / dist) * 2.5;
                p.y += (dy / dist) * 2.5;
            } else {
                if (Math.random() < 0.05) {
                    p.vx = (Math.random() - 0.5) * 2;
                    p.vy = (Math.random() - 0.5) * 2;
                }
                p.x += p.vx;
                p.y += p.vy;
            }

            MapSystem.constrain(engine, p);

            // Shooting
            if (p.fireCooldown === undefined) p.fireCooldown = 0;
            p.fireCooldown--;
            if (p.fireCooldown <= 0) {
                let nearest = null;
                let minDst = Infinity;
                for (const e of engine.state.enemies) {
                    const d = Math.hypot(e.x - p.x, e.y - p.y);
                    if (d < minDst) {
                        minDst = d;
                        nearest = e;
                    }
                }

                if (nearest && minDst < attackRange) {
                    const angle = Math.atan2(nearest.y - p.y, nearest.x - p.x);
                    engine.state.projectiles.push({
                        id: Math.random().toString(),
                        x: p.x, y: p.y,
                        radius: 8,
                        emoji: '?',
                        vx: Math.cos(angle) * 6,
                        vy: Math.sin(angle) * 6,
                        damage: p.damage || 15,
                        life: Math.floor(60 * (p.rangeMultiplier || 1)), 
                        isEnemy: false,
                        color: '#3b82f6',
                        text: '?',
                        pierce: 0,
                        hitIds: [],
                        angle: angle,
                        sourceType: 'summon',
                        critChance: p.critChance
                    });
                    p.fireCooldown = fireRate;
                }
            }
        }

        // --- DRONE (外包团队) ---
        else if (p.summonType === 'drone') {
            const player = engine.state.player;
            const hasDistributed = player.items.includes('分布式算力');
            const orbitRadius = hasDistributed ? 160 : 120; 
            const orbitSpeed = 0.05; 

            p.angle = (p.angle || 0) + orbitSpeed;
            p.x = player.x + Math.cos(p.angle) * orbitRadius;
            p.y = player.y + Math.sin(p.angle) * orbitRadius;
            p.vx = 0;
            p.vy = 0;
        }

        // --- CLONE (影子分身) ---
        else if (p.summonType === 'clone') {
            p.vx = 0; 
            p.vy = 0;
        }

        // --- HEADHUNTER (猎头顾问) ---
        else if (p.summonType === 'headhunter') {
            // Random movement
            if (!p.aiTimer) p.aiTimer = 0;
            p.aiTimer--;
            
            if (p.aiTimer <= 0) {
                 const angle = Math.random() * Math.PI * 2;
                 p.vx = Math.cos(angle) * patrolSpeed;
                 p.vy = Math.sin(angle) * patrolSpeed;
                 p.aiTimer = 60 + Math.floor(Math.random() * 60); 
            }
            
            const margin = 200;
            if (p.x < -engine.MAP_WIDTH/2 + margin) p.vx = Math.abs(p.vx);
            if (p.x > engine.MAP_WIDTH/2 - margin) p.vx = -Math.abs(p.vx);
            if (p.y < -engine.MAP_HEIGHT/2 + margin) p.vy = Math.abs(p.vy);
            if (p.y > engine.MAP_HEIGHT/2 - margin) p.vy = -Math.abs(p.vy);

            p.x += p.vx;
            p.y += p.vy;
            
            MapSystem.constrain(engine, p);

            // Poaching Logic
            if (p.fireCooldown === undefined) p.fireCooldown = 0;
            p.fireCooldown--;
            
            if (p.fireCooldown <= 0) {
                let target = null;
                let minDst = Infinity;
                
                for (const e of engine.state.enemies) {
                    if (e.config.behavior === 'boss' || e.config.tier === 'epic' || e.isTransitioning) continue;
                    const d = Math.hypot(e.x - p.x, e.y - p.y);
                    if (d < detectRange && d < minDst) {
                        minDst = d;
                        target = e;
                    }
                }

                if (target) {
                    spawnFloatingText(engine, p.x, p.y - 40, "挖角成功!", "#10b981", 'chat');
                    
                    const idx = engine.state.enemies.indexOf(target);
                    if (idx > -1) {
                        engine.state.enemies.splice(idx, 1);
                        const type = Math.random() > 0.5 ? 'intern' : 'troll';
                        SummonFactory.createSummon(engine, type, target.x, target.y);
                    }
                    p.fireCooldown = fireRate;
                } else {
                    // --- SELF RECRUIT (Fallback if no target) ---
                    spawnFloatingText(engine, p.x, p.y - 40, "直招!", "#3b82f6", 'chat');
                    SummonFactory.createSummon(engine, 'intern', p.x + (Math.random()-0.5)*20, p.y + (Math.random()-0.5)*20);
                    p.fireCooldown = Math.floor(fireRate * 0.7);
                }
            }
        }
        
        // --- CODE MOUNTAIN (祖传代码) - BUFFED ---
        else if (p.summonType === 'code_mountain') {
            // 1. Slow random movement
            p.vx += (Math.random()-0.5)*0.2;
            p.vy += (Math.random()-0.5)*0.2;
            const spd = Math.hypot(p.vx, p.vy);
            if (spd > 1.5) { p.vx *= 0.9; p.vy *= 0.9; }
            p.x += p.vx;
            p.y += p.vy;

            MapSystem.constrain(engine, p);

            // --- 2. TECHNICAL DEBT FIELD (Slowing Aura) ---
            // Range: 220 (Matched with new visual). Slows by 60%.
            const fieldRange = 220;
            
            // NOTE: Visual aura is now handled in renderProjectiles.ts
            // We no longer spawn 'slacker_wave' here.

            // Apply Slow Effect & Damage
            for (const e of engine.state.enemies) {
                 if (e.isTransitioning || e.config.behavior === 'boss') continue;
                 const d = Math.hypot(e.x - p.x, e.y - p.y);
                 
                 // A. Field Slow
                 if (d < fieldRange) {
                     e.vx *= 0.4; // 60% Slow
                     e.vy *= 0.4;
                     
                     // B. Contact Stun (Logic Deadlock)
                     if (d < p.radius + e.radius + 10) {
                         // Chance to hard stun on contact
                         if (e.stunTimer <= 0 && Math.random() < 0.2) {
                             e.stunTimer = 60; // 1s Stun
                             spawnFloatingText(engine, e.x, e.y - 20, "死锁!", "#84cc16");
                         }
                         
                         // Contact Damage
                         if (engine.state.timeAlive % 30 === 0) {
                             const dmg = p.damage || 10;
                             e.hp -= dmg;
                             engine.emit(GameEventType.ENTITY_DAMAGED, { x: e.x, y: e.y, text: `-${dmg}`, color: '#84cc16' });
                         }
                     }
                 }
            }
        }

        // --- PACMAN (吃豆人 - HR L6) ---
        else if (p.summonType === 'pacman') {
            // Initialize Custom Vars
            if (!p.customVars) {
                p.customVars = {
                    moveTimer: 0,
                    currentDir: { x: 1, y: 0 }, // Default Right
                    powerCharge: 0,      // Current charge (0-100)
                    isPowered: false,    // Power Mode State
                    powerTimer: 0        // Duration of Power Mode
                };
                if (!p.trailHistory) p.trailHistory = [];
            }

            // 0. CHARGE LOGIC (Passive gain + Kill gain)
            // Gain charge over time (1 per second)
            if (engine.state.timeAlive % 60 === 0 && !p.customVars.isPowered) {
                p.customVars.powerCharge += 2; // Auto charge slowly
            }
            
            // Check Power Activation
            if (!p.customVars.isPowered && p.customVars.powerCharge >= 100) {
                p.customVars.isPowered = true;
                p.customVars.powerCharge = 0;
                p.customVars.powerTimer = 480; // 8 seconds of Power Mode
                
                // --- GLOBAL EFFECT: SCARED GHOSTS ---
                engine.state.isPacmanPowered = true; // Tell renderer to turn enemies blue
                
                spawnFloatingText(engine, p.x, p.y - 60, "POWER UP!", "#ffffff", 'chat');
                spawnFloatingText(engine, p.x, p.y - 40, "绩效考核开始!", "#ef4444", 'chat');
                engine.audio.play('pacman_power_up');
                
                // Particles
                spawnParticles(engine, p.x, p.y, '#ffffff', 20);
            }
            
            // Power Mode Countdown
            if (p.customVars.isPowered) {
                p.customVars.powerTimer--;
                
                // Sound Loop (Siren)
                if (p.customVars.powerTimer % 30 === 0) {
                    engine.audio.play('pacman_power_up');
                }
                
                if (p.customVars.powerTimer <= 0) {
                    p.customVars.isPowered = false;
                    engine.state.isPacmanPowered = false; // Reset Global State
                    spawnFloatingText(engine, p.x, p.y - 40, "考核结束", "#fbbf24", 'chat');
                }
            }

            // 1. Trail Logic (Record position every 3 frames)
            if (engine.state.timeAlive % 3 === 0) {
                p.trailHistory.push({ x: p.x, y: p.y });
                if (p.trailHistory.length > 20) p.trailHistory.shift();
            }
            
            // Sound: Waka Waka (Loop)
            if (engine.state.timeAlive % 15 === 0) {
                engine.audio.play('pacman_waka');
            }

            // 2. Movement Logic (Manhattan with Inertia Lock)
            // Power Mode: Faster Speed
            const baseSpeed = config?.speed || 6.5;
            const speed = p.customVars.isPowered ? baseSpeed * 1.5 : baseSpeed;
            
            // Check minimum distance timer
            if (p.customVars.moveTimer > 0) {
                 // Locked movement (Inertia) - Must finish this leg
                 p.customVars.moveTimer--;
                 p.vx = p.customVars.currentDir.x * speed;
                 p.vy = p.customVars.currentDir.y * speed;
            } else {
                // Decision Time: Pick a new direction
                let target = null;
                let minDst = Infinity;
                
                // Find nearest target
                // If Powered Up: Prioritize nearest enemy to eat
                // If Normal: Prioritize nearest enemy to damage
                for (const e of engine.state.enemies) {
                    if (e.hp <= 0 || e.isTransitioning) continue;
                    const d = Math.hypot(e.x - p.x, e.y - p.y);
                    if (d < minDst && d < (p.detectRangeOverride || 2000)) {
                        minDst = d;
                        target = e;
                    }
                }

                if (target) {
                    const dx = target.x - p.x;
                    const dy = target.y - p.y;
                    
                    // Strict Manhattan choice: Pick dominant axis
                    if (Math.abs(dx) > Math.abs(dy)) {
                        p.customVars.currentDir = { x: Math.sign(dx), y: 0 };
                    } else {
                        p.customVars.currentDir = { x: 0, y: Math.sign(dy) };
                    }
                } else {
                    // Idle: Random Manhattan Wander (Change dir if idle)
                    const dirs = [{x:1,y:0}, {x:-1,y:0}, {x:0,y:1}, {x:0,y:-1}];
                    // Don't reverse immediately if possible
                    const current = p.customVars.currentDir;
                    const validDirs = dirs.filter(d => !(d.x === -current.x && d.y === -current.y));
                    p.customVars.currentDir = validDirs[Math.floor(Math.random()*validDirs.length)];
                }
                
                // Lock direction for 30 frames (0.5s) to allow full animation cycle
                // This ensures he doesn't jitter and mouth animation plays correctly
                p.customVars.moveTimer = 20; // Faster turns
                
                p.vx = p.customVars.currentDir.x * speed;
                p.vy = p.customVars.currentDir.y * speed;
            }
            
            // Update Angle for renderer (0=Right, PI/2=Down, PI=Left, -PI/2=Up)
            p.angle = Math.atan2(p.vy, p.vx);
            
            p.x += p.vx;
            p.y += p.vy;
            
            // --- SCREEN WRAP LOGIC ---
            // Replaces MapSystem.constrain
            MapSystem.wrap(engine, p);
            // If just wrapped, reset move timer to re-evaluate
            const width = engine.state.mapWidth;
            const height = engine.state.mapHeight;
            if (Math.abs(p.x) > width/2 - 10 || Math.abs(p.y) > height/2 - 10) {
                 // Do nothing, let wrap handle it
            }

            // 3. Damage Logic (Contact)
            if (p.damageTimer === undefined) p.damageTimer = 0;
            if (p.damageTimer > 0) p.damageTimer--;
            
            if (p.damageTimer <= 0) {
                // Check collision with enemies
                for (let i = engine.state.enemies.length - 1; i >= 0; i--) {
                    const e = engine.state.enemies[i];
                    if (e.hp <= 0 || e.isTransitioning) continue;
                    
                    const d = Math.hypot(e.x - p.x, e.y - p.y);
                    // Hitbox slightly larger in Power Mode
                    const hitRange = p.radius + e.radius + (p.customVars.isPowered ? 20 : 0);
                    
                    if (d < hitRange) {
                        // HIT
                        let dmg = p.damage || 100;
                        
                        // POWER MODE LOGIC
                        if (p.customVars.isPowered) {
                             const isBoss = e.config.behavior === 'boss' || e.config.tier === 'boss';
                             const isElite = e.config.tier === 'epic' || e.config.behavior === 'devourer';

                             if (isBoss || isElite) {
                                 // NERF: Deals high damage but not instakill
                                 dmg = 150; // UPDATED FROM 2000 TO 150
                                 engine.audio.play('ui_static_tick'); // Crunchy sound
                                 spawnFloatingText(engine, e.x, e.y, "150", "#3b82f6", 'damage');
                             } else {
                                 // INSTAKILL NORMAL ENEMIES
                                 dmg = 99999;
                                 engine.audio.play('pacman_eat_ghost');
                                 spawnFloatingText(engine, e.x, e.y, "9999", "#3b82f6", 'damage'); 
                                 spawnParticles(engine, e.x, e.y, '#3b82f6', 10);
                             }
                        } else {
                            // Normal Bite
                            engine.audio.play('ui_static_tick'); 
                            
                            // Gain charge on hit
                            p.customVars.powerCharge = Math.min(100, p.customVars.powerCharge + 5);
                            spawnFloatingText(engine, p.x, p.y - 20, `+5%`, "#facc15");
                        }
                        
                        e.hp -= dmg;
                        engine.state.waveStats.damageDealt += dmg;
                        
                        // Visuals
                        if (!p.customVars.isPowered) {
                             engine.emit(GameEventType.ENTITY_DAMAGED, { x: e.x, y: e.y, text: `-${dmg}`, color: '#fbbf24', isCrit: true });
                        }
                        
                        // GROWTH MECHANIC
                        if (p.radius < 48) {
                            p.radius *= 1.01; 
                        }

                        // Cooldown
                        p.damageTimer = 10; // Fast bite
                        
                        break; 
                    }
                }
            }
        }
    }
};
