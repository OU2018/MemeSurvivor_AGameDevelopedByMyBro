
import { UpgradeOption } from "../../types";
import { SummonFactory } from "../../services/logic/battle/systems/SummonFactory";
import { SUMMON_STATS } from "../summons/summonStats";
import { spawnFloatingText } from "../../services/logic/utils";
import { GameEventType } from "../../services/logic/events/events";

const SUMMON_PREREQUISITES = ['水军', '实习生', '客服机器人', '外包团队', '影子分身', '临时工合同'];

export const SUMMON_ITEMS: UpgradeOption[] = [
  // --- 召唤类 (基础) ---
  {
    id: 'temp_contract',
    title: '临时工合同',
    description: '每 10 秒召唤一个“临时工”。拥有越多，召唤越快 (间隔 = 10秒 / 数量)。',
    rarity: 'common',
    category: 'item',
    price: 80,
    icon: '📝',
    items: ['临时工合同'],
    tags: ['hr'],
    statTags: ['召唤'],
    quote: '“出了事就是临时工干的。用完即弃，成本低廉。”',
    effect: (state) => {
        state.player.items.push('临时工合同');
        if (!state.player.customTimers) state.player.customTimers = {};
        state.player.customTimers['temp_worker'] = 0;
    },
    hooks: {
        onTick: (engine, count) => {
            const p = engine.state.player;
            if (p.customTimers['temp_worker'] === undefined) p.customTimers['temp_worker'] = 0;

            p.customTimers['temp_worker']--;
            if (p.customTimers['temp_worker'] <= 0) {
                const cdMult = p.summonCooldownSpeed || 1.0;
                const baseCD = SUMMON_STATS.temp_worker.baseCooldown * cdMult;
                const delay = Math.max(30, Math.floor(baseCD / count));
                p.customTimers['temp_worker'] = delay;
                
                const angle = Math.random() * Math.PI * 2;
                SummonFactory.createSummon(
                    engine, 
                    'temp_worker', 
                    p.x + Math.cos(angle) * 30, 
                    p.y + Math.sin(angle) * 30
                );
            }
        }
    },
    getDynamicDescription: (count) => {
        if (count === 0) return '每 10 秒召唤一个“临时工”。撞击敌人后消失。';
        const curr = (10 / count).toFixed(1);
        const next = (10 / (count + 1)).toFixed(1);
        return `【当前效率】每 ${curr} 秒召唤 1 个\n【购买后】每 ${next} 秒召唤 1 个`;
    }
  },
  {
    id: 'paid_trolls',
    title: '水军',
    description: '召唤自爆机器人。拥有越多，召唤越快 (间隔 = 10秒 / 数量)。',
    rarity: 'epic',
    category: 'item',
    price: 400,
    icon: '🤖',
    items: ['水军'],
    tags: ['hr'], // Removed Market
    statTags: ['召唤', '爆炸'],
    quote: '“五毛一条，括号内删掉。”',
    effect: (state) => { 
        state.player.items.push('水军'); 
        if (!state.player.customTimers) state.player.customTimers = {};
        state.player.customTimers['troll'] = 0; 
    },
    hooks: {
        onTick: (engine, count) => {
            const p = engine.state.player;
            if (p.customTimers['troll'] === undefined) p.customTimers['troll'] = 0;

            p.customTimers['troll']--;
            if (p.customTimers['troll'] <= 0) {
                const cdMult = p.summonCooldownSpeed || 1.0;
                const baseCD = SUMMON_STATS.troll.baseCooldown * cdMult;
                const delay = Math.max(30, Math.floor(baseCD / count)); 
                p.customTimers['troll'] = delay; 
                
                const angle = Math.random() * Math.PI * 2;
                SummonFactory.createSummon(
                    engine, 
                    'troll', 
                    p.x + Math.cos(angle) * 30, 
                    p.y + Math.sin(angle) * 30
                );

                if (Math.random() < 0.3 || count === 1) {
                    spawnFloatingText(engine, p.x, p.y - 50, "水军出击!", "#60a5fa", 'chat');
                }
            }
        }
    },
    getDynamicDescription: (count) => {
        if (count === 0) return '召唤自爆机器人。';
        const curr = (10 / count).toFixed(1);
        const next = (10 / (count + 1)).toFixed(1);
        return `【当前效率】每 ${curr} 秒召唤 1 个\n【购买后】每 ${next} 秒召唤 1 个`;
    }
  },
  {
    id: 'the_intern',
    title: '实习生',
    description: '每隔 5 秒召唤一个脆弱的实习生。拥有越多，召唤越快 (间隔 = 5秒 / 数量)。',
    rarity: 'excellent', 
    category: 'item',
    price: 250, 
    icon: '🎓',
    items: ['实习生'],
    tags: ['hr'],
    statTags: ['召唤'],
    quote: '“大学生好骗，给个实习证明就能当牛做马。”',
    effect: (state) => {
        state.player.items.push('实习生');
        if (!state.player.customTimers) state.player.customTimers = {};
        state.player.customTimers['intern'] = 0;
    },
    hooks: {
        onTick: (engine, count) => {
            const p = engine.state.player;
            if (p.customTimers['intern'] === undefined) p.customTimers['intern'] = 0;

            p.customTimers['intern']--;
            if (p.customTimers['intern'] <= 0) {
                const cdMult = p.summonCooldownSpeed || 1.0;
                const baseCD = SUMMON_STATS.intern.baseCooldown * cdMult;
                const delay = Math.max(30, Math.floor(baseCD / count));
                p.customTimers['intern'] = delay;
                
                const angle = Math.random() * Math.PI * 2;
                SummonFactory.createSummon(
                    engine, 
                    'intern', 
                    p.x + Math.cos(angle) * 40, 
                    p.y + Math.sin(angle) * 40
                );

                if (Math.random() < 0.3 || count === 1) {
                    spawnFloatingText(engine, p.x, p.y - 50, "招人!", "#3b82f6", 'chat');
                }
            }
        }
    },
    getDynamicDescription: (count) => {
        if (count === 0) return '每隔 5 秒召唤一个实习生帮你挡枪和输出。';
        const curr = (5 / count).toFixed(1);
        const next = (5 / (count + 1)).toFixed(1);
        return `【当前效率】每 ${curr} 秒召唤 1 个\n【购买后】每 ${next} 秒召唤 1 个`;
    }
  },
  {
    id: 'chatbot',
    title: '客服机器人',
    description: '每波开始时在随机位置生成一个无敌的固定炮台。购买多个可增加生成数量。',
    rarity: 'epic',
    category: 'item',
    price: 380,
    icon: '📠',
    items: ['客服机器人'],
    tags: ['hr'], 
    statTags: ['召唤', '炮台'],
    quote: '“亲，您的问题我们已经收到了，请耐心等待...（永无止境的等待）”',
    effect: (state) => {
        state.player.items.push('客服机器人');
        const buffer = 300;
        const spawnX = (Math.random() - 0.5) * (state.mapWidth - buffer);
        const spawnY = (Math.random() - 0.5) * (state.mapHeight - buffer);
        const engineProxy = { state: state };
        SummonFactory.createSummon(engineProxy, 'chatbot', spawnX, spawnY);
    },
    getDynamicDescription: (count) => {
        if (count === 0) return '每波生成一个无敌炮台。';
        return `【当前编制】每波生成 ${count} 台\n【购买后】每波生成 ${count + 1} 台`;
    }
  },
  {
    id: 'outsourcing_team',
    title: '外包团队',
    description: '每 8 秒刷新一批围绕自身的攻击型无人机 (数量 = 3 * 购买数)。',
    rarity: 'rare',
    category: 'item',
    price: 300,
    icon: '🛸',
    items: ['外包团队'],
    tags: ['tech'], // Removed HR (kept Tech)
    statTags: ['召唤', '环绕'],
    quote: '“驻场开发，没有归属感，只有KPI。”',
    effect: (state) => {
        state.player.items.push('外包团队');
        state.player.droneTimer = 0;
    },
    hooks: {
        onTick: (engine, count) => {
            const p = engine.state.player;
            if (p.droneTimer === undefined) p.droneTimer = 0;
            p.droneTimer--;
            if (p.droneTimer <= 0) {
                p.droneTimer = SUMMON_STATS.drone.baseCooldown * p.summonCooldownSpeed;
                const hasDistributed = p.items.includes('分布式算力');
                const dronesPerStack = hasDistributed ? 6 : 3;
                const totalDrones = dronesPerStack * count;
                
                engine.emit(GameEventType.FLOATING_TEXT, { x: p.x, y: p.y - 60, text: `外包x${totalDrones}`, color: "#cbd5e1", category: 'chat' });
                for(let i=0; i<totalDrones; i++) {
                    SummonFactory.createSummon(engine, 'drone', p.x, p.y);
                }
            }
        }
    },
    getDynamicDescription: (count) => {
        if (count === 0) return '每 8 秒获得 3 个围绕自身的攻击型无人机。';
        return `【当前编制】${3 * count} 架无人机 (基础)\n【扩编后】${3 * (count + 1)} 架无人机 (基础)`;
    }
  },
  {
    id: 'shadow_clone',
    title: '影子分身',
    description: '开局生成一个分身炮台。',
    rarity: 'epic',
    category: 'item',
    price: 500,
    icon: '👤',
    items: ['影子分身'],
    tags: ['hr'], // Removed Tech
    statTags: ['召唤', '复制'],
    quote: '“恨不得把自己劈成两半用。现在，梦想成真了。”',
    effect: (state) => {
        state.player.items.push('影子分身');
        const buffer = 300;
        const spawnX = (Math.random() - 0.5) * (state.mapWidth - buffer);
        const spawnY = (Math.random() - 0.5) * (state.mapHeight - buffer);
        const engineProxy = { state: state };
        const count = state.player.items.includes('镜像服务器') ? 2 : 1;
        for(let i=0; i<count; i++) {
             SummonFactory.createSummon(engineProxy, 'clone', spawnX + i*20, spawnY + i*20);
        }
    }
  },
  {
    id: 'headhunter',
    title: '猎头顾问',
    description: '雇佣一名顾问在场上游走策反敌人。',
    rarity: 'epic', // Downgraded to Epic
    category: 'item',
    price: 500, // Reduced from 800 (if it was higher before)
    icon: '🤵',
    items: ['猎头顾问'],
    tags: ['hr'], // Removed Board
    statTags: ['召唤', '策反'],
    quote: '“我看你骨骼惊奇，不如来我们要上市的公司？”',
    effect: (state) => {
        state.player.items.push('猎头顾问');
        const engineProxy = { state: state };
        SummonFactory.createSummon(engineProxy, 'headhunter', state.player.x, state.player.y);
    }
  },
  {
    id: 'legacy_summon',
    title: '祖传代码',
    description: '定期排泄代码山阻挡敌人（留毒路径）。',
    rarity: 'rare',
    category: 'item',
    price: 350,
    icon: '🦠',
    items: ['祖传代码'],
    tags: ['tech'], 
    statTags: ['召唤', '阻挡'],
    quote: '“它跑得起来，虽然很难看。别碰，碰了就崩。”',
    effect: (state) => {
        state.player.items.push('祖传代码');
        state.player.codeMountainTimer = 0;
    },
    hooks: {
        onTick: (engine, count) => {
            const p = engine.state.player;
            if (p.codeMountainTimer === undefined) p.codeMountainTimer = 0;
            p.codeMountainTimer--;
            
            const reduction = Math.pow(0.9, count - 1);
            
            if (p.codeMountainTimer <= 0) {
                p.codeMountainTimer = Math.floor(SUMMON_STATS.code_mountain.baseCooldown * p.summonCooldownSpeed * reduction);
                engine.emit(GameEventType.FLOATING_TEXT, { x: p.x, y: p.y - 60, text: "拉了...", color: "#84cc16", category: 'chat' });
                SummonFactory.createSummon(engine, 'code_mountain', p.x, p.y);
            }
        }
    },
    getDynamicDescription: (count) => {
        if (count === 0) return '每 15 秒排泄代码山阻挡敌人。';
        const curr = (15 * Math.pow(0.9, count - 1)).toFixed(1);
        const next = (15 * Math.pow(0.9, count)).toFixed(1);
        return `【当前周期】每 ${curr} 秒排泄一次\n【优化后】每 ${next} 秒排泄一次`;
    }
  },

  // --- 增强类 (需要前置) ---
  {
    id: 'job_poster',
    title: '招聘海报',
    description: '召唤物生命上限 +20%，存在时间 +20%。',
    rarity: 'common',
    category: 'item',
    price: 50,
    icon: '📰',
    items: ['招聘海报'],
    tags: ['hr'],
    statTags: ['召唤强化'],
    quote: '“扁平化管理，弹性工作制，带薪休假...（仅供参考）”',
    effect: (state) => { state.player.items.push('招聘海报'); }
  },
  {
    id: 'punch_card',
    title: '打卡机',
    description: '召唤物攻击速度 +10%，移动速度 +10%。',
    rarity: 'excellent',
    category: 'item',
    price: 150,
    icon: '⏰',
    items: ['打卡机'],
    tags: ['hr'],
    statTags: ['召唤强化'],
    quote: '“迟到一分钟，扣全勤奖。这就是效率。”',
    effect: (state) => { state.player.items.push('打卡机'); }
  },
  {
    id: 'megaphone',
    title: '扩音喇叭',
    description: '所有召唤物攻击速度 +20%。',
    rarity: 'common',
    category: 'item',
    price: 150,
    icon: '📣',
    items: ['扩音喇叭'],
    tags: ['market'],
    statTags: ['召唤强化'],
    quote: '“全体目光向我看齐！我宣布个事！”',
    effect: (state) => { state.player.items.push('扩音喇叭'); }
  },
  {
    id: 'performance_review',
    title: '绩效考核表',
    description: '召唤物攻击时有 10% 概率使敌人减速 1 秒。',
    rarity: 'excellent',
    category: 'item',
    price: 180,
    icon: '📑',
    items: ['绩效考核表'],
    tags: ['hr'],
    statTags: ['召唤强化'],
    quote: '“你的表现不达标，需要优化。”',
    effect: (state) => { state.player.items.push('绩效考核表'); }
  },
  {
    id: 'team_pizza',
    title: '团建披萨',
    description: '召唤物生命上限 +50%，且每秒回复 5% 生命。',
    rarity: 'rare',
    category: 'item',
    price: 250,
    icon: '🍕',
    items: ['团建披萨'],
    tags: ['hr'], // Removed Slacker
    statTags: ['召唤强化', '回血'],
    quote: '“这就是公司所谓的福利：两片冷的披萨，和无限的感激。”',
    effect: (state) => { state.player.items.push('团建披萨'); }
  },
  {
    id: 'wolf_protocol',
    title: '狼性协议',
    description: '召唤物造成伤害时，15% 概率暴击 (双倍伤害)。',
    rarity: 'rare',
    category: 'item',
    price: 300,
    icon: '🐺',
    items: ['狼性协议'],
    tags: ['hr'],
    statTags: ['召唤强化', '暴击'],
    quote: '“不要问公司能为你做什么，问你能为公司做什么。”',
    effect: (state) => { state.player.items.push('狼性协议'); }
  },
  {
    id: 'explosive_contract',
    title: '爆炸合同',
    description: '召唤物死亡/消失时爆炸造成 200% 伤害。',
    rarity: 'epic',
    category: 'item',
    price: 400,
    maxCount: 1,
    icon: '📜',
    items: ['爆炸合同'],
    tags: ['market'], // Removed HR
    statTags: ['召唤强化', '爆炸'],
    quote: '“离职竞业协议：如果你走，就炸了你。”',
    effect: (state) => { state.player.items.push('爆炸合同'); }
  },
  {
    id: 'stock_options',
    title: '股权激励',
    description: '持有的金币越多，召唤物伤害越高。(每 100 金币 +5%)',
    rarity: 'epic',
    category: 'item',
    price: 450,
    icon: '📈',
    items: ['股权激励'],
    tags: ['capital'], // Removed HR
    statTags: ['召唤强化', '成长'],
    quote: '“好好干，等到上市那天（遥遥无期），这些废纸就值钱了。”',
    effect: (state) => { state.player.items.push('股权激励'); }
  },
  {
    id: 'remote_work',
    title: '远程办公',
    description: '所有召唤物的 索敌/攻击 距离 +50%。',
    rarity: 'rare',
    category: 'item',
    price: 350,
    icon: '💻',
    items: ['远程办公'],
    tags: ['hr'], // Changed from Slacker to HR
    statTags: ['召唤强化'],
    quote: '“在家办公效率更高？不，是摸鱼空间更大。”',
    effect: (state) => { state.player.items.push('远程办公'); }
  },
  {
    id: 'macro',
    title: '键盘宏',
    description: '水军爆炸范围+50%，且死亡后分裂出 2 个微型水军。(限购1)',
    rarity: 'epic',
    category: 'item',
    price: 450,
    maxCount: 1,
    icon: '🖱️',
    items: ['键盘宏'],
    tags: ['hr'], // Removed Tech
    statTags: ['召唤强化'],
    quote: '“一键三连，自动控评。让水军像病毒一样分裂。”',
    effect: (state) => { state.player.items.push('键盘宏'); }
  },
  {
    id: 'full_time_offer',
    title: '转正名额',
    description: '实习生生命 +50 且存在时间无限。',
    rarity: 'rare',
    category: 'item',
    price: 400,
    icon: '📄',
    items: ['转正名额'],
    tags: ['hr'],
    statTags: ['召唤强化'],
    quote: '“恭喜你，正式成为我们的一员。（现在你是全职牛马了）”',
    effect: (state) => { state.player.items.push('转正名额'); }
  },
  {
    id: 'power_24h',
    title: '24小时电源',
    description: '客服机器人射速/伤害+50%。射击 33% 概率消耗 1 金币。',
    rarity: 'rare',
    category: 'item',
    price: 350,
    icon: '🔌',
    items: ['24小时电源'],
    tags: ['capital'], // Removed Tech
    statTags: ['召唤强化'],
    quote: '“不断电，不休息，只要给钱就能转。”',
    effect: (state) => { state.player.items.push('24小时电源'); }
  },
  {
    id: 'distributed_computing',
    title: '分布式算力',
    description: '外包团队无人机数量翻倍。',
    rarity: 'rare',
    category: 'item',
    price: 350,
    icon: '☁️',
    items: ['分布式算力'],
    tags: ['tech'],
    statTags: ['召唤强化'],
    quote: '“把活儿分下去，哪怕是廉价算力，堆起来也很可观。”',
    effect: (state) => { state.player.items.push('分布式算力'); }
  },
  {
    id: 'mirror_server',
    title: '镜像服务器',
    description: '影子分身数量翻倍，继承穿透属性。',
    rarity: 'mythic',
    category: 'item',
    price: 800,
    maxCount: 1,
    icon: '🪞',
    items: ['镜像服务器'],
    tags: ['board'], // Pure Board
    statTags: ['召唤强化'],
    quote: '“双倍的服务器，双倍的快乐，双倍的维护费用。”',
    effect: (state) => { 
        state.player.items.push('镜像服务器');
        const currentClones = state.projectiles.filter(p => p.summonType === 'clone').length;
        if (currentClones > 0) {
             const engineProxy = { state: state };
             const buffer = 300;
             for (let i=0; i<currentClones; i++) {
                 const spawnX = (Math.random() - 0.5) * (state.mapWidth - buffer);
                 const spawnY = (Math.random() - 0.5) * (state.mapHeight - buffer);
                 SummonFactory.createSummon(engineProxy, 'clone', spawnX, spawnY);
             }
        }
    }
  }
];
