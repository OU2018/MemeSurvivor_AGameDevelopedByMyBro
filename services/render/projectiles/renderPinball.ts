
import { Projectile } from "../../../types";

export const renderPinball = (ctx: CanvasRenderingContext2D, p: Projectile) => {
    // Rainbow Color Cycling based on time and ID
    const time = Date.now();
    const hue = (time / 2) % 360;
    const color = `hsl(${hue}, 100%, 60%)`;
    const innerColor = `hsl(${hue}, 100%, 90%)`;

    ctx.save();
    ctx.translate(p.x, p.y);

    // --- TRAIL (Motion Blur) ---
    const speed = Math.hypot(p.vx, p.vy);
    if (speed > 2) {
        const angle = Math.atan2(p.vy, p.vx);
        ctx.save();
        ctx.rotate(angle);

        // Trail Gradient
        const grad = ctx.createLinearGradient(0, 0, -p.radius * 4, 0);
        grad.addColorStop(0, color);
        grad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        // Teardrop shape
        ctx.moveTo(0, -p.radius * 0.8);
        ctx.lineTo(-p.radius * 5, 0);
        ctx.lineTo(0, p.radius * 0.8);
        ctx.fill();
        ctx.restore();
    }

    // --- BALL BODY ---
    // Rotate the ball itself for visual flair
    ctx.rotate(time / 50);

    // Main Body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
    ctx.fill();

    // Inner Highlight (Glossy look)
    const grad = ctx.createRadialGradient(-p.radius*0.3, -p.radius*0.3, p.radius*0.1, 0, 0, p.radius);
    grad.addColorStop(0, innerColor);
    grad.addColorStop(0.5, color);
    grad.addColorStop(1, `hsl(${hue}, 100%, 40%)`);
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
    ctx.fill();

    // Sharp Specular Highlight
    ctx.fillStyle = 'white';
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.ellipse(-p.radius * 0.4, -p.radius * 0.4, p.radius * 0.25, p.radius * 0.15, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    // Outer Glow Ring
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
};
