
import { IGameEngine } from "../../../types";
import { ENEMIES } from "../../../../data/enemies";
import { BattleFormulas } from "../formulas";
import { unlockEntry } from "../../upgradeLogic";
import { PoolUtils } from "../../utils";

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

        // USE POOL
        const e = PoolUtils.getEnemy(engine);
        
        e.x = x; 
        e.y = y;
        e.radius = baseRadius;
        e.emoji = config.emoji;
        e.hp = config.hp * hpMult;
        e.maxHp = config.hp * hpMult;
        e.config = config;
        e.vx = 0; e.vy = 0;
        e.attackCooldown = 60 + Math.random() * 60;
        e.attackState = 0;
        e.stateTimer = 0;
        e.phase = 1;
        
        // Ensure reset
        e.isTransitioning = false;
        e.dashTimer = 0;
        e.isAimingDash = false;
        e.stunTimer = 0;
        e.burstQueue = [];
        e.burstTimer = 0;
        e.warningTimer = 0;
        
        engine.state.enemies.push(e);
    },

    spawnSingleBullet: (engine: IGameEngine, e: any, angle: number, isExplosive: boolean = false, overrideChar?: string) => {
        engine.audio.playEnemyShoot(e.config.type);

        const dmgMult = BattleFormulas.getEnemyDamageMultiplier(
            engine.state.difficultyId,
            engine.state.currentWave,
            engine.state.isEndless,
            engine.state.endlessWaveCount
        );

        // USE POOL
        const proj = PoolUtils.getProjectile(engine);
        proj.x = e.x; proj.y = e.y;
        proj.radius = e.config.projectileSize || 15;
        proj.emoji = overrideChar || e.config.projectileChar || '';
        proj.vx = Math.cos(angle) * 7;
        proj.vy = Math.sin(angle) * 7;
        proj.damage = e.config.damage * dmgMult;
        proj.life = 180;
        proj.isEnemy = true;
        proj.color = e.config.projectileColor || '#ef4444';
        proj.text = overrideChar || e.config.projectileChar || '';
        proj.angle = angle;
        proj.sourceType = e.config.type;
        proj.isExplosive = isExplosive;
        proj.maxExplosionRadius = isExplosive ? 120 : 0;
        
        // --- Apply Custom Render Style from Config ---
        if (e.config.projectileRenderStyle) {
            proj.renderStyle = e.config.projectileRenderStyle;
        } else {
            proj.renderStyle = undefined; // Reset
        }
        
        engine.state.projectiles.push(proj);
    }
};
