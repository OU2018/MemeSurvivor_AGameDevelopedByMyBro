
import { Enemy, GameState } from "../../../types";
import { ViewBounds } from "../renderConfig";
import { TextCache } from "../TextCache";
import { renderBossKPI } from "./renderBossKPI";
import { renderBossGlitch } from "./renderBossGlitch";
import { renderBossAI } from "./renderBossAI";
import { renderEliteManagerEffects } from "./renderEliteManager";
import { renderEliteHREffects } from "./renderEliteHR";
import { renderBossEffects } from "./renderBoss";

export const renderEnemies = (ctx: CanvasRenderingContext2D, enemies: Enemy[], state: GameState, bounds: ViewBounds) => {
    const time = Date.now();

    enemies.forEach(e => {
        // Culling
        if (e.x + e.radius < bounds.minX || e.x - e.radius > bounds.maxX ||
            e.y + e.radius < bounds.minY || e.y - e.radius > bounds.maxY) {
            return;
        }

        // --- BOSS DISPATCH ---
        if (e.config.behavior === 'boss') {
            if (e.config.type === 'boss_kpi') {
                renderBossKPI(ctx, e);
            } else if (e.config.type === 'boss_glitch') {
                renderBossGlitch(ctx, e);
            } else if (e.config.type === 'boss_ai') {
                renderBossAI(ctx, e);
            } else {
                // Fallback / Generic Boss
                renderBossKPI(ctx, e);
            }
            // Generic boss effects (like dash warning)
            renderBossEffects(ctx, e);
            return; // Bosses handle their own full rendering usually
        }

        // --- NORMAL / ELITE ENEMY RENDER ---

        // Shake Effect (Hit Flash)
        let shakeX = 0;
        let shakeY = 0;
        if (e.hitFlashTimer && e.hitFlashTimer > 0) {
            shakeX = (Math.random() - 0.5) * 5;
            shakeY = (Math.random() - 0.5) * 5;
            e.hitFlashTimer--;
        }

        // Elite/Special Effects UNDER body
        if (e.config.type === 'elite_manager') {
            renderEliteManagerEffects(ctx, e, state);
        } else if (e.config.type === 'elite_hr') {
            renderEliteHREffects(ctx, e);
        }

        // --- RIVER CRAB SHIELD (Frontal Arc) ---
        if (e.config.type === 'river_crab') {
             ctx.save();
             ctx.translate(e.x + shakeX, e.y + shakeY);
             // Determine facing direction from velocity
             // If stationary, calc angle to player to ensure it faces threat
             let facing = 0;
             if (Math.abs(e.vx) > 0.1 || Math.abs(e.vy) > 0.1) {
                 facing = Math.atan2(e.vy, e.vx);
             } else {
                 // Face Player if idle
                 const p = state.player;
                 facing = Math.atan2(p.y - e.y, p.x - e.x);
             }
             ctx.rotate(facing);
             
             // Draw Shield Arc
             const shieldR = e.radius + 8;
             // Coverage is roughly +/- 60 degrees (0.33 PI)
             ctx.beginPath();
             ctx.arc(0, 0, shieldR, -0.6, 0.6);
             ctx.strokeStyle = '#3b82f6'; // Blue Shield
             ctx.lineWidth = 4;
             ctx.globalAlpha = 0.6;
             ctx.stroke();
             
             // Inner sheen
             ctx.beginPath();
             ctx.arc(0, 0, shieldR - 3, -0.5, 0.5);
             ctx.strokeStyle = '#93c5fd';
             ctx.lineWidth = 2;
             ctx.globalAlpha = 0.4;
             ctx.stroke();
             
             ctx.restore();
        }

        // Shadow / Background Circle
        // UPDATED: Reddish Tint instead of pure black for better hostility read
        if (!bounds.isLowQuality && !e.isUnstable) {
            ctx.fillStyle = 'rgba(120, 30, 30, 0.6)'; // Brighter Red Tint
            ctx.beginPath();
            ctx.ellipse(e.x + shakeX, e.y + shakeY + e.radius * 0.1, e.radius, e.radius, 0, 0, Math.PI*2);
            ctx.fill();
        }

        // Capture Bubble Visual
        if (e.captureState && e.captureState !== 'free' && e.captureState !== 'latched') {
            ctx.save();
            ctx.translate(e.x + shakeX, e.y + shakeY);
            
            // Pulse
            const pulse = 1 + Math.sin(time / 100) * 0.1;
            ctx.scale(pulse, pulse);
            
            ctx.strokeStyle = '#a855f7';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.arc(0, 0, e.radius + 5, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.restore();
        }

        // Body Render
        if (!e.isUnstable) {
            const fontSize = Math.floor(e.radius * 2);
            // Flash white on hit
            const color = (e.hitFlashTimer && e.hitFlashTimer > 0) ? '#ffaaaa' : (e.config.tier === 'epic' ? '#fcd34d' : '#ffffff');
            
            // Flip for direction if needed (e.g. facing left/right) - checking velocity
            ctx.save();
            ctx.translate(e.x + shakeX, e.y + shakeY);
            
            if (e.vx < -0.1) ctx.scale(-1, 1);
            
            const texture = TextCache.getTexture(e.emoji, fontSize, color);
            ctx.drawImage(texture, -texture.width/2, -texture.height/2);
            
            ctx.restore();
        }

        // Stun Visual
        if (e.stunTimer && e.stunTimer > 0) {
            ctx.save();
            ctx.translate(e.x, e.y - e.radius);
            ctx.font = '20px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('💫', 0, 0);
            ctx.restore();
        }

        // Anxiety Visual (Purple Bubble/Sweat)
        if (e.anxietyTimer && e.anxietyTimer > 0) {
            if (Math.random() < 0.1) {
                // Should emit particle but we are in renderer. 
                // Just draw a small icon or tint.
            }
            ctx.save();
            ctx.translate(e.x, e.y - e.radius);
            ctx.font = '16px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('😰', 15, 0);
            ctx.restore();
        }
    });
};

export const renderEnemyHealthBars = (ctx: CanvasRenderingContext2D, enemies: Enemy[], bounds: ViewBounds) => {
    enemies.forEach(e => {
        // Culling
        if (e.x + e.radius < bounds.minX || e.x - e.radius > bounds.maxX ||
            e.y + e.radius < bounds.minY || e.y - e.radius > bounds.maxY) {
            return;
        }

        // Skip full health bars for minions to reduce clutter, unless elite/rare
        if (e.hp >= e.maxHp && e.config.tier === 'common') return;
        if (e.config.behavior === 'boss') return; // Boss has UI bar

        const barW = e.radius * 2;
        const barH = 4;
        const yOffset = -e.radius - 10;
        
        // Background
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(e.x - barW/2, e.y + yOffset, barW, barH);
        
        // Foreground
        const pct = Math.max(0, e.hp / e.maxHp);
        ctx.fillStyle = e.config.tier === 'epic' ? '#fcd34d' : (e.config.tier === 'rare' ? '#a855f7' : '#ef4444');
        ctx.fillRect(e.x - barW/2, e.y + yOffset, barW * pct, barH);

        // Shield (Elite Manager / others if added)
        if (e.tempShield && e.tempShield > 0 && e.maxTempShield) {
            const shieldPct = Math.min(1, e.tempShield / e.maxTempShield);
            const shieldY = yOffset - 4;
            
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(e.x - barW/2, e.y + shieldY, barW, 2);
            
            ctx.fillStyle = '#cbd5e1'; 
            ctx.fillRect(e.x - barW/2, e.y + shieldY, barW * shieldPct, 2);
        }
    });
};
