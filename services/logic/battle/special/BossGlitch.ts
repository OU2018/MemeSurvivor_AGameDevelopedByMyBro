
import { IGameEngine, Projectile } from "../../../../types";
import { spawnFloatingText, spawnParticles, PoolUtils } from "../../utils";
import { GameEventType } from "../../events/events";

// Boss Glitch Config
const CONFIG = {
    hp: 35000,
    
    // Skills
    lagSpike: {
        cooldown: 400,
        duration: 60, // Logic duration for boss state (player effect is longer)
        // Phase 1 is shooting, Phase 2 is rollback handled by Player System
    },
    zFighting: {
        cooldown: 300,
        duration: 400, // Extended duration
        fireRate: 4,   // INCREASED RATE: Every 4 frames (was 5)
    },
    bsod: {
        cooldown: 500,
        wallDuration: 1800, // 30s
        wallCount: 8 
    },
    overflow: {
        cooldown: 700,
        range: 9999, // Effectively infinite
    }
};

export const BossGlitch = {
    update: (engine: IGameEngine, e: any, p: any, shootFn: Function) => {
        // --- INIT ---
        if (!e.maxHp) e.maxHp = e.hp;
        
        if (!e.customVars || typeof e.customVars.baseRadius !== 'number' || isNaN(e.customVars.baseRadius)) {
            e.customVars = {
                skillTimer: 0,
                activeSkill: null,
                subTimer: 0,
                baseRadius: (e.radius && e.radius > 10) ? e.radius : 70, 
                baseSpeed: e.config.speed || 4,
                dashCooldown: 0,
                skillStack: [], 
                moveAngle: 0, 
                targetAngle: 0,
                sineWavesCompleted: 0, 
                unstableCooldown: 0, 
                overflowState: 'none',
                spiralAngle: 0,
                tempWalls: [] // Store IDs of temp walls
            };
            e.radius = e.customVars.baseRadius;
        }

        e.stateTimer = (e.stateTimer || 0) + 1;
        
        // --- PASSIVE: UNSTABLE STATE ---
        if (e.customVars.unstableCooldown > 0) e.customVars.unstableCooldown--;
        
        if (e.isUnstable) {
            e.customVars.unstableTimer = (e.customVars.unstableTimer || 0) - 1;
            
            // Visual jitter while unstable
            e.x += (Math.random() - 0.5) * 5;
            e.y += (Math.random() - 0.5) * 5;

            if (e.customVars.unstableTimer <= 0) {
                e.isUnstable = false;
                e.customVars.unstableCooldown = 600; // 10s cooldown
            }
        }

        // --- SKILL CYCLE ---
        if (!e.customVars.activeSkill) {
            
            // IF UNSTABLE: Do not start new skills, just idle move
            if (e.isUnstable) {
                 // Idle movement (Jittery)
                 e.vx = (Math.random() - 0.5) * 2;
                 e.vy = (Math.random() - 0.5) * 2;
                 return;
            }

            // Normal Idle movement
            const angle = Math.atan2(p.y - e.y, p.x - e.x);
            e.vx += Math.cos(angle) * 0.5;
            e.vy += Math.sin(angle) * 0.5;
            
            // Friction
            e.vx *= 0.9;
            e.vy *= 0.9;
            
            // Choose skill
            if (e.stateTimer % 180 === 0) {
                // Refill stack if empty
                if (!e.customVars.skillStack || e.customVars.skillStack.length === 0) {
                    const pool = ['lag_spike', 'z_fighting', 'bsod', 'overflow'];
                    e.customVars.skillStack = pool
                        .map(value => ({ value, sort: Math.random() }))
                        .sort((a, b) => a.sort - b.sort)
                        .map(({ value }) => value);
                }

                const nextSkill = e.customVars.skillStack.pop();
                
                if (nextSkill === 'lag_spike') startLagSpike(engine, e, p);
                else if (nextSkill === 'z_fighting') startZFighting(engine, e);
                else if (nextSkill === 'bsod') startBSOD(engine, e, p);
                else startOverflow(engine, e);
            }
        } else {
            executeSkill(engine, e, p, shootFn);
        }
    }
};

