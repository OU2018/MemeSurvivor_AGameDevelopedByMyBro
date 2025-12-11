
import { Achievement } from "../../types";

export const GENERAL_ACHIEVEMENTS: Achievement[] = [
    // --- 新手引导 (Easy) ---
    { 
        id: 'onboarding', 
        title: '入职谈话', 
        description: '欢迎加入大家庭，这里不提倡加班... (首次进入游戏)', 
        icon: '📝', 
        unlocked: false, 
        condition: (s, stats) => true,
        reward: { gold: 1 },
        rewardDescription: "老板的口头嘉奖: '好好干'"
    },
    {
        id: 'probation_fail',
        title: '试用期未通过',
        description: '存活时间不足 30 秒即死亡。',
        icon: '🚫',
        unlocked: false,
        condition: (s, stats) => s.player.isDying && s.timeAlive < 30 * 60,
        reward: { maxHp: 1 },
        rewardDescription: "抗压能力微弱提升 (+1 HP)"
    },
    {
        id: 'too_young',
        title: '愣头青',
        description: '在商店里什么都不买，直接进入下一波。',
        icon: '👶',
        unlocked: false,
        condition: (s, stats) => false, // Logic handled in ShopView manually if needed, or by checking state change
        reward: undefined,
        rewardDescription: "获得称号：'看起来很忙'"
    },
    { 
        id: 'probation_pass', 
        title: '转正答辩', 
        description: '存活并到达第 7 波。', 
        icon: '📄', 
        unlocked: false, 
        condition: (s, stats) => s.currentWave >= 7,
        reward: { maxHp: 10 },
        rewardDescription: "生命上限 +10"
    },
    { 
        id: 'wage_slave', 
        title: '资深社畜', 
        description: '累计有效工作时长超过 60 分钟。', 
        icon: '⏰', 
        unlocked: false, 
        condition: (s, stats) => stats.totalTimePlayed >= 3600 * 60,
        reward: { maxHp: 20 },
        rewardDescription: "生命上限 +20"
    },

    // --- 彩蛋 (Easter Eggs) ---
    {
        id: 'abyss_gazer',
        title: '深渊凝视者',
        description: '“当你长时间凝视混乱，混乱也在凝视你...”',
        icon: '👁️',
        unlocked: false,
        condition: (s, stats) => false, // Triggered by WelcomeView interaction
        reward: { maxShield: 10 },
        rewardDescription: "初始护盾 +10"
    },

    // --- 属性堆叠 (Medium) ---
    { 
        id: 'tank_build', 
        title: '血牛', 
        description: '单局最大生命值达到 400。', 
        icon: '🐘', 
        unlocked: false, 
        condition: (s, stats) => s.player.maxHp >= 400,
        reward: { hpRegen: 0.5 },
        rewardDescription: "生命回复 +0.5/秒"
    },
    { 
        id: 'speed_demon', 
        title: '润了润了', 
        description: '移动速度达到 12 (比平时快一倍)。', 
        icon: '🏃', 
        unlocked: false, 
        condition: (s, stats) => s.player.speed >= 12,
        reward: { speed: 0.5 },
        rewardDescription: "初始移速 +0.5"
    },
    { 
        id: 'shield_master', 
        title: '绝对防御', 
        description: '护盾上限达到 200。', 
        icon: '🛡️', 
        unlocked: false, 
        condition: (s, stats) => s.player.maxShield >= 200,
        reward: { maxShield: 30 },
        rewardDescription: "护盾上限 +30"
    },
    { 
        id: 'hoarder', 
        title: '仓鼠症', 
        description: '单局拥有超过 15 件物品/升级。', 
        icon: '🐹', 
        unlocked: false, 
        condition: (s, stats) => s.player.items.length >= 15,
        reward: { maxHp: 20 },
        rewardDescription: "生命上限 +20"
    },
    
    // --- 高难挑战 (Hard) ---
    { 
        id: 'immortal', 
        title: '不死之身', 
        description: '生命上限达到 800 (你是Boss吗？)。', 
        icon: '🗿', 
        unlocked: false, 
        condition: (s, stats) => s.player.maxHp >= 800,
        reward: { damageReflection: 0.1 },
        rewardDescription: "初始反伤 +10%"
    },
    { 
        id: 'regen_master', 
        title: '光合作用', 
        description: '生命回复达到 5点/秒。', 
        icon: '🌱', 
        unlocked: false, 
        condition: (s, stats) => s.player.hpRegen >= 5,
        reward: { hpRegen: 1 },
        rewardDescription: "生命回复 +1/秒"
    }
];
