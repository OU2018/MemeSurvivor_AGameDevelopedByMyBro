
import { GameState, Vector2D } from "../types";
import { renderProjectiles } from "./renderProjectiles";
import { renderConnections } from "./renderConnections";
import { renderEnemies, renderEnemyHealthBars } from "./enemies/enemyRenderer";
import { renderPlayer } from "./renderPlayer";
import { renderNeonAscension } from "./player/renderPlayerVFX"; // Updated import
import { renderUI, renderFloatingTexts } from "./renderUI";
import { renderReviveAnim } from "./sequences/renderReviveAnim";
import { renderTacticalLine } from "./renderTacticalLine"; // NEW

// Import new layers
import { BackgroundRenderer } from "./layers/BackgroundRenderer";
import { ZoneRenderer } from "./layers/ZoneRenderer";
import { ItemRenderer } from "./layers/ItemRenderer";
import { ParticleRenderer } from "./layers/ParticleRenderer";
import { HellLayerRenderer } from "./layers/HellLayerRenderer";
import { RENDER_SCALE, ViewBounds } from "./renderConfig";

// Export for backward compatibility (hooks, other renderers)
export { RENDER_SCALE, type ViewBounds };

export class GameRenderer {
    static render(canvas: HTMLCanvasElement, state: GameState, mousePos?: Vector2D) {
        const ctx = canvas.getContext('2d', { alpha: false }); 
        if (!ctx) return;

        const { width, height } = canvas;
        const cam = state.camera;

        const padding = 200;
        const viewW = width / RENDER_SCALE;
        const viewH = height / RENDER_SCALE;
        
        const totalEntities = state.enemies.length + state.projectiles.length + state.particles.length;
        const isLowQuality = totalEntities > 300; 

        const bounds: ViewBounds = {
            minX: cam.x - viewW / 2 - padding,
            maxX: cam.x + viewW / 2 + padding,
            minY: cam.y - viewH / 2 - padding,
            maxY: cam.y + viewH / 2 + padding,
            isLowQuality: isLowQuality
        };

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);

        // --- LAYER 0: BACKGROUND (World Space) ---
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.scale(RENDER_SCALE, RENDER_SCALE);
        ctx.translate(-cam.x, -cam.y);
        BackgroundRenderer.renderBackground(ctx, state);
        ctx.restore();

        // --- LAYER 0.5: HELL LAYER OVERLAY (Screen Space, Behind Entities) ---
        HellLayerRenderer.render(ctx, state, width, height);

        // --- RE-ENTER WORLD SPACE FOR ENTITIES ---
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.scale(RENDER_SCALE, RENDER_SCALE);
        ctx.translate(-cam.x, -cam.y);

        // --- LAYER 1: FLOOR OBJECTS ---
        ZoneRenderer.renderZones(ctx, state, bounds); // Safe Zones render here, ON TOP of Hell Layer
        ItemRenderer.renderDrops(ctx, state, bounds);
        ParticleRenderer.renderParticles(ctx, state, bounds);

        // --- LAYER 1.5: TACTICAL OVERLAYS (Behind Units) ---
        renderTacticalLine(ctx, state, mousePos);

        // --- LAYER 2: GROUND ENTITIES ---
        renderConnections(ctx, state);
        
        // SPLIT RENDERING: Normal Enemies first
        const bosses = state.enemies.filter(e => e.config.behavior === 'boss');
        const normalEnemies = state.enemies.filter(e => e.config.behavior !== 'boss');
        
        renderEnemies(ctx, normalEnemies, state, bounds);
        
        const groundProjectiles = state.projectiles.filter(p => !p.isAerial);
        renderProjectiles(ctx, groundProjectiles, bounds);
        
        // --- LAYER 3: MAP MASK (Obscures anything outside bounds) ---
        BackgroundRenderer.renderMapMask(ctx, state);

        // --- CINEMATIC PAUSE OVERLAY (DARKNESS) ---
        // Rendered AFTER map mask but BEFORE Boss/Player to spotlight them
        if (state.cinematicPause) {
            ctx.save();
            // Undo transforms to draw full screen overlay
            ctx.setTransform(1, 0, 0, 1, 0, 0); 
            
            // Vignette Darkening
            const grad = ctx.createRadialGradient(width/2, height/2, height * 0.2, width/2, height/2, height * 0.8);
            grad.addColorStop(0, 'rgba(0, 0, 0, 0.4)'); // Center slightly dark
            grad.addColorStop(1, 'rgba(0, 0, 0, 0.9)'); // Edges pitch black
            
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, width, height);
            
            // Re-apply transforms for subsequent layers (Boss)
            ctx.translate(width / 2, height / 2);
            ctx.scale(RENDER_SCALE, RENDER_SCALE);
            ctx.translate(-cam.x, -cam.y);
            ctx.restore();
        }

        // --- LAYER 4: BOSSES & AERIALS & HEALTH BARS (Over Mask) ---
        
        // Render Enemy Health Bars (Now on top of mask)
        renderEnemyHealthBars(ctx, normalEnemies, bounds);

        // Render Bosses (Now Visible over mask edge)
        renderEnemies(ctx, bosses, state, bounds);

        // 1. Neon Ascension Back (Beam from sky)
        renderNeonAscension(ctx, state.player, 'back');

        // 2. Aerial Projectiles (Missiles, Flying Pots)
        const aerialProjectiles = state.projectiles.filter(p => p.isAerial);
        renderProjectiles(ctx, aerialProjectiles, bounds);

        // 3. Player (Always visible on top)
        renderPlayer(ctx, state);
        
        // 4. Neon Ascension Front (Particles over player)
        renderNeonAscension(ctx, state.player, 'front');

        // --- LAYER 5: UI IN WORLD SPACE ---
        renderFloatingTexts(ctx, state, bounds);

        ctx.restore(); // Exit World Space

        // --- SCREEN SPACE POST-PROCESSING & UI ---
        
        if (state.activeMutators.includes('digital_eye_strain')) {
            const grad = ctx.createRadialGradient(width/2, height/2, height*0.4, width/2, height/2, height*0.9);
            grad.addColorStop(0, 'rgba(0,0,0,0)');
            grad.addColorStop(1, 'rgba(0,0,0,0.85)'); 
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, width, height);
            
            if (Math.random() < 0.05) {
                ctx.fillStyle = 'rgba(0,0,0,0.2)';
                ctx.fillRect(0, 0, width, height);
            }
        }

        if (state.reviveSequence.active) {
            renderReviveAnim(ctx, width, height, state);
        }

        renderUI(ctx, state, width, height);
    }
}