function startLagSpike(engine: IGameEngine, e: any, p: any) {
    e.customVars.activeSkill = 'lag_spike';
    e.customVars.subTimer = 0;
    e.vx = 0; e.vy = 0; 
    spawnFloatingText(engine, e.x, e.y - 80, "Initiating Rollback...", "#22c55e", 'chat');
    
    // Spawn Tracking Stream (8 Missiles)
    const count = 8;
    const baseAngle = Math.atan2(p.y - e.y, p.x - e.x);
    // Wide Spread (~140 degrees)
    const spread = Math.PI * 0.8; 

    for (let i = 0; i < count; i++) {
        const proj = PoolUtils.getProjectile(engine);
        proj.x = e.x; 
        proj.y = e.y;
        proj.radius = 18;
        
        // Spread fan out
        const angle = baseAngle - spread/2 + (i / (count-1)) * spread;
        
        // Fast launch
        proj.vx = Math.cos(angle) * 12; 
        proj.vy = Math.sin(angle) * 12;
        
        proj.damage = 0; // ZERO DAMAGE - Pure mechanic
        proj.life = 300; 
        proj.isEnemy = true;
        proj.color = '#22c55e'; 
        proj.emoji = ''; 
        proj.text = '';
        proj.renderStyle = 'matrix_missile'; 
        proj.sourceType = 'glitch_lag_initiator'; 
        
        // Homing behavior
        proj.behaviors = ['homing', 'move_linear', 'decay_life', 'check_bounds'];
        proj.targetId = p.id; // Track player
        proj.trailHistory = []; // Initialize for ribbon render
        
        proj.active = true;
        
        engine.state.projectiles.push(proj);
    }
    // FIX: Removed setTimeout, logic handled in executeSkill
}

function startZFighting(engine: IGameEngine, e: any) {
    e.customVars.activeSkill = 'z_fighting';
    e.customVars.subTimer = 0;
    spawnFloatingText(engine, e.x, e.y - 80, "Z-Fighting Error", "#a855f7", 'chat');
}

function startBSOD(engine: IGameEngine, e: any, p: any) {
    e.customVars.activeSkill = 'bsod';
    e.customVars.subTimer = 0;
    spawnFloatingText(engine, e.x, e.y - 80, "Firewall Blocking", "#f97316", 'chat');
    
    const count = CONFIG.bsod.wallCount;
    for (let i = 0; i < count; i++) {
        const gridSize = 200;
        const offsetX = (Math.floor(Math.random() * 7) - 3) * gridSize;
        const offsetY = (Math.floor(Math.random() * 7) - 3) * gridSize;
        const x = p.x + offsetX;
        const y = p.y + offsetY;
        const isHorizontal = i % 2 === 0;
        const w = isHorizontal ? 300 : 80;
        const h = isHorizontal ? 80 : 300;
        
        engine.state.zones.push({
            id: Math.random().toString(),
            x: x, y: y,
            radius: 50, 
            width: w,
            height: h,
            type: 'glitch_bsod_wall',
            life: CONFIG.bsod.wallDuration,
            maxLife: CONFIG.bsod.wallDuration,
            color: '#f97316',
            emoji: '',
            // @ts-ignore
            angle: isHorizontal ? 0 : Math.PI/2
        });
        
        if (i===0) engine.audio.play('ui_glitch_severe');
    }
    e.customVars.activeSkill = null;
}

function startOverflow(engine: IGameEngine, e: any) {
    e.customVars.activeSkill = 'overflow';
    e.customVars.subTimer = 0;
    // New Initial State: Pre-Cast (Charging)
    e.customVars.overflowState = 'pre_cast';
    spawnFloatingText(engine, e.x, e.y - 80, "MODULE LOADING...", "#facc15", 'chat');
}

