
import { Achievement } from "../../types";
import { GENERAL_ACHIEVEMENTS } from "./general";
import { COMBAT_ACHIEVEMENTS } from "./combat";
import { ECONOMY_ACHIEVEMENTS } from "./economy";

// 特殊成就：公司倒闭 (All Clear)
const ALL_CLEAR_ACHIEVEMENT: Achievement = { 
    id: 'all_clear', 
    title: '公司倒闭', 
    description: '解锁所有其他成就（除了这个）。', 
    icon: '🏢', 
    unlocked: false, 
    condition: (s, stats) => false, // 逻辑由 checkAchievements 特殊处理
    reward: { shopDiscount: -0.1 }, // Additive logic: 1.0 + (-0.1) = 0.9
    rewardDescription: "商店永久 9 折"
};

// 聚合所有成就，并将 All Clear 放在最后
export const ACHIEVEMENTS: Achievement[] = [
    ...GENERAL_ACHIEVEMENTS,
    ...COMBAT_ACHIEVEMENTS,
    ...ECONOMY_ACHIEVEMENTS,
    ALL_CLEAR_ACHIEVEMENT
];

// 为了保持引用兼容性，这里也可以导出具体的分类（如果需要）
export { GENERAL_ACHIEVEMENTS, COMBAT_ACHIEVEMENTS, ECONOMY_ACHIEVEMENTS };
