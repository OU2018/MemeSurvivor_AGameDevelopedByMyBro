
import { IGameEngine, Projectile } from "../../../types";
import { BattleFormulas } from "../../battle/formulas";
import { SynergyLogic } from "../../synergyLogic";
import { GameEventType } from "../../events/events";
import { spawnFloatingText, PoolUtils } from "../../utils";

export const PlayerHitHandler = {
    damagePlayer: (engine: IGameEngine, amount: number, source: string = 'unknown', damageSourceX?: number, damageSourceY?: number) => {
          const p = engine.state.player;
          
          // --- IMMUNITY DURING LAG ROLLBACK (While glitching) ---
          if (p.customTimers['lag_rollback_timer'] && p.customTimers['lag_rollback_timer'] > 0) {
              return; // No damage taken
          }

          if (amount <= 0) return; 
          
          // --- BLACK POT REFLECTION (Triggers on ANY damage attempt, before mitigation) ---
          if (p.damageReflection > 0) {
              const reflectDmg = Math.ceil(amount * p.damageReflection);
              
              // Try to find a valid target to reflect damage to
              let target = null;
              let minDst = 600; // Reflection range limit

              // Optimization: Search for nearest enemy of source type
              for (const e of engine.state.enemies) {
                  if (e.config.type === source && e.hp > 0 && !e.isTransitioning) {
                      const d = Math.hypot(e.x - p.x, e.y - p.y);
                      if (d < minDst) {
                          minDst = d;
                          target = e;
                      }
                  }
              }

              // If no specific target found (e.g. projectile source dead), hit nearest enemy
              if (!target) {
                   for (const e of engine.state.enemies) {
                      if (e.hp > 0 && !e.isTransitioning) {
                          const d = Math.hypot(e.x - p.x, e.y - p.y);
                          if (d < minDst) {
                              minDst = d;
                              target = e;
                          }
                      }
                   }
              }

              if (target) {
                  target.hp -= reflectDmg;
                  engine.emit(GameEventType.ENTITY_DAMAGED, { x: target.x, y: target.y, text: `↩${reflectDmg}`, color: '#ffffff' });
              }
          }

          // --- PRIVATE DRIVER (Directional Block - ALWAYS ACTIVE) ---
          if (p.items.includes('专职司机')) {
              // Only apply if we know where the damage came from
              if (damageSourceX !== undefined && damageSourceY !== undefined) {
                  const moveAngle = p.facingAngle || 0; // Use persistent facing angle
                  
                  const sourceAngle = Math.atan2(damageSourceY - p.y, damageSourceX - p.x);
                  
                  let angleDiff = Math.abs(moveAngle - sourceAngle);
                  // Normalize to 0 - PI
                  if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
                  
                  // Cone Check: 120 degrees total = +/- 60 degrees (PI/3)
                  if (angleDiff < Math.PI / 3) {
                      // FULL IMMUNITY
                      engine.emit(GameEventType.FLOATING_TEXT, { x: p.x, y: p.y - 40, text: "格挡!", color: "#60a5fa" });
                      engine.audio.play('ui_shield_break'); 
                      return; // Block completely
                  }
              }
          }

          // --- HEADPHONES LOGIC: Only reset if not fully blocked by shield ---
          // Default behavior: reset timer on ANY damage attempt
          let shouldResetRegen = true;
          
          if (p.items.includes('降噪耳机')) {
              // If shield completely blocks the damage, don't reset
              if (p.shield >= amount) {
                  shouldResetRegen = false;
              }
          }
          
          if (shouldResetRegen) {
              p.lastDamageTime = engine.state.timeAlive;
          }
          
          amount = BattleFormulas.calculateIncomingDamage(amount, p.items);
    
          if (p.items.includes('木鱼')) {
              p.gold += 1;
              engine.state.score += 1;
              engine.state.waveStats.goldEarned += 1;
          }
    
          // --- SLACKER (6): 50% Damage Reduction ---
          const counts = SynergyLogic.getSynergyCounts(p.items);
          const tiers = SynergyLogic.getActiveTiers(counts);
          if ((tiers['slacker'] || 0) >= 6) {
              amount = Math.ceil(amount * 0.5);
          }

          // --- HAZARD: IMPOSTER SYNDROME (Endless Debuff) ---
          if (engine.state.activeMutators.includes('imposter_syndrome')) {
              amount = Math.ceil(amount * 1.3);
          }

          // --- ITEM: HOT COFFEE SPLASH ---
          if (p.items.includes('泼洒的热咖啡')) {
              // Create coffee puddle
              engine.state.zones.push({
                  id: Math.random().toString(),
                  x: p.x, y: p.y,
                  radius: 120,
                  // @ts-ignore
                  type: 'coffee_puddle', 
                  life: 300, // 5 seconds
                  maxLife: 300,
                  color: '#451a03', // Dark Coffee Brown
                  emoji: ''
              });
              engine.emit(GameEventType.FLOATING_TEXT, { x: p.x, y: p.y - 40, text: "烫烫烫!", color: "#fdba74", category: 'chat' });
          }

          // --- ITEM: STRESS RESPONSE (Trigger on Hurt) ---
          if (p.items.includes('应激反应')) {
              const burstDmg = Math.ceil(p.maxHp * 0.1); // 10% Max HP
              const directions = 8;
              for (let i = 0; i < directions; i++) {
                  const angle = (i / directions) * Math.PI * 2;
                  const proj = PoolUtils.getProjectile(engine);
                  proj.id = Math.random().toString();
                  proj.x = p.x; 
                  proj.y = p.y;
                  proj.radius = 16;
                  proj.vx = Math.cos(angle) * 15; // Fast
                  proj.vy = Math.sin(angle) * 15;
                  proj.damage = burstDmg;
                  proj.life = 60; // Enough to cross screen
                  proj.isEnemy = false;
                  proj.color = '#ef4444';
                  proj.pierce = 999; // Infinite pierce
                  proj.hitIds = [];
                  proj.active = true;
                  proj.sourceType = 'stress_response';
                  proj.renderStyle = 'data_spike'; // Reusing spike visual but red
                  engine.state.projectiles.push(proj);
              }
              engine.audio.playExplosion(); // Impact sound
          }

          // --- CAPITAL (4): GOLD SHIELD ---
          if ((tiers['capital'] || 0) >= 4 && p.gold > 0) {
              const goldCost = amount * 10;
              if (p.gold >= goldCost) {
                  p.gold -= goldCost;
                  engine.emit(GameEventType.FLOATING_TEXT, { x: p.x, y: p.y - 30, text: `-${goldCost}G`, color: "#fbbf24", category: 'gold' });
                  engine.emit(GameEventType.FLOATING_TEXT, { x: p.x, y: p.y - 10, text: "金钱护盾", color: "#facc15" });
                  p.invulnerableTime = 20; 
                  return; 
              } else {
                  const maxBlock = Math.floor(p.gold / 10);
                  if (maxBlock > 0) {
                      p.gold = 0;
                      amount -= maxBlock;
                      engine.emit(GameEventType.FLOATING_TEXT, { x: p.x, y: p.y - 30, text: "破产!", color: "#ef4444" });
                  }
              }
          }

          // --- SHIELD LOGIC ---
          if (p.shield > 0) {
              // --- ITEM: BLUE SCREEN GLASSES (On Hit) ---
              if (p.items.includes('防蓝光眼镜')) {
                  // Check Cooldown (Reuse a custom timer slot)
                  if (!p.customTimers['blue_screen_cd'] || p.customTimers['blue_screen_cd'] <= 0) {
                      p.customTimers['blue_screen_cd'] = 60; // 1 second CD
                      
                      engine.state.zones.push({
                          id: Math.random().toString(),
                          x: p.x, y: p.y,
                          radius: 250,
                          type: 'explosion_shockwave',
                          life: 15,
                          maxLife: 15,
                          color: '#3b82f6', // Blue
                          emoji: ''
                      });
                      engine.audio.playExplosion();
                      
                      // Knockback & Damage enemies
                      engine.state.enemies.forEach(e => {
                          const dist = Math.hypot(e.x - p.x, e.y - p.y);
                          if (dist < 250 && !e.isTransitioning) {
                              const pushForce = 20;
                              const angle = Math.atan2(e.y - p.y, e.x - p.x);
                              e.vx += Math.cos(angle) * pushForce;
                              e.vy += Math.sin(angle) * pushForce;
                              e.stunTimer = 60;
                              e.hp -= 20;
                              engine.emit(GameEventType.ENTITY_DAMAGED, { x: e.x, y: e.y, text: "-20", color: "#3b82f6" });
                          }
                      });
                  }
              }

              if (p.shield >= amount) {
                  p.shield -= amount;
                  engine.state.waveStats.damageMitigated += amount;
                  engine.emit(GameEventType.FLOATING_TEXT, { x: p.x, y: p.y, text: "吸收", color: "#3b82f6" });
                  engine.emit(GameEventType.SHIELD_BREAK, { x: p.x, y: p.y }); 
                  p.invulnerableTime = 20;
                  return;
              } else {
                  engine.state.waveStats.damageMitigated += p.shield;
                  amount -= p.shield;
                  p.shield = 0;
                  engine.emit(GameEventType.FLOATING_TEXT, { x: p.x, y: p.y, text: "破盾!", color: "#3b82f6" });
                  engine.emit(GameEventType.SHIELD_BREAK, { x: p.x, y: p.y });
              }
          }
    
          const insuranceCount = p.items.filter((i: string) => i === '意外险').length;
          if (insuranceCount > 0) {
               const cap = insuranceCount * (p.items.includes('高额意外险') ? 1200 : 800);
               if (p.insuranceGoldEarned < cap) {
                   p.gold += 10; 
                   engine.state.score += 10; 
                   engine.state.waveStats.goldEarned += 10;
                   engine.state.waveStats.bonusGold += 10;
                   p.insuranceGoldEarned += 10; 
               }
          }
          
          p.hp -= amount;
          p.invulnerableTime = 40;
          
          engine.emit(GameEventType.PLAYER_HURT, { x: p.x, y: p.y });
          
          if (p.hp <= 0) {
              const reviveIndex = p.items.indexOf('买命钱');
              if (reviveIndex !== -1) {
                  p.items.splice(reviveIndex, 1);
                  engine.state.reviveSequence.active = true;
                  engine.state.reviveSequence.phase = 'start';
                  engine.state.reviveSequence.timer = 0;
                  engine.state.reviveSequence.lostGold = p.gold;
                  return;
              } else {
                  engine.state.killer = source;
              }
          }
    },

    checkPlayerHit: (engine: IGameEngine, proj: Projectile): boolean => {
        const p = engine.state.player;
        const dist = Math.hypot(proj.x - p.x, proj.y - p.y);
        
        if (dist < proj.radius + p.radius * 0.6) {
            // --- CHARM HIT LOGIC (Cyber Goddess) ---
            if (proj.renderStyle === 'charm_heart') {
                if (p.charmImmunityTimer && p.charmImmunityTimer > 0) {
                    spawnFloatingText(engine, p.x, p.y - 40, "免疫!", "#ffffff");
                    // Still apply damage, just no charm?
                    // Pass projectile coords as source
                    PlayerHitHandler.damagePlayer(engine, proj.damage, proj.sourceType, proj.x, proj.y);
                    return true;
                } else {
                    // Apply Charm
                    p.isCharmed = true;
                    p.charmSourceId = proj.sourceType; // Projectile source ID carries goddess ID
                    p.charmTimer = 90; // 1.5 seconds
                    
                    spawnFloatingText(engine, p.x, p.y - 60, "❤ 魅惑 ❤", "#f472b6");
                    PlayerHitHandler.damagePlayer(engine, proj.damage, proj.sourceType, proj.x, proj.y);
                    return true;
                }
            }

            let dodged = false;
            let effectiveDodge = p.dodgeChance;
            
            const counts = SynergyLogic.getSynergyCounts(p.items);
            const tiers = SynergyLogic.getActiveTiers(counts);
            if ((tiers['slacker'] || 0) >= 4 && p.standStillTimer > 30) {
                effectiveDodge += 0.2;
            }

            if (BattleFormulas.shouldDodge(effectiveDodge)) {
                engine.emit(GameEventType.FLOATING_TEXT, { x: p.x, y: p.y, text: "闪避", color: "#60a5fa" });
                if (p.items.includes('摸鱼执照') && p.hp < p.maxHp) {
                    p.hp = Math.min(p.maxHp, p.hp + 5);
                    engine.emit(GameEventType.ENTITY_DAMAGED, { x: p.x, y: p.y - 20, text: "+5", color: "#22c55e", isCrit: false });
                }
                return true; 
            } 
            
            if (!dodged && p.invulnerableTime <= 0) {
                // --- SPECIAL: BOSS GLITCH LAG ROLLBACK ---
                if (proj.sourceType === 'glitch_lag_initiator') {
                    // Only mark if NOT already marked
                    if (!p.customTimers['lag_rollback_timer'] || p.customTimers['lag_rollback_timer'] <= 0) {
                        
                        // 1. Record Anchor Safely
                        if (!p.customVars) p.customVars = {};
                        p.customVars['lag_anchor'] = { x: Math.floor(p.x), y: Math.floor(p.y) };
                        
                        // 2. Start Timer (5 Seconds = 300 frames)
                        p.customTimers['lag_rollback_timer'] = 300; 
                        
                        // 3. Visuals
                        engine.state.zones.push({
                            id: Math.random().toString(),
                            x: p.x, y: p.y,
                            radius: 30,
                            type: 'glitch_lag_marker',
                            life: 300, // Sync with timer
                            maxLife: 300,
                            color: '#22d3ee',
                            emoji: ''
                        });
                        
                        engine.emit(GameEventType.FLOATING_TEXT, { x: p.x, y: p.y - 60, text: "LAG DETECTED!", color: "#ef4444", category: 'chat' });
                        engine.audio.play('ui_glitch_minor'); 
                    }
                    
                    return true; // Bullet destroyed
                }

                // Pass Projectile position as damage source
                PlayerHitHandler.damagePlayer(engine, proj.damage, proj.sourceType, proj.x, proj.y);
                return true; 
            }
        }
        return false;
    },

    checkExplosionHit: (engine: IGameEngine, proj: Projectile) => {
        const p = engine.state.player;
        const dist = Math.hypot(proj.x - p.x, proj.y - p.y);
        if (dist < proj.radius && p.invulnerableTime <= 0) {
            // Pass explosion center as source
            PlayerHitHandler.damagePlayer(engine, proj.damage * 1.5, proj.sourceType, proj.x, proj.y);
        }
    }
};
