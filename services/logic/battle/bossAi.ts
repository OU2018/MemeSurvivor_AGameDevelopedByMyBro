
import { IGameEngine } from "../../../types";
import { BossKPI } from "./special/BossKPI";
import { BossGlitch } from "./special/BossGlitch";
import { BossAI } from "./special/BossAI";

export const BossAi = {
    /**
     * Main update function delegated from enemySystem
     */
    updateBossBehavior: (engine: IGameEngine, e: any, p: any, shootFn: Function) => {
        if (e.config.behavior !== 'boss') return;

        // Route to specific boss logic
        if (e.config.type === 'boss_kpi') {
            BossKPI.update(engine, e, p, shootFn);
        } 
        else if (e.config.type === 'boss_glitch') {
            BossGlitch.update(engine, e, p, shootFn);
        }
        else if (e.config.type === 'boss_ai') {
            BossAI.update(engine, e, p, shootFn);
        }
        else {
            // Fallback for generic boss
            BossKPI.update(engine, e, p, shootFn);
        }
    }
};
