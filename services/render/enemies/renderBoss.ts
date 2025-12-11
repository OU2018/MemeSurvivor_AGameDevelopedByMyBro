
import { Enemy } from "../../../types";

export const renderBossEffects = (ctx: CanvasRenderingContext2D, e: Enemy) => {
    // Boss Dash Warning (INFINITE/LONG LENGTH)
    if (e.warningTimer && e.warningTimer > 0 && e.dashTarget) {
        ctx.save();
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
        ctx.lineWidth = 100; 
        ctx.globalAlpha = 0.3 + (1 - e.warningTimer / 60) * 0.4;
        ctx.beginPath();
        ctx.moveTo(e.x, e.y);
        
        // Calculate far end point based on direction
        const angle = Math.atan2(e.dashTarget.y - e.y, e.dashTarget.x - e.x);
        const dist = 3000; 
        ctx.lineTo(e.x + Math.cos(angle) * dist, e.y + Math.sin(angle) * dist);
        ctx.stroke();
        
        ctx.lineWidth = 4;
        ctx.globalAlpha = 1;
        ctx.strokeStyle = 'red';
        ctx.beginPath();
        ctx.moveTo(e.x, e.y);
        ctx.lineTo(e.x + Math.cos(angle) * dist, e.y + Math.sin(angle) * dist);
        ctx.stroke();

        ctx.restore();
    }
};
