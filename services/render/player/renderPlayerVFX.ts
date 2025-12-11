
// NEW: Golden Ascension Visual (Soft Edge Beams & Solid Hole)
export const renderNeonAscension = (ctx: CanvasRenderingContext2D, p: any, layer: 'back' | 'front') => {
    // Only render if timer active
    if (!p.customTimers['neon_casting_visual'] || p.customTimers['neon_casting_visual'] <= 0) return;
    
    const cooldown = p.customTimers['board_missile'];
    const castingFrame = 240 - cooldown; // 0 to 240
    
    if (castingFrame >= 0 && castingFrame < 100) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.globalCompositeOperation = 'lighter'; // Critical for the "Light" feel
        
        // Fade in quickly, fade out slowly
        let alpha = 1;
        if (castingFrame < 10) alpha = castingFrame / 10;
        else if (castingFrame > 70) alpha = 1 - (castingFrame - 70) / 30;
        
        const r = p.radius;
        
        // --- Geometry Definitions ---
        const yBase = 22;       // The Source (Feet level)
        const yTop = -180;      // Top of beam geometry (slightly taller to allow soft fade)
        
        const wBase = r * 1.8;  // Hole width
        // Beam widths
        const wBeamBase = wBase * 0.9;
        const wBeamTop = r * 5.0; // Outer Width at top
        const wShadowBase = 0;
        const wShadowTop = r * 2.2; // Inner shadow V

        if (layer === 'back') {
            // --- BACK LAYER: Light Source & Beams (Behind Player) ---
            
            // 1. THE HOLE (Source) - SOLID PURE COLOR
            ctx.fillStyle = `rgba(255, 255, 230, ${1.0 * alpha})`; 
            ctx.beginPath();
            ctx.ellipse(0, yBase, wBase, wBase * 0.25, 0, 0, Math.PI * 2);
            ctx.fill();

            // --- 2. LAYERED BEAMS (For Soft Edges) ---
            // Instead of one hard trapezoid, we draw two:
            // A. Outer Glow (Wider, Fades faster, Gold)
            // B. Core Beam (Narrower, White, Persists longer)

            // Define Gradient: White/Gold -> Transparent
            // Important: Gradient fades to 0 alpha BEFORE yTop to avoid hard edge
            const beamGrad = ctx.createLinearGradient(0, yBase, 0, yTop);
            beamGrad.addColorStop(0, `rgba(255, 255, 240, ${0.9 * alpha})`);
            beamGrad.addColorStop(0.6, `rgba(255, 215, 0, ${0.5 * alpha})`); // Mid Gold (Extended to 0.6)
            beamGrad.addColorStop(1, `rgba(255, 200, 0, 0)`); // Fade completely at tip

            // Helper to draw V-shape beam
            const drawBeam = (widthMult: number, shadowMult: number) => {
                const wT = wBeamTop * widthMult;
                const wS = wShadowTop * shadowMult;
                
                // Left Wing
                ctx.beginPath();
                ctx.moveTo(-wBeamBase * 0.2, yBase);
                ctx.lineTo(-wBeamBase * widthMult, yBase);
                ctx.lineTo(-wT, yTop);
                ctx.lineTo(-wS, yTop);
                ctx.fill();

                // Right Wing
                ctx.beginPath();
                ctx.moveTo(wBeamBase * 0.2, yBase);
                ctx.lineTo(wBeamBase * widthMult, yBase);
                ctx.lineTo(wT, yTop);
                ctx.lineTo(wS, yTop);
                ctx.fill();
            };

            // A. Outer Glow (Soft, Wide)
            ctx.fillStyle = beamGrad;
            ctx.globalAlpha = 0.5; // Softer
            // REDUCED SHADOW MULT to 0.3 (was 0.8) to make inner edge softer/closer to center
            drawBeam(1.2, 0.3); 

            // B. Core Beam (Sharp, Bright)
            // Slightly modified gradient for core
            const coreGrad = ctx.createLinearGradient(0, yBase, 0, yTop * 0.8); // Fades faster vertically
            coreGrad.addColorStop(0, `rgba(255, 255, 255, ${0.9 * alpha})`);
            coreGrad.addColorStop(1, `rgba(255, 255, 255, 0)`);
            
            ctx.fillStyle = coreGrad;
            ctx.globalAlpha = 1.0;
            drawBeam(0.8, 1.1); // Narrower outer, wider inner shadow (hugs body)

        } 
        else if (layer === 'front') {
            // --- FRONT LAYER: Rim Light & Particles (Over Player) ---
            
            // 4. CHIN RIM LIGHT (INTENSIFIED)
            ctx.save();
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2); 
            ctx.clip();
            
            // Draw gradient at the bottom of the face
            const rimGrad = ctx.createLinearGradient(0, r, 0, -r * 0.5);
            rimGrad.addColorStop(0, `rgba(255, 255, 240, ${1.0 * alpha})`); 
            rimGrad.addColorStop(0.3, `rgba(255, 230, 150, ${0.9 * alpha})`); 
            rimGrad.addColorStop(0.6, `rgba(255, 200, 0, ${0.5 * alpha})`); 
            rimGrad.addColorStop(1, `rgba(0, 0, 0, 0)`); 

            ctx.fillStyle = rimGrad;
            ctx.fillRect(-r, -r, r*2, r*2);
            ctx.restore();

            // 5. ASCENSION PARTICLES
            const particleCount = 15;
            ctx.fillStyle = `rgba(255, 255, 220, ${0.8 * alpha})`;
            
            for (let i = 0; i < particleCount; i++) {
                const seed = i * 13 + castingFrame;
                const particleH = Math.abs(yTop - yBase);
                const yPos = yBase - ((castingFrame * 12 + i * 40) % (particleH + 50));
                
                // Interpolate width
                const t = (yPos - yBase) / (yTop - yBase);
                const currentOuterW = wBase + (wBeamTop - wBase) * t;
                const currentInnerW = (wShadowTop) * t; 
                
                // Randomize X within beam
                let xOffset = (Math.sin(seed) * 0.5 + 0.5) * currentOuterW * (i%2===0?1:-1);
                
                // Push out if in shadow
                if (Math.abs(xOffset) < currentInnerW) {
                    xOffset = (currentInnerW + 5) * (xOffset > 0 ? 1 : -1);
                }

                const size = 2 + Math.sin(i * 32) * 2;
                ctx.beginPath();
                ctx.arc(xOffset, yPos, size, 0, Math.PI*2);
                ctx.fill();
            }
        }

        ctx.restore();
    }
};
