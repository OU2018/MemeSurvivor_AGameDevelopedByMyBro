
import { IGameEngine } from "../../../types";
import { PlayerState } from "../player/PlayerState";
import { PlayerModifiers } from "../player/PlayerModifiers";
import { PlayerAbilities } from "../player/PlayerAbilities";
import { PlayerMovement } from "../player/PlayerMovement";
import { ShootingSystem } from "./ShootingSystem";
import { spawnParticles, spawnFloatingText } from "../utils";
import { MapSystem } from "./MapSystem";

export const PlayerSystem = {
    update: (engine: IGameEngine) => {
        const p = engine.state.player;

        // --- CHARM STATE LOGIC (Prioritize Control) ---
        if (p.charmTimer && p.charmTimer > 0) {
            p.charmTimer--;
            
            // Visuals
            if (p.charmTimer % 20 === 0) {
                spawnParticles(engine, p.x, p.y, '#f472b6', 1);
            }

            if (p.charmSourceId) {
                const source = engine.state.enemies.find(e => e.id === p.charmSourceId);
                if (source) {
                    // Force movement towards goddess
                    const angle = Math.atan2(source.y - p.y, source.x - p.x);
                    const forceSpeed = p.speed * 0.5; // Half speed walk
                    p.vx = Math.cos(angle) * forceSpeed;
                    p.vy = Math.sin(angle) * forceSpeed;
                    
                    p.x += p.vx;
                    p.y += p.vy;
                    
                    MapSystem.constrain(engine, p);
                } else {
                    // Source dead, break charm early
                    p.charmTimer = 0;
                }
            }

            if (p.charmTimer <= 0) {
                p.isCharmed = false;
                p.charmSourceId = undefined;
                p.charmImmunityTimer = 120; // 2 seconds immunity
                spawnFloatingText(engine, p.x, p.y - 60, "解除魅惑!", "#ffffff");
            }
            
            // Return early: Skip standard input/movement/shooting
            return;
        }

        // Immunity Tick
        if (p.charmImmunityTimer && p.charmImmunityTimer > 0) {
            p.charmImmunityTimer--;
        }

        // --- GLITCH ROLLBACK LOGIC ---
        if (p.customTimers['lag_rollback_timer'] && p.customTimers['lag_rollback_timer'] > 0) {
            p.customTimers['lag_rollback_timer']--;
            
            const timer = p.customTimers['lag_rollback_timer'];
            
            // --- REWIND ANIMATION (Last 0.5s / 30 frames) ---
            if (timer < 30 && p.customVars && p.customVars['lag_anchor']) {
                const anchor = p.customVars['lag_anchor'];
                if (anchor && typeof anchor.x === 'number' && !isNaN(anchor.x) && typeof anchor.y === 'number' && !isNaN(anchor.y)) {
                    // Linear Interpolation (Pull)
                    // Move 20% of the remaining distance per frame creates a zeno-like zoom
                    p.x += (anchor.x - p.x) * 0.2;
                    p.y += (anchor.y - p.y) * 0.2;
                    
                    // Kill physics momentum
                    p.vx = 0;
                    p.vy = 0;
                    
                    // Visuals: Trail
                    if (timer % 3 === 0) {
                        spawnParticles(engine, p.x, p.y, '#22d3ee', 1);
                    }
                }
            }

            // Execute Final Teleport Snap
            if (timer === 1) {
                if (p.customVars && p.customVars['lag_anchor']) {
                    const anchor = p.customVars['lag_anchor'];
                    
                    // Safety check for NaN or weird coordinates
                    if (anchor && typeof anchor.x === 'number' && !isNaN(anchor.x) && typeof anchor.y === 'number' && !isNaN(anchor.y)) {
                        
                        // Teleport Logic: Hard reset position
                        p.x = anchor.x;
                        p.y = anchor.y;
                        p.vx = 0; 
                        p.vy = 0;
                        
                        // CAMERA FIX: HARD SNAP (Prevents flying)
                        engine.state.camera.x = anchor.x;
                        engine.state.camera.y = anchor.y;
                        
                        // SAFETY: Grant i-frames to prevent cheap hits upon landing (0.3s = 18 frames)
                        p.invulnerableTime = 18; 
                        
                        // Visuals
                        spawnParticles(engine, p.x, p.y, '#ef4444', 30);
                        engine.audio.play('ui_glitch_severe');
                        spawnFloatingText(engine, p.x, p.y - 60, "ROLLBACK COMPLETE", "#ef4444", 'chat');
                    }
                }
            }
        }

        // 1. Input Check
        const isMoving = PlayerMovement.checkInput(engine);

        // 2. Core State Updates (Heat, Death)
        PlayerState.updateHeat(engine);
        if (PlayerState.checkDeath(engine)) return;

        // 3. Calculate Modifiers (Synergies & Abilities)
        const passiveMods = PlayerModifiers.calculate(engine);
        const abilityMods = PlayerAbilities.update(engine, isMoving);

        // Combine Multipliers
        const totalSpeedMult = passiveMods.attackSpeedMult * abilityMods.speedMult; 
        
        const totalAttackSpeedMult = passiveMods.attackSpeedMult * abilityMods.attackSpeedMult;

        // 4. Update Survival (Regen, Shield)
        PlayerState.updateSurvival(engine, passiveMods.synergyRegenBonus);

        // 5. Physics & Movement
        PlayerMovement.update(engine, isMoving, abilityMods.speedMult);

        // 6. Shooting Logic
        // Calculate total APS from base + flat + mult
        
        // Base APS from frames
        const baseAPS = 60 / Math.max(1, p.attackSpeed);
        
        // Total APS
        let totalAPS = baseAPS + (p.flatAttackSpeedBonus || 0) + passiveMods.synergyFlatAPS;
        totalAPS *= totalAttackSpeedMult;
        
        // Overclock multiplier handling
        if (p.isOverclocked) {
            totalAPS *= 2.0; 
        }

        // Calculate Interval
        const effectiveIntervalFrames = 60 / Math.max(0.1, totalAPS);
        
        // Input check for shooting
        const wantShoot = engine.settings.autoShoot || engine.keysPressed['mousedown'] || engine.joystickInput.isFiring;
        
        // Speech Pause Logic (9527)
        if (p.speechPauseTimer > 0) p.speechPauseTimer--;

        if (wantShoot && engine.state.timeAlive - p.lastShotTime >= effectiveIntervalFrames) {
            if (p.characterId === '9527' && p.speechPauseTimer > 0) {
                // Pause
            } else {
                // Calculate Projectile Speed Mult
                let projSpeedMult = 1.0;
                if (p.isOverclocked) projSpeedMult *= 1.2;
                
                ShootingSystem.shoot(
                    engine, 
                    projSpeedMult, 
                    passiveMods.synergyFlatProjectileSpeed, 
                    passiveMods.synergyExplosionRangeMult
                );
                p.lastShotTime = engine.state.timeAlive;
            }
        }

        // 7. Visuals
        PlayerState.updateVisuals(engine);
    }
};
