
import { WaveConfig, DifficultyConfig } from "../types";

// --- 难度配置 ---
export const DIFFICULTY_SETTINGS: DifficultyConfig[] = [
    {
        id: 'easy',
        name: '摸鱼模式',
        description: '敌人太菜了，适合上班偷偷玩。',
        hpMult: 0.7,
        damageMult: 0.7,
        scoreMult: 1.0, 
        emoji: '☕'
    },
    {
        id: 'normal',
        name: '搬砖模式',
        description: '标准的打工人强度。',
        hpMult: 1.0,
        damageMult: 1.0,
        scoreMult: 1.0, 
        emoji: '🧱'
    },
    {
        id: 'hard',
        name: '996福报',
        description: '怪物数值极高，享受被虐的快感。',
        hpMult: 1.5,
        damageMult: 1.5,
        scoreMult: 1.0, 
        emoji: '☠️'
    },
    {
        id: 'ultimate',
        name: '究极折磨',
        description: '数值膨胀到离谱，只有真·卷王才能活下来。',
        hpMult: 2.5,
        damageMult: 2.0,
        scoreMult: 1.0, 
        emoji: '👹'
    }
];

// --- 波次配置 (2.0 优化版) ---
// 设计理念：原始积累 -> 召唤物登场 -> 混合割草
export const WAVES: WaveConfig[] = [
  {
    // Wave 1: 原始积累 - 纯基础怪
    // 移除工具人，延长至90s
    waveNumber: 1,
    duration: 90, 
    enemies: [
        { type: 'tian_gou', weight: 5 },     // 近战冲锋
        { type: 'keyboard_man', weight: 5 }  // 远程射击
    ], 
    spawnRate: 60 // 较慢刷新 (新手适应)
  },
  {
    // Wave 2: 进阶积累 - 靶子登场
    // 引入吃瓜群众
    waveNumber: 2,
    duration: 90,
    enemies: [
        { type: 'chi_gua', weight: 4 },      // 不动靶子 (送分)
        { type: 'tian_gou', weight: 3 },
        { type: 'keyboard_man', weight: 3 }
    ],
    spawnRate: 50 // 稍微加速
  },
  {
    // Wave 3: 召唤物初现 (逻辑修正 - 割草)
    // 只有召唤师，没有单独的召唤物 (工具人/气球由召唤师生成)
    // 增加填充怪密度，提高割草感
    waveNumber: 3,
    duration: 60,
    enemies: [
        { type: 'product_manager', weight: 4 }, // 召唤工具人
        { type: 'clown', weight: 3 },           // 召唤气球
        { type: 'tian_gou', weight: 5 },        // 增加舔狗作为填充
        { type: 'keyboard_man', weight: 5 }     // 增加键盘侠作为填充
    ],
    spawnRate: 25 // 显著加速 (45 -> 25) for 割草
  },
  {
    // Wave 4: 高压混战
    waveNumber: 4,
    duration: 60,
    enemies: [
        { type: 'river_crab', weight: 4 }, 
        { type: 'marketing_account', weight: 3 }, 
        { type: 'gai_liu_zi', weight: 2 },
        { type: 'tian_gou', weight: 1 }
    ],
    spawnRate: 22 // Accelerated (was 30)
  },
  {
    // Wave 5: 辅助控制
    waveNumber: 5,
    duration: 60,
    enemies: [
        { type: 'da_ye', weight: 2 }, 
        { type: 'hr_specialist', weight: 3 }, 
        { type: 'pie_painter', weight: 2 }, 
        { type: 'tian_gou', weight: 3 }
    ],
    spawnRate: 25 // Accelerated (was 35)
  },
  {
    // Wave 6: 减速与围攻
    waveNumber: 6,
    duration: 60,
    enemies: [
        { type: 'lemon_head', weight: 3 }, 
        { type: 'micro_manager', weight: 2 }, 
        { type: 'marketing_account', weight: 3 }, 
        { type: 'river_crab', weight: 2 }
    ],
    spawnRate: 20 // Accelerated (was 30)
  },
  {
    // Wave 7: 决战前夕 (割草盛宴)
    // 替换工具人/气球为狂热舔狗
    waveNumber: 7,
    duration: 60,
    enemies: [
        { type: 'tian_gou_frenzy', weight: 5 }, // 脆皮自爆怪
        { type: 'tian_gou', weight: 3 },
        { type: 'capital_crocodile', weight: 0.5 },
        { type: 'clown', weight: 1.5 }
    ],
    spawnRate: 8 // 极快刷新
  },
  {
    // Wave 8: Boss
    waveNumber: 8,
    duration: 99999, 
    enemies: [{ type: 'boss_kpi', weight: 1 }],
    spawnRate: 99999,
    isBossWave: true
  }
];

