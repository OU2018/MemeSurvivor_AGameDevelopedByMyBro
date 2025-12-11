
import { GameState } from "../../../types";
import { ViewBounds } from "../renderConfig";

export const ParticleRenderer = {
    renderParticles(ctx: CanvasRenderingContext2D, state: GameState, bounds: ViewBounds) {
        state.particles.forEach(p => {
            const scale = p.scale !== undefined ? p.scale : 1;
            if (scale <= 0) return;
            let alpha = 1.0;
            if (p.alpha !== undefined) alpha = p.alpha;
            else alpha = p.life / (p.maxLife || 1);
            if (alpha <= 0.01) return;

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.translate(p.x, p.y);
            if (p.rotation) ctx.rotate(p.rotation);
            ctx.scale(scale, scale);
            if (p.blendMode && !bounds.isLowQuality) ctx.globalCompositeOperation = p.blendMode;
            ctx.fillStyle = p.color;
            if (p.type === 'rect') {
                ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
            } else if (p.type === 'spark') {
                if (bounds.isLowQuality) ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
                else {
                    ctx.beginPath();
                    ctx.moveTo(0, -p.size);
                    ctx.lineTo(p.size * 0.2, 0);
                    ctx.lineTo(0, p.size);
                    ctx.lineTo(-p.size * 0.2, 0);
                    ctx.fill();
                }
            } else if (p.type === 'lightning' && p.tx !== undefined) {
                 ctx.strokeStyle = p.color;
                 ctx.lineWidth = 2;
                 ctx.beginPath();
                 ctx.moveTo(0,0);
                 ctx.lineTo(p.tx - p.x, p.ty - p.y);
                 ctx.stroke();
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, p.size, 0, Math.PI*2);
                ctx.fill();
            }
            ctx.restore();
        });
    }
};
