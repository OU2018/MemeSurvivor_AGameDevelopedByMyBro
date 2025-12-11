
import { UpgradeOption } from "../../types";

export type ItemDefinition = Omit<UpgradeOption, 'effect' | 'uuid' | 'locked' | 'purchased' | 'originalPrice'>;

export const ITEM_REGISTRY: ItemDefinition[] = [
  // --- Common (摸鱼级) ---
  {
    id: 'membrane_keyboard',
    title: '普通键盘',
    description: '攻击频率 +0.2 次/秒。普通的薄膜键盘，能用就行。',
    rarity: 'common',
    category: 'upgrade',
    price: 60,
    icon: '⌨️'
  },
  {
    id: 'keyboard_cleaner',
    title: '键盘清理泥',
    description: '基础伤害 +2。清理一下也许能打得更疼。',
    rarity: 'common',
    category: 'upgrade',
    price: 30,
    icon: '🧹'
  },
  {
    id: '5g_speed',
    title: '5G网速',
    description: '移动速度提升。',
    rarity: 'common',
    category: 'upgrade',
    price: 60,
    icon: '🚀'
  },
  {
    id: 'coffee',
    title: '冰美式',
    description: '弹速提升，攻击频率 +0.1 次/秒。',
    rarity: 'common',
    category: 'upgrade',
    price: 60,
    icon: '☕'
  },
  {
    id: 'screen_protector',
    title: '钢化膜',
    description: '护盾上限 +30。每秒自动恢复 1 点护盾(脱战3秒后)。',
    rarity: 'common',
    category: 'item',
    price: 60,
    icon: '📱',
    items: ['钢化膜']
  },
  {
    id: 'wifi_booster',
    title: 'WiFi增强器',
    description: '子弹飞行速度提升。',
    rarity: 'common',
    category: 'item',
    price: 70,
    icon: '📡',
    items: ['WiFi']
  },
  {
    id: 'energy_drink',
    title: '红牛',
    description: '移动速度大幅提升，虽然会心悸但是跑得快。',
    rarity: 'common',
    category: 'item',
    price: 80,
    icon: '🥫',
    items: ['红牛']
  },
  {
      id: 'quantum_reading',
      title: '量子波动速读',
      description: '攻击频率 +0.3 次/秒，但子弹变慢 10%。',
      rarity: 'common',
      category: 'item',
      price: 150,
      icon: '📖',
      items: ['量子速读']
  },

  // --- Rare (经理级) ---
  {
    id: 'mechanical_keyboard',
    title: '机械键盘',
    description: '攻击频率 +0.4 次/秒。噼里啪啦的声音就是生产力。',
    rarity: 'rare',
    category: 'upgrade',
    price: 150,
    icon: '⌨️'
  },
  {
    id: 'thick_face',
    title: '防弹脸皮',
    description: '最大生命 +30，脸皮厚吃得开。',
    rarity: 'rare',
    category: 'upgrade',
    price: 80,
    icon: '🛡️'
  },
  {
    id: 'big_lung',
    title: '大嗓门',
    description: '基础伤害 +5，输出全靠吼。',
    rarity: 'rare',
    category: 'upgrade',
    price: 150,
    icon: '🗣️'
  },
  {
    id: 'black_pot',
    title: '背锅',
    description: '受伤反弹 50% 伤害给攻击者（包括护盾受损）。',
    rarity: 'rare',
    category: 'item',
    price: 120,
    icon: '🍳',
    items: ['黑锅']
  },
  {
    id: 'fishing_guide',
    title: '摸鱼指南',
    description: '增加 15% 闪避几率 (上限60%)。',
    rarity: 'rare',
    category: 'item',
    price: 130,
    icon: '📖',
    items: ['摸鱼指南']
  },
  {
    id: 'e_wooden_fish',
    title: '电子木鱼',
    description: '每受到一次伤害，获得 1 点功德(金币)。',
    rarity: 'rare',
    category: 'item',
    price: 150,
    icon: '🧘',
    items: ['木鱼']
  },
  {
    id: 'red_envelope',
    title: '红包',
    description: '攻击命中有概率掉落 6 块钱。',
    rarity: 'rare',
    category: 'item',
    price: 150,
    icon: '🧧',
    items: ['红包']
  },
  {
    id: 'koi_fish',
    title: '欧皇附体',
    description: '增加 5% 药物掉落率（可以吸欧气）。',
    rarity: 'rare',
    category: 'item',
    price: 100,
    icon: '🐟',
    items: ['欧皇附体']
  },
  {
    id: 'cyber_amulet',
    title: '赛博护身符',
    description: '受到伤害减少 3 点 (最低为1)。',
    rarity: 'rare',
    category: 'item',
    price: 220,
    icon: '🧿',
    items: ['护身符']
  },
  {
    id: 'n_plus_one',
    title: 'N+1 赔偿',
    description: '每波生命值首次低于 20% 时，立刻获得 50 块钱。',
    rarity: 'rare',
    category: 'item',
    price: 150,
    icon: '💸',
    items: ['N+1']
  },
  {
      id: 'team_building',
      title: '团建经费',
      description: '每秒恢复 1 点生命值。',
      rarity: 'rare',
      category: 'upgrade',
      price: 120,
      icon: '🍻'
  },
  {
      id: 'lottery_ticket',
      title: '彩票',
      description: '搏一搏单车变摩托！最高获得 15万 块！(极低概率)',
      rarity: 'rare',
      category: 'item',
      price: 80,
      icon: '🎟️'
  },
  {
    id: 'hot_search',
    title: '买热搜',
    description: '子弹穿透 +1，但单发伤害降低 10%。',
    rarity: 'rare',
    category: 'upgrade',
    price: 140,
    icon: '🔥'
  },
  {
    id: 'fan_group',
    title: '粉丝群',
    description: '子弹数量 +1 (至多5发)，单发伤害降低 10%。',
    rarity: 'rare',
    category: 'upgrade',
    price: 160,
    icon: '📶'
  },
  {
    id: 'goji_berry',
    title: '养生枸杞',
    description: '每波开始时，最大生命值永久 +1。',
    rarity: 'rare',
    category: 'item',
    price: 150,
    icon: '🍵',
    items: ['养生枸杞']
  },

  // --- Epic (总监级) ---
  {
    id: 'rgb_keyboard',
    title: 'RGB客制化键盘',
    description: '攻速 +25%。光污染就是战斗力！',
    rarity: 'epic',
    category: 'upgrade',
    price: 350,
    icon: '🌈'
  },
  {
    id: 'coupon',
    title: '小卖部黑卡',
    description: '商店价格永久打8折！(限3张)',
    rarity: 'epic',
    category: 'item',
    price: 300,
    maxCount: 3,
    icon: '💳',
    items: ['优惠券']
  },
  {
    id: 'insurance',
    title: '高额意外险',
    description: '受伤获得 15 块 (每份单局上限1200)。',
    rarity: 'epic',
    category: 'item',
    price: 250,
    icon: '📝',
    items: ['高额意外险']
  },
  {
      id: 'ppt_master',
      title: 'PPT大师',
      description: '每次攻击有 10% 概率让敌人眩晕 1 秒 (画饼充饥)。',
      rarity: 'epic',
      category: 'item',
      price: 350,
      icon: '📊',
      items: ['PPT']
  },
  {
      id: 'algorithm_push',
      title: '算法推荐',
      description: '深度穿透 +1，弹道速度 +15%。强推给更多人看。',
      rarity: 'epic',
      category: 'upgrade',
      price: 300,
      icon: '🤖'
  },
  {
    id: 'fishing_license',
    title: '摸鱼执照',
    description: '闪避成功时，回复 5 点生命值。',
    rarity: 'epic',
    category: 'item',
    price: 260,
    icon: '🪪',
    items: ['摸鱼执照']
  },
  {
      id: 'wolf_culture',
      title: '狼性文化',
      description: '生命值越低，攻击速度越快 (最高 +100%). 限购1次。',
      rarity: 'epic',
      category: 'item',
      price: 280,
      maxCount: 1,
      icon: '🐺',
      items: ['狼性文化']
  },
  {
      id: 'ipo',
      title: 'IPO上市',
      description: '上市圈钱，伤害暴涨 +30%。',
      rarity: 'epic',
      category: 'upgrade',
      price: 600,
      icon: '📈'
  },
  {
    id: 'work_fat',
    title: '工伤肥',
    description: '体型变大 20%，最大生命值 +20%，移动速度 -5%。',
    rarity: 'epic',
    category: 'item',
    price: 200,
    icon: '🍔',
    items: ['工伤肥']
  },
  {
      id: 'health_for_damage',
      title: '透支未来',
      description: '最大生命值 -30%，但攻击力 +50%。',
      rarity: 'epic',
      category: 'item',
      price: 350,
      icon: '🩸',
      items: ['透支未来']
  },

  // --- Mythic (董事长级) ---
  {
    id: 'street_lamp',
    title: '资本家路灯',
    description: '吸血 +2%。子弹命中回复生命。',
    rarity: 'mythic',
    category: 'item',
    price: 500,
    icon: '💡',
    items: ['路灯']
  },
  {
    id: 'quirky_gun',
    title: '古灵精怪枪',
    description: '发射时向身后也发射一颗子弹 (限2把)。',
    rarity: 'mythic',
    category: 'item',
    price: 400,
    maxCount: 2,
    icon: '🔫',
    items: ['古灵精怪枪']
  },
  {
    id: 'involution_king',
    title: '卷王之王',
    description: '伤害x1.5，攻击频率+20%，移速+20%。但每秒扣除 2 点生命值。',
    rarity: 'mythic',
    category: 'item',
    price: 600,
    icon: '👑',
    items: ['卷王']
  },
  {
    id: 'soft_landing',
    title: '经济软着陆',
    description: '通货膨胀率归零。',
    rarity: 'mythic',
    category: 'item',
    price: 800,
    icon: '🛬',
    items: ['软着陆']
  },
  {
    id: 'ddl',
    title: '死线 (DDL)',
    description: '伤害 +100%，但最大生命值减半。',
    rarity: 'mythic',
    category: 'item',
    price: 666,
    icon: '📅',
    items: ['死线']
  },
  {
      id: 'layoff_letter',
      title: '裁员广进',
      description: '每击杀一个敌人，永久增加 0.5 点基础伤害。',
      rarity: 'mythic',
      category: 'item',
      price: 999,
      icon: '✉️',
      items: ['裁员信']
  },
  {
    id: 'capital_power',
    title: '钞能力',
    description: '拥有的金币越多，伤害越高。(每 100 金币 +5% 伤害)',
    rarity: 'mythic',
    category: 'item',
    price: 777,
    icon: '💰',
    items: ['钞能力']
  },
  {
    id: 'brain_drain',
    title: '降智光环',
    description: '周围的敌人像喝了假酒一样减速 60%。(限购1个)',
    rarity: 'mythic',
    category: 'item',
    price: 600,
    maxCount: 1,
    icon: '😵',
    items: ['降智光环']
  },
  {
      id: 'revive_coin',
      title: '买命钱',
      description: '受到致命伤害时，消耗所有金币免疫死亡，并恢复50%生命值。限购1次，触发后消失。',
      rarity: 'mythic',
      category: 'item',
      price: 888,
      maxCount: 1,
      icon: '🪙',
      items: ['买命钱']
  }
];
