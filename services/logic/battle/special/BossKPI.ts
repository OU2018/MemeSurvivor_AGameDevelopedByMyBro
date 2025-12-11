
import { IGameEngine } from "../../../../types";
import { spawnFloatingText, spawnParticles, PoolUtils } from "../../utils";
import { BattleFormulas } from "../../formulas";

// --- CONFIGURATION ---
const CONFIG = {
    hp: 45000,
    enrageThreshold: 0.3, // 30% HP
    
    // Skill Rotation (Normal Phase)
    skills: {
        idleTime: 60, // 1s rest between skills
        
        // Skill 1: Pot Barrage (Buffed)
        pot: {
            count: 5,
            interval: 15, // Faster throws (0.25s)
            throwTime: 90, // Increased from 60 to 90 (1.5s)
            damage: 30,
            radius: 40
        },
        
        // Skill 2: Chaos Laser (Buffed)
        laser: {
            waves: 3,
            countPerWave: 25, 
            chargeTime: 90, 
            fireTime: 60,   
            damage: 80,   
            width: 70       
        },
        
        // Skill 3: Spiral Barrage
        spiral: {
            duration: 300, 
            rate: 6, 
            rotationSpeed: 0.1, 
            damage: 15
        }
    },

    // Enrage Phase (Wipe)
    wipe: {
        shieldAmount: 25000, 
        moveDuration: 60, 
        warningDuration: 240, 
        activeDuration: 600, 
        cooldownDuration: 240, // 4s cooldown
        damageTick: 100, 
        
        // P3 Sub-Skills
        scatterPotRate: 90, 
        sniperRate: 50,     
    }
};

export const BossKPI = {
    update: (engine: IGameEngine, e: any, p: any, shootFn: Function) => {
        // --- INITIALIZATION ---
        if (!e.maxHp) e.maxHp = e.hp; 
        if (!e.phase) e.phase = 1;
        if (!e.customVars) {
            e.customVars = {
                skillStack: [], 
                currentSkill: 'none',
                skillCounter: 0,
                wipeCycle: 0,
                safeZoneId: null,
                spiralAngle: 0
            };
        }

        e.stateTimer = (e.stateTimer || 0) + 1;
        const hpPct = e.hp / e.maxHp;

        // --- ENRAGE TRIGGER ---
        if (e.phase !== 3 && hpPct < CONFIG.enrageThreshold) {
            e.phase = 3;
            e.subState = 'wipe_move_center';
            e.stateTimer = 0;
            
            // Clear existing threats
            engine.state.zones = engine.state.zones.filter(z => !['laser_beam', 'kpi_pie', 'warning_circle'].includes(z.type));
            engine.state.projectiles = engine.state.projectiles.filter(p => !p.isEnemy); 
            
            // One-time Shield Grant
            e.tempShield = CONFIG.wipe.shieldAmount;
            e.maxTempShield = CONFIG.wipe.shieldAmount;
            
            // GIANT FORM
            e.radius *= 1.5;
            spawnFloatingText(engine, e.x, e.y - 150, "MAX POWER", "#ef4444", 'chat');

            spawnFloatingText(engine, e.x, e.y - 120, "⚠️ 末位淘汰启动 ⚠️", "#ff0000", 'chat');
            engine.audio.playExplosion();
            spawnParticles(engine, e.x, e.y, '#ef4444', 50);
            
            // Pre-spawn first hints during initial move
            spawnSafeZoneHints(engine);

            return;
        }

        // --- PHASE LOGIC ---
        if (e.phase === 3) {
            handleEnragePhase(engine, e, p, shootFn);
        } else {
            handleNormalPhase(engine, e, p, shootFn);
        }
    }
};

