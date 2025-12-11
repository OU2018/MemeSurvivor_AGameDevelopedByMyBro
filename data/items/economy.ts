
import { UpgradeOption } from "../../types";
import { spawnFloatingText } from "../../services/logic/utils";
import { GameEventType } from "../../services/logic/events/events";

export const ECONOMY_ITEMS: UpgradeOption[] = [
  {
    id: 'e_wooden_fish',
    title: '电子木鱼',
    description: '受伤获得 1 金币。',
    rarity: 'rare',
    category: 'item',
    price: 150,
    icon: '🧘',
    items: ['木鱼'],
    tags: ['slacker'],
    statTags: ['搞钱'],
    quote: '“敲一下，功德+1；挨一顿打，金币+1。这波不亏。”',
    effect: (state) => { state.player.items.push('木鱼'); }
  },
  {
    id: 'red_envelope',
    title: '红包',
    description: '攻击命中有概率掉落 6 块钱。',
    rarity: 'rare',
    category: 'item',
    price: 150,
    icon: '🧧',
    items: ['红包'],
    tags: ['capital'],
    statTags: ['搞钱'],
    quote: '“虽然只有几块钱，但抢到就是赚到。”',
    effect: (state) => { state.player.items.push('红包'); }
  },
  {
    id: 'knowledge_pay',
    title: '知识付费',
    description: '商店刷新价格翻倍，但高稀有度物品出现概率大幅提升。',
    rarity: 'rare',
    category: 'item',
    price: 200,
    icon: '🧠',
    items: ['知识付费'],
    tags: ['capital'], // Removed Tech
    statTags: ['运气'],
    quote: '“听懂掌声！想要提升认知，这点学费是必须的。”',
    effect: (state) => { state.player.items.push('知识付费'); }
  },
  {
    id: 'koi_fish',
    title: '欧皇附体',
    description: '药物掉落率 +5%。',
    rarity: 'rare',
    category: 'item',
    price: 100,
    icon: '🐟',
    items: ['欧皇附体'],
    tags: ['capital'], // Removed Slacker
    statTags: ['掉落'],
    quote: '“转发这条锦鲤，下个池子必出货！”',
    effect: (state) => {
        state.player.dropRate += 0.05;
        state.player.items.push('欧皇附体');
    }
  },
  {
    id: 'n_plus_one',
    title: 'N+1 赔偿',
    description: '每波一次：生命值低于 30% 时获得 300 金币。',
    rarity: 'rare',
    category: 'item',
    price: 150,
    icon: '💸',
    items: ['N+1'],
    tags: ['capital'],
    statTags: ['搞钱', '保命'],
    quote: '“裁员？好耶！只要钱给够，我现在就走。”',
    effect: (state) => { 
        state.player.items.push('N+1');
        // Init custom var for wave tracking
        if (!state.player.customVars) state.player.customVars = {};
        state.player.customVars['n_plus_one_wave'] = 0;
    },
    hooks: {
        onTick: (engine, count) => {
            const p = engine.state.player;
            const wave = engine.state.currentWave;
            // Check if already triggered this wave
            if (p.customVars['n_plus_one_wave'] === wave) return;

            if (p.hp / p.maxHp < 0.3) {
                // Trigger!
                p.customVars['n_plus_one_wave'] = wave;
                const amount = 300 * count;
                p.gold += amount;
                engine.state.score += amount;
                engine.state.waveStats.goldEarned += amount;
                engine.state.waveStats.bonusGold += amount;

                engine.emit(GameEventType.FLOATING_TEXT, { 
                    x: p.x, y: p.y - 80, 
                    text: `N+1赔偿到账! +${amount}G`, 
                    color: "#fbbf24", 
                    category: 'gold' 
                });
                engine.audio.playCoin();
            }
        }
    }
  },
  {
      id: 'lottery_ticket',
      title: '彩票',
      description: '最高获得 15万 金币！(极低概率)',
      rarity: 'rare',
      category: 'item',
      price: 80,
      icon: '🎟️',
      tags: ['capital'],
      statTags: ['运气', '搞钱'],
      quote: '“搏一搏，单车变摩托。虽然大概率是谢谢惠顾。”',
      effect: (state) => {
        const rand = Math.random();
        let win = 0;
        if (rand < 0.0001) win = 150000;
        else if (rand < 0.01) win = 1500;
        else if (rand < 0.05) win = 500;
        else if (rand < 0.15) win = 200;
        else if (rand < 0.40) win = 150;
        else if (rand < 0.70) win = 100;
        else win = 0;
        
        state.player.gold += win;
        state.score += win;
        state.waveStats.goldEarned += win;
        state.waveStats.bonusGold += win;

        if (win >= 150000) {
            state.modalMessage = { title: "中头奖啦!!!", text: `你获得了 ${win} 资金! 财富自由!`, type: 'win' };
        } else if (win > 0) {
            state.modalMessage = { title: "恭喜中奖!", text: `你获得了 ${win} 资金!`, type: 'win' };
        } else {
            state.modalMessage = { title: "谢谢惠顾", text: "下次一定中...", type: 'info' };
        }
      }
  },
  {
    id: 'cut_one',
    title: '砍一刀',
    description: '购买商品时，30%概率免单，30%概率价格翻倍。',
    rarity: 'rare',
    category: 'item',
    price: 150,
    icon: '🔪',
    items: ['砍一刀'],
    tags: ['market'], // Removed Capital, kept Market (Aggressive pricing)
    statTags: ['折扣', '运气'],
    quote: '“帮我砍一刀！就差0.001%了！...哎呀，砍到大动脉了。”',
    effect: (state) => { state.player.items.push('砍一刀'); }
  },
  {
    id: 'pig_scam',
    title: '杀猪盘',
    description: '立刻获得500金币。但之后的5波，每波结束时扣除200金币。',
    rarity: 'rare',
    category: 'item',
    price: 0,
    icon: '🐷',
    items: ['杀猪盘'],
    tags: ['capital'],
    statTags: ['搞钱', '负债'],
    quote: '“网恋选我我超甜，骗钱不骗感情。稳赚不赔的理财，了解一下？”',
    effect: (state) => { 
        state.player.gold += 500;
        state.score += 500;
        if (!state.player.pigDebts) state.player.pigDebts = [];
        state.player.pigDebts.push(5);
        state.player.items.push('杀猪盘');
        state.modalMessage = { title: "理财成功?", text: "到账500金币! 年化收益率200%!", type: 'win' };
    }
  },
  {
    id: 'crypto_miner',
    title: '挖矿脚本',
    description: '每秒自动获得 4 金币，但移动速度 -15%。',
    rarity: 'rare',
    category: 'item',
    price: 200,
    icon: '⛏️',
    items: ['挖矿脚本'],
    tags: ['capital'], // Removed Tech
    statTags: ['搞钱', '移速-'],
    quote: '“用公司的电，挖自己的矿。显卡满载的声音真好听。”',
    effect: (state) => { 
        state.player.speed *= 0.85; 
        state.player.items.push('挖矿脚本'); 
    },
    hooks: {
        onTick: (engine, count) => {
            const p = engine.state.player;
            p.minerTimer++;
            if (p.minerTimer >= 60) {
                p.minerTimer = 0;
                const gain = count * 4;
                p.gold += gain;
                engine.state.score += gain;
                engine.state.waveStats.goldEarned += gain;
            }
        }
    },
    getDynamicDescription: (count) => {
        if (count === 0) return '每秒自动获得 4 金币，但移动速度 -15%。';
        return `【当前收益】${count * 4} 金币/秒\n【购买后】${(count + 1) * 4} 金币/秒 (移速继续降低)`;
    }
  },
  {
    id: 'cracked_soft',
    title: '盗版软件',
    description: '商店 5 折。购买时 50% 概率扣除 5 点生命上限。',
    rarity: 'epic', 
    category: 'item',
    price: 100, 
    maxCount: 1,
    icon: '🏴‍☠️',
    items: ['盗版软件'],
    tags: ['tech'], // Removed Capital
    statTags: ['折扣'],
    quote: '“破解版真香！...等等，为什么我的电脑多了几个弹窗？”',
    effect: (state) => { 
        state.player.shopDiscount = 0.5;
        state.player.items.push('盗版软件'); 
    }
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
    items: ['优惠券'],
    tags: ['capital'],
    statTags: ['折扣'],
    quote: '“熟人介绍，内部价。”',
    effect: (state) => {
        state.player.shopDiscount *= 0.8;
        state.player.items.push('优惠券');
    }
  },
  {
    id: 'insurance',
    title: '高额意外险',
    description: '受伤获得 15 金币 (单局上限1200)。',
    rarity: 'epic',
    category: 'item',
    price: 250,
    icon: '📝',
    items: ['高额意外险'],
    tags: ['capital'],
    statTags: ['搞钱'],
    quote: '“受益人写谁好呢？不管了，先把自己弄伤再说。”',
    effect: (state) => { state.player.items.push('高额意外险'); }
  }
];
