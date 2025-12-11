
import { Projectile } from "../../../types";
import { TextCache } from "../TextCache";

// --- RED TRIANGLE CACHE ---
const TRIANGLE_SIZE = 32;
const TRIANGLE_CACHE = document.createElement('canvas');
TRIANGLE_CACHE.width = TRIANGLE_SIZE;
TRIANGLE_CACHE.height = TRIANGLE_SIZE;

const initTriangleCache = () => {
    const ctx = TRIANGLE_CACHE.getContext('2d');
    if(!ctx) return;
    const cx = TRIANGLE_SIZE/2;
    const cy = TRIANGLE_SIZE/2;
    const h = TRIANGLE_SIZE * 0.8;
    ctx.translate(cx, cy);
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ef4444';
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(0, h/2); 
    ctx.lineTo(-h/2, -h/2);
    ctx.lineTo(h/2, -h/2);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fee2e2';
    ctx.beginPath();
    ctx.moveTo(0, h/2 - 4); 
    ctx.lineTo(-h/2 + 6, -h/2 + 4);
    ctx.lineTo(h/2 - 6, -h/2 + 4);
    ctx.closePath();
    ctx.fill();
}
if (typeof document !== 'undefined') initTriangleCache();

export const renderRedTriangle = (ctx: CanvasRenderingContext2D, p: Projectile) => {
    const size = p.radius * 2.5;
    ctx.drawImage(TRIANGLE_CACHE, p.x - size/2, p.y - size/2, size, size);
};

export const renderPopupWindow = (ctx: CanvasRenderingContext2D, p: Projectile) => {
    const w = 48; // p.radius is 20, visual width approx double
    const h = 36;
    
    ctx.save();
    ctx.translate(p.x, p.y);
    
    // Windows 95 Style Popup
    
    // 1. Drop Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(-w/2 + 4, -h/2 + 4, w, h);

    // 2. Window Body (Grey)
    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(-w/2, -h/2, w, h);
    
    // 3. Bevel Highlights (Top/Left)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-w/2, -h/2, w, 2);
    ctx.fillRect(-w/2, -h/2, 2, h);
    
    // 4. Bevel Shadows (Bottom/Right)
    ctx.fillStyle = '#808080';
    ctx.fillRect(w/2 - 2, -h/2, 2, h);
    ctx.fillRect(-w/2, h/2 - 2, w, 2);
    
    // 5. Title Bar (Blue)
    ctx.fillStyle = '#000080';
    ctx.fillRect(-w/2 + 3, -h/2 + 3, w - 6, 8);
    
    // 6. Close Button [X]
    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(w/2 - 12, -h/2 + 4, 8, 6);
    
    // 7. Icon / Content (Big Red X)
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    const iconSize = 8;
    ctx.moveTo(-iconSize, -iconSize + 8); // Offset down slightly
    ctx.lineTo(iconSize, iconSize + 8);
    ctx.moveTo(iconSize, -iconSize + 8);
    ctx.lineTo(-iconSize, iconSize + 8);
    ctx.stroke();

    // 8. Text "AD"
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("AD", 0, 12);

    ctx.restore();
};

export const renderTextProjectile = (ctx: CanvasRenderingContext2D, p: Projectile) => {
    // Determine props
    const size = Math.floor(p.radius * (p.isEnemy ? 1.1 : 2.2));
    
    // Logic: If it is a mimic, use the specific color passed in p.color for text, otherwise default player cyan
    const textColor = (p.isEnemy && !p.isMimic) ? 'black' : (p.isMimic ? p.color : '#cffafe');
    const glowColor = (p.isEnemy && !p.isMimic) ? null : (p.isMimic ? p.color : 'rgba(34, 211, 238, 0.5)');
    
    // Draw Enemy Circle Background ONLY if it's a standard enemy bullet (not a mimic)
    if (p.isEnemy && !p.isMimic) {
        ctx.fillStyle = '#fff'; 
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        const texture = TextCache.getTexture(p.text, size, textColor, null);
        ctx.drawImage(texture, p.x - texture.width/2, p.y - texture.height/2);
    } else {
        // Player / Mimic Style (Text Only + Glow)
        
        // --- CLONE SPECIFIC VISUAL FILTER ---
        if (p.summonType === 'clone') {
            ctx.save();
            ctx.filter = 'grayscale(100%) brightness(0.7)';
        }

        const texture = TextCache.getTexture(p.text, size, textColor, glowColor);
        ctx.drawImage(texture, p.x - texture.width/2, p.y - texture.height/2);

        if (p.summonType === 'clone') {
            ctx.restore();
        }
    }
};

export const renderSummonHpBar = (ctx: CanvasRenderingContext2D, p: Projectile) => {
    if (p.isSummon && !p.isInvincible && p.hp !== undefined && p.maxHp !== undefined) {
        const barW = p.radius * 2;
        const barH = 4;
        const yOffset = -p.radius - 8;
        const hpPct = Math.max(0, p.hp / p.maxHp);
        
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(p.x - barW/2, p.y + yOffset, barW, barH);
        
        ctx.fillStyle = '#22d3ee'; 
        ctx.fillRect(p.x - barW/2, p.y + yOffset, barW * hpPct, barH);
    }
};

export const renderSummonTimer = (ctx: CanvasRenderingContext2D, p: Projectile) => {
    if (p.isSummon && p.maxLife && p.maxLife < 900000) {
        const pct = Math.max(0, p.life / p.maxLife);
        const radius = p.radius + 8; 

        ctx.save();
        ctx.translate(p.x, p.y);
        
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, radius, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * pct));
        ctx.strokeStyle = pct < 0.25 ? '#ef4444' : '#22d3ee'; 
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.stroke();
        
        ctx.restore();
    }
};
