
import { Projectile } from "../../../types";

// --- OFFSCREEN CACHE ---
const CACHE_W = 64;
const CACHE_H = 32;
const CACHE_CX = CACHE_W / 2;
const CACHE_CY = CACHE_H / 2;

// Cache map for different colors: ColorString -> Canvas
const spikeCacheMap = new Map<string, HTMLCanvasElement>();

/**
 * Get or create a cached spike texture for a specific color
 */
const getSpikeCache = (color: string) => {
    if (spikeCacheMap.has(color)) {
        return spikeCacheMap.get(color)!;
    }

    const canvas = document.createElement('canvas');
    canvas.width = CACHE_W;
    canvas.height = CACHE_H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    // Draw pointing RIGHT (0 radians)
    // Reference Scale: Assume this cache represents a spike of length ~48px
    const length = 48;
    const width = 12;
    const cx = CACHE_CX;
    const cy = CACHE_CY;

    // 1. GLOW (Baked)
    ctx.shadowBlur = 10;
    ctx.shadowColor = color;

    // 2. CORE SPIKE (Geometric Diamond)
    ctx.beginPath();
    ctx.moveTo(cx + length * 0.5, cy); // Tip (Front)
    ctx.lineTo(cx - length * 0.3, cy - width); // Back Corner Top
    ctx.lineTo(cx - length * 0.1, cy); // Indent
    ctx.lineTo(cx - length * 0.3, cy + width); // Back Corner Bottom
    ctx.closePath();

    // Fill with gradient
    const coreGrad = ctx.createLinearGradient(cx - length*0.4, cy, cx + length*0.5, cy);
    // Darker base approximation (using transparency)
    coreGrad.addColorStop(0, 'rgba(0,0,0,0.5)'); 
    coreGrad.addColorStop(0.3, color); // Main Body Color
    coreGrad.addColorStop(1, '#ffffff'); // White hot tip
    
    ctx.fillStyle = coreGrad;
    ctx.fill();

    // 3. OUTLINE
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 4. ENERGY SPARKS (Baked detail)
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - length * 0.2, cy - width, 2, 2);
    ctx.fillRect(cx - length * 0.2, cy + width - 2, 2, 2);

    spikeCacheMap.set(color, canvas);
    return canvas;
};

// Pre-warm default cyan
if (typeof document !== 'undefined') {
    getSpikeCache('#22d3ee');
}

export const renderDataSpike = (ctx: CanvasRenderingContext2D, p: Projectile, isLowQuality: boolean = false) => {
    ctx.save();
    ctx.translate(p.x, p.y);
    
    // Rotate to face movement direction
    const angle = (p.vx === 0 && p.vy === 0) ? (p.angle || 0) : Math.atan2(p.vy, p.vx);
    ctx.rotate(angle);

    ctx.globalCompositeOperation = 'lighter';
    
    const color = p.color || '#22d3ee';

    // --- 1. DYNAMIC TRAIL (High Quality Only) ---
    // Expensive gradient calculations are skipped in Low Quality mode.
    if (!isLowQuality) {
        const speed = Math.hypot(p.vx, p.vy);
        if (speed > 1) {
            const trailLen = p.radius * 4.0;
            const trailW = p.radius * 0.6;
            
            const grad = ctx.createLinearGradient(-trailLen, 0, 0, 0);
            grad.addColorStop(0, `rgba(0,0,0,0)`);   // Transparent tail
            
            // Convert Hex to RGB for opacity control (Simplified: Just use global alpha on fill if needed, 
            // but here we just accept that the trail head is solid color)
            // Or use the provided hex color directly at stop 1.
            grad.addColorStop(1, color); 
            
            ctx.fillStyle = grad;
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.moveTo(0, -trailW/2);
            ctx.lineTo(-trailLen, 0);
            ctx.lineTo(0, trailW/2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }
    }

    // --- 2. DRAW CACHED SPIKE ---
    // Physical size target: Length ~ radius * 3.0
    // Cache reference length is 48px.
    const scale = (p.radius * 3.0) / 48;
    ctx.scale(scale, scale);

    const cache = getSpikeCache(color);
    ctx.drawImage(cache, -CACHE_CX, -CACHE_CY);

    ctx.restore();
};
