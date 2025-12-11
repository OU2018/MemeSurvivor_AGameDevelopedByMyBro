
import { Projectile } from "../../../types";

// --- DONUT CACHE SYSTEM ---
const CACHE_SIZE = 64; // Size of the cached bitmap
const CACHE_HALF = CACHE_SIZE / 2;

// Cache map to store pre-rendered donuts by color
const donutCache = new Map<string, HTMLCanvasElement>();

const getCachedDonut = (color: string): HTMLCanvasElement => {
    if (donutCache.has(color)) {
        return donutCache.get(color)!;
    }

    const canvas = document.createElement('canvas');
    canvas.width = CACHE_SIZE;
    canvas.height = CACHE_SIZE;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return canvas;

    const cx = CACHE_HALF;
    const cy = CACHE_HALF;
    // Target radius for the drawing (fit within cache with padding)
    const r = CACHE_HALF - 4; 

    // 1. Outer Glow (Baked in)
    ctx.shadowBlur = 10;
    ctx.shadowColor = color;

    // 2. The Donut Body (Thick Stroke)
    ctx.strokeStyle = color;
    ctx.lineWidth = 6; 
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.arc(cx, cy, r - 3, 0, Math.PI * 2);
    ctx.stroke();

    // 3. Inner Highlight (Glossy look)
    ctx.shadowBlur = 0; // Reset shadow for crisp highlight
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.arc(cx, cy, r - 3, -Math.PI * 0.25, Math.PI * 0.75); // Top-Left Highlight
    ctx.stroke();

    // 4. Core Faint Fill
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.15;
    ctx.fill();

    donutCache.set(color, canvas);
    return canvas;
};

export const renderDonutRing = (ctx: CanvasRenderingContext2D, p: Projectile) => {
    ctx.save();
    ctx.translate(p.x, p.y);
    
    // Rotation adds visual flair (cheap transform)
    const time = Date.now() / 100;
    ctx.rotate(time + p.id.charCodeAt(0));

    // Get Cached Bitmap
    const cache = getCachedDonut(p.color);
    
    // Scale visual to match physical radius
    // Physical radius is p.radius. Cache visual radius is roughly CACHE_HALF (32).
    // We want the visual to cover the physical area nicely.
    const scale = (p.radius * 2.2) / CACHE_SIZE; 
    ctx.scale(scale, scale);

    ctx.drawImage(cache, -CACHE_HALF, -CACHE_HALF);

    ctx.restore();
};
