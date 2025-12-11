
import { UpgradeOption, IGameEngine } from "../../types";
import { spawnFloatingText } from "../../services/logic/utils";
import { GameEventType } from "../../services/logic/events/events";
import { DropSystem } from "../../services/logic/systems/DropSystem";

export const SURVIVAL_ITEMS: UpgradeOption[] = [
  {
    id: '5g_speed',
    title: '5G网速',
    description: '移动速度 +0.5。',
    rarity: 'common',
    category: 'upgrade',
    price: 60,
    icon: '🚀',
    statTags: ['移速+'],
    quote: '“下载速度确实快，就是流量跑得心疼。”',
    effect: (state) => { state.player.speed += 0.5; }
  },
  {
    id: 'energy_drink',
    title: '红牛',
    description: '移动速度 +0.8。',
    rarity: 'common',
    category: 'item',
    price: 80,
    icon: '🥫',
    items: ['红牛'],
    tags: ['hardcore'],
    statTags: ['移速+'],
    quote: '“困了累了？喝完这一罐，心脏狂跳一整晚。”',
    effect: (state) => {
        state.player.speed += 0.8;
        state.player.items.push('红牛');
    }
  },
  {
    id: 'screen_protector',
    title: '钢化膜',
    description: '护盾上限 +30。每秒自动恢复 1 点护盾。',
    rarity: 'common',
    category: 'item',
    price: 60,
    icon: '📱',
    items: ['钢化膜'],
    statTags: ['护盾'],
    quote: '“碎屏险太贵，还是贴膜吧。心理安慰+100。”',
    effect: (state) => {
        state.player.maxShield += 30;
        state.player.items.push('钢化膜');
    }
  },
  {
    id: 'blue_screen_glasses',
    title: '防蓝光眼镜',
    description: '护盾受击时释放电磁脉冲击退并伤害敌人（CD 1秒）。',
    rarity: 'excellent',
    category: 'item',
    price: 140,
    icon: '👓',
    items: ['防蓝光眼镜'],
    tags: ['tech'], 
    statTags: ['护盾', '反伤'],
    quote: '“保护视力，从反弹伤害开始。”',
    effect: (state) => {
        state.player.items.push('防蓝光眼镜');
        state.player.customTimers['blue_screen_cd'] = 0;
    }
  },
  {
    id: 'thick_face',
    title: '防弹脸皮',
    description: '最大生命 +30。',
    rarity: 'excellent', 
    category: 'upgrade',
    price: 80,
    icon: '🛡️',
    tags: ['slacker'],
    statTags: ['生命+'],
    quote: '“只要我不尴尬，尴尬的就是别人。脸皮厚度决定生存长度。”',
    effect: (state) => { state.player.maxHp += 30; }
  },
  {
    id: 'goji_berry',
    title: '养生枸杞',
    description: '每波开始时，最大生命值永久 +10。',
    rarity: 'rare',
    category: 'item',
    price: 200,
    icon: '🍵',
    items: ['养生枸杞'],
    tags: ['slacker'],
    statTags: ['生命+', '成长'],
    quote: '“人到中年不得已，保温杯里泡枸杞。”',
    effect: (state) => {
        state.player.items.push('养生枸杞');
    },
    onWaveStart: (engine: IGameEngine, count: number) => {
        const hpGain = 10 * count;
        engine.state.player.maxHp += hpGain;
        spawnFloatingText(engine, engine.state.player.x, engine.state.player.y - 70, `养生+${hpGain}`, '#22c55e', 'chat');
    }
  },
  {
      id: 'team_building',
      title: '团建经费',
      description: '每秒恢复 1 点生命值。',
      rarity: 'rare',
      category: 'upgrade',
      price: 120,
      icon: '🍻',
      tags: ['slacker'], 
      statTags: ['回血'],
      quote: '“虽然团建很尴尬，但免费的饭不吃白不吃。”',
      effect: (state) => {
        state.player.hpRegen += 1;
      }
  },
  {
    id: 'work_fat',
    title: '工伤肥',
    description: '体型变大 20%，最大生命值 +20%，移动速度 -5%。',
    rarity: 'epic',
    category: 'item',
    price: 200,
    icon: '🍔',
    items: ['工伤肥'],
    tags: ['slacker'], 
    statTags: ['生命+', '移速-'],
    quote: '“我不是胖，我是压力大导致的皮质醇升高！”',
    effect: (state) => {
        state.player.radius *= 1.2;
        state.player.maxHp = Math.ceil(state.player.maxHp * 1.2);
        state.player.hp += 20; 
        state.player.speed *= 0.95;
        state.player.items.push('工伤肥');
    }
  },
  {
    id: 'fish_pond',
    title: '养鱼塘',
    description: '击杀概率掉落"爱心"，拾取获得10点临时护盾(过波清空)。',
    rarity: 'epic', 
    category: 'item',
    price: 220,
    icon: '🎣',
    items: ['养鱼塘'],
    tags: ['slacker'],
    statTags: ['护盾', '掉落'],
    quote: '“不要在一棵树上吊死。我是说，要多发展几个备胎（血包）。”',
    effect: (state) => {
        state.player.items.push('养鱼塘');
    },
    hooks: {
        onKill: (engine, enemy, count) => {
            const chance = 0.08 * count;
            if (Math.random() < chance) {
                 DropSystem.spawnPickup(engine, {
                    id: Math.random().toString(),
                    x: enemy.x, y: enemy.y,
                    radius: 12,
                    emoji: '💖',
                    type: 'love_heart',
                    value: 10,
                    life: 600 
                });
            }
        }
    }
  },
  {
    id: 'stress_response',
    title: '应激反应',
    description: '受伤时向四周发射高伤反击子弹(最大生命10%)，无限穿透。',
    rarity: 'epic',
    category: 'item',
    price: 300,
    icon: '💢',
    items: ['应激反应'],
    tags: ['hardcore', 'tech'],
    statTags: ['反伤', 'AOE'],
    quote: '“别碰我！我会炸的！我真的会炸的！”',
    effect: (state) => {
        state.player.items.push('应激反应');
    }
  },
  {
    id: 'paid_pooping',
    title: '带薪拉屎',
    description: '站立不动超过 1 秒后，每秒恢复 2 生命并获得 1 金币。',
    rarity: 'rare',
    category: 'item',
    price: 200,
    icon: '🚽',
    items: ['带薪拉屎'],
    tags: ['slacker'],
    statTags: ['回血', '搞钱'],
    quote: '“公司的一小步，我肠道的一大步。这是我一天中最神圣的时刻。”',
    effect: (state) => { state.player.items.push('带薪拉屎'); },
    hooks: {
        onTick: (engine: IGameEngine, count: number) => {
            const p = engine.state.player;
            const isMoving = Math.abs(p.vx) > 0.1 || Math.abs(p.vy) > 0.1;
            
            if (isMoving) {
                p.standStillTimer = 0;
            } else {
                if (p.standStillTimer > 60) { // > 1s
                    if (p.standStillTimer % 60 === 0) {
                        const heal = 2 * count;
                        if (p.hp < p.maxHp) {
                            p.hp = Math.min(p.maxHp, p.hp + heal);
                            spawnFloatingText(engine, p.x, p.y - 40, `+${heal}`, "#22c55e", 'damage');
                        }
                        const gold = 1 * count;
                        p.gold += gold;
                        engine.state.score += gold;
                        engine.state.waveStats.goldEarned += gold;
                        
                        spawnFloatingText(engine, p.x, p.y - 60, "🚽", "#ffffff");
                    }
                }
            }
        }
    }
  },
  {
    id: 'hot_coffee_splash',
    title: '泼洒的热咖啡',
    description: '受伤时生成伤害区域（每秒伤害 = 最大生命 20%）。',
    rarity: 'rare',
    category: 'item',
    price: 240,
    icon: '☕',
    items: ['泼洒的热咖啡'],
    tags: ['market'], 
    statTags: ['反伤', '区域'],
    quote: '“哎呀！不好意思！手滑了！（内心：烫死你个龟孙）”',
    effect: (state) => {
        state.player.items.push('泼洒的热咖啡');
    },
    getDynamicDescription: (count) => {
        if (count === 0) return '受伤时生成伤害区域（每秒伤害 = 最大生命 20%）。';
        // Base 20% + (count-1)*10%
        const curr = (20 + (count - 1) * 10);
        const next = (20 + count * 10);
        return `【当前伤害】每秒 ${curr}% 最大生命值\n【购买后】每秒 ${next}% 最大生命值`;
    }
  },
  {
    id: 'noise_cancelling_headphones',
    title: '降噪耳机',
    description: '护盾上限+50，恢复速度翻倍。护盾未被击破时，受伤不会打断恢复计时。',
    rarity: 'rare', // Downgraded from Epic
    category: 'item',
    price: 500, // Reduced from 600
    maxCount: 1,
    icon: '🎧',
    items: ['降噪耳机'],
    tags: ['slacker'], 
    statTags: ['护盾', '回复'],
    quote: '“只要我戴上耳机，老板的咆哮就是背景白噪音。”',
    effect: (state) => {
        state.player.maxShield += 50; // BUFF
        state.player.items.push('降噪耳机');
    }
  },
  {
    id: 'golden_parachute',
    title: '黄金降落伞',
    description: '生命+100，护盾+100。',
    rarity: 'epic',
    category: 'item',
    price: 700,
    icon: '🪂',
    items: ['黄金降落伞'],
    tags: ['capital'], 
    statTags: ['生命+', '护盾'],
    quote: '“即使公司倒闭了，高管们也能带着巨额赔偿金安全着陆。”',
    effect: (state) => {
        state.player.maxHp += 100;
        state.player.hp += 100;
        state.player.maxShield += 100;
        state.player.shield += 100;
        state.player.items.push('黄金降落伞');
    }
  },

  // --- 防御机制 ---
  {
    id: 'black_pot',
    title: '背锅',
    description: '受伤反弹 50% 伤害给攻击者（包括护盾受损）。',
    rarity: 'rare',
    category: 'item',
    price: 120,
    icon: '🍳',
    items: ['黑锅'],
    tags: ['hardcore'],
    statTags: ['反伤'],
    quote: '“这锅我不背！还给你！”',
    effect: (state) => {
        state.player.damageReflection += 0.5;
        state.player.items.push('黑锅');
    }
  },
  {
    id: 'fishing_guide',
    title: '摸鱼指南',
    description: '增加 15% 闪避几率 (上限60%)。',
    rarity: 'rare',
    category: 'item',
    price: 130,
    maxCount: 4, 
    limitReason: "闪避已达上限(60%)",
    icon: '📖',
    items: ['摸鱼指南'],
    tags: ['slacker'],
    statTags: ['闪避'],
    quote: '“这里建议您这边左耳进右耳出呢。”',
    effect: (state) => {
        state.player.dodgeChance += 0.15;
        state.player.items.push('摸鱼指南');
    }
  },
  {
    id: 'cyber_amulet',
    title: '赛博护身符',
    description: '受伤减少 3 点 (最低为1)。',
    rarity: 'rare',
    category: 'item',
    price: 220,
    icon: '🧿',
    items: ['护身符'],
    tags: ['tech'],
    statTags: ['减伤'],
    quote: '“转发这个护身符，水逆退散，Bug退散。”',
    effect: (state) => {
        state.player.items.push('护身符');
    }
  },
  {
    id: 'fishing_license',
    title: '摸鱼执照',
    description: '闪避成功时，回复 5 点生命值。',
    rarity: 'epic',
    category: 'item',
    price: 260,
    icon: '🪪',
    items: ['摸鱼执照'],
    tags: ['slacker'],
    statTags: ['闪避', '回血'],
    quote: '“持证上岗，合法摸鱼。躲过一劫感觉身心愉悦。”',
    effect: (state) => { state.player.items.push('摸鱼执照'); }
  }
];
