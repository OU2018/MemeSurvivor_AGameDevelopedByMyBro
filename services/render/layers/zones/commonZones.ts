
import { Zone } from "../../../../types";
import { ViewBounds } from "../../renderConfig";

export const renderCommonZones = (ctx: CanvasRenderingContext2D, z: Zone, bounds: ViewBounds) => {
    // --- COFFEE PUDDLE ---
    // @ts-ignore
    if (z.type === 'coffee_puddle') {
        ctx.save();
        ctx.translate(z.x, z.y);
        const alpha = Math.min(1, z.life / 60);
        
        // Dark Brown Base
        ctx.fillStyle = `rgba(69, 26, 3, ${0.8 * alpha})`; 
        ctx.beginPath();
        ctx.arc(0, 0, z.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Bubbles
        if (!bounds.isLowQuality) {
             const time = Date.now() / 500;
             ctx.fillStyle = `rgba(217, 119, 6, ${0.6 * alpha})`; // Lighter froth
             for(let i=0; i<5; i++) {
                 const r = z.radius * 0.7;
                 const a = (i * Math.PI * 2 / 5) + time;
                 const bubbleX = Math.cos(a) * r * (0.5 + Math.sin(time+i)*0.2);
                 const bubbleY = Math.sin(a) * r * (0.5 + Math.cos(time+i)*0.2);
                 const size = 10 + Math.sin(time * 5 + i) * 5;
                 
                 ctx.beginPath();
                 ctx.arc(bubbleX, bubbleY, size, 0, Math.PI*2);
                 ctx.fill();
             }
        }

        // Steam
        if (!bounds.isLowQuality && Math.random() < 0.1) {
             ctx.fillStyle = `rgba(255, 255, 255, ${0.2 * alpha})`;
             const sx = (Math.random()-0.5) * z.radius;
             const sy = (Math.random()-0.5) * z.radius;
             ctx.beginPath();
             ctx.arc(sx, sy, 5, 0, Math.PI*2);
             ctx.fill();
        }
        
        ctx.restore();
        return;
    }

    if (z.type === 'firewall_rotate') {
        const angle = z.angle || 0;
        const length = z.height || 800;
        const width = z.width || 60;
        
        ctx.save();
        ctx.translate(z.x, z.y); 
        ctx.rotate(angle);
        
        ctx.globalCompositeOperation = 'lighter';
        
        ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';
        ctx.fillRect(0, -width/2, length, width);
        
        const grad = ctx.createLinearGradient(0, -width, 0, width);
        grad.addColorStop(0, 'rgba(34, 211, 238, 0)');
        grad.addColorStop(0.5, 'rgba(34, 211, 238, 0.4)');
        grad.addColorStop(1, 'rgba(34, 211, 238, 0)');
        
        ctx.fillStyle = grad;
        ctx.fillRect(0, -width*1.5, length, width*3);
        
        if (!bounds.isLowQuality) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            const offset = (Date.now() / 20) % 40;
            ctx.beginPath();
            for(let i=0; i<length; i+=40) {
                const x = i + offset;
                if(x < length) {
                    ctx.moveTo(x, -width/2);
                    ctx.lineTo(x, width/2);
                }
            }
            ctx.stroke();
        }
        ctx.restore();
        return;
    }

    if (z.type === 'explosion_shockwave') {
        const maxLife = z.maxLife || 20;
        const progress = 1 - (z.life / maxLife);
        const currentRadius = z.radius * progress;
        const alpha = 1 - progress;
        const grad = ctx.createRadialGradient(z.x, z.y, currentRadius * 0.7, z.x, z.y, currentRadius);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        grad.addColorStop(0.8, `rgba(255, 255, 255, ${0.6 * alpha})`);
        grad.addColorStop(1, `rgba(255, 255, 255, ${0.9 * alpha})`);
        
        ctx.save();
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(z.x, z.y, currentRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.8 * alpha})`;
        ctx.lineWidth = 4 * (1 - progress);
        ctx.stroke();
        ctx.restore();
        return;
    }
    
    if (z.type === 'scorch') {
        const alpha = Math.min(1, z.life / 60);
        
        ctx.save();
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.6})`;
        ctx.beginPath();
        ctx.arc(z.x, z.y, z.radius, 0, Math.PI * 2);
        ctx.fill();
        if (!bounds.isLowQuality) {
            ctx.strokeStyle = `rgba(0, 0, 0, ${alpha * 0.8})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            for(let i=0; i<5; i++) {
                const a = Math.random() * Math.PI * 2;
                const r = Math.random() * z.radius;
                ctx.moveTo(z.x, z.y);
                ctx.lineTo(z.x + Math.cos(a)*r, z.y + Math.sin(a)*r);
            }
            ctx.stroke();
        }
        ctx.restore();
        return;
    }
    
    // Generic Fill (Acid, Puddles)
    ctx.save();
    ctx.fillStyle = z.color;
    if (z.type !== 'acid' && z.type !== 'acid_trail' && z.type !== 'pie_trap') {
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(z.x, z.y, z.radius, 0, Math.PI * 2);
        ctx.fill();
    } else {
        // Simple fill for acid/pie
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(z.x, z.y, z.radius, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
};
