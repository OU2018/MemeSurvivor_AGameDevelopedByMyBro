
import { UpgradeOption } from "../../types";
import { GameEventType } from "../../services/logic/events/events";
import { BattleFormulas } from "../../services/logic/battle/formulas";
import { spawnFloatingText } from "../../services/logic/utils";

export const WEAPON_ITEMS: UpgradeOption[] = [
  // --- 攻速类 ---
  {
    id: 'membrane_keyboard',
    title: '普通键盘',
    description: '攻击速度 +0.3 次/秒。',
    rarity: 'common',
    category: 'upgrade',
    price: 60,
    icon: '⌨️',
    statTags: ['攻速+'],
    quote: '“公司标配，手感像是在按湿海绵，但能用。”',
    effect: (state) => { 
        const currentAPS = 60 / state.player.attackSpeed;
        const newAPS = currentAPS + 0.3;
        state.player.attackSpeed = 60 / newAPS;
    }
  },
  {
    id: 'coffee',
    title: '冰美式',
    description: '弹速 +1.0，攻击速度 +0.15 次/秒。',
    rarity: 'common',
    category: 'upgrade',
    price: 60,
    icon: '☕',
    tags: ['hardcore'], 
    statTags: ['攻速+', '弹速+'],
    quote: '“打工人的血液。没有它，我连开机密码都想不起来。”',
    effect: (state) => {
        state.player.projectileSpeed += 1;
        const currentAPS = 60 / state.player.attackSpeed;
        state.player.attackSpeed = 60 / (currentAPS + 0.15);
    }
  },
  {
      id: 'quantum_reading',
      title: '量子波动速读',
      description: '攻击速度 +0.5 次/秒，但子弹变慢 10%。',
      rarity: 'common',
      category: 'item',
      price: 150,
      icon: '📖',
      items: ['量子速读'],
      tags: ['slacker'],
      statTags: ['攻速+', '弹速-'],
      quote: '“遇事不决，量子力学。只要书翻得够快，知识就追不上我。”',
      effect: (state) => {
        const currentAPS = 60 / state.player.attackSpeed;
        state.player.attackSpeed = 60 / (currentAPS + 0.5);
        state.player.projectileSpeed *= 0.9;
        state.player.items.push('量子速读');
      }
  },
  {
    id: 'mechanical_keyboard',
    title: '机械键盘',
    description: '攻击速度 +0.7 次/秒。',
    rarity: 'excellent', 
    category: 'upgrade',
    price: 150,
    icon: '⌨️',
    tags: ['hardcore'], 
    statTags: ['攻速+'],
    quote: '“青轴的声音，是办公室里的冲锋号。”',
    effect: (state) => { 
        const currentAPS = 60 / state.player.attackSpeed;
        state.player.attackSpeed = 60 / (currentAPS + 0.7);
    }
  },
  {
    id: 'mouse_macro',
    title: '鼠标连点器',
    description: '站立不动时，每秒提升 10% 攻击速度（最高+50%）。移动重置。',
    rarity: 'rare',
    category: 'item',
    price: 220,
    icon: '🖱️',
    items: ['鼠标连点器'],
    tags: ['slacker'],
    statTags: ['攻速+'],
    quote: '“物理外挂，解放双手。我只是在测试鼠标寿命。”',
    effect: (state) => {
        state.player.items.push('鼠标连点器');
    }
  },
  {
    id: 'rgb_keyboard',
    title: 'RGB客制化键盘',
    description: '攻击速度 +1.5 次/秒。',
    rarity: 'epic',
    category: 'upgrade',
    price: 350,
    icon: '🌈',
    tags: ['hardcore'], 
    statTags: ['攻速+'],
    quote: '“光污染就是战斗力！性能提升 200%（心理上）。”',
    effect: (state) => { 
        const currentAPS = 60 / state.player.attackSpeed;
        state.player.attackSpeed = 60 / (currentAPS + 1.5);
    }
  },

  // --- 伤害类 ---
  {
    id: 'keyboard_cleaner',
    title: '键盘清理泥',
    description: '基础伤害 +2.0。',
    rarity: 'common',
    category: 'upgrade',
    price: 30,
    icon: '🧹',
    tags: ['slacker'], 
    statTags: ['伤害+'],
    quote: '“你永远不知道键盘缝隙里藏着多少零食碎屑和头发。”',
    effect: (state) => { state.player.attackDamage += 2; }
  },
  {
    id: 'big_lung',
    title: '大嗓门',
    description: '基础伤害 +5.0。',
    rarity: 'excellent', 
    category: 'upgrade',
    price: 150,
    icon: '🗣️',
    tags: ['market'], 
    statTags: ['伤害+'],
    quote: '“在职场，谁嗓门大谁就有理。输出全靠吼！”',
    effect: (state) => { state.player.attackDamage += 5; }
  },
  {
    id: 'shared_folder',
    title: '共享文件夹',
    description: '子弹飞行距离越远，伤害越高（最高+30%）。',
    rarity: 'excellent',
    category: 'item',
    price: 160,
    icon: '📂',
    items: ['共享文件夹'],
    tags: ['tech'], 
    statTags: ['伤害+'],
    quote: '“让子弹飞一会儿。数据传输需要时间，伤害也是。”',
    effect: (state) => { state.player.items.push('共享文件夹'); }
  },
  {
      id: 'ipo',
      title: 'IPO上市',
      description: '伤害 +30% (乘法叠加)。',
      rarity: 'epic',
      category: 'upgrade',
      price: 600,
      icon: '📈',
      tags: ['capital'],
      statTags: ['伤害+'],
      quote: '“虽然还在亏损，但我们讲了一个好故事。现在，镰刀动了。”',
      effect: (state) => { 
        state.player.attackDamage *= 1.3;
      }
  },
  {
    id: 'binary_thinking',
    title: '二极管',
    description: '伤害要么是 300% (暴击)，要么是 1。概率各50%。',
    rarity: 'rare',
    category: 'upgrade',
    price: 180,
    maxCount: 1,
    limitReason: "世界只有0和1",
    icon: '☯️',
    items: ['二极管'],
    tags: ['tech'],
    statTags: ['暴击', '伤害'],
    quote: '“世界上只有两种人：支持我的和傻X。非黑即白，没有中间商赚差价。”',
    effect: (state) => { state.player.items.push('二极管'); }
  },
  {
    id: 'firewall_404',
    title: '404屏障',
    description: '每隔 15 秒，发出一道脉冲清除全屏敌方子弹。',
    rarity: 'epic',
    category: 'item',
    price: 404,
    icon: '🧱',
    items: ['404屏障'],
    tags: ['tech'],
    statTags: ['清屏', '防御'],
    quote: '“您访问的页面不存在。问题解决了。”',
    effect: (state) => { 
        state.player.items.push('404屏障');
        state.player.customTimers['firewall'] = 0; 
    },
    hooks: {
        onTick: (engine, count) => {
            const p = engine.state.player;
            if (p.customTimers['firewall'] === undefined) p.customTimers['firewall'] = 0;
            
            // Cooldown reduction for stacking
            const speed = 1.0 + (count - 1) * 0.1;
            p.customTimers['firewall'] -= speed;
            
            if (p.customTimers['firewall'] <= 0) {
                p.customTimers['firewall'] = 900; // 15s
                engine.state.zones.push({
                    id: Math.random().toString(),
                    x: p.x, y: p.y,
                    radius: 600,
                    type: 'firewall_wave',
                    life: 45,
                    maxLife: 45,
                    color: '#3b82f6',
                    emoji: ''
                });
                engine.emit(GameEventType.FLOATING_TEXT, { x: p.x, y: p.y - 60, text: "404 防火墙启动!", color: "#3b82f6", category: 'chat' });
                engine.audio.playPowerup();
            }
        }
    },
    getDynamicDescription: (count) => {
        if (count === 0) return '每隔 15 秒，发出一道脉冲清除全屏敌方子弹。';
        const currentSpeed = 1.0 + (count - 1) * 0.1;
        const nextSpeed = 1.0 + count * 0.1;
        return `【当前充能】${currentSpeed.toFixed(1)}倍速\n【购买后】${nextSpeed.toFixed(1)}倍速 (冷却更短)`;
    }
  },
  {
    id: 'involution_field',
    title: '内卷力场',
    description: '对身边 150 范围内的敌人，每秒造成 50% 攻击力的伤害。',
    rarity: 'epic',
    category: 'item',
    price: 350,
    icon: '🌀',
    items: ['内卷力场'],
    tags: ['hardcore'],
    statTags: ['光环', '伤害+'],
    quote: '“只要我够卷，周围的人就会因为压力过大而掉血。”',
    effect: (state) => { 
        state.player.items.push('内卷力场'); 
        state.player.customTimers['involution'] = 0;
    },
    hooks: {
        onTick: (engine, count) => {
            const p = engine.state.player;
            if (p.customTimers['involution'] === undefined) p.customTimers['involution'] = 0;
            
            p.customTimers['involution']--;
            if (p.customTimers['involution'] <= 0) {
                p.customTimers['involution'] = 60; // 1 second
                const multiplier = 0.5 * count;
                const damage = BattleFormulas.getPlayerDamage(p) * multiplier;
                const radius = 150;
                
                for (let i = engine.state.enemies.length - 1; i >= 0; i--) {
                    const e = engine.state.enemies[i];
                    const dist = Math.hypot(e.x - p.x, e.y - p.y);
                    if (dist < radius + e.radius) {
                        e.hp -= damage;
                        engine.state.waveStats.damageDealt += damage;
                        engine.emit(GameEventType.ENTITY_DAMAGED, { x: e.x, y: e.y, text: `-${Math.floor(damage)}`, color: '#a855f7' });
                        if (e.config.behavior === 'boss' && e.phase === 1 && e.hp <= 0) {
                             e.hp = 0; 
                        } else if (e.hp <= 0) {
                             e.hp = 0; 
                        }
                    }
                }
            }
        }
    },
    getDynamicDescription: (count) => {
        if (count === 0) return '对身边敌人每秒造成 50% 攻击力的伤害。';
        return `【当前伤害】${50 * count}% 攻击力/秒\n【购买后】${50 * (count + 1)}% 攻击力/秒`;
    }
  },
  {
    id: 'retweet_raffle',
    title: '转发抽奖',
    description: '攻击有 1% 概率造成 9999 点真实伤害。',
    rarity: 'epic',
    category: 'item',
    price: 288,
    icon: '🎰',
    items: ['转发抽奖'],
    tags: ['market'], 
    statTags: ['秒杀', '运气'],
    quote: '“转发这条锦鲤，你也能成为万分之一的幸运儿（分母）。”',
    effect: (state) => { state.player.items.push('转发抽奖'); }
  },

  // --- 投射物强化 ---
  
  {
    id: 'wifi_booster',
    title: 'WiFi增强器',
    description: '子弹飞行速度 +1.0。',
    rarity: 'common',
    category: 'item',
    price: 70,
    icon: '📡',
    items: ['WiFi'],
    tags: ['tech'], 
    statTags: ['弹速+'],
    quote: '“信号满格，心情舒畅。可惜连的是公司内网。”',
    effect: (state) => {
        state.player.projectileSpeed += 1;
        state.player.items.push('WiFi');
    }
  },
  {
    id: 'fan_group',
    title: '粉丝群',
    description: '子弹数量 +1，单发伤害降低 10%。',
    rarity: 'rare',
    category: 'upgrade',
    price: 160,
    icon: '📶',
    tags: ['tech'],
    statTags: ['数量+', '伤害-'],
    quote: '“虽然质量不高，但我们人多势众。控评！控评！”',
    effect: (state) => {
        state.player.projectileCount += 1;
        state.player.attackDamage *= 0.9;
    }
  },

  // --- MERGED ITEMS ---
  
  {
      id: 'layoff_letter',
      title: '裁员广进',
      description: '每击杀 25 个敌人，永久增加 1 点基础攻击力。',
      rarity: 'mythic',
      category: 'item',
      price: 999,
      icon: '✉️',
      items: ['裁员信'],
      tags: ['capital'],
      statTags: ['成长', '伤害+'],
      quote: '“为了公司长远发展，我们不得不做出艰难的决定... 你的牺牲是值得的。”',
      effect: (state) => {
        state.player.items.push('裁员信');
        if (!state.player.customTimers) state.player.customTimers = {};
        state.player.customTimers['layoff_count'] = 0; // Track kills
      },
      hooks: {
          onKill: (engine, enemy, count) => {
              // 1 damage per 25 kills = 0.04 per kill
              const dmgPerKill = 0.04;
              engine.state.player.attackDamage += dmgPerKill * count;
          }
      },
      getDynamicDescription: (count) => {
          if (count === 0) return '每击杀 25 个敌人，永久增加 1 点基础攻击力。';
          return `【当前效果】击杀+${(0.04 * count).toFixed(2)} 伤害\n【购买后】击杀+${(0.04 * (count + 1)).toFixed(2)} 伤害`;
      }
  },
  {
    id: 'capital_power',
    title: '钞能力',
    description: '拥有的金币越多，伤害越高。(每 100 金币 +5% 伤害)',
    rarity: 'mythic',
    category: 'item',
    price: 777,
    icon: '💰',
    items: ['钞能力'],
    tags: ['board'], // UPDATED: Changed from capital to board
    statTags: ['伤害+', '成长'],
    quote: '“有钱真的可以为所欲为。”',
    effect: (state) => { state.player.items.push('钞能力'); }
  },
  {
    id: 'street_lamp',
    title: '资本家路灯',
    description: '命中吸血(5%)且概率偷钱。',
    rarity: 'mythic',
    category: 'item',
    price: 500,
    icon: '💡',
    items: ['路灯'],
    tags: ['board'], // UPDATED: Changed from capital to board
    statTags: ['吸血', '偷钱'],
    quote: '“总有一天，你会挂在上面。”',
    effect: (state) => {
         state.player.lifeSteal += 0.05; 
         state.player.items.push('路灯');
    },
    getDynamicDescription: (count) => {
         return `吸血 ${count * 5}%, 命中偷钱 (可叠加)`;
    }
  },
  {
    id: 'quirky_gun',
    title: '古灵精怪枪',
    description: '发射时向身后也发射一颗子弹 (限2把)。',
    rarity: 'epic', 
    category: 'item',
    price: 400,
    maxCount: 2,
    icon: '🔫',
    items: ['古灵精怪枪'],
    tags: ['tech'], 
    statTags: ['数量+'],
    quote: '“虽然不知道原理，但它就是能双向射击。可能是Bug，也可能是Feature。”',
    effect: (state) => {
        state.player.backwardShots += 1;
        state.player.items.push('古灵精怪枪');
    }
  }
];
