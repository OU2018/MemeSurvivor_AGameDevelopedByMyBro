
import { IGameEngine } from "../../../../../types";
import { spawnFloatingText } from "../../../../utils";

export const AiStormSkill = {
    /**
     * 启动轰炸技能
     * @param count 轰炸总次数
     * @param warningText 飘字提示文本
     * @param color 飘字颜色
     */
    start: (engine: IGameEngine, e: any, count: number, warningText: string, color: string) => {
        // FIX: 不要在这里强制覆写 e.customVars.activeSkill = 'storm'
        // 因为 Phase 1 使用的是 'triple_storm' 状态，覆写会导致连招逻辑中断。
        // 状态管理交由调用方 (BossAI) 负责。
        
        e.customVars.stormQueue = count;
        
        spawnFloatingText(engine, e.x, e.y - 120, warningText, color, 'chat');
        engine.audio.play('ui_glitch_minor');
    },

    /**
     * 执行轰炸循环 (每帧调用)
     * @param interval 轰炸间隔 (帧数)
     */
    update: (engine: IGameEngine, e: any, p: any, interval: number) => {
        // 如果队列里还有剩余次数
        if (e.customVars.stormQueue > 0) {
            // 按照间隔触发
            if (e.stateTimer % interval === 0) {
                // ADJUSTED BATCH SIZE: Reduced from 2-4 to 1-3 for better playability
                const batchSize = 1 + Math.floor(Math.random() * 3); 
                
                for(let i=0; i<batchSize; i++) {
                    if (e.customVars.stormQueue <= 0) break;
                    
                    let tx, ty;
                    let valid = false;
                    let attempts = 0;
                    
                    // 尝试寻找合法的轰炸点
                    while(!valid && attempts < 5) {
                        // HYBRID STRATEGY:
                        // ADJUSTED: 25% Chance Target Player
                        // 75% Chance Random Map
                        if (Math.random() < 0.25) {
                            const angle = Math.random() * Math.PI * 2;
                            // Ensure it's not *directly* on top every time, but close
                            const dist = Math.random() * 400; 
                            tx = p.x + Math.cos(angle) * dist;
                            ty = p.y + Math.sin(angle) * dist;
                        } else {
                            // Full Map Coverage
                            const mw = engine.state.mapWidth / 2 - 100;
                            const mh = engine.state.mapHeight / 2 - 100;
                            tx = (Math.random() - 0.5) * 2 * mw;
                            ty = (Math.random() - 0.5) * 2 * mh;
                        }
                        valid = true;
                        attempts++;
                    }
                    
                    if (tx !== undefined && ty !== undefined) {
                        spawnDefragZone(engine, tx, ty, e.phase);
                    }
                    e.customVars.stormQueue--;
                }
                
                // 音效反馈
                if (e.customVars.stormQueue % 5 === 0) {
                    engine.audio.play('ui_static_tick');
                }
            }
        } else {
            // 队列清空后的清理逻辑
            // FIX: 只有在状态为单发 'storm' 时才自动结束
            // 如果状态是 'triple_storm' (P1连招)，不要自动结束，由 BossAI.ts 自己控制
            if (e.customVars.activeSkill === 'storm' && e.stateTimer % 60 === 0) {
                e.customVars.activeSkill = null;
            }
        }
    }
};

/**
 * 生成轰炸区域 (Zone)
 */
function spawnDefragZone(engine: IGameEngine, x: number, y: number, phase: number) {
    const isP2 = phase === 2;
    // P2 阶段瞄准更快
    const aimTime = isP2 ? 60 : 90; 
    const boomTime = 20;
    
    // Vary size slightly for visual noise
    const size = 100 + Math.random() * 40;

    engine.state.zones.push({
        id: Math.random().toString(),
        x: x, y: y,
        width: size, 
        height: size,
        radius: size / 2, // Collision radius
        type: 'glitch_square',
        life: aimTime + boomTime,
        maxLife: aimTime + boomTime,
        color: isP2 ? '#ef4444' : '#a855f7', // P2红色，P1紫色
        emoji: ''
    });
}