function executeSkill(engine: IGameEngine, e: any, p: any, shootFn: Function) {
    e.customVars.subTimer++;
    const t = e.customVars.subTimer;

    // --- SKILL: LAG SPIKE (Wait for cast duration) ---
    if (e.customVars.activeSkill === 'lag_spike') {
        e.vx = 0; e.vy = 0;
        if (t > CONFIG.lagSpike.duration) {
            e.customVars.activeSkill = null;
        }
    }

    // --- SKILL: Z-FIGHTING (Chaotic Barrage with Fakes) ---
    else if (e.customVars.activeSkill === 'z_fighting') {
        e.vx = 0; e.vy = 0; // Stationary
        const { duration, fireRate } = CONFIG.zFighting;
        
        if (t % fireRate === 0) {
            // INCREASED DENSITY: 12 projectiles per volley
            const count = 12; 
            
            for(let i=0; i<count; i++) {
                const angle = Math.random() * Math.PI * 2;
                
                // ADJUSTED: Fake Probability 25% (was 50%)
                const isReal = Math.random() > 0.25;

                const proj = PoolUtils.getProjectile(engine);
                proj.x = e.x; proj.y = e.y;
                proj.radius = 12;
                proj.vx = Math.cos(angle) * 8;
                proj.vy = Math.sin(angle) * 8;
                proj.life = 180;
                proj.isEnemy = true;
                proj.sourceType = 'boss_glitch';
                proj.active = true;
                
                if (isReal) {
                    proj.damage = 15;
                    proj.color = '#ef4444'; // Solid Red
                    proj.emoji = '';
                    proj.text = '';
                    proj.isFake = false;
                } else {
                    proj.damage = 0;
                    proj.color = '#ef4444'; // Red but will be transparent
                    proj.emoji = '';
                    proj.text = '';
                    proj.isFake = true; 
                }
                
                engine.state.projectiles.push(proj);
            }
        }
        
        if (t > duration) {
            e.customVars.activeSkill = null;
        }
    }

    // --- SKILL: OVERFLOW (PreCast -> Center -> Expand -> Warn -> Suck) ---
    else if (e.customVars.activeSkill === 'overflow') {
        const state = e.customVars.overflowState;
        
        // Safety Watchdog: If stuck in this skill for > 35 seconds, force reset
        if (t > 2100) {
             console.warn("Boss Overflow Failsafe Triggered - Resetting State");
             e.customVars.activeSkill = null;
             e.radius = e.customVars.baseRadius;
             e.customVars.overflowState = 'none';
             return;
        }

        // 0. PRE-CAST: Charge up before moving (Warning Time)
        if (state === 'pre_cast') {
            e.vx = 0; e.vy = 0;
            if (e.customVars.subTimer > 100) { // ~1.6s charge
                e.customVars.overflowState = 'centering';
                e.customVars.subTimer = 0;
            }
        }

        // 1. CENTER: Move to MAP Center (0,0) for arena control
        else if (state === 'centering') {
            const tx = 0;
            const ty = 0;
            const dx = tx - e.x;
            const dy = ty - e.y;
            const dist = Math.hypot(dx, dy);
            
            // Move fast
            if (dist > 20) {
                e.vx = (dx / dist) * 35; // Increased speed
                e.vy = (dy / dist) * 35;
                // Apply velocity manually since physics engine might be skipped or fight it
                e.x += e.vx; 
                e.y += e.vy;
            } else {
                e.x = tx; e.y = ty; e.vx = 0; e.vy = 0;
                e.customVars.overflowState = 'expanding';
                e.customVars.subTimer = 0;
            }
        }
        
        // 2. EXPAND: Grow Size
        else if (state === 'expanding') {
            e.x = 0; e.y = 0; // Lock position
            e.radius = Math.min(250, e.radius + 8);
            if (e.radius >= 250) {
                e.customVars.overflowState = 'warning';
                e.customVars.subTimer = 0;
                
                // Spawn warning texts handled in renderer
                engine.audio.play('ui_glitch_severe');
                
                // --- TACTICAL: SPAWN U-SHAPE BUNKERS ---
                e.customVars.tempWalls = [];
                const bunkerCount = 6;
                const ringRadius = 600;
                
                for(let i=0; i<bunkerCount; i++) {
                    const angle = (i / bunkerCount) * Math.PI * 2;
                    const cx = Math.cos(angle) * ringRadius;
                    const cy = Math.sin(angle) * ringRadius;
                    
                    // 1. BASE WALL (Tangential)
                    const baseW = 180;
                    const baseH = 30;
                    const baseWallId = Math.random().toString();
                    e.customVars.tempWalls.push(baseWallId);
                    
                    engine.state.zones.push({
                        id: baseWallId,
                        x: cx, y: cy,
                        radius: 50,
                        width: baseW,
                        height: baseH,
                        type: 'glitch_bsod_wall',
                        life: 9999,
                        maxLife: 9999,
                        color: '#f97316',
                        emoji: '',
                        // @ts-ignore
                        angle: angle + Math.PI / 2
                    });

                    // 2. WING WALLS (Radial)
                    const wingLen = 140; 
                    const wingThick = 30;
                    const tanAngle = angle + Math.PI/2;
                    const tanX = Math.cos(tanAngle);
                    const tanY = Math.sin(tanAngle);
                    const offsetSide = baseW / 2 - wingThick / 2;
                    
                    const spawnWing = (dir: number) => {
                        const wingAngle = angle;
                        const wX = Math.cos(wingAngle);
                        const wY = Math.sin(wingAngle);
                        const startX = cx + (tanX * offsetSide * dir);
                        const startY = cy + (tanY * offsetSide * dir);
                        const wx = startX + wX * (wingLen/2 - baseH/2);
                        const wy = startY + wY * (wingLen/2 - baseH/2);
                        const wingId = Math.random().toString();
                        e.customVars.tempWalls.push(wingId);
                        
                        engine.state.zones.push({
                            id: wingId,
                            x: wx, y: wy,
                            radius: 40,
                            width: wingLen, 
                            height: wingThick,
                            type: 'glitch_bsod_wall',
                            life: 9999,
                            maxLife: 9999,
                            color: '#f97316',
                            emoji: '',
                            // @ts-ignore
                            angle: wingAngle
                        });
                    };
                    spawnWing(1); 
                    spawnWing(-1);
                }
            }
        }
        
        // 3. WARNING: Pause & Show Range (EXTENDED DURATION)
        else if (state === 'warning') {
            e.x = 0; e.y = 0; // Lock position
            // Wait 3.0 seconds (180 frames)
            if (e.customVars.subTimer > 180) {
                e.customVars.overflowState = 'sucking';
                e.customVars.subTimer = 0;
            }
        }
        
        // 4. SUCK: Full Screen Gravity + Pulse Wave
        else if (state === 'sucking') {
            e.x = 0; e.y = 0; // Lock position
            
            const dist = Math.hypot(p.x - e.x, p.y - e.y);
            const angle = Math.atan2(e.y - p.y, e.x - p.x);
            
            // A. Continuous Gravity (Exponential Falloff)
            const maxForce = 22; // Strong center
            const decayFactor = 350; 
            const force = maxForce / (1 + Math.pow(dist / decayFactor, 2.5));
            const finalForce = Math.max(0.1, force);

            p.vx += Math.cos(angle) * finalForce;
            p.vy += Math.sin(angle) * finalForce;
            
            // B. RIPPLE PULSE (Contraction Wave)
            const pulsePeriod = 60; // 1 second
            const waveProgress = (e.customVars.subTimer % pulsePeriod) / pulsePeriod; // 0 to 1
            const maxWaveRange = 1200; // Start far
            
            const currentWaveR = maxWaveRange * (1 - waveProgress * waveProgress);
            e.customVars.visualWaveRadius = currentWaveR;

            if (Math.abs(dist - currentWaveR) < 60 && waveProgress < 0.9) {
                const impulse = 1.5;
                p.vx += Math.cos(angle) * impulse;
                p.vy += Math.sin(angle) * impulse;
                if (engine.state.timeAlive % 10 === 0) {
                     spawnFloatingText(engine, p.x, p.y - 40, "▼", "#ffffff"); 
                }
            }

            // NEW DAMAGE LOGIC: DoT Aura (No Collision Damage)
            // Range: Inside or very close to boss
            const damageDist = 200; // Close range visual boundary
            if (dist < damageDist) {
                if (engine.state.timeAlive % 60 === 0) { // Once per second
                    // 2% Max HP Damage
                    const dmg = Math.ceil(p.maxHp * 0.02);
                    p.hp -= dmg;
                    spawnFloatingText(engine, p.x, p.y, `-${dmg}`, '#ef4444', 'damage');
                    spawnParticles(engine, p.x, p.y, '#ef4444', 5); // Blood effect
                    engine.audio.playHit();
                }
            }
            
            if (e.customVars.subTimer > 400) { 
                e.customVars.overflowState = 'shrinking';
                e.customVars.visualWaveRadius = 0; // Clear visual
            }
        }
        
        // 5. SHRINK: Transition
        else if (state === 'shrinking') {
            e.radius *= 0.9;
            
            // Clean up temporary walls
            if (e.customVars.tempWalls && e.customVars.tempWalls.length > 0) {
                engine.state.zones = engine.state.zones.filter(z => !e.customVars.tempWalls.includes(z.id));
                e.customVars.tempWalls = [];
            }

            if (e.radius < 20) {
                e.radius = 20; 
                e.customVars.activeSkill = 'underflow';
                e.customVars.overflowState = 'none';
                e.customVars.subTimer = 0;
                e.customVars.dashCount = 0;
                e.customVars.dashState = 'aiming';
                spawnFloatingText(engine, e.x, e.y, "Stack Underflow", "#22d3ee", 'chat');
            }
        }
    }

    // --- SKILL: UNDERFLOW (Dash) ---
    else if (e.customVars.activeSkill === 'underflow') {
        const dState = e.customVars.dashState;
        
        // 1. AIMING (Track Player)
        if (dState === 'aiming') {
            e.vx = 0; e.vy = 0;
            // Shorter aim time
            if (e.customVars.subTimer > 40) {
                e.customVars.dashState = 'locking';
                e.customVars.subTimer = 0;
                const angle = Math.atan2(p.y - e.y, p.x - e.x);
                e.customVars.dashAngle = angle;
                spawnFloatingText(engine, e.x, e.y - 30, "LOCK", "#ef4444");
                engine.audio.play('ui_static_tick');
            }
        }
        
        // 2. LOCKING (Freeze)
        else if (dState === 'locking') {
            e.vx = 0; e.vy = 0; // Ensure freeze
            if (e.customVars.subTimer > 20) {
                e.customVars.dashState = 'dashing';
                e.customVars.subTimer = 0;
                engine.audio.play('shoot_boss_glitch');
            }
        }
        
        // 3. DASHING (Sine Wave + Decay)
        else if (dState === 'dashing') {
            const maxSpeed = 18;
            const duration = 100; // 1.6s
            const progress = e.customVars.subTimer / duration; // 0 to 1
            
            const currentSpeed = maxSpeed * (1 - Math.pow(progress, 3)); 
            
            const angle = e.customVars.dashAngle;
            
            // Main direction
            let vx = Math.cos(angle) * currentSpeed;
            let vy = Math.sin(angle) * currentSpeed;
            
            // Sine wave offset (Perpendicular)
            const sineMag = 8 * (1 - progress); 
            const wave = Math.sin(progress * Math.PI * 6); 
            const perpX = -Math.sin(angle) * wave * sineMag;
            const perpY = Math.cos(angle) * wave * sineMag;
            
            e.vx = vx + perpX;
            e.vy = vy + perpY;
            e.x += e.vx; 
            e.y += e.vy;
            
            // Shoot SINE SHURIKEN sideways
            if (e.customVars.subTimer % 8 === 0) { 
                const spawnBullet = (a: number) => {
                    const proj = PoolUtils.getProjectile(engine);
                    proj.x = e.x; 
                    proj.y = e.y;
                    proj.radius = 25; // Large size
                    proj.vx = Math.cos(a) * 9;
                    proj.vy = Math.sin(a) * 9;
                    proj.damage = 12;
                    proj.life = 120;
                    proj.isEnemy = true;
                    proj.color = '#22d3ee'; // Cyan
                    proj.emoji = '';
                    proj.text = '';
                    proj.renderStyle = 'sine_shuriken'; // NEW STYLE TAG
                    proj.sourceType = 'boss_glitch';
                    proj.active = true;
                    proj.angle = a; // Pass angle for rotation logic
                    proj.trailHistory = []; // Init trail
                    engine.state.projectiles.push(proj);
                };
                
                spawnBullet(angle + Math.PI/2);
                spawnBullet(angle - Math.PI/2);
            }
            
            if (e.customVars.subTimer > duration) {
                e.customVars.dashState = 'rest';
                e.customVars.subTimer = 0;
            }
        }
        
        // 4. REST (Brief pause between dashes)
        else if (dState === 'rest') {
            e.vx = 0; e.vy = 0;
            // Increased rest time (2s)
            if (e.customVars.subTimer > 120) {
                e.customVars.dashCount++;
                if (e.customVars.dashCount >= 3) {
                    e.radius = e.customVars.baseRadius;
                    e.customVars.activeSkill = null;
                } else {
                    e.customVars.dashState = 'aiming';
                    e.customVars.subTimer = 0;
                }
            }
        }
    }
}
