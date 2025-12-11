
import { Projectile } from "../../../types";

export const renderGoldenPalm = (ctx: CanvasRenderingContext2D, p: Projectile) => {
    ctx.save();
    ctx.translate(p.x, p.y);
    const angle = Math.atan2(p.vy, p.vx);
    ctx.rotate(angle);

    // 1. Golden Core (Orb)
    const grad = ctx.createRadialGradient(0, 0, p.radius * 0.2, 0, 0, p.radius);
    grad.addColorStop(0, '#fffbeb'); // Center White/Yellow
    grad.addColorStop(0.4, '#fbbf24'); // Amber
    grad.addColorStop(1, 'rgba(245, 158, 11, 0)'); // Fade out

    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, p.radius * 1.2, 0, Math.PI * 2);
    ctx.fill();

    // 2. Palm Silhouette / Kanju Symbol
    // Instead of text, we draw a stylized "Palm" energy shape
    ctx.strokeStyle = '#fef3c7'; // Light yellow
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    
    // Draw a simple hand shape pushing forward
    const scale = p.radius / 25;
    ctx.scale(scale, scale);
    
    ctx.beginPath();
    // Palm base
    ctx.arc(0, 0, 10, Math.PI/2, -Math.PI/2, true);
    // Fingers
    ctx.moveTo(0, -10); ctx.lineTo(15, -8); // Thumb
    ctx.moveTo(5, -5); ctx.lineTo(20, -5); // Index
    ctx.moveTo(8, 0); ctx.lineTo(22, 0); // Middle
    ctx.moveTo(5, 5); ctx.lineTo(20, 5); // Ring
    ctx.moveTo(0, 10); ctx.lineTo(15, 8); // Pinky
    
    ctx.stroke();

    // 3. Shockwave Rings (Pulsing)
    const time = Date.now() / 100;
    const offset = (time % 1) * 10;
    
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-5, 0, 20 + offset, -Math.PI/2, Math.PI/2);
    ctx.stroke();

    // 4. Trail Particles (Simple)
    if (Math.random() < 0.5) {
        ctx.fillStyle = '#fcd34d';
        const px = -30 - Math.random() * 20;
        const py = (Math.random() - 0.5) * 20;
        ctx.fillRect(px, py, 2, 2);
    }

    ctx.restore();
};
