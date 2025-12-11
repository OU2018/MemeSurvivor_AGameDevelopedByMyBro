
import { Projectile } from "../../../types";
import { gameEngine } from "../../gameEngine"; 

// --- OFFSCREEN CACHE SETUP (Cyber Explosion) ---
const CYBER_EXP_SIZE = 256;
const CYBER_EXP_HALF = CYBER_EXP_SIZE / 2;
const CYBER_EXP_CACHE = document.createElement('canvas');
CYBER_EXP_CACHE.width = CYBER_EXP_SIZE;
CYBER_EXP_CACHE.height = CYBER_EXP_SIZE;

const initCyberCache = () => {
    const ctx = CYBER_EXP_CACHE.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0,0, CYBER_EXP_SIZE, CYBER_EXP_SIZE);
    const r = CYBER_EXP_HALF * 0.8;
    const grad = ctx.createRadialGradient(CYBER_EXP_HALF, CYBER_EXP_HALF, r * 0.2, CYBER_EXP_HALF, CYBER_EXP_HALF, r);
    grad.addColorStop(0, 'rgba(34, 211, 238, 0.9)'); 
    grad.addColorStop(0.6, 'rgba(232, 121, 249, 0.5)'); 
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(CYBER_EXP_HALF, CYBER_EXP_HALF, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(CYBER_EXP_HALF, CYBER_EXP_HALF, r * 0.9, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.8)';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(CYBER_EXP_HALF - r * 0.6, CYBER_EXP_HALF);
    ctx.lineTo(CYBER_EXP_HALF + r * 0.6, CYBER_EXP_HALF);
    ctx.moveTo(CYBER_EXP_HALF, CYBER_EXP_HALF - r * 0.6);
    ctx.lineTo(CYBER_EXP_HALF, CYBER_EXP_HALF + r * 0.6);
    ctx.stroke();
};
if (typeof document !== 'undefined') initCyberCache();

const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
};

export const renderCyberExplosion = (ctx: CanvasRenderingContext2D, p: Projectile, progress: number = 0, lowQuality: boolean = false) => {
    const isEnemy = p.isEnemy;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    
    if (lowQuality) {
        ctx.globalAlpha = Math.max(0, (1 - progress) * 0.8);
        ctx.fillStyle = isEnemy ? '#ef4444' : '#22d3ee'; 
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = isEnemy ? 'rgba(255, 100, 100, 0.6)' : 'rgba(232, 121, 249, 0.6)'; 
        ctx.lineWidth = 4;
        ctx.stroke();
    } else {
        const scale = (p.radius * 2.5) / CYBER_EXP_SIZE;
        ctx.translate(p.x, p.y);
        ctx.scale(scale, scale);
        ctx.rotate(Date.now() / 100);
        ctx.globalAlpha = 1 - progress;
        
        // For Enemy (Red), we cannot use the Blue Cached image directly.
        // Draw Manually for Enemy to get Red color with White Core
        if (isEnemy) {
            const r = CYBER_EXP_HALF * 0.8;
            const grad = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r);
            
            // White Hot Core -> Red -> Fade
            grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)'); 
            grad.addColorStop(0.2, 'rgba(255, 50, 50, 0.9)'); 
            grad.addColorStop(0.6, 'rgba(220, 38, 38, 0.6)'); 
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.fill();
            
            // Rings
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(0, 0, r * 0.9, 0, Math.PI * 2);
            ctx.stroke();
            
            // White Cross
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(-r * 0.6, 0); ctx.lineTo(r * 0.6, 0);
            ctx.moveTo(0, -r * 0.6); ctx.lineTo(0, r * 0.6);
            ctx.stroke();
        } else {
            // Use Blue Cache for Player
            ctx.drawImage(CYBER_EXP_CACHE, -CYBER_EXP_HALF, -CYBER_EXP_HALF);
        }
    }
    ctx.restore();

    if (!lowQuality && progress < 0.8) {
        const debrisCount = 8; 
        const seedBase = p.id.charCodeAt(0);
        for(let i=0; i<debrisCount; i++) {
             const r1 = seededRandom(seedBase + i);
             const angle = r1 * Math.PI * 2 + progress; 
             const dist = p.radius * (0.5 + progress * 1.5);
             const size = (10 * (1-progress));
             if (size > 1) {
                 const dx = p.x + Math.cos(angle) * dist;
                 const dy = p.y + Math.sin(angle) * dist;
                 
                 if (isEnemy) {
                    // Red/Orange/White debris
                    const rand = i % 3;
                    ctx.fillStyle = rand === 0 ? '#ef4444' : (rand === 1 ? '#f97316' : '#ffffff');
                 } else {
                    ctx.fillStyle = i % 2 === 0 ? '#00ffff' : '#ff00ff';
                 }
                 
                 ctx.fillRect(dx - size/2, dy - size/2, size, size);
             }
        }
    }
};

