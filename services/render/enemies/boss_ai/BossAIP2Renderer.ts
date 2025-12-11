
import { Enemy } from "../../../../types";
import { TextCache } from "../../TextCache";
import { CHARACTERS } from "../../../../data/events";
import { BossAISkillRenderer } from "./BossAISkillRenderer";

export const BossAIP2Renderer = {
    render: (ctx: CanvasRenderingContext2D, e: Enemy) => {
        const time = Date.now() / 1000;

        // --- 1. VECTOR FORCEFIELD (Holographic Glitch Field) ---
        ctx.save();
        ctx.translate(e.x, e.y);
        
        const triangleCount = 3;
        const baseRadius = e.radius * 1.6;
        
        for (let i = 0; i < triangleCount; i++) {
            const rotationSpeed = (i % 2 === 0 ? 1 : -1) * (0.5 + i * 0.2);
            const angle = time * rotationSpeed + (i * Math.PI * 2 / triangleCount);
            
            // Dynamic breathing
            const breath = Math.sin(time * 4 + i) * 15;
            const r = baseRadius + breath;

            ctx.save();
            ctx.rotate(angle);

            // Helper to draw triangle path
            const drawTri = (radius: number) => {
                ctx.beginPath();
                for (let j = 0; j < 3; j++) {
                    const a = (j * Math.PI * 2 / 3);
                    const tx = Math.cos(a) * radius;
                    const ty = Math.sin(a) * radius;
                    if (j === 0) ctx.moveTo(tx, ty);
                    else ctx.lineTo(tx, ty);
                }
                ctx.closePath();
            };

            // A. RGB Split Layers (Glitch Effect)
            if (Math.random() < 0.2) {
                const shiftX = (Math.random() - 0.5) * 15;
                const shiftY = (Math.random() - 0.5) * 15;
                
                ctx.globalCompositeOperation = 'screen';
                
                // Cyan Ghost
                ctx.save();
                ctx.translate(shiftX, shiftY);
                ctx.strokeStyle = 'rgba(0, 255, 255, 0.7)';
                ctx.lineWidth = 2;
                drawTri(r);
                ctx.stroke();
                ctx.restore();

                // Red Ghost
                ctx.save();
                ctx.translate(-shiftX, -shiftY);
                ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
                ctx.lineWidth = 2;
                drawTri(r);
                ctx.stroke();
                ctx.restore();
            }

            // B. Core Layer (Stable Structure)
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = i === 0 ? '#ffffff' : '#a855f7'; // Mix white and purple
            ctx.lineWidth = 4 + Math.sin(time * 15) * 2; // Fast pulsing width
            ctx.shadowColor = '#a855f7'; // Purple glow
            ctx.shadowBlur = 15;
            
            drawTri(r);
            ctx.stroke();

            // C. Data Fragments (Floating Bits at Vertices)
            ctx.fillStyle = '#a855f7';
            ctx.shadowBlur = 0;
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            for (let j = 0; j < 3; j++) {
                const a = (j * Math.PI * 2 / 3);
                const tx = Math.cos(a) * r;
                const ty = Math.sin(a) * r;
                
                // Drift particles away from vertex
                const drift = 5 + Math.sin(time * 5 + j) * 5;
                const px = tx + Math.cos(a) * drift;
                const py = ty + Math.sin(a) * drift;
                
                // Draw Binary or Rect
                if (Math.random() > 0.5) {
                    ctx.fillRect(px - 3, py - 3, 6, 6);
                } else {
                    ctx.fillText(Math.random() > 0.5 ? '1' : '0', px, py);
                }
            }

            ctx.restore();
        }
        ctx.restore();

        // --- 2. INTRO ROAR VISUAL (Overheat Aura) ---
        if (e.customVars?.activeSkill === 'intro_roar') {
            ctx.save();
            ctx.translate(e.x, e.y);
            const pulse = 1 + Math.sin(time * 20) * 0.2;
            ctx.scale(pulse, pulse);
            ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
            ctx.beginPath();
            ctx.arc(0, 0, e.radius * 1.5, 0, Math.PI*2);
            ctx.fill();
            ctx.restore();
        }

        // --- 3. SKILL TELEGRAPHS (Delegated) ---
        if (e.customVars?.activeSkill === 'crash_dash') {
            BossAISkillRenderer.renderCrashDashTelegraph(ctx, e);
        }

        if (e.customVars?.isAiming && e.customVars?.morphChar === '007') {
            BossAISkillRenderer.renderAimLine(ctx, e);
        }

        // --- 4. BODY RENDERING (Chaos Morph) ---
        ctx.save();
        ctx.translate(e.x, e.y);

        // CIRCULAR CLIPPING MASK (Keeps the glitch effect contained)
        ctx.beginPath();
        ctx.arc(0, 0, e.radius, 0, Math.PI * 2);
        ctx.clip();

        // 1. Chaotic Shake
        const shakeIntensity = 6;
        const jx = (Math.random() - 0.5) * shakeIntensity;
        const jy = (Math.random() - 0.5) * shakeIntensity;
        ctx.translate(jx, jy);

        // B. Draw Background
        ctx.fillStyle = '#1a0505'; 
        ctx.fill();

        // --- C. TEXTURE SELECTION ---
        let texture;
        let w, h, hw, hh;
        const fontSize = 180;
        
        // Check if morphing
        const isMorphing = e.customVars?.activeSkill === 'chaos_morph' && e.customVars.morphChar;

        if (isMorphing) {
            const charId = e.customVars.morphChar;
            const emoji = CHARACTERS[charId]?.emojiNormal || '❓';
            texture = TextCache.getTexture(emoji, fontSize, '#ffffff');
        } else {
            texture = TextCache.getTexture(e.emoji, fontSize, '#ffffff');
        }
        
        w = texture.width;
        h = texture.height;
        hw = w / 2;
        hh = h / 2;

        // --- SAFE ZONE SCALING ---
        const safeScale = 0.78;
        ctx.scale(safeScale, safeScale);

        // Offset for RGB channels
        const splitOffset = 8 + Math.sin(time * 25) * 5;

        // D. RGB Split Layers
        ctx.save();
        ctx.translate(-splitOffset, 0);
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 0.8;
        ctx.drawImage(texture, -hw, -hh);
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = 'rgba(0, 255, 255, 0.7)';
        ctx.fillRect(-hw, -hh, w, h);
        ctx.restore();

        ctx.save();
        ctx.translate(splitOffset, 0);
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 0.8;
        ctx.drawImage(texture, -hw, -hh);
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = 'rgba(255, 0, 50, 0.7)';
        ctx.fillRect(-hw, -hh, w, h);
        ctx.restore();

        // E. Main Body with Glitch Slicing
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1.0;
        
        const slices = 8;
        const sliceHeight = h / slices;
        
        for (let i = 0; i < slices; i++) {
            const isGlitchRow = Math.random() < 0.3;
            const shift = isGlitchRow ? (Math.random() - 0.5) * 40 : 0;
            const sy = i * sliceHeight;
            
            ctx.drawImage(
                texture,
                0, sy, w, sliceHeight, 
                -hw + shift, -hh + sy, w, sliceHeight 
            );
        }

        // --- SCANLINE OVERLAY (If Morphing) ---
        if (isMorphing) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            for (let i = 0; i < h; i += 4) {
                if ((i + Math.floor(time * 50)) % 8 < 4) {
                    ctx.fillRect(-hw, -hh + i, w, 2);
                }
            }
            if (Math.random() < 0.2) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.fillRect(-hw, -hh, w, h);
            }
        }

        // F. Overload Flash
        if (Math.random() < 0.05) {
            ctx.globalCompositeOperation = 'lighter';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillRect(-hw, -hh, w, h); 
        }
        
        // --- STUNNED VISUAL (Rebooting) ---
        if (e.stunTimer && e.stunTimer > 0) {
            ctx.globalCompositeOperation = 'saturation';
            ctx.fillStyle = 'black'; 
            ctx.fillRect(-hw, -hh, w, h);
            
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(-hw, -hh, w, h);
        }

        ctx.restore(); // END CLIPPING

        // --- 5. OVERLAYS (Outside clipping) ---
        
        // Stunned Text
        if (e.stunTimer && e.stunTimer > 0) {
            ctx.save();
            ctx.translate(e.x, e.y);
            ctx.fillStyle = '#94a3b8';
            ctx.font = 'bold 20px monospace';
            ctx.textAlign = 'center';
            const dots = ".".repeat(Math.floor(time * 2) % 4);
            ctx.fillText(`SYSTEM_REBOOT${dots}`, 0, -e.radius - 20);
            
            // Progress Bar
            const maxStun = 120; // Default stun from crash
            const progress = 1 - (e.stunTimer / maxStun);
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(-50, -e.radius - 10, 100, 8);
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(-50, -e.radius - 10, 100 * progress, 8);
            
            ctx.restore();
        }

        // Overhead Name (Morphing)
        if (isMorphing) {
             const charId = e.customVars.morphChar;
             const name = CHARACTERS[charId]?.name || "UNKNOWN";
             
             ctx.save();
             ctx.translate(e.x, e.y - e.radius - 60);
             
             // Jitter text
             ctx.translate((Math.random()-0.5)*4, (Math.random()-0.5)*4);
             
             ctx.font = '900 24px monospace';
             ctx.textAlign = 'center';
             ctx.fillStyle = '#ffffff';
             ctx.shadowColor = '#facc15';
             ctx.shadowBlur = 10;
             
             const text = `[ ${name} ]`;
             ctx.fillText(text, 0, 0);
             
             // Glitch layer
             ctx.fillStyle = '#ef4444';
             ctx.globalAlpha = 0.6;
             ctx.fillText(text, 2, 0);
             
             ctx.restore();
        } else if (!e.stunTimer || e.stunTimer <= 0) {
            // Corrupted Warning Text (Normal P2)
            ctx.save();
            ctx.translate(e.x, e.y);
            ctx.fillStyle = '#ef4444';
            ctx.font = 'bold 16px monospace';
            ctx.textAlign = 'center';
            ctx.shadowColor = 'red';
            ctx.shadowBlur = 10;
            
            const glitchTexts = ["FATAL ERROR", "NULL_PTR", "SEGFAULT", "NaN"];
            const gText = glitchTexts[Math.floor((time * 10) % glitchTexts.length)];
            ctx.fillText(gText, 0, -e.radius - 20);
            ctx.restore();
        }
    }
};
