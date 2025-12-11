
import { IGameEngine } from "../../../../types";
import { spawnFloatingText, spawnParticles, PoolUtils } from "../../utils";
import { EnemySpawner } from "../systems/EnemySpawner";
import { EliteManagerConfig as Config } from "./EliteManagerConfig";
import { MapSystem } from "../../systems/MapSystem"; 

// Helper for consistent kiting behavior
const updateKitingMovement = (engine: IGameEngine, e: any, p: any, speedMult: number = 1.0) => {
    const pdx = p.x - e.x;
    const pdy = p.y - e.y;
    const pdist = Math.hypot(pdx, pdy);
    
    // Initialize strafe direction if missing
    if (!e.strafeDir || e.skillTimer % 120 === 0) {
        e.strafeDir = Math.random() > 0.5 ? 1 : -1;
    }

    // Normalized direction to player
    const dirX = pdx / (pdist || 1);
    const dirY = pdy / (pdist || 1);
    
    let currentSpeed = e.config.speed * speedMult;

    if (pdist < Config.Movement.panicRange) {
        // Panic Retreat: Sprint away
        currentSpeed = e.config.speed * Config.Movement.panicSpeedMult; 
        e.vx = -dirX * currentSpeed;
        e.vy = -dirY * currentSpeed;
        if (engine.state.timeAlive % 20 === 0) {
            spawnParticles(engine, e.x, e.y, '#a855f7', 2); // Dust trail
        }
    } else if (pdist < Config.Movement.minRange) {
        // Standard Retreat
        e.vx = -dirX * currentSpeed;
        e.vy = -dirY * currentSpeed;
    } else if (pdist > Config.Movement.maxRange) {
        // Advance
        e.vx = dirX * currentSpeed;
        e.vy = dirY * currentSpeed;
    } else {
        // Sweet Spot: Strafe sideways
        const strafeX = -dirY * e.strafeDir;
        const strafeY = dirX * e.strafeDir;
        const bias = -0.2; 
        
        e.vx = (strafeX + dirX * bias) * (currentSpeed * Config.Movement.strafeSpeedMult);
        e.vy = (strafeY + dirY * bias) * (currentSpeed * Config.Movement.strafeSpeedMult);
    }

    // --- TACTICAL SEPARATION ---
    engine.state.enemies.forEach((other: any) => {
        if (other !== e && other.config.type === 'elite_manager') {
            const dx = e.x - other.x;
            const dy = e.y - other.y;
            const dist = Math.hypot(dx, dy);
            
            if (dist < Config.Movement.separationDist && dist > 0) {
                const force = (Config.Movement.separationDist - dist) / Config.Movement.separationDist; 
                const pushX = (dx / dist) * force * Config.Movement.separationForce; 
                const pushY = (dy / dist) * force * Config.Movement.separationForce; 
                e.vx += pushX;
                e.vy += pushY;
            }
        }
    });

    e.x += e.vx;
    e.y += e.vy;

    // Hard Constraint
    MapSystem.constrain(engine, e);
};

// Helper: Smooth angle lerp
const lerpAngle = (start: number, end: number, amount: number) => {
    let diff = end - start;
    // Normalize diff to -PI to PI
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    return start + diff * amount;
};

