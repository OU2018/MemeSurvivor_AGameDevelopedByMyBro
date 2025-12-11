
import { GameState, Drop } from "../../../types";
import { ViewBounds } from "../renderConfig";
import { DROP_CONFIG } from "../../logic/drops/DropConstants";
import { GoldDropRenderer } from "./drops/GoldDropRenderer";
import { PickupDropRenderer } from "./drops/PickupDropRenderer";

// --- BITMAP CACHE SYSTEM (HIGH-DPI UPDATE) ---
// Upgraded to 256px for "Retina" quality scaling to eliminate jagged edges
const CACHE_SIZE = 256; 
const HALF_SIZE = CACHE_SIZE / 2;
const dropCache = new Map<string, HTMLCanvasElement>();

// Helper to create cache
const createDropCache = (key: string, renderFn: (ctx: CanvasRenderingContext2D) => void) => {
    const canvas = document.createElement('canvas');
    canvas.width = CACHE_SIZE;
    canvas.height = CACHE_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;
    
    // Enable high quality smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    ctx.translate(HALF_SIZE, HALF_SIZE);
    renderFn(ctx);
    
    dropCache.set(key, canvas);
    return canvas;
};

const initDropCaches = () => {
    // Increased base radius for 256px canvas
    const coinR = 100; 

    // 1. Tier 1: Copper (铜币)
    createDropCache('gold_1_face', (ctx) => {
        // Base
        const grad = ctx.createRadialGradient(0, 0, coinR * 0.3, 0, 0, coinR);
        grad.addColorStop(0, '#fdba74'); // Orange-300
        grad.addColorStop(1, '#9a3412'); // Orange-800 (Darker edge)
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(0, 0, coinR, 0, Math.PI*2); ctx.fill();
        
        // Inner Detail
        ctx.strokeStyle = 'rgba(124, 45, 18, 0.5)'; 
        ctx.lineWidth = 8;
        ctx.beginPath(); ctx.arc(0, 0, coinR * 0.75, 0, Math.PI*2); ctx.stroke();
        
        // Rim
        ctx.strokeStyle = '#7c2d12'; 
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(0, 0, coinR, 0, Math.PI*2); ctx.stroke();
    });

    // 2. Tier 2: Silver (银币)
    createDropCache('gold_2_face', (ctx) => {
        const grad = ctx.createRadialGradient(0, 0, coinR * 0.3, 0, 0, coinR);
        grad.addColorStop(0, '#ffffff'); 
        grad.addColorStop(1, '#94a3b8'); // Slate-400
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(0, 0, coinR, 0, Math.PI*2); ctx.fill();
        
        // Sharp Shine
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.beginPath(); ctx.ellipse(-coinR*0.3, -coinR*0.3, coinR*0.2, coinR*0.1, Math.PI/4, 0, Math.PI*2); ctx.fill();
        
        // Rim
        ctx.strokeStyle = '#475569'; 
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(0, 0, coinR, 0, Math.PI*2); ctx.stroke();
    });

    // 3. Tier 3: Gold (金币)
    createDropCache('gold_3_face', (ctx) => {
        const grad = ctx.createRadialGradient(0, 0, coinR * 0.3, 0, 0, coinR);
        grad.addColorStop(0, '#fef08a'); // Yellow-200
        grad.addColorStop(0.5, '#fbbf24'); // Amber-400
        grad.addColorStop(1, '#d97706'); // Amber-600
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(0, 0, coinR, 0, Math.PI*2); ctx.fill();
        
        // Milled Edge
        ctx.strokeStyle = '#b45309'; 
        ctx.lineWidth = 8;
        ctx.setLineDash([15, 5]); // Dashed edge
        ctx.beginPath(); ctx.arc(0, 0, coinR * 0.92, 0, Math.PI*2); ctx.stroke();
        ctx.setLineDash([]);
        
        // Symbol
        ctx.fillStyle = 'rgba(180, 83, 9, 0.8)';
        ctx.font = '900 100px sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('¥', 0, 10);
    });

    // 4. Tier 4: Crystal (能量水晶)
    createDropCache('gold_4', (ctx) => {
        const size = 110;
        ctx.shadowColor = '#22d3ee';
        ctx.shadowBlur = 40; // Large glow
        
        // Hexagon Gradient
        const grad = ctx.createLinearGradient(-size/2, -size/2, size/2, size/2);
        grad.addColorStop(0, '#a5f3fc'); // Cyan-200
        grad.addColorStop(0.5, '#06b6d4'); // Cyan-500
        grad.addColorStop(1, '#164e63'); // Cyan-900
        ctx.fillStyle = grad;

        ctx.beginPath();
        for(let i=0; i<6; i++) {
            const angle = i * Math.PI / 3;
            const x = Math.cos(angle) * size;
            const y = Math.sin(angle) * size;
            if(i===0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();

        // Bevel Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(size*0.866, -size*0.5);
        ctx.lineTo(0, 0);
        ctx.fill();
        
        // Reset Shadow
        ctx.shadowBlur = 0;
        
        // Outline
        ctx.strokeStyle = '#cffafe';
        ctx.lineWidth = 4;
        ctx.stroke();
    });
    
    // 5. Tier 5: Singularity (Event Horizon / Black Hole)
    createDropCache('gold_5_star', (ctx) => {
        const coreRadius = 50;
        const diskRadiusX = 110;
        const diskRadiusY = 35; // Flattened

        // 1. Vertical Glare (Schwarzschild Lensing) - The beam crossing the hole
        // Draws behind and slightly over
        const glareGrad = ctx.createLinearGradient(0, -120, 0, 120);
        glareGrad.addColorStop(0, 'rgba(0,0,0,0)');
        glareGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.1)');
        glareGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)');
        glareGrad.addColorStop(0.6, 'rgba(255, 255, 255, 0.1)');
        glareGrad.addColorStop(1, 'rgba(0,0,0,0)');
        
        ctx.fillStyle = glareGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, 10, 120, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. Accretion Disk (The Ring)
        ctx.save();
        // Tilted gradient for doppler effect (Bright Left, Dark Right)
        const diskGrad = ctx.createLinearGradient(-diskRadiusX, 0, diskRadiusX, 0);
        diskGrad.addColorStop(0, '#ffffff'); // Bright White (Approaching)
        diskGrad.addColorStop(0.3, '#22d3ee'); // Cyan
        diskGrad.addColorStop(0.8, '#0e7490'); // Dark Blue (Receding)
        diskGrad.addColorStop(1, '#000000'); // Black fade

        ctx.strokeStyle = diskGrad;
        
        // Outer Ring
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.ellipse(0, 0, diskRadiusX, diskRadiusY, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        // Inner Ring (Finer)
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(0, 0, diskRadiusX * 0.8, diskRadiusY * 0.8, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // 3. The Void (Black Hole) - Digs out the center
        // We use simple black fill because it sits on top of the "Back" of the disk in 3D, 
        // but here in 2D cache we just draw it over.
        // To look like Interstellar, the hole is inside the ring.
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(0, 0, coreRadius, 0, Math.PI * 2);
        ctx.fill();

        // 4. Photon Ring (The thin white circle hugging the black hole)
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 15;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, coreRadius + 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
    });
    
    // Pickups (Upscaled for 256px)
    const drawEmoji = (text: string, size: number = 140) => (ctx: CanvasRenderingContext2D) => {
        ctx.font = `${size}px sans-serif`;
        ctx.textAlign = 'center'; 
        ctx.textBaseline = 'middle'; 
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 20;
        ctx.fillText(text, 0, 15);
    };

    createDropCache('health', drawEmoji('💊', 140));
    createDropCache('big_health', drawEmoji('🍱', 160));
    createDropCache('love_heart', drawEmoji('💖', 140));
};

if (typeof document !== 'undefined') initDropCaches();

export const ItemRenderer = {
    renderDrops(ctx: CanvasRenderingContext2D, state: GameState, bounds: ViewBounds) {
        const time = Date.now();

        state.drops.forEach(d => {
            // Culling
            if (d.x + 50 < bounds.minX || d.x - 50 > bounds.maxX ||
                d.y + 50 < bounds.minY || d.y - 50 > bounds.maxY) {
                return;
            }

            let cacheKey = '';
            let tier = 1;

            // --- DETERMINE TYPE & TIER ---
            if (d.type === 'gold') {
                const val = d.value;
                if (val < DROP_CONFIG.TIER_1_LIMIT) { cacheKey = 'gold_1_face'; tier = 1; }
                else if (val < DROP_CONFIG.TIER_2_LIMIT) { cacheKey = 'gold_2_face'; tier = 2; }
                else if (val < DROP_CONFIG.TIER_3_LIMIT) { cacheKey = 'gold_3_face'; tier = 3; }
                else if (val < DROP_CONFIG.TIER_4_LIMIT) { cacheKey = 'gold_4'; tier = 4; }
                else { cacheKey = 'gold_5_star'; tier = 5; }
            } else {
                // Map drop type to cache key (mostly same)
                cacheKey = d.type;
            }

            const img = dropCache.get(cacheKey);
            
            // --- DELEGATE RENDERING ---
            if (d.type === 'gold') {
                GoldDropRenderer.render(ctx, d, img, tier, time);
            } else {
                PickupDropRenderer.render(ctx, d, img, time);
            }
        });
    }
};