// --- NORMAL PHASE (Skill Rotation) ---
function handleNormalPhase(engine: IGameEngine, e: any, p: any, shootFn: Function) {
    if (e.subState === 'idle' || !e.subState) {
        const dist = Math.hypot(p.x - e.x, p.y - e.y);
        const angle = Math.atan2(p.y - e.y, p.x - e.x);
        if (dist > 400) {
            e.vx += Math.cos(angle) * 0.5;
            e.vy += Math.sin(angle) * 0.5;
        }
        
        if (e.stateTimer > CONFIG.skills.idleTime) {
            const skills = ['skill_pot', 'skill_laser', 'skill_spiral'];
            const nextSkill = skills[Math.floor(Math.random() * skills.length)];
            
            e.subState = nextSkill as any;
            e.stateTimer = 0;
            e.customVars.skillCounter = 0; 
            
            if (nextSkill === 'skill_pot') spawnFloatingText(engine, e.x, e.y - 80, "接好这个锅!", "#1c1917", 'chat');
            if (nextSkill === 'skill_laser') spawnFloatingText(engine, e.x, e.y - 80, "裁员广进!", "#ef4444", 'chat');
            if (nextSkill === 'skill_spiral') spawnFloatingText(engine, e.x, e.y - 80, "内卷风暴!", "#a855f7", 'chat');
        }
        return;
    }

    if (e.subState === 'skill_pot') {
        e.vx = 0; e.vy = 0; 
        const { count, interval, throwTime, damage, radius } = CONFIG.skills.pot;
        
        if (e.stateTimer % interval === 0 && e.customVars.skillCounter < count) {
            e.customVars.skillCounter++;
            for (let i = 0; i < 3; i++) {
                const spread = 200;
                const tx = p.x + (Math.random() - 0.5) * spread;
                const ty = p.y + (Math.random() - 0.5) * spread;
                spawnPotProjectile(engine, e, tx, ty, throwTime, damage, radius);
            }
            engine.audio.playEnemyShoot('boss_kpi');
        }
        
        if (e.customVars.skillCounter >= count && e.stateTimer > count * interval + 60) {
            e.subState = 'idle';
            e.stateTimer = 0;
        }
    }

    else if (e.subState === 'skill_laser') {
        e.vx = 0; e.vy = 0;
        const { waves, countPerWave, chargeTime, fireTime, width } = CONFIG.skills.laser;
        const waveDuration = chargeTime + fireTime + 20; 
        const waveProgress = e.stateTimer % waveDuration;

        if (waveProgress === 1 && e.customVars.skillCounter < waves) {
            e.customVars.skillCounter++;
            for(let i=0; i<countPerWave; i++) {
                const cx = (Math.random() - 0.5) * engine.state.mapWidth * 0.9;
                const cy = (Math.random() - 0.5) * engine.state.mapHeight * 0.9;
                const angle = Math.random() * Math.PI * 2;
                
                engine.state.zones.push({
                    id: Math.random().toString(),
                    x: cx, y: cy,
                    radius: 3000, 
                    type: 'laser_beam',
                    life: chargeTime + fireTime,
                    maxLife: chargeTime + fireTime,
                    color: '#ef4444',
                    emoji: '',
                    // @ts-ignore
                    angle: angle,
                    width: width
                });
            }
            spawnFloatingText(engine, e.x, e.y - 80, `⚡ 激光网 ${e.customVars.skillCounter}/${waves}`, "#ef4444");
        }
        
        if (waveProgress === chargeTime) {
            engine.audio.play('shoot_boss_kpi');
        }
        
        if (e.customVars.skillCounter >= waves && e.stateTimer > waves * waveDuration) {
            e.subState = 'idle';
            e.stateTimer = 0;
        }
    }

    else if (e.subState === 'skill_spiral') {
        const { duration, rate, rotationSpeed, damage } = CONFIG.skills.spiral;
        
        const angleToPlayer = Math.atan2(p.y - e.y, p.x - e.x);
        e.vx = Math.cos(angleToPlayer) * 1.0;
        e.vy = Math.sin(angleToPlayer) * 1.0;
        
        if (e.stateTimer % rate === 0) {
            const currentAngle = e.customVars.spiralAngle || 0;
            for(let i=0; i<3; i++) {
                const fireAngle = currentAngle + (i * Math.PI * 2 / 3);
                const proj = PoolUtils.getProjectile(engine);
                proj.x = e.x; proj.y = e.y;
                proj.radius = 13; 
                proj.emoji = '';
                proj.vx = Math.cos(fireAngle) * 6;
                proj.vy = Math.sin(fireAngle) * 6;
                proj.damage = damage;
                proj.life = 300; 
                proj.isEnemy = true;
                proj.color = '#f472b6'; 
                proj.text = '';
                proj.pierce = 0;
                proj.sourceType = 'boss_kpi';
                proj.active = true;
                engine.state.projectiles.push(proj);
            }
            e.customVars.spiralAngle = (currentAngle + rotationSpeed) % (Math.PI * 2);
        }
        
        if (e.stateTimer > duration) {
            e.subState = 'idle';
            e.stateTimer = 0;
        }
    }
}

