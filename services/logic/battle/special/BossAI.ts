
import { IGameEngine } from "../../../../types";
import { spawnFloatingText, spawnParticles } from "../../utils";
import { CONFIG } from "./ai/BossAIConfig";
import { Phase1 } from "./ai/BossAIPhase1";
import { Phase2 } from "./ai/BossAIPhase2";

export const BossAI = {
    update: (engine: IGameEngine, e: any, p: any, shootFn: Function) => {
        // 1. Initialization
        if (!e.customVars) initVars(e);
        e.stateTimer = (e.stateTimer || 0) + 1;

        // 2. Transition Logic (Cinematic Freeze)
        if (e.customVars.inCinematicTransition) {
            handleCinematicTransition(engine, e, p);
            return;
        }

        // 3. HP Threshold Check (Phase 1 -> Transition)
        // Transition when HP drops below 50%
        if (e.phase === 1 && e.hp / e.maxHp <= 0.5) {
            startTransition(engine, e);
            return;
        }

        // 4. Phase Dispatch (Only runs if not in cinematic pause)
        if (e.phase === 1) {
            Phase1.update(engine, e, p);
        } else if (e.phase === 2) {
            Phase2.update(engine, e, p);
        }
    }
};

function initVars(e: any) {
    e.customVars = {
        activeSkill: null,
        subTimer: 0,
        nodes: [], // Store Node IDs
        stormQueue: 0,
        cloneIds: [],
        skillCooldowns: {
            'storm': 300, // Delayed start
            'barrage': 60, // Starts soon
            'force_gc': 600, // P2 Skill
            'crash_dash': 300 // P2 Skill
        },
        
        // Building State Vars
        buildTimer: 0,
        buildMaxTime: CONFIG.phase1.buildTime,
        nodesToSpawn: 0, 
        nextSpawnLocation: null,
        
        // Combat Vars
        shootAngle: 0, 
        stormCharges: 0,
        streamAngle: 0,
        streamPattern: 'helix', // Default
        
        // Phase 2 Vars
        runawayAngle: 0,
        dashTarget: null,
        
        // Transition State
        inCinematicTransition: false,
        transitionTimer: 0,
        transitionPhase: 0, // 0: Silence, 1: Warn, 2: Critical, 3: Singularity
        popups: [], // Store popup data {x, y, title, text}
        whiteoutTimer: 0 // Visual flash timer
    };
}

function startTransition(engine: IGameEngine, e: any) {
    e.customVars.inCinematicTransition = true;
    e.customVars.transitionTimer = 600; // 10 seconds (60fps)
    e.customVars.transitionPhase = 0;
    e.customVars.popups = []; 
    
    // Freeze the world
    engine.state.cinematicPause = true;
    
    // Audio: Silence immediately
    engine.audio.stopBGM();
}

function handleCinematicTransition(engine: IGameEngine, e: any, p: any) {
    e.customVars.transitionTimer--;
    const T = 600 - e.customVars.transitionTimer; // Frames elapsed
    
    // Phase 0: Silence / Glitch Start (0s - 2s)
    if (T < 120) {
        if (T === 1) spawnFloatingText(engine, e.x, e.y - 100, "...", "#ffffff", 'chat');
        // Mild shake
        if (T % 10 === 0) {
            engine.state.camera.x += (Math.random() - 0.5) * 5;
            engine.state.camera.y += (Math.random() - 0.5) * 5;
        }
    }

    // Phase 1: System Warnings (2s - 6s)
    else if (T >= 120 && T < 360) {
        e.customVars.transitionPhase = 1;
        
        // Spawn Popups rapidly
        if (T % 12 === 0) { // Every 0.2s
            const titles = ["FATAL ERROR", "严重系统错误", "SYSTEM FAILURE", "内存溢出", "KERNEL PANIC", "致命异常"];
            const texts = ["Critical process died", "数据丢失", "Memory overflow", "禁止访问", "Reboot failed", "User not found"];
            
            if (!e.customVars.popups) e.customVars.popups = [];
            
            e.customVars.popups.push({
                x: 0.1 + Math.random() * 0.6, // Normalized Screen X (0.1-0.7)
                y: 0.1 + Math.random() * 0.6, // Normalized Screen Y
                title: titles[Math.floor(Math.random() * titles.length)],
                text: texts[Math.floor(Math.random() * texts.length)]
            });
            engine.audio.play('ui_typewriter'); // Beep sound
        }
        
        // Intensify Shake
        engine.state.camera.x += (Math.random() - 0.5) * 10;
        engine.state.camera.y += (Math.random() - 0.5) * 10;
    }

    // Phase 2: Critical Meltdown (6s - 9s)
    else if (T >= 360 && T < 540) {
        e.customVars.transitionPhase = 2;
        
        if (T === 360) {
             engine.audio.play('ui_glitch_severe'); // Start heavy static
        }
        
        // Extreme Shake
        engine.state.camera.x += (Math.random() - 0.5) * 20;
        engine.state.camera.y += (Math.random() - 0.5) * 20;
    }

    // Phase 3: Singularity / TV Off (9s - 10s)
    else {
        e.customVars.transitionPhase = 3;
        if (T === 540) {
            engine.audio.play('ui_power_down'); // Power down sound
        }
    }

    // End of Freeze
    if (e.customVars.transitionTimer <= 0) {
        e.customVars.inCinematicTransition = false;
        
        // Unfreeze world
        engine.state.cinematicPause = false;
        
        // Execute the explosion
        triggerUnleash(engine, e, p);
    }
}

