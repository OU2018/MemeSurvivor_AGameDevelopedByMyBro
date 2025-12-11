import { IGameEngine, Projectile } from "../../../types";
import { killEnemy, triggerBossTransition } from "../../battle/enemySystem";
import { SpatialHashGrid } from "../../utils/SpatialGrid";
import { GameEventType } from "../../events/events";
import { BattleFormulas } from "../../battle/formulas";
import { spawnLightning, spawnParticles } from "../../utils";
import { SynergyLogic } from "../../synergyLogic";

export const ExplosionHandler = {
    handle: (engine: IGameEngine, proj: Projectile, grid: SpatialHashGrid) => {
        // --- DAMAGE WINDOW LOGIC ---
        // If damageWindow is defined and reaches 0, stop processing collisions (dealing damage)
        // The projectile remains alive for visual effects only.
        if (proj.damageWindow !== undefined) {
            proj.damageWindow--;
            if (proj.damageWindow < 0) return;
        }

        const neighbors = grid.query(proj.x, proj.y);
        const p = engine.state.player;
        let killCountInThisFrame = 0;
        let hitCount = 0; // Cap hit count to prevent lag/excessive clearing

        const counts = SynergyLogic.getSynergyCounts(p.items);
        const tiers = SynergyLogic.getActiveTiers(counts);
        const hasMarket4 = (tiers['market'] || 0) >= 4;
        const hasBrainwashing = p.items.includes('洗脑循环');

        for (const e of neighbors) {
            if (proj.hitIds.includes(e.id)) continue;
            
            // Max Hit Cap: 15 targets per explosion to prevent screen wipes
            if (hitCount >= 15) break;

            const dist = Math.hypot(proj.x - e.x, proj.y - e.y);
            if (dist < proj.radius + e.radius) {
                if (e.isThrown || e.captureState === 'orbiting') {
                    proj.hitIds.push(e.id); 
                    continue;
                }
                proj.hitIds.push(e.id); 
                hitCount++;
                
                let finalExplosionDamage = proj.damage * 0.8;
                // Market (4) Anxiety Vulnerability in Explosion
                if (e.anxietyTimer && e.anxietyTimer > 0) {
                    finalExplosionDamage *= 1.15;
                }

                e.hp -= finalExplosionDamage; 
                e.hitFlashTimer = 5; // FLASH EFFECT

                if (e.config.behavior !== 'boss') {
                    const dx = e.x - proj.x; const dy = e.y - proj.y;
                    const d = Math.hypot(dx, dy);
                    if (d > 0) { const force = p.characterId === '007' ? 0.5 : 8.0; e.vx += (dx/d) * force; e.vy += (dy/d) * force; }
                }
                engine.state.waveStats.damageDealt += Math.floor(finalExplosionDamage);
                engine.emit(GameEventType.ENTITY_DAMAGED, { x: e.x, y: e.y, text: `-${Math.floor(finalExplosionDamage)}`, color: '#fbbf24', isCrit: !!proj.isCrit, targetId: e.id });
                
                // Apply Anxiety from Explosion (Market 4) OR Viral Spread (Market 6)
                // NERF: Reduce chances significantly to stop infinite chains
                const isViral = proj.sourceType === 'viral_market';
                // Viral chain chance: 30% base, 60% with Brainwashing (was 50/100)
                const spreadChance = hasBrainwashing ? 0.6 : 0.3;
                
                // If it's a Viral Explosion, use Spread Chance.
                // If it's a normal explosion with Market 4, use 20% chance (was 30%).
                const shouldApplyAnxiety = isViral 
                    ? Math.random() < spreadChance 
                    : (hasMarket4 && Math.random() < 0.2);

                if (proj.alwaysAnxiety || shouldApplyAnxiety) {
                    e.anxietyTimer = 150; // 2.5s
                    
                    // VISUAL: Show Purple Lightning Chain if this was a viral spread
                    if (isViral) {
                        spawnLightning(engine, proj.x, proj.y, e.x, e.y, '#a855f7');
                        // Add anchor particle to show source of lightning clearly
                        spawnParticles(engine, proj.x, proj.y, '#a855f7', 6);
                    }
                }

                if (e.config.behavior === 'boss' && e.phase === 1 && e.hp <= 0) { triggerBossTransition(engine, e); } 
                else if (e.hp <= 0) { 
                    const idx = engine.state.enemies.indexOf(e); 
                    if (idx > -1) {
                        // Pass the "fromChain" flag to trigger damage decay
                        // IMPORTANT: For viral explosions, we mark them as 'fromChain' to potentially reduce rewards or effects
                        killEnemy(engine, idx, isViral);
                        killCountInThisFrame++;
                    }
                }
            }
        }

        if (killCountInThisFrame > 0) {
            proj.killCount = (proj.killCount || 0) + killCountInThisFrame;
            if (proj.killCount > p.maxMultiKill) {
                p.maxMultiKill = proj.killCount;
            }
        }
    }
};