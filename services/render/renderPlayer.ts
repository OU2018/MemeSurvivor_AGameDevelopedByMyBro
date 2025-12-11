
import { GameState } from "../../types";
import { TextCache } from "./TextCache";
import { SynergyLogic } from "../logic/synergyLogic";
import { renderIdleMop, renderDriverShield } from "./player/renderPlayerEquipment";
import { renderSynergyAuras } from "./player/renderPlayerAuras";
import { renderNeonAscension } from "./player/renderPlayerVFX";

// Re-export for CanvasRenderer
export { renderNeonAscension };

export const renderPlayer = (ctx: CanvasRenderingContext2D, state: GameState) => {
    const p = state.player;
    
    // --- IDLE WEAPON RENDER (CLEANER MOP) ---
    // Only render if cleaner AND not currently swinging
    if (p.characterId === 'cleaner') {
        const isSwinging = state.projectiles.some(proj => proj.sourceType === 'cleaner' && proj.renderStyle === 'melee_swing');
        
        if (!isSwinging) {
            // Calculate visual scale based on player radius
            // Base radius is 24. If player grows (items), mop grows.
            const visualScale = p.radius / 24;
            
            // Calculate movement speed for physics
            const speed = Math.hypot(p.vx, p.vy);

            // Use the smoothed mopAngle from PlayerSystem
            renderIdleMop(ctx, p.x, p.y, p.mopAngle || 0, visualScale, speed);
        }
    }

    // --- RENDER ORDER: LAYER 0 (BACKGROUND) ---
    // 1. Synergy Auras (Void, etc.) - Moved to Bottom
    const counts = SynergyLogic.getSynergyCounts(p.items);
    const activeTiers = SynergyLogic.getActiveTiers(counts);
    renderSynergyAuras(ctx, p, activeTiers);

    // Draw Brain Drain Circle (With Fill)
    if (state.player.items.includes('降智光环')) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(state.player.x, state.player.y, 350, 0, Math.PI * 2);
        
        // Fill
        ctx.fillStyle = 'rgba(168, 85, 247, 0.1)'; 
        ctx.fill();
        
        // Stroke
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.restore();
    }

    // Draw Involution Field (Enhanced Visuals)
    if (state.player.items.includes('内卷力场')) {
        const radius = 150;
        ctx.save();
        ctx.translate(p.x, p.y);
        
        // 1. Base Fill
        ctx.fillStyle = 'rgba(139, 92, 246, 0.1)'; // Violet tint
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();

        // 2. Rotating Outer Dashed Ring
        const time = Date.now() / 1000;
        ctx.rotate(time * 0.5);
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.6)';
        ctx.lineWidth = 2;
        ctx.setLineDash([15, 10]); // Dashed pattern
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // 3. Counter-Rotating Inner Ring (The "Grinder")
        ctx.rotate(-time * 1.0); // Faster counter-rotation relative to current matrix
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]); // Finer dashes
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.6, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }

    // Shield Visual
    if (p.shield > 0) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 4;
        ctx.globalAlpha = 0.4 + Math.sin(Date.now() / 200) * 0.1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius + 12, 0, Math.PI*2);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
    }

    // --- RENDER ORDER: LAYER 1 (PLAYER BODY) ---
    
    // Draw Overclock Background Glow
    const shakeX = p.isOverclocked ? (Math.random() - 0.5) * 4 : 0;
    const shakeY = p.isOverclocked ? (Math.random() - 0.5) * 4 : 0;

    if (p.isOverclocked) {
        ctx.save();
        ctx.translate(p.x + shakeX, p.y + shakeY);
        const time = Date.now() / 200;
        const pulse = 1 + Math.sin(time) * 0.2;
        
        const grad = ctx.createRadialGradient(0, 0, p.radius * 0.5, 0, 0, p.radius * 1.5);
        grad.addColorStop(0, 'rgba(239, 68, 68, 0.8)'); // Red center
        grad.addColorStop(1, 'rgba(255, 0, 0, 0)'); // Fade out
        
        ctx.fillStyle = grad;
        ctx.globalAlpha = 0.6;
        ctx.scale(pulse, pulse);
        ctx.beginPath();
        ctx.arc(0, 0, p.radius * 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    ctx.fillStyle = '#000'; 
    ctx.beginPath();
    ctx.ellipse(p.x + shakeX, p.y + shakeY, p.radius, p.radius, 0, 0, Math.PI*2);
    ctx.fill();

    // Emoji - USE CACHE
    const fontSize = Math.floor(p.radius * 2);
    let emoji = p.emoji;
    if (p.isDying) emoji = '💀';
    else if (p.isOverclocked) emoji = '🤬'; // Angry face when overclocked
    
    // Invulnerability Blink
    if (p.invulnerableTime > 0 && Math.floor(Date.now() / 50) % 2 === 0) {
        ctx.globalAlpha = 0.5;
    }
    
    // Overclock Color Tint (Reddish)
    const color = p.isOverclocked ? '#fecaca' : 'white';
    
    const texture = TextCache.getTexture(emoji, fontSize, color);
    ctx.drawImage(texture, p.x + shakeX - texture.width/2, p.y + shakeY - texture.height/2);
    
    ctx.globalAlpha = 1;

    // --- RENDER ORDER: LAYER 2 (FOREGROUND VFX) ---
    
    // Neon Ascension FRONT (Chin Glow + Particles) - EXTERNALLY RENDERED NOW
    // renderNeonAscension(ctx, p, 'front');
    
    // Private Driver Shield
    if (p.items.includes('专职司机')) {
        const speed = Math.hypot(p.vx, p.vy);
        // Use saved facingAngle, default to 0 if undefined
        renderDriverShield(ctx, p.x, p.y, p.facingAngle || 0, speed, p.radius);
    }

    // --- NEW: CHARMED TEXT (Overhead) ---
    if (p.isCharmed) {
        ctx.save();
        ctx.font = 'bold 16px sans-serif';
        ctx.fillStyle = '#f472b6'; // Pink
        ctx.textAlign = 'center';
        // Float effect
        const yBob = Math.sin(Date.now() / 200) * 5;
        ctx.fillText("魅惑中...", p.x, p.y - p.radius - 20 + yBob);
        
        // Pink heart particle
        if (Math.floor(Date.now() / 200) % 2 === 0) {
            ctx.fillText("❤", p.x + 20, p.y - p.radius - 30 + yBob);
        }
        ctx.restore();
    }

    // --- OVERHEAD HEALTH & SHIELD BARS ---
    if (!p.isDying) {
        const barW = 50;
        const barH = 5;
        const yOffset = -p.radius - 15;
        
        // HP Background
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(p.x - barW/2, p.y + yOffset, barW, barH);
        
        // HP Foreground
        const hpPct = Math.max(0, p.hp / p.maxHp);
        ctx.fillStyle = hpPct < 0.3 ? '#ef4444' : '#22c55e'; // Red if low
        ctx.fillRect(p.x - barW/2, p.y + yOffset, barW * hpPct, barH);
        
        // Shield Bar
        if (p.maxShield > 0) {
            const shieldYOffset = yOffset - barH - 2;
            ctx.fillStyle = '#1e3a8a'; // Dark blue bg
            ctx.fillRect(p.x - barW/2, p.y + shieldYOffset, barW, barH);
            
            const shieldPct = Math.min(1, Math.max(0, p.shield / p.maxShield));
            ctx.fillStyle = '#3b82f6'; // Blue
            ctx.fillRect(p.x - barW/2, p.y + shieldYOffset, barW * shieldPct, barH);
        }

        // --- NEW: OVERHEAD HEAT BAR (Hardcore Ultimate) ---
        // Only show if player has Hardcore level >= 6 (i.e. has heat mechanic)
        // We check if maxHeat > 0, which is initialized only if needed or we check tiers.
        // Checking tiers locally is expensive, checking p.heatValue > 0 or p.isOverclocked is cheaper.
        // Or check activeTiers if passed. Since we computed activeTiers earlier for Auras, 
        // we can assume if p.heatValue > 0 it matters.
        if ((activeTiers['hardcore'] || 0) >= 6) {
             const heatYOffset = yOffset + barH + 2; // Below HP
             const heatW = 50;
             const heatH = 3;
             
             // Background
             ctx.fillStyle = '#451a03'; // Dark brown
             ctx.fillRect(p.x - heatW/2, p.y + heatYOffset, heatW, heatH);
             
             // Foreground
             const heatPct = Math.min(1, p.heatValue / p.maxHeat);
             ctx.fillStyle = p.isOverclocked ? '#ef4444' : '#f97316'; // Red if active, Orange if building
             
             // Flash if overclocked
             if (p.isOverclocked && Math.floor(Date.now() / 100) % 2 === 0) {
                 ctx.fillStyle = '#facc15'; // Yellow flash
             }
             
             ctx.fillRect(p.x - heatW/2, p.y + heatYOffset, heatW * heatPct, heatH);
        }
    }
};
