
import { IGameEngine } from "../../../types";

export const TargetingMechanics = {
    getAimAngle: (engine: IGameEngine): number => {
        const p = engine.state.player;
        const aimX = engine.joystickInput.aim.x;
        const aimY = engine.joystickInput.aim.y;
        const joyMag = Math.hypot(aimX, aimY);

        // 1. Joystick Priority
        if (joyMag > 0.1) {
            return Math.atan2(aimY, aimX);
        } 
        
        // 2. Auto-Aim (Nearest Enemy)
        if (engine.settings.autoAim) {
            let nearest = null;
            let minDst = Infinity;
            // Iterate all enemies to find nearest
            for(const e of engine.state.enemies) {
                if (e.isTransitioning) continue;
                const d = Math.hypot(e.x - p.x, e.y - p.y);
                if (d < minDst) {
                    minDst = d;
                    nearest = e;
                }
            }
            if (nearest) {
                 return Math.atan2(nearest.y - p.y, nearest.x - p.x);
            }
        }
        
        // 3. Mouse Fallback
        return Math.atan2(engine.mousePos.y - p.y, engine.mousePos.x - p.x);
    }
};
