
import { SynergyConfig } from "../types";

export const SYNERGIES: Record<string, SynergyConfig> = {
    'slacker': {
        id: 'slacker',
        name: '摸鱼部',
        description: '以静制动，把“懒”发挥到极致。',
        color: '#4ade80', // Green-400
        icon: '🍵',
        levels: [
            { count: 2, effectDesc: '带薪养生：每秒回复 1% 最大生命值' },
            { count: 4, effectDesc: '摸鱼大师：站立0.5秒后展开“勿扰领域”，减速敌人并周期性释放意念波' },
            { count: 6, effectDesc: '薪水小偷：减伤50%。站立积蓄“摸鱼能量”，移动时消耗能量爆发攻速与移速' }
        ]
    },
    'hardcore': {
        id: 'hardcore',
        name: '内卷部',
        description: '以命换命，高风险高回报的狂战士。',
        color: '#ef4444', // Red-500
        icon: '🔥',
        levels: [
            { count: 2, effectDesc: '打卡机器：攻速 +0.5 次/秒，子弹飞行速度 +1.5' },
            { count: 4, effectDesc: '狼性吸血：生命越低，伤害越高(最高+100%)，且吸血概率越高(最高+10%)' },
            { count: 6, effectDesc: '996福报：攻击积攒热量。满热量进入【过载】，攻速翻倍且必定暴击，但每秒扣除 5% 生命' }
        ]
    },
    'capital': {
        id: 'capital',
        name: '财务部',
        description: '金钱就是力量，提升经济获取效率。',
        color: '#facc15', // Yellow-400
        icon: '💰',
        levels: [
            { count: 2, effectDesc: '复利效应：波次结束获得10%利息(上限200)' },
            { count: 4, effectDesc: '消费即防御：商店每消费10金币，下波+2临时护盾' },
            { count: 6, effectDesc: '垄断巨头：每100金币+5%伤害。攻击有5%概率发射“致富金币”，致富金币造成击杀时额外获得 1 金币' }
        ]
    },
    'tech': {
        id: 'tech',
        name: '技术部',
        description: '科技改变生活，重构物理法则。',
        color: '#3b82f6', // Blue-500
        icon: '💻',
        levels: [
            { count: 2, effectDesc: '溢出攻击：击中敌人有 20% 概率触发连锁闪电' },
            { count: 4, effectDesc: '量子纠缠：连锁闪电的触发概率提升至 50%' },
            { count: 6, effectDesc: '降维打击：每 15 次攻击，下次攻击生成“蓝屏死机”区域，秒杀普通敌人' }
        ]
    },
    'hr': {
        id: 'hr',
        name: '人事部',
        description: '人多力量大，哪怕是临时工也能发光发热。',
        color: '#22d3ee', // Cyan-400
        icon: '📇',
        levels: [
            { count: 2, effectDesc: '试用期管理：召唤物生命值+30%，合同期(存活时间)+50%' },
            { count: 4, effectDesc: '极速招聘：召唤冷却-30%。每存在一个召唤物，玩家攻速+0.1 次/秒' },
            { count: 6, effectDesc: '猎头专家：召唤传说级【吃豆人】。无敌单位，横平竖直地追击敌人，对路径上的敌人造成巨额伤害' }
        ]
    },
    'market': {
        id: 'market',
        name: '市场部',
        description: '病毒式传播与舆论轰炸，让敌人陷入焦虑。',
        color: '#a855f7', // Purple-500
        icon: '📢',
        levels: [
            { count: 2, effectDesc: '流量光环：爆炸范围+25%。攻击造成“牵引”效果（吸怪），聚怪更高效' },
            { count: 4, effectDesc: '制造焦虑：攻击有30%概率施加【焦虑】状态（15%易伤，持续2.5秒）' },
            { count: 6, effectDesc: '情绪爆破：“焦虑”敌人死亡时引发尸爆，并有50%概率传染【焦虑】给周围敌人' }
        ]
    },
    'board': {
        id: 'board',
        name: '董事会',
        description: '规则的制定者，掌控生杀予夺的最高特权。',
        color: '#D4AF37', // Metallic Gold
        icon: '♟️',
        levels: [
            { count: 2, effectDesc: '特权通道：商店刷新5折，且每波第一次刷新免费' },
            { count: 4, effectDesc: '一票否决：斩杀生命值低于20%的非BOSS敌人' },
            { count: 6, effectDesc: '制裁霓虹：周期性爆发“制裁导弹”雨，自动追踪并轰炸全图敌人，视觉效果极其炫酷' }
        ]
    }
};
