
import { Zone } from "../../../../types";
import { ViewBounds } from "../../renderConfig";

export const renderTechZones = (ctx: CanvasRenderingContext2D, z: Zone, bounds: ViewBounds) => {
    const time = Date.now();

    // --- BUG TRAIL (Code Mountain) ---
    // @ts-ignore
    if (z.type === 'bug_trail') {
        // Calculate lifecycle progress (1.0 -> 0.0)
        const maxLife = z.maxLife || 180;
        const lifeRatio = Math.max(0, z.life / maxLife);

        // Visual properties based on life
        let alphaMult = 1.0;
        const fadeThreshold = 0.3; // Start fading in last 30% of life
        
        if (lifeRatio < fadeThreshold) {
            alphaMult = lifeRatio / fadeThreshold; // Linear fade to 0
        }

        // Shrink effect: 100% -> 60% size
        const shrinkScale = 0.6 + 0.4 * alphaMult;

        ctx.save();
        ctx.translate(z.x, z.y);
        ctx.scale(shrinkScale, shrinkScale);

        // Matrix Green Rect
        // Base alpha is 0.3, fades out with alphaMult
        const fillAlpha = 0.3 * alphaMult;
        ctx.fillStyle = `rgba(34, 197, 94, ${fillAlpha})`;
        ctx.fillRect(-z.radius, -z.radius, z.radius*2, z.radius*2);
        
        // Glitch Pixels (Low Quality Optimization)
        if (!bounds.isLowQuality && alphaMult > 0.1) {
            const count = 5;
            ctx.fillStyle = `rgba(74, 222, 128, ${0.8 * alphaMult})`;
            for(let i=0; i<count; i++) {
                // Deterministic random for stable jitter based on position/ID
                // Using x/y/i to seed simple pseudorandom
                const seed = Math.sin(z.x + z.y + i) * 1000;
                const rOffset = (seed - Math.floor(seed));
                
                const rx = (rOffset - 0.5) * z.radius * 2;
                const ry = (Math.cos(seed) - 0.5) * z.radius * 2;
                const s = 5 + (rOffset * 10);
                
                ctx.fillRect(rx, ry, s, s);
            }
        }

        // Border
        const borderAlpha = 0.6 * alphaMult;
        ctx.strokeStyle = `rgba(34, 197, 94, ${borderAlpha})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(-z.radius, -z.radius, z.radius*2, z.radius*2);
        
        ctx.restore();
        return;
    }

    // --- BSOD (Blue Screen of Death) ---
    // Visual: Classic Blue Screen with Sad Face and Error Codes
    if (z.type === 'bsod') {
        ctx.save();
        ctx.translate(z.x, z.y);

        // 1. Base Blue Glitch Background
        const alpha = Math.min(1, z.life / 20); // Fade out at end
        ctx.globalAlpha = 0.85 * alpha;
        
        // Random glitch offset for shake effect
        const shakeX = (Math.random() - 0.5) * 4;
        const shakeY = (Math.random() - 0.5) * 4;
        ctx.translate(shakeX, shakeY);

        ctx.fillStyle = '#0000AA'; // Standard BSOD Blue
        ctx.beginPath();
        ctx.arc(0, 0, z.radius, 0, Math.PI * 2);
        ctx.fill();

        // 2. Scanlines
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        for (let i = -z.radius; i < z.radius; i += 4) {
            ctx.fillRect(-z.radius, i, z.radius * 2, 1);
        }

        // Clip to circle for text
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, z.radius, 0, Math.PI * 2);
        ctx.clip();

        // 3. Sad Face :(
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 60px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(':(', 0, -40);

        // 4. Error Text
        ctx.font = '12px monospace';
        ctx.fillText('Your PC ran into a problem', 0, 10);
        ctx.fillText('and needs to restart.', 0, 25);
        
        // 5. Random Error Hex Codes
        ctx.font = '10px monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        
        const hexChars = "0123456789ABCDEF";
        const lines = 5;
        for(let i=0; i<lines; i++) {
            let code = "0x";
            for(let j=0; j<8; j++) code += hexChars[Math.floor(Math.random()*16)];
            // Scroll effect
            const yPos = 50 + i * 15 + (Math.floor(time / 100) % 5) * 2;
            if (yPos < z.radius - 20) {
                ctx.fillText(code, -z.radius + 30, yPos);
            }
        }

        ctx.restore(); // End Clip

        // 6. Glitch Strip (White Flash)
        if (Math.random() < 0.1) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            const h = Math.random() * 20;
            const y = (Math.random() - 0.5) * z.radius * 2;
            ctx.fillRect(-z.radius, y, z.radius * 2, h);
        }

        ctx.restore();
        return;
    }

    // --- FIREWALL WAVE (404 Shield) ---
    // Visual: Expanding Holographic Pulse Ring
    if (z.type === 'firewall_wave') {
        const maxLife = z.maxLife || 45;
        const progress = 1 - (z.life / maxLife); // 0 to 1 expansion
        
        const currentRadius = z.radius * progress;
        const alpha = 1 - Math.pow(progress, 3); // Fade out towards end

        ctx.save();
        ctx.translate(z.x, z.y);

        ctx.globalCompositeOperation = 'lighter';

        // 1. The Main Pulse Ring (Thick)
        ctx.beginPath();
        ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`; // Blue-500
        ctx.lineWidth = 8 * (1 - progress) + 2; // Thinner as it expands
        ctx.shadowColor = '#3b82f6';
        ctx.shadowBlur = 20;
        ctx.stroke();
        
        // 2. Inner Grid / Mesh Effect (The "Scanning" look)
        if (!bounds.isLowQuality) {
            ctx.beginPath();
            ctx.arc(0, 0, currentRadius * 0.85, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(34, 211, 238, ${alpha * 0.1})`; // Very faint cyan fill
            ctx.fill();

            // Radial Lines
            ctx.strokeStyle = `rgba(34, 211, 238, ${alpha * 0.4})`;
            ctx.lineWidth = 1;
            ctx.shadowBlur = 0;
            
            const spokes = 12;
            for(let i=0; i<spokes; i++) {
                const angle = (i / spokes) * Math.PI * 2 + (time / 500); // Rotating
                ctx.beginPath();
                ctx.moveTo(Math.cos(angle) * (currentRadius * 0.5), Math.sin(angle) * (currentRadius * 0.5));
                ctx.lineTo(Math.cos(angle) * currentRadius, Math.sin(angle) * currentRadius);
                ctx.stroke();
            }
        }

        // 3. Leading Edge Particles
        if (!bounds.isLowQuality) {
            const particleCount = 8;
            for(let i=0; i<particleCount; i++) {
                const angle = Math.random() * Math.PI * 2;
                const r = currentRadius + (Math.random() - 0.5) * 10;
                const size = Math.random() * 4 + 2;
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.fillRect(Math.cos(angle)*r - size/2, Math.sin(angle)*r - size/2, size, size);
            }
        }

        // 4. "404" Text Fragments floating
        if (progress < 0.8) {
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
            ctx.font = 'bold 16px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            const textCount = 4;
            for(let i=0; i<textCount; i++) {
                const angle = (i / textCount) * Math.PI * 2 - (time / 200);
                const r = currentRadius - 30;
                ctx.save();
                ctx.translate(Math.cos(angle)*r, Math.sin(angle)*r);
                ctx.rotate(angle + Math.PI/2);
                ctx.fillText("404", 0, 0);
                ctx.restore();
            }
        }

        ctx.restore();
        return;
    }
};
