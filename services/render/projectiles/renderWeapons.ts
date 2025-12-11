
import { Projectile } from "../../../types";

const getStableRandom = (seedStr: string, offset: number) => {
    const seed = seedStr.charCodeAt(0) + seedStr.charCodeAt(seedStr.length - 1) + offset;
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
};

export const renderMeleeSwing = (ctx: CanvasRenderingContext2D, p: Projectile) => {
    const maxLife = p.maxLife || 15;
    const rawProgress = 1 - (p.life / maxLife); // 0.0 to 1.0
    
    // --- NEW LOGIC: FOCUSED ROUND TRIP SWING ---
    // Sweep Range: ~144 degrees (2.5 radians) centered on aim
    const aimAngle = p.angle || 0;
    const swingArc = 2.5; 
    
    // Oscillate: 0 -> 1 -> 0
    const wave = Math.cos(rawProgress * Math.PI * 2); // 1 -> -1 -> 1
    const interp = (1 - wave) / 2; // 0 -> 1 -> 0
    
    // Start at +HalfArc, Swing to -HalfArc, Back to +HalfArc
    const startOffset = swingArc / 2;
    const dir = p.swingDirection || 1; 
    const currentRot = aimAngle + (startOffset * dir) - (interp * swingArc * dir); 
    
    // Scale Props
    const visualScale = p.radius / 110; 
    const handleLen = 85 * visualScale; 
    const headLen = 15 * visualScale;
    
    ctx.save();
    ctx.translate(p.x, p.y); 
    
    // --- LAYER 1: "Dirty Water" SWORD ENERGY (Slash Trail) ---
    // A semi-transparent, wide arc that trails behind the movement
    const velocity = Math.abs(Math.sin(rawProgress * Math.PI * 2)); // 0 at ends, 1 in middle
    
    if (velocity > 0.1) {
        ctx.save();
        
        // Rotate to current angle but account for trail lag
        const movementDir = (rawProgress < 0.5 ? -1 : 1) * dir;
        const trailLag = -0.2 * movementDir; // Trail behind
        
        ctx.rotate(currentRot + trailLag);
        
        // Draw the "Qi" Slash
        const slashRadius = p.radius * 1.2;
        ctx.beginPath();
        // Draw a pie slice / arc
        ctx.moveTo(0,0);
        ctx.arc(0, 0, slashRadius, -0.3, 0.3, false); // 35-degree width
        ctx.closePath();
        
        // Gradient for Dirty Water Slash
        const slashGrad = ctx.createRadialGradient(0, 0, slashRadius * 0.3, 0, 0, slashRadius);
        slashGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        slashGrad.addColorStop(0.5, 'rgba(148, 163, 184, 0.3)'); // Slate grey
        slashGrad.addColorStop(0.9, `rgba(203, 213, 225, ${velocity * 0.6})`); // Light grey edge
        slashGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = slashGrad;
        ctx.fill();
        
        // Add edge stroke for definition
        ctx.strokeStyle = `rgba(255, 255, 255, ${velocity * 0.4})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, slashRadius * 0.9, -0.3, 0.3);
        ctx.stroke();

        ctx.restore();
    }

    // --- ROTATE TO CURRENT ANGLE ---
    ctx.rotate(currentRot);

    // --- LAYER 2: SHADOW (Depth) ---
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 10 * visualScale;
    ctx.shadowOffsetX = 5 * visualScale;
    ctx.shadowOffsetY = 5 * visualScale;

    // --- LAYER 3: MOP GEOMETRY ---
    const handleW = 6 * visualScale;
    const clampW = 24 * visualScale;
    const clampH = 10 * visualScale;

    // A. Handle
    const handleGrad = ctx.createLinearGradient(0, -handleW/2, 0, handleW/2);
    handleGrad.addColorStop(0, '#cbd5e1');
    handleGrad.addColorStop(0.5, '#64748b');
    handleGrad.addColorStop(1, '#94a3b8');

    ctx.fillStyle = handleGrad;
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    
    ctx.beginPath();
    ctx.roundRect(-15 * visualScale, -handleW/2, handleLen + 15 * visualScale, handleW, 2 * visualScale);
    ctx.fill();
    ctx.stroke();

    // B. Clamp
    ctx.translate(handleLen, 0); 
    
    const clampGrad = ctx.createLinearGradient(0, -handleW, 0, handleW);
    clampGrad.addColorStop(0, '#fb923c');
    clampGrad.addColorStop(1, '#c2410c');
    
    ctx.fillStyle = clampGrad; 
    ctx.strokeStyle = '#9a3412';
    ctx.lineWidth = 1;
    
    ctx.beginPath();
    ctx.moveTo(0, -handleW);
    ctx.lineTo(clampH, -clampW/2);
    ctx.lineTo(clampH, clampW/2);
    ctx.lineTo(0, handleW);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    ctx.fillStyle = '#451a03';
    ctx.beginPath(); ctx.arc(4 * visualScale, -4 * visualScale, 1.5 * visualScale, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(4 * visualScale, 4 * visualScale, 1.5 * visualScale, 0, Math.PI*2); ctx.fill();

    // C. Strands & Droplets
    const movementDir = (rawProgress < 0.5 ? -1 : 1) * dir; 
    const speedFactor = velocity; 
    const lagAngle = speedFactor * 0.6 * movementDir; 

    const drawStrands = (count: number, color: string, width: number, lengthMult: number, seedOffset: number) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        for(let i=0; i<count; i++) {
            const seed = getStableRandom(p.id, i * 20 + seedOffset);
            const t = i / (count - 1); 
            
            const startY = -clampW/2 + 2 * visualScale + (clampW - 4 * visualScale) * t;
            const startX = clampH - 1; 
            
            const myLen = headLen * lengthMult * (0.9 + seed * 0.4); 
            const myLag = lagAngle * (0.8 + seed * 0.4);
            
            const vecX = Math.cos(myLag) * myLen;
            const vecY = Math.sin(myLag) * myLen;
            const endX = startX + vecX;
            const endY = startY + vecY;
            const cpX = startX + vecX * 0.4; 
            const cpY = startY + vecY * 0.4 + (myLag * 20 * visualScale); 
            
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.quadraticCurveTo(cpX, cpY, endX, endY);
            ctx.stroke();

            // NEW: Flinging Water Droplets (Fake Particles)
            // Only draw at high velocity and near tips
            if (velocity > 0.7 && Math.random() < 0.2) {
                ctx.save();
                ctx.fillStyle = 'rgba(200, 220, 255, 0.6)';
                const dropDist = Math.random() * 40 * visualScale;
                const dropX = endX + Math.cos(myLag) * dropDist;
                const dropY = endY + Math.sin(myLag) * dropDist;
                ctx.beginPath();
                ctx.arc(dropX, dropY, 2 * visualScale, 0, Math.PI*2);
                ctx.fill();
                ctx.restore();
            }
        }
    };

    // 1. Shadow Layer
    drawStrands(12, '#475569', 5 * visualScale, 1.0, 0); 
    // 2. Main Body (Dirty Grey)
    drawStrands(10, '#94a3b8', 4 * visualScale, 1.1, 100); 
    // 3. Wet/Highlight Tips
    ctx.globalAlpha = 0.8;
    drawStrands(6, '#e2e8f0', 2 * visualScale, 1.15, 200); 
    ctx.globalAlpha = 1.0;

    ctx.restore(); // End Shadow/Glow Group
    ctx.restore(); // End Transform
};
