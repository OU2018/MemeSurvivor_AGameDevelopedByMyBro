
import { Enemy } from "../../../../types";

export const BossAISkillRenderer = {
    renderAimLine: (ctx: CanvasRenderingContext2D, e: Enemy) => {
        if (e.customVars?.aimAngle === undefined) return;
        
        const angle = e.customVars.aimAngle;
        const length = 2000; // Long enough
        
        ctx.save();
        ctx.translate(e.x, e.y);
        ctx.rotate(angle);
        
        // --- FATAL EXCEPTION TRAJECTORY ---
        // A red, glitchy, dashed line indicating 007 sniper/bomb throw
        const time = Date.now() / 50;

        // 1. Core Line (Thick Glitchy Dash)
        ctx.strokeStyle = '#ef4444'; // Red-500
        ctx.lineWidth = 4;
        ctx.setLineDash([40, 30]); // Long segments
        ctx.lineDashOffset = -time * 5; // Fast flow
        
        // Slight jitter to the line itself
        const jitterY = (Math.random() - 0.5) * 2;
        
        ctx.beginPath();
        ctx.moveTo(0, jitterY);
        ctx.lineTo(length, jitterY);
        ctx.stroke();
        
        // 2. Secondary Interference Line
        if (Math.random() < 0.5) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 1;
            ctx.setLineDash([10, 80]);
            ctx.lineDashOffset = time * 8;
            ctx.beginPath();
            ctx.moveTo(0, (Math.random()-0.5)*10);
            ctx.lineTo(length, (Math.random()-0.5)*10);
            ctx.stroke();
        }

        // 3. Target Reticle at end (or fixed distance for visual)
        const reticleDist = 500; 
        ctx.translate(reticleDist, 0);
        
        // Rotating bracket
        ctx.save();
        ctx.rotate(time * 0.1);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.setLineDash([]);
        
        const size = 40;
        // Corners [ ]
        ctx.beginPath();
        ctx.moveTo(-size, -size); ctx.lineTo(-size, size); // Left
        ctx.moveTo(size, -size); ctx.lineTo(size, size);   // Right
        ctx.stroke();
        
        // X center
        ctx.strokeStyle = '#fca5a5';
        ctx.beginPath();
        ctx.moveTo(-15, -15); ctx.lineTo(15, 15);
        ctx.moveTo(15, -15); ctx.lineTo(-15, 15);
        ctx.stroke();
        ctx.restore();
        
        // Text "FATAL ERROR"
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.save();
        ctx.rotate(-Math.PI/2); // Text along line
        ctx.fillText("FATAL_EXCEPTION_0x007", 0, -50);
        ctx.restore();

        ctx.restore();
    },

    renderCrashDashTelegraph: (ctx: CanvasRenderingContext2D, e: Enemy) => {
        if (e.customVars?.dashAngle === undefined) return;
        const angle = e.customVars.dashAngle;
        const timer = e.customVars.subTimer || 0;
        
        // Hardcoded threshold approx from logic
        const isLocking = timer > 90; // Approx > 1.5s
        const length = 3000;

        ctx.save();
        ctx.translate(e.x, e.y);
        ctx.rotate(angle);

        // 1. WARNING PATH
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(length, 0);
        
        ctx.lineWidth = isLocking ? 10 : 6;
        ctx.strokeStyle = isLocking ? '#ef4444' : 'rgba(239, 68, 68, 0.5)';
        
        if (!isLocking) {
            const dashLen = 30;
            ctx.setLineDash([dashLen, dashLen]);
            ctx.lineDashOffset = -Date.now() / 5; // Flow towards target
        }
        
        ctx.stroke();

        // 2. ERROR TEXT ALONG LINE
        if (Math.random() < 0.5 || isLocking) {
            ctx.font = 'bold 24px monospace';
            ctx.fillStyle = isLocking ? '#ffffff' : 'rgba(239, 68, 68, 0.8)';
            ctx.textAlign = 'center';
            
            // Draw multiple
            for(let i=200; i<length; i+=400) {
                ctx.fillText(">>>> SYSTEM CRASH >>>>", i, -20);
            }
        }

        ctx.restore();
    }
};
