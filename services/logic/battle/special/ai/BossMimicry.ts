
import { IGameEngine } from "../../../../../types";
import { PoolUtils } from "../../../utils";

export const BossMimicry = {
    /**
     * 007 Mode: Throw a large bomb that lands and creates a danger zone
     * Mad Bomber Style: High arc, random distance, massive explosion
     */
    spawn007Bomb: (engine: IGameEngine, e: any, angle: number) => {
        const proj = PoolUtils.getProjectile(engine);
        
        proj.x = e.x;
        proj.y = e.y;
        proj.radius = 50; // Massive size
        proj.emoji = '💣';
        proj.text = '💣';
        
        // Physics: Full map coverage (50 to 1200 distance) - WIDER RANGE
        const dist = 50 + Math.random() * 1200; 
        const duration = 60 + Math.random() * 40; // Varied flight time
        
        const speed = dist / duration;
        proj.vx = Math.cos(angle) * speed;
        proj.vy = Math.sin(angle) * speed;
        
        // Isometric Arc Physics
        proj.z = 80;
        proj.vz = 12; // Higher arc
        proj.gravity = 0.5;

        proj.damage = 40;
        
        // Life needs to cover the flight duration + explosion time
        proj.life = duration + 20;

        proj.isEnemy = true;
        proj.isMimic = true;
        proj.color = '#ef4444'; // Red
        
        // Explosion Props
        proj.isExplosive = true;
        proj.explodeOnExpire = true;
        proj.maxExplosionRadius = 220; // Massive AOE
        proj.damageWindow = 3;
        
        // Visuals
        proj.renderStyle = 'mimic_bomb';
        proj.trailConfig = { type: 'smoke', color: '#78716c', interval: 3, timer: 0, size: 14 };
        
        // Behaviors
        proj.behaviors = ['isometric_move', 'decay_life', 'check_bounds', 'explode_on_expire', 'update_explosion', 'emit_trail'];
        
        engine.state.projectiles.push(proj);
        
        // Reduce sound spam (only play for some)
        if (Math.random() < 0.2) engine.audio.play('shoot_default');
        
        // Spawn Warning Circle at destination immediately
        engine.state.zones.push({
            id: Math.random().toString(),
            x: e.x + Math.cos(angle) * dist,
            y: e.y + Math.sin(angle) * dist,
            radius: 220, // Matches explosion
            type: 'warning_circle',
            life: duration,
            maxLife: duration,
            color: '#ef4444',
            emoji: ''
        });
    },

    /**
     * 1024 Mode: Ring/Spiral of Code with Sine Wave
     * Increased Life for screen-wide suppression
     */
    spawn1024Code: (engine: IGameEngine, e: any, angle: number) => {
        const proj = PoolUtils.getProjectile(engine);
        const texts = ['Bug', 'NaN', 'null', '{}', 'undefined', 'Fatal', '0xFFFF'];
        const text = texts[Math.floor(Math.random() * texts.length)];
        
        proj.x = e.x;
        proj.y = e.y;
        proj.radius = 35;
        proj.emoji = text;
        proj.text = text;
        
        const speed = 7;
        proj.vx = Math.cos(angle) * speed;
        proj.vy = Math.sin(angle) * speed;
        
        proj.damage = 15;
        proj.life = 400; // INCREASED to 400 (approx 6.6s)
        proj.isEnemy = true;
        proj.isMimic = true;
        proj.color = '#ef4444'; 
        
        proj.renderStyle = 'text';
        proj.behaviors = ['move_linear', 'sine_wave', 'decay_life', 'check_bounds'];
        
        proj.trailConfig = { type: 'pixel', color: '#ef4444', interval: 4, timer: 0 };
        
        engine.state.projectiles.push(proj);
    },

    /**
     * 9527 Mode: Spray of Red Text
     * Increased Life for screen-wide suppression
     */
    spawn9527Text: (engine: IGameEngine, e: any, angle: number) => {
        const proj = PoolUtils.getProjectile(engine);
        const texts = ['收到', '好的', '在做了', '加急', '催办', '马上', '流程', '驳回', '重做', '下班?'];
        const text = texts[Math.floor(Math.random() * texts.length)];
        
        proj.x = e.x;
        proj.y = e.y;
        proj.radius = 32;
        proj.emoji = text;
        proj.text = text;
        
        // Spread
        const spread = (Math.random() - 0.5) * 0.4;
        const finalAngle = angle + spread;
        
        const speed = 11;
        proj.vx = Math.cos(finalAngle) * speed;
        proj.vy = Math.sin(finalAngle) * speed;
        
        proj.damage = 15;
        proj.life = 400; // INCREASED to 400
        proj.isEnemy = true;
        proj.isMimic = true;
        proj.color = '#ef4444'; 
        
        proj.renderStyle = 'text';
        proj.trailConfig = { type: 'pixel', color: 'rgba(239, 68, 68, 0.3)', interval: 5, timer: 0 };
        proj.behaviors = ['move_linear', 'decay_life', 'check_bounds', 'emit_trail'];
        
        engine.state.projectiles.push(proj);
        if (Math.random() < 0.3) engine.audio.play('shoot_default');
    },

    /**
     * EV Creator Mode: Straight Errors
     * Increased Life for screen-wide suppression
     */
    spawnEVCreatorError: (engine: IGameEngine, e: any, angle: number) => {
        const proj = PoolUtils.getProjectile(engine);
        
        proj.x = e.x;
        proj.y = e.y;
        proj.radius = 35;
        proj.emoji = 'Error';
        proj.text = 'Error';
        
        const speed = 5; // Slightly faster
        proj.vx = Math.cos(angle) * speed;
        proj.vy = Math.sin(angle) * speed;
        
        proj.damage = 20;
        proj.life = 400; // INCREASED to 400
        proj.isEnemy = true;
        proj.isMimic = true;
        proj.color = '#ef4444'; 
        
        proj.renderStyle = 'text';
        proj.behaviors = ['move_linear', 'decay_life', 'check_bounds'];
        
        engine.state.projectiles.push(proj);
        if (Math.random() < 0.3) engine.audio.play('shoot_boss_glitch');
    }
};
