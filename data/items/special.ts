
import { UpgradeOption, IGameEngine } from "../../types";
import { GameEventType } from "../../services/logic/events/events";
import { spawnFloatingText } from "../../services/logic/utils";

export const SPECIAL_ITEMS: UpgradeOption[] = [
  // --- 混合属性 / 机制类 ---
  {
      id: 'ppt_master',
      title: 'PPT大师',
      description: '攻击有 10% 概率让敌人眩晕 1 秒。',
      rarity: 'epic',
      category: 'item',
      price: 350,
      icon: '📊',
      items: ['PPT'],
      statTags: ['控制'],
      quote: '“让我为您详细汇报一下接下来的战略打法... (敌人已昏睡过去)”',
      effect: (state) => { state.player.items.push('PPT'); }
  },
  {
      id: 'wolf_culture',
      title: '狼性文化',
      description: '生命值越低，攻击速度越快 (最高 +100% 动态加成)。限购1次。',
      rarity: 'epic',
      category: 'item',
      price: 280,
      maxCount: 1,
      icon: '🥩',
      items: ['狼性文化'],
      tags: ['hardcore'], 
      statTags: ['攻速+', '机制'],
      quote: '“我们要有狼性！只要干不死，就往死里干！”',
      effect: (state) => { state.player.items.push('狼性文化'); }
  },
  {
      id: 'health_for_damage',
      title: '透支未来',
      description: '最大生命值 -30%，但攻击力 +50%。',
      rarity: 'epic',
      category: 'item',
      price: 350,
      maxCount: 3,
      icon: '🩸',
      items: ['透支未来'],
      statTags: ['伤害+', '生命-'],
      quote: '“年轻就是资本。用今天的发际线换明天的KPI。”',
      effect: (state) => {
        state.player.maxHp = Math.max(1, Math.floor(state.player.maxHp * 0.7));
        if (state.player.hp > state.player.maxHp) state.player.hp = state.player.maxHp;
        state.player.attackDamage *= 1.5;
        state.player.items.push('透支未来');
      }
  },
  // --- CONSUMABLES / LUXURY ---
  {
    id: 'standing_desk',
    title: '升降办公桌',
    description: '基础攻击+20，生命+50。每过一波，这些加成再额外提升 10%。',
    rarity: 'consumable',
    category: 'item',
    price: 800,
    maxCount: 1,
    icon: '🪑',
    items: ['升降办公桌'],
    tags: [], // UPDATED: Removed hardcore tag
    statTags: ['伤害+', '生命+', '成长'],
    quote: '“站着办公，远离痔疮。虽然腿很酸，但格调上去了。”',
    effect: (state) => {
        state.player.items.push('升降办公桌');
        state.player.attackDamage += 20;
        state.player.maxHp += 50;
        state.player.hp += 50;
    },
    onWaveStart: (engine: IGameEngine, count: number) => {
        const p = engine.state.player;
        p.attackDamage += 2;
        p.maxHp += 5;
        p.hp += 5;
        spawnFloatingText(engine, p.x, p.y - 70, `升降桌成长!`, '#a855f7', 'chat');
    }
  },
  // --- BOARD LEVEL ITEMS ---
  {
    id: 'involution_king',
    title: '卷王之王',
    description: '伤害 +50%，攻击速度 +2.5 次/秒，移速 +20%。但每秒扣除 2 点生命值。',
    rarity: 'mythic',
    category: 'item',
    price: 600,
    icon: '👑',
    items: ['卷王'],
    tags: ['board'],
    statTags: ['全属性', '自伤'],
    quote: '“你们这点工作量就受不了了？我通宵三天了还很精神呢！（猝死前兆）”',
    effect: (state) => {
        state.player.attackDamage *= 1.5;
        const currentAPS = 60 / state.player.attackSpeed;
        state.player.attackSpeed = 60 / (currentAPS + 2.5);
        state.player.speed *= 1.2;
        state.player.maxHp = Math.max(1, state.player.maxHp - 10);
        if (state.player.hp > state.player.maxHp) state.player.hp = state.player.maxHp;
        state.player.items.push('卷王');
    }
  },
  {
    id: 'soft_landing',
    title: '经济软着陆',
    description: '当前通胀归零，但之后的通胀增长速度翻倍！',
    rarity: 'mythic',
    category: 'item',
    price: 800,
    icon: '🛬',
    items: ['软着陆'],
    tags: ['board'],
    statTags: ['机制'],
    quote: '“只要我们把定义改一下，这就不是衰退，是负增长。”',
    effect: (state) => {
        state.inflationRate = 0;
        state.player.items.push('软着陆');
    }
  },
  {
    id: 'ddl',
    title: '死线 (DDL)',
    description: '伤害 +100%，但最大生命值减半。',
    rarity: 'mythic',
    category: 'item',
    price: 666,
    icon: '📅',
    items: ['死线'],
    tags: ['board'],
    statTags: ['伤害+', '生命-'],
    quote: '“Deadline是第一生产力。要么交货，要么交命。”',
    effect: (state) => {
        state.player.attackDamage *= 2.0;
        state.player.maxHp = Math.floor(state.player.maxHp * 0.5);
        if (state.player.hp > state.player.maxHp) state.player.hp = state.player.maxHp;
        state.player.items.push('死线');
    }
  },
  {
    id: 'brain_drain',
    title: '降智光环',
    description: '周围敌人减速 60%。',
    rarity: 'mythic',
    category: 'item',
    price: 600,
    maxCount: 1,
    icon: '😵',
    items: ['降智光环'],
    tags: ['board'],
    statTags: ['光环', '减速'],
    quote: '“和笨蛋说话会把我的智商拉低到和他们同一水平，然后被他们用丰富的经验击败。”',
    effect: (state) => { state.player.items.push('降智光环'); }
  },
  {
      id: 'revive_coin',
      title: '买命钱',
      description: '致命伤时消耗所有金币复活并回血50%。限购1次，触发后消失。',
      rarity: 'consumable', 
      category: 'item',
      price: 888,
      maxCount: 1,
      icon: '🪙',
      items: ['买命钱'],
      tags: [], // UPDATED: Removed board tag
      statTags: ['复活'],
      quote: '“钱没了可以再赚，命没了就真的只能重开了。”',
      effect: (state) => { state.player.items.push('买命钱'); }
  },
  {
    id: 'pay_to_work',
    title: '贷款上班',
    description: '攻击力 +200%。每次攻击消耗 5 金币。没钱无法攻击。',
    rarity: 'mythic',
    category: 'item',
    price: 0, 
    icon: '💸',
    items: ['贷款上班'],
    tags: ['board'],
    statTags: ['伤害+', '扣钱'],
    quote: '“想工作？先交押金、培训费、服装费... 什么？没钱？去借啊！”',
    effect: (state) => {
        state.player.attackDamage *= 3.0; 
        state.player.items.push('贷款上班');
    }
  },
  {
    id: 'legacy_code',
    title: '祖传屎山',
    description: '每过一波，体型+10%，生命+50，移速-5%。',
    rarity: 'mythic',
    category: 'item',
    price: 404,
    icon: '⛰️',
    items: ['祖传屎山'],
    tags: ['board'],
    statTags: ['生命+', '成长', '移速-'],
    quote: '“这段代码只有离职的那位同事和上帝知道是干嘛的。别动它，它在支撑整个公司。”',
    effect: (state) => { state.player.items.push('祖传屎山'); }
  },
  {
    id: 'memory_leak',
    title: '内存泄漏',
    description: '每 10 秒，体型 +5%，攻击力 +2。属性在每波开始时重置！',
    rarity: 'rare',
    category: 'item',
    price: 256,
    icon: '💾',
    items: ['内存泄漏'],
    statTags: ['波次成长', '伤害+'],
    quote: '“只是几个字节的泄漏，应该没事吧... (3天后) 服务器怎么炸了？”',
    effect: (state) => { 
        state.player.items.push('内存泄漏'); 
        // Init accumulators in customVars
        if (!state.player.customVars) state.player.customVars = {};
        if (state.player.customVars['mem_leak_acc_dmg'] === undefined) state.player.customVars['mem_leak_acc_dmg'] = 0;
        if (state.player.customVars['mem_leak_acc_rad'] === undefined) state.player.customVars['mem_leak_acc_rad'] = 0;
    },
    hooks: {
        onTick: (engine, count) => {
            const p = engine.state.player;
            if (!p.memoryLeakTimer) p.memoryLeakTimer = 0;
            p.memoryLeakTimer++;
            
            // Trigger every 10 seconds (600 frames)
            if (p.memoryLeakTimer >= 600) {
                p.memoryLeakTimer = 0;
                
                // Calculate gains
                const dmgGain = 2 * count;
                const radGain = p.radius * (0.05 * count);
                
                // Apply stats
                p.attackDamage += dmgGain;
                p.radius += radGain;
                
                // Track accumulation for reset at wave start
                if (!p.customVars) p.customVars = {};
                p.customVars['mem_leak_acc_dmg'] = (p.customVars['mem_leak_acc_dmg'] || 0) + dmgGain;
                p.customVars['mem_leak_acc_rad'] = (p.customVars['mem_leak_acc_rad'] || 0) + radGain;

                engine.emit(GameEventType.FLOATING_TEXT, { x: p.x, y: p.y - 80, text: "内存泄漏! 属性↑", color: "#8b5cf6", category: 'chat' });
            }
        }
    }
  }
];
