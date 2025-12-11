
import { Projectile } from "../../../types";

const MATRIX_CHARS = "01010101XYZAﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ";

const getRandomChar = (seed: number) => {
    const idx = Math.floor(Math.abs(Math.sin(seed) * MATRIX_CHARS.length));
    return MATRIX_CHARS[idx % MATRIX_CHARS.length];
};

export const renderMatrixMissile = (ctx: CanvasRenderingContext2D, p: Projectile) => {
    const z = p.z || 0;
    const time = Date.now();

    // --- 1. OPTIMIZED TRAIL (Digital Glitch Data Stream) ---
    if (p.trailHistory && p.trailHistory.length > 2) {
        ctx.save();
        ctx.lineCap = 'butt'; // Blocky ends
        ctx.lineJoin = 'miter';
        ctx.globalCompositeOperation = 'lighter'; 

        // Draw Ribbon
        const head = { x: p.x, y: p.y - z };
        
        // Base line
        ctx.beginPath();
        for (let i = 0; i < p.trailHistory.length; i++) {
            const point = p.trailHistory[i];
            const vy = point.y - (point.z || 0);
            if (i===0) ctx.moveTo(point.x, vy);
            else ctx.lineTo(point.x, vy);
        }
        ctx.lineTo(head.x, head.y);

        // Render: Neon Green Core
        ctx.strokeStyle = '#22c55e'; 
        ctx.lineWidth = 3;
        ctx.shadowColor = '#22c55e';
        ctx.shadowBlur = 5;
        ctx.stroke();
        
        ctx.shadowBlur = 0;

        // Render: Glitch Blocks along the trail
        // Instead of smooth line, draw random rects
        for (let i = 0; i < p.trailHistory.length; i+=2) {
            const point = p.trailHistory[i];
            const vy = point.y - (point.z || 0);
            
            const seed = i + Math.floor(time / 50);
            if (Math.sin(seed) > 0.5) {
                const size = 4 + Math.random() * 4;
                ctx.fillStyle = Math.random() > 0.5 ? '#4ade80' : '#ffffff';
                ctx.globalAlpha = i / p.trailHistory.length; // Fade out near tail
                ctx.fillRect(point.x - size/2, vy - size/2, size, size);
            }
        }

        ctx.restore();
    }

    // --- 2. HEAD (Digital Harpoon) ---
    ctx.save();
    
    // Isometric Projection
    const visualX = p.x;
    const visualY = p.y - z;
    
    ctx.translate(visualX, visualY);

    const vz = p.vz || 0;
    const visualVx = p.vx;
    const visualVy = p.vy - vz; 
    
    const angle = Math.atan2(visualVy, visualVx);
    
    // Add Glitch Jitter to rotation
    const jitter = Math.sin(time / 20) * 0.1;
    ctx.rotate(angle + jitter);

    ctx.globalCompositeOperation = 'source-over';

    const len = 35; 
    const width = 10;

    // Main Body (Dark Metal)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(0, 0); // Tip
    ctx.lineTo(-len, -width/2); // Back Top
    ctx.lineTo(-len + 5, 0); // Notch
    ctx.lineTo(-len, width/2); // Back Bottom
    ctx.closePath();
    ctx.fill();
    
    // Neon Edges
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#22c55e';
    ctx.shadowBlur = 10;
    ctx.stroke();
    
    // Glowing Core
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.moveTo(-5, 0);
    ctx.lineTo(-20, -2);
    ctx.lineTo(-20, 2);
    ctx.fill();

    ctx.restore();
};
