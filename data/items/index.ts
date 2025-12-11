
import { UpgradeOption } from "../../types";
import { WEAPON_ITEMS } from "./weapons";
import { SURVIVAL_ITEMS } from "./survival";
import { ECONOMY_ITEMS } from "./economy";
import { SPECIAL_ITEMS } from "./special";
import { SUMMON_ITEMS } from "./summons";
import { PIERCE_ITEMS } from "./pierce";
import { MARKET_ITEMS } from "./market";
import { BOARD_ITEMS } from "./board";

// 合并所有分类的道具
export const SHOP_ITEMS: UpgradeOption[] = [
    ...WEAPON_ITEMS,
    ...SURVIVAL_ITEMS,
    ...ECONOMY_ITEMS,
    ...SPECIAL_ITEMS,
    ...SUMMON_ITEMS,
    ...PIERCE_ITEMS,
    ...MARKET_ITEMS,
    ...BOARD_ITEMS
];

// 导出分类列表以便未来可能需要单独访问
export { WEAPON_ITEMS, SURVIVAL_ITEMS, ECONOMY_ITEMS, SPECIAL_ITEMS, SUMMON_ITEMS, PIERCE_ITEMS, MARKET_ITEMS, BOARD_ITEMS };
