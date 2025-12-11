
import { IGameEngine } from "../../../../types";
import { spawnFloatingText, spawnParticles } from "../../utils";
import { PlayerHitHandler } from "../../systems/collision/PlayerHitHandler";
import { MapSystem } from "../../systems/MapSystem";

export const AggressiveSkills = {
    // --- TIAN GOU (舔狗): POUNCE AI ---
    handleTianGouPounce: (engine: IGameEngine, e: any, p: any) => {
        if (e.config.type !== 'tian_gou') return;

        // Init State
        if (!e.subState) e.subState = 'chase';
        if (!e.skillTimer) e.skillTimer = 0; // Use skillTimer for cooldown/charging

        const dist = Math.hypot(p.x - e.x, p.y - e.y);

        // 1. CHASE STATE
        if (e.subState === 'chase') {
            // If close enough and cooldown ready (skillTimer <= 0)
            if (dist < 250 && e.skillTimer <= 0) {
                e.subState = 'charging';
                e.skillTimer = 40; // 0.6s charge time
                e.vx = 0; 
                e.vy = 0; // Stop moving
            } else {
                // Regular movement handled in EnemyPhysics, just decrement cooldown
                if (e.skillTimer > 0) e.skillTimer--;
            }
        }
        
        // 2. CHARGING STATE (Pause before strike)
        else if (e.subState === 'charging') {
            e.skillTimer--;
            e.vx = 0; e.vy = 0; // Hard stop
            
            // Aiming visual handled in renderer
            if (e.skillTimer <= 0) {
                e.subState = 'pounce';
                e.skillTimer = 20; // Dash duration (0.3s)
                
                // Calculate dash vector
                const angle = Math.atan2(p.y - e.y, p.x - e.x);
                const dashSpeed = e.config.speed * 4.5; // Very fast
                e.vx = Math.cos(angle) * dashSpeed;
                e.vy = Math.sin(angle) * dashSpeed;
            }
        }

        // 3. POUNCE STATE (Dash)
        else if (e.subState === 'pounce') {
            e.skillTimer--;
            // Velocity is already set, just let it fly
            // Simple particle trail
            if (engine.state.timeAlive % 3 === 0) {
                spawnParticles(engine, e.x, e.y, '#f472b6', 1);
            }

            if (e.skillTimer <= 0) {
                e.subState = 'chase';
                e.skillTimer = 120; // 2s Cooldown before next pounce
                e.vx *= 0.2; // Brake
                e.vy *= 0.2;
            }
        }
    },

    // --- E-04: THE LEECH (吸血鬼中介) - NEW COMBAT LOGIC ---
    handleLeechCombat: (engine: IGameEngine, e: any, p: any) => {
        if (e.config.type !== 'leech') return;

        // State Machine: Chase -> Charge -> Pounce -> Latched
        if (!e.subState) e.subState = 'chase';
        if (!e.skillTimer) e.skillTimer = 0;

        e.isOverflowing = false; 

        // 1. LATCHED STATE (Stuck to player)
        if (e.captureState === 'latched') {
            // Always show aura when latched to indicate active draining/healing
            e.isOverflowing = true;

            // Damage DoT (every 1.0s / 60 frames) - Slower frequency
            if (engine.state.timeAlive % 60 === 0) {
                const drainAmount = 5; // Reduced damage per tick
                const healAmount = 5; // Slower healing
                const healRange = 150; // Smaller range
                
                // Deal Damage
                PlayerHitHandler.damagePlayer(engine, drainAmount, 'leech_bite');
                spawnFloatingText(engine, p.x, p.y - 40, "咬!", "#ef4444");
                spawnParticles(engine, p.x, p.y, '#ef4444', 3);

                // Heal Self (Regardless of full HP or not)
                if (e.hp < e.maxHp) {
                    e.hp = Math.min(e.maxHp, e.hp + healAmount);
                    spawnFloatingText(engine, e.x, e.y - 20, `+${healAmount}`, "#22c55e", 'damage');
                }

                // Heal Surroundings (Simultaneously)
                let healedAlly = false;
                engine.state.enemies.forEach((ally: any) => {
                    if (ally !== e && ally.hp < ally.maxHp && ally.hp > 0) {
                        const dAlly = Math.hypot(ally.x - e.x, ally.y - e.y);
                        if (dAlly < healRange) { 
                            ally.hp = Math.min(ally.maxHp, ally.hp + healAmount);
                            healedAlly = true;
                            if (Math.random() < 0.2) {
                                spawnFloatingText(engine, ally.x, ally.y - 20, `+${healAmount}`, "#22c55e", 'damage');
                            }
                        }
                    }
                });
                
                if (healedAlly && Math.random() < 0.3) {
                    spawnFloatingText(engine, e.x, e.y - 50, "中介费!", "#ef4444", 'chat');
                }
            }
            return; // Skip movement logic (Physics handles locking)
        }

        // 2. CHASE / POUNCE LOGIC (Using Tian Gou AI structure)
        const dist = Math.hypot(p.x - e.x, p.y - e.y);

        if (e.subState === 'chase') {
            if (dist < 300 && e.skillTimer <= 0) {
                e.subState = 'charging';
                e.skillTimer = 30; // 0.5s windup (Reduced from 40)
                e.vx = 0; e.vy = 0;
                spawnFloatingText(engine, e.x, e.y - 30, "锁定!", "#ef4444");
            } else {
                // Regular movement handled in EnemyPhysics, just decrement cooldown
                if (e.skillTimer > 0) e.skillTimer--;
            }
        }
        else if (e.subState === 'charging') {
            e.skillTimer--;
            e.vx = 0; e.vy = 0; // Freeze while charging
            
            // Red flash visual
            if (e.skillTimer % 5 === 0) {
                // Can emit small particles or just rely on renderer color override
            }

            if (e.skillTimer <= 0) {
                e.subState = 'pounce';
                // Shorter but faster pounce for "snap" effect
                e.skillTimer = 20; // 0.33s dash duration
                const angle = Math.atan2(p.y - e.y, p.x - e.x);
                const dashSpeed = 25; // Very fast sprint
                e.vx = Math.cos(angle) * dashSpeed;
                e.vy = Math.sin(angle) * dashSpeed;
            }
        }
        else if (e.subState === 'pounce') {
            e.skillTimer--;
            
            // Phantom Trail Effect particles handled in Renderer, but add spark here
            if (engine.state.timeAlive % 2 === 0) {
                spawnParticles(engine, e.x, e.y, '#ef4444', 2);
            }

            if (e.skillTimer <= 0) {
                e.subState = 'chase';
                e.skillTimer = 90; // Cooldown
                e.vx *= 0.2; // Hard brake
                e.vy *= 0.2;
            }
        }
    },

    // --- CAPITAL CROCODILE: THE DEVOURER ---
    handleDevourer: (engine: IGameEngine, e: any, p: any) => {
        if (e.config.behavior !== 'devourer') return;

        // Init Storage (Bank Mechanic)
        if (e.storedValue === undefined) e.storedValue = 0;
        if (e.swallowCount === undefined) e.swallowCount = 0;
        
        // Init Visual Bounce for eating animation
        if (!e.customVars) e.customVars = {};
        if (e.customVars.visualBounce === undefined) e.customVars.visualBounce = 1.0;
        
        // Decay bounce
        if (e.customVars.visualBounce > 1.0) {
            e.customVars.visualBounce = Math.max(1.0, e.customVars.visualBounce - 0.03);
        }

        const EVOLUTION_THRESHOLD = 8;
        const isHunting = e.swallowCount >= EVOLUTION_THRESHOLD;

        // 1. Behavior Decision
        let targetX = e.x; 
        let targetY = e.y;
        let chaseSpeed = e.config.speed;

        if (isHunting) {
            // HUNTING PHASE
            targetX = p.x;
            targetY = p.y;
            // Slower, bigger
            const sizeFactor = Math.max(1, e.radius / 70);
            chaseSpeed = Math.max(0.5, e.config.speed / Math.sqrt(sizeFactor));
            
            if (engine.state.timeAlive % 120 === 0) {
                 spawnFloatingText(engine, e.x, e.y - e.radius - 20, "吞并!!!", "#ef4444", 'chat');
            }
        } else {
            // GATHERING PHASE: Look for nearest food
            let nearestPrey = null;
            let minDist = Infinity;
            
            // Scan for prey (Optimization: Check only valid targets)
            // Doing a full scan every frame is okay for 1-2 elites.
            for (const other of engine.state.enemies) {
                if (other === e || other.hp <= 0 || other.isTransitioning) continue;
                // Only eat non-boss, non-elite (unless huge)
                if (other.config.behavior === 'boss' || other.config.behavior === 'devourer' || other.config.tier === 'epic' || other.config.tier === 'boss') continue;
                
                const d = Math.hypot(other.x - e.x, other.y - e.y);
                if (d < minDist) {
                    minDist = d;
                    nearestPrey = other;
                }
            }

            if (nearestPrey) {
                targetX = nearestPrey.x;
                targetY = nearestPrey.y;
                chaseSpeed *= 1.2; // Faster when hungry
                
                if (engine.state.timeAlive % 60 === 0) {
                     spawnFloatingText(engine, e.x, e.y - e.radius - 20, "饿...", "#fbbf24");
                }
            } else {
                // NO PREY FOUND: AVOID PLAYER (Keep Distance)
                const distToPlayer = Math.hypot(e.x - p.x, e.y - p.y);
                const safeDistance = 800; 
                
                if (distToPlayer < safeDistance) {
                    // Flee Logic: Move vector away from player
                    const angleAway = Math.atan2(e.y - p.y, e.x - p.x);
                    targetX = e.x + Math.cos(angleAway) * 300;
                    targetY = e.y + Math.sin(angleAway) * 300;
                    chaseSpeed *= 1.1; // Panic run
                    
                    if (engine.state.timeAlive % 60 === 0) {
                        spawnFloatingText(engine, e.x, e.y - e.radius - 20, "避险...", "#94a3b8");
                    }
                } else {
                    // Wander Logic (Patrol)
                    const time = engine.state.timeAlive * 0.02 + (e.id.charCodeAt(0) % 100);
                    targetX = e.x + Math.cos(time) * 100;
                    targetY = e.y + Math.sin(time) * 100;
                    chaseSpeed *= 0.5; // Idle speed
                }
            }
        }

        // Apply Movement
        const angle = Math.atan2(targetY - e.y, targetX - e.x);
        e.vx += (Math.cos(angle) * chaseSpeed - e.vx) * 0.05; // Inertia
        e.vy += (Math.sin(angle) * chaseSpeed - e.vy) * 0.05;
        e.x += e.vx;
        e.y += e.vy;

        // Apply Constraints
        MapSystem.constrain(engine, e);

        // 2. Devour Logic (SMOOTH SUCTION - Runs EVERY Frame)
        const maxSwallow = 50;
        if (e.swallowCount >= maxSwallow) return;

        const suckRange = e.radius + 220; 
        const eatRange = e.radius + 20;   
        
        let eatenThisTick = 0;
        const maxEatPerTick = 2; // Limit per frame to avoid lag

        // Iterate backwards to allow safe removal
        for (let i = engine.state.enemies.length - 1; i >= 0; i--) {
            if (eatenThisTick >= maxEatPerTick) break;
            
            const prey = engine.state.enemies[i];
            
            // Skip self, invalid, or other elites
            if (prey === e || prey.hp <= 0 || prey.isTransitioning) continue;
            if (prey.config.behavior === 'boss' || prey.config.behavior === 'devourer') continue;
            if (prey.config.tier === 'epic' || prey.config.tier === 'boss') continue;

            const dx = prey.x - e.x;
            const dy = prey.y - e.y;
            const dist = Math.hypot(dx, dy);

            // Suction Zone
            if (dist < suckRange) {
                // SMOOTH PULL: Lerp towards center
                const pullStrength = 0.15; // Smooth pull factor
                prey.x += (e.x - prey.x) * pullStrength;
                prey.y += (e.y - prey.y) * pullStrength;
                
                // Kill prey's physics velocity to prevent jitter/fighting
                prey.vx *= 0.5;
                prey.vy *= 0.5;
                prey.stunTimer = 2; // Micro-stun to disable its AI movement
                
                // Eat Zone
                if (dist < eatRange) {
                    // --- BANKING LOGIC ---
                    const value = (prey.config.score || 5);
                    
                    e.storedValue += value;
                    e.swallowCount++;
                    
                    // Heal Crocodile & Growth
                    const healAmount = Math.floor(e.maxHp * 0.2); // Heal 20% MaxHP
                    e.maxHp = Math.floor(e.maxHp * 1.05); // Increase MaxHP 5%
                    e.hp = Math.min(e.maxHp, e.hp + healAmount); 
                    
                    // Grow (Max 350 radius)
                    e.radius = Math.min(350, e.radius + 2);
                    
                    // Visual Feedback: Bounce & Particle
                    e.customVars.visualBounce = 1.25; 
                    
                    // Remove Prey directly
                    engine.state.enemies.splice(i, 1);
                    
                    spawnParticles(engine, prey.x, prey.y, '#ef4444', 8); // Blood splash
                    eatenThisTick++;
                }
            }
        }

        if (eatenThisTick > 0) {
            spawnFloatingText(engine, e.x, e.y - e.radius, `吞噬 x${eatenThisTick}`, "#fbbf24", 'chat');
        }
    }
};
