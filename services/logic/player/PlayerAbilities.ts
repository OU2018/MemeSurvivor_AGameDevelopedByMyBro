
import { IGameEngine } from "../../../types";
import { SynergyLogic } from "../synergyLogic";
import { SHOP_ITEMS } from "../../../data/items";
import { spawnParticles } from "../utils";
import { GameEventType } from "../events/events";
import { BulletFactory } from "../shooting/BulletFactory";
import { SummonFactory } from "../battle/systems/SummonFactory";

export const PlayerAbilities = {
    update: (engine: IGameEngine, isMoving: boolean) => {
        const p = engine.state.player;
        const counts = SynergyLogic.getSynergyCounts(p.items);
        const tiers = SynergyLogic.getActiveTiers(counts);

        // Modifiers to return
        let speedMult = 1.0;
        let attackSpeedMult = 1.0;

        // --- HR (6): PACMAN SUMMON ---
        if ((tiers['hr'] || 0) >= 6) {
            // Check if pacman exists
            const hasPacman = engine.state.projectiles.some(proj => proj.summonType === 'pacman');
            if (!hasPacman) {
                // Summon Pacman near player
                SummonFactory.createSummon(engine, 'hr_pacman', p.x, p.y);
                engine.emit(GameEventType.FLOATING_TEXT, { x: p.x, y: p.y - 80, text: "猎头进场!", color: "#facc15", category: 'chat' });
            }
        }

        // --- BOARD (6): NEON RAIN (Burst Volley) ---
        if ((tiers['board'] || 0) >= 6) {
            if (p.customTimers['board_missile'] === undefined) p.customTimers['board_missile'] = 0;
            if (p.customTimers['board_color_idx'] === undefined) p.customTimers['board_color_idx'] = 0;
            
            p.customTimers['board_missile']--;
            
            // Trigger check: Fire a volley every 4 seconds (240 ticks)
            if (p.customTimers['board_missile'] <= 0) {
                // Check if enemies exist.
                const enemies = engine.state.enemies.filter(e => !e.isTransitioning && e.hp > 0);
                
                if (enemies.length > 0) {
                    p.customTimers['board_missile'] = 240; // Reset Cooldown (4s)

                    // 1. Calculate Burst Count (Dynamic: 20 ~ 120)
                    // Rule: Max(20, Enemies * 4), capped at 120
                    const burstCount = Math.min(120, Math.max(20, enemies.length * 4));

                    // 2. TRIGGER VISUAL & SOUND (Ascension Effect)
                    // Instead of a ground zone, we set a visual timer on player
                    p.customTimers['neon_casting_visual'] = 100; // Lasts ~1.6s, covers launch
                    
                    engine.audio.play('neon_launch'); // New magical sound

                    // 3. Target Assignment
                    const targetData: {id: string, x: number, y: number}[] = [];
                    
                    // Sort enemies by distance (Farther first for visual impact)
                    enemies.sort((a, b) => {
                        const distA = Math.hypot(a.x - p.x, a.y - p.y);
                        const distB = Math.hypot(b.x - p.x, b.y - p.y);
                        return distB - distA;
                    });

                    for (let i = 0; i < burstCount; i++) {
                        const targetEnemy = enemies[i % enemies.length];
                        if (targetEnemy) {
                            // PREDICTION SNAPSHOT
                            const predX = targetEnemy.x + targetEnemy.vx * 20;
                            const predY = targetEnemy.y + targetEnemy.vy * 20;
                            
                            // Add slight scatter
                            const scatter = 40;
                            targetData.push({
                                id: targetEnemy.id,
                                x: predX + (Math.random() - 0.5) * scatter,
                                y: predY + (Math.random() - 0.5) * scatter
                            });
                        }
                    }

                    // Fire logic loop
                    const colors = ['#facc15', '#a855f7', '#22d3ee', '#ef4444', '#f97316']; 
                    
                    for(let i=0; i<targetData.length; i++) {
                        const t = targetData[i];
                        const currentColor = colors[p.customTimers['board_color_idx'] % colors.length];
                        p.customTimers['board_color_idx']++;

                        // Stagger delay: Compress 120 shots into about 1.5 seconds (90 frames)
                        const delay = Math.floor((i / burstCount) * 90); 
                        
                        // Pass targetId for dynamic tracking
                        BulletFactory.createNeonRain(engine, t.x, t.y, currentColor, delay, t.id);
                    }
                } else {
                    p.customTimers['board_missile'] = 60;
                }
            }
        }

        // --- SLACKER (6): BURST ---
        if (p.customTimers['slacker_energy'] === undefined) p.customTimers['slacker_energy'] = 0;
        if (p.customTimers['slacker_burst'] === undefined) p.customTimers['slacker_burst'] = 0;

        if ((tiers['slacker'] || 0) >= 6) {
            if (!isMoving) {
                if (p.customTimers['slacker_energy'] < 100) {
                    p.customTimers['slacker_energy'] += 1;
                    if (p.customTimers['slacker_energy'] === 100) {
                        engine.emit(GameEventType.FLOATING_TEXT, { x: p.x, y: p.y - 60, text: "能量满!", color: "#4ade80" });
                    }
                }
            } else {
                if (p.customTimers['slacker_energy'] > 30 && p.customTimers['slacker_burst'] <= 0) {
                    p.customTimers['slacker_burst'] = 180;
                    p.customTimers['slacker_energy'] = 0;
                    engine.emit(GameEventType.FLOATING_TEXT, { x: p.x, y: p.y - 60, text: "摸鱼冲刺!", color: "#4ade80", category: 'chat' });
                    engine.audio.playPowerup();
                    spawnParticles(engine, p.x, p.y, '#4ade80', 15);
                }
                
                if (p.customTimers['slacker_burst'] <= 0) {
                    p.customTimers['slacker_energy'] = Math.max(0, p.customTimers['slacker_energy'] - 2);
                }
            }

            if (p.customTimers['slacker_burst'] > 0) {
                p.customTimers['slacker_burst']--;
                speedMult *= 1.5;
                attackSpeedMult *= 2.0;
                
                if (engine.state.timeAlive % 5 === 0) {
                    spawnParticles(engine, p.x, p.y, '#4ade80', 1);
                }
            }
        }

        // --- SLACKER (4): STAND STILL FIELD ---
        if ((tiers['slacker'] || 0) >= 4) {
            if (!isMoving) {
                p.standStillTimer++;
                if (p.standStillTimer > 30) {
                    const auraRadius = 250;
                    engine.state.enemies.forEach(e => {
                        if (e.isTransitioning || e.config.behavior === 'boss') return;
                        const dist = Math.hypot(e.x - p.x, e.y - p.y);
                        if (dist < auraRadius) {
                            e.vx *= 0.8;
                            e.vy *= 0.8;
                            if (engine.state.timeAlive % 20 === 0 && Math.random() < 0.3) {
                                engine.emit(GameEventType.FLOATING_TEXT, { x: e.x, y: e.y - e.radius, text: "💤", color: "#4ade80" });
                            }
                        }
                    });

                    if (p.standStillTimer % 60 === 0) {
                        engine.state.zones.push({
                            id: Math.random().toString(),
                            x: p.x, y: p.y,
                            radius: 350,
                            type: 'slacker_wave',
                            life: 40,
                            maxLife: 40,
                            color: '#4ade80',
                            emoji: ''
                        });
                        engine.audio.play('ui_shield_break');
                    }
                }
            } else {
                p.standStillTimer = 0;
            }
        } else {
            // Track standstill anyway for item logic
            if (!isMoving) p.standStillTimer++;
            else p.standStillTimer = 0;
        }

        // --- ITEM HOOKS LOOP (REPLACES SPECIFIC CHECKS) ---
        SHOP_ITEMS.forEach(item => {
            // Execute hooks.onTick
            if (item.hooks?.onTick) {
                const tags = item.items || [item.title];
                const count = p.items.filter(i => tags.includes(i)).length;
                if (count > 0) {
                    item.hooks.onTick(engine, count);
                }
            }
            
            // Execute Legacy onTick (Backwards compatibility)
            if (item.onTick) {
                const tags = item.items || [item.title];
                const count = p.items.filter(i => tags.includes(i)).length;
                if (count > 0) {
                    item.onTick(engine, count);
                }
            }
        });

        return { speedMult, attackSpeedMult };
    }
};
