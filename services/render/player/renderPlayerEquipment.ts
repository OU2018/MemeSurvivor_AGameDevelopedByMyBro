
// Helper to draw the mop prop
export const renderIdleMop = (ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, scale: number, moveSpeed: number) => {
    ctx.save();
    ctx.translate(x, y);
    
    // --- SHADOW LAYER (Depth) ---
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 8 * scale;
    ctx.shadowOffsetX = 5 * scale;
    ctx.shadowOffsetY = 5 * scale;
    
    // Adjust angle slightly to "carry" the mop on the side
    const carryAngle = angle + 0.6; // Approx 35 degrees offset to the right
    ctx.rotate(carryAngle);
    
    // Mop Dimensions (Scaled)
    const handleLen = 85 * scale;
    const handleW = 6 * scale;
    const clampW = 24 * scale; 
    const clampH = 10 * scale;
    const offsetSide = 10 * scale; 
    
    ctx.translate(0, offsetSide);

    // A. Handle (Aluminum/Metal with Gradient)
    const handleGrad = ctx.createLinearGradient(0, -handleW/2, 0, handleW/2);
    handleGrad.addColorStop(0, '#cbd5e1'); // Light edge
    handleGrad.addColorStop(0.5, '#64748b'); // Dark middle
    handleGrad.addColorStop(1, '#94a3b8'); // Medium edge

    ctx.fillStyle = handleGrad; 
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1; 
    
    ctx.beginPath();
    // Handle extends slightly behind (-10)
    ctx.roundRect(-10 * scale, -handleW/2, handleLen + 10 * scale, handleW, 3 * scale);
    ctx.fill();
    ctx.stroke();
    
    // B. Clamp (Orange Industrial with Highlight)
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
    ctx.fill();
    ctx.stroke();
    
    // Bolts
    ctx.fillStyle = '#451a03';
    ctx.beginPath(); ctx.arc(4 * scale, -4 * scale, 1.5 * scale, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(4 * scale, 4 * scale, 1.5 * scale, 0, Math.PI*2); ctx.fill();
    
    // C. Strands (High Detail Layering)
    const time = Date.now() / 300;
    const movementInfluence = Math.min(1, moveSpeed / 5); 
    const sway = Math.sin(time) * (2 * scale + movementInfluence * 5 * scale);
    const strandLen = 15 * scale;
    const strandCount = 12;

    const drawStrandLayer = (color: string, width: number, lenMult: number, seedOff: number) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        
        for(let i=0; i<strandCount; i++) {
            const yOff = -clampW/2 + (2 * scale) + (i / (strandCount - 1)) * (clampW - (4 * scale));
            // Deterministic curve
            const stableSeed = Math.sin(i * 132.5 + seedOff) * (5 * scale);
            
            ctx.beginPath();
            ctx.moveTo(clampH, yOff);
            ctx.quadraticCurveTo(
                clampH + strandLen/2 * lenMult, yOff + sway * 0.5, 
                clampH + strandLen * lenMult + Math.abs(stableSeed), yOff + sway + stableSeed * 0.2
            );
            ctx.stroke();
        }
    };

    // 1. Shadow Layer
    drawStrandLayer('#475569', 4 * scale, 0.9, 0); 
    // 2. Main Body (Dirty Grey)
    drawStrandLayer('#94a3b8', 4 * scale, 1.1, 100); 
    // 3. Wet/Highlight Tips
    ctx.globalAlpha = 0.8;
    drawStrandLayer('#e2e8f0', 2 * scale, 1.15, 200); 
    ctx.globalAlpha = 1.0;

    ctx.restore(); // End Shadow Group
    ctx.restore(); // End Transform
};

// --- RENDER DRIVER SHIELD (Private Driver) ---
export const renderDriverShield = (ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, speed: number, radius: number) => {
    // Show ALWAYS if equipped (removed speed < 0.1 check)
    
    // Determine State
    const isRamming = speed > 1.5;
    const isMoving = speed > 0.1;
    const isIdle = !isMoving;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle); // Use persistent facing angle

    // 2. Windshield Geometry (Arc Strip)
    const innerRadius = radius + 5;
    const outerRadius = radius + 25;
    const arcWidth = (Math.PI / 3) * 2; // 120 degrees
    
    ctx.beginPath();
    ctx.arc(0, 0, outerRadius, -arcWidth/2, arcWidth/2);
    ctx.arc(0, 0, innerRadius, arcWidth/2, -arcWidth/2, true); // Draw inner backwards to close shape
    ctx.closePath();

    // 3. Glass Material (Gradient)
    const grad = ctx.createLinearGradient(0, -outerRadius, 0, outerRadius);
    if (isRamming) {
        // High Energy State (White Hot)
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        grad.addColorStop(0.5, 'rgba(100, 200, 255, 0.4)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0.8)');
        ctx.shadowColor = '#60a5fa';
        ctx.shadowBlur = 15;
    } else if (isIdle) {
        // Idle State (Faint Blue, barely visible)
        grad.addColorStop(0, 'rgba(200, 230, 255, 0.15)'); 
        grad.addColorStop(0.5, 'rgba(135, 206, 250, 0.05)'); 
        grad.addColorStop(1, 'rgba(100, 180, 255, 0.1)');
        ctx.shadowBlur = 0;
    } else {
        // Cruising State (Standard Glass)
        grad.addColorStop(0, 'rgba(200, 230, 255, 0.3)'); 
        grad.addColorStop(0.5, 'rgba(135, 206, 250, 0.1)'); 
        grad.addColorStop(1, 'rgba(100, 180, 255, 0.2)');
        ctx.shadowBlur = 0;
    }

    ctx.fillStyle = grad;
    ctx.fill();

    // 4. Stroke / Frame
    ctx.lineWidth = isRamming ? 3 : (isIdle ? 1 : 2);
    ctx.strokeStyle = isRamming ? '#ffffff' : (isIdle ? 'rgba(186, 230, 253, 0.2)' : 'rgba(186, 230, 253, 0.5)');
    ctx.stroke();

    // 5. Specular Highlight (The "Glint") - Constant visual cue for "Front"
    ctx.save();
    ctx.clip(); // Clip drawing to the windshield shape
    
    // Draw a diagonal shine
    ctx.fillStyle = isRamming ? 'rgba(255, 255, 255, 0.4)' : (isIdle ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)');
    ctx.beginPath();
    ctx.moveTo(outerRadius * 0.5, -outerRadius);
    ctx.lineTo(outerRadius * 0.8, -outerRadius);
    ctx.lineTo(innerRadius * 0.5, outerRadius);
    ctx.lineTo(innerRadius * 0.2, outerRadius);
    ctx.fill();
    
    ctx.restore();

    // 6. Impact / Speed Visuals (Front Bow Wave) - Only when moving fast
    if (isRamming) {
        const time = Date.now() / 100;
        const shockDist = outerRadius + 5;
        
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 + Math.sin(time) * 0.3})`;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        
        // Speed lines on sides
        ctx.beginPath();
        ctx.moveTo(shockDist, -10);
        ctx.quadraticCurveTo(shockDist + 15, -20, shockDist - 5, -30);
        ctx.moveTo(shockDist, 10);
        ctx.quadraticCurveTo(shockDist + 15, 20, shockDist - 5, 30);
        ctx.stroke();
    }

    ctx.restore();
};
