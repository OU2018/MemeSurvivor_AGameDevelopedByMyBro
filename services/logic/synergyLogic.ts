
import { SHOP_ITEMS } from "../../data/items";
import { SYNERGIES } from "../../data/synergies";
import { GameState } from "../../types";

export const SynergyLogic = {
    /**
     * 根据物品列表统计各标签数量
     * 修改：现在基于唯一物品名称统计，重复购买相同物品不增加羁绊计数
     */
    getSynergyCounts: (items: string[]) => {
        const counts: Record<string, number> = {};
        
        // Step 1: Deduplicate items
        const uniqueItems = Array.from(new Set(items));

        uniqueItems.forEach(itemName => {
            // Find item definition by name (handle both direct title and items list match)
            const itemDef = SHOP_ITEMS.find(i => i.title === itemName || (i.items && i.items.includes(itemName)));
            if (itemDef && itemDef.tags) {
                itemDef.tags.forEach(tag => {
                    counts[tag] = (counts[tag] || 0) + 1;
                });
            }
        });
        return counts;
    },

    /**
     * 获取当前激活的羁绊层级列表
     * 返回格式: { 'slacker': 2, 'hardcore': 4 }
     */
    getActiveTiers: (counts: Record<string, number>) => {
        const activeTiers: Record<string, number> = {};
        
        Object.entries(counts).forEach(([tagId, count]) => {
            const config = SYNERGIES[tagId];
            if (!config) return;
            
            // Find highest active level
            let maxLevel = 0;
            for (const level of config.levels) {
                if (count >= level.count) {
                    maxLevel = level.count;
                } else {
                    break;
                }
            }
            if (maxLevel > 0) {
                activeTiers[tagId] = maxLevel;
            }
        });
        return activeTiers;
    },

    /**
     * Update the derivedStats in GameState based on current items
     * Call this whenever player items change
     */
    refreshDerivedStats: (state: GameState) => {
        const counts = SynergyLogic.getSynergyCounts(state.player.items);
        const tiers = SynergyLogic.getActiveTiers(counts);
        state.derivedStats = {
            synergies: counts,
            activeTiers: tiers
        };
    }
};
