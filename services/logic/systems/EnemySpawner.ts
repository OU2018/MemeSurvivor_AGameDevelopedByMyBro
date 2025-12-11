
import { IGameEngine } from "../../../types";
import { ENEMIES } from "../../../../data/enemies";
import { BattleFormulas } from "../formulas";
import { unlockEntry } from "../../upgradeLogic";

export const EnemySpawner = {
    spawnEnemy: (engine: IGameEngine, type: string, x: number, y: number) => {
        if (!ENEMIES[type]) {
            console.warn(`Enemy type ${type} not found!`);
            return;
        }
        unlockEntry(engine, type);

        const config = ENEMIES[type];
        
        const hpMult = BattleFormulas.getEnemyHpMultiplier(
            engine.state.difficultyId,
            engine.state.currentWave,
            engine.state.isEndless,
            engine.state.endlessWaveCount
        );

        const baseRadius = config.behavior === 'boss' ? 70 : (config.sizeScale ? 24 * config.sizeScale : 24);

        engine.state.enemies.push({
          id: Math.random().toString(),
          x, y,
          radius: baseRadius,
          emoji: config.emoji,
          hp: config.hp * hpMult,
          maxHp: config.hp * hpMult,
          config: config,
          vx: 0, vy: 0,
          attackCooldown: 60 + Math.random() * 60,
          attackState: 0,
          stateTimer: 0,
          phase: 1,
          isTransitioning: false,
          dashTimer: 0,
          isAimingDash: false,
          stunTimer: 0,
          burstQueue: [],
          burstTimer: 0,
          warningTimer: 0
        });
    },

    spawnSingleBullet: (engine: IGameEngine, e: any, angle: number, isExplosive: boolean = false, overrideChar?: string) => {
        engine.audio.playEnemyShoot(e.config.type);

        const dmgMult = BattleFormulas.getEnemyDamageMultiplier(
            engine.state.difficultyId,
            engine.state.currentWave,
            engine.state.isEndless,
            engine.state.endlessWaveCount
        );

        engine.state.projectiles.push({
            id: Math.random().toString(),
            x: e.x, y: e.y,
            radius: e.config.projectileSize || 15,
            emoji: overrideChar || e.config.projectileChar || '',
            vx: Math.cos(angle) * 7,
            vy: Math.sin(angle) * 7,
            damage: e.config.damage * dmgMult,
            life: 180,
            isEnemy: true,
            color: e.config.projectileColor || '#ef4444',
            text: overrideChar || e.config.projectileChar || '',
            pierce: 0,
            hitIds: [],
            angle: angle,
            sourceType: e.config.type,
            isExplosive: isExplosive,
            maxExplosionRadius: isExplosive ? 120 : 0,
            active: true
        });
    }
};