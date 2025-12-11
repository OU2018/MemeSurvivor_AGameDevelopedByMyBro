
import { Achievement } from "../../types";

export const COMBAT_ACHIEVEMENTS: Achievement[] = [
    // --- 杀敌数 (Progress) ---
    { 
        id: 'killer_novice', 
        title: '试用期杀手', 
        description: '累计击杀 100 个垃圾信息。', 
        icon: '🗡️', 
        unlocked: false, 
        condition: (s, stats) => stats.totalKills >= 100,
        reward: { attackDamage: 2 }, 
        rewardDescription: "基础伤害 +2"
    },
    { 
        id: 'cleaner_pro', 
        title: '金牌保洁', 
        description: '累计击杀 2000 个垃圾信息。', 
        icon: '🧹', 
        unlocked: false, 
        condition: (s, stats) => stats.totalKills >= 2000,
        reward: { attackDamage: 5 }, 
        rewardDescription: "基础伤害 +5"
    },
    { 
        id: 'genocide', 
        title: '互联网清道夫', 
        description: '累计击杀 5000 个垃圾信息。', 
        icon: '☠️', 
        unlocked: false, 
        condition: (s, stats) => stats.totalKills >= 5000,
        reward: { projectilePierce: 1 }, 
        rewardDescription: "子弹穿透 +1"
    },

    // --- 攻击流派 (Builds) ---
    { 
        id: 'keyboard_warrior', 
        title: '祖安键仙', 
        description: '攻击频率超过 7.5 次/秒。', 
        icon: '⌨️', 
        unlocked: false, 
        condition: (s, stats) => s.player.attackSpeed <= 8,
        reward: { attackSpeed: -2 }, 
        rewardDescription: "攻击速度 +0.3 次/秒"
    },
    { 
        id: 'one_punch', 
        title: '一拳超人', 
        description: '单发子弹伤害突破 300。', 
        icon: '🥊', 
        unlocked: false, 
        condition: (s, stats) => s.player.attackDamage >= 300,
        reward: { attackDamage: 20 }, 
        rewardDescription: "基础伤害 +20"
    },
    { 
        id: 'bullet_rain', 
        title: '弹幕游戏', 
        description: '同时发射的子弹数量达到 6 发。', 
        icon: '🌧️', 
        unlocked: false, 
        condition: (s, stats) => s.player.projectileCount >= 6,
        reward: { projectileCount: 1 }, 
        rewardDescription: "初始子弹数 +1"
    },
    { 
        id: 'sniper', 
        title: '神枪手', 
        description: '子弹飞行速度达到 15。', 
        icon: '🎯', 
        unlocked: false, 
        condition: (s, stats) => s.player.projectileSpeed >= 15,
        reward: { projectileSpeed: 2 }, 
        rewardDescription: "子弹速度 +2"
    },
    { 
        id: 'hedgehog', 
        title: '刺猬', 
        description: '反伤比例达到 100% (别人打你等于打自己)。', 
        icon: '🦔', 
        unlocked: false, 
        condition: (s, stats) => s.player.damageReflection >= 1.0,
        reward: { damageReflection: 0.1 }, 
        rewardDescription: "初始反伤 +10%"
    },
    { 
        id: 'vampire', 
        title: '资本家本能', 
        description: '吸血触发几率达到 10%。', 
        icon: '🧛', 
        unlocked: false, 
        condition: (s, stats) => s.player.lifeSteal >= 0.1,
        reward: { lifeSteal: 0.01 }, 
        rewardDescription: "初始吸血几率 +1%"
    },
    { 
        id: 'glass_cannon', 
        title: '玻璃大炮', 
        description: '攻击力 > 100 且 生命上限 < 50。', 
        icon: '🔮', 
        unlocked: false, 
        condition: (s, stats) => s.player.attackDamage > 100 && s.player.maxHp < 50,
        reward: { attackDamage: 10 }, 
        rewardDescription: "基础伤害 +10"
    },

    // --- 挑战 (Challenge) ---
    { 
        id: 'kpi_crusher', // Renamed from boss_killer
        title: 'KPI粉碎者', 
        description: '击败第 8 波的 KPI 大魔王。', 
        icon: '⚔️', 
        unlocked: false, 
        condition: (s, stats) => s.waveStats.enemiesKilled > 0 && s.currentWave >= 8 && !s.isEndless && s.enemies.length === 0,
        reward: { attackSpeed: -3 }, 
        rewardDescription: "攻击速度 +0.5 次/秒"
    },
    {
        id: 'rectify_workplace', // New Achievement
        title: '整顿职场',
        description: '使用实习生007，单次爆炸同时击杀超过 10 个敌人。',
        icon: '💣',
        unlocked: false,
        condition: (s, stats) => s.player.characterId === '007' && s.player.maxMultiKill >= 10,
        reward: { explosionRangeMultiplier: 0.1 }, 
        rewardDescription: "爆炸范围 +10% (007专属)"
    },
    { 
        id: 'involution_king', 
        title: '卷王之王', 
        description: '无尽模式达到第 20 波。', 
        icon: '👑', 
        unlocked: false, 
        condition: (s, stats) => s.isEndless && s.endlessWaveCount >= 20,
        reward: { incomeMultiplier: 0.2 },
        rewardDescription: "收入系数 +20%"
    },
    { 
        id: 'endless_madness', 
        title: '永不下班', 
        description: '无尽模式达到第 40 波。', 
        icon: '👹', 
        unlocked: false, 
        condition: (s, stats) => s.isEndless && s.endlessWaveCount >= 40,
        reward: { shopSlots: 1 }, 
        rewardDescription: "商店栏位 +1"
    },
    { 
        id: 'pacifist', 
        title: '摸鱼宗师', 
        description: '完整的一波之内没有击杀任何敌人 (仅限非BOSS波)。', 
        icon: '🕊️', 
        unlocked: false, 
        condition: (s, stats) => false, // 逻辑在游戏循环中特殊判断
        reward: { hpRegen: 0.5 },
        rewardDescription: "生命回复 +0.5/秒"
    }
];
