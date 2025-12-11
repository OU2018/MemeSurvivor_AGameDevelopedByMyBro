
import { UpgradeOption, GameState, Player } from "../../types";
import { CHARACTERS } from "../../data/events";
import { SynergyLogic } from "./synergyLogic";
import { SYNERGIES } from "../../data/synergies";

// --- 内部辅助：检查物品是否允许出现在商店 ---
const checkAvailability = (item: UpgradeOption, player: Player, currentWave: number, shopState: GameState['shopState']): boolean => {
    // 1. 数量限制 (Max Count)
    if (item.maxCount) {
        let maxAllowed = item.maxCount;
        
        // --- HR (6): Limit Break ---
        // If HR level >= 6, add +1 to max count for summon-related items
        const counts = SynergyLogic.getSynergyCounts(player.items);
        const tiers = SynergyLogic.getActiveTiers(counts);
        if ((tiers['hr'] || 0) >= 6) {
            // Is this a summon item? Check tags or ID
            if (item.tags && item.tags.includes('hr')) {
                maxAllowed += 1;
            }
        }

        // Count owned items
        const owned = player.items.filter(n => n === item.items?.[0] || n === item.title).length; 
        
        // Count items currently in stock (locked or just generated in this batch context)
        // Note: getRandomShopItems passes a fresh state or we check current state.
        const inStockLocked = shopState.stock.filter(s => s.id === item.id && !s.purchased).length;

        if (owned + inStockLocked >= maxAllowed) return false;
    }

    // 2. 波次限制
    if (item.minWave && currentWave < item.minWave) return false;

    // 3. TAG SYSTEM Filtering (Replaces Hardcoding)
    const charConfig = CHARACTERS[player.characterId];
    if (charConfig) {
        // A. Banned Tags Check
        if (charConfig.bannedTags && item.tags) {
            const hasBannedTag = item.tags.some(t => charConfig.bannedTags!.includes(t));
            if (hasBannedTag) return false;
        }
    }

    // Legacy Hardcode Fallback
    if (item.id === 'fishing_guide' && player.dodgeChance >= 0.6) return false;
    
    // 4. 前置条件检查 (Prerequisites)
    if (item.prerequisites && item.prerequisites.length > 0) {
        const hasReq = item.prerequisites.some(req => player.items.includes(req));
        if (!hasReq) return false;
    }

    return true;
};

// Merged Shop Generation
export const getRandomShopItems = (
    gameState: GameState,
    pool: UpgradeOption[],
    count: number,
    excludeIds: string[],
    onUnlock: (id: string) => void
): UpgradeOption[] => {
    const player = gameState.player;
    const currentWave = gameState.currentWave;
    const hasKnowledgePay = player.items.includes('知识付费');

    // Rarity weights
    let weights = { common: 100, excellent: 0, rare: 0, epic: 0, mythic: 0 };
    
    if (currentWave <= 2) {
        weights = { common: 70, excellent: 25, rare: 5, epic: 0, mythic: 0 };
    } else if (currentWave <= 5) {
        weights = { common: 40, excellent: 30, rare: 20, epic: 10, mythic: 0 };
    } else {
        weights = { common: 20, excellent: 20, rare: 30, epic: 20, mythic: 10 };
    }

    if (hasKnowledgePay) {
        weights.common = Math.max(0, weights.common - 30);
        weights.excellent += 10;
        weights.rare += 10;
        weights.epic += 5;
        if (currentWave > 2) weights.mythic += 5;
    }

    // Filter Pool
    const available = pool.filter(item => {
        if (excludeIds.includes(item.id)) return false;
        return checkAvailability(item, player, currentWave, gameState.shopState);
    });

    const result: UpgradeOption[] = [];
    const currentExcluded = [...excludeIds];

    // HAZARD: INFLATION SHOCK
    let hazardMult = 1.0;
    if (gameState.activeMutators.includes('inflation_shock')) {
        hazardMult = 1.5;
    }

    for(let i=0; i<count; i++) {
        const currentAvailable = available.filter(item => !currentExcluded.includes(item.id));
        if (currentAvailable.length === 0) break;

        const totalWeight = weights.common + weights.excellent + weights.rare + weights.epic + weights.mythic;
        const rand = Math.random() * totalWeight;
        
        let chosenRarity = 'common';
        let cumulative = 0;
        
        cumulative += weights.common;
        if (rand < cumulative) chosenRarity = 'common';
        else {
            cumulative += weights.excellent;
            if (rand < cumulative) chosenRarity = 'excellent';
            else {
                cumulative += weights.rare;
                if (rand < cumulative) chosenRarity = 'rare';
                else {
                    cumulative += weights.epic;
                    if (rand < cumulative) chosenRarity = 'epic';
                    else chosenRarity = 'mythic';
                }
            }
        }

        // Special handling for Mythic bucket: Includes 'consumable' with equal chance if pool allows
        let subset: UpgradeOption[] = [];
        if (chosenRarity === 'mythic') {
             subset = currentAvailable.filter(i => i.rarity === 'mythic' || i.rarity === 'consumable');
        } else {
             subset = currentAvailable.filter(i => i.rarity === chosenRarity);
        }

        if (subset.length === 0) subset = currentAvailable;

        if (subset.length > 0) {
            const item = subset[Math.floor(Math.random() * subset.length)];
            const inflatedPrice = Math.floor(item.price * (1 + gameState.inflationRate) * hazardMult);
            
            onUnlock(item.id);

            result.push({
                ...item, 
                originalPrice: item.price,
                price: inflatedPrice,
                purchased: false, 
                locked: false,
                uuid: Math.random().toString()
            });
            
            currentExcluded.push(item.id);
        }
    }
    return result;
};

