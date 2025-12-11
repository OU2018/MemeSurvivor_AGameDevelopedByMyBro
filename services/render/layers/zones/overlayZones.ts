
import { Zone } from "../../../../types";
import { ViewBounds } from "../../renderConfig";

export const renderOverlayZones = (ctx: CanvasRenderingContext2D, z: Zone, bounds: ViewBounds) => {
    // --- SAFE ZONE HINT (Surge Markers) ---
    if (z.type === 'safe_zone_hint') {
        const time = Date.now() / 500;
        ctx.save();
        ctx.translate(z.x, z.y);
        
        ctx.save();
        ctx.rotate(time);
        ctx.strokeStyle = 'rgba(96, 165, 250, 0.5)'; 
        ctx.lineWidth = 4;
        ctx.setLineDash([20, 20]);
        ctx.beginPath();
        ctx.arc(0, 0, z.radius * 0.8, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(0, 0, z.radius * 0.4, 0, Math.PI * 2);
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = '#60a5fa';
        for(let i=0; i<5; i++) {
            const offset = (time * 2 + i) % 3;
            const y = -offset * 30;
            const alpha = 1 - (offset/3);
            ctx.globalAlpha = alpha;
            const a = i * (Math.PI * 2 / 5) + time;
            const r = z.radius * 0.6;
            ctx.beginPath();
            ctx.arc(Math.cos(a)*r, Math.sin(a)*r + y, 3, 0, Math.PI*2);
            ctx.fill();
        }
        
        ctx.restore();
        return;
    }

    // --- WARNING CIRCLE (Boss Attacks) ---
    if (z.type === 'warning_circle') {
        if (z.x + z.radius < bounds.minX || z.x - z.radius > bounds.maxX ||
            z.y + z.radius < bounds.minY || z.y - z.radius > bounds.maxY) {
            return;
        }
        const maxLife = z.maxLife || 60;
        const progress = 1 - (z.life / maxLife); 
        
        ctx.save();
        ctx.translate(z.x, z.y);
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, z.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = 'rgba(234, 88, 12, 0.6)';
        ctx.beginPath();
        ctx.arc(0, 0, z.radius * progress, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return;
    }

    // --- SAFE HAVEN (Protection Zone) ---
    if (z.type === 'safe_haven') {
        ctx.save();
        ctx.translate(z.x, z.y);
        
        ctx.beginPath();
        ctx.arc(0, 0, z.radius, 0, Math.PI * 2);
        ctx.clip(); 

        ctx.fillStyle = 'rgba(59, 130, 246, 0.2)'; 
        ctx.fill();

        ctx.globalCompositeOperation = 'lighter';
        const scanPhase = (Date.now() % 2000) / 2000; 
        const scanY = -z.radius + (scanPhase * z.radius * 2);
        
        ctx.fillStyle = 'rgba(147, 197, 253, 0.4)';
        ctx.fillRect(-z.radius, scanY, z.radius * 2, 20); 

        ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)';
        ctx.lineWidth = 2;
        const gridSize = 40;
        ctx.beginPath();
        for(let gx = -z.radius; gx <= z.radius; gx += gridSize) {
            ctx.moveTo(gx, -z.radius);
            ctx.lineTo(gx, z.radius);
        }
        for(let gy = -z.radius; gy <= z.radius; gy += gridSize) {
            ctx.moveTo(-z.radius, gy);
            ctx.lineTo(z.radius, gy);
        }
        ctx.stroke();

        ctx.restore();

        ctx.save();
        ctx.translate(z.x, z.y);
        
        ctx.shadowColor = '#60a5fa';
        ctx.shadowBlur = 15;
        ctx.strokeStyle = '#bfdbfe';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, z.radius, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'black';
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 24px "Noto Sans SC", sans-serif';
        ctx.textAlign = 'center';
        ctx.lineWidth = 4;
        ctx.strokeText("安全区", 0, -z.radius - 15);
        ctx.fillText("安全区", 0, -z.radius - 15);

        ctx.restore();
        return;
    }
};
