
import { UpgradeOption } from "../../types";
import { spawnFloatingText } from "../../services/logic/utils";

export const MARKET_ITEMS: UpgradeOption[] = [
  {
    id: 'shocking_title',
    title: '震惊体标题',
    description: '击杀敌人向四周发射弹幕（10%攻击力）。',
    rarity: 'excellent', 
    category: 'item',
    price: 150, 
    maxCount: 1, 
    icon: '😱',
    items: ['震惊体标题'],
    tags: ['market'],
    statTags: ['机制', 'AOE'],
    quote: '“震惊！男人看了沉默，女人看了流泪！不转不是中国人！”',
    effect: (state) => {
        state.player.items.push('震惊体标题');
    }
  },
  {
    id: 'viral_marketing',
    title: '病毒式营销',
    description: '场上每多一个敌人，攻击速度 +1%（上限 +25%）。',
    rarity: 'excellent',
    category: 'item',
    price: 170,
    icon: '🕸️',
    items: ['病毒式营销'],
    tags: ['market'],
    statTags: ['攻速+'],
    quote: '“一传十，十传百。人越多，我越兴奋。”',
    effect: (state) => { state.player.items.push('病毒式营销'); }
  },
  {
    id: 'popup_ad',
    title: '弹窗广告',
    description: '自动发射追踪导弹拦截敌人。持有数量越多，发射频率越快。',
    rarity: 'excellent',
    category: 'item',
    price: 180,
    icon: '🪟',
    items: ['弹窗广告'],
    tags: ['market'], // Removed Tech
    statTags: ['导弹'],
    quote: '“屠龙宝刀，点击就送！这广告怎么关不掉啊？！”',
    effect: (state) => {
        state.player.items.push('弹窗广告');
        if (!state.player.customTimers) state.player.customTimers = {};
        state.player.customTimers['popup_ad'] = 0;
    },
    onTick: (engine, count) => {
        const p = engine.state.player;
        if (p.customTimers['popup_ad'] === undefined) p.customTimers['popup_ad'] = 0;
        p.customTimers['popup_ad']--;
        
        const cooldown = Math.max(60, Math.floor(300 / count));
        
        if (p.customTimers['popup_ad'] <= 0) {
            p.customTimers['popup_ad'] = cooldown;
            
            engine.state.projectiles.push({
                id: Math.random().toString(),
                x: p.x, y: p.y,
                radius: 12, // Reduced size for spike style (was 20)
                emoji: '', // CLEARED EMOJI
                vx: 0, vy: -5, 
                damage: engine.state.player.attackDamage * 1.5,
                life: 180,
                isEnemy: false,
                color: '#f59e0b', // Warning Orange
                text: '',
                pierce: 0,
                hitIds: [],
                active: true,
                behaviors: ['homing', 'move_linear', 'decay_life', 'check_bounds', 'explode_on_expire', 'update_explosion', 'emit_trail'],
                isExplosive: true,
                explodeOnExpire: true,
                maxExplosionRadius: 80,
                renderStyle: 'data_spike', // Reused Data Spike Style
                trailConfig: { type: 'pixel', color: '#f59e0b', interval: 4, timer: 0 }
            });
            
            if (Math.random() < 0.3) {
                spawnFloatingText(engine, p.x, p.y - 40, "屠龙宝刀!", "#facc15", 'chat');
            }
        }
    },
    getDynamicDescription: (count) => {
        if (count === 0) return '自动发射追踪导弹拦截敌人。持有数量越多，发射频率越快。';
        const curr = (5 / count).toFixed(1);
        const next = (5 / (count + 1)).toFixed(1);
        return `【当前频次】每 ${curr} 秒发射 1 枚\n【购买后】每 ${next} 秒发射 1 枚`;
    }
  },
  {
    id: 'live_stream',
    title: '带货直播间',
    description: '每 10 秒生成“直播圈”减速并伤害敌人。',
    rarity: 'epic',
    category: 'item',
    price: 350,
    icon: '📹',
    items: ['带货直播间'],
    tags: ['market'],
    statTags: ['AOE', '减速'],
    quote: '“家人们！把价格打下来！321上链接！”',
    effect: (state) => {
        state.player.items.push('带货直播间');
        if (!state.player.customTimers) state.player.customTimers = {};
        state.player.customTimers['live_stream'] = 0;
    },
    onTick: (engine, count) => {
        const p = engine.state.player;
        if (p.customTimers['live_stream'] === undefined) p.customTimers['live_stream'] = 0;
        p.customTimers['live_stream']--;
        
        const cooldown = 600; 
        
        if (p.customTimers['live_stream'] <= 0) {
            p.customTimers['live_stream'] = cooldown;
            
            for(let i=0; i<count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = 100 + Math.random() * 200;
                const zx = p.x + Math.cos(angle) * dist;
                const zy = p.y + Math.sin(angle) * dist;
                
                engine.state.zones.push({
                    id: Math.random().toString(),
                    x: zx, y: zy,
                    radius: 150,
                    type: 'live_stream', 
                    life: 300, 
                    maxLife: 300,
                    color: '#a855f7', 
                    emoji: ''
                });
                
                spawnFloatingText(engine, zx, zy, "上链接!", "#a855f7", 'chat');
            }
        }
    },
    getDynamicDescription: (count) => {
        if (count === 0) return '每 10 秒生成一个“直播圈”。圈内敌人减速 50% 并持续扣血。';
        return `【当前规模】每 10 秒生成 ${count} 个圈\n【扩张后】每 10 秒生成 ${count + 1} 个圈`;
    }
  },
  {
    id: 'brainwashing_loop',
    title: '洗脑循环',
    description: '“焦虑”状态的伤害频率翻倍(0.5秒一跳)，且敌人死后的传染爆炸范围翻倍。',
    rarity: 'epic', 
    category: 'item',
    price: 700,
    icon: '🌀', 
    items: ['洗脑循环'],
    tags: ['market'], 
    statTags: ['机制'],
    quote: '“今年过节不收礼... 羊羊羊... 恒源祥...（刻进DNA的声音）”',
    effect: (state) => {
        state.player.items.push('洗脑循环');
    }
  }
];
