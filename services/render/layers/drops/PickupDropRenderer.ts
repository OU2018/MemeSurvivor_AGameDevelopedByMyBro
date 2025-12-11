
import { Drop } from "../../../../types";

// Constants
// Cache is 256px.
// Target visual size: ~50px width (Radius 25).
// Scale = 50 / 256 ~= 0.2. Let's do 0.22 for visibility.
const CACHE_SIZE = 256;
const HALF_SIZE = CACHE_SIZE / 2;
const RENDER_SCALE = 0.22; 

export const PickupDropRenderer = {
    render: (ctx: CanvasRenderingContext2D, d: Drop, img: HTMLCanvasElement | undefined, time: number) => {
        if (!img) {
            // Fallback text
            ctx.save();
            ctx.fillStyle = '#fff';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('?', d.x, d.y);
            ctx.restore();
            return;
        }

        ctx.save();
        ctx.translate(d.x, d.y);

        // Bobbing Animation
        const seed = d.id.charCodeAt(d.id.length - 1);
        const floatY = Math.sin(time / 400 + seed) * 4;
        ctx.translate(0, floatY);

        // Shadow
        ctx.save();
        ctx.scale(1, 0.3);
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.arc(0, 40, 20, 0, Math.PI*2); // Shadow lower and slightly larger
        ctx.fill();
        ctx.restore();

        // Render Item
        ctx.scale(RENDER_SCALE, RENDER_SCALE);
        
        // Optional: Glow for high value items
        if (d.type === 'big_health' || d.type === 'love_heart') {
            ctx.shadowColor = d.type === 'love_heart' ? '#f472b6' : '#22c55e';
            ctx.shadowBlur = 30;
        }

        ctx.drawImage(img, -HALF_SIZE, -HALF_SIZE);
        
        ctx.shadowBlur = 0;
        ctx.restore();
    }
};
