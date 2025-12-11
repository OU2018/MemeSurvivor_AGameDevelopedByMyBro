
import { Projectile } from "../../../types";

export const renderGlitchPixel = (ctx: CanvasRenderingContext2D, p: Projectile) => {
    ctx.save();
    ctx.translate(p.x, p.y);
    const time = Date.now() / 50;

    // Jitter
    const jx = (Math.random() - 0.5) * 4;
    const jy = (Math.random() - 0.5) * 4;
    ctx.translate(jx, jy);

    // Core Colors RGB Shift
    const colors = ['#00ffff', '#ff00ff', '#ffffff'];
    const idx = Math.floor(time) % colors.length;
    const color = colors[idx];

    // Draw Main Square
    const size = p.radius * 1.5;
    ctx.fillStyle = color;
    ctx.fillRect(-size/2, -size/2, size, size);

    // Border
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(-size/2, -size/2, size, size);

    // Trail Blocks (Disconnected)
    const speed = Math.hypot(p.vx, p.vy);
    const angle = Math.atan2(p.vy, p.vx);
    
    if (speed > 2) {
        ctx.rotate(angle);
        for(let i=1; i<=3; i++) {
            const dist = i * 15;
            const trailSize = size * (1 - i * 0.2);
            // Random offset Y for trail
            const trailY = (Math.random() - 0.5) * 10;
            
            ctx.fillStyle = colors[(idx + i) % colors.length];
            ctx.globalAlpha = 0.8 / i;
            ctx.fillRect(-dist, -trailSize/2 + trailY, trailSize, trailSize);
        }
    }

    ctx.restore();
};
