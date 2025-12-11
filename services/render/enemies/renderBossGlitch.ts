
import { Enemy } from "../../../types";
import { TextCache } from "../TextCache";

export const renderBossGlitch = (ctx: CanvasRenderingContext2D, e: Enemy) => {
    // SAFETY CHECK
    if (isNaN(e.x) || isNaN(e.y) || !e.radius || isNaN(e.radius)) return;

    const time = Date.now() / 1000;

    // --- 1. SKILL VISUALS ---
    
    // A. GRAVITY WELL (Overflow)
    if (e.customVars && e.customVars.activeSkill === 'overflow') {
        const state = e.customVars.overflowState;
        
        // 0. PRE-CAST (Charging Bar)
        if (state === 'pre_cast') {
            ctx.save();
            ctx.translate(e.x, e.y);
            
            // System Loading Bar
            const maxTime = 100;
            const progress = Math.min(1, (e.customVars.subTimer || 0) / maxTime);
            
            const barW = 120;
            const barH = 10;
            const yOffset = -e.radius - 60;
            
            // Bar Background
            ctx.fillStyle = '#1f2937';
            ctx.fillRect(-barW/2, yOffset, barW, barH);
            
            // Bar Fill (Stripped Pattern Warning)
            ctx.fillStyle = '#facc15';
            ctx.fillRect(-barW/2, yOffset, barW * progress, barH);
            
            // Text
            ctx.fillStyle = '#facc15';
            ctx.font = 'bold 12px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`LOADING OVERFLOW... ${Math.floor(progress*100)}%`, 0, yOffset - 10);
            
            // Gathering Energy Particles
            const count = 5;
            for(let i=0; i<count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = 60 + Math.random() * 40;
                const scale = Math.random() * 0.5 + 0.5;
                const px = Math.cos(angle) * dist * (1-progress); // Suck in
                const py = Math.sin(angle) * dist * (1-progress);
                
                ctx.globalAlpha = 0.5 + Math.random() * 0.5;
                ctx.fillStyle = '#facc15';
                ctx.beginPath();
                ctx.arc(px, py, 3 * scale, 0, Math.PI*2);
                ctx.fill();
            }
            
            ctx.restore();
        }

        // Red Warning Circle
        if (state === 'warning' || state === 'sucking') {
            ctx.save();
            ctx.translate(e.x, e.y);
            // Visual range is now effectively infinite, but we draw a large grid to indicate it
            const range = 2000; 
            
            // Draw a sucking vortex grid
            // Increased rotation speed significantly for dynamic feel
            const rotateSpeed = state === 'sucking' ? -time * 3 : -time * 0.5;
            
            ctx.rotate(rotateSpeed);
            
            if (state === 'warning') {
                ctx.fillStyle = 'rgba(239, 68, 68, 0.05)';
                ctx.beginPath();
                ctx.arc(0, 0, range, 0, Math.PI * 2);
                ctx.fill();
            }

            // --- EVENT HORIZON LINES (Updated) ---
            if (state === 'sucking') {
                const arms = 16;
                const maxR = 1500;
                
                // Create Gradient for lines (White/Bright at center -> Green/Faint at edge)
                const grad = ctx.createRadialGradient(0, 0, 100, 0, 0, maxR);
                grad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
                grad.addColorStop(0.3, 'rgba(74, 222, 128, 0.6)'); // Matrix Green
                grad.addColorStop(1, 'rgba(34, 197, 94, 0)');

                ctx.strokeStyle = grad;
                
                for(let i=0; i<arms; i++) {
                    const angleOffset = (i / arms) * Math.PI * 2;
                    ctx.beginPath();
                    
                    // Thicker lines near center
                    ctx.lineWidth = 1 + Math.random() * 2; 

                    for(let r=50; r<maxR; r+=20) {
                        // Logarithmic spiral
                        const flowOffset = (time * 8) % 40; // Fast flow inward visual
                        const effectiveR = r - flowOffset;
                        if (effectiveR < 50) continue;

                        const a = angleOffset + Math.log(effectiveR) * 0.8;
                        const px = Math.cos(a) * effectiveR;
                        const py = Math.sin(a) * effectiveR;
                        
                        if (r===50) ctx.moveTo(px, py);
                        else ctx.lineTo(px, py);
                    }
                    ctx.stroke();
                }
            } else {
                // Warning Phase Static Spiral
                ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
                ctx.lineWidth = 2;
                const arms = 12;
                for(let i=0; i<arms; i++) {
                    const angleOffset = (i / arms) * Math.PI * 2;
                    ctx.beginPath();
                    for(let r=0; r<1000; r+=20) {
                        const a = angleOffset + Math.log(r + 100) * 0.5;
                        const px = Math.cos(a) * r;
                        const py = Math.sin(a) * r;
                        if (r===0) ctx.moveTo(px, py);
                        else ctx.lineTo(px, py);
                    }
                    ctx.stroke();
                }
            }
            
            // Text Warning
            if (state === 'warning') {
                ctx.rotate(-rotateSpeed); // Cancel rotation for text
                ctx.fillStyle = '#ef4444';
                ctx.font = '900 48px monospace';
                ctx.textAlign = 'center';
                ctx.shadowColor = '#ef4444';
                ctx.shadowBlur = 10;
                
                // ADJUSTED POSITION: Higher up relative to dynamic radius
                const textY = -e.radius - 80; 
                
                ctx.fillText("⚠ GLOBAL OVERFLOW ⚠", 0, textY - 50);
                
                // Countdown
                const timeLeft = Math.max(0, 3 - Math.floor((e.customVars.subTimer||0) / 60));
                ctx.font = '900 64px monospace';
                ctx.fillStyle = '#facc15';
                ctx.fillText(`${timeLeft}`, 0, textY + 20);
                
                ctx.font = 'bold 24px monospace';
                ctx.fillStyle = '#ef4444';
                ctx.fillText("寻找掩体!", 0, textY + 60);
            }
            
            ctx.restore();
        }

        // Suction Particles (Reverse explosion) & Ripple Waves
        if (state === 'sucking') {
            // Ripple Waves
            const waveR = e.customVars?.visualWaveRadius || 0;
            if (waveR > 50) {
                ctx.save();
                ctx.translate(e.x, e.y);
                ctx.beginPath();
                ctx.arc(0, 0, waveR, 0, Math.PI * 2);
                // Thicker further out
                ctx.lineWidth = 6 + (waveR / 150); 
                // Fade near center
                ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(0.8, waveR / 600)})`; 
                ctx.shadowBlur = 15;
                ctx.shadowColor = 'white';
                ctx.stroke();
                
                // Secondary faint ring
                ctx.beginPath();
                ctx.arc(0, 0, waveR + 20, 0, Math.PI * 2);
                ctx.lineWidth = 2;
                ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(0.3, waveR / 600)})`; 
                ctx.stroke();
                
                ctx.restore();
            }

            // NEW: LINEAR FORCEFUL SUCKING EFFECT
            ctx.save();
            ctx.translate(e.x, e.y);
            
            const particleCount = 40; // High count for density
            const timeVal = Date.now() / 1000;
            const chars = ["0", "1", "ERR", "NULL", "NaN", "undefined", "{ }"];
            
            ctx.shadowBlur = 0;
            
            // Generate deterministic particles based on time window
            // We spawn particles in "waves" based on time
            for (let i = 0; i < particleCount; i++) {
                // Use a large prime number for seeding offsets
                const offset = i * 2137; 
                
                // Cycle speed: 1.0s to travel from edge to center
                const cycleDuration = 1.0 + (i % 3) * 0.3; // 1.0s - 1.6s variance
                
                // Calculate current progress T (0 at start, 1 at finish)
                // We want T to go 0 -> 1 over time
                const rawT = ((timeVal + offset) % cycleDuration) / cycleDuration;
                
                // T = 0 means just spawned at edge (Far)
                // T = 1 means arrived at center (Close)
                // We want to simulate acceleration: Distance = MaxDist * (1 - T^2)
                // This makes it slow at edge (T=0), fast at center (T=1)
                
                const t = rawT * rawT * rawT; // Cubic acceleration
                
                const maxDist = 1200;
                const dist = maxDist * (1 - t);
                
                // Angle: Mostly radial, slight swirl
                const baseAngle = (i * 360 / particleCount) * (Math.PI / 180);
                const swirl = t * 2.0; // Twist as it gets closer
                const angle = baseAngle + swirl + timeVal * 0.5;
                
                const px = Math.cos(angle) * dist;
                const py = Math.sin(angle) * dist;
                
                // Don't draw if too close (absorbed)
                if (dist < 20) continue;

                // Visual attributes
                const size = 10 + (1-t) * 20; // Larger at edge, smaller at center
                const alpha = Math.min(1, t * 2); // Fade in at edge
                
                // Color shift: Green -> White at center
                const greenComp = Math.floor(255 * (1-t));
                const color = `rgba(${greenComp}, 255, ${greenComp}, ${alpha})`;
                
                ctx.save();
                ctx.translate(px, py);
                
                // Rotate to face center
                ctx.rotate(angle + Math.PI); 
                
                // Stretch effect based on speed (closer = faster = longer)
                const stretch = 1 + t * 3;
                ctx.scale(stretch, 1);

                ctx.font = `bold ${Math.floor(size)}px monospace`;
                ctx.fillStyle = color;
                
                // Draw char or block
                if (i % 3 === 0) {
                    // Code Char
                    ctx.fillText(chars[i % chars.length], 0, 0);
                } else {
                    // Digital Streak
                    ctx.fillRect(0, -2, size * 2, 4);
                }
                
                ctx.restore();
            }
            ctx.restore();
        }
    }

    // B. DASH WARNING (Aiming Line - Sine Wave)
    if (e.customVars && e.customVars.activeSkill === 'underflow') {
        const state = e.customVars.dashState;
        
        if (state === 'aiming' || state === 'locking') {
            const angle = e.customVars.dashAngle || 0;
            const dist = 2000; // Longer visual
            
            ctx.save();
            ctx.translate(e.x, e.y);
            ctx.rotate(angle); // Rotate context to face aim direction
            
            // Draw Sine Wave Warning Path
            ctx.beginPath();
            ctx.moveTo(0, 0);
            
            const amplitude = 120; // Width of the wave visual
            const frequency = 0.01;
            const scroll = -Date.now() / 15; // Faster scroll
            
            for (let x = 0; x < dist; x += 20) {
                const y = Math.sin(x * frequency + scroll) * amplitude * Math.min(1, x / 200); 
                ctx.lineTo(x, y);
            }
            
            // Warning Colors - THICKER AND GLOWING
            if (state === 'locking') {
                ctx.strokeStyle = '#ef4444'; // Bright Red
                ctx.lineWidth = 12; // Much Thicker
                ctx.shadowBlur = 20;
                ctx.shadowColor = '#ef4444';
                ctx.globalAlpha = 0.8 + Math.sin(Date.now() / 50) * 0.2; // Fast Strobe
            } else {
                ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
                ctx.lineWidth = 6; // Thicker base
                ctx.setLineDash([30, 20]);
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#ef4444';
            }
            
            ctx.stroke();
            
            // Inner Core Line (for contrast)
            if (state === 'locking') {
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.shadowBlur = 0;
                ctx.setLineDash([]);
                ctx.stroke();
            }

            ctx.restore();
        }
    }

    // D. UNDERFLOW RED RING HIGHLIGHT
    if (e.customVars && e.customVars.activeSkill === 'underflow') {
        ctx.save();
        ctx.translate(e.x, e.y);
        
        ctx.beginPath();
        ctx.arc(0, 0, e.radius + 25, 0, Math.PI * 2); // Larger ring
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 6;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ef4444';
        ctx.stroke();
        
        // Inner spinning ring
        ctx.rotate(time * 5);
        ctx.beginPath();
        ctx.arc(0, 0, e.radius + 10, 0, Math.PI * 1.5);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.restore();
    }

    // --- 2. MATRIX AURA (Green Binary Rain) ---
    ctx.save();
    ctx.translate(e.x, e.y);
    
    // Outer Ring
    ctx.rotate(time * 0.1);
    ctx.font = '14px monospace';
    ctx.fillStyle = '#22c55e'; // Green-500
    ctx.globalAlpha = 0.6;
    
    const chars = "01";
    const radius = Math.max(50, e.radius + 30); // Dynamic aura size
    const count = 16;
    
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const yOffset = (Math.sin(time * 2 + i) * 20);
        
        ctx.save();
        ctx.translate(x, y + yOffset);
        ctx.rotate(angle + Math.PI/2);
        ctx.fillText(chars[i % 2], 0, 0);
        ctx.restore();
    }
    
    // Inner Ring
    ctx.rotate(-time * 0.3);
    const innerRadius = Math.max(30, e.radius); 
    const innerCount = 10;
    ctx.fillStyle = '#4ade80'; 
    
    for (let i = 0; i < innerCount; i++) {
        const angle = (i / innerCount) * Math.PI * 2;
        const x = Math.cos(angle) * innerRadius;
        const y = Math.sin(angle) * innerRadius;
        const yOffset = (Math.cos(time * 3 + i) * 10);
        
        ctx.save();
        ctx.translate(x, y + yOffset);
        ctx.rotate(angle + Math.PI/2);
        ctx.fillText(Math.random() > 0.5 ? "1" : "0", 0, 0);
        ctx.restore();
    }
    ctx.restore();

    // --- 3. OPTIMIZED BODY RENDER ---
    const baseRenderRadius = 100;
    const renderScale = e.radius / baseRenderRadius; 
    
    if (!e.isUnstable) {
        ctx.save();
        ctx.translate(e.x, e.y);
        ctx.scale(renderScale, renderScale);
        
        const texture = TextCache.getTexture(e.emoji, baseRenderRadius * 2, 'white');
        ctx.drawImage(texture, -baseRenderRadius, -baseRenderRadius, baseRenderRadius * 2, baseRenderRadius * 2);
        
        ctx.restore();
    }

    // --- 4. SMALL HIGHLIGHT (Target Reticle when Tiny) ---
    // If radius is small (< 40), draw a bright bracket around it so player can see it
    if (e.radius < 40 && !e.isUnstable) {
        ctx.save();
        ctx.translate(e.x, e.y);
        ctx.rotate(-time * 4); // Spin fast
        
        ctx.strokeStyle = '#22d3ee'; // Cyan bright
        ctx.lineWidth = 3;
        ctx.shadowColor = '#22d3ee';
        ctx.shadowBlur = 15;
        
        const size = 60;
        const gap = 15;
        
        // Draw brackets [ ]
        ctx.beginPath();
        ctx.moveTo(-size/2 + gap, -size/2);
        ctx.lineTo(-size/2, -size/2);
        ctx.lineTo(-size/2, size/2);
        ctx.lineTo(-size/2 + gap, size/2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(size/2 - gap, -size/2);
        ctx.lineTo(size/2, -size/2);
        ctx.lineTo(size/2, size/2);
        ctx.lineTo(size/2 - gap, size/2);
        ctx.stroke();
        
        ctx.restore();
    }

    // --- 5. UNSTABLE EFFECT ---
    if (e.isUnstable) {
        const texture = TextCache.getTexture(e.emoji, baseRenderRadius * 2, 'rgba(255,255,255,0.8)');
        const size = baseRenderRadius * 2;
        const sliceH = size / 3;
        
        const t = Date.now() / 200;
        const offsetMag = 40; 
        
        const offset1 = Math.sin(t) * offsetMag + (Math.random() - 0.5) * 10;
        const offset2 = Math.sin(t + 2) * offsetMag + (Math.random() - 0.5) * 10;
        const offset3 = Math.sin(t + 4) * offsetMag + (Math.random() - 0.5) * 10;

        ctx.save();
        ctx.translate(e.x, e.y);
        ctx.scale(renderScale, renderScale);
        
        // 1. Top Slice
        ctx.save();
        ctx.translate(-baseRenderRadius + offset1, -baseRenderRadius);
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = 'rgba(255, 50, 50, 0.7)';
        ctx.drawImage(texture, 0, 0, size, sliceH, 0, 0, size, sliceH);
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillRect(0, 0, size, sliceH);
        ctx.restore();

        // 2. Middle Slice
        ctx.save();
        ctx.translate(-baseRenderRadius + offset2, -baseRenderRadius + sliceH);
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = 'rgba(50, 255, 50, 0.7)';
        ctx.drawImage(texture, 0, sliceH, size, sliceH, 0, 0, size, sliceH);
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillRect(0, 0, size, sliceH);
        ctx.restore();

        // 3. Bottom Slice
        ctx.save();
        ctx.translate(-baseRenderRadius + offset3, -baseRenderRadius + sliceH * 2);
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = 'rgba(50, 50, 255, 0.7)';
        ctx.drawImage(texture, 0, sliceH * 2, size, sliceH, 0, 0, size, sliceH);
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillRect(0, 0, size, sliceH);
        ctx.restore();
        
        ctx.restore();
        
        // Label
        ctx.save();
        ctx.translate(e.x, e.y - e.radius - 60);
        ctx.fillStyle = '#ffffff'; 
        ctx.font = '900 28px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'black';
        ctx.shadowBlur = 0;
        const label = "🚫 不可选中 🚫";
        const tx = (Math.random() - 0.5) * 4;
        const ty = (Math.random() - 0.5) * 4;
        ctx.fillText(label, tx, ty);
        ctx.restore();
    }
};