function triggerUnleash(engine: IGameEngine, e: any, p: any) {
    e.phase = 2;
    e.stateTimer = 0;
    e.customVars.popups = []; // Clear UI
    
    // Trigger Whiteout Flash (Handled in renderUI)
    e.customVars.whiteoutTimer = 60; // 1 second fade out

    // 1. Visual & Audio Impact (THE DROP)
    spawnFloatingText(engine, e.x, e.y - 150, "SYSTEM BREACH", "#ef4444", 'chat');
    spawnFloatingText(engine, e.x, e.y - 120, "⚠ 限制解除 ⚠", "#ef4444", 'chat');
    
    // Massive Explosion Sound + Intense BGM
    engine.audio.play('explosion_cyber');
    engine.audio.playBattleBGM(); // Resume/Change music
    
    // 2. Shockwave Zone (Visual + Physics backup)
    engine.state.zones.push({
        id: Math.random().toString(),
        x: e.x, y: e.y,
        radius: 1500, // Global wipe
        type: 'explosion_shockwave',
        life: 60,
        maxLife: 60,
        color: '#ef4444',
        emoji: ''
    });
    
    // 3. CLEAR SCREEN (WIPE)
    // Remove all Enemy Projectiles
    engine.state.projectiles = engine.state.projectiles.filter(proj => !proj.isEnemy);
    
    // Kill all Minions (Except Boss)
    engine.state.enemies.forEach(en => {
        if (en.id !== e.id && en.hp > 0) {
            en.hp = 0;
            spawnParticles(engine, en.x, en.y, '#ef4444', 10);
        }
    });
    
    // CLEANUP: Specifically destroy Phase 1 nodes
    if (e.customVars.nodes) {
        // Force kill logic for any remaining nodes that might have been missed
        // (Though general enemy wipe above handles it, explicit check handles references)
        e.customVars.nodes = [];
    }
    
    // 4. KNOCKBACK PLAYER (Forceful)
    const angle = Math.atan2(p.y - e.y, p.x - e.x);
    p.vx += Math.cos(angle) * 40;
    p.vy += Math.sin(angle) * 40;
    p.stunTimer = 45; 
    
    // 5. Massive Screen Shake
    engine.state.camera.x += (Math.random() - 0.5) * 100;
    engine.state.camera.y += (Math.random() - 0.5) * 100;

    // 6. Cleanup Phase 1 Zones
    engine.state.zones = engine.state.zones.filter(z => z.type !== 'ai_laser_link' && z.type !== 'laser_beam');
    
    // 7. ENTER INTRO ROAR STATE (Buffer)
    e.customVars.activeSkill = 'intro_roar';
    e.customVars.subTimer = 0;
    
    // Initial Momentum push for Boss (Drift start)
    const driftAngle = Math.random() * Math.PI * 2;
    e.vx = Math.cos(driftAngle) * 15;
    e.vy = Math.sin(driftAngle) * 15;
}
