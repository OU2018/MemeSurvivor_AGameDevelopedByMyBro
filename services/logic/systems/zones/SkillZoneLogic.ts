
import { IGameEngine, Zone } from "../../../../types";
import { spawnFloatingText, spawnParticles } from "../../utils";
import { killEnemy, triggerBossTransition } from "../../battle/enemySystem";
import { BattleFormulas } from "../../battle/formulas";
import { GameEventType } from "../../events/events";

export const SkillZoneLogic = {
    handle: (engine: IGameEngine, z: Zone) => {
        const currentFrame = engine.state.timeAlive;

        // --- HOT COFFEE / BUG TRAIL (DoT Zones) ---
        // @ts-ignore
        if (z.type === 'coffee_puddle' || z.type === 'bug_trail') {
            if (currentFrame % 30 === 0) { // Every 0.5s
                // Calculate damage based on zone type
                let damage = 0;
                
                if (z.type === 'coffee_puddle') {
                    // Calculate Stacking Scaling for Coffee
                    // Count "Hot Coffee Splash" items
                    // Match items named '泼洒的热咖啡'
                    const coffeeItems = engine.state.player.items.filter(i => i === '泼洒的热咖啡').length;
                    
                    // Formula: Base 20% + (Stacks-1)*10% per second
                    // Since we tick every 0.5s, we take half of that.
                    const pctPerSec = 0.20 + (Math.max(0, coffeeItems - 1) * 0.10);
                    damage = Math.ceil(engine.state.player.maxHp * (pctPerSec / 2));
                    // Ensure at least 1 damage
                    damage = Math.max(1, damage);
                } 
                else if (z.type === 'bug_trail') {
                    // Use stored damage if available (from SummonSystem)
                    if (z.damage) {
                        damage = z.damage;
                    } else {
                        // Fallback if damage prop missing: 50% player damage per tick
                        damage = Math.ceil(BattleFormulas.getPlayerDamage(engine.state.player) * 0.5);
                    }
                }

                const color = z.type === 'coffee_puddle' ? '#fdba74' : '#22c55e';

                for (let k = engine.state.enemies.length - 1; k >= 0; k--) {
                    const e = engine.state.enemies[k];
                    if (e.hp <= 0) continue;

                    const dist = Math.hypot(e.x - z.x, e.y - z.y);
                    if (dist < z.radius + e.radius) {
                        e.hp -= damage;
                        engine.state.waveStats.damageDealt += damage;
                        
                        // Feedback only occasionally to prevent spam
                        if (Math.random() < 0.3) {
                            engine.emit(GameEventType.ENTITY_DAMAGED, { x: e.x, y: e.y, text: `-${damage}`, color: color, isCrit: false });
                        }

                        if (e.config.behavior === 'boss' && e.phase === 1 && e.hp <= 0) {
                             triggerBossTransition(engine, e);
                        } else if (e.hp <= 0) {
                             killEnemy(engine, k);
                        }
                    }
                }
            }
            return;
        }

        // --- TECH L6: BSOD ZONE (Blue Screen of Death) ---
        if (z.type === 'bsod') {
            // Pulse check every 5 frames to save perf
            if (currentFrame % 5 === 0) {
                for (let k = engine.state.enemies.length - 1; k >= 0; k--) {
                    const e = engine.state.enemies[k];
                    const dist = Math.hypot(e.x - z.x, e.y - z.y);
                    
                    if (dist < z.radius) {
                        // Logic Deletion
                        if (e.config.behavior !== 'boss') {
                            e.hp = 0; 
                            spawnFloatingText(engine, e.x, e.y, "DELETE", "#ffffff", 'chat');
                            killEnemy(engine, k);
                        } else {
                            // Boss Stun & Damage
                            if (currentFrame % 30 === 0) { // Throttle boss dmg
                                e.hp -= 50;
                                e.stunTimer = 60; // Hard stun
                                spawnFloatingText(engine, e.x, e.y, "FATAL ERROR", "#ffffff", 'chat');
                                if (e.phase === 1 && e.hp <= 0) triggerBossTransition(engine, e);
                            }
                        }
                    }
                }
            }
        }

        // --- MARKET ITEM: LIVE STREAM (带货直播间) ---
        if (z.type === 'live_stream') {
            // Check enemies inside
            for (let k = engine.state.enemies.length - 1; k >= 0; k--) {
                const e = engine.state.enemies[k];
                if (e.hp <= 0) continue;

                const dist = Math.hypot(e.x - z.x, e.y - z.y);
                if (dist < z.radius) {
                    // Slow Effect: 50%
                    e.vx *= 0.85; // Strong damping per frame
                    e.vy *= 0.85;
                    
                    // DoT: 20% Player Attack / Sec
                    if (currentFrame % 60 === 0) {
                        const dmg = Math.ceil(BattleFormulas.getPlayerDamage(engine.state.player) * 0.2);
                        e.hp -= dmg;
                        spawnFloatingText(engine, e.x, e.y - e.radius, `-${dmg}`, '#a855f7', 'damage');
                        
                        if (e.config.behavior === 'boss' && e.phase === 1 && e.hp <= 0) {
                             triggerBossTransition(engine, e);
                        } else if (e.hp <= 0) {
                             killEnemy(engine, k);
                        }
                    }
                }
            }
        }

        // --- FIREWALL WAVE (404 屏障) & SLACKER WAVE (摸鱼部4件套) ---
        if (z.type === 'firewall_wave' || z.type === 'slacker_wave') {
            const progress = 1 - (z.life / (z.maxLife || 1));
            const currentRadius = z.radius * progress;
            const isSlacker = z.type === 'slacker_wave';
            
            // 1. Clear Bullets (Firewall only)
            if (!isSlacker) {
                for (let j = engine.state.projectiles.length - 1; j >= 0; j--) {
                    const proj = engine.state.projectiles[j];
                    if (proj.isEnemy) {
                        const dist = Math.hypot(proj.x - z.x, proj.y - z.y);
                        if (dist < currentRadius) {
                            engine.state.projectiles.splice(j, 1);
                            spawnParticles(engine, proj.x, proj.y, '#3b82f6', 2); 
                        }
                    }
                }
            }

            // 2. Push Enemies (Both)
            // Reverse loop for safe deletion
            for (let k = engine.state.enemies.length - 1; k >= 0; k--) {
                const e = engine.state.enemies[k];
                if (e.config.behavior === 'boss') continue;
                
                const dx = e.x - z.x;
                const dy = e.y - z.y;
                const dist = Math.hypot(dx, dy);
                
                // Interaction Band: Near the expanding edge
                if (dist < currentRadius && dist > currentRadius - 100) {
                    const force = isSlacker ? 3.0 : 2.0; 
                    if (dist > 0) {
                        e.vx += (dx / dist) * force;
                        e.vy += (dy / dist) * force;
                        // Apply Stun/Slow
                        e.stunTimer = isSlacker ? 5 : 2; 
                    }
                    
                    // Slacker Wave Damage (Every 5 ticks per enemy to prevent instant melt)
                    if (isSlacker && engine.state.timeAlive % 5 === 0) {
                        const dmg = BattleFormulas.getPlayerDamage(engine.state.player) * 0.5; // 50% damage tick
                        e.hp -= dmg;
                        engine.state.waveStats.damageDealt += dmg;
                        
                        // Check death
                        if (e.hp <= 0) {
                            killEnemy(engine, k);
                        } else {
                            // Show damage text only occasionally
                            if (Math.random() < 0.3) {
                                spawnFloatingText(engine, e.x, e.y, `-${Math.floor(dmg)}`, '#4ade80', 'damage');
                            }
                        }
                    }
                }
            }
        }
    }
};
