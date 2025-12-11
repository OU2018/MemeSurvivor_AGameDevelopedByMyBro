
import { IGameEngine } from "../../../../../types";
import { spawnFloatingText, emitParticles, PoolUtils, spawnParticles } from "../../../utils";
import { MapSystem } from "../../../systems/MapSystem";
import { CONFIG } from "./BossAIConfig";
import { CHARACTERS } from "../../../../../data/events";
import { BossMimicry } from "./BossMimicry";

// Character ID list for morphing
const MORPH_TARGETS = ['9527', '007', '1024', 'ev_creator'];

export const Phase2 = {
    update: (engine: IGameEngine, e: any, p: any) => {
        // --- INIT VARS FOR PHASE 2 ---
        if (e.customVars.lastLeakHp === undefined) {
            e.customVars.lastLeakHp = e.hp;
        }

        // --- 0. INTRO ROAR (P2 START BUFFER) ---
        if (e.customVars.activeSkill === 'intro_roar') {
            handleIntroRoar(engine, e);
            return; // Skip normal logic
        }

        // --- PASSIVE: DEAD PIXELS (Visual Entropy) ---
        if (engine.state.timeAlive % 5 === 0) {
            const angle = Math.random() * Math.PI * 2;
            const dist = e.radius * (0.8 + Math.random() * 0.4);
            emitParticles(engine, {
                x: e.x + Math.cos(angle) * dist,
                y: e.y + Math.sin(angle) * dist,
                color: '#ef4444', // Red dead pixels
                count: 1,
                life: 60,
                speed: 1,
                size: 6,
                type: 'rect', // Square pixels
                alpha: 0.8,
                scaleDelta: -0.01
            });
        }

        // --- PASSIVE: DATA HEMORRHAGE (Green Matrix Arrows) ---
        // Long range, persistent threat
        // Only fire if NOT stunned and NOT dashing
        if (e.stunTimer <= 0 && (!e.customVars.activeSkill || e.customVars.activeSkill === 'none' || e.customVars.activeSkill === 'chaos_morph')) {
            if (e.stateTimer % CONFIG.phase2.leakRate === 0) {
                 const angle = Math.random() * Math.PI * 2;
                 const proj = PoolUtils.getProjectile(engine);
                 proj.x = e.x; proj.y = e.y;
                 proj.radius = 12;
                 // Faster and more chaotic
                 proj.vx = Math.cos(angle) * 8 + (Math.random()-0.5)*3;
                 proj.vy = Math.sin(angle) * 8 + (Math.random()-0.5)*3;
                 proj.damage = CONFIG.phase2.chaosDamage;
                 proj.life = 400; 
                 proj.isEnemy = true;
                 proj.color = '#22c55e'; // Green
                 proj.renderStyle = 'matrix_missile';
                 proj.active = true;
                 engine.state.projectiles.push(proj);
            }
        }

        // --- PASSIVE: MEMORY LEAK (5% HP Threshold) ---
        checkMemoryLeak(engine, e);
        
        standardUpdate(engine, e, p);
    }
};

function checkMemoryLeak(engine: IGameEngine, e: any) {
    const hpThreshold = e.maxHp * 0.05; // 5% of Max HP
    const hpLost = e.customVars.lastLeakHp - e.hp;

    if (hpLost >= hpThreshold) {
        e.customVars.lastLeakHp = e.hp; 
        
        spawnFloatingText(engine, e.x, e.y - e.radius - 40, "⚠ MEMORY LEAK ⚠", "#22c55e", 'chat');
        engine.audio.play('ui_glitch_minor');

        // Spawn Toxic Zone (PERMANENT)
        engine.state.zones.push({
            id: Math.random().toString(),
            x: e.x, 
            y: e.y,
            radius: 180,
            type: 'glitch_memory_leak',
            life: 999999, // PERMANENT
            maxLife: 999999,
            color: '#22c55e',
            emoji: ''
        });
    }
}

function standardUpdate(engine: IGameEngine, e: any, p: any) {
     if (e.customVars.activeSkill === 'chaos_morph') {
         handleChaosMorph(engine, e, p);
     } 
     else if (e.customVars.activeSkill === 'crash_dash') {
         handleCrashDash(engine, e, p);
     }
     else if (!e.customVars.activeSkill) {
         // Movement & Selection
         handleMovementAndSelection(engine, e, p);
     }
}

