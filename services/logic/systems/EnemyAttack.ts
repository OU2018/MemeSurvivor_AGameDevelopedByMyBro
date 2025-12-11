
import { IGameEngine } from "../../../types";
import { BossAi } from "../battle/bossAi";
import { EnemySpawner } from "./EnemySpawner";

export const EnemyAttack = {
    // 处理连发队列（如键盘侠的连喷）
    handleBurstQueue: (engine: IGameEngine, e: any, p: any) => {
        if (e.burstQueue && e.burstQueue.length > 0) {
            e.burstTimer = (e.burstTimer || 0) - 1;
            if (e.burstTimer <= 0) {
                const char = e.burstQueue.shift();
                if (char) {
                    const aimAngle = Math.atan2(p.y - e.y, p.x - e.x);
                    EnemySpawner.spawnSingleBullet(engine, e, aimAngle, false, char);
                    e.burstTimer = 15; 
                }
            }
            // 射击时停止移动
            if (e.config.type === 'keyboard_man' || e.config.behavior === 'shooter') {
                e.vx = 0; e.vy = 0;
            }
        }
    },

    performEnemyAttack: (engine: IGameEngine, e: any, p: any, dist: number) => {
        if (e.config.behavior === 'chase' || e.config.behavior === 'rusher' || e.config.behavior === 'circle' || e.config.behavior === 'minion' || e.config.behavior === 'bonus' || e.config.behavior === 'support' || e.config.behavior === 'linker' || e.config.behavior === 'spawner' || e.config.behavior === 'summoner_orbit' || e.config.behavior === 'devourer' || e.config.behavior === 'balloon') return;
        if (e.config.type === 'river_crab') return;
        if (e.isTransitioning) return;
        if (e.stunTimer && e.stunTimer > 0) return;

        if (e.attackCooldown > 0) {
            e.attackCooldown--;
            return;
        }

        const aimAngle = Math.atan2(p.y - e.y, p.x - e.x);

        if (e.config.type === 'clown') return;

        if (e.config.behavior === 'boss') {
            BossAi.updateBossBehavior(engine, e, p, EnemySpawner.spawnSingleBullet);
            return;
        }

        const pattern = e.config.attackPattern || 'single';
        
        if (pattern === 'burst') {
            if (dist < 800) {
                if (e.config.burstPhrases && e.config.burstPhrases.length > 0) {
                    const phrase = e.config.burstPhrases[Math.floor(Math.random() * e.config.burstPhrases.length)];
                    e.burstQueue = phrase.split('').slice(0, 5); 
                } else {
                    e.burstQueue = ['急', '急', '急'];
                }
                e.burstTimer = 0;
                e.attackCooldown = 180;
            }
        } else if (pattern === 'single') {
            if (dist < 800) { 
                EnemySpawner.spawnSingleBullet(engine, e, aimAngle);
                e.attackCooldown = e.config.type === 'turret' ? 30 : 120;
            }
        } else if (pattern === 'spread') {
            if (dist < 600) {
                EnemySpawner.spawnSingleBullet(engine, e, aimAngle - 0.2);
                EnemySpawner.spawnSingleBullet(engine, e, aimAngle);
                EnemySpawner.spawnSingleBullet(engine, e, aimAngle + 0.2);
                e.attackCooldown = 150;
            }
        } else if (pattern === 'explode') {
            if (dist < 700) {
                EnemySpawner.spawnSingleBullet(engine, e, aimAngle, true);
                e.attackCooldown = 180;
            }
        }
    }
};