export * from './enemies';
export * from './items';
export * from './events';
export * from './achievements';
export * from './menuQuotes';

export const GLOSSARY_TERMS = [
    { title: "生命值 (HP)", desc: "你的抗压能力上限。归零即被裁员。—— 身体是革命的本钱，但你的本钱好像不多了。" },
    { title: "护盾", desc: "心理防线。脱离战斗3秒后开始每秒恢复1点，优先抵挡伤害。—— 只要我不看钉钉，老板就伤不到我。" },
    { title: "攻速", desc: "攻击频率。数值越高，射速越快。—— 单身三十年练就的手速，终于派上用场了。" },
    { title: "移速", desc: "跑路的速度。—— 只要我跑得够快，KPI就追不上我。" },
    { title: "穿透", desc: "职场甩锅能力。子弹可以穿过第一个敌人，击中后面的人。—— 既然解决了不了问题，就把问题抛给下一个人。" },
    { title: "暴击", desc: "破防瞬间。造成 150% 精神伤害（红字攻击）。—— 也有可能是你血压飙升的瞬间。" },
    { title: "吸血", desc: "资本家本能。攻击命中时有一定概率恢复 1 点生命 (非百分比回复)。—— 真正的资本家，连蚊子腿上的肉都不放过。" },
    { title: "闪避", desc: "糊弄学大师。有概率完全无视本次伤害。—— “啊？你说什么？信号不好...”" },
    { title: "反伤", desc: "已读乱回。受到伤害时，把一部分痛苦返还给施暴者。—— 互相伤害啊，谁怕谁！" },
    { title: "【焦虑】", desc: "易伤状态(受击伤害+15%)，且每秒扣除 5% 当前生命值 (Boss效果减半)。—— 精神内耗，最为致命。" },
    { title: "【情绪爆破】", desc: "当携带【焦虑】状态的敌人死亡时触发。引发紫色范围爆炸，造成 120% 攻击力的伤害。—— 这种负面情绪是会传染的！" },
    { title: "【过载】", desc: "内卷部终极状态。攻速翻倍且必定暴击，但每秒扣除 5% 生命值。停止攻击可散热退出。—— 只要卷不死，就往死里卷。" },
    { title: "【蓝屏死机】", desc: "技术部终极技能。生成一个蓝色区域，区域内的普通敌人直接删除(秒杀)，Boss受到重创并眩晕。—— 还有什么比重启更能解决问题的呢？" },
    { title: "【制裁霓虹】", desc: "董事会终极技能。爆发大量自动追踪的霓虹光束，对全屏敌人进行地毯式轰炸。—— 制裁霓虹就是为了告诉那些怪物：不要靠近弯弯的线。" },
    { title: "【勿扰领域】", desc: "摸鱼部技能。站立不动生成的绿色光圈，进入圈内的敌人会被减速并推开。—— “我在忙，请勿打扰。”(其实在刷视频)" },
    { title: "【消费护盾】", desc: "财务部技能。在商店每花费 10 金币，转化为 2 点临时护盾(带入下一关)。—— 花出去的钱并没有消失，只是换了一种方式陪在你身边。" }
];
