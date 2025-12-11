
import { Projectile } from "../../../types";

export const renderGlitchTangle = (ctx: CanvasRenderingContext2D, p: Projectile) => {
    ctx.save();
    ctx.translate(p.x, p.y);
    const time = Date.now();
    
    // Rotate for dynamic feel
    ctx.rotate(time / 100 + p.id.charCodeAt(0));

    // Jitter position slightly
    const jx = (Math.random() - 0.5) * 2;
    const jy = (Math.random() - 0.5) * 2;
    ctx.translate(jx, jy);

    // Draw Blob Shape
    const size = p.radius * 1.2;
    const points = 8;
    
    ctx.beginPath();
    for(let i=0; i<=points; i++) {
        const angle = (i / points) * Math.PI * 2;
        // Randomize radius per vertex per frame for "liquid/blob" distortion
        // Use consistent noise based on time to make it undulate rather than flicker
        const noise = Math.sin(time / 100 + i * 2) * 0.2 + (Math.random() * 0.1); 
        const r = size * (0.8 + noise);
        
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        
        if (i===0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
    
    // 1. Fill (Cyan Core)
    ctx.fillStyle = '#22d3ee'; 
    ctx.fill();

    // 2. Stroke (Purple Shell)
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.stroke();
    
    // 3. Glow
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 10;
    ctx.stroke();

    // 4. Inner Highlights (White)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-size*0.3, -size*0.3, size*0.2, 0, Math.PI*2);
    ctx.fill();

    ctx.restore();
};