export const EliteManager = {
    update: (engine: IGameEngine, e: any, p: any, shootFn: Function) => {
        if (!e.skillTimer) e.skillTimer = 0;
        e.skillTimer++;
        
        if (!e.customVars) e.customVars = {};
        
        const cycleTime = e.skillTimer % Config.Timing.cycleDuration;
        
        // Count current ammo
        const orbitingCount = engine.state.enemies.filter((m: any) => m.captureState === 'orbiting' && m.captureTargetId === e.id).length;

        // --- PHASE 1: RECRUITMENT & COVER FIRE (0 - 6s) ---
        if (cycleTime < Config.Timing.phase1End) {
            e.aimAngle = undefined; // Reset aim
            e.customVars.isLocked = false;
            e.customVars.isFiring = false;
            e.customVars.chargeLevel = 0;
            e.customVars.laserAlpha = 0; // Reset laser
            e.customVars.smoothAim = undefined; // Reset smooth tracker
            e.customVars.chamberedMinionId = null; // Reset chambered minion
            
            // Movement: Kiting behavior
            updateKitingMovement(engine, e, p, Config.Movement.normalSpeedMult);

            // Action 1: Cover Fire (Dynamic Breathing Barrage)
            if (cycleTime % Config.Timing.coverFireRate === 0) {
                const count = 5;
                const baseAngle = Math.atan2(p.y - e.y, p.x - e.x);
                // Breathing: Spread varies sinusoidally
                const breath = Math.sin(engine.state.timeAlive * 0.1) * 0.5 + 0.5; // 0 to 1
                const spread = 0.15 + breath * 0.25; // 0.15 to 0.40 rad
                
                const totalArc = spread * (count - 1);
                const startAngle = baseAngle - totalArc / 2;

                for (let i = 0; i < count; i++) {
                    const angle = startAngle + i * spread;
                    
                    const proj = PoolUtils.getProjectile(engine);
                    proj.x = e.x; 
                    proj.y = e.y;
                    proj.radius = 12;
                    proj.emoji = '';
                    proj.vx = Math.cos(angle) * 7;
                    proj.vy = Math.sin(angle) * 7;
                    proj.damage = e.config.damage;
                    proj.life = 180;
                    proj.isEnemy = true;
                    proj.color = '#a855f7'; // Purple Neon
                    proj.text = '';
                    proj.pierce = 0;
                    proj.sourceType = e.config.type;
                    proj.renderStyle = 'neon_missile'; // Use flashy renderer
                    proj.active = true;
                    proj.trailHistory = []; 
                    
                    engine.state.projectiles.push(proj);
                }
                // Use tech-y sound
                engine.audio.play('shoot_boss_ai'); 
            }

            // Action 2: Capture Beacons
            if (cycleTime % Config.Timing.captureFireRate === 0) { 
               if (orbitingCount < Config.Combat.maxAmmo) {
                   // ... (Existing capture logic) ...
                   let validTargets = engine.state.enemies.filter((m: any) => 
                       m !== e && 
                       !m.captureState && 
                       !m.linkedById &&   
                       !m.isThrown &&
                       m.config.behavior !== 'boss' &&
                       m.config.type !== 'elite_manager' &&
                       (m.config.type === 'river_crab' || m.config.type === 'gai_liu_zi' || m.config.behavior === 'rusher' || m.config.behavior === 'chase' || m.config.behavior === 'tank' || m.config.behavior === 'minion')
                   );

                   if (validTargets.length < Config.Combat.minAmmoRefillThreshold) {
                       spawnFloatingText(engine, e.x, e.y - e.radius - 40, "双倍招聘!", "#a855f7", 'chat');
                       const backAngle = Math.atan2(e.y - p.y, e.x - p.x);
                       const spawnDist = Config.Combat.ammoSpawnDistance;
                       const margin = 100;
                       const halfW = engine.state.mapWidth / 2 - margin;
                       const halfH = engine.state.mapHeight / 2 - margin;
                       const clampX = (x: number) => Math.max(-halfW, Math.min(halfW, x));
                       const clampY = (y: number) => Math.max(-halfH, Math.min(halfH, y));

                       let s1x = clampX(e.x + Math.cos(backAngle) * spawnDist + 30);
                       let s1y = clampY(e.y + Math.sin(backAngle) * spawnDist);
                       let s2x = clampX(e.x + Math.cos(backAngle) * spawnDist - 30);
                       let s2y = clampY(e.y + Math.sin(backAngle) * spawnDist);

                       EnemySpawner.spawnEnemy(engine, 'minion', s1x, s1y);
                       EnemySpawner.spawnEnemy(engine, 'minion', s2x, s2y);
                       validTargets = engine.state.enemies.filter((m: any) => m.config.type === 'minion' && !m.captureState && !m.isThrown);
                   }

                   if (validTargets.length > 0) {
                       validTargets.sort((a: any, b: any) => Math.hypot(a.x - e.x, a.y - e.y) - Math.hypot(b.x - e.x, b.y - e.y));
                       validTargets.slice(0, 2).forEach((t: any) => {
                           t.captureState = 'targeted';
                           t.captureTargetId = e.id;
                           const angle = Math.atan2(t.y - e.y, t.x - e.x);
                           engine.state.projectiles.push({
                               id: Math.random().toString(),
                               x: e.x, y: e.y,
                               radius: 20, emoji: '🕸️',
                               vx: Math.cos(angle) * Config.Combat.beaconSpeed, 
                               vy: Math.sin(angle) * Config.Combat.beaconSpeed,
                               damage: 0, life: 999, isEnemy: true, color: '#a855f7', text: '', pierce: 0, hitIds: [], isCaptureBeacon: true, sourceType: e.id, targetId: t.id, active: true
                           });
                       });
                   }
               }
            }
            
            if (cycleTime === Config.Timing.phase1End - 60) {
                 spawnFloatingText(engine, e.x, e.y - e.radius - 40, "准备考核...", "#ef4444", 'chat');
            }
        }
        
        // --- PHASE 2: PERFORMANCE REVIEW (RAILGUN MODE) ---
        else if (cycleTime < Config.Timing.phase2End) {
            e.vx = 0; e.vy = 0; // Stationary while shooting
            
            const phaseTime = cycleTime - Config.Timing.phase1End;
            const shotCycle = Config.Timing.shotInterval; 
            const trackTime = Config.Timing.trackTime;
            const preFireTime = Config.Timing.preFireTime;
            
            const progress = phaseTime % shotCycle;
            
            // Default: Fading out laser from previous shot
            if (e.customVars.laserAlpha === undefined) e.customVars.laserAlpha = 0;

            // 1. TRACKING PHASE (Snappy Aim + Sine Wave Jitter + LIVE CHAMBERING)
            if (progress < trackTime) {
                // --- PREDICTIVE AIMING ---
                const predFactor = Config.Combat.aimPrediction; 
                const targetX = p.x + p.vx * predFactor;
                const targetY = p.y + p.vy * predFactor;
                
                const desiredAngle = Math.atan2(targetY - e.y, targetX - e.x);
                
                // Init smooth aim tracker if undefined
                if (e.customVars.smoothAim === undefined) e.customVars.smoothAim = desiredAngle;
                
                // Snappy Lerp towards prediction
                e.customVars.smoothAim = lerpAngle(e.customVars.smoothAim, desiredAngle, Config.Combat.aimTurnSpeed);
                
                // --- SINE WAVE JITTER ---
                const stability = progress / trackTime; 
                const jitterMag = (1 - stability) * Config.Combat.aimJitterMagnitude;
                
                const t = engine.state.timeAlive;
                const wave = Math.sin(t * 0.1) * 0.6 + Math.sin(t * 0.25) * 0.4; 
                const jitterOffset = wave * jitterMag;
                
                e.aimAngle = e.customVars.smoothAim + jitterOffset;
                e.customVars.lockedAngle = e.aimAngle;
                
                e.customVars.isLocked = false;
                e.customVars.chargeLevel = stability;
                e.customVars.isFiring = false;
                
                // Laser Alpha ramps up
                e.customVars.laserAlpha = Math.min(1, e.customVars.laserAlpha + 0.1);

                // --- LIVE CHAMBERING LOGIC ---
                // Continuously pull the "bullet" minion to the gun muzzle during aiming
                let ammo = null;
                if (e.customVars.chamberedMinionId) {
                    ammo = engine.state.enemies.find(m => m.id === e.customVars.chamberedMinionId);
                }
                
                // If no ammo assigned or ammo dead, find new one
                if (!ammo || ammo.hp <= 0) {
                    ammo = engine.state.enemies.find((m: any) => m.captureState === 'orbiting' && m.captureTargetId === e.id);
                    if (ammo) e.customVars.chamberedMinionId = ammo.id;
                }

                if (ammo) {
                    const muzzleOffset = e.radius + 30; // Slightly further out
                    const mx = e.x + Math.cos(e.aimAngle) * muzzleOffset;
                    const my = e.y + Math.sin(e.aimAngle) * muzzleOffset;
                    
                    // Instant Snap to Muzzle
                    ammo.x = mx;
                    ammo.y = my;
                    ammo.vx = 0;
                    ammo.vy = 0;
                    ammo.stunTimer = 2; // Keep stunned
                }

                // Audio tick for buildup
                if (progress % 15 === 0) engine.audio.play('ui_static_tick');
            }
            
            // 2. PRE-FIRE PHASE (HARD LOCK - MICRO PAUSE)
            else if (progress < trackTime + preFireTime) {
                if (e.customVars.lockedAngle !== undefined) {
                    e.aimAngle = e.customVars.lockedAngle;
                }
                
                // Visuals: Max Intensity
                e.customVars.chargeLevel = 1.0;
                e.customVars.isLocked = true;
                e.customVars.laserAlpha = 1.0;

                // Ensure ammo stays locked at muzzle for these few frames
                const ammo = engine.state.enemies.find(m => m.id === e.customVars.chamberedMinionId);
                if (ammo) {
                    const muzzleOffset = e.radius + 30;
                    const mx = e.x + Math.cos(e.aimAngle) * muzzleOffset;
                    const my = e.y + Math.sin(e.aimAngle) * muzzleOffset;
                    ammo.x = mx;
                    ammo.y = my;
                }
            }
            
            // 3. FIRING FRAME
            else if (progress < trackTime + preFireTime + 1) { 
                e.customVars.isFiring = true; 
                
                // Fire the chambered minion
                const ammo = engine.state.enemies.find(m => m.id === e.customVars.chamberedMinionId);
                
                if (ammo) {
                    const throwAngle = e.customVars.lockedAngle || e.aimAngle; 
                    
                    ammo.vx = Math.cos(throwAngle) * Config.Combat.throwSpeed;
                    ammo.vy = Math.sin(throwAngle) * Config.Combat.throwSpeed;
                    ammo.isThrown = true; 
                    ammo.captureState = 'free'; 
                    ammo.captureTargetId = undefined;
                    ammo.stunTimer = 0; 
                    
                    // Reset chambered ID
                    e.customVars.chamberedMinionId = null;

                    // Recoil Physics
                    engine.state.camera.x += Math.cos(throwAngle) * -20;
                    engine.state.camera.y += Math.sin(throwAngle) * -20;
                    
                    engine.audio.playExplosion();
                    spawnFloatingText(engine, e.x, e.y - e.radius - 20, "不合格!", "#ef4444", 'chat');
                } else {
                    spawnFloatingText(engine, e.x, e.y - e.radius - 20, "缺人...", "#cbd5e1", 'chat');
                }
            } 
            
            // 4. RECOIL / COOLDOWN PHASE
            else {
                e.customVars.isFiring = false;
                // Fade out laser
                e.customVars.laserAlpha = Math.max(0, e.customVars.laserAlpha - 0.08);
            }
        }
        
        // --- PHASE 3: COFFEE BREAK ---
        else {
            e.vx = 0; e.vy = 0;
            e.aimAngle = undefined;
            e.customVars.isLocked = false;
            e.customVars.chargeLevel = 0;
            e.customVars.laserAlpha = 0;
            e.customVars.smoothAim = undefined;
            e.customVars.chamberedMinionId = null;
            if (cycleTime % 60 === 0) spawnFloatingText(engine, e.x, e.y - e.radius - 30, "☕ 摸鱼中...", "#22c55e", 'chat');
        }

        // --- ORBIT UPDATE (Modified to exclude chambered minion) ---
        const orbiters = engine.state.enemies.filter((m: any) => 
            m.captureState === 'orbiting' && 
            m.captureTargetId === e.id && 
            m.id !== e.customVars.chamberedMinionId // Don't orbit if being chambered
        );
        
        const baseRotation = e.skillTimer * Config.Combat.orbitRotationSpeed;
        if (orbiters.length > 0) {
            orbiters.forEach((m: any, index: number) => {
                const angle = baseRotation + (index / orbiters.length) * Math.PI * 2;
                m.x = e.x + Math.cos(angle) * Config.Combat.orbitRadius;
                m.y = e.y + Math.sin(angle) * Config.Combat.orbitRadius;
                m.vx = 0; m.vy = 0;
            });
        }
    }
};
