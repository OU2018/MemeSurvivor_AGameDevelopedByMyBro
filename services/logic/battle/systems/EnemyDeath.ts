
import { IGameEngine } from "../../../types";
import { spawnFloatingText, spawnParticles, PoolUtils, emitParticles } from "../../utils";
import { BattleFormulas } from "../formulas";
import { unlockAchievement } from "../../upgradeLogic";
import { EnemySpawner } from "./EnemySpawner";
import { SynergyLogic } from "../../synergyLogic";
import { GameEventType } from "../../events/events";
import { SHOP_ITEMS } from "../../../../data/items";
import { DropSystem } from "../../systems/DropSystem";

export const EnemyDeath = {
    triggerBossTransition: (engine: IGameEngine, e: any) => {
        // --- SKIP TRANSITION FOR SPECIAL BOSSES (Single Phase / Custom Logic) ---
        if (e.config.type === 'boss_glitch' || e.config.type === 'boss_ai') {
            EnemyDeath.killEnemy(engine, engine.state.enemies.indexOf(e));
            return;
        }

        e.hp = 1; 
        if (!e.isTransitioning) {
            e.isTransitioning = true;
            e.stateTimer = 180; 
            spawnFloatingText(engine, e.x, e.y, "形态切换中...", "#ef4444", 'chat');
            engine.state.projectiles.forEach((p: any) => {
                if (p.isEnemy) p.life = 0;
            });
        }
    },

    // Modified signature to accept chain reaction flag and doubleGold
    killEnemy: (engine: IGameEngine, index: number, fromChain: boolean = false, doubleGold: boolean = false) => {
        const e = engine.state.enemies[index];
        const p = engine.state.player;
        
        // --- KEYBOARD MAN DEATH VISUAL (Keys Flying) ---
        if (e.config.type === 'keyboard_man') {
            const keys = ['Q', 'W', 'E', 'R', 'A', 'S', 'D', 'F', 'Ctrl', 'Alt', 'Esc'];
            for (let i = 0; i < 6; i++) {
                const keyChar = keys[Math.floor(Math.random() * keys.length)];
                emitParticles(engine, {
                    x: e.x, 
                    y: e.y, 
                    text: keyChar,
                    count: 1, 
                    type: 'text',
                    color: '#94a3b8',
                    life: 45,
                    speed: 3,
                    scaleDelta: -0.02
                });
            }
        }

        // --- SHOCKING TITLE (ON KILL) ---
        if (p.items.includes('震惊体标题')) {
            const baseDmg = Math.ceil(BattleFormulas.getPlayerDamage(p) * 0.1);
            const load = engine.state.projectiles.length;

            if (load > 600) {
                // Ultra High Load: Shockwave Zone + Instant Damage
                engine.state.zones.push({
                    id: Math.random().toString(),
                    x: e.x, y: e.y,
                    radius: 150,
                    type: 'explosion_shockwave',
                    life: 15,
                    maxLife: 15,
                    color: '#22d3ee',
                    emoji: ''
                });

                const boom = PoolUtils.getProjectile(engine);
                boom.x = e.x; boom.y = e.y;
                boom.radius = 120;
                boom.damage = baseDmg * 6; 
                boom.life = 1; 
                boom.isExplosive = true;
                boom.isExploding = true;
                boom.maxExplosionRadius = 120;
                boom.color = '#22d3ee';
                boom.isEnemy = false;
                boom.hitIds = [e.id];
                boom.active = true;
                boom.sourceType = 'shocking_title_wave';
                engine.state.projectiles.push(boom);

            } else if (load > 300) {
                // High Load: 4 Big Spikes
                const spikeCount = 4;
                const dmg = baseDmg * 2;
                
                for (let i = 0; i < spikeCount; i++) {
                    const angle = (i / spikeCount) * Math.PI * 2 + (Math.PI/4);
                    const proj = PoolUtils.getProjectile(engine);
                    proj.id = Math.random().toString();
                    proj.x = e.x; proj.y = e.y;
                    proj.radius = 18; 
                    proj.vx = Math.cos(angle) * 12;
                    proj.vy = Math.sin(angle) * 12;
                    proj.damage = dmg;
                    proj.life = 45;
                    proj.isEnemy = false;
                    proj.color = '#22d3ee';
                    proj.pierce = 6; 
                    proj.hitIds = [e.id];
                    proj.active = true;
                    proj.sourceType = 'shocking_title';
                    proj.renderStyle = 'data_spike'; 
                    engine.state.projectiles.push(proj);
                }
            } else {
                // Normal Load: 8 Standard Spikes
                const spikeCount = 8;
                
                for (let i = 0; i < spikeCount; i++) {
                    const angle = (i / spikeCount) * Math.PI * 2;
                    const proj = PoolUtils.getProjectile(engine);
                    proj.id = Math.random().toString();
                    proj.x = e.x; proj.y = e.y;
                    proj.radius = 12;
                    proj.vx = Math.cos(angle) * 12;
                    proj.vy = Math.sin(angle) * 12;
                    proj.damage = baseDmg;
                    proj.life = 45;
                    proj.isEnemy = false;
                    proj.color = '#22d3ee';
                    proj.pierce = 3;
                    proj.hitIds = [e.id];
                    proj.active = true;
                    proj.sourceType = 'shocking_title';
                    proj.renderStyle = 'data_spike'; 
                    engine.state.projectiles.push(proj);
                }
            }
            
            // Visual Compensation: Death Flash
            engine.state.particles.push({
                id: Math.random().toString(),
                x: e.x, y: e.y,
                vx: 0, vy: 0,
                life: 10, maxLife: 10,
                scale: 0.5, scaleDelta: 0.3, 
                alpha: 1, alphaDelta: -0.1,
                color: '#cffafe', 
                size: 50,
                type: 'circle',
                blendMode: 'overlay',
                active: true
            });

            spawnFloatingText(engine, e.x, e.y, "震惊!", "#fbbf24", 'chat');
        }

        // --- MARKET (6): VIRAL SPREAD ---
        if (e.anxietyTimer && e.anxietyTimer > 0 && !fromChain) {
            const counts = SynergyLogic.getSynergyCounts(p.items);
            const tiers = SynergyLogic.getActiveTiers(counts);
            
            if ((tiers['market'] || 0) >= 6) {
                const hasBrainwashing = p.items.includes('洗脑循环');
                const range = hasBrainwashing ? 280 : 160;
                const damageMult = 0.8;
                const dmg = Math.ceil(BattleFormulas.getPlayerDamage(p) * damageMult);

                const proj = PoolUtils.getProjectile(engine);
                proj.id = Math.random().toString();
                proj.x = e.x; 
                proj.y = e.y;
                proj.radius = range;
                proj.emoji = '☣️';
                proj.vx = 0; 
                proj.vy = 0;
                proj.damage = dmg;
                proj.life = 20; 
                proj.isEnemy = false;
                proj.color = '#a855f7'; 
                proj.text = '';
                proj.pierce = 999;
                proj.hitIds = [];
                proj.active = true;
                proj.isExplosive = true;
                proj.isExploding = true;
                proj.maxExplosionRadius = range;
                proj.alwaysAnxiety = true; 
                proj.sourceType = 'viral_market';
                proj.renderStyle = 'viral_explosion';
                proj.damageWindow = 2; 
                
                engine.state.projectiles.push(proj);
            }
        }

        if (e.config.behavior === 'boss') {
            unlockAchievement(engine, 'boss_killer');
            engine.state.waveEnded = true; 
            for (const en of engine.state.enemies) {
                PoolUtils.releaseEnemy(engine, en);
            }
            engine.state.enemies = []; 
        }

        // --- SWAP-POP REMOVAL & POOLING ---
        if (engine.state.enemies[index]) {
            const enemyToRemove = engine.state.enemies[index];
            
            if (enemyToRemove.config.behavior !== 'boss') {
                PoolUtils.releaseEnemy(engine, enemyToRemove);
                const lastIdx = engine.state.enemies.length - 1;
                if (index !== lastIdx) {
                    engine.state.enemies[index] = engine.state.enemies[lastIdx];
                }
                engine.state.enemies.pop();
            }
        }

        // Death Rattle: Balloon
        if (e.config.behavior === 'balloon') {
             spawnParticles(engine, e.x, e.y, '#ffffff', 20);
             spawnFloatingText(engine, e.x, e.y, "💥", "#ffffff", 'chat'); 
             engine.audio.playExplosion();
             
             const explosionRadius = 160; 
             engine.state.zones.push({
                 id: Math.random().toString(),
                 x: e.x, y: e.y,
                 radius: explosionRadius,
                 type: 'explosion_shockwave',
                 life: 20,
                 maxLife: 20,
                 color: '#ffffff', 
                 emoji: ''
             });

             const pushForce = 12; 
             const pdx = p.x - e.x;
             const pdy = p.y - e.y;
             const pdist = Math.sqrt(pdx*pdx + pdy*pdy);
             if (pdist < explosionRadius && pdist > 0) {
                 const force = pushForce * (1 - pdist / explosionRadius);
                 p.vx += (pdx/pdist) * force;
                 p.vy += (pdy/pdist) * force;
                 spawnFloatingText(engine, p.x, p.y, "击飞!", "#ef4444", 'chat');
             }

             engine.state.enemies.forEach((other: any) => {
                 const edx = other.x - e.x;
                 const edy = other.y - e.y;
                 const edist = Math.sqrt(edx*edx + edy*edy);
                 if (edist < explosionRadius && edist > 0) {
                     const force = pushForce * (1 - edist / explosionRadius) * 1.5; 
                     other.vx += (edx/edist) * force;
                     other.vy += (edy/edist) * force;
                     other.stunTimer = 45;
                 }
             });
        } else {
            spawnParticles(engine, e.x, e.y, '#ef4444', 8);
        }
        
        // --- CAPITAL CROCODILE: COIN FOUNTAIN (Payout) ---
        if (e.config.type === 'capital_crocodile' && e.storedValue && e.storedValue > 0) {
            const payout = Math.floor(e.storedValue * 1.1);
            
            spawnFloatingText(engine, e.x, e.y - 60, `泡沫破裂! +${payout}`, '#facc15', 'gold');
            engine.audio.playCoin(); 
            
            engine.state.zones.push({
                 id: Math.random().toString(),
                 x: e.x, y: e.y,
                 radius: 200, 
                 type: 'explosion_shockwave',
                 life: 30,
                 maxLife: 30,
                 color: '#facc15', 
                 emoji: ''
            });
            
            for(let k=0; k<10; k++) {
                spawnParticles(engine, e.x, e.y, ['#facc15', '#fbbf24', '#ffffff'][k%3], 5);
            }

            // Visual Fountain (Optimized count)
            const coinCount = Math.min(15, Math.max(5, Math.ceil(payout / 50))); 
            const valuePerCoin = Math.ceil(payout / coinCount);
            
            // NOTE: We push directly to avoid immediate merge, but use DropSystem type structure
            for(let i=0; i<coinCount; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 10 + Math.random() * 15;

                engine.state.drops.push({
                    id: Math.random().toString(),
                    x: e.x, 
                    y: e.y,
                    radius: 10,
                    emoji: '💰',
                    type: 'gold',
                    value: valuePerCoin,
                    life: 2700, 
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    pickupDelay: 90,
                    friction: 0.94
                });
            }
        }

        // --- KILL STREAK LOGIC (Endless / Musou Mode) ---
        if (engine.state.killStreak !== undefined) {
            engine.state.killStreak++;
            engine.state.killStreakTimer = 120; // 2 seconds to keep streak
            
            const k = engine.state.killStreak;
            // Feedback at specific thresholds or intervals
            if (k >= 10) {
                if (k % 100 === 0) {
                    spawnFloatingText(engine, p.x, p.y - 80, `${k} 杀!`, '#a855f7', 'chat', undefined, true); // Purple (Godlike)
                    engine.audio.playPowerup();
                } else if (k === 50) {
                    spawnFloatingText(engine, p.x, p.y - 80, "割草无双!", "#ef4444", 'chat', undefined, true); // Red
                } else if (k === 20) {
                    spawnFloatingText(engine, p.x, p.y - 80, "KILL STREAK!", "#facc15", 'chat');
                } else if (k % 10 === 0 && k < 50) {
                    spawnFloatingText(engine, p.x, p.y - 60, `${k} COMBO!`, "#ffffff", 'chat');
                }
            }
        }

        engine.state.waveStats.enemiesKilled++;

        let earnedGold = BattleFormulas.getKillGold(
            e.config.score,
            engine.state.difficultyId,
            p.incomeMultiplier,
            engine.state.isOvertime
        );
        
        if (engine.state.activeMutators.includes('salary_cut')) {
            earnedGold = Math.floor(earnedGold * 0.7);
        }
        
        // --- DOUBLE GOLD LOGIC (Capital L6) ---
        if (doubleGold) {
            earnedGold *= 2;
            spawnFloatingText(engine, e.x, e.y - 50, "双倍金币!", "#facc15", 'gold');
        }
        
        // Score updates immediately
        engine.state.score += earnedGold;
        
        // --- GOLD UPDATE: Spawn via DropSystem (Auto Merge) ---
        if (earnedGold > 0) {
            DropSystem.spawnGold(engine, e.x, e.y, earnedGold);
        }

        if (e.config.behavior === 'bonus') {
            spawnFloatingText(engine, e.x, e.y, `巨款掉落!`, '#fbbf24', 'gold');
            engine.state.waveStats.bonusGold += earnedGold;
            engine.audio.playCoin();
        }
        
        if (e.config.type === 'delivery_guy') {
            DropSystem.spawnPickup(engine, {
                id: Math.random().toString(),
                x: e.x, y: e.y,
                radius: 15,
                emoji: '🍱',
                type: 'big_health',
                value: 50,
                life: 999999
            });
        }
        
        // Hooks
        const inventoryCounts = new Map<string, number>();
        p.items.forEach(i => inventoryCounts.set(i, (inventoryCounts.get(i) || 0) + 1));

        for (const item of SHOP_ITEMS) {
            if (item.hooks?.onKill) {
                const identifier = item.items?.[0] || item.title;
                const count = inventoryCounts.get(identifier) || 0;

                if (count > 0) {
                    item.hooks.onKill(engine, e, count);
                }
            }
        }

        if (e.config.type === 'lemon_head') {
            engine.state.zones.push({
                id: Math.random().toString(),
                x: e.x, y: e.y,
                radius: 160, 
                emoji: '',
                type: 'acid',
                life: 180, 
                color: '#a3e635'
            });
        }

        if (e.config.type === 'tao_wa_big') {
            EnemySpawner.spawnEnemy(engine, 'tao_wa_med', e.x - 20, e.y);
            EnemySpawner.spawnEnemy(engine, 'tao_wa_med', e.x + 20, e.y);
        } else if (e.config.type === 'tao_wa_med') {
            EnemySpawner.spawnEnemy(engine, 'tao_wa_small', e.x - 15, e.y);
            EnemySpawner.spawnEnemy(engine, 'tao_wa_small', e.x + 15, e.y);
        }
        
        // VISUAL CLUTTER FIX: Reduced quote probability from 0.4 to 0.1
        if (e.config.deathQuotes && Math.random() < 0.1) {
            const isImportant = e.config.behavior === 'boss' || e.config.tier === 'boss' || e.config.tier === 'epic';
            if (isImportant || engine.state.enemies.length < 30) {
                const quote = e.config.deathQuotes[Math.floor(Math.random() * e.config.deathQuotes.length)];
                spawnFloatingText(engine, e.x, e.y, quote, '#cbd5e1', 'chat');
            }
        }

        if (BattleFormulas.shouldDropItem(p.dropRate)) { 
            DropSystem.spawnPickup(engine, {
                id: Math.random().toString(),
                x: e.x, y: e.y,
                radius: 15,
                emoji: '💊',
                type: 'health',
                value: 20,
                life: 999999 
            });
        }
    }
};
