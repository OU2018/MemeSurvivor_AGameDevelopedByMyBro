
import { Projectile } from "../../../types";

export const renderNeonMissile = (ctx: CanvasRenderingContext2D, p: Projectile) => {
    const z = p.z || 0;

    // --- 1. Draw Ground Shadow ---
    // The shadow stays on the ground (x, y) but shrinks/fades as the object gets higher (z increases)
    if (z > 0) {
        ctx.save();
        ctx.translate(p.x, p.y);
        
        // Shadow gets smaller and fainter as height increases
        // Max height approx 800 in current physics
        const heightFactor = Math.max(0, 1 - z / 800); 
        const shadowScale = 0.5 + 0.8 * heightFactor; 
        
        ctx.scale(shadowScale, shadowScale);
        ctx.globalAlpha = 0.4 * heightFactor;
        
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(0, 0, 10, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    // --- 2. OPTIMIZED RIBBON TRAIL ---
    // Removed linear gradient for performance (80 missiles x gradient = lag)
    // Uses solid stroke + lighter blend
    if (p.trailHistory && p.trailHistory.length > 2) {
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalCompositeOperation = 'lighter'; // Neon Glow effect via blending

        // Draw path
        const head = { x: p.x, y: p.y - z };
        const tailIndex = 0; 
        const tail = p.trailHistory[tailIndex];
        const tailVisualY = tail.y - (tail.z || 0);
        
        ctx.beginPath();
        ctx.moveTo(tail.x, tailVisualY);
        
        for (let i = 1; i < p.trailHistory.length; i++) {
            const point = p.trailHistory[i];
            const vy = point.y - (point.z || 0);
            ctx.lineTo(point.x, vy);
        }
        ctx.lineTo(head.x, head.y);

        // Render: Solid color line
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.6;
        ctx.stroke();
        
        // Core highlight (thinner white line)
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.8;
        ctx.stroke();

        ctx.restore();
    }

    // --- 3. Draw Light Lance Head ---
    ctx.save();
    
    // Isometric Projection: Y position is offset by Z (Height)
    const visualX = p.x;
    const visualY = p.y - z;
    
    ctx.translate(visualX, visualY);

    // Visual Rotation Calculation
    // We need to combine ground velocity (vx, vy) with vertical velocity (vz)
    // Visual Y Velocity = vy - vz (since Z+ moves up screen)
    const vz = p.vz || 0;
    const visualVx = p.vx;
    const visualVy = p.vy - vz; // Z moves UP, so VZ positive means moving UP screen (negative Y)
    
    const angle = Math.atan2(visualVy, visualVx);
    
    ctx.rotate(angle);

    // Neon Effect: Additive Blending
    ctx.globalCompositeOperation = 'lighter';

    const len = 60; 
    const width = 10;

    // Head Gradient (Small, single instance, acceptable perf)
    const headGrad = ctx.createLinearGradient(0, 0, -len, 0);
    headGrad.addColorStop(0, '#ffffff');
    headGrad.addColorStop(0.4, p.color);
    headGrad.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = headGrad;
    
    // Draw "Lance" shape
    ctx.beginPath();
    ctx.moveTo(0, 0); // Tip
    ctx.lineTo(-len, -width); // Tail Top
    ctx.lineTo(-len * 0.8, 0); // Indent
    ctx.lineTo(-len, width); // Tail Bottom
    ctx.closePath();
    ctx.fill();

    // Intense Core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 4, 0, 0, Math.PI*2);
    ctx.fill();

    ctx.restore();
};
