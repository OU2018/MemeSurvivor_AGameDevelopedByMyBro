
import { Enemy } from "../../../types";
import { BossAIP1Renderer } from "./boss_ai/BossAIP1Renderer";
import { BossAIP2Renderer } from "./boss_ai/BossAIP2Renderer";

export const renderBossAI = (ctx: CanvasRenderingContext2D, e: Enemy) => {
    // Phase 2: Unleashed / Glitch Mode
    if (e.phase === 2) {
        BossAIP2Renderer.render(ctx, e);
    } 
    // Phase 1: Turret / Locked Mode
    else {
        BossAIP1Renderer.render(ctx, e);
    }

    // --- SHARED OVERLAYS (If any remain common) ---
    // Currently, casting bars are phase specific (P1), Stun text handled in P2 logic
    // But generic Hit Flash Logic is universal
    if (e.hitFlashTimer && e.hitFlashTimer > 0 && (!e.stunTimer || e.stunTimer <= 0)) {
        ctx.save();
        ctx.translate(e.x, e.y);
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        
        if (e.phase === 2) {
            ctx.beginPath();
            ctx.arc(0, 0, e.radius, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.arc(0, 0, 80, 0, Math.PI * 2); // P1 Base radius approx
            ctx.fill();
        }
        ctx.restore();
    }
    
    // --- CASTING BAR (Phase 1 Only - Building Nodes) ---
    if (e.subState === 'building' && e.customVars && e.customVars.buildMaxTime && e.phase !== 2 && !(e.customVars && e.customVars.inCinematicTransition)) {
        ctx.save();
        ctx.translate(e.x, e.y - 160);
        const w = 140;
        const h = 12;
        const progress = Math.min(1, e.customVars.buildTimer / e.customVars.buildMaxTime);
        
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-w/2, 0, w, h);
        ctx.fillStyle = '#a855f7';
        ctx.fillRect(-w/2, 0, w * progress, h);
        
        ctx.restore();
    }
};
