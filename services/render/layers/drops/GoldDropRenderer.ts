
import { Drop } from "../../../../types";

// Constants for visual tweaking
// Cache is 256px. 
// Target visual radius for a coin is approx 10-12px.
// Scale = 24 / 256 ~= 0.09. Let's use 0.11 for slightly larger, clearer coins.
const CACHE_SIZE = 256;
const HALF_SIZE = CACHE_SIZE / 2;
const RENDER_SCALE = 0.11; 

export const GoldDropRenderer = {
    render: (ctx: CanvasRenderingContext2D, d: Drop, img: HTMLCanvasElement | undefined, tier: number, time: number) => {
        if (!img) return;

        ctx.save();
        ctx.translate(d.x, d.y);

        // --- TRAIL LOGIC (Velocity Stretch / Ghosts) ---
        const vx = d.vx || 0;
        const vy = d.vy || 0;
        const speedSq = vx * vx + vy * vy;
        const isMovingFast = speedSq > 25;

        // CASE C: The Singularity (Tier 5) -> Hardcore Glitch / Ghosting
        if (tier === 5) {
            // --- TRAIL: Chromatic Ghosting (Time Echoes) ---
            // Instead of a line, we draw previous instances to simulate relativistic speed/lag
            if (isMovingFast) {
                // Ghost 2 (Far back, Red Shift)
                ctx.save();
                ctx.translate(-vx * 2.5, -vy * 2.5);
                ctx.scale(RENDER_SCALE * 0.8, RENDER_SCALE * 0.8); // Smaller tail
                ctx.globalAlpha = 0.3;
                ctx.globalCompositeOperation = 'screen'; // Additive light
                // Tint it Redish by drawing a shadow (hack for cached images) or just rely on screen blend
                ctx.shadowColor = '#ff0000';
                ctx.shadowBlur = 10;
                ctx.drawImage(img, -HALF_SIZE, -HALF_SIZE);
                ctx.restore();

                // Ghost 1 (Close, Blue Shift / Electric)
                ctx.save();
                ctx.translate(-vx * 1.2, -vy * 1.2);
                ctx.scale(RENDER_SCALE * 0.9, RENDER_SCALE * 0.9);
                ctx.globalAlpha = 0.5;
                ctx.globalCompositeOperation = 'screen';
                ctx.shadowColor = '#00ffff';
                ctx.shadowBlur = 10;
                ctx.drawImage(img, -HALF_SIZE, -HALF_SIZE);
                ctx.restore();
            }

            // --- BODY ANIMATION: Majestic Breathing & Spin ---
            const s = RENDER_SCALE * 2.2; 
            
            // Slow Rotation (Majestic)
            const rotation = time / 1500; // Slow spin
            
            // Breathing Pulse (Energy Surge)
            // 1.0 to 1.15 scale oscillation
            const breath = 1 + Math.sin(time / 400) * 0.12;

            ctx.scale(s * breath, s * breath);
            ctx.rotate(rotation);

            // Draw Main Body
            // Use 'source-over' for the solid core
            ctx.drawImage(img, -HALF_SIZE, -HALF_SIZE);

            // Add a subtle electric overlay pulse
            if (Math.sin(time / 100) > 0.8) {
                ctx.globalCompositeOperation = 'lighter';
                ctx.globalAlpha = 0.3;
                ctx.drawImage(img, -HALF_SIZE, -HALF_SIZE);
            }
        }
        // CASE B: Crystal (Tier 4) -> Floating
        else if (tier === 4) {
            // Trail
            if (isMovingFast) {
                 ctx.save();
                 const angle = Math.atan2(vy, vx);
                 ctx.rotate(angle);
                 const trailLen = Math.min(60, Math.sqrt(speedSq) * 2);
                 const grad = ctx.createLinearGradient(0, 0, -trailLen, 0);
                 grad.addColorStop(0, '#06b6d4');
                 grad.addColorStop(1, 'rgba(0,0,0,0)');
                 ctx.fillStyle = grad;
                 ctx.beginPath();
                 ctx.moveTo(0, -6); ctx.lineTo(-trailLen, -1); ctx.lineTo(-trailLen, 1); ctx.lineTo(0, 6);
                 ctx.fill();
                 ctx.restore();
            }

            const breath = 1 + Math.sin(time / 200) * 0.1;
            const s = RENDER_SCALE * 1.1 * breath;
            ctx.scale(s, s);

            ctx.shadowColor = '#06b6d4';
            ctx.shadowBlur = 20;
            ctx.drawImage(img, -HALF_SIZE, -HALF_SIZE);
        }
        // CASE A: Standard Coins (Tier 1-3) -> 3D Flip Animation
        else {
            // Trail
            if (isMovingFast) {
                const angle = Math.atan2(vy, vx);
                ctx.save();
                ctx.rotate(angle);
                let baseColor = tier === 1 ? '#ea580c' : (tier === 2 ? '#94a3b8' : '#fbbf24');
                const trailLen = Math.min(50, Math.sqrt(speedSq) * 2);
                const grad = ctx.createLinearGradient(0, 0, -trailLen, 0);
                grad.addColorStop(0, baseColor);
                grad.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = grad;
                ctx.fillRect(-trailLen, -2, trailLen, 4);
                ctx.restore();
            }

            const idOffset = (d.id.charCodeAt(0) % 10);
            const slowRotate = time / 600;
            const angle = slowRotate + idOffset;
            const scaleX = Math.sin(angle);

            // THICKNESS SIMULATION
            if (Math.abs(scaleX) < 0.7) {
                const thickness = 4;
                const height = 20; 
                let edgeColor = tier === 1 ? '#7c2d12' : (tier === 2 ? '#475569' : '#b45309');

                ctx.fillStyle = edgeColor;
                ctx.fillRect(-thickness / 2, -height / 2, thickness, height);
            }

            // Face (Scaled by X)
            ctx.scale(scaleX * RENDER_SCALE, RENDER_SCALE);
            ctx.drawImage(img, -HALF_SIZE, -HALF_SIZE);
        }

        ctx.restore();
    }
};
