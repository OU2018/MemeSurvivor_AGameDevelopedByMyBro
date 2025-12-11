
import { gameEngine } from "./gameEngine";
import { ACHIEVEMENTS } from "../data/achievements";
import { ENEMIES } from "../data/enemies";
import { SHOP_ITEMS } from "../data/items";
import { CHARACTERS } from "../data/events";
import { SUMMON_STATS } from "../data/summons/summonStats";

// Session-level tracking for praise
let praiseCount = 0;

/**
 * 触发“作者的凝视”弹窗
 */
const triggerSystemWarning = () => {
    gameEngine.state.modalMessage = {
        title: "SYSTEM WARNING",
        text: "我的秘籍居然让你发现了！",
        type: 'win' // 金色传说样式，带有惊叹感
    };
};

/**
 * 秘籍处理器
 * 返回 string 表示成功并返回提示消息
 * 返回 null 表示不是秘籍
 */
export const tryApplyCheat = (code: string): string | null => {
    const normalizedCode = code.trim().toUpperCase();

    // 兼容中文输入 (移除空格)
    const cnCode = code.trim().replace(/\s/g, '');

    // 1. 重磅秘籍：全部解锁 (带弹窗)
    if (normalizedCode === "GYW223" || cnCode === "全部解锁") {
        triggerSystemWarning();
        return unlockAllContent();
    }
    
    // 2. 彩蛋：夸奖作者 (特殊逻辑)
    if (cnCode === "作者好帅") {
        praiseCount++;
        
        if (praiseCount === 1) {
            // 第一次：给予奖励和华丽反馈
            gameEngine.unlockAchievement('luck_dog');
            gameEngine.state.modalMessage = {
                title: "高情商认证！",
                text: "既然你这么诚实，这个成就就送你了！",
                type: 'win'
            };
            // 播放音效
            gameEngine.audio.playAchievementSound();
            return "❤️ 谢谢你的夸奖！成就 [欧皇转世] 已解锁！";
        } else {
            // 后续：傲娇/害羞反馈
            gameEngine.state.modalMessage = {
                title: "低调低调",
                text: "好啦好啦，我知道我很帅，不用一直强调啦~ (⁄ ⁄•⁄ω⁄•⁄ ⁄)",
                type: 'info'
            };
            gameEngine.audio.play('ui_typewriter');
            return "知道啦知道啦~";
        }
    }
    
    // 3. 调试秘籍：直接进关卡 (带弹窗)
    if (normalizedCode === "GYWJY1" || cnCode === "测试精英1") {
        triggerSystemWarning();
        return setupDebugRun(4, 'ev_creator', 999, 100, "微操大师(精英)");
    }
    
    if (normalizedCode === "GYWJY2" || cnCode === "测试精英2") {
        triggerSystemWarning();
        return setupDebugRun(6, 'ev_creator', 999, 100, "冷血猎头(精英)");
    }
    
    if (normalizedCode === "GYWBOSS" || cnCode === "测试BOSS") {
        triggerSystemWarning();
        return setupDebugRun(8, '9527', 999, 100, "KPI大魔王");
    }
    
    if (normalizedCode === "EVBOSS" || cnCode === "测试EV") {
        triggerSystemWarning();
        return setupDebugRun(8, 'ev_creator', 999, 100, "KPI大魔王(EV版)");
    }
    
    if (normalizedCode === "1024BOSS" || cnCode === "测试1024") {
        triggerSystemWarning();
        return setupDebugRun(8, '1024', 999, 100, "Bug集合体");
    }

    // 4. 道具测试：金币流 (带弹窗)
    if (cnCode === "我有钱") {
        triggerSystemWarning();
        return setupRichRun();
    }

    // 5. 沙盒模式入口 (带弹窗)
    if (cnCode === "沙盒模式" || normalizedCode === "DEBUG") {
        triggerSystemWarning();
        return "沙盒模式启动";
    }

    return null;
};

/**
 * 解锁所有内容
 */
function unlockAllContent(): string {
    // 1. 解锁所有常规成就
    const allAchIds = ACHIEVEMENTS.map(a => a.id);
    // 过滤去重合并
    const currentSet = new Set(gameEngine.state.achievements);
    allAchIds.forEach(id => currentSet.add(id));
    
    // 2. 强制解锁人物关联的关键成就 (防止漏网之鱼)
    // 007 需要 first_blood
    currentSet.add('first_blood');
    // EV 需要 kpi_crusher (或旧版 boss_killer)
    currentSet.add('kpi_crusher');
    currentSet.add('boss_killer');
    
    gameEngine.state.achievements = Array.from(currentSet);
    
    // 3. 解锁所有图鉴 (怪物 + 物品 + 外包单位)
    const allEnemyIds = Object.keys(ENEMIES);
    const allItemIds = SHOP_ITEMS.map(i => i.id);
    const allSummonIds = Object.keys(SUMMON_STATS);
    
    const allContent = [...allEnemyIds, ...allItemIds, ...allSummonIds];
    
    allContent.forEach(id => gameEngine.unlockedCompendium.add(id));

    // 4. 立即保存
    gameEngine.saveAchievements();
    gameEngine.saveEncyclopedia();

    return "测试指令生效：所有图鉴、人物与成就已强制解锁！";
}

/**
 * 创建调试存档
 */
function setupDebugRun(
    targetWave: number, 
    charId: string, 
    hp: number, 
    atk: number, 
    targetName: string
): string {
    // 1. 重置为初始状态 (强制困难模式以确保精英怪出现)
    gameEngine.init(gameEngine.canvasWidth, gameEngine.canvasHeight, charId, 'hard');

    const p = gameEngine.state.player;

    // 2. 注入变态数值
    p.maxHp = hp;
    p.hp = hp;
    p.attackDamage = atk;
    p.gold = 9999; // 给足钱买装备测试
    
    // 3. 设置波次 (设置为目标波次的前一波，这样加载后会在商店)
    gameEngine.state.currentWave = targetWave - 1;
    gameEngine.state.waveEnded = true; // 标记波次结束，触发商店逻辑
    
    // 4. 保存这个伪造的状态到 localStorage
    gameEngine.saveGame();

    return `测试指令生效：已配置【${targetName}】前夕存档。请点击“入职登记”后直接进入。`;
}

function setupRichRun(): string {
    gameEngine.init(gameEngine.canvasWidth, gameEngine.canvasHeight, '9527', 'normal');
    gameEngine.state.player.gold = 50000;
    gameEngine.state.currentWave = 1;
    gameEngine.state.waveEnded = true; // 直接进商店
    gameEngine.saveGame();
    // Must include "对局已恢复" to trigger auto-navigation in App.tsx
    return "测试指令生效：已配置【土豪模式】(5万金币)。对局已恢复 (位于商店/整备阶段)。";
}