function handleMovementAndSelection(engine: IGameEngine, e: any, p: any) {
    // 1. MOVEMENT PHYSICS (Random Wander)
    if (!e.customVars.wanderTarget) {
        const margin = 200;
        e.customVars.wanderTarget = {
            x: (Math.random() - 0.5) * (engine.state.mapWidth - margin),
            y: (Math.random() - 0.5) * (engine.state.mapHeight - margin)
        };
    }
    
    if (e.stateTimer % 120 === 0) {
        e.customVars.wanderTarget = null;
    }

    if (e.customVars.wanderTarget) {
        const dx = e.customVars.wanderTarget.x - e.x;
        const dy = e.customVars.wanderTarget.y - e.y;
        const dist = Math.hypot(dx, dy);
        const accel = CONFIG.phase2.moveAcceleration * 0.5;
        
        if (dist > 50) {
            e.vx += (dx / dist) * accel;
            e.vy += (dy / dist) * accel;
        } else {
            e.customVars.wanderTarget = null; 
        }
    }
    
    // Glitch Teleport (Rarely)
    if (Math.random() < 0.005) { 
        const blinkDist = 150;
        const angle = Math.random() * Math.PI * 2;
        spawnParticles(engine, e.x, e.y, '#ef4444', 10); 
        e.x += Math.cos(angle) * blinkDist;
        e.y += Math.sin(angle) * blinkDist;
        spawnParticles(engine, e.x, e.y, '#ef4444', 10); 
        engine.audio.play('ui_glitch_minor');
    }
    
    const maxSpeed = CONFIG.phase2.maxSpeed; 
    const speed = Math.hypot(e.vx, e.vy);
    if (speed > maxSpeed) {
        e.vx = (e.vx / speed) * maxSpeed;
        e.vy = (e.vy / speed) * maxSpeed;
    }

    e.x += e.vx;
    e.y += e.vy;
    
    if (MapSystem.constrain(engine, e)) {
        e.vx *= -0.5;
        e.vy *= -0.5;
    }

    // 2. COOLDOWN & SKILL SELECTION
    const morphCD = e.customVars.skillCooldowns['chaos_morph'] || 0;
    if (morphCD > 0) e.customVars.skillCooldowns['chaos_morph']--;

    const crashDashCD = e.customVars.skillCooldowns['crash_dash'] || 0;
    if (crashDashCD > 0) e.customVars.skillCooldowns['crash_dash']--;

    // Selection
    if (!e.customVars.activeSkill) {
        // High priority check for Crash Dash (Rare but high impact)
        // 5% chance per frame if ready (~ every 3-4 seconds after CD)
        if (crashDashCD <= 0 && Math.random() < 0.02) { 
             e.customVars.activeSkill = 'crash_dash';
             e.customVars.subTimer = 0;
             e.customVars.dashAngle = 0;
             return;
        }

        if (morphCD <= 0) {
            e.customVars.activeSkill = 'chaos_morph';
            e.customVars.subTimer = 0;
            e.customVars.morphChar = null;
            spawnFloatingText(engine, e.x, e.y - 120, "⚠ IDENTITY OVERWRITE ⚠", "#facc15", 'chat');
            engine.audio.play('ui_typewriter');
        }
    }
}

// --- SKILL: INTRO ROAR ---
function handleIntroRoar(engine: IGameEngine, e: any) {
    e.customVars.subTimer++;
    e.vx *= 0.8; e.vy *= 0.8;
    e.x += e.vx; e.y += e.vy;
    
    const jitter = 5;
    e.x += (Math.random() - 0.5) * jitter;
    e.y += (Math.random() - 0.5) * jitter;

    if (e.customVars.subTimer % 10 === 0) spawnFloatingText(engine, e.x, e.y - 50, "⚠", "#ef4444");
    
    if (e.customVars.subTimer % 60 === 0) {
         spawnFloatingText(engine, e.x, e.y - 120, "⚠ 核心过载 ⚠", "#ef4444", 'chat');
         engine.audio.play('ui_static_tick');
    }

    if (e.customVars.subTimer > 120) { 
        e.customVars.activeSkill = null; 
        e.customVars.subTimer = 0;
    }
}

