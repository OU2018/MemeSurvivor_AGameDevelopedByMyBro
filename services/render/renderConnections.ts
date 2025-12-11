
import { GameState } from "../../types";

export const renderConnections = (ctx: CanvasRenderingContext2D, state: GameState) => {
    // Draw Linker Lines (Underneath enemies)
    
    state.enemies.forEach(e => {
        // --- HR SPECIALIST CONNECTION (Green Heal) ---
        // Simple Green Line to target
        if (e.config.type === 'hr_specialist' && e.healTargetId) {
            const target = state.enemies.find(ally => ally.id === e.healTargetId);
            
            // Only draw if target exists and is alive
            if (target && target.hp > 0) {
                ctx.save();
                
                // Steady Green Line
                ctx.strokeStyle = '#4ade80'; // Green-400
                ctx.lineWidth = 2;
                ctx.globalAlpha = 0.6;
                
                ctx.beginPath();
                ctx.moveTo(e.x, e.y);
                ctx.lineTo(target.x, target.y);
                ctx.stroke();
                
                // Optional: Small pulse on the line
                if (Math.floor(Date.now() / 200) % 2 === 0) {
                    ctx.fillStyle = '#4ade80';
                    const midX = (e.x + target.x) / 2;
                    const midY = (e.y + target.y) / 2;
                    ctx.beginPath();
                    ctx.arc(midX, midY, 3, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                ctx.restore();
            }
        }

        // --- GENERIC LINKER / ORBIT ---
        if (e.config.behavior === 'linker' || e.config.behavior === 'summoner_orbit') {
             state.enemies.forEach(ally => {
                  if (ally === e) return;
                  // Linker logic check
                  const isLinked = (e.config.behavior === 'linker' && ally.linkedById === e.id);
                  // Orbit logic check
                  const isOrbit = (e.config.behavior === 'summoner_orbit' && ally.orbitTargetId === e.id);

                  if (isLinked || isOrbit) {
                      ctx.save();
                      ctx.strokeStyle = isOrbit ? '#f472b6' : '#fcd34d';
                      ctx.lineWidth = 2;
                      ctx.globalAlpha = 0.6 + Math.sin(Date.now() / 100) * 0.3;
                      ctx.beginPath();
                      ctx.moveTo(e.x, e.y);
                      ctx.lineTo(ally.x, ally.y);
                      ctx.stroke();

                      // Moving light effect on line
                      const time = Date.now() / 300;
                      const offset = time % 1;
                      const lx = e.x + (ally.x - e.x) * offset;
                      const ly = e.y + (ally.y - e.y) * offset;
                      
                      ctx.fillStyle = '#fff';
                      ctx.globalAlpha = 0.8;
                      ctx.beginPath();
                      ctx.arc(lx, ly, 4, 0, Math.PI*2);
                      ctx.fill();
                      
                      ctx.restore();
                  }
             });
        }
    });
};
