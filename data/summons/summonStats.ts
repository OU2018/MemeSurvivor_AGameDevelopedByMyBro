
import { TrailConfig } from "../../types";

export interface SummonConfig {
    id: string;
    name: string;
    emoji: string;
    color: string;
    radius: number;
    
    // Stats
    hp: number;
    maxHp: number;
    damage: number; // Collision or explosion damage
    duration: number; // Life in ticks
    
    // Movement
    speed: number;
    
    // Spawning
    baseCooldown: number; // For periodic spawns (ticks)
    
    // AI & Combat
    aiType: 'troll' | 'troll_mini' | 'intern' | 'chatbot' | 'drone' | 'clone' | 'headhunter' | 'code_mountain' | 'temp_worker' | 'pacman';
    isExplosive?: boolean;
    maxExplosionRadius?: number;
    isInvincible?: boolean;
    
    // AI Parameters (Optional overrides)
    detectRange?: number;
    attackRange?: number;
    chargeSpeed?: number;
    patrolRange?: number;
    patrolSpeed?: number;
    fireRate?: number; // Ticks between shots

    // Visuals
    trailConfig?: TrailConfig;

    // Encyclopedia
    description?: string;
    quote?: string;
    tier?: 'common' | 'rare' | 'epic' | 'mythic';
}

export const SUMMON_STATS: Record<string, SummonConfig> = {
    'temp_worker': {
        id: 'temp_worker',
        name: '临时工',
        emoji: '👷',
        color: '#22d3ee', // Cyan
        radius: 14,
        hp: 15,
        maxHp: 15,
        damage: 15, // Melee contact damage
        duration: 480, // 8 seconds (Short contract)
        speed: 4.5, // Fast
        baseCooldown: 600, // 10 seconds default
        aiType: 'temp_worker', // Will use melee logic in SummonSystem
        isExplosive: false, 
        detectRange: 400,
        chargeSpeed: 8,
        tier: 'common',
        description: '随叫随到的廉价劳动力。看到敌人就会直线冲上去撞击，撞完一次就立刻离职（消失）。',
        quote: '“日结大神，做一天玩三天。”'
    },
    'intern': {
        id: 'intern',
        name: '实习生',
        emoji: '👨‍🎓',
        color: '#3b82f6',
        radius: 15,
        hp: 20,
        maxHp: 20,
        damage: 10,
        duration: 600, // 10 seconds
        speed: 2.5,
        baseCooldown: 300, // 5 seconds
        aiType: 'intern',
        fireRate: 60,
        attackRange: 400,
        tier: 'common',
        description: '还未被社会毒打的大学生。会跟随在你身边，偶尔扔出几个问号攻击敌人。主要作用是帮你挡枪。',
        quote: '“老板，这个需求我不会啊...”'
    },
    'troll': {
        id: 'troll',
        name: '水军',
        emoji: '🤖',
        color: '#60a5fa',
        radius: 18,
        hp: 10,
        maxHp: 10,
        damage: 80,
        duration: 999999, // Infinite until explode
        speed: 3,
        baseCooldown: 600, // 10 seconds
        aiType: 'troll',
        isExplosive: true,
        maxExplosionRadius: 100,
        detectRange: 500,
        patrolRange: 250,
        patrolSpeed: 3,
        chargeSpeed: 12,
        tier: 'rare',
        description: '专业的网络喷子机器人。平时在你周围巡逻，发现敌人后会加速冲锋并发动自杀式爆炸袭击。',
        quote: '“急了急了，这就破防了？”'
    },
    'troll_mini': {
        id: 'troll_mini',
        name: '微型水军',
        emoji: '👾',
        color: '#38bdf8', // High visibility sky blue
        radius: 13, // Slightly larger
        hp: 1,
        maxHp: 1,
        damage: 40, // Half damage
        duration: 300, // 5 seconds life if no target found
        speed: 5, // Faster base speed
        baseCooldown: 0,
        aiType: 'troll_mini', // DISTINCT AI TYPE TO PREVENT RECURSION
        isExplosive: true,
        maxExplosionRadius: 70,
        detectRange: 450,
        patrolRange: 100,
        patrolSpeed: 5,
        chargeSpeed: 16, // Very aggressive charge
        trailConfig: { type: 'pixel', color: '#38bdf8', interval: 3, timer: 0 }, // Visual Trail
        tier: 'common',
        description: '水军死后分裂出的更小的喷子账号（小号）。虽然伤害减半，但依然能在评论区制造混乱。',
        quote: '“小号多，不怕封。”'
    },
    'drone': {
        id: 'drone',
        name: '外包团队',
        emoji: '🛸',
        color: '#cbd5e1',
        radius: 12,
        hp: 30,
        maxHp: 30,
        damage: 15,
        duration: 600, // 10 seconds alive
        speed: 0, // Orbit logic handled by AI
        baseCooldown: 480, // 8 seconds
        aiType: 'drone',
        isInvincible: false,
        tier: 'rare',
        description: '围绕你旋转的自动化攻击单元。它们没有灵魂，只会机械地对接触到的敌人造成伤害。数量堆叠起来像绞肉机。',
        quote: '“甲方说什么就是什么。”'
    },
    'code_mountain': {
        id: 'code_mountain',
        name: '祖传代码',
        emoji: '💩', 
        color: '#84cc16', // Lime green
        radius: 40, // Big
        hp: 500,
        maxHp: 500,
        damage: 2, // Contact damage tick
        duration: 900, // 15 seconds
        speed: 1.5, // Slightly faster
        baseCooldown: 900, // 15 seconds
        aiType: 'code_mountain',
        isInvincible: false,
        tier: 'rare',
        description: '一坨巨大的、难以维护的、缓慢移动的...东西。拥有极高的生命值，能有效阻挡敌人前进。',
        quote: '“别动！一动全崩！”'
    },
    'chatbot': {
        id: 'chatbot',
        name: '客服机器人',
        emoji: '📠',
        color: '#a855f7',
        radius: 20,
        hp: 9999,
        maxHp: 9999,
        damage: 5,
        duration: 999999,
        speed: 0,
        baseCooldown: 0, // Wave start spawn
        aiType: 'chatbot',
        isInvincible: true,
        fireRate: 12,
        attackRange: 600,
        tier: 'epic',
        description: '固定炮台，无法移动，无法被摧毁。会不知疲倦地向周围敌人发送“您好”骚扰弹幕。射速极快。',
        quote: '“亲，这就为您反馈给技术人员呢~”'
    },
    'clone': {
        id: 'clone',
        name: '影子分身',
        emoji: '👤', 
        color: '#4b5563', // Dark Grey for Shadow effect
        radius: 16, // Smaller than player (24)
        hp: 100,
        maxHp: 100,
        damage: 0, 
        duration: 999999, // Infinite now (Turret)
        speed: 0,
        baseCooldown: 0, // No longer periodic
        aiType: 'clone',
        isInvincible: true,
        fireRate: 30,
        attackRange: 600,
        tier: 'epic',
        description: '你的完美复刻版（虽然是黑白的）。继承你的部分属性和所有发射类道具效果。站在原地替你输出。',
        quote: '“我就是你，但我不领工资。”'
    },
    'headhunter': {
        id: 'headhunter',
        name: '猎头顾问',
        emoji: '🤵',
        color: '#10b981', // Emerald green
        radius: 18,
        hp: 9999, // Invincible helper
        maxHp: 9999,
        damage: 0,
        duration: 999999, // Permanent
        speed: 3.5, 
        baseCooldown: 0, 
        aiType: 'headhunter',
        isInvincible: true,
        fireRate: 480, // "Poach" cooldown (8 seconds)
        detectRange: 600,
        patrolSpeed: 3.5,
        tier: 'epic', // Downgraded
        description: '顶级精英。在战场上四处游走，每隔一段时间就会“挖角”一个普通敌人，将其策反为友军单位。',
        quote: '“比起打打杀杀，不如来谈谈你的职业规划？”'
    },
    'hr_pacman': {
        id: 'hr_pacman',
        name: '吃豆人',
        emoji: '🟡', // 使用黄色圆形作为图鉴头像
        color: '#fbbf24', // Gold
        radius: 24,
        hp: 9999,
        maxHp: 9999,
        damage: 80, // High damage per tick
        duration: 999999, // Permanent while synergy active
        speed: 6.5, // Very fast
        baseCooldown: 0, 
        aiType: 'pacman',
        isInvincible: true,
        detectRange: 2000,
        trailConfig: { type: 'pixel', color: '#ffffff', interval: 5, timer: 0 }, 
        tier: 'mythic',
        description: '人事部终极武器。无视地形，只走直线的裁员机器。对接触到的任何敌人进行高频吞噬。',
        quote: '“Waka Waka Waka...”'
    }
};
