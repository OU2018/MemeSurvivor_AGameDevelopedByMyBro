
import { IGameEngine } from "../../../types";
import { CHARACTERS } from "../../../data/events";
import { SynergyLogic } from "../synergyLogic";
import { spawnFloatingText, spawnParticles } from "../utils";
import { GameEventType } from "../events/events";

export const PlayerState = {
    updateHeat: (engine: IGameEngine) => {
        const p = engine.state.player;
        const counts = SynergyLogic.getSynergyCounts(p.items);
        const tiers = SynergyLogic.getActiveTiers(counts);

        // Hardcore (6): Overclock Mechanic
        if ((tiers['hardcore'] || 0) >= 6) {
            if (!p.isOverclocked) {
                // Decay heat if not shooting (handled in ShootingSystem, here we just decay)
                // Slowed down decay from every 5 frames to every 10 frames
                if (engine.state.timeAlive % 10 === 0) {
                    p.heatValue = Math.max(0, p.heatValue - 1);
                }
            } else {
                // In Overclock state
                p.heatValue -= 0.3; // Drain heat

                // Visuals
                if (engine.state.timeAlive % 10 === 0) {
                    spawnParticles(engine, p.x, p.y, '#ef4444', 2);
                }

                // Self Damage - NERFED TO 1%
                if (engine.state.timeAlive % 60 === 0) {
                    const selfDmg = Math.max(1, Math.ceil(p.maxHp * 0.01)); // 1% per second
                    p.hp -= selfDmg;
                    engine.emit(GameEventType.FLOATING_TEXT, { x: p.x, y: p.y - 20, text: `-${selfDmg}`, color: '#ef4444', category: 'damage' });
                    
                    if (p.hp <= 0) {
                        engine.state.killer = 'overclock';
                    }
                }

                // Exit Overclock
                if (p.heatValue <= 0) {
                    p.isOverclocked = false;
                    p.heatValue = 0;
                    engine.emit(GameEventType.FLOATING_TEXT, { x: p.x, y: p.y - 60, text: "过载结束", color: "#cbd5e1" });
                    engine.audio.play('ui_power_down');
                }
            }
        } else {
            p.heatValue = 0;
            p.isOverclocked = false;
        }
    },

    updateSurvival: (engine: IGameEngine, synergyRegenBonus: number) => {
        const p = engine.state.player;

        // --- DEATH CHECK PRE-CALC (Involution King) ---
        const kingCount = p.items.filter((i: string) => i === '卷王').length;
        if (kingCount > 0) {
            if (!engine.state.isWaveClearing && engine.state.timeAlive % 60 === 0) {
                const drain = 2 * kingCount;
                p.hp -= drain;
                engine.emit(GameEventType.FLOATING_TEXT, { x: p.x, y: p.y - 20, text: `-${drain}`, color: "#ef4444" });
                
                // King Insurance Interaction
                const insuranceCount = p.items.filter((i: string) => i === '意外险').length;
                if (insuranceCount > 0) {
                    const cap = insuranceCount * (p.items.includes('高额意外险') ? 1200 : 800);
                    if (p.insuranceGoldEarned < cap) {
                        p.gold += 10;
                        engine.state.score += 10;
                        engine.state.waveStats.goldEarned += 10;
                        engine.state.waveStats.bonusGold += 10;
                        p.insuranceGoldEarned += 10;
                        engine.emit(GameEventType.FLOATING_TEXT, { x: p.x, y: p.y - 40, text: "💰+10", color: "#fbbf24", category: 'gold' });
                    }
                }
                
                if (p.hp <= 0) {
                    engine.state.killer = 'involution_king';
                }
            }
        }

        // --- PASSIVE REGEN ---
        let effectiveRegen = p.hpRegen + synergyRegenBonus;
        
        // HAZARD: CAREER FATIGUE (Half Healing)
        if (engine.state.activeMutators.includes('career_fatigue')) {
            effectiveRegen *= 0.5;
        }

        if (effectiveRegen > 0 && engine.state.timeAlive % 60 === 0 && p.hp < p.maxHp && p.hp > 0) {
            p.hp = Math.min(p.maxHp, p.hp + effectiveRegen);
            p.lastHealTime = engine.state.timeAlive; // Visual Feedback
            engine.emit(GameEventType.FLOATING_TEXT, { x: p.x, y: p.y - 30, text: `+${effectiveRegen.toFixed(1)}`, color: "#22c55e", category: 'damage' });
        }

        // --- SHIELD REGEN ---
        if (p.maxShield > 0 && p.shield < p.maxShield && p.hp > 0) {
            // Default 3s delay
            if (engine.state.timeAlive - p.lastDamageTime > 180) {
                if (!p.isRegeneratingShield) {
                    engine.emit(GameEventType.FLOATING_TEXT, { x: p.x, y: p.y - 40, text: "护盾恢复", color: "#3b82f6", category: 'chat' });
                    p.isRegeneratingShield = true;
                }
                
                let regenAmount = 1/60; // 1 per sec
                // NEW: Headphones Logic (Double Regen)
                if (p.items.includes('降噪耳机')) {
                    regenAmount *= 2;
                }
                
                p.shield = Math.min(p.maxShield, p.shield + regenAmount);
            } else {
                p.isRegeneratingShield = false;
            }
        } else {
            p.isRegeneratingShield = false;
        }
    },

    checkDeath: (engine: IGameEngine): boolean => {
        // Intercept death if revival is in progress
        if (engine.state.reviveSequence.active) return false;

        const p = engine.state.player;
        if (p.hp <= 0 && !p.isDying) {
            p.isDying = true;
            p.deathTimer = 120;
            p.emoji = '💀';
            
            spawnParticles(engine, p.x, p.y, '#ef4444', 12);
            spawnParticles(engine, p.x, p.y, '#ffffff', 8);
            
            engine.audio.stopBGM();
            engine.audio.playExplosion();
            localStorage.removeItem('meme_game_save');
            engine.saveAchievements();
            return true;
        }
        return p.isDying;
    },

    updateVisuals: (engine: IGameEngine) => {
        const p = engine.state.player;
        if (p.invulnerableTime > 0) p.invulnerableTime--;

        if (p.isDying) return;

        const charConfig = CHARACTERS[p.characterId] || CHARACTERS['9527'];
        
        if (p.isOverclocked) {
            p.emoji = '🔥'; // Or angry face
        } else {
            const hpPct = p.hp / p.maxHp;
            if (hpPct > 0.6) {
                p.emoji = charConfig.emojiNormal;
            } else if (hpPct > 0.3) {
                p.emoji = charConfig.emojiHurt;
            } else {
                p.emoji = charConfig.emojiCritical;
            }
        }
    }
};
