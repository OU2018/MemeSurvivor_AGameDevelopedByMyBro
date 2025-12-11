
import { IGameEngine, Projectile } from "../../../../../types";
import { BattleFormulas } from "../../../battle/formulas";
import { SynergyLogic } from "../../../synergyLogic";
import { GameEventType } from "../../../events/events";
import { killEnemy, triggerBossTransition } from "../../../battle/enemySystem";
import { spawnLightning, PoolUtils, emitParticles, spawnFloatingText } from "../../../utils";
import { SpatialHashGrid } from "../../../utils/SpatialGrid";

export const EnemyHitHandler = {
    handle: (engine: IGameEngine, proj: Projectile, grid: SpatialHashGrid): boolean => {
        const neighbors = grid.query(proj.x, proj.y);
        const p = engine.state.player;
        
        let destroyBullet = false;
        let sweeperCurrentRot = 0;
        let isSweeperCheck = false;
        
        // Melee Swing Logic Pre-calc
        if (proj.isSweeper) {
            isSweeperCheck = true;
            const maxLife = proj.maxLife || 24;
            const rawProgress = 1 - (proj.life / maxLife);
            const swingArc = 2.5; 
            const startOffset = swingArc / 2;
            const wave = Math.cos(rawProgress * Math.PI * 2);
            const interp = (1 - wave) / 2;
            const sweeperDir = proj.swingDirection !== undefined ? proj.swingDirection : 1;
            const baseAngle = proj.angle !== undefined ? proj.angle : 0;
            sweeperCurrentRot = baseAngle + (startOffset * sweeperDir) - (interp * swingArc * sweeperDir);
        }

        // Hardcore (4) Lifesteal Bonus
        const counts = SynergyLogic.getSynergyCounts(p.items);
        const tiers = SynergyLogic.getActiveTiers(counts);
        const hasHardcore4 = (tiers['hardcore'] || 0) >= 4;
        let lifestealBonus = 0;
        if (hasHardcore4) {
            const missingPct = Math.max(0, 1 - (p.hp / p.maxHp));
            lifestealBonus = missingPct * 0.1; 
        }

        // --- NEW: Private Driver Player Collision ---
        if (p.items.includes('专职司机')) {
            const ramTargets = grid.query(p.x, p.y);
            for (const e of ramTargets) {
                if (e.isTransitioning || e.hp <= 0) continue;
                const dist = Math.hypot(p.x - e.x, p.y - e.y);
                if (dist < p.radius + e.radius + 10) {
                    // Check if actually moving
                    const speed = Math.hypot(p.vx, p.vy);
                    // Only damage every 30 frames to avoid instant melt
                    if (speed > 1 && engine.state.timeAlive % 30 === 0) {
                        const ramDamage = p.attackDamage * 2;
                        e.hp -= ramDamage;
                        engine.state.waveStats.damageDealt += ramDamage;
                        engine.emit(GameEventType.ENTITY_DAMAGED, { x: e.x, y: e.y, text: `💥${Math.floor(ramDamage)}`, color: '#ef4444' });
                        
                        // Push back hard
                        const angle = Math.atan2(e.y - p.y, e.x - p.x);
                        e.vx += Math.cos(angle) * 15;
                        e.vy += Math.sin(angle) * 15;
                        e.stunTimer = 30;
                    }
                }
            }
        }

        for (const e of neighbors) {
            if (e.isTransitioning) continue; 
            if (proj.hitIds.includes(e.id)) continue;

            // --- BOSS GLITCH UNSTABLE CHECK ---
            // If unstable, ignore collision entirely (intangible)
            if (e.isUnstable) continue;

            const dist = Math.hypot(proj.x - e.x, proj.y - e.y);
            
            if (dist < proj.radius + e.radius) {
                // Sweeper Arc Check
                if (isSweeperCheck) {
                    const angleToEnemy = Math.atan2(e.y - proj.y, e.x - proj.x);
                    let angleDiff = Math.abs(angleToEnemy - sweeperCurrentRot);
                    if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
                    if (angleDiff > 0.8) continue; 
                }

                // Special Enemy State Check
                if (e.isThrown || e.captureState === 'orbiting') {
                    if (proj.isExplosive) {
                        if (proj.explodeOnExpire) { proj.life = 0; } 
                        else { proj.isStopped = true; proj.stopTimer = 0; proj.life = 60; }
                        proj.hitIds.push(e.id); 
                        break; 
                    }
                    destroyBullet = true;
                    break; 
                }

                // --- TRIGGER BOSS GLITCH UNSTABLE STATE ---
                if (e.config.type === 'boss_glitch' && (!e.customVars?.unstableCooldown || e.customVars.unstableCooldown <= 0)) {
                    // 10% Chance on hit to phase out
                    if (Math.random() < 0.1) {
                        e.isUnstable = true;
                        e.customVars.unstableTimer = 90; // 1.5s
                        spawnFloatingText(engine, e.x, e.y - e.radius - 20, "SIGNAL LOST", "#00ff00", 'chat');
                    }
                }

                proj.hitIds.push(e.id);
                
                if (proj.renderStyle === 'gold_coin') {
                    engine.audio.playCoin();
                }

                if (e.config.behavior !== 'boss') { 
                    if (BattleFormulas.shouldTrigger1024Stun(p.characterId === '1024')) { e.stunTimer = 60; }
                    if (BattleFormulas.shouldTriggerPPTStun(p.items.includes('PPT'))) { e.stunTimer = 60; engine.emit(GameEventType.FLOATING_TEXT, { x: e.x, y: e.y, text: "画饼!", color: "#a855f7", category: 'chat' }); }
                    
                    if (proj.isSummon && p.items.includes('绩效考核表') && Math.random() < 0.1) {
                        e.stunTimer = 60;
                        engine.emit(GameEventType.FLOATING_TEXT, { x: e.x, y: e.y, text: "考核!", color: "#22d3ee", category: 'chat' });
                    }
                } 

                // --- TECH SYNERGY LOGIC ---
                if (proj.canChain && Math.random() < 0.3) {
                    const chainRange = 300;
                    const chainTargets = grid.query(e.x, e.y).filter(other => 
                        other !== e && Math.hypot(other.x - e.x, other.y - e.y) < chainRange && !other.isTransitioning && other.hp > 0 && !other.isUnstable
                    );
                    for (let k = 0; k < 3 && k < chainTargets.length; k++) {
                        const target = chainTargets[k];
                        const chainDmg = Math.ceil(proj.damage * 0.5);
                        target.hp -= chainDmg;
                        target.stunTimer = 15;
                        engine.state.waveStats.damageDealt += chainDmg;
                        engine.emit(GameEventType.ENTITY_DAMAGED, { x: target.x, y: target.y, text: `⚡${chainDmg}`, color: '#3b82f6' });
                        spawnLightning(engine, e.x, e.y, target.x, target.y, '#3b82f6');
                    }
                }
                if (proj.bounceCount && proj.bounceCount > 0) {
                    proj.bounceCount--;
                    let nearest = null;
                    let minDst = 400; 
                    const bounceCandidates = grid.query(e.x, e.y);
                    for (const other of bounceCandidates) {
                        if (other === e || proj.hitIds.includes(other.id) || other.hp <= 0 || other.isTransitioning || other.isUnstable) continue;
                        const d = Math.hypot(other.x - e.x, other.y - e.y);
                        if (d < minDst) { minDst = d; nearest = other; }
                    }
                    if (nearest) {
                        const speed = Math.hypot(proj.vx, proj.vy);
                        const angle = Math.atan2(nearest.y - e.y, nearest.x - e.x);
                        proj.vx = Math.cos(angle) * speed;
                        proj.vy = Math.sin(angle) * speed;
                        if (proj.isExplosive) {
                            engine.emit(GameEventType.PROJECTILE_EXPLODE, { x: e.x, y: e.y, radius: proj.maxExplosionRadius! * 0.6, style: proj.renderStyle, isCyber: true });
                            engine.state.zones.push({ id: Math.random().toString(), x: e.x, y: e.y, radius: proj.maxExplosionRadius! * 0.6, type: 'explosion_shockwave', life: 10, color: '#fbbf24', emoji: '' });
                        }
                        engine.emit(GameEventType.FLOATING_TEXT, { x: proj.x, y: proj.y, text: "↗", color: "#3b82f6" });
                        continue; 
                    }
                }

                // --- STANDARD DESTRUCTION LOGIC ---
                if (proj.isExplosive) {
                    if (proj.explodeOnExpire || (proj.behaviors && proj.behaviors.includes('explode_on_expire'))) { proj.life = 0; } 
                    else { proj.isStopped = true; proj.stopTimer = 0; proj.life = 60; }
                    break; 
                }

                if (BattleFormulas.shouldLifesteal(p.lifeSteal + lifestealBonus)) { 
                    if (p.hp < p.maxHp) { p.hp = Math.min(p.maxHp, p.hp + 1); }
                }
                
                if (BattleFormulas.shouldTriggerRedEnvelope(p.items.includes('红包'))) {
                    p.gold += 6; engine.state.score += 6; 
                    engine.state.waveStats.goldEarned += 6; engine.state.waveStats.bonusGold += 6;
                    engine.emit(GameEventType.FLOATING_TEXT, { x: e.x, y: e.y - 40, text: "+6", color: '#ef4444', category: 'gold' });
                }

                let finalDamage = proj.damage;
                let isCrit = proj.isCrit || false;

                if (p.items.includes('共享文件夹')) {
                    const travelDist = Math.hypot(proj.x - p.x, proj.y - p.y);
                    const bonus = Math.min(0.3, travelDist / 800); 
                    finalDamage *= (1 + bonus);
                }
                
                // --- STREET LAMP: STEAL GOLD ---
                if (p.items.includes('路灯') && Math.random() < 0.1) {
                    p.gold += 1;
                    engine.state.score += 1;
                    engine.state.waveStats.goldEarned += 1;
                }

                if ((proj.isSummon || proj.sourceType === 'summon') && proj.critChance && proj.critChance > 0) {
                    if (!isCrit && Math.random() < proj.critChance) { 
                        finalDamage *= 2; isCrit = true;
                        engine.emit(GameEventType.FLOATING_TEXT, { x: e.x, y: e.y - 30, text: "狼性!", color: "#ef4444" });
                        engine.emit(GameEventType.PARTICLE_SPAWN, { x: e.x, y: e.y, color: '#ef4444', count: 3 });
                    }
                }

                if (e.anxietyTimer && e.anxietyTimer > 0) {
                    finalDamage *= 1.15;
                }

                // --- RIVER CRAB ARMOR ---
                if (e.config.type === 'river_crab') {
                    const facingAngle = Math.atan2(e.vy, e.vx);
                    const attackAngle = Math.atan2(proj.vy, proj.vx);
                    let diff = Math.abs(facingAngle - attackAngle);
                    if (diff > Math.PI) diff = 2 * Math.PI - diff;
                    
                    if (diff > Math.PI * 0.6) {
                        finalDamage *= 0.2;
                        engine.emit(GameEventType.FLOATING_TEXT, { x: e.x, y: e.y - 40, text: "404 Block", color: "#94a3b8" });
                        engine.audio.play('ui_shield_break'); 
                        emitParticles(engine, { x: proj.x, y: proj.y, color: '#94a3b8', count: 5, speed: 4, life: 10, type: 'spark', blendMode: 'lighter' });
                    } else if (diff < Math.PI * 0.4) {
                        finalDamage *= 2.0;
                        isCrit = true;
                        engine.emit(GameEventType.FLOATING_TEXT, { x: e.x, y: e.y - 40, text: "弱点!", color: "#ef4444", scale: 1.5 });
                    }
                }

                // --- DAMAGE APPLICATION (Shield First) ---
                if (e.tempShield && e.tempShield > 0) {
                    const damageToShield = Math.min(e.tempShield, finalDamage);
                    e.tempShield -= damageToShield;
                    finalDamage -= damageToShield;
                    engine.emit(GameEventType.FLOATING_TEXT, { x: e.x, y: e.y - 50, text: `🛡️${Math.floor(damageToShield)}`, color: "#cbd5e1" });
                }

                if (finalDamage > 0) {
                    e.hp -= finalDamage;
                    e.hitFlashTimer = 5; 
                    engine.state.waveStats.damageDealt += finalDamage;
                    engine.emit(GameEventType.ENTITY_DAMAGED, { x: e.x, y: e.y, text: `-${Math.floor(finalDamage)}`, color: isCrit ? '#ef4444' : '#fbbf24', isCrit: isCrit, targetId: e.id });
                }
                
                const hasMarket4 = (tiers['market'] || 0) >= 4;
                if (hasMarket4 && Math.random() < 0.3) {
                    e.anxietyTimer = 150; 
                }

                // --- BOARD (4): EXECUTE ---
                if ((tiers['board'] || 0) >= 4) {
                    if (e.config.behavior !== 'boss' && e.hp > 0 && (e.hp / e.maxHp) < 0.2) {
                        e.hp = 0;
                        engine.emit(GameEventType.FLOATING_TEXT, { x: e.x, y: e.y, text: "FIRED!", color: "#ef4444", category: 'chat' });
                        emitParticles(engine, { x: e.x, y: e.y, color: '#ffffff', count: 8, type: 'rect', speed: 3, life: 40, size: 6, scaleDelta: -0.05, rotation: Math.random(), angularVelocity: 0.2 });
                    }
                }

                if (e.config.behavior !== 'boss') { 
                    const angle = Math.atan2(e.y - proj.y, e.x - proj.x);
                    const knockbackValue = BattleFormulas.getPlayerKnockback(p);
                    // Use Hardcoded high force for sweeper to compensate for global nerf
                    const force = isSweeperCheck ? 20 : knockbackValue;
                    
                    e.vx += Math.cos(angle) * force;
                    e.vy += Math.sin(angle) * force;
                    if (isSweeperCheck) e.stunTimer = 15; 
                }

                if (e.config.behavior === 'boss' && e.phase === 1 && e.hp <= 0) { 
                    if (e.config.type === 'boss_glitch') {
                        const idx = engine.state.enemies.indexOf(e); 
                        if (idx > -1) killEnemy(engine, idx);
                    } else {
                        triggerBossTransition(engine, e); 
                    }
                } 
                else if (e.hp <= 0) { 
                    if (proj.renderStyle === 'gold_coin') {
                        p.gold += 1; engine.state.score += 1; engine.state.waveStats.goldEarned += 1;
                        // engine.emit(GameEventType.FLOATING_TEXT, { x: e.x, y: e.y - 40, text: "+1", color: '#facc15', category: 'gold' });
                    }
                    const idx = engine.state.enemies.indexOf(e); 
                    if (idx > -1) killEnemy(engine, idx, false, !!proj.isWealthCoin); 
                }
                
                if (proj.pierce > 0) { proj.pierce--; proj.damage *= 0.8; } 
                else { destroyBullet = true; }
                if (proj.isInvincible) { destroyBullet = false; }
                if (destroyBullet) break;
            }
        }
        return destroyBullet;
    },

    spawnCodeExplosion: (engine: IGameEngine, e: any, proj: Projectile, radius: number) => {
        const explosionProj = PoolUtils.getProjectile(engine);
        explosionProj.id = Math.random().toString();
        explosionProj.x = e.x; explosionProj.y = e.y;
        explosionProj.radius = radius;
        explosionProj.emoji = '';
        explosionProj.vx = 0; explosionProj.vy = 0;
        explosionProj.damage = proj.damage * 0.5;
        explosionProj.life = 5;
        explosionProj.isEnemy = false;
        explosionProj.color = '#22c55e';
        explosionProj.text = '';
        explosionProj.pierce = 999;
        explosionProj.hitIds = [e.id];
        explosionProj.isExplosive = true;
        explosionProj.isExploding = true;
        explosionProj.maxExplosionRadius = radius;
        explosionProj.renderStyle = 'code_explosion';
        explosionProj.active = true;
        
        engine.state.projectiles.push(explosionProj);
    }
};
