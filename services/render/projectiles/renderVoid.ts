
import { Projectile } from "../../../types";

export const renderGoldVoid = (ctx: CanvasRenderingContext2D, p: Projectile) => {
    ctx.save();
    ctx.translate(p.x, p.y);
    const time = Date.now() / 100;

    // 1. Inner Void (Black Core)
    // A pure black hole that absorbs light
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(0, 0, p.radius * 0.7, 0, Math.PI * 2);
    ctx.fill();

    // 2. Event Horizon (Gold fluctuating ring)
    const points = 16;
    ctx.strokeStyle = '#fbbf24'; // Amber-400
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.globalCompositeOperation = 'lighter'; // Add glow

    ctx.beginPath();
    for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        // Fluctuation using sine wave based on angle and time
        const offset = Math.sin(angle * 5 + time) * (p.radius * 0.2);
        const r = p.radius + offset;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();

    // 3. Accretion Disk (Outer Glow)
    const grad = ctx.createRadialGradient(0, 0, p.radius, 0, 0, p.radius * 1.5);
    grad.addColorStop(0, 'rgba(251, 191, 36, 0.6)');
    grad.addColorStop(1, 'rgba(251, 191, 36, 0)');
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, p.radius * 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
};
