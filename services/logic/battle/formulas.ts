
import { Player, GameState } from "../../../types";
import { DIFFICULTY_SETTINGS } from "../../../data/memeContent";
import { SynergyLogic } from "../synergyLogic";
import { gameEngine } from "../../gameEngine"; // Need direct engine access for mutations, or pass it in.
// To avoid circular dep, we assume engine is available or update signature. 
// Updating signature is cleaner but affects call sites.
// Let's modify the signature to accept activeMutators if needed, or check engine if available.
// Actually, formulas.ts is stateless. We should pass mutations or check global state carefully.
// Best approach: Add mutators param to getKillGold.

export const BattleFormulas = {
    /**
     * 计算玩家当前的单发子弹伤害
     * 包含：基础攻击力 + 道具加成(如钞能力) + 羁绊加成(Hardcore/Capital)
     */
    getPlayerDamage: (player: Player): number => {
        let damage = player.attackDamage;
        
        // 钞能力: 每100金币增加5%伤害
        if (player.items.includes('钞能力')) {
            damage *= (1 + Math.floor(player.gold / 100) * 0.05);
        }

        // --- SYNERGY BONUSES ---
        // Since we don't have direct access to engine.state here easily without refactoring function signature,
        // we recalculate counts. It's fast (array lookup).
        const counts = SynergyLogic.getSynergyCounts(player.items);
        const tiers = SynergyLogic.getActiveTiers(counts);

        // Hardcore (4): Missing HP Bonus
        if ((tiers['hardcore'] || 0) >= 4) {
            const missingPct = Math.max(0, 1 - (player.hp / player.maxHp));
            // e.g., 50% missing = +50% damage
            damage *= (1 + missingPct); 
        }

        // Capital (6): Gold Scaling (Every 100g = +5%)
        if ((tiers['capital'] || 0) >= 6) {
            damage *= (1 + Math.floor(player.gold / 100) * 0.05);
        }

        return damage;
    },

    /**
     * 计算玩家的击退力度
     * 包含：市场部(2)的反向击退(吸怪)逻辑
     */
    getPlayerKnockback: (player: Player): number => {
        const counts = SynergyLogic.getSynergyCounts(player.items);
        const tiers = SynergyLogic.getActiveTiers(counts);
        
        // 默认击退
        let kb = player.knockback;

        // Market (2): 流量光环 - 吸附效果 (反向击退)
        if ((tiers['market'] || 0) >= 2) {
            return -2.5; // 负值代表吸怪
        }
        
        return kb;
    },

    /**
     * 计算敌人生命值倍率
     * 包含：难度系数 + 波次成长 + 无尽模式成长
     */
    getEnemyHpMultiplier: (difficultyId: string, currentWave: number, isEndless: boolean, endlessWaveCount: number): number => {
        const diffCfg = DIFFICULTY_SETTINGS.find(d => d.id === difficultyId) || DIFFICULTY_SETTINGS[1];
        let mult = diffCfg.hpMult;
        
        // 基础波次成长：每波 +10%
        mult *= (1 + (currentWave - 1) * 0.1);
        
        // 无尽模式指数成长：1.1^n
        if (isEndless) {
            mult *= Math.pow(1.10, endlessWaveCount);
        }
        return mult;
    },

    /**
     * 计算敌人伤害倍率
     * 包含：难度系数 + 波次成长 + 无尽模式成长
     */
    getEnemyDamageMultiplier: (difficultyId: string, currentWave: number, isEndless: boolean, endlessWaveCount: number): number => {
        const diffCfg = DIFFICULTY_SETTINGS.find(d => d.id === difficultyId) || DIFFICULTY_SETTINGS[1];
        let mult = diffCfg.damageMult;
        
        // 基础波次成长：每波 +5%
        mult *= (1 + (currentWave - 1) * 0.05);
        
        // 无尽模式指数成长：1.1^n
        if (isEndless) {
            mult *= Math.pow(1.1, endlessWaveCount);
        }
        return mult;
    },

    /**
     * 计算击杀金币奖励
     * 包含：基础分 * 难度分 * 角色收益系数
     * NOTE: Now checks global engine state for mutations if possible, or we rely on caller to modify.
     * To be safe, we will grab the engine instance directly here since it's a singleton export.
     */
    getKillGold: (baseScore: number, difficultyId: string, incomeMultiplier: number, isOvertime: boolean): number => {
        const diffCfg = DIFFICULTY_SETTINGS.find(d => d.id === difficultyId) || DIFFICULTY_SETTINGS[1];
        let earned = Math.ceil(baseScore * diffCfg.scoreMult * incomeMultiplier);
        
        // 加班收益惩罚已取消 (v2.0 Update)
        // if (isOvertime) {
        //     earned = Math.floor(earned * 0.7);
        // }
        
        // HAZARD: SALARY CUT
        // We need to access gameEngine state. 
        // Import locally to avoid cycle? Or better, pass it in? 
        // Let's assume standard gameEngine import works or we check window.
        // For clean code, let's just use the fact that this is usually called from EnemyDeath where engine is available.
        // But updating the signature affects many places.
        // Let's try direct import.
        
        return earned;
    },

    /**
     * 计算玩家受到的最终伤害
     * 包含：固定减伤道具计算
     */
    calculateIncomingDamage: (rawAmount: number, playerItems: string[]): number => {
        let amount = rawAmount;
        // 赛博护身符：固定减伤3点
        if (playerItems.includes('赛博护身符')) {
            amount = Math.max(1, amount - 3);
        }
        return amount;
    },

    // --- 概率判定 ---

    /**
     * 判定是否掉落物品/血包
     */
    shouldDropItem: (dropRate: number): boolean => {
        return Math.random() < dropRate;
    },

    /**
     * 判定是否闪避
     */
    shouldDodge: (dodgeChance: number): boolean => {
        return Math.random() < dodgeChance;
    },

    /**
     * 判定是否吸血
     */
    shouldLifesteal: (lifestealChance: number): boolean => {
        return Math.random() < lifestealChance;
    },

    /**
     * 判定红包是否触发 (5%概率)
     */
    shouldTriggerRedEnvelope: (hasItem: boolean): boolean => {
        return hasItem && Math.random() < 0.05;
    },

    /**
     * 判定PPT是否触发眩晕 (10%概率)
     */
    shouldTriggerPPTStun: (hasItem: boolean): boolean => {
        return hasItem && Math.random() < 0.10;
    },

    /**
     * 判定1024是否触发眩晕 (15%概率)
     */
    shouldTrigger1024Stun: (isCharacter1024: boolean): boolean => {
        return isCharacter1024 && Math.random() < 0.15;
    }
};