export const calculateRestockCost = (gameState: GameState): number => {
    const p = gameState.player;
    let baseCost = 10 + (gameState.isEndless ? gameState.endlessWaveCount : 0);
    
    // BOARD L2: First Refresh Free
    const counts = SynergyLogic.getSynergyCounts(p.items);
    const tiers = SynergyLogic.getActiveTiers(counts);
    const hasBoard2 = (tiers['board'] || 0) >= 2;

    if (hasBoard2 && !gameState.hasRefreshedThisWave) {
        return 0;
    }

    let exponentBase = 1.5; 
    
    if (p.items.includes('金鱼记忆')) {
        exponentBase = 1.2; 
    }
    
    // Adjust refresh count base if first one was free to keep scaling consistent?
    // Or just let it scale normally. Standard scaling is fine.
    let cost = baseCost * Math.pow(exponentBase, gameState.refreshCount);

    if (p.items.includes('知识付费')) {
        cost *= 2;
    }

    // HAZARD: INFLATION SHOCK (Affects reroll too)
    if (gameState.activeMutators.includes('inflation_shock')) {
        cost *= 1.5;
    }

    // BOARD L2: 50% Off Refresh Cost
    if (hasBoard2) {
        cost = Math.floor(cost * 0.5);
    }

    return Math.floor(cost);
};

// --- 交易系统核心逻辑 ---

export interface PurchaseResult {
    success: boolean;
    finalPrice: number;
    message?: { title: string, text: string, type: 'win' | 'info' | 'error' };
    synergyUpgrade?: string; 
}

export const executePurchase = (
    gameState: GameState, 
    item: UpgradeOption, 
    playSound: (type: 'coin' | 'error' | 'synergy') => void
): PurchaseResult => {
    const player = gameState.player;
    
    // Check OLD status via cached derived stats
    const oldTiers = gameState.derivedStats?.activeTiers || {};

    let actualPrice = Math.floor(item.price * player.shopDiscount);
    let message: PurchaseResult['message'] | undefined = undefined;

    const hasBlackCard = player.items.includes('无限黑卡');

    // INFINITE BLACK CARD: First Purchase Free
    if (hasBlackCard && !gameState.hasPurchasedThisWave) {
        actualPrice = 0;
        message = { title: "黑卡免单!", text: "尊贵的董事会特权。", type: 'win' };
    }

    // CUT ONE: 30% Free / 30% Double
    if (actualPrice > 0 && player.items.includes('砍一刀')) {
        const roll = Math.random();
        if (roll < 0.3) {
            actualPrice = 0;
            message = { title: "砍一刀成功!", text: "恭喜免单!", type: 'win' };
        } else if (roll < 0.6) {
            actualPrice = Math.floor(actualPrice * 2);
            message = { title: "砍一刀失败!", text: "价格翻倍了! (悲)", type: 'info' };
        }
    }

    // AFFORDABILITY CHECK
    let canAfford = false;
    if (hasBlackCard) {
        // Allow overdraft up to -2000
        canAfford = (player.gold - actualPrice) >= -2000;
    } else {
        canAfford = player.gold >= actualPrice;
    }

    if (!canAfford) {
        if (message?.type === 'info') {
             return { 
                 success: false, 
                 finalPrice: actualPrice,
                 message: { title: "余额不足", text: "砍完价买不起了...", type: 'info' }
             };
        }
        return { success: false, finalPrice: actualPrice };
    }

    player.gold -= actualPrice;
    player.goldSpentInShop = (player.goldSpentInShop || 0) + actualPrice; 
    
    // Mark purchase for this wave
    gameState.hasPurchasedThisWave = true;

    // 执行效果
    item.effect(gameState);
    
    if (!item.items || item.items.length === 0) {
        player.items.push(item.title);
    }

    if (player.items.includes('盗版软件') && item.id !== 'cracked_soft') {
        if (Math.random() < 0.5) {
            // New logic: Deduct Max HP
            player.maxHp = Math.max(1, player.maxHp - 5);
            if (player.hp > player.maxHp) player.hp = player.maxHp;
            
            message = { title: "中毒了!", text: "系统文件损坏! 生命上限 -5", type: 'error' };
        }
    }

    // --- REFRESH CACHED STATS ---
    SynergyLogic.refreshDerivedStats(gameState);
    const newTiers = gameState.derivedStats.activeTiers;
    
    let leveledUp = false;
    
    Object.entries(newTiers).forEach(([tagId, level]) => {
        const oldLevel = oldTiers[tagId] || 0;
        if (level > oldLevel) {
            leveledUp = true;
        }
    });

    if (leveledUp) {
        playSound('synergy');
    } else {
        playSound('coin');
    }

    return { 
        success: true, 
        finalPrice: actualPrice, 
        message 
    };
};
