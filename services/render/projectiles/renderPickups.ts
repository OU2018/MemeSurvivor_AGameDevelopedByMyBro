
import { Projectile } from "../../../types";

// --- OFFSCREEN CACHE SETUP (Gold Coin) ---
const COIN_SIZE = 32; // Size of the cached image
const COIN_HALF = COIN_SIZE / 2;
const COIN_CACHE = document.createElement('canvas');
COIN_CACHE.width = COIN_SIZE;
COIN_CACHE.height = COIN_SIZE;

const initCoinCache = () => {
    const ctx = COIN_CACHE.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, COIN_SIZE, COIN_SIZE);
    
    const r = COIN_HALF - 2; // Radius inside canvas
    const cx = COIN_HALF;
    const cy = COIN_HALF;

    // 1. Base Gold Circle
    const grad = ctx.createRadialGradient(cx - r*0.3, cy - r*0.3, r*0.2, cx, cy, r);
    grad.addColorStop(0, '#FFFACD'); // Highlight
    grad.addColorStop(0.4, '#FFD700'); // Gold
    grad.addColorStop(1, '#DAA520'); // Shadow
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // 2. Border Ring
    ctx.strokeStyle = '#B8860B'; 
    ctx.lineWidth = 2;
    ctx.stroke();

    // 3. Inner Detail (¥ Symbol)
    ctx.fillStyle = '#8B4500'; // Dark Brown/Gold
    ctx.font = '900 20px "Noto Sans SC", sans-serif'; // Fixed pixel size for cache
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('¥', cx, cy + 1); // Slight offset
    
    // 4. Shine Specular
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.ellipse(cx - r*0.4, cy - r*0.4, r*0.25, r*0.15, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
};

// Initialize immediately
if (typeof document !== 'undefined') initCoinCache();

export const renderGoldCoin = (ctx: CanvasRenderingContext2D, p: Projectile, lowQuality: boolean = false) => {
    ctx.save();
    
    // Simple Bobbing Animation (Performance Friendly)
    // Use x coordinate as offset so they don't all bob in sync
    const floatY = Math.sin(Date.now() / 200 + p.x * 0.1) * 5;
    
    ctx.translate(p.x, p.y + floatY);

    // Use Cached Bitmap
    // Scale slightly based on p.radius if needed, but keeping it uniform is faster
    // Default radius is usually 8-10, cache is 32px (radius 16). Scale approx 0.8
    const scale = (p.radius * 2) / COIN_SIZE * 1.5; // 1.5x visual boost for satisfaction
    ctx.scale(scale, scale);
    
    ctx.drawImage(COIN_CACHE, -COIN_HALF, -COIN_HALF);

    ctx.restore();
};
