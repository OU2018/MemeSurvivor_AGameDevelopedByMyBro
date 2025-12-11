
import { IGameEngine } from "../../../types";
import { DROP_CONFIG } from "./DropConstants";

export const GoldLogic = {
    spawn: (engine: IGameEngine, x: number, y: number, value: number) => {
        // --- 1. MERGE LOGIC ---
        // Attempt to merge with existing drops nearby to reduce entity count
        // and create higher tier coins.
        const drops = engine.state.drops;
        const mergeRangeSq = DROP_CONFIG.MERGE_RADIUS * DROP_CONFIG.MERGE_RADIUS;
        
        // Iterate backwards to find best candidate (newest drops usually on top/active)
        // Optimization: Only check last 50 drops if pool is huge
        const searchLimit = Math.max(0, drops.length - 50);
        
        for (let i = drops.length - 1; i >= searchLimit; i--) {
            const d = drops[i];
            // Only merge with other gold that isn't currently flying to player
            if (d.type === 'gold' && d.life > 0) {
                const dx = d.x - x;
                const dy = d.y - y;
                const distSq = dx*dx + dy*dy;
                
                if (distSq < mergeRangeSq) {
                    // MERGE SUCCESS
                    d.value += value;
                    d.life = DROP_CONFIG.GOLD_LIFETIME; // Refresh life
                    
                    // Visual Pop: Reset pickup delay slightly to let it "grow" before being grabbed
                    d.pickupDelay = 10; 
                    
                    // Physics Pop: Little hop to indicate merge
                    d.vy = -3;
                    d.vx = (Math.random() - 0.5) * 2;
                    
                    return; // Merged, no new entity needed
                }
            }
        }

        // --- 2. NEW SPAWN LOGIC ---
        // Bounce Physics: Initial burst velocity to scatter coins
        // Slightly random initial impulse
        const angle = Math.random() * Math.PI * 2;
        const speed = 3 + Math.random() * 5; // Good scatter speed
        
        engine.state.drops.push({
            id: Math.random().toString(),
            x: x, 
            y: y,
            radius: 10, // Unified Physics Radius (matches small visual)
            emoji: '', 
            type: 'gold',
            value: value,
            life: DROP_CONFIG.GOLD_LIFETIME,
            
            // Scatter Velocity
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 2, // Biased upwards
            
            friction: 0.9, // Slow down quickly on floor
            pickupDelay: DROP_CONFIG.PICKUP_DELAY // Invulnerable to magnet for a moment
        });
    }
};
