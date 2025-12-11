
import { GameState } from "../../../types";

// --- HELPERS ---
const seededRandom = (seed: number) => {
    const x = Math.sin(seed * 12.9898) * 43758.5453;
    return x - Math.floor(x);
};

// Draw Text with RGB Split (Chromatic Aberration)
const drawRGBText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, offset: number, fontSize: number = 40) => {
    ctx.save();
    ctx.font = `900 ${fontSize}px "Noto Sans SC", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Red Channel
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = '#ff0000';
    ctx.fillText(text, x - offset, y);

    // Blue Channel
    ctx.fillStyle = '#00ffff';
    ctx.fillText(text, x + offset, y);

    // White Core
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, x, y);
    
    ctx.restore();
};

const drawGlitchBlock = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    const count = 10;
    ctx.fillStyle = Math.random() > 0.5 ? '#ff00ff' : '#00ffff';
    for(let i=0; i<count; i++) {
        if(Math.random() > 0.3) continue;
        const x = Math.random() * width;
        const y = Math.random() * height;
        const w = Math.random() * 200;
        const h = 2 + Math.random() * 10;
        ctx.fillRect(x, y, w, h);
    }
};

export const renderReviveAnim = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    state: GameState
) => {
    const { timer, phase, lostGold } = state.reviveSequence;
    const centerX = width / 2;
    const centerY = height / 2;
    const time = Date.now();

    // --- PHASE 1: SYSTEM FREEZE (Fatal Error) ---
    // Flash Red, Screen Shake
    let shakeX = 0;
    let shakeY = 0;

    if (phase === 'start') {
        const t = timer / 20;
        
        // Background Tint (Red Error)
        ctx.fillStyle = `rgba(50, 0, 0, ${0.5 * t})`;
        ctx.fillRect(0, 0, width, height);

        // Shake
        shakeX = (Math.random() - 0.5) * 20 * (1-t);
        shakeY = (Math.random() - 0.5) * 20 * (1-t);
        
        ctx.save();
        ctx.translate(shakeX, shakeY);
        if (timer % 2 === 0) {
            drawRGBText(ctx, "FATAL ERROR", centerX, centerY, 5, 80);
        }
        ctx.restore();
        return;
    }

    // --- CONSTANT GLITCH SHAKE FOR LATER PHASES ---
    if (phase === 'coin_enter') {
        shakeX = (Math.random() - 0.5) * 3;
        shakeY = (Math.random() - 0.5) * 3;
    }

    ctx.save();
    ctx.translate(shakeX, shakeY);

    // --- BACKGROUND: THE VOID / TERMINAL ---
    ctx.fillStyle = 'rgba(0, 0, 0, 0.92)'; // Almost black
    ctx.fillRect(0, 0, width, height);

    // --- PHASE 2: INJECTION (The Singularity) ---
    if (phase === 'coin_enter') {
        
        // 1. Terminal Logs (Scrolling)
        ctx.font = '14px monospace';
        ctx.fillStyle = '#00ff00';
        ctx.textAlign = 'left';
        
        const logs = [
            "> DETECTING LIFE SIGNS... 0%",
            "> CHECKING ASSETS... FOUND " + lostGold + " GOLD",
            "> INITIATING ILLEGAL OVERRIDE...",
            "> BYPASSING DEATH PROTOCOLS...",
            "> INJECTING FUNDS...",
            "> CORRUPTING SYSTEM LOGS...",
            "> REWRITING SOUL_DATA...",
            "> PENDING CONFIRMATION..."
        ];
        
        const lineH = 20;
        const startY = centerY + 150;
        const visibleLines = Math.floor(timer / 5); // Reveal speed
        
        for(let i=0; i<logs.length; i++) {
            if (i < visibleLines) {
                const alpha = Math.max(0, 1 - (logs.length - i) * 0.1 + (timer/200)); 
                ctx.globalAlpha = Math.min(1, alpha);
                ctx.fillText(logs[i], centerX - 200, startY + i * lineH);
            }
        }
        ctx.globalAlpha = 1;

        // 2. The Glitch Singularity (Rotating Wireframe Cube / Core)
        ctx.save();
        ctx.translate(centerX, centerY);
        const scale = 1 + timer / 100; // Growing
        ctx.scale(scale, scale);
        
        // Rotation
        ctx.rotate(timer * 0.1);
        
        // Draw Core Geometry (Abstract)
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        const r = 50;
        ctx.beginPath();
        // Simple rotating square
        ctx.rect(-r, -r, r*2, r*2);
        ctx.stroke();
        
        // Offset square (Cyan/Magenta Split)
        ctx.save();
        ctx.rotate(Math.PI/4);
        ctx.strokeStyle = '#ff00ff';
        ctx.beginPath();
        ctx.rect(-r*0.8, -r*0.8, r*1.6, r*1.6);
        ctx.stroke();
        ctx.restore();

        // Connecting lines (The Web)
        if (timer > 20) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.beginPath();
            for(let i=0; i<4; i++) {
                ctx.moveTo(0,0);
                const a = (i/4)*Math.PI*2 + timer*0.05;
                ctx.lineTo(Math.cos(a)*r*2, Math.sin(a)*r*2);
            }
            ctx.stroke();
        }
        ctx.restore();

        // 3. DATA TORRENT (Draining Gold)
        // Draw streams from top-left (UI) to center
        if (timer < 100) {
            const startX = 200 - centerX; // Relative to center translation
            const startY = 80 - centerY;  
            
            ctx.save();
            ctx.translate(centerX, centerY);
            
            const pCount = 20;
            for(let i=0; i<pCount; i++) {
                const t = ((time / 300) + (i / pCount)) % 1; 
                const px = startX * (1 - t);
                const py = startY * (1 - t);
                
                ctx.fillStyle = i % 2 === 0 ? '#ffff00' : '#00ff00'; // Gold & Code
                // Draw Binary or Block
                const size = 3 + t * 5;
                if (Math.random() > 0.5) {
                    ctx.fillText(Math.random() > 0.5 ? '1' : '0', px, py);
                } else {
                    ctx.fillRect(px, py, size, size);
                }
            }
            ctx.restore();
        }

        // 4. "BUY LIFE MONEY" - GLITCH TEXT
        if (timer > 60) {
            const jitter = Math.random() * 5;
            const size = 80 + Math.sin(time/50)*5;
            
            ctx.save();
            // Flash effect (Reduced intensity)
            if (timer > 100 && timer % 10 < 3) {
                ctx.globalCompositeOperation = 'overlay';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.fillRect(centerX - 300, centerY - 100, 600, 200);
            }
            
            drawRGBText(ctx, "买命钱", centerX, centerY - 120, 3 + jitter, size);
            
            // Subtitle
            ctx.font = 'bold 24px monospace';
            ctx.fillStyle = '#ff0055';
            ctx.textAlign = 'center';
            ctx.fillText(`SYSTEM_OVERRIDE: -${lostGold} GOLD`, centerX, centerY - 60);
            
            ctx.restore();
        }
        
        // Random Glitch Blocks overlay
        if (Math.random() > 0.7) {
            ctx.globalCompositeOperation = 'difference';
            drawGlitchBlock(ctx, width, height, time);
            ctx.globalCompositeOperation = 'source-over';
        }
    }

    // --- PHASE 3: HARD REBOOT (Digital Scanline Sweep) ---
    // Replaced full whiteout with a cool scanline effect
    if (phase === 'shatter') {
        const t = timer / 60; // 0 to 1
        
        // Scanline sweep position (Top to Bottom)
        const scanY = height * (timer / 40); // 40 frames to sweep
        
        if (timer < 40) {
            // 1. The Beam
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 20;
            ctx.fillStyle = '#00ffff';
            ctx.fillRect(0, scanY, width, 4);
            ctx.shadowBlur = 0;

            // 2. Digital Inversion Band (The Glitch)
            ctx.save();
            ctx.globalCompositeOperation = 'difference';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            // A band around the scanline
            ctx.fillRect(0, scanY - 20, width, 40);
            ctx.restore();
        }

        // 3. Vignette Flash (Subtle Edge Glow)
        const flash = Math.max(0, 1 - timer / 15);
        if (flash > 0) {
            const grad = ctx.createRadialGradient(centerX, centerY, height * 0.4, centerX, centerY, height);
            grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
            grad.addColorStop(1, `rgba(255, 255, 255, ${0.4 * flash})`);
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, width, height);
        }
        
        // 4. "SYSTEM RESTORED" Text
        if (timer < 50) {
            const scale = 1 + (1-t) * 0.5;
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.scale(scale, scale);
            drawRGBText(ctx, "REBOOT SUCCESS", 0, 0, 3 * (1-t), 60);
            ctx.restore();
        }
    }

    ctx.restore();
};
