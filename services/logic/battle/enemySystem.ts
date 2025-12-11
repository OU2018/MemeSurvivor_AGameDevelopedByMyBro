
import { IGameEngine } from "../../../types";
import { BattleFormulas } from "./formulas";
import { SkillSystem } from "./skillSystem";
import { EliteManager } from "./special/EliteManager";
import { EliteHR } from "./special/EliteHR";
import { SpatialHashGrid } from "../utils/SpatialGrid";
import { MapSystem } from "../systems/MapSystem";
import { spawnFloatingText } from "../utils";

// Import systems
import { EnemySpawner } from "./systems/EnemySpawner";
import { EnemyDeath } from "./systems/EnemyDeath";
import { EnemyAttack } from "./systems/EnemyAttack";
import { EnemyPhysics } from "./systems/EnemyPhysics";

// --- Re-export for compatibility with other modules ---
export const spawnEnemy = EnemySpawner.spawnEnemy;
export const spawnSingleBullet = EnemySpawner.spawnSingleBullet;
export const triggerBossTransition = EnemyDeath.triggerBossTransition;
export const killEnemy = EnemyDeath.killEnemy;

/**
 * 主循环：敌人逻辑指挥官
 * 负责按顺序调度各个子系统，保持逻辑清晰
 * 优化：引入分帧计算 (Time Slicing) 和距离 LOD
 */
