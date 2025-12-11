
import { IGameEngine } from "../../../../types";
import { spawnFloatingText, spawnParticles, PoolUtils } from "../../utils";
import { damagePlayer } from "../../battleLogic";
import { EnemySpawner } from "../systems/EnemySpawner";
import { MapSystem } from "../../systems/MapSystem";

export const EliteHR = {
    update: (engine: IGameEngine, e: any, p: any, dmgMult: number) => {
        // Init State
        if (!e.subState) e.subState = 'assess';
        if (!e.hrStateTimer) e.hrStateTimer = 0;
        
        e.hrStateTimer++;

        // --- PHASE 1: ASSESSMENT (Kiting & Poking) ---
        // Duration: 300 frames (5 seconds)
        // Behavior: Maintain medium range, shoot "Pink Slips"
        if (e.subState === 'assess') {
            const dist = Math.hypot(p.x - e.x, p.y - e.y);
            const preferredDist = 600;
            const moveSpeed = e.config.speed;

            // Kiting Movement
            if (dist < preferredDist - 50) {
                // Too close, back off
                const angle = Math.atan2(e.y - p.y, e.x - p.x); // Away from player
                e.vx += (Math.cos(angle) * moveSpeed - e.vx) * 0.1;
                e.vy += (Math.sin(angle) * moveSpeed - e.vy) * 0.1;
            } else if (dist > preferredDist + 50) {
                // Too far, approach
                const angle = Math.atan2(p.y - e.y, p.x - e.x);
                e.vx += (Math.cos(angle) * moveSpeed - e.vx) * 0.1;
                e.vy += (Math.sin(angle) * moveSpeed - e.vy) * 0.1;
            } else {
                // Strafe
                const angle = Math.atan2(p.y - e.y, p.x - e.x) + Math.PI / 2;
                e.vx += (Math.cos(angle) * moveSpeed - e.vx) * 0.1;
                e.vy += (Math.sin(angle) * moveSpeed - e.vy) * 0.1;
            }

            e.x += e.vx;
            e.y += e.vy;
            MapSystem.constrain(engine, e);

            // Skill: Pink Slips (Buffed Speed)
            if (e.hrStateTimer % 60 === 0) {
                const angle = Math.atan2(p.y - e.y, p.x - e.x);
                // Manually spawn faster projectiles instead of using standard spawnSingleBullet
                engine.audio.playEnemyShoot(e.config.type);
                
                for(let i=-1; i<=1; i++) {
                    const fireAngle = angle + i * 0.2;
                    const proj = PoolUtils.getProjectile(engine);
                    proj.x = e.x; proj.y = e.y;
                    proj.radius = e.config.projectileSize || 15;
                    proj.emoji = e.config.projectileChar || '🔻';
                    // Buffed Speed: 11 (Standard is 7)
                    proj.vx = Math.cos(fireAngle) * 11;
                    proj.vy = Math.sin(fireAngle) * 11;
                    proj.damage = e.config.damage * dmgMult;
                    proj.life = 240; // Increased life to cover range
                    proj.isEnemy = true;
                    proj.color = e.config.projectileColor || '#ef4444';
                    proj.text = e.config.projectileChar || '';
                    proj.pierce = 0;
                    proj.sourceType = e.config.type;
                    
                    if (e.config.projectileRenderStyle) {
                        proj.renderStyle = e.config.projectileRenderStyle;
                    }
                    
                    engine.state.projectiles.push(proj);
                }
                
                if (Math.random() < 0.3) {
                    spawnFloatingText(engine, e.x, e.y - e.radius - 40, "评估中...", "#a855f7", 'chat');
                }
            }

            if (e.hrStateTimer > 300) {
                e.subState = 'lock';
                e.hrStateTimer = 0;
                e.vx = 0; 
                e.vy = 0;
                // Initialize Lock Target
                e.dashTarget = { x: p.x, y: p.y };
                spawnFloatingText(engine, e.x, e.y - e.radius - 40, "锁定目标!", "#ef4444", 'chat');
            }
        }

        // --- PHASE 2: LOCKDOWN (Telegraph) ---
        // Duration: 120 frames (2 seconds)
        // Behavior: Stop moving, track player position with visual reticle
        else if (e.subState === 'lock') {
            // Decelerate stop
            e.vx *= 0.8;
            e.vy *= 0.8;
            e.x += e.vx;
            e.y += e.vy;

            // Track player smoothly, but lock in towards the end
            if (e.hrStateTimer < 90) {
                e.dashTarget.x += (p.x - e.dashTarget.x) * 0.15;
                e.dashTarget.y += (p.y - e.dashTarget.y) * 0.15;
            }

            // Visual Shake on boss to indicate charge
            if (e.hrStateTimer % 4 === 0) {
                e.x += (Math.random() - 0.5) * 4;
                e.y += (Math.random() - 0.5) * 4;
            }

            if (e.hrStateTimer > 120) {
                e.subState = 'dash';
                e.hrStateTimer = 0;
                spawnFloatingText(engine, e.x, e.y - e.radius - 40, "裁员!!!", "#ef4444", 'chat');
                engine.audio.playExplosion(); // Launch sound
                
                // Initial launch shake
                engine.state.camera.x += (Math.random() - 0.5) * 30;
                engine.state.camera.y += (Math.random() - 0.5) * 30;
            }
        }

        // --- PHASE 3: EXECUTION (Dash & Impact) ---
        // Behavior: High speed travel to lock point, then EXPLODE
        else if (e.subState === 'dash') {
            // Calculate movement to target
            const speed = 40; // Extremely fast charge
            const dx = e.dashTarget.x - e.x;
            const dy = e.dashTarget.y - e.y;
            const dist = Math.hypot(dx, dy);

            // Screen Shake during flight
            engine.state.camera.x += (Math.random() - 0.5) * 10;
            engine.state.camera.y += (Math.random() - 0.5) * 10;

            // --- BULLDOZE LOGIC (Push others out of the way while charging) ---
            if (e.hrStateTimer % 2 === 0) {
                const bulldozeRadius = 200;
                engine.state.enemies.forEach(victim => {
                    if (victim === e || victim.hp <= 0) return;
                    const ddx = victim.x - e.x;
                    const ddy = victim.y - e.y;
                    const ddist = Math.hypot(ddx, ddy);
                    
                    if (ddist < bulldozeRadius) {
                        const pushAngle = Math.atan2(ddy, ddx);
                        const force = 30; 
                        victim.vx += Math.cos(pushAngle) * force;
                        victim.vy += Math.sin(pushAngle) * force;
                        victim.stunTimer = 30;
                        spawnParticles(engine, victim.x, victim.y, '#ffffff', 2);
                    }
                });
            }

            if (dist <= speed) {
                // ARRIVED AT DESTINATION -> IMPACT
                e.x = e.dashTarget.x;
                e.y = e.dashTarget.y;
                
                // Reduced Impact Radius (Was 320)
                const IMPACT_RADIUS = 220; 

                // 1. Massive Explosion Zone
                engine.state.zones.push({
                    id: Math.random().toString(),
                    x: e.x, y: e.y,
                    radius: IMPACT_RADIUS, 
                    type: 'explosion_shockwave',
                    life: 40,
                    maxLife: 40,
                    color: '#ef4444',
                    emoji: ''
                });
                
                // 2. Fissure Zone
                engine.state.zones.push({
                    id: Math.random().toString(),
                    x: e.x, y: e.y,
                    radius: 120, 
                    type: 'scorch', 
                    life: 240, 
                    maxLife: 240,
                    color: '#ef4444',
                    emoji: ''
                });

                // 3. Audio & Visuals
                engine.audio.playExplosion();
                spawnParticles(engine, e.x, e.y, '#ef4444', 30);
                
                // 4. Massive Knockback & Damage (AOE)
                // Hit Player
                const pdx = p.x - e.x;
                const pdy = p.y - e.y;
                const pdist = Math.hypot(pdx, pdy);
                if (pdist < IMPACT_RADIUS) {
                    const dmg = 50 * dmgMult;
                    damagePlayer(engine, dmg, 'elite_hr_smash');
                    const kAngle = Math.atan2(pdy, pdx);
                    const kForce = 40;
                    p.vx += Math.cos(kAngle) * kForce;
                    p.vy += Math.sin(kAngle) * kForce;
                    p.stunTimer = 60; // Add stun if player has such prop logic (mostly visual/movement lock)
                    spawnFloatingText(engine, p.x, p.y, "暴击!", "#ef4444", 'damage');
                }

                // Hit Enemies
                engine.state.enemies.forEach(victim => {
                    if (victim === e || victim.hp <= 0) return;
                    const vdx = victim.x - e.x;
                    const vdy = victim.y - e.y;
                    const vdist = Math.hypot(vdx, vdy);
                    if (vdist < IMPACT_RADIUS) {
                        const kAngle = Math.atan2(vdy, vdx);
                        const kForce = 50;
                        victim.vx += Math.cos(kAngle) * kForce;
                        victim.vy += Math.sin(kAngle) * kForce;
                        victim.stunTimer = 60;
                    }
                });

                // --- NEW: AFTERSHOCK BURST ---
                // Explode bullets in a ring
                const burstCount = 12;
                for(let i=0; i<burstCount; i++) {
                    const angle = (i / burstCount) * Math.PI * 2;
                    const proj = PoolUtils.getProjectile(engine);
                    proj.x = e.x; proj.y = e.y;
                    proj.radius = 15;
                    proj.emoji = '🔻';
                    proj.vx = Math.cos(angle) * 8;
                    proj.vy = Math.sin(angle) * 8;
                    proj.damage = 15 * dmgMult;
                    proj.life = 120;
                    proj.isEnemy = true;
                    proj.color = '#ef4444';
                    proj.text = '🔻';
                    proj.pierce = 0;
                    proj.sourceType = e.config.type;
                    proj.renderStyle = 'red_triangle';
                    engine.state.projectiles.push(proj);
                }

                // Final Screen Shake
                engine.state.camera.x += (Math.random() - 0.5) * 50;
                engine.state.camera.y += (Math.random() - 0.5) * 50;

                e.subState = 'rest';
                e.hrStateTimer = 0;
                e.vx = 0; e.vy = 0;

            } else {
                // Move towards target
                e.vx = (dx / dist) * speed;
                e.vy = (dy / dist) * speed;
                e.x += e.vx;
                e.y += e.vy;
            }
        }

        // --- PHASE 4: PAPERWORK (Rest) ---
        // Duration: 150 frames (2.5s)
        // Behavior: Do nothing, vulnerable
        else if (e.subState === 'rest') {
            e.vx = 0; e.vy = 0;
            
            if (e.hrStateTimer === 1) {
                spawnFloatingText(engine, e.x, e.y - e.radius - 40, "📄 整理文档...", "#94a3b8", 'chat');
            }

            if (e.hrStateTimer > 150) {
                e.subState = 'assess';
                e.hrStateTimer = 0;
            }
        }
    }
};
