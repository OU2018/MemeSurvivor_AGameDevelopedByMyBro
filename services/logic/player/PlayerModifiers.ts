
import { IGameEngine } from "../../../types";
import { SynergyLogic } from "../synergyLogic";

export interface PlayerModifiers {
    synergyRegenBonus: number;
    synergyFlatAPS: number;
    synergyFlatProjectileSpeed: number;
    synergyExplosionRangeMult: number;
    attackSpeedMult: number;
}

export const PlayerModifiers = {
    calculate: (engine: IGameEngine): PlayerModifiers => {
        const p = engine.state.player;
        const counts = SynergyLogic.getSynergyCounts(p.items);
        const tiers = SynergyLogic.getActiveTiers(counts);

        let synergyRegenBonus = 0;
        let synergyFlatAPS = 0;
        let synergyFlatProjectileSpeed = 0;
        let synergyExplosionRangeMult = 1.0;
        let attackSpeedMult = 1.0;

        // Slacker (2): +1% Max HP Regen/sec
        if ((tiers['slacker'] || 0) >= 2) {
            synergyRegenBonus += Math.max(1, Math.floor(p.maxHp * 0.01));
        }

        // Hardcore (2): +0.5 APS, +1.5 Flat Projectile Speed
        if ((tiers['hardcore'] || 0) >= 2) {
            synergyFlatAPS += 0.5;
            synergyFlatProjectileSpeed += 1.5;
        }

        // Market (2): +25% Explosion Range
        if ((tiers['market'] || 0) >= 2) {
            synergyExplosionRangeMult = 1.25;
        }

        // HR (4): +0.1 APS per summon
        p.summonCooldownSpeed = 1.0; // Reset base
        if ((tiers['hr'] || 0) >= 4) {
            p.summonCooldownSpeed = 0.7; // 30% reduction
            const activeSummons = engine.state.projectiles.filter(proj => proj.isSummon).length;
            synergyFlatAPS += activeSummons * 0.1;
        }

        // Wolf Culture Item: Missing HP -> Attack Speed
        if (p.items.includes('狼性文化')) {
            const missingHpPct = Math.max(0, (p.maxHp - p.hp) / p.maxHp);
            attackSpeedMult *= (1 + missingHpPct);
        }

        // --- NEW: Viral Marketing ---
        if (p.items.includes('病毒式营销')) {
            const enemyCount = engine.state.enemies.length;
            const bonus = Math.min(0.25, enemyCount * 0.01);
            attackSpeedMult *= (1 + bonus);
        }

        // --- NEW: Mouse Macro ---
        if (p.items.includes('鼠标连点器')) {
            // Re-using standStillTimer logic
            if (p.standStillTimer > 0) {
                // Increase macro stack (max 5 seconds -> 50%)
                if (p.customTimers['macro_stack'] === undefined) p.customTimers['macro_stack'] = 0;
                // Add 10% per second (60 frames)
                if (p.standStillTimer % 60 === 0) {
                    p.customTimers['macro_stack'] = Math.min(0.5, p.customTimers['macro_stack'] + 0.1);
                }
                attackSpeedMult *= (1 + p.customTimers['macro_stack']);
            } else {
                p.customTimers['macro_stack'] = 0;
            }
        }

        return {
            synergyRegenBonus,
            synergyFlatAPS,
            synergyFlatProjectileSpeed,
            synergyExplosionRangeMult,
            attackSpeedMult
        };
    }
};
