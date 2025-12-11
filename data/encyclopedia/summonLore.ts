
import { EnemyLoreConfig } from "./enemyLore";

export const SUMMON_LORE: Record<string, EnemyLoreConfig> = {
    'temp_worker': {
        id: 'temp_worker',
        skills: [
            { name: "日结大神", type: 'active', description: "发现敌人后发起直线冲撞。", icon: "🏃" },
            { name: "离职", type: 'passive', description: "造成一次伤害后立即消失（死亡）。", icon: "🚪" }
        ]
    },
    'intern': {
        id: 'intern',
        skills: [
            { name: "背锅位", type: 'passive', description: "跟随在玩家身边，优先承受敌人的弹幕。", icon: "🛡️" },
            { name: "不懂就问", type: 'active', description: "投掷“问号”攻击敌人，射程较短。", icon: "❓" }
        ]
    },
    'troll': {
        id: 'troll',
        skills: [
            { name: "键盘巡逻", type: 'passive', description: "在玩家周围随机巡逻。", icon: "👀" },
            { name: "自爆攻击", type: 'ultimate', description: "发现敌人后加速冲锋，接触时引发范围爆炸。", icon: "💥" }
        ]
    },
    'troll_mini': {
        id: 'troll_mini',
        skills: [
            { name: "分裂体", type: 'passive', description: "从大型水军的残骸中诞生，体型更小。", icon: "🦠" },
            { name: "无脑冲", type: 'active', description: "继承本体的自爆逻辑，但伤害减半。", icon: "🧨" }
        ]
    },
    'drone': {
        id: 'drone',
        skills: [
            { name: "死循环", type: 'passive', description: "不知疲倦地围绕玩家旋转。", icon: "🔄" },
            { name: "接触切割", type: 'active', description: "对触碰到的敌人造成物理伤害。", icon: "⚔️" }
        ]
    },
    'code_mountain': {
        id: 'code_mountain',
        skills: [
            { name: "技术债", type: 'passive', description: "移动极慢，但拥有极高的生命值，是天然的路障。", icon: "⛰️" },
            { name: "逻辑死锁", type: 'active', description: "周围形成减速力场。触碰它的敌人会被眩晕。", icon: "🐌" },
            { name: "重构爆炸", type: 'mechanism', description: "死亡时引发大范围毁灭性爆炸。", icon: "💣" }
        ]
    },
    'chatbot': {
        id: 'chatbot',
        skills: [
            { name: "固定工位", type: 'passive', description: "无法移动，且免疫所有伤害（无敌）。", icon: "🔒" },
            { name: "自动回复", type: 'active', description: "极高频率发射“您好”弹幕。", icon: "💬" }
        ]
    },
    'clone': {
        id: 'clone',
        skills: [
            { name: "镜像数据", type: 'passive', description: "继承玩家的穿透、弹道数量等攻击特效。", icon: "👥" },
            { name: "替身", type: 'active', description: "无法移动，原地自动索敌攻击。", icon: "🔫" }
        ]
    },
    'headhunter': {
        id: 'headhunter',
        skills: [
            { name: "精英巡航", type: 'passive', description: "全图游走，寻找潜在候选人。", icon: "🕴️" },
            { name: "挖墙脚", type: 'ultimate', description: "每隔一段时间，直接将一名普通敌人策反为我方单位（实习生或水军）。", icon: "🤝" }
        ]
    },
    'hr_pacman': {
        id: 'hr_pacman',
        skills: [
            { name: "无视规则", type: 'passive', description: "无敌单位。无视屏幕边界（穿墙）。", icon: "👻" },
            { name: "裁员", type: 'active', description: "只能进行横向或纵向移动。对路径上的一切敌人造成巨额伤害。", icon: "🍽️" },
            { name: "绩效考核", type: 'ultimate', description: "充能满后进入狂暴状态，体型变大，秒杀敌人。", icon: "🔥" }
        ]
    }
};