export function updateEnemies(engine: IGameEngine) {
    const p = engine.state.player;
    const dmgMult = BattleFormulas.getEnemyDamageMultiplier(
        engine.state.difficultyId,
        engine.state.currentWave,
        engine.state.isEndless,
        engine.state.endlessWaveCount
    );
    const hasBrainDrain = p.items.includes('降智光环');
    const isFrozen = engine.state.isDebugFrozen; 
    const currentFrame = engine.state.timeAlive;
    
    // --- OPTIMIZATION: BUILD SPATIAL GRID ONCE ---
    const grid = new SpatialHashGrid(400); 
    grid.insertAll(engine.state.enemies);
    // -------------------------------------------

    // Clean up dead enemies efficiently
    // Loop backwards for safe removal
    for (let i = engine.state.enemies.length - 1; i >= 0; i--) {
        const e = engine.state.enemies[i];

        // CRITICAL FIX: Null check to prevent crashes if array was modified externally
        if (!e) continue;

        // Update Flash Timer
        if (e.hitFlashTimer && e.hitFlashTimer > 0) {
            e.hitFlashTimer--;
        }

        // --- DEBUG FREEZE LOGIC ---
        if (isFrozen) {
            e.vx *= 0.8;
            e.vy *= 0.8;
            // Still check collision to prevent stacking
            EnemyPhysics.checkSoftCollisions(engine, e, grid);
            e.x += e.vx;
            e.y += e.vy;
            continue;
        }

        // --- MARKET (4): ANXIETY LOGIC (DoT) ---
        if (e.anxietyTimer && e.anxietyTimer > 0) {
            e.anxietyTimer--;
            
            // DoT: Every 1 second (60 frames)
            if (e.anxietyTimer % 60 === 0 && e.hp > 0) {
                const isBoss = e.config.behavior === 'boss';
                // 5% current HP for normal, 2.5% for boss
                const percent = isBoss ? 0.025 : 0.05;
                const damage = Math.max(1, Math.floor(e.hp * percent));
                
                e.hp -= damage;
                e.hitFlashTimer = 3; // Visual feedback for DoT
                engine.state.waveStats.damageDealt += damage;
                
                // Purple text for Anxiety Damage
                spawnFloatingText(engine, e.x, e.y - e.radius, `-${damage}`, '#a855f7', 'damage', e.id);
                
                if (e.hp <= 0) {
                    // Trigger death (and potential corpse explosion from Market L6)
                    EnemyDeath.killEnemy(engine, i);
                    continue; // Skip rest of logic for this dead enemy
                }
            }
        }

        // --- 0. LOD & THROTTLING DECISION ---
        const idHash = e.id.charCodeAt(e.id.length - 1) + e.id.charCodeAt(e.id.length - 2);
        
        const distToPlayer = Math.hypot(e.x - p.x, e.y - p.y);
        const isFar = distToPlayer > 1300; 
        const isBoss = e.config.behavior === 'boss' || e.config.tier === 'boss';
        const isElite = e.config.tier === 'epic' || e.config.type === 'elite_manager' || e.config.type === 'elite_hr';
        const isSpecialState = e.isThrown || e.captureState || e.isTransitioning || e.isAimingDash || e.config.behavior === 'circle';

        let runAI = false;
        let runCollision = false;

        if (isBoss || isElite || isSpecialState || e.config.type === 'leech') {
            // Priority 1: Critical Entities -> Every Frame
            // Added Leech here to ensure drain ticks smoothly
            runAI = true;
            runCollision = true;
        } else if (isFar) {
            // Priority 3: Far Entities -> Every 15 Frames
            runAI = (currentFrame + idHash) % 15 === 0;
            runCollision = false; 
        } else {
            // Priority 2: Near Entities -> Every 3 Frames
            runAI = (currentFrame + idHash) % 3 === 0;
            runCollision = runAI;
        }

        // --- 1. CRITICAL SKILLS (Must run before Physics/Return) ---
        // Leech logic needs to run to handle DoT even if latched (physics will skip movement later)
        if (runAI && e.config.type === 'leech') {
            SkillSystem.handleLeechCombat(engine, e, p);
        }

        // --- 2. HIGH PRIORITY PHYSICS (Always Run) ---
        if (EnemyPhysics.handleCaptureState(engine, e)) {
            continue; 
        }

        if (EnemyPhysics.updateThrownState(engine, e, p, dmgMult)) {
            continue; 
        }

        // --- 3. LOGIC UPDATES (Throttled) ---
        if (runAI) {
            // A. Skills & Special Behaviors
            // (Leech moved up)
            SkillSystem.handleTianGouPounce(engine, e, p); // TIAN GOU
            SkillSystem.handleSpawner(engine, e, EnemySpawner.spawnEnemy);
            SkillSystem.handleSupportHeal(engine, e);
            SkillSystem.handleLemonTrail(engine, e);
            SkillSystem.handleCyberGoddess(engine, e);
            SkillSystem.handleClownBalloon(engine, e, p, EnemySpawner.spawnEnemy);
            SkillSystem.handleDevourer(engine, e, p);
            
            // B. Elite/Boss AI
            if (e.config.type === 'elite_manager') {
                EliteManager.update(engine, e, p, EnemySpawner.spawnSingleBullet);
            }
            if (e.config.type === 'elite_hr') {
                EliteHR.update(engine, e, p, dmgMult);
            }
            
            // C. Boss Transition
            if (EnemyPhysics.handleBossTransition(engine, e)) {
                continue;
            }

            // D. Stun
            if (SkillSystem.handleStun(engine, e)) {
                continue; 
            }

            // E. Attack Logic
            EnemyAttack.handleBurstQueue(engine, e, p);
            if (e.config.type === 'keyboard_man' && e.burstQueue?.length > 0) {
                continue; 
            }
            
            // F. Orbit
            if (SkillSystem.handleOrbit(engine, e)) continue;

            // G. Movement Decision (Pathfinding/Steering)
            const dx = p.x - e.x;
            const dy = p.y - e.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            // Skip standard pathfinding for special dash states AND ELITES WHO HAVE CUSTOM MOVEMENT
            const isTianGouBusy = e.config.type === 'tian_gou' && (e.subState === 'charging' || e.subState === 'pounce');
            const isLeechBusy = e.config.type === 'leech' && (e.subState === 'charging' || e.subState === 'pounce' || e.captureState === 'latched');
            const isEliteManager = e.config.type === 'elite_manager';
            const isEliteHR = e.config.type === 'elite_hr';
            const isDevourer = e.config.behavior === 'devourer'; // Capital Crocodile

            if (isTianGouBusy || isLeechBusy) {
                // Physics updated here manually because updateMovement would overwrite the dash velocity
                if (e.subState === 'pounce') {
                    e.x += e.vx;
                    e.y += e.vy;
                    MapSystem.constrain(engine, e);
                }
            } else if (isEliteManager || isEliteHR || isDevourer) {
                // Elites and Devourer handle their own movement via their specific update functions
                // Do not call generic updateMovement
            } else if (dist > 0) {
                EnemyPhysics.updateMovement(engine, e, p, dist, dx, dy, hasBrainDrain);
            }

            // H. Attack Decision
            EnemyAttack.performEnemyAttack(engine, e, p, dist);

        } else {
            // --- LIGHTWEIGHT UPDATE (Inertia) ---
            if ((e.stunTimer || 0) <= 0 && !e.isTransitioning) {
                e.x += e.vx;
                e.y += e.vy;
                
                // Map constraints (Replaced by MapSystem Logic inside updateMovement but here we do lightweight check)
                MapSystem.constrain(engine, e);
            }
        }

        // --- 4. COLLISION (Throttled) ---
        if (runCollision) {
            EnemyPhysics.checkSoftCollisions(engine, e, grid);
        }
    }
}