// --- ENRAGE PHASE (Wipe Mechanic + Multi-Tasking) ---
function handleEnragePhase(engine: IGameEngine, e: any, p: any, shootFn: Function) {
    e.vx = 0; e.vy = 0;
    
    if (e.subState !== 'wipe_move_center') {
        e.x = 0; e.y = 0;
    }

    // 1. MOVE TO CENTER
    if (e.subState === 'wipe_move_center') {
        const dist = Math.hypot(e.x, e.y);
        if (dist > 20) {
            const angle = Math.atan2(-e.y, -e.x);
            e.vx = Math.cos(angle) * 20; 
            e.vy = Math.sin(angle) * 20;
            e.x += e.vx; e.y += e.vy;
        } else {
            e.x = 0; e.y = 0; e.vx = 0; e.vy = 0;
            e.subState = 'wipe_prepare';
            e.stateTimer = 0;
        }
    }

    // 2. PREPARE (Convert Hints to Safe Zones)
    else if (e.subState === 'wipe_prepare') {
        // Convert Hints to Real Zones
        spawnSafeZonesFromHints(engine);
        
        spawnFloatingText(engine, 0, -100, ">>> 寻找安全区 <<<", "#3b82f6", 'chat');
        e.subState = 'wipe_warning';
        e.stateTimer = 0;
    }

    // 3. WARNING EXPANSION
    else if (e.subState === 'wipe_warning') {
        const exists = engine.state.zones.some(z => z.type === 'kpi_doom_expansion');
        if (!exists) {
            engine.state.zones.push({
                id: Math.random().toString(),
                x: 0, y: 0,
                radius: 0, 
                type: 'kpi_doom_expansion',
                life: CONFIG.wipe.warningDuration,
                maxLife: CONFIG.wipe.warningDuration,
                color: '#7f1d1d',
                emoji: ''
            });
        }

        if (e.stateTimer >= CONFIG.wipe.warningDuration) {
            e.subState = 'wipe_damage';
            e.stateTimer = 0;
            engine.state.zones = engine.state.zones.filter(z => z.type !== 'kpi_doom_expansion');
            engine.state.zones.push({
                id: Math.random().toString(),
                x: 0, y: 0,
                radius: 9999, 
                type: 'kpi_hell_fire',
                life: CONFIG.wipe.activeDuration,
                maxLife: CONFIG.wipe.activeDuration,
                color: '#7f1d1d',
                emoji: ''
            });
            engine.audio.play('ui_glitch_severe');
        }
    }

    // 4. DAMAGE SUSTAIN + MULTI-ATTACK (HELL)
    else if (e.subState === 'wipe_damage') {
        // A. SCATTER POTS: Target player with shotgun spread
        if (e.stateTimer % CONFIG.wipe.scatterPotRate === 0) {
            const potCount = 6;
            for(let i=0; i<potCount; i++) {
                const scatter = 250; 
                const tx = p.x + (Math.random() - 0.5) * scatter;
                const ty = p.y + (Math.random() - 0.5) * scatter;
                
                const throwTime = 90; // Longer flight (1.5s)
                spawnPotProjectile(engine, e, tx, ty, throwTime, 40, 40);
            }
        }

        // B. SNIPER SHOT: Gold Void
        if (e.stateTimer % CONFIG.wipe.sniperRate === 0) {
            const angle = Math.atan2(p.y - e.y, p.x - e.x);
            const proj = PoolUtils.getProjectile(engine);
            proj.x = e.x; proj.y = e.y;
            proj.radius = 22; // Larger
            proj.emoji = ''; 
            proj.vx = Math.cos(angle) * 4; 
            proj.vy = Math.sin(angle) * 4;
            proj.damage = 30;
            proj.life = 300;
            proj.isEnemy = true;
            proj.color = '#fbbf24'; // Gold
            proj.text = '';
            proj.pierce = 0;
            proj.sourceType = 'boss_kpi';
            proj.active = true;
            proj.renderStyle = 'gold_void'; // New Style
            
            engine.state.projectiles.push(proj);
        }

        if (e.stateTimer >= CONFIG.wipe.activeDuration) {
            e.subState = 'wipe_cooldown';
            e.stateTimer = 0;
            engine.state.zones = engine.state.zones.filter(z => z.type !== 'kpi_hell_fire' && z.type !== 'safe_haven');
            spawnFloatingText(engine, e.x, e.y - 80, "系统过热... 暂时安全", "#22c55e", 'chat');
            engine.audio.play('ui_power_down');
            
            // SPAWN HINTS FOR NEXT WAVE
            spawnSafeZoneHints(engine);
        }
    }

    // 5. COOLDOWN
    else if (e.subState === 'wipe_cooldown') {
        if (e.stateTimer >= CONFIG.wipe.cooldownDuration) {
            e.subState = 'wipe_prepare';
            e.stateTimer = 0;
        }
    }
}

