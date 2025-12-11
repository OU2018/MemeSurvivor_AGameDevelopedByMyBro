
import { IGameEngine, Drop } from "../../../types";
import { DROP_CONFIG } from "./DropConstants";

export const PickupLogic = {
    spawn: (engine: IGameEngine, drop: Drop) => {
        const drops = engine.state.drops;
        
        // Limit check for Health/Hearts
        if (drop.type === 'health' || drop.type === 'big_health' || drop.type === 'love_heart') {
            const existing = drops.filter(d => d.type === 'health' || d.type === 'big_health' || d.type === 'love_heart');
            
            if (existing.length >= DROP_CONFIG.MAX_HEALTH_PACKS) {
                // Recycle: Remove the oldest one (first in array usually, or sort by life)
                // We'll find the one with lowest remaining life or just the first one found
                const toRemove = existing[0];
                const idx = drops.indexOf(toRemove);
                if (idx > -1) drops.splice(idx, 1);
            }
        }
        
        drops.push(drop);
    }
};
