
const drawRunes = (ctx: CanvasRenderingContext2D, radius: number, time: number) => {
    const count = 12;
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + time * 0.5;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle + Math.PI / 2);
        
        ctx.fillStyle = '#D4AF37'; // Metallic Gold
        ctx.globalAlpha = 0.8;
        // Simple rune shape (diamond-ish)
        ctx.beginPath();
        ctx.moveTo(0, -4);
        ctx.lineTo(3, 0);
        ctx.lineTo(0, 4);
        ctx.lineTo(-3, 0);
        ctx.fill();
        
        ctx.restore();
    }
};

export const renderSynergyAuras = (ctx: CanvasRenderingContext2D, p: any, activeTiers: Record<string, number>) => {
    const time = Date.now() / 1000;
    
    // We stack auras in concentric circles so they don't overlap messy
    let currentRadius = p.radius + 20;
    const spacing = 15;

    // --- BOARD (Base Layer - The Void) ---
    // Rendered FIRST to be under everything
    if (activeTiers['board'] >= 2) {
        ctx.save();
        ctx.translate(p.x, p.y);
        
        const voidRadius = p.radius + 70; // Large area to encompass most auras
        
        // Dark Void Gradient
        const grad = ctx.createRadialGradient(0, 0, p.radius, 0, 0, voidRadius);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
        grad.addColorStop(0.8, 'rgba(20, 20, 20, 0.4)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, voidRadius, 0, Math.PI * 2);
        ctx.fill();

        // Golden Runes/Border
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(0, 0, voidRadius * 0.8, 0, Math.PI * 2);
        ctx.stroke();
        
        // Rotating Runes
        drawRunes(ctx, voidRadius * 0.8, time);

        ctx.restore();
    }

    // 1. Slacker (Green Healing Aura) - Inner Layer
    if (activeTiers['slacker'] >= 2) {
        ctx.save();
        ctx.translate(p.x, p.y);
        const breath = Math.sin(time * 2) * 0.05 + 1;
        
        const grad = ctx.createRadialGradient(0, 0, currentRadius * 0.5, 0, 0, currentRadius);
        grad.addColorStop(0, 'rgba(74, 222, 128, 0)');
        grad.addColorStop(0.8, 'rgba(74, 222, 128, 0.15)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = grad;
        ctx.scale(breath, breath);
        ctx.beginPath();
        ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        currentRadius += spacing;
    }

    // 2. Hardcore (Red Jagged Aura) - Middle Layer
    if (activeTiers['hardcore'] >= 2) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(time); // Spin
        const points = 12;
        const outerR = currentRadius + 5;
        const innerR = currentRadius - 2;
        
        // --- OVERCLOCK VISUAL UPGRADE ---
        if (p.isOverclocked) {
            // Intense Red + Steam
            ctx.shadowColor = '#ef4444';
            ctx.shadowBlur = 10;
            ctx.strokeStyle = '#fca5a5';
            ctx.lineWidth = 3;
        } else {
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 1.5;
        }
        
        ctx.beginPath();
        for(let i=0; i<=points * 2; i++) {
            const angle = (i / (points * 2)) * Math.PI * 2;
            const r = i % 2 === 0 ? outerR : innerR;
            ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
        }
        ctx.closePath();
        
        ctx.globalAlpha = p.isOverclocked ? 0.8 : 0.4;
        ctx.stroke();
        ctx.restore();
        
        currentRadius += spacing;
    }

    // 3. Capital (Golden Ring) - Outer Layer 1
    if (activeTiers['capital'] >= 2) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(-time * 0.5);
        
        ctx.beginPath();
        ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 10]);
        ctx.stroke();
        
        // Sparkle
        const sparkleAngle = (time * 2.5) % (Math.PI * 2);
        const sx = Math.cos(sparkleAngle) * currentRadius;
        const sy = Math.sin(sparkleAngle) * currentRadius;
        
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(sx, sy, 4, 0, Math.PI*2);
        ctx.fill();
        
        ctx.restore();
        
        currentRadius += spacing;
    }

    // 4. Tech (Blue Data Ring) - Outer Layer 2
    if (activeTiers['tech'] >= 2) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(time * 0.3);
        
        ctx.beginPath();
        ctx.arc(0, 0, currentRadius, 0, Math.PI * 1.5); // Open ring
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 5, 2, 5]); // Techy pattern
        ctx.stroke();
        
        // Data bits
        ctx.fillStyle = '#60a5fa';
        for(let i=0; i<3; i++) {
            const a = i * (Math.PI * 0.66);
            ctx.fillRect(Math.cos(a)*currentRadius - 3, Math.sin(a)*currentRadius - 3, 6, 6);
        }
        
        ctx.restore();
        currentRadius += spacing;
    }

    // 5. Market (Purple Ripples) - Outer Layer 3
    if (activeTiers['market'] >= 2) {
        ctx.save();
        ctx.translate(p.x, p.y);
        
        // Multiple expanding rings
        const waveCount = 3;
        for(let i=0; i<waveCount; i++) {
            const offset = (time * 0.5 + i / waveCount) % 1; // 0 to 1
            const r = currentRadius + offset * 30; // Expand outward
            const alpha = 1 - offset;
            
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(168, 85, 247, ${alpha * 0.6})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
        ctx.restore();
        
        currentRadius += spacing + 10; // Market takes more space
    }

    // 6. HR (Cyan Satellites) - Outer Layer 4
    if (activeTiers['hr'] >= 2) {
        ctx.save();
        ctx.translate(p.x, p.y);
        
        // FIXED: Explicit coordinate calculation instead of context rotation
        const satelliteCount = 3;
        const rotationSpeed = time * 2.0; // Faster rotation

        for(let i=0; i<satelliteCount; i++) {
            // Calculate absolute position
            const angle = rotationSpeed + (i / satelliteCount) * Math.PI * 2;
            const sx = Math.cos(angle) * currentRadius;
            const sy = Math.sin(angle) * currentRadius;
            
            // Satellite Body
            ctx.fillStyle = '#22d3ee'; // Cyan-400
            ctx.shadowColor = '#22d3ee';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(sx, sy, 6, 0, Math.PI*2); // Slightly larger
            ctx.fill();
            ctx.shadowBlur = 0; // Reset shadow
            
            // Trail (Arc segment following the satellite)
            ctx.beginPath();
            // Draw arc from [angle - trail_len] to [angle]
            ctx.arc(0, 0, currentRadius, angle - 0.5, angle);
            ctx.strokeStyle = 'rgba(34, 211, 238, 0.5)';
            ctx.lineWidth = 3;
            ctx.setLineDash([]);
            ctx.stroke();
        }
        ctx.restore();
        currentRadius += spacing;
    }

    // --- BOARD (L6 Crown) ---
    // Rendered LAST to be on top of player head
    if (activeTiers['board'] >= 6) {
        const floatY = Math.sin(time * 3) * 5;
        const crownY = p.y - p.radius - 40 + floatY;
        
        ctx.save();
        ctx.translate(p.x, crownY);
        
        // Gold Crown Path
        ctx.fillStyle = '#facc15'; // Gold
        ctx.strokeStyle = '#a16207'; // Dark Gold border
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        ctx.moveTo(-15, 0); // Bottom Left
        ctx.lineTo(-20, -15); // Left Tip
        ctx.lineTo(-10, -5); // Left Dip
        ctx.lineTo(0, -25);   // Center Tip (High)
        ctx.lineTo(10, -5);  // Right Dip
        ctx.lineTo(20, -15);  // Right Tip
        ctx.lineTo(15, 0);   // Bottom Right
        ctx.closePath();
        
        ctx.fill();
        ctx.stroke();
        
        // Jewels
        ctx.fillStyle = '#ef4444'; // Red Jewel
        ctx.beginPath(); ctx.arc(0, -10, 3, 0, Math.PI*2); ctx.fill();
        
        ctx.restore();
    }
};
