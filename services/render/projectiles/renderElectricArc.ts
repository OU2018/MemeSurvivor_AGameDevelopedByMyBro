
import { Projectile } from "../../../types";

export const renderElectricArc = (ctx: CanvasRenderingContext2D, p: Projectile) => {
    ctx.save();
    ctx.translate(p.x, p.y);
    const angle = Math.atan2(p.vy, p.vx);
    ctx.rotate(angle);

    const time = Date.now();
    
    // Core Ball
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, p.radius * 0.6, 0, Math.PI * 2);
    ctx.fill();
    
    // Outer Glow
    ctx.fillStyle = p.color || '#22d3ee';
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
    ctx.fill();

    // Electric Arcs (Jagged Trail)
    ctx.strokeStyle = p.color || '#22d3ee';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    
    // Draw 2-3 random arcs trailing behind
    for(let i=0; i<2; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        
        let tx = 0;
        let ty = 0;
        const segments = 4;
        const trailLen = 60;
        
        for(let j=0; j<segments; j++) {
            tx -= trailLen / segments;
            // Jitter Y
            const jitter = Math.sin(time / 20 + i * 10 + j * 50) * 10;
            ty = jitter;
            ctx.lineTo(tx, ty);
        }
        ctx.stroke();
    }

    ctx.restore();
};
