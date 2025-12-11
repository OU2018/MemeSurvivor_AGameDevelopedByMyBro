
import { CharacterConfig } from "../types";

// --- 9527 语录 ---
export const WORKER_QUOTES = [
    "收到", "好的", "马上改", "在做了", "辛苦了", 
    "这就去", "下班了", "稍等", "流程", "在走", "审批中",
    "收到请回复", "好的老板", "下次一定", "正在处理", "马上好", "OK", "行吧", "没问题"
];

// --- 角色配置 ---
export const CHARACTERS: Record<string, CharacterConfig> = {
  '9527': {
    id: '9527',
    name: '牛马 9527',
    title: '资深社畜',
    description: '“我不是在摸鱼，我是在为公司节省电费。” —— 熟练掌握 108 种糊弄学技巧的职场老油条。',
    emojiNormal: '😐',
    emojiHurt: '😰',
    emojiCritical: '😰',
    baseStats: {
        maxHp: 100,
        speed: 6,
        attackDamage: 20,
        attackSpeed: 30, // UPDATED: 2.0 attacks/sec
        projectilePierce: 0,
        projectileCount: 1,
        incomeMultiplier: 1.0,
        critChance: 0.05,
        critDamage: 1.5,
        flatAttackSpeedBonus: 0
    }
  },
  '007': {
    id: '007',
    name: '实习生 007',
    title: '疯批实习生',
    description: '“老板画的饼，太硬，我牙口不好，只能炸了。” —— 精神状态极不稳定的 00 后，主打一个反向管理。',
    emojiNormal: '😎',
    emojiHurt: '🥴', 
    emojiCritical: '🤯',
    bannedTags: ['pierce'], // 007 CANNOT use pierce items
    baseStats: {
        maxHp: 80,
        speed: 7,
        attackDamage: 24,
        attackSpeed: 51, 
        projectilePierce: 0, 
        projectileCount: 1,
        incomeMultiplier: 0.85,
        critChance: 0.10, // Higher crit
        critDamage: 1.5,
        flatAttackSpeedBonus: 0
    }
  },
  '1024': {
      id: '1024',
      name: '程序猿 1024',
      title: '脱发强者',
      description: '“这个需求做不了... 除非加钱。” —— 拥有绝顶聪明的脑袋，认为世界是一个巨大的草台班子。',
      emojiNormal: '🤓',
      emojiHurt: '😵',
      emojiCritical: '🤕', 
      baseStats: {
          maxHp: 60,
          speed: 6.0,
          attackDamage: 18,
          attackSpeed: 35.3, // 1.7 attacks/sec
          projectilePierce: 2,
          projectileCount: 1,
          incomeMultiplier: 1.0,
          critChance: 0.05,
          critDamage: 1.5,
          flatAttackSpeedBonus: 0
      }
  },
  'ev_creator': {
      id: 'ev_creator',
      name: '制作人 EV',
      title: '苦逼开发',
      description: '“求求你们别再反馈 Bug 了，我修不过来了...” —— 本游戏的作者，正试图在自己创造的混沌中活下来。',
      emojiNormal: '🧐', // Updated to Monocle Face
      emojiHurt: '😨', 
      emojiCritical: '🤕', 
      baseStats: {
          maxHp: 100,
          speed: 6.5, // Reduced from 7
          attackDamage: 20,
          attackSpeed: 30,
          projectilePierce: 1,
          projectileCount: 1,
          incomeMultiplier: 1.1,
          critChance: 0.05,
          critDamage: 1.5,
          flatAttackSpeedBonus: 0
      }
  },
  'cleaner': {
      id: 'cleaner',
      name: '保洁阿姨',
      title: '扫地僧',
      description: '“麻烦让一让，拖地呢。” —— 深藏不露的高手。用物理手段清理垃圾数据。',
      emojiNormal: '👵',
      emojiHurt: '😣',
      emojiCritical: '😠',
      baseStats: {
          maxHp: 120,
          speed: 5.5,
          attackDamage: 30, // High melee damage
          attackSpeed: 45,  // Slower swing
          projectilePierce: 999, // Infinite pierce (Melee)
          projectileCount: 1,
          incomeMultiplier: 1.0,
          critChance: 0.05,
          critDamage: 1.5,
          flatAttackSpeedBonus: 0
      }
  }
};

// --- 死亡语录 ---
export const DEATH_MESSAGES: Record<string, string> = {
  'keyboard_man': "你被键盘侠喷到怀疑人生，直接退网了。",
  'tian_gou': "你被舔狗的真心感动（恶心）死了。",
  'lemon_head': "你被酸死了。这就破防了？",
  'gai_liu_zi': "你在街头被鬼火少年撞飞，社保都没得赔。",
  'chi_gua': "你在围观群众的瓜子壳海洋中窒息了。",
  'da_ye': "大爷使用了'退退退'，你被物理超度了。",
  'marketing_account': "你被营销号的谣言洗脑，变成了傻子。",
  'clown': "小丑竟是你自己。",
  'minion': "你被当成垃圾清理掉了。",
  'tao_wa_big': "你被无限套娃困在循环里出不来了。",
  'tao_wa_med': "你倒在了套娃的第二层。",
  'tao_wa_small': "你竟然被最小的套娃干掉了？",
  'river_crab': "你的内容违规，已被河蟹屏蔽。",
  'boss_kpi': "你被公司'结构性优化'了。请立刻办理离职手续。",
  'involution_king': "你卷死了。在无限的自我内耗中，你耗尽了最后一滴血。",
  'elite_manager': "你被微操大师折磨得精神崩溃。",
  'elite_hr': "你没能通过压力测试，已被淘汰。",
  'delivery_guy': "你抢了外卖小哥的饭，被撑死了。",
  'hr_specialist': "你听了太多的大饼，消化不良而死。",
  'product_manager': "需求变更太快，你过劳死了。",
  'micro_manager': "你被监工盯得浑身难受，精神崩溃。",
  'spoiler_dog': "你被剧透了一脸，失去了活下去的动力。",
  'cyber_goddess': "你被女神的备胎军团踩扁了。",
  'capital_crocodile': "你被资本巨鳄一口吞了，骨头都没剩下。",
  'balloon': "你被一个气球炸飞了，场面一度非常尴尬。",
  'unknown': "你猝死了。这就是996的福报。"
};

export const BULLET_TEXTS = ["乐", "典", "孝", "急", "崩", "赢", "麻", "6", "哈", "这", "尊"];

// --- 词条解释 (Glossary) ---
export const GLOSSARY_TERMS = [
    { title: "穿透", desc: "职场推诿能力。子弹可以穿过第一个敌人，击中后面的人。" },
    { title: "反伤", desc: "已读乱回。受到伤害时，把一部分痛苦返还给施暴者。" },
    { title: "闪避", desc: "糊弄学大师。有概率完全无视本次伤害。" },
    { title: "吸血", desc: "资本家本能。攻击命中时有一定概率恢复 1 点生命 (非百分比回复)。" },
    { title: "攻速", desc: "手速。单身三十年练就的打字速度。" },
    { title: "暴击", desc: "破防。造成 150% 精神伤害（红字攻击）。" },
    { title: "护盾", desc: "心理防线。脱离战斗3秒后开始每秒恢复1点。" }
];