// Helper: Spawn Pot with Correct Physics (Arc)
function spawnPotProjectile(engine: IGameEngine, source: any, tx: number, ty: number, duration: number, damage: number, radius: number) {
    const pot = PoolUtils.getProjectile(engine);
    
    pot.x = source.x; 
    pot.y = source.y; 
    pot.z = 100; // Start high
    
    pot.vx = (tx - source.x) / duration;
    pot.vy = (ty - source.y) / duration;
    
    // Physics Arc Calculation
    // z = z0 + vz*t - 0.5*g*t^2. Target z=0 at t=duration.
    // vz = (0.5 * g * t^2 - z0) / t
    const gravity = 0.5; // Lower gravity for longer float
    const z0 = 100;
    const requiredVz = (0.5 * gravity * (duration * duration) - z0) / duration;

    pot.vz = requiredVz;
    pot.gravity = gravity; 
    
    pot.radius = 20;
    pot.damage = damage;
    pot.life = duration + 10; 
    pot.isEnemy = true;
    
    // EXPLICIT EXPLOSION PROPS
    pot.isExplosive = true;
    pot.explodeOnExpire = true;
    pot.maxExplosionRadius = 120; // Corrected to match visual + gameplay
    pot.damageWindow = 3; // Ensure damage is dealt over 3 frames
    
    pot.renderStyle = 'black_pot';
    pot.behaviors = ['isometric_move', 'explode_on_expire'];
    pot.isAerial = true; 
    
    // Explicitly set sourceType to boss_kpi
    pot.sourceType = 'boss_kpi';
    
    engine.state.projectiles.push(pot);
    
    engine.state.zones.push({
        id: Math.random().toString(),
        x: tx, y: ty,
        radius: radius,
        type: 'warning_circle',
        life: duration,
        maxLife: duration,
        color: '#fbbf24', 
        emoji: ''
    });
}

// NEW: Spawn Hints (Surge markers) - RANDOMIZED
function spawnSafeZoneHints(engine: IGameEngine) {
    // Clear old hints first just in case
    engine.state.zones = engine.state.zones.filter(z => z.type !== 'safe_zone_hint');

    // Bounds for spawning
    const margin = 200;
    const minX = -engine.state.mapWidth/2 + margin;
    const maxX = engine.state.mapWidth/2 - margin;
    const minY = -engine.state.mapHeight/2 + margin;
    const maxY = engine.state.mapHeight/2 - margin;

    for(let i=0; i<3; i++) {
        let sx = 0, sy = 0;
        let valid = false;
        let attempts = 0;

        // Try to find a valid spot far from center (Boss is at 0,0)
        while(!valid && attempts < 15) {
            sx = minX + Math.random() * (maxX - minX);
            sy = minY + Math.random() * (maxY - minY);
            
            const distToCenter = Math.hypot(sx, sy);
            if (distToCenter > 600) { // Keep away from boss
                valid = true;
            }
            attempts++;
        }

        // Create Hint Zone
        // Life should cover the cooldown duration approx
        const hintLife = CONFIG.wipe.cooldownDuration + 60; 

        engine.state.zones.push({
            id: Math.random().toString(),
            x: sx, y: sy,
            radius: 200, 
            type: 'safe_zone_hint',
            life: hintLife,
            maxLife: hintLife,
            color: '#60a5fa',
            emoji: ''
        });
    }
}

// NEW: Convert Hints to Actual Safe Zones
function spawnSafeZonesFromHints(engine: IGameEngine) {
    const hints = engine.state.zones.filter(z => z.type === 'safe_zone_hint');
    
    // Remove hints
    engine.state.zones = engine.state.zones.filter(z => z.type !== 'safe_zone_hint');
    
    // If no hints found (first run safety), generate random
    if (hints.length === 0) {
        spawnSafeZoneHints(engine); 
        // Immediately process the just-spawned hints
        const newHints = engine.state.zones.filter(z => z.type === 'safe_zone_hint');
        newHints.forEach(hint => createRealSafeZone(engine, hint.x, hint.y));
        engine.state.zones = engine.state.zones.filter(z => z.type !== 'safe_zone_hint');
        return;
    }

    hints.forEach(hint => {
        createRealSafeZone(engine, hint.x, hint.y);
    });
}

function createRealSafeZone(engine: IGameEngine, x: number, y: number) {
    const totalLife = CONFIG.wipe.warningDuration + CONFIG.wipe.activeDuration;
    // @ts-ignore
    engine.state.zones.push({
        id: Math.random().toString(),
        x: x, y: y,
        radius: 200, 
        type: 'safe_haven',
        life: totalLife,
        maxLife: totalLife,
        color: '#3b82f6',
        emoji: '🛡️'
    });
}