export const renderEnemyExplosion = (ctx: CanvasRenderingContext2D, p: Projectile, progress: number = 0, lowQuality: boolean = false) => {
    // Basic orange/red explosion
    ctx.save();
    ctx.translate(p.x, p.y);
    const alpha = 1 - progress;
    
    if (lowQuality) {
        ctx.fillStyle = `rgba(239, 68, 68, ${alpha})`;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fill();
    } else {
        // Core
        ctx.globalCompositeOperation = 'lighter';
        const grad = ctx.createRadialGradient(0, 0, p.radius * 0.2, 0, 0, p.radius);
        grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        grad.addColorStop(0.3, `rgba(251, 191, 36, ${alpha * 0.8})`); // Amber
        grad.addColorStop(0.7, `rgba(239, 68, 68, ${alpha * 0.6})`); // Red
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Shockwave ring
        if (progress < 0.8) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, p.radius * 0.9, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    ctx.restore();
};

export const renderViralExplosion = (ctx: CanvasRenderingContext2D, p: Projectile, progress: number = 0, lowQuality: boolean = false) => {
    // Purple/Green toxic explosion
    ctx.save();
    ctx.translate(p.x, p.y);
    const alpha = 1 - progress;
    
    if (lowQuality) {
        ctx.fillStyle = `rgba(168, 85, 247, ${alpha})`;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fill();
    } else {
        ctx.globalCompositeOperation = 'lighter';
        const grad = ctx.createRadialGradient(0, 0, p.radius * 0.1, 0, 0, p.radius);
        grad.addColorStop(0, `rgba(216, 180, 254, ${alpha})`); // Light purple
        grad.addColorStop(0.5, `rgba(168, 85, 247, ${alpha * 0.8})`); // Purple
        grad.addColorStop(0.8, `rgba(34, 197, 94, ${alpha * 0.4})`); // Green edge
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Biohazard symbol like shape or just random bubbles
        const count = 5;
        for(let i=0; i<count; i++) {
            const angle = (i / count) * Math.PI * 2 + progress;
            const dist = p.radius * 0.6;
            const bubbleR = p.radius * 0.2 * (1-progress);
            ctx.fillStyle = `rgba(74, 222, 128, ${alpha})`;
            ctx.beginPath();
            ctx.arc(Math.cos(angle)*dist, Math.sin(angle)*dist, bubbleR, 0, Math.PI*2);
            ctx.fill();
        }
    }
    ctx.restore();
};

export const renderNeonBeam = (ctx: CanvasRenderingContext2D, p: Projectile, progress: number = 0, lowQuality: boolean = false) => {
    // Ground Impact / Orbital Strike Effect
    // Removed the vertical beam pillar, focusing on ground impact and rising debris.
    
    ctx.save();
    ctx.translate(p.x, p.y);
    
    // Smooth fade out
    const alpha = Math.max(0, 1 - progress); 
    
    // 1. Ground Shockwave (Impact Rings)
    ctx.save();
    ctx.scale(1, 0.3); // Ellipse perspective for ground
    ctx.globalCompositeOperation = 'lighter';
    
    // Expanding rings
    const ringCount = 3;
    for(let i=0; i<ringCount; i++) {
         const rProgress = (progress + i/ringCount) % 1;
         const r = p.radius * rProgress;
         const rAlpha = (1 - rProgress) * alpha;
         
         ctx.beginPath();
         ctx.arc(0, 0, r, 0, Math.PI * 2);
         ctx.strokeStyle = p.color || '#facc15';
         ctx.lineWidth = 3;
         ctx.globalAlpha = rAlpha;
         ctx.stroke();
    }
    
    // Core glow (Ground spot)
    ctx.beginPath();
    ctx.arc(0, 0, p.radius * (1-progress), 0, Math.PI * 2);
    ctx.fillStyle = p.color || '#facc15';
    ctx.globalAlpha = alpha * 0.5;
    ctx.fill();
    
    // White hot center
    ctx.beginPath();
    ctx.arc(0, 0, p.radius * 0.3 * (1-progress), 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = alpha;
    ctx.fill();
    
    ctx.restore();
    
    // 2. Rising Particles (Stable / Deterministic)
    // Debris floating upwards from impact
    if (!lowQuality) {
        const count = 12;
        const height = 300; // Rise height
        
        // Use ID hash for stable randomness per projectile
        let seed = 0;
        for(let i=0; i<p.id.length; i++) seed += p.id.charCodeAt(i);

        const seededRandom = (s: number) => {
            const x = Math.sin(s) * 10000;
            return x - Math.floor(x);
        };

        for(let i=0; i<count; i++) {
            const r1 = seededRandom(seed + i);
            const r2 = seededRandom(seed + i + 100);
            const r3 = seededRandom(seed + i + 200);

            // Horizontal Spread (Gaussian-ish)
            const spread = p.radius * 1.5;
            const x = (r1 - 0.5) * spread;
            
            // Vertical Rise:
            // Particles start low and rise based on progress
            const speed = 200 + r2 * 200; // Variable speed
            const y = -progress * speed - (r3 * 50); // Start offset

            const size = (r2 * 4 + 2) * (1 - progress); // Shrink as they rise
            
            ctx.fillStyle = i % 2 === 0 ? '#ffffff' : (p.color || '#facc15');
            ctx.globalAlpha = alpha;
            ctx.fillRect(x, y, size, size * 2); // Streaks
        }
    }

    ctx.restore();
};