// --- SKILL: FATAL EXCEPTION DASH (BULLFIGHT) ---
function handleCrashDash(engine: IGameEngine, e: any, p: any) {
    e.customVars.subTimer++;
    const { aimDuration, lockDuration, dashSpeed, stunDuration } = CONFIG.phase2.crashDash;
    const timer = e.customVars.subTimer;

    // 1. AIMING (Track Player)
    if (timer < aimDuration) {
        e.vx = 0; e.vy = 0;
        const targetAngle = Math.atan2(p.y - e.y, p.x - e.x);
        e.customVars.dashAngle = targetAngle; // Continuously update
        
        if (timer === 1) {
             spawnFloatingText(engine, e.x, e.y - 100, "⚠ SYSTEM CRASH IMMINENT ⚠", "#ef4444", 'chat');
             engine.audio.play('ui_glitch_severe');
        }
    }
    // 2. LOCKING (Freeze Angle)
    else if (timer < aimDuration + lockDuration) {
        e.vx = 0; e.vy = 0;
        if (timer === aimDuration) {
             engine.audio.play('ui_static_tick');
             spawnFloatingText(engine, e.x, e.y - 80, "LOCKED", "#ef4444");
        }
    }
    // 3. DASHING
    else {
        if (timer === aimDuration + lockDuration) {
             // Launch
             const angle = e.customVars.dashAngle;
             e.vx = Math.cos(angle) * dashSpeed;
             e.vy = Math.sin(angle) * dashSpeed;
             engine.audio.play('neon_launch'); // Swoosh
             
             // Initial Screen Shake
             engine.state.camera.x += Math.cos(angle) * -10;
             engine.state.camera.y += Math.sin(angle) * -10;
        }
        
        // Move
        e.x += e.vx;
        e.y += e.vy;
        
        // Trail
        spawnParticles(engine, e.x, e.y, '#ef4444', 3);
        if (timer % 4 === 0) {
             // Digital debris
             spawnParticles(engine, e.x, e.y, '#ffffff', 1);
        }

        // Hit Player? (Deals damage)
        const dist = Math.hypot(e.x - p.x, e.y - p.y);
        if (dist < e.radius + p.radius + 20 && p.invulnerableTime <= 0) {
            p.hp -= 40; 
            p.vx += (e.vx * 1.5); // Knockback
            p.vy += (e.vy * 1.5);
            p.invulnerableTime = 30;
            spawnFloatingText(engine, p.x, p.y, "CRIT HIT!", "#ef4444", 'damage');
            engine.audio.playHit();
        }

        // WALL COLLISION CHECK
        const halfW = engine.state.mapWidth / 2 - e.radius;
        const halfH = engine.state.mapHeight / 2 - e.radius;
        
        if (e.x < -halfW || e.x > halfW || e.y < -halfH || e.y > halfH) {
            // HIT WALL -> STUN
            // Clamp position
            e.x = Math.max(-halfW, Math.min(halfW, e.x));
            e.y = Math.max(-halfH, Math.min(halfH, e.y));
            
            e.vx = 0; e.vy = 0;
            
            // Apply Stun
            e.stunTimer = stunDuration;
            e.customVars.activeSkill = null; 
            e.customVars.skillCooldowns['crash_dash'] = CONFIG.phase2.crashDash.cooldown;
            
            // Visuals
            engine.audio.playExplosion();
            engine.state.camera.x += (Math.random()-0.5) * 40;
            engine.state.camera.y += (Math.random()-0.5) * 40;
            spawnFloatingText(engine, e.x, e.y - 100, "FATAL ERROR: REBOOTING...", "#94a3b8", 'chat');
            
            // Particle Explosion
            spawnParticles(engine, e.x, e.y, '#ef4444', 30);
            
            // Blue Shockwave (BSOD)
            engine.state.zones.push({
                id: Math.random().toString(),
                x: e.x, y: e.y,
                radius: 350,
                type: 'explosion_shockwave',
                life: 30, maxLife: 30,
                color: '#3b82f6',
                emoji: ''
            });
        }
    }
}

