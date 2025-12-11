import { IGameEngine } from "../../../../types";
import { spawnFloatingText } from "../../utils";

export const SupportSkills = {
    handleSupportHeal: (engine: IGameEngine, e: any) => {
        // Special case for Pie Painter (uses support behavior but custom logic above)
        if (e.config.type === 'pie_painter') {
            SupportSkills.handlePiePainter(engine, e);
            return;
        }

        if (e.config.behavior !== 'support') return;
        if (!e.stateTimer) e.stateTimer = 0;
        
        e.stateTimer++;

        // --- SIMPLE GREEN CONNECTION ---
        // Find lowest HP ally
        if (!e.healTargetId || engine.state.timeAlive % 30 === 0) {
            let potentialTarget = null;
            let minHp = 1.0;
            const searchRange = 450;

            for (const ally of engine.state.enemies) {
                if (ally !== e && ally.hp < ally.maxHp && ally.hp > 0) {
                    const dist = Math.hypot(ally.x - e.x, ally.y - e.y);
                    if (dist < searchRange) {
                        const ratio = ally.hp / ally.maxHp;
                        if (ratio < minHp) {
                            minHp = ratio;
                            potentialTarget = ally;
                        }
                    }
                }
            }
            
            if (potentialTarget) {
                e.healTargetId = (potentialTarget as any).id;
            } else {
                e.healTargetId = undefined; 
            }
        }

        // --- HEAL LOGIC (Every 3 seconds) ---
        if (e.stateTimer % 180 === 0 && e.healTargetId) {
           const target = engine.state.enemies.find(ally => ally.id === e.healTargetId);
           
           if (target && target.hp < target.maxHp && target.hp > 0) {
               // Calculate Scaling Heal: Base 50 + Wave Scaling
               const baseHeal = 50;
               const scaling = 1 + (engine.state.currentWave - 1) * 0.2;
               const healAmount = Math.floor(baseHeal * scaling);

               target.hp = Math.min(target.maxHp, target.hp + healAmount);
               
               // Simple text feedback
               spawnFloatingText(engine, target.x, target.y, `+${healAmount}`, "#22c55e", 'damage');
           }
        }
    },

    handlePiePainter: (engine: IGameEngine, e: any) => {
        if (e.config.type !== 'pie_painter') return;
        if (!e.stateTimer) e.stateTimer = 0;
        e.stateTimer++;
        
        // Every 4 seconds, paint a pie
        if (e.stateTimer % 240 === 0) {
            // Target player position with RANDOM OFFSET
            const p = engine.state.player;
            // Offset range: +/- 100px
            const offsetX = (Math.random() - 0.5) * 200;
            const offsetY = (Math.random() - 0.5) * 200;
            
            const targetX = Math.max(-engine.state.mapWidth/2, Math.min(engine.state.mapWidth/2, p.x + offsetX));
            const targetY = Math.max(-engine.state.mapHeight/2, Math.min(engine.state.mapHeight/2, p.y + offsetY));
            
            spawnFloatingText(engine, e.x, e.y - e.radius - 20, "画个饼!", "#fbbf24", 'chat');
            
            // Create delayed explosion zone
            engine.state.zones.push({
                id: Math.random().toString(),
                x: targetX,
                y: targetY,
                radius: 120, // Pie size
                type: 'pie_trap',
                life: 180, // 3 seconds delay
                maxLife: 180,
                color: '#fbbf24', // Pie color
                emoji: ''
            });
        }
    },

    handleLemonTrail: (engine: IGameEngine, e: any) => {
        if (e.config.type !== 'lemon_head') return;
        e.trailTimer = (e.trailTimer || 0) + 1;
        if (e.trailTimer % 15 === 0) {
           engine.state.zones.push({
               id: Math.random().toString(),
               x: e.x,
               y: e.y,
               radius: e.radius,
               type: 'acid_trail',
               life: 180, 
               color: '#a3e635',
               emoji: '',
               maxLife: 180
           });
        }
    }
};