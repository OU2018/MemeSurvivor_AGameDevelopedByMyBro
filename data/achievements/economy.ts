
import { Achievement } from "../../types";

export const ECONOMY_ACHIEVEMENTS: Achievement[] = [
    // --- 积累 (Accumulation) ---
    { 
        id: 'capitalist', 
        title: '第一桶金', 
        description: '单局持有金币超过 500。', 
        icon: '💰', 
        unlocked: false, 
        condition: (s, stats) => s.player.gold >= 500,
        reward: { incomeMultiplier: 0.05 },
        rewardDescription: "收入系数 +5%"
    },
    {
        id: 'accumulate_wealth',
        title: '原始积累', 
        description: '生涯累计获得金币超过 50,000。', 
        icon: '🏦', 
        unlocked: false, 
        condition: (s, stats) => stats.totalGoldEarned >= 50000,
        reward: { gold: 500 },
        rewardDescription: "初始资金 +500"
    },
    { 
        id: 'oil_prince', 
        title: '石油王子', 
        description: '单局持有金币超过 3000。', 
        icon: '👳', 
        unlocked: false, 
        condition: (s, stats) => s.player.gold >= 3000,
        reward: { shopDiscount: -0.05 }, // Additive reduction
        rewardDescription: "商店折扣 +5%"
    },
    { 
        id: 'miser', 
        title: '守财奴', 
        description: '单局持有超过 8000 金币。', 
        icon: '🔒', 
        unlocked: false, 
        condition: (s, stats) => s.player.gold >= 8000,
        reward: { incomeMultiplier: 0.1 },
        rewardDescription: "收入系数 +10%"
    },

    // --- 消费与运气 (Spending & Luck) ---
    { 
        id: 'shopping_addict', 
        title: '剁手党', 
        description: '单局刷新商店超过 12 次。', 
        icon: '🛍️', 
        unlocked: false, 
        condition: (s, stats) => s.refreshCount >= 12,
        reward: { shopSlots: 1 }, 
        rewardDescription: "商店栏位 +1"
    },
    {
        id: 'bad_debt',
        title: '背背佳',
        description: '同时背负 3 个以上的“杀猪盘”负债。',
        icon: '🐷',
        unlocked: false,
        condition: (s, stats) => s.player.pigDebts && s.player.pigDebts.length >= 3,
        reward: { gold: 250 },
        rewardDescription: "初始资金 +250"
    },
    { 
        id: 'luck_dog', 
        title: '欧皇转世', 
        description: '彩票中头奖 (15万)。(或者在电子简历里大喊一声【作者好帅】？)', 
        icon: '🎟️', 
        unlocked: false, 
        condition: (s, stats) => false, // 逻辑在彩票道具或秘籍中触发
        reward: { gold: 300 },
        rewardDescription: "初始资金 +300"
    },
    { 
        id: 'big_spender', 
        title: '消费主义', 
        description: '单局累计在刷新商店上花费超过 1000 金币。', 
        icon: '💸', 
        unlocked: false, 
        condition: (s, stats) => false, 
        reward: { gold: 200 },
        rewardDescription: "初始资金 +200"
    },
    { 
        id: 'item_collector', 
        title: '收藏家', 
        description: '解锁图鉴中 20 个以上的物品。', 
        icon: '📚', 
        unlocked: false, 
        condition: (s, stats) => {
            return s.player.items.length >= 20; 
        },
        reward: { shopDiscount: -0.05 },
        rewardDescription: "商店折扣 +5%"
    },
    {
        id: 'broke',
        title: '月光族',
        description: '“钱这东西，生不带来死不带去。” 死亡时金币余额正好为 0。',
        icon: '📉',
        unlocked: false,
        condition: (s, stats) => s.player.isDying && s.player.gold === 0,
        reward: { shopDiscount: -0.05 },
        rewardDescription: "商店价格 -5%"
    }
];
