
import { IGameEngine } from "../../../types";
import { spawnFloatingText, spawnParticles } from "../../utils";
import { BattleFormulas } from "../formulas";
import { unlockAchievement } from "../../upgradeLogic";
import { EnemySpawner } from "./EnemySpawner";

export const EnemyDeath = {
    triggerBossTransition: (engine: IGameEngine, e: any) => {
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

    killEnemy: (engine: IGameEngine, index: number) => {
        const e = engine.state.enemies[index];
        const p = engine.state.player;
        
        if (e.config.behavior === 'boss') {
            unlockAchievement(engine, 'boss_killer');
            engine.state.waveEnded = true; 
            engine.state.enemies = []; 
        }

        if (engine.state.enemies[index]) {
            engine.state.enemies.splice(index, 1);
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
        
        engine.state.waveStats.enemiesKilled++;

        const earnedGold = BattleFormulas.getKillGold(
            e.config.score,
            engine.state.difficultyId,
            p.incomeMultiplier,
            engine.state.isOvertime
        );
        
        p.gold += earnedGold;
        engine.state.score += earnedGold;
        engine.state.waveStats.goldEarned += earnedGold;

        if (e.config.behavior === 'bonus') {
            spawnFloatingText(engine, e.x, e.y, `+${earnedGold} 巨款!`, '#fbbf24', 'gold');
            engine.state.waveStats.bonusGold += earnedGold;
            engine.audio.playCoin();
        }
        
        if (e.config.type === 'delivery_guy') {
            engine.state.drops.push({
                id: Math.random().toString(),
                x: e.x, y: e.y,
                radius: 15,
                emoji: '🍱',
                type: 'big_health',
                value: 50,
                life: 999999
            });
        }
        
        if (p.items.includes('裁员信')) {
            p.attackDamage += 0.5;
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
        
        if (e.config.deathQuotes && Math.random() < 0.4) {
            const quote = e.config.deathQuotes[Math.floor(Math.random() * e.config.deathQuotes.length)];
            spawnFloatingText(engine, e.x, e.y, quote, '#cbd5e1', 'chat');
        }
        
        // Item: B03 Fish Pond (养鱼塘)
        if (p.items.includes('养鱼塘') && Math.random() < 0.08) {
             engine.state.drops.push({
                id: Math.random().toString(),
                x: e.x, y: e.y,
                radius: 12,
                emoji: '💖',
                type: 'love_heart',
                value: 10,
                life: 600 
            });
        }

        if (BattleFormulas.shouldDropItem(p.dropRate)) { 
            engine.state.drops.push({
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