// --- SKILL: CHAOS MORPH ---
function handleChaosMorph(engine: IGameEngine, e: any, p: any) {
    e.customVars.subTimer++;
    const t = e.customVars.subTimer;
    
    if (t > CONFIG.phase2.chaosMorphDuration) {
        e.customVars.activeSkill = null;
        e.customVars.skillCooldowns['chaos_morph'] = CONFIG.phase2.chaosMorphCooldown;
        e.stunTimer = 30; 
        spawnFloatingText(engine, e.x, e.y - 80, "REBOOTING...", "#ef4444", 'chat');
        engine.audio.play('ui_power_down');
        e.customVars.morphChar = null;
        e.customVars.isAiming = false;
        return;
    }

    const CYCLE_LENGTH = 210; 
    const LOADING_LENGTH = 30; 
    const cycleProgress = t % CYCLE_LENGTH;

    // 1. Loading
    if (cycleProgress < LOADING_LENGTH) {
        e.vx *= 0.9; e.vy *= 0.9;
        e.x += e.vx; e.y += e.vy;
        e.customVars.isAiming = false; 
        
        if (cycleProgress % 5 === 0) {
            const charId = MORPH_TARGETS[Math.floor(Math.random() * MORPH_TARGETS.length)];
            e.customVars.morphChar = charId;
        }
        
        if (cycleProgress === 1) {
            spawnFloatingText(engine, e.x, e.y - 80, "LOADING PROFILE...", "#ffffff", 'chat');
            engine.audio.play('ui_glitch_minor');
        }
    } 
    // 2. Stable Mimicry
    else {
        if (cycleProgress === LOADING_LENGTH) {
            engine.audio.play('ui_typewriter');
        }

        const currentChar = e.customVars.morphChar;
        const phaseTime = cycleProgress - LOADING_LENGTH; 

        // Random Movement (Spinning/Floating)
        const angle = e.stateTimer * 0.05 + Math.sin(t*0.1); 
        e.vx += Math.cos(angle) * 0.5;
        e.vy += Math.sin(angle) * 0.5;
        e.x += e.vx; e.y += e.vy;
        MapSystem.constrain(engine, e);

        // --- SHOOTING LOGIC ---
        
        if (currentChar === '9527') {
            // "Angry Spray" - Rapid fire spin
            // DOUBLE TAP: 2 bullets per shot for density
            if (phaseTime % 4 === 0) { 
                e.customVars.spinAngle = (e.customVars.spinAngle || 0) + 0.4; // Faster spin
                const baseAngle = e.customVars.spinAngle;
                const jitter = (Math.random() - 0.5) * 0.3; 
                BossMimicry.spawn9527Text(engine, e, baseAngle + jitter);
                BossMimicry.spawn9527Text(engine, e, baseAngle + jitter + Math.PI); // Backwards shot too
            }
        }
        else if (currentChar === '007') {
            // "Mad Bomber" - Continuous scatter
            // NO AIMING PAUSE. Just throw bombs while moving.
            if (phaseTime % 12 === 0) { 
                // Throw 3 bombs every 0.2s
                const count = 3; 
                for(let k=0; k<count; k++) {
                    const randomAngle = Math.random() * Math.PI * 2;
                    BossMimicry.spawn007Bomb(engine, e, randomAngle);
                }
            }
        }
        else if (currentChar === '1024') {
            // Spiral Pattern - 6 Arms
            if (phaseTime % 8 === 0) {
                const offset = phaseTime * 0.15;
                const count = 6; // Increased from 4
                for(let i=0; i<count; i++) {
                    const angle = offset + (i * Math.PI * 2 / count);
                    BossMimicry.spawn1024Code(engine, e, angle);
                }
            }
        }
        else if (currentChar === 'ev_creator') {
            // Chaos Swarm - Faster
            if (phaseTime % 10 === 0) {
                const randAngle = Math.random() * Math.PI * 2;
                BossMimicry.spawnEVCreatorError(engine, e, randAngle);
                // Double shot
                BossMimicry.spawnEVCreatorError(engine, e, randAngle + 0.2);
            }
        }
    }
}
