
import { HazardConfig } from "../types";

export const HAZARDS: HazardConfig[] = [
    {
        id: 'career_fatigue',
        name: '职业倦怠',
        description: '长期加班导致身体机能下降，所有生命回复效果（包括吸血、自然回血）降低 50%。',
        icon: '😫',
        color: '#ef4444', // Red
        quote: '“我累了，毁灭吧，赶紧的。”'
    },
    {
        id: 'inflation_shock',
        name: '通货膨胀',
        description: '市场经济不稳定，商店所有商品价格永久上涨 50%。',
        icon: '📈',
        color: '#facc15', // Yellow
        quote: '“工资没涨，快餐从12块涨到了35块。”'
    },
    {
        id: 'salary_cut',
        name: '全员降薪',
        description: '公司效益不佳，所有来源的金币获取量减少 30%。',
        icon: '💸',
        color: '#f97316', // Orange
        quote: '“公司是大家庭，现在家里困难，请大家共体时艰（高管除外）。”'
    },
    {
        id: 'imposter_syndrome',
        name: '冒充者综合症',
        description: '自我怀疑让你更加脆弱，受到的所有伤害增加 30%。',
        icon: '🎭',
        color: '#a855f7', // Purple
        quote: '“我不配，我不仅菜，还是混进来的。”'
    },
    {
        id: 'toxic_workplace',
        name: '有毒环境',
        description: '职场氛围极度压抑，移动速度降低 15%，且周围每多一个敌人，伤害降低 1%。',
        icon: '☣️',
        color: '#22c55e', // Green
        quote: '“这里空气中弥漫着令人窒息的PUA味道。”'
    },
    {
        id: 'carpal_tunnel',
        name: '腱鞘炎',
        description: '手指僵硬，无法高强度输出。攻击有 15% 概率“卡壳”（射击失败）。',
        icon: '🖐️',
        color: '#fb923c', // Orange-Red
        quote: '“手...我的手...Ctrl+C都按不动了。”'
    },
    {
        id: 'digital_eye_strain',
        name: '老花眼',
        description: '长期盯着屏幕导致视力下降。视野边缘变暗（晕影），难以看清远处的危险。',
        icon: '👓',
        color: '#64748b', // Slate
        quote: '“这是30岁的人该有的视力吗？这屏幕怎么有重影？”'
    },
    {
        id: 'endless_meetings',
        name: '无效会议',
        description: '时间被会议占用了。技能和召唤物的冷却时间增加 30%。',
        icon: '📅',
        color: '#3b82f6', // Blue
        quote: '“这个会的主要内容是确定下次开会的时间。”'
    }
];
