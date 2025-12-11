
import { Enemy } from "../../../types";
import { TextCache } from "../TextCache";

export const renderBossKPI = (ctx: CanvasRenderingContext2D, e: Enemy) => {
    const time = Date.now() / 1000;

    // --- 1. OKR WHEEL (Floor Aura) ---
    ctx.save();
    ctx.translate(e.x, e.y);
    
    // Outer Ring
    ctx.rotate(time * 0.2);
    ctx.strokeStyle = '#7f1d1d'; // Dark Red
    ctx.lineWidth = 4;
    ctx.setLineDash([20, 10]);
    ctx.beginPath();
    ctx.arc(0, 0, 120, 0, Math.PI * 2);
    ctx.stroke();
    
    // Middle Ring (Counter Rotate)
    ctx.rotate(-time * 0.4);
    ctx.strokeStyle = '#ef4444'; // Red
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 5]);
    ctx.beginPath();
    ctx.arc(0, 0, 90, 0, Math.PI * 2);
    ctx.stroke();

    // Inner Text Ring
    ctx.rotate(time * 0.1);
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.font = 'bold 12px monospace';
    const text = "KPI OKR ROI P0 P1 ";
    for (let i = 0; i < 8; i++) {
        ctx.rotate(Math.PI / 4);
        ctx.fillText(text, 60, 0);
    }

    ctx.restore();

    // --- 2. BOSS BODY (THE MISSING PART FIXED) ---
    // Added explicit body rendering with composite reset
    ctx.save();
    ctx.translate(e.x, e.y);
    
    // Reset Composite to ensure body is drawn solid over the aura
    ctx.globalCompositeOperation = 'source-over';
    
    // Shake effect (e.g. when hit)
    if (e.hitFlashTimer && e.hitFlashTimer > 0) {
        ctx.translate((Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5);
        ctx.filter = 'brightness(1.5) sepia(1) hue-rotate(-50deg) saturate(3)'; // Red flash
    }

    const fontSize = 140; // Big Boss Size
    const texture = TextCache.getTexture(e.emoji, fontSize, '#fff');
    ctx.drawImage(texture, -texture.width/2, -texture.height/2);

    ctx.restore();

    // --- 3. GLITCH AURA (Overlay Effect) ---
    // Random glitch offsets
    if (Math.random() < 0.1 || e.phase === 3) {
        const gx = (Math.random() - 0.5) * 10;
        const gy = (Math.random() - 0.5) * 10;
        
        ctx.save();
        ctx.translate(e.x + gx, e.y + gy);
        ctx.globalAlpha = 0.5;
        ctx.globalCompositeOperation = 'lighter'; // Additive blend for glitch
        
        // RGB Split
        ctx.fillStyle = '#00ffff'; // Cyan
        ctx.beginPath();
        ctx.arc(-4, -4, e.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#ff00ff'; // Magenta
        ctx.beginPath();
        ctx.arc(4, 4, e.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    // --- 4. PHASE 3 RAGE MODE ---
    if (e.phase === 3) {
        ctx.save();
        ctx.translate(e.x, e.y);
        const pulse = 1 + Math.sin(time * 10) * 0.1;
        ctx.scale(pulse, pulse);
        
        // Red Glow
        const grad = ctx.createRadialGradient(0, 0, e.radius, 0, 0, e.radius * 2);
        grad.addColorStop(0, 'rgba(255, 0, 0, 0.5)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, e.radius * 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
};
