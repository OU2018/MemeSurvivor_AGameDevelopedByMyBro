
import { Projectile } from "../../../types";

export const renderSineShuriken = (ctx: CanvasRenderingContext2D, p: Projectile) => {
    ctx.save();
    ctx.translate(p.x, p.y);
    
    // Slower spin so the X shape is clearly visible
    const time = Date.now() / 150; 

    // --- 1. SINE WAVE RIBBON TRAIL (Keep existing) ---
    if (p.trailHistory && p.trailHistory.length > 2) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        
        // Neon Cyan/Pink
        ctx.strokeStyle = '#22d3ee'; 
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#22d3ee';
        
        ctx.beginPath();
        // Trace history relative to current position logic is handled by undoing translate
        ctx.translate(-p.x, -p.y);
        
        const head = { x: p.x, y: p.y };
        ctx.moveTo(p.trailHistory[0].x, p.trailHistory[0].y);
        for(let i=1; i<p.trailHistory.length; i++) {
            ctx.lineTo(p.trailHistory[i].x, p.trailHistory[i].y);
        }
        ctx.lineTo(head.x, head.y);
        ctx.stroke();
        
        // Inner white core line
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.restore();
    }

    // --- 2. CROSS BLADE BODY (X-Shape) ---
    ctx.rotate(time);

    // Glow
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#22d3ee';

    // Draw Cross (Two rectangles)
    ctx.fillStyle = '#22d3ee'; // Cyan Neon
    
    // Make it visually large
    const armLength = p.radius * 2.2; 
    const armThickness = p.radius * 0.5;
    
    // Horizontal Bar
    ctx.fillRect(-armLength/2, -armThickness/2, armLength, armThickness);
    // Vertical Bar
    ctx.fillRect(-armThickness/2, -armLength/2, armThickness, armLength);

    // Center Core (Diamond)
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(0, -armThickness);
    ctx.lineTo(armThickness, 0);
    ctx.lineTo(0, armThickness);
    ctx.lineTo(-armThickness, 0);
    ctx.fill();
    
    // Add "Glitch" offset outlines
    if (Math.random() < 0.3) {
        ctx.strokeStyle = '#ff00ff'; // Magenta glitch
        ctx.lineWidth = 1;
        ctx.strokeRect(-armLength/2 + 2, -armThickness/2 + 2, armLength, armThickness);
    }

    ctx.restore();
};
