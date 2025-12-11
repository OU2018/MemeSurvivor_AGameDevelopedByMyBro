
import { IGameEngine, Zone } from "../../../../types";
import { spawnFloatingText, emitParticles } from "../../utils";
import { PlayerHitHandler } from "../collision/PlayerHitHandler";

export const BossZoneLogic = {
    handle: (engine: IGameEngine, z: Zone) => {
        // --- BOSS PASSIVE: MEMORY LEAK (Green Code Pool) ---
        if (z.type === 'glitch_memory_leak') {
            const p = engine.state.player;
            const dist = Math.hypot(p.x - z.x, p.y - z.y);
            
            // Damage player if inside
            if (dist < z.radius) {
                if (engine.state.timeAlive % 60 === 0) { // Every 1s
                    // Fixed low damage (5)
                    PlayerHitHandler.damagePlayer(engine, 5, 'memory_leak');
                    spawnFloatingText(engine, p.x, p.y, "溢出!", "#22c55e");
                }
            }
            
            // Visual Particles (Code rising)
            if (Math.random() < 0.1) {
                const angle = Math.random() * Math.PI * 2;
                const r = Math.random() * z.radius;
                emitParticles(engine, {
                    x: z.x + Math.cos(angle) * r,
                    y: z.y + Math.sin(angle) * r,
                    color: '#4ade80',
                    count: 1,
                    type: 'rect', // Pixels
                    size: 4,
                    life: 40,
                    speed: 1,
                    vy: -1 // Float up
                });
            }
        }

        // --- AI BOSS: LASER LINK (BATTLEFIELD SEGMENTATION) ---
        if (z.type === 'ai_laser_link') {
            const p = engine.state.player;
            
            // Particle Emission (Sparks)
            // Low chance per frame to spawn a spark along the line
            if (Math.random() < 0.08) {
                const len = z.width || 1000;
                const angle = z.angle || 0;
                // Random point along line
                const t = (Math.random() - 0.5) * len; 
                const px = z.x + Math.cos(angle) * t;
                const py = z.y + Math.sin(angle) * t;
                
                emitParticles(engine, {
                    x: px, y: py,
                    color: Math.random() > 0.5 ? '#ffffff' : '#4ade80',
                    count: 1,
                    life: 15,
                    speed: 2,
                    size: 2,
                    type: 'spark',
                    blendMode: 'lighter'
                });
            }

            // Check collision with line segment
            // Translate
            const dx = p.x - z.x;
            const dy = p.y - z.y;
            
            // Rotate to local space (axis aligned)
            const angle = -(z.angle || 0);
            const localX = dx * Math.cos(angle) - dy * Math.sin(angle);
            const localY = dx * Math.sin(angle) + dy * Math.cos(angle);
            
            const halfLen = (z.width || 1000) / 2;
            const halfThick = 25; // Hitbox thickness
            
            // AABB Check in local space
            if (Math.abs(localX) < halfLen && Math.abs(localY) < halfThick) {
                // Determine Push Direction (Perpendicular to line)
                // If localY > 0, player is "above", push up (+Y in local is rotated world vector)
                const pushDir = localY > 0 ? 1 : -1;
                const pushAngle = (z.angle || 0) + (Math.PI / 2); // Perpendicular
                
                // KNOCKBACK (Strong)
                const kForce = 25; 
                p.vx += Math.cos(pushAngle) * pushDir * kForce;
                p.vy += Math.sin(pushAngle) * pushDir * kForce;

                // DAMAGE LOGIC UPDATED: Instant hit if not invulnerable
                if (p.invulnerableTime <= 0) {
                    const dmg = 15; // Adjusted to 15 per hit
                    PlayerHitHandler.damagePlayer(engine, dmg, 'laser_link');
                    spawnFloatingText(engine, p.x, p.y, "触电!", "#22d3ee");
                    engine.audio.play('ui_static_tick');
                }
            }
        }

        // --- AI BOSS: DEFRAG SQUARE ---
        if (z.type === 'glitch_square') {
            const explosionTime = 20;
            // Damage triggers exactly when aiming ends and explosion starts
            if (z.life === explosionTime) {
                engine.audio.playExplosion();
                
                // Spawn shockwave visual
                engine.state.zones.push({
                    id: Math.random().toString(),
                    x: z.x, y: z.y,
                    radius: z.radius * 1.5,
                    type: 'explosion_shockwave',
                    life: 20,
                    maxLife: 20,
                    color: z.color,
                    emoji: ''
                });

                // Check Player Collision
                const p = engine.state.player;
                // Square AABB Collision
                const halfW = (z.width || 120) / 2;
                if (p.x > z.x - halfW && p.x < z.x + halfW &&
                    p.y > z.y - halfW && p.y < z.y + halfW) {
                    
                    if (p.invulnerableTime <= 0) {
                        const dmg = z.color === '#ef4444' ? 40 : 25; // Red hurts more
                        PlayerHitHandler.damagePlayer(engine, dmg, 'defrag_storm');
                        spawnFloatingText(engine, p.x, p.y, "被删除!", "#ef4444");
                    }
                }
            }
        }

        // --- GLITCH BOSS: EXPLOSION GAP ---
        if (z.type === 'explosion_gap' && z.life <= 0) {
            engine.audio.playExplosion();
            
            // Visual Flash
            engine.state.zones.push({
                id: Math.random().toString(),
                x: z.x, y: z.y,
                radius: z.radius, 
                type: 'explosion_shockwave',
                life: 10, maxLife: 10,
                color: '#ef4444', emoji: ''
            });

            // Check Player
            const p = engine.state.player;
            const dist = Math.hypot(p.x - z.x, p.y - z.y);
            
            if (dist < z.radius) {
                // Check Gap Angle
                const angleToPlayer = Math.atan2(p.y - z.y, p.x - z.x);
                let diff = Math.abs(angleToPlayer - (z.gapAngle || 0));
                while(diff > Math.PI) diff = 2*Math.PI - diff;
                
                const safeWedge = Math.PI / 6; // 30 degrees half-width (60 total)
                
                if (diff > safeWedge) {
                    PlayerHitHandler.damagePlayer(engine, 40, 'glitch_lag');
                    spawnFloatingText(engine, p.x, p.y, "炸!", "#ef4444", 'damage');
                } else {
                    spawnFloatingText(engine, p.x, p.y, "安全!", "#22c55e", 'chat');
                }
            }
        }

        // --- LASER BEAM DAMAGE ---
        if (z.type === 'laser_beam') {
            // Only damage in the "fire" phase
            // Charge time = 60, Fire time = 60. MaxLife = 120.
            // Damage when Life < 60
            if (z.life < 60 && engine.state.timeAlive % 10 === 0) {
                const p = engine.state.player;
                // Simplified AABB Check
                const dx = p.x - z.x;
                const dy = p.y - z.y;
                
                const angle = -(z.angle || 0);
                const localX = dx * Math.cos(angle) - dy * Math.sin(angle);
                const localY = dx * Math.sin(angle) + dy * Math.cos(angle);
                
                // Length is actually diameter (radius*2) based on BossKPI code
                const length = z.radius * 2; 
                const width = z.width || 40;
                
                if (Math.abs(localX) < length/2 && Math.abs(localY) < width/2) {
                    const dmg = 80; 
                    PlayerHitHandler.damagePlayer(engine, dmg, 'laser_grid');
                    spawnFloatingText(engine, p.x, p.y, "滋滋!", "#ef4444");
                }
            }
        }
    }
};
