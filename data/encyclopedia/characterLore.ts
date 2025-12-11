
import { EnemyLoreConfig } from "./enemyLore";

// 复用 EnemyLoreConfig 的结构，因为本质都是技能列表
export const CHARACTER_LORE: Record<string, EnemyLoreConfig> = {
    '9527': {
        id: '9527',
        skills: [
            { name: "职场黑话", type: 'active', description: "普攻按顺序发射“收到/好的/在做了”等文字，造成标准伤害。", icon: "💬" },
            { name: "带薪拉屎", type: 'passive', description: "资深老油条。每波结束后，额外获得 100 金币作为“加班费”。", icon: "💰" }
        ]
    },
    '007': {
        id: '007',
        skills: [
            { name: "整顿职场", type: 'active', description: "普攻替换为高爆手雷(AOE)，伤害极高，但无法穿透。", icon: "💣" },
            { name: "愣头青", type: 'passive', description: "不懂职场潜规则。无法使用任何穿透类道具，且金币收益只有正常的 85%。", icon: "📉" }
        ]
    },
    '1024': {
        id: '1024',
        skills: [
            { name: "特性(Bug)", type: 'active', description: "发射随机代码。子弹大小随机，且有 15% 概率让敌人“死机”（眩晕）。", icon: "🐛" },
            { name: "逻辑穿透", type: 'passive', description: "思维缜密。初始拥有 +2 子弹穿透能力。", icon: "🧠" }
        ]
    },
    'ev_creator': {
        id: 'ev_creator',
        skills: [
            { name: "开发者权限", type: 'active', description: "攻击时随机触发：爆炸(20%)、修复回血(10%) 或 获得经费(10%)。", icon: "⚡" },
            { name: "后门程序", type: 'passive', description: "拥有最高的金币收益系数 (110%)。", icon: "💳" }
        ]
    },
    'cleaner': {
        id: 'cleaner',
        devNote: "⚠️ [已废弃 / SCRAPPED] \n严重平衡性问题：\n1. [物理清理] 判定的 CPU 消耗过高导致低端机卡顿。\n2. [垃圾回收] 能消除 Boss 弹幕，导致难度系数归零。\n此角色已被移除出正式版本，保留此档案仅作纪念。",
        skills: [
            { name: "物理清理", type: 'active', description: "不发射子弹。使用拖把对周围敌人进行近战横扫攻击。", icon: "🧹" },
            { name: "垃圾回收", type: 'mechanism', description: "拖把可以消除敌人的弹幕。", icon: "🛡️" }
        ]
    }
};
