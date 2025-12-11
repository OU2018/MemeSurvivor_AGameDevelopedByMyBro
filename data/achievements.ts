
import { Achievement } from "../types";
import { GENERAL_ACHIEVEMENTS } from "./achievements/general";
import { COMBAT_ACHIEVEMENTS } from "./achievements/combat";
import { ECONOMY_ACHIEVEMENTS } from "./achievements/economy";

// --- 聚合所有成就 ---
// 这个文件现在作为统一入口，从子文件夹中读取分类好的成就配置
export const ACHIEVEMENTS: Achievement[] = [
    ...GENERAL_ACHIEVEMENTS,
    ...COMBAT_ACHIEVEMENTS,
    ...ECONOMY_ACHIEVEMENTS
];

// 同时也导出分类列表，以便未来有特定需求时使用
export { GENERAL_ACHIEVEMENTS, COMBAT_ACHIEVEMENTS, ECONOMY_ACHIEVEMENTS };
