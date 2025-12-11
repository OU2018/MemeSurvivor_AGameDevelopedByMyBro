import { IGameEngine } from "../../../../types";
import { spawnFloatingText } from "../../utils";

export const CoreSkills = {
    handleSpawner: (engine: IGameEngine, e: any, spawnFn: Function) => {
        if (e.config.behavior !== 'spawner') return;
        if (!e.stateTimer) e.stateTimer = 0;
        e.stateTimer++;
        if (e.stateTimer % 300 === 0) {
            spawnFloatingText(engine, e.x, e.y - e.radius - 20, "提需求!", "#a855f7", 'chat');
            spawnFn(engine, 'minion', e.x + (Math.random()-0.5)*50, e.y + (Math.random()-0.5)*50);
        }
    },

    handleStun: (engine: IGameEngine, e: any): boolean => {
        if (e.stunTimer && e.stunTimer > 0) {
            e.stunTimer--;
            
            const speed = Math.hypot(e.vx, e.vy);
            if (speed > 0.1) {
                e.x += e.vx;
                e.y += e.vy;
                e.vx *= 0.92;
                e.vy *= 0.92;
            } else {
                e.vx = 0; e.vy = 0;
                if (e.isThrown) e.isThrown = false;
            }
            
            return true;
        }
        return false;
    }
};