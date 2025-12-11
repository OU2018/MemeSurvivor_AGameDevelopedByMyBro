
import { Projectile } from "../../../types";
import { ViewBounds } from "../renderConfig";
import { renderCyberExplosion, renderEnemyExplosion, renderViralExplosion, renderNeonBeam } from "./renderExplosions";
import { renderMeleeSwing } from "./renderWeapons";
import { renderGoldCoin } from "./renderPickups";
import { renderTextProjectile, renderSummonHpBar, renderSummonTimer, renderRedTriangle, renderPopupWindow } from "./renderBasics";
import { renderPinball } from "./renderPinball";
import { renderNeonMissile } from "./renderNeonMissile";
import { renderMatrixMissile } from "./renderMatrixMissile";
import { renderGoldenPalm } from "./renderGoldenPalm";
import { renderGoldVoid } from "./renderVoid";
import { renderGlitchCursor } from "./renderGlitchCursor";
import { renderSineShuriken } from "./renderSineShuriken";
import { renderElectricArc } from "./renderElectricArc";
import { renderGlitchTangle } from "./renderGlitchTangle";
import { renderDonutRing } from "./renderDonutRing";
import { renderPacman } from "./renderPacman"; 
import { renderDataSpike } from "./renderDataSpike"; 
import { TextCache } from "../TextCache";
import { AssetCache } from "../AssetCache"; 

// Matrix characters for random stream
const MATRIX_CHARS = "01010101XYZAﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ";

const getRandomChar = (seed: number) => {
    const idx = Math.floor(Math.abs(Math.sin(seed) * MATRIX_CHARS.length));
    return MATRIX_CHARS[idx % MATRIX_CHARS.length];
};

// Helper: Render Code Mountain Aura
const renderCodeMountainAura = (ctx: CanvasRenderingContext2D, p: Projectile) => {
    const time = Date.now() / 1000;
    const radius = 220; // Matches logic range

    ctx.save();
    ctx.translate(p.x, p.y);

    // 1. Dark Green Base
    const grad = ctx.createRadialGradient(0, 0, radius * 0.5, 0, 0, radius);
    grad.addColorStop(0, 'rgba(0, 20, 0, 0.1)');
    grad.addColorStop(0.8, 'rgba(0, 30, 0, 0.3)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    // 2. Rotating Rings (Matrix)
    ctx.globalCompositeOperation = 'lighter';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Inner Ring (Clockwise, slow)
    ctx.save();
    ctx.rotate(time * 0.2);
    const innerCount = 16;
    const innerR = radius * 0.6;
    ctx.fillStyle = 'rgba(34, 197, 94, 0.6)'; // Green-500
    for(let i=0; i<innerCount; i++) {
        const angle = (i / innerCount) * Math.PI * 2;
        const char = getRandomChar(i + Math.floor(time));
        
        ctx.save();
        ctx.rotate(angle);
        ctx.translate(0, -innerR);
        ctx.fillText(char, 0, 0);
        ctx.restore();
    }
    ctx.restore();

    // Outer Ring (Counter-Clockwise, faster)
    ctx.save();
    ctx.rotate(-time * 0.4);
    const outerCount = 24;
    const outerR = radius * 0.9;
    ctx.fillStyle = 'rgba(74, 222, 128, 0.5)'; // Green-400
    
    // Draw dashed circle line
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([10, 15]);
    ctx.beginPath();
    ctx.arc(0, 0, outerR, 0, Math.PI*2);
    ctx.stroke();

    for(let i=0; i<outerCount; i++) {
        const angle = (i / outerCount) * Math.PI * 2;
        // Glitchy offset
        const jitter = Math.random() < 0.05 ? 5 : 0;
        
        ctx.save();
        ctx.rotate(angle);
        ctx.translate(0, -outerR + jitter);
        const char = Math.random() > 0.5 ? '0' : '1';
        ctx.fillText(char, 0, 0);
        ctx.restore();
    }
    ctx.restore();

    ctx.restore();
};

export const renderProjectiles = (ctx: CanvasRenderingContext2D, projectiles: Projectile[], bounds: ViewBounds) => {
    projectiles.forEach(p => {
        const safeRadius = p.maxExplosionRadius || p.radius + 20;
        if (p.x + safeRadius < bounds.minX || p.x - safeRadius > bounds.maxX ||
            p.y + safeRadius < bounds.minY || p.y - safeRadius > bounds.maxY) {
            return;
        }

        ctx.save();
        
        // --- FAKE BULLET TRANSPARENCY (Ghostly) ---
        if (p.isFake) {
            ctx.globalAlpha = 0.4;
        }

        if (p.isExploding) {
            const maxRadius = p.maxExplosionRadius || 100;
            const progress = Math.min(1, p.radius / maxRadius);
            
            // Neon Missile Orbital Strike (Board L6)
            if (p.renderStyle === 'neon_missile') {
                renderNeonBeam(ctx, p, progress, bounds.isLowQuality);
                ctx.restore();
                return;
            }

            if (p.renderStyle === 'cyber_explosion' || (!p.isEnemy && !p.renderStyle)) { 
                renderCyberExplosion(ctx, p, progress, bounds.isLowQuality);
            } else if (p.renderStyle === 'viral_explosion') {
                renderViralExplosion(ctx, p, progress, bounds.isLowQuality);
            } else {
                renderEnemyExplosion(ctx, p, progress, bounds.isLowQuality);
            }
            ctx.restore();
            return;
        }

        // --- SPECIAL RENDER STYLES ---
        
        // CODE MOUNTAIN (RENDER AURA FIRST)
        if (p.summonType === 'code_mountain') {
            renderCodeMountainAura(ctx, p);
            // Fallthrough to render the emoji/HP bar below
        }
        
        // PACMAN RENDERER (Priority Check)
        if (p.renderStyle === 'pacman_style' || p.summonType === 'pacman') {
            renderPacman(ctx, p);
            ctx.restore();
            return;
        }

        // POPUP WINDOW (POPUP AD ITEM)
        if (p.renderStyle === 'popup_window') {
            renderPopupWindow(ctx, p);
            ctx.restore();
            return;
        }

        // --- MATRIX CODE (Fake bullets) ---
        if (p.renderStyle === 'matrix_code') {
            const time = Date.now() / 100;
            ctx.font = 'bold 20px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#ef4444'; // Red (requested)
            // Rotating char
            const char = MATRIX_CHARS[Math.floor((time + p.id.charCodeAt(0)) % MATRIX_CHARS.length)];
            ctx.fillText(char, p.x, p.y);
            ctx.restore();
            return;
        }

        if (p.renderStyle === 'data_spike') {
            renderDataSpike(ctx, p, bounds.isLowQuality);
            ctx.restore();
            return;
        }

        // MIMIC BOMB (007 Boss High Contrast)
        if (p.renderStyle === 'mimic_bomb') {
            const z = p.z || 0;
            // Shadow
            ctx.save();
            ctx.translate(p.x, p.y);
            const shadowScale = 1 - (z / 200); 
            ctx.scale(shadowScale, shadowScale);
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.beginPath();
            ctx.ellipse(0, 0, p.radius, p.radius * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // Bomb Body
            ctx.save();
            ctx.translate(p.x, p.y - z);
            
            // 1. Pulsing Warning Glow (Red)
            const pulse = 1 + Math.sin(Date.now() / 100) * 0.2;
            ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
            ctx.beginPath();
            ctx.arc(0, 0, p.radius * 1.2 * pulse, 0, Math.PI * 2);
            ctx.fill();

            // 2. High Contrast Stroke (Thick White Outline)
            const fontSize = Math.floor(p.radius * 2);
            const text = p.emoji || '💣';
            
            ctx.font = `900 ${fontSize}px "Noto Sans SC", sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 4;
            ctx.lineJoin = 'round';
            ctx.strokeText(text, 0, 0);
            
            // 3. Main Text (Black/Charcoal Body)
            ctx.fillStyle = '#000000';
            ctx.fillText(text, 0, 0);
            
            // 4. Fuse Spark (Blinking)
            const fuseX = p.radius * 0.4;
            const fuseY = -p.radius * 0.6;
            ctx.fillStyle = Math.random() > 0.5 ? '#facc15' : '#ef4444';
            ctx.beginPath();
            ctx.arc(fuseX, fuseY, 4, 0, Math.PI*2);
            ctx.fill();
            
            ctx.restore();
            ctx.restore(); 
            return;
        }

        // CHARM HEART (Pre-rendered Asset)
        if (p.renderStyle === 'charm_heart') {
            const pulse = 1 + Math.sin(Date.now() / 150) * 0.1;
            ctx.translate(p.x, p.y);
            ctx.scale(pulse, pulse);
            if (AssetCache.charmTexture) {
                ctx.drawImage(AssetCache.charmTexture, -32, -32);
            } else {
                ctx.fillStyle = '#f472b6';
                ctx.beginPath();
                ctx.arc(0, 0, 20, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'red';
                ctx.fillText('❤', 0, 0);
            }
            ctx.restore();
            return;
        }

        if (p.renderStyle === 'donut_ring') {
            renderDonutRing(ctx, p);
            ctx.restore();
            return;
        }

        if (p.renderStyle === 'glitch_tangle') {
            renderGlitchTangle(ctx, p);
            ctx.restore();
            return;
        }

        if (p.renderStyle === 'electric_arc') {
            renderElectricArc(ctx, p);
            ctx.restore();
            return;
        }

        if (p.renderStyle === 'sine_shuriken') {
            renderSineShuriken(ctx, p);
            ctx.restore();
            return;
        }

        if (p.renderStyle === 'glitch_cursor') {
            renderGlitchCursor(ctx, p);
            ctx.restore();
            return;
        }

        if (p.renderStyle === 'gold_void') {
            renderGoldVoid(ctx, p);
            ctx.restore();
            return;
        }

        if (p.renderStyle === 'black_pot') {
            // Shadow on ground
            ctx.save();
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            const z = p.z || 0;
            const shadowScale = 1 - (z / 200); 
            ctx.translate(p.x, p.y);
            ctx.scale(shadowScale, shadowScale);
            ctx.beginPath();
            ctx.ellipse(0, 0, 20, 10, 0, 0, Math.PI*2);
            ctx.fill();
            ctx.restore();

            // Pot Body (Flying)
            const visualY = p.y - (p.z || 0);
            ctx.save();
            ctx.translate(p.x, visualY);
            ctx.rotate(Date.now() / 100); 
            const texture = TextCache.getTexture('🍳', 48, '#000');
            ctx.drawImage(texture, -24, -24);
            ctx.restore();
            ctx.restore();
            return;
        }

        if (p.renderStyle === 'golden_palm') {
            renderGoldenPalm(ctx, p);
            ctx.restore();
            return;
        }

        if (p.renderStyle === 'melee_swing') {
            renderMeleeSwing(ctx, p);
            ctx.restore();
            return;
        }

        if (p.renderStyle === 'gold_coin') {
            renderGoldCoin(ctx, p, bounds.isLowQuality);
            ctx.restore();
            return;
        }

        if (p.renderStyle === 'rainbow_pinball') {
            renderPinball(ctx, p);
            ctx.restore();
            return;
        }

        if (p.renderStyle === 'neon_missile') {
            renderNeonMissile(ctx, p);
            ctx.restore();
            return;
        }

        if (p.renderStyle === 'matrix_missile') {
            renderMatrixMissile(ctx, p);
            ctx.restore();
            return;
        }
        
        if (p.renderStyle === 'red_triangle') {
            renderRedTriangle(ctx, p);
            ctx.restore();
            return;
        }
        
        if (p.renderStyle === 'code_explosion') {
             // Fallthrough
        }

        // --- TECH SYNERGY VISUALS (Pixel Trail) ---
        if (!p.isEnemy && (p.canChain || (p.bounceCount && p.bounceCount > 0)) && !bounds.isLowQuality) {
            ctx.fillStyle = p.canChain ? '#3b82f6' : '#22d3ee'; 
            for(let i=1; i<=3; i++) {
                const offX = -p.vx * i * 2;
                const offY = -p.vy * i * 2;
                const size = 6 - i;
                if (size > 0) {
                    ctx.fillRect(p.x + offX - size/2, p.y + offY - size/2, size, size);
                }
            }
        }

        renderTextProjectile(ctx, p);
        renderSummonHpBar(ctx, p);
        renderSummonTimer(ctx, p); 
        
        ctx.restore();
    });
};
