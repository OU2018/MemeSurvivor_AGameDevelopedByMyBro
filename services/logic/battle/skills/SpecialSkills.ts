import { IGameEngine } from "../../../../types";
import { spawnFloatingText, PoolUtils } from "../../utils";
import { EnemySpawner } from "../systems/EnemySpawner";

export const SpecialSkills = {
    // --- CYBER GODDESS 2.0 (Charm + Frenzy) ---
    handleCyberGoddess: (engine: IGameEngine, e: any) => {
        if (e.config.type !== 'cyber_goddess') return;
        if (!e.stateTimer) e.stateTimer = 0;
        e.stateTimer++;
        
        // --- SKILL 1: FRENZY SUMMON ---
        // Summons aggressive red tian gous
        const orbitalCount = engine.state.enemies.filter((m: any) => m.orbitTargetId === e.id).length;
        // Limit total frenzy dogs, but allow more often than standard goddess
        if (e.stateTimer % 240 === 0 && orbitalCount < 5) {
            spawnFloatingText(engine, e.x, e.y - e.radius - 30, "提纯!", "#ef4444", 'chat');
            const angle = Math.random() * Math.PI * 2;
            const spawnDist = 120;
            
            // Spawn FRENZIED Simp (tian_gou_frenzy)
            EnemySpawner.spawnEnemy(engine, 'tian_gou_frenzy', e.x + Math.cos(angle) * spawnDist, e.y + Math.sin(angle) * spawnDist);
            
            // Apply orbit properties to the newly spawned unit
            const minion = engine.state.enemies[engine.state.enemies.length - 1];
            if (minion && minion.config.type === 'tian_gou_frenzy') {
                minion.orbitTargetId = e.id;
                minion.orbitAngle = angle;
            }
        }

        // --- SKILL 2: CHARM KISS ---
        // Fires every 5-7 seconds
        if (!e.charmCooldown) e.charmCooldown = 360; // 6s start
        e.charmCooldown--;
        
        if (e.charmCooldown <= 0) {
            // Find player
            const p = engine.state.player;
            const dist = Math.hypot(p.x - e.x, p.y - e.y);
            
            if (dist < 1200) { // Range check
                const angle = Math.atan2(p.y - e.y, p.x - e.x);
                spawnFloatingText(engine, e.x, e.y - 60, "么么哒~", "#f472b6", 'chat');
                
                // Spawn Projectile
                const proj = PoolUtils.getProjectile(engine);
                proj.x = e.x; proj.y = e.y;
                proj.radius = 25; // Large bubble
                proj.vx = Math.cos(angle) * 5; // Slow moving
                proj.vy = Math.sin(angle) * 5;
                proj.damage = 10; 
                proj.life = 300; // 5s life
                proj.isEnemy = true;
                proj.renderStyle = 'charm_heart'; // Special Render Style
                proj.sourceType = e.id; // Mark source as THIS goddess for tracking
                proj.active = true;
                proj.behaviors = ['move_linear', 'decay_life', 'check_bounds', 'emit_trail'];
                proj.trailConfig = { type: 'smoke', color: '#f472b6', interval: 4, timer: 0, size: 10 };
                
                engine.state.projectiles.push(proj);
                
                e.charmCooldown = 300 + Math.random() * 120; // Reset cooldown
            }
        }
    },

    handleClownBalloon: (engine: IGameEngine, e: any, p: any, spawnFn: Function) => {
        if (e.config.type !== 'clown') return;
        const dist = Math.hypot(p.x - e.x, p.y - e.y);
        if (e.attackCooldown > 0) e.attackCooldown--;
        if (dist < 800 && e.attackCooldown <= 0) {
            spawnFloatingText(engine, e.x, e.y - e.radius - 20, "气球!", "#ef4444", 'chat');
            spawnFn(engine, 'balloon', e.x + (Math.random()-0.5)*50, e.y + (Math.random()-0.5)*50);
            e.attackCooldown = 300;
        }
    }
};