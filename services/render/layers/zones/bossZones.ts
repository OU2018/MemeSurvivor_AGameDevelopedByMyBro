
import { Zone } from "../../../../types";
import { ViewBounds } from "../../renderConfig";

export const renderBossZones = (ctx: CanvasRenderingContext2D, z: Zone, bounds: ViewBounds) => {
    // --- MEMORY LEAK (Green Matrix Pool) ---
    if (z.type === 'glitch_memory_leak') {
        const time = Date.now() / 1000;
        
        ctx.save();
        ctx.translate(z.x, z.y);
        
        // 1. Dark Base
        ctx.fillStyle = 'rgba(20, 40, 20, 0.8)';
        ctx.beginPath();
        ctx.arc(0, 0, z.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // 2. Matrix Rings (Rotating)
        ctx.globalCompositeOperation = 'lighter';
        
        // Ring 1
        ctx.rotate(time);
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 20]);
        ctx.beginPath();
        ctx.arc(0, 0, z.radius * 0.9, 0, Math.PI * 2);
        ctx.stroke();
        
        // Ring 2 (Counter)
        ctx.rotate(-time * 1.5);
        ctx.strokeStyle = '#15803d';
        ctx.setLineDash([5, 10]);
        ctx.beginPath();
        ctx.arc(0, 0, z.radius * 0.7, 0, Math.PI * 2);
        ctx.stroke();
        
        // 3. Glitch Text
        ctx.fillStyle = '#4ade80';
        ctx.font = '14px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const chars = ["0", "1", "x", "F"];
        for(let i=0; i<8; i++) {
            const angle = (i / 8) * Math.PI * 2 + time * 0.5;
            const r = z.radius * 0.5;
            const tx = Math.cos(angle) * r;
            const ty = Math.sin(angle) * r;
            
            const char = chars[Math.floor((time * 5 + i) % chars.length)];
            ctx.fillText(char, tx, ty);
        }

        // 4. Jagged Border
        ctx.rotate(0); // Reset rot for border logic relative to screen? No, local is fine.
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 3;
        ctx.setLineDash([]);
        ctx.beginPath();
        const segments = 20;
        for(let i=0; i<=segments; i++) {
            const a = (i/segments) * Math.PI * 2;
            const jitter = Math.sin(time * 10 + i) * 5;
            const r = z.radius + jitter;
            const px = Math.cos(a) * r;
            const py = Math.sin(a) * r;
            if (i===0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();

        ctx.restore();
        return;
    }

    // --- AI BOSS: LASER LINK (CHAOTIC ELECTRIC ARC) ---
    if (z.type === 'ai_laser_link') {
        const angle = z.angle || 0;
        const length = z.width || 1000; 
        
        ctx.save();
        ctx.translate(z.x, z.y); 
        ctx.rotate(angle);
        
        ctx.globalCompositeOperation = 'lighter';
        
        // Base segments for the main structure
        const segments = Math.max(3, Math.floor(length / 60)); 
        const segmentLen = length / segments;
        
        // 1. PURPLE ARC GLOW (Outer Energy) - UPDATED COLOR & WIDTH
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#a855f7'; // Purple glow
        ctx.strokeStyle = '#9333ea'; // Darker purple core structure
        ctx.lineWidth = 6; // Thicker line
        
        ctx.beginPath();
        ctx.moveTo(-length/2, 0);
        
        for (let i = 1; i < segments; i++) {
            const x = -length/2 + i * segmentLen;
            const jitter = (Math.random() - 0.5) * 30; 
            ctx.lineTo(x, jitter);
        }
        ctx.lineTo(length/2, 0);
        ctx.stroke();
        
        // 2. GREEN DATA SURGE (Core Flow) - NEW VISUAL
        if (!bounds.isLowQuality) {
            const time = Date.now();
            ctx.shadowColor = '#4ade80'; // Matrix Green Glow
            ctx.shadowBlur = 10;
            ctx.strokeStyle = '#22c55e'; // Bright Green Core
            ctx.lineWidth = 3;
            
            // Moving dash pattern
            ctx.setLineDash([30, 40]); // Long dash, long gap
            ctx.lineDashOffset = -time / 8; // Fast flow
            
            ctx.beginPath();
            ctx.moveTo(-length/2, 0);
            
            // Draw a straighter, but still slightly jittery line for data
            for (let i = 1; i < segments; i++) {
                const x = -length/2 + i * segmentLen;
                const jitter = (Math.sin(i + time/100) * 10); 
                ctx.lineTo(x, jitter);
            }
            ctx.lineTo(length/2, 0);
            ctx.stroke();
        }

        ctx.restore();
        return;
    }

    // --- GLITCH SQUARE (Defrag Reticle) - HUD STYLE ---
    if (z.type === 'glitch_square') {
        const maxLife = z.maxLife || 90;
        const life = z.life;
        const explosionTime = 20; // frames
        
        // Is it in aiming/locking phase?
        const isAiming = life > explosionTime;
        
        const size = z.width || 120;
        const halfSize = size / 2;
        
        ctx.save();
        ctx.translate(z.x, z.y);
        
        if (isAiming) {
            // Shrinking animation
            const aimProgress = (maxLife - life) / (maxLife - explosionTime); // 0 -> 1
            const shrinkScale = 1.8 - aimProgress * 0.8; // 1.8 -> 1.0
            const currentSize = size * shrinkScale;
            const currentHalf = currentSize / 2;
            
            const isFinalLock = life < explosionTime + 10; 
            const color = z.color || '#a855f7';
            const activeColor = isFinalLock ? '#ffffff' : color; 

            // 1. Inner Target Area (Static Scanline)
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.1;
            ctx.fillRect(-halfSize, -halfSize, size, size);
            
            // Scanline
            ctx.globalAlpha = 0.3;
            const scanY = -halfSize + (Date.now() % 1000 / 1000) * size;
            ctx.fillRect(-halfSize, scanY, size, 4);

            // 2. Outer Shrinking Brackets
            ctx.globalAlpha = 0.9;
            ctx.lineWidth = 3;
            ctx.strokeStyle = activeColor;
            
            // Corner Brackets
            const bracketLen = currentSize * 0.25;
            ctx.beginPath();
            // TL
            ctx.moveTo(-currentHalf, -currentHalf + bracketLen); ctx.lineTo(-currentHalf, -currentHalf); ctx.lineTo(-currentHalf + bracketLen, -currentHalf);
            // TR
            ctx.moveTo(currentHalf - bracketLen, -currentHalf); ctx.lineTo(currentHalf, -currentHalf); ctx.lineTo(currentHalf, -currentHalf + bracketLen);
            // BR
            ctx.moveTo(currentHalf, currentHalf - bracketLen); ctx.lineTo(currentHalf, currentHalf); ctx.lineTo(currentHalf - bracketLen, currentHalf);
            // BL
            ctx.moveTo(-currentHalf + bracketLen, currentHalf); ctx.lineTo(-currentHalf, currentHalf); ctx.lineTo(-currentHalf, currentHalf - bracketLen);
            ctx.stroke();
            
            // 3. HUD Text
            ctx.font = 'bold 10px monospace';
            ctx.fillStyle = activeColor;
            ctx.textAlign = 'center';
            if (isFinalLock) {
                ctx.fillText("LOCKING...", 0, -currentHalf - 5);
            } else {
                const dist = Math.floor(currentSize);
                ctx.fillText(`DIST: ${dist}`, 0, -currentHalf - 5);
            }

        } else {
            // EXPLOSION PHASE
            ctx.fillStyle = z.color || '#ef4444'; 
            ctx.fillRect(-halfSize, -halfSize, size, size);
            
            // Pixel debris visual
            ctx.fillStyle = '#000000';
            for(let i=0; i<5; i++) {
                const rx = (Math.random()-0.5) * size;
                const ry = (Math.random()-0.5) * size;
                const s = 10 + Math.random() * 20;
                ctx.fillRect(rx, ry, s, s);
            }
        }
        
        ctx.restore();
        return;
    }

    if (z.type === 'glitch_bsod_wall') {
        const w = z.width || 100;
        const h = z.height || 60;
        
        ctx.save();
        ctx.translate(z.x, z.y);
        
        if (z.angle !== undefined) {
            ctx.rotate(z.angle);
        } else {
            const isVertical = h > w;
            if (isVertical) {
                ctx.rotate(Math.PI / 2); 
            }
        }

        const drawW = z.angle !== undefined ? w : (h > w ? h : w);
        const drawH = z.angle !== undefined ? h : (h > w ? w : h);

        ctx.strokeStyle = '#f97316'; 
        ctx.lineWidth = 4; 
        ctx.globalAlpha = 0.95;
        
        ctx.fillStyle = 'rgba(67, 20, 7, 0.95)'; 
        ctx.fillRect(-drawW/2, -drawH/2, drawW, drawH);
        
        ctx.save();
        ctx.beginPath();
        ctx.rect(-drawW/2, -drawH/2, drawW, drawH);
        ctx.clip();
        
        const gridSize = 20;
        ctx.strokeStyle = 'rgba(251, 146, 60, 0.5)'; 
        ctx.lineWidth = 1;
        
        const offset = (Date.now() / 50) % gridSize;
        
        for(let gx = -drawW/2; gx <= drawW/2; gx += gridSize) {
            ctx.moveTo(gx, -drawH/2); ctx.lineTo(gx, drawH/2);
        }
        for(let gy = -drawH/2 + offset; gy <= drawH/2; gy += gridSize) {
            ctx.moveTo(-drawW/2, gy); ctx.lineTo(drawW/2, gy);
        }
        ctx.stroke();
        ctx.restore();
        
        ctx.save();
        
        const textStr = "禁止通行";
        ctx.font = '900 20px "Noto Sans SC", sans-serif'; 
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const alpha = 0.5 + Math.sin(Date.now() / 150) * 0.5;
        ctx.fillStyle = `rgba(255, 50, 50, ${0.8 + alpha * 0.2})`; 
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 10;

        let normAngle = (z.angle || 0) % (Math.PI * 2);
        if (normAngle < 0) normAngle += Math.PI * 2;

        const isVerticalOnScreen = Math.abs(Math.sin(normAngle)) > 0.707; 

        if (isVerticalOnScreen) {
            const step = 20; 
            const totalLen = step * textStr.length;
            const startX = -totalLen / 2 + step / 2;
            
            for (let i = 0; i < textStr.length; i++) {
                ctx.save();
                ctx.translate(startX + i * step, 0);
                ctx.rotate(-(z.angle || 0)); 
                ctx.fillText(textStr[i], 0, 0);
                ctx.restore();
            }
        } else {
            if (Math.cos(normAngle) < 0) {
                ctx.save();
                ctx.rotate(Math.PI);
                ctx.fillText(textStr, 0, 0);
                ctx.restore();
            } else {
                ctx.fillText(textStr, 0, 0);
            }
        }
        
        ctx.restore();
        
        ctx.strokeStyle = '#ea580c';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#ea580c';
        ctx.shadowBlur = 15;
        ctx.strokeRect(-drawW/2, -drawH/2, drawW, drawH);
        
        ctx.restore();
        return;
    }

    if (z.type === 'glitch_lag_marker') {
        const time = Date.now();
        ctx.save();
        ctx.translate(z.x, z.y);
        const pulse = 1 + Math.sin(time / 200) * 0.1;
        ctx.scale(pulse, pulse);
        const chars = "010101ERROR!BUG!";
        const count = 12;
        const radius = 35;
        ctx.font = 'bold 12px monospace';
        ctx.fillStyle = '#00ff00';
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#00ff00';
        ctx.rotate(time / 1000); 
        for(let i=0; i<count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const char = chars[(i + Math.floor(time/200)) % chars.length];
            ctx.save();
            ctx.rotate(angle);
            ctx.translate(0, -radius);
            ctx.fillText(char, 0, 0);
            ctx.restore();
        }
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        const secondsLeft = (z.life / 60).toFixed(1);
        ctx.save();
        ctx.translate(z.x, z.y - 70); 
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 24px monospace';
        ctx.textAlign = 'center';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 4;
        ctx.strokeText(`⏳ 回溯倒计时: ${secondsLeft}`, 0, 0);
        ctx.fillText(`⏳ 回溯倒计时: ${secondsLeft}`, 0, 0);
        ctx.restore();
        return;
    }

    if (z.type === 'explosion_gap') {
        const maxLife = z.maxLife || 90;
        const progress = 1 - (z.life / maxLife);
        const gapAngle = z.gapAngle || 0;
        const gapWidth = Math.PI / 3; 
        ctx.save();
        ctx.translate(z.x, z.y);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.beginPath();
        ctx.moveTo(0,0);
        ctx.arc(0, 0, z.radius, gapAngle + gapWidth/2, gapAngle - gapWidth/2);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);
        ctx.stroke();
        ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
        ctx.beginPath();
        ctx.moveTo(0,0);
        ctx.arc(0, 0, z.radius, gapAngle - gapWidth/2, gapAngle + gapWidth/2);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(239, 68, 68, 0.6)';
        ctx.beginPath();
        ctx.moveTo(0,0);
        ctx.arc(0, 0, z.radius * progress, gapAngle + gapWidth/2, gapAngle - gapWidth/2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        return;
    }

    if (z.type === 'kpi_doom_expansion') {
        const maxLife = z.maxLife || 180;
        const progress = 1 - (z.life / maxLife); 
        const maxRadius = 5000; 
        const currentRadius = maxRadius * progress;
        ctx.save();
        ctx.translate(z.x, z.y);
        ctx.fillStyle = 'rgba(50, 0, 0, 0.7)';
        ctx.beginPath();
        ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 10;
        ctx.setLineDash([50, 50]);
        ctx.stroke();
        ctx.restore();
        return;
    }

    if (z.type === 'laser_beam') {
        const angle = z.angle || 0;
        const width = z.width || 60; 
        const length = 5000; 
        const fireTime = 60;
        const isCharging = z.life > fireTime; 
        
        ctx.save();
        ctx.translate(z.x, z.y);
        ctx.rotate(angle);
        
        if (isCharging) {
            const flicker = Math.random() * 0.3 + 0.3;
            ctx.strokeStyle = `rgba(239, 68, 68, ${flicker})`;
            ctx.lineWidth = 2;
            ctx.setLineDash([20, 10]);
            ctx.beginPath();
            ctx.moveTo(-length/2, 0);
            ctx.lineTo(length/2, 0);
            ctx.stroke();
            
            ctx.strokeStyle = `rgba(255, 100, 100, ${flicker * 0.5})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(-length/2, -width/2);
            ctx.lineTo(length/2, -width/2);
            ctx.moveTo(-length/2, width/2);
            ctx.lineTo(length/2, width/2);
            ctx.stroke();
            ctx.setLineDash([]);
        } 
        else {
            ctx.globalCompositeOperation = 'lighter';
            const flicker = 0.8 + Math.random() * 0.2;
            const grad = ctx.createLinearGradient(0, -width, 0, width);
            grad.addColorStop(0, 'rgba(255, 0, 0, 0)');
            grad.addColorStop(0.3, `rgba(255, 0, 0, ${flicker * 0.6})`);
            grad.addColorStop(0.7, `rgba(255, 0, 0, ${flicker * 0.6})`);
            grad.addColorStop(1, 'rgba(255, 0, 0, 0)');
            
            ctx.fillStyle = grad;
            ctx.fillRect(-length/2, -width, length, width * 2);
            ctx.fillStyle = `rgba(255, 255, 200, ${flicker})`;
            ctx.fillRect(-length/2, -width * 0.2, length, width * 0.4);
            
            if (!bounds.isLowQuality) {
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-length/2, 0);
                const segments = 20;
                const step = length / segments;
                for(let i=0; i<segments; i++) {
                    const yOff = (Math.random() - 0.5) * width;
                    ctx.lineTo(-length/2 + i * step, yOff);
                }
                ctx.stroke();
            }
        }
        ctx.restore();
        return;
    }
};
