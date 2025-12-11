
import { IGameEngine, Projectile, TrailConfig, Entity } from "../../../types";
import { PoolUtils, spawnFloatingText } from "../utils";
import { BattleFormulas } from "../battle/formulas";
import { GameEventType } from "../events/events";
import { SynergyLogic } from "../synergyLogic";
import { BULLET_TEXTS, WORKER_QUOTES } from "../../../data/events";

export const BulletFactory = {
    
    // --- 1. CLEANER MELEE SWING ---
    createMeleeSwing: (engine: IGameEngine, angle: number) => {
        const p = engine.state.player;
        const visualScale = p.radius / 24;
        const sweepRadius = 110 * visualScale;
        p.swingCount = (p.swingCount || 0) + 1;
        const swingDir = 1; 

        const proj = PoolUtils.getProjectile(engine);
        proj.x = p.x; 
        proj.y = p.y;
        proj.radius = sweepRadius; 
        proj.emoji = ''; 
        proj.vx = 0; 
        proj.vy = 0;
        proj.damage = BattleFormulas.getPlayerDamage(p);
        proj.life = 24; 
        proj.maxLife = 24;
        proj.isEnemy = false;
        proj.color = '#e2e8f0';
        proj.text = ''; 
        proj.pierce = 999;
        proj.angle = angle; 
        proj.sourceType = 'cleaner';
        proj.isSweeper = true;
        proj.swingDirection = swingDir; 
        proj.behaviors = ['stick_to_player', 'decay_life', 'sweep_bullets'];
        proj.renderStyle = 'melee_swing'; 
        
        engine.state.projectiles.push(proj);
    },

    // --- 2. WEALTH COIN (Capital L6) ---
    createWealthCoin: (engine: IGameEngine, angle: number, speedMult: number, flatSpeedBonus: number) => {
        const p = engine.state.player;
        const coinProj = PoolUtils.getProjectile(engine);
        // Damage = current gold (min 10)
        const coinDamage = Math.max(10, p.gold);
        const coinSpeed = (p.projectileSpeed + flatSpeedBonus) * speedMult * 0.8; // Slower, heavier

        coinProj.x = p.x; 
        coinProj.y = p.y;
        coinProj.radius = 25; // Big coin
        coinProj.emoji = '💰'; 
        coinProj.vx = Math.cos(angle) * coinSpeed;
        coinProj.vy = Math.sin(angle) * coinSpeed;
        coinProj.damage = coinDamage;
        coinProj.life = 120;
        coinProj.isEnemy = false;
        coinProj.color = '#facc15';
        coinProj.text = '💰';
        coinProj.pierce = 3; // Good pierce
        coinProj.angle = angle;
        coinProj.sourceType = 'player';
        coinProj.renderStyle = 'gold_coin'; // Tag for renderer & collision logic
        coinProj.behaviors = ['move_linear', 'decay_life', 'check_bounds'];
        // Gold trail
        coinProj.trailConfig = { type: 'spark', color: '#facc15', interval: 4, timer: 0 };
        
        // CAPITAL L6: Enable Double Gold on Kill
        coinProj.isWealthCoin = true;

        engine.state.projectiles.push(coinProj);
        spawnFloatingText(engine, p.x, p.y - 40, "撒币!", "#facc15", 'chat');
    },

    // --- 3. NEON RAIN (Board L6) ---
    // UPDATED: Hybrid Tracking (Target ID + Snapshot Coordinates)
    createNeonRain: (engine: IGameEngine, tx: number, ty: number, color: string, delayFrames: number = 0, targetId?: string) => {
        const p = engine.state.player;
        const proj = PoolUtils.getProjectile(engine);
        
        // Massive Damage: 5x Player Damage
        const damage = BattleFormulas.getPlayerDamage(p) * 5.0;

        // Start at Player Position
        proj.x = p.x;
        proj.y = p.y;
        proj.z = 20; // Player height
        
        // Fountain Ejection Velocity
        const angle = Math.random() * Math.PI * 2;
        const speed = 5 + Math.random() * 8; // Spread horizontal speed
        
        proj.vx = Math.cos(angle) * speed;
        proj.vy = Math.sin(angle) * speed;
        proj.vz = 25 + Math.random() * 10; // High vertical launch
        
        proj.radius = 20;
        proj.emoji = '⚡'; 
        proj.damage = damage;
        proj.life = 999; // Life controlled by collision or physics behavior
        proj.isEnemy = false;
        proj.color = color;
        proj.text = '';
        proj.pierce = 0; 
        proj.sourceType = 'player';
        proj.renderStyle = 'neon_missile';
        
        // Render Over Mask
        proj.isAerial = true;

        // Target Tracking
        proj.tx = tx;
        proj.ty = ty;
        proj.targetId = targetId; // Assign target ID if available
        
        // --- PHYSICS CONFIG ---
        // 'neon_fountain' handles the Ejection -> Hover -> Homing sequence
        proj.behaviors = ['neon_fountain', 'explode_on_expire', 'update_explosion'];
        
        // Pooling props reset
        proj.fireCooldown = delayFrames; // Use fireCooldown as spawn delay timer
        proj.trailHistory = []; // Reset Trail History for the Ribbon renderer
        
        // Impact Config
        proj.isExplosive = true;
        proj.explodeOnExpire = true; 
        proj.maxExplosionRadius = 130; 
        
        // VISUAL: No particle trail. We use the Ribbon renderer.
        proj.trailConfig = undefined; 
        
        // Damage Window: 3 frames of hurt
        proj.damageWindow = 3;
        
        engine.state.projectiles.push(proj);
    },

    // --- 4. STANDARD PLAYER PROJECTILE ---
    createPlayerProjectile: (
        engine: IGameEngine,
        dir: number,
        originX: number,
        originY: number,
        speedMult: number,
        flatSpeedBonus: number,
        explosionRangeMult: number,
        isClone: boolean = false,
        cloneSource?: any
    ) => {
        const p = engine.state.player;
        const counts = SynergyLogic.getSynergyCounts(p.items);
        const tiers = SynergyLogic.getActiveTiers(counts);

        // --- Defaults ---
        let text = p.characterId === '007' ? '💣' : '';
        let radius = 20;
        let color = '#a5f3fc';
        let isExplosive = false; 
        let explodeOnExpire = false;
        let damage = BattleFormulas.getPlayerDamage(p);
        let pierce = p.projectilePierce;
        let renderStyle = 'text';
        let trailConfig: TrailConfig | undefined = undefined;
        let behaviors: string[] = ['move_linear', 'decay_life', 'check_bounds', 'emit_trail'];

        // --- CRIT CALCULATION ---
        let isCrit = false;
        // Hardcore (6) OVERCLOCK: Guaranteed Crit
        let finalCritChance = p.isOverclocked ? 1.0 : p.critChance;
        
        // Apply Clone inheritance
        if (isClone && cloneSource) {
            if (cloneSource.critChance > 0) {
                finalCritChance = Math.max(finalCritChance, cloneSource.critChance);
            }
        }

        if (Math.random() < finalCritChance) {
            isCrit = true;
            damage *= p.critDamage;
        }

        // --- CHARACTER SPECIFICS ---
        if (p.characterId === '1024') {
            color = '#4ade80'; 
            trailConfig = { type: 'pixel', color: '#22c55e', interval: 3, timer: 0 };
            behaviors = ['move_linear', 'sine_wave', 'decay_life', 'check_bounds', 'emit_trail'];
        } 
        else if (p.characterId === '007') {
            color = '#fbbf24';
            trailConfig = { type: 'smoke', color: '#78716c', interval: 3, timer: 0, size: 8 };
            behaviors = ['move_linear', 'friction', 'decay_life', 'check_bounds', 'explode_on_expire', 'update_explosion', 'emit_trail'];
            isExplosive = true; 
            explodeOnExpire = true; 
        }

        // --- SYNERGY PROPS (Tech) ---
        // Tech 2: 20% Chance to chain
        // Tech 4: 50% Chance to chain
        let canChain = false;
        if ((tiers['tech'] || 0) >= 4) {
            if (Math.random() < 0.5) canChain = true;
        } else if ((tiers['tech'] || 0) >= 2) {
            if (Math.random() < 0.2) canChain = true;
        }

        // --- CLONE MODIFIERS ---
        if (isClone) {
            text = '♦'; 
            damage = damage * 0.5; 
            pierce = 0; 
            if (cloneSource && cloneSource.pierce > 0) {
                pierce = cloneSource.pierce;
            }
            const rangeMult = cloneSource?.rangeMultiplier || 1;
            
            behaviors = ['move_linear', 'decay_life', 'check_bounds'];
            
            if (p.characterId === '007') {
                behaviors = ['move_linear', 'decay_life', 'check_bounds', 'explode_on_expire', 'update_explosion'];
                isExplosive = true;
                explodeOnExpire = true;
            }

            // USE POOL
            const proj = PoolUtils.getProjectile(engine);
            
            const explosionBase = p.explosionRangeMultiplier || 1.0;
            const finalExplosionMult = explosionBase * explosionRangeMult;

            // Assign properties
            proj.x = originX; proj.y = originY;
            proj.radius = 14;
            proj.emoji = '♦';
            proj.vx = Math.cos(dir) * p.projectileSpeed;
            proj.vy = Math.sin(dir) * p.projectileSpeed;
            proj.damage = damage;
            // UPDATED: Increase clone bullet life
            proj.life = Math.floor(100 * rangeMult); // Increased from 60
            proj.isEnemy = false;
            proj.color = '#22d3ee';
            proj.text = '♦';
            proj.pierce = pierce;
            proj.angle = dir;
            proj.sourceType = 'summon';
            proj.critChance = cloneSource?.critChance || 0;
            proj.isCrit = isCrit; 
            proj.isExplosive = isExplosive;
            proj.explodeOnExpire = explodeOnExpire;
            proj.maxExplosionRadius = (isExplosive ? 120 : 80) * finalExplosionMult;
            proj.renderStyle = renderStyle;
            proj.behaviors = behaviors;
            proj.trailConfig = trailConfig;
            
            // Clones inherit tech properties (but lower chance if needed, here inheriting logic from parent call)
            proj.canChain = canChain; 
            proj.bounceCount = 0; // Tech bounce removed

            engine.state.projectiles.push(proj);
            return;
        }

        // --- DETERMINE TEXT & EMOJI ---
        if (!text) {
            text = BulletFactory.getBulletText(engine, p);
            
            // Adjust radius based on text
            const isSmall = [".", ";", "?", ",", "{", "}"].includes(text);
            if (p.characterId === 'ev_creator') {
                radius = 22;
            } else if (p.characterId === '1024') {
                radius = isSmall ? 12 : 20;
                radius += (Math.random() * 10 - 5);
            }
        }
        
        // Visual for Crit
        if (isCrit) {
            radius *= 1.2;
            color = '#f87171'; 
            if (p.isOverclocked) {
                color = '#ef4444'; 
                text += "!";
            }
        }

        // --- EV CREATOR EFFECTS ---
        if (p.characterId === 'ev_creator') {
            const roll = Math.random();
            color = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7'][Math.floor(Math.random() * 6)]; 
            if (roll < 0.20) {
                if(!behaviors.includes('explode_on_expire')) behaviors.push('explode_on_expire', 'update_explosion');
                isExplosive = true;
                explodeOnExpire = true;
                text = "Error";
                color = '#ef4444';
                engine.emit(GameEventType.FLOATING_TEXT, { x: p.x, y: p.y - 50, text: "ERROR!", color: "#ef4444", category: 'damage' });
            } else if (roll < 0.30) {
                if (p.hp < p.maxHp) {
                    p.hp = Math.min(p.maxHp, p.hp + 1);
                    engine.emit(GameEventType.FLOATING_TEXT, { x: p.x, y: p.y - 30, text: "修复+1", color: "#22c55e", category: 'damage' });
                    engine.emit(GameEventType.ITEM_PICKUP); 
                }
            } else if (roll < 0.40) {
                const gain = Math.floor(Math.random() * 3) + 1;
                p.gold += gain;
                // Floating text removed for random gold gain
                engine.emit(GameEventType.ITEM_PICKUP); 
            }
        }
        
        // --- ITEM EFFECTS ---
        if (p.items.includes('二极管')) {
            if (Math.random() > 0.5) {
                damage = damage * 3;
                color = '#facc15'; 
                isCrit = true; 
            } else {
                damage = 1;
                color = '#94a3b8'; 
            }
        }

        if (p.items.includes('转发抽奖')) {
            if (Math.random() < 0.01) {
                damage = 9999;
                text = "中奖!";
                color = '#facc15';
                radius = 30;
                isExplosive = true;
                explodeOnExpire = true;
                if(!behaviors.includes('explode_on_expire')) behaviors.push('explode_on_expire', 'update_explosion');
                engine.emit(GameEventType.FLOATING_TEXT, { x: p.x, y: p.y - 60, text: "9999!", color: "#facc15", category: 'damage' });
            }
        }
        
        if (p.characterId === '007' && !isExplosive) {
             renderStyle = 'text'; 
        }

        // Apply Projectile Speed Multiplier
        const speed = (p.projectileSpeed + flatSpeedBonus) * speedMult * (p.characterId === '007' ? 3.5 : 1);

        // USE POOL
        const proj = PoolUtils.getProjectile(engine);
        
        const explosionBase = p.explosionRangeMultiplier || 1.0;
        const finalExplosionMult = explosionBase * explosionRangeMult;

        proj.x = originX; proj.y = originY;
        proj.radius = radius;
        proj.emoji = text;
        proj.vx = Math.cos(dir) * speed;
        proj.vy = Math.sin(dir) * speed;
        proj.damage = damage;
        proj.life = 140; // Increased from 120
        proj.isEnemy = false;
        proj.color = color;
        proj.text = text;
        proj.pierce = pierce;
        proj.angle = dir;
        proj.sourceType = 'player';
        proj.isCrit = isCrit; 
        proj.isExplosive = isExplosive;
        proj.explodeOnExpire = explodeOnExpire;
        proj.maxExplosionRadius = (isExplosive ? 120 : 80) * finalExplosionMult;
        proj.renderStyle = renderStyle;
        proj.behaviors = behaviors;
        proj.trailConfig = trailConfig;
        
        // Tech Props
        proj.canChain = canChain;
        proj.bounceCount = 0; // Bounce removed

        engine.state.projectiles.push(proj);
    },

    // Helper to determine text
    getBulletText: (engine: IGameEngine, p: any): string => {
        if (p.characterId === '9527') {
            const sentences = WORKER_QUOTES;
            const currentSentence = sentences[p.speechSentenceIndex % sentences.length];
            const char = currentSentence[p.speechCharIndex];
            
            // Advance speech state
            p.speechCharIndex++;
            if (p.speechCharIndex >= currentSentence.length) {
                p.speechCharIndex = 0;
                p.speechSentenceIndex++;
                p.speechPauseTimer = p.attackSpeed; // Pause after sentence
            }
            return char;
        } 
        else if (p.characterId === '1024') {
            const texts = ["Bug", "404", "null", ";", "{}", "&&", ".", ".", "if", "else", "var", "git", "sudo", "rm", "TODO", "//", "const", "let", "=>", "await", "try", "catch", "void"];
            return texts[Math.floor(Math.random() * texts.length)];
        }
        else if (p.characterId === 'ev_creator') {
            const texts = ["重构", "回滚", "上线", "编译", "运行", "调试", "优化", "合并", "提交", "推送", "拉取", "部署", "通过", "驳回", "封包", "热更", "日志", "断点"];
            return texts[Math.floor(Math.random() * texts.length)];
        }
        else {
            return BULLET_TEXTS[Math.floor(Math.random() * BULLET_TEXTS.length)];
        }
    }
};
