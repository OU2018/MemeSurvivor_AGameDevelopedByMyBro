
import { Enemy } from "../../../types";

export const renderEliteHREffects = (ctx: CanvasRenderingContext2D, e: Enemy) => {
    // Need a target to render warnings
    if (!e.dashTarget) return;

    // The explosion radius defined in EliteHR.ts logic (Synced)
    const IMPACT_RADIUS = 320; 

    // --- 1. EXPLOSION RADIUS WARNING (Visible during Lock & Dash) ---
    if (e.subState === 'lock' || e.subState === 'dash') {
        const time = Date.now();
        
        ctx.save();
        ctx.translate(e.dashTarget.x, e.dashTarget.y);

        // Calculate dynamic radius for Lock phase (Expanding)
        let visualRadius = IMPACT_RADIUS;
        let opacity = 0.5;

        if (e.subState === 'lock') {
            // Expands from 10% to 100% over 120 frames (approx 2s)
            const progress = Math.min(1, Math.max(0.1, (e.hrStateTimer || 0) / 120));
            visualRadius = IMPACT_RADIUS * progress;
            opacity = 0.2 + (progress * 0.1); // Slightly increasing opacity
        } else {
            // Dash phase: Full size, higher opacity
            visualRadius = IMPACT_RADIUS;
            opacity = 0.6;
        }

        // A. Danger Zone Fill
        const pulse = 1 + Math.sin(time / 100) * 0.05;
        
        // Use darker red for fill to be less blinding but visible
        ctx.fillStyle = `rgba(220, 38, 38, ${opacity})`;
        ctx.beginPath();
        ctx.arc(0, 0, visualRadius * (e.subState === 'dash' ? 1 : pulse), 0, Math.PI * 2);
        ctx.fill();

        // B. Warning Border
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = e.subState === 'dash' ? 4 : 2;
        
        ctx.beginPath();
        ctx.arc(0, 0, visualRadius, 0, Math.PI * 2);
        if (e.subState === 'lock') {
            // Dashed line during lock
            ctx.setLineDash([20, 15]);
            ctx.lineDashOffset = -time / 15; // Rotating effect
        } else {
            // Solid line during imminent dash
            ctx.setLineDash([]); 
        }
        ctx.stroke();

        // D. Text Warning (During Dash)
        if (e.subState === 'dash') {
             ctx.fillStyle = '#ffffff';
             ctx.font = '900 32px monospace';
             ctx.textAlign = 'center';
             ctx.textBaseline = 'middle';
             ctx.shadowColor = '#ef4444';
             ctx.shadowBlur = 10;
             ctx.fillText("⚠ IMPACT ⚠", 0, -IMPACT_RADIUS - 30);
        }

        ctx.restore();
    }

    // --- 2. LOCKING RETICLE (Only during Lock phase) ---
    // Reticle brackets shrink while circle expands - visual contrast
    if (e.subState === 'lock') {
        const time = Date.now();
        const progress = Math.min(1, (e.hrStateTimer || 0) / 120); // 0 to 1
        
        ctx.save();
        ctx.translate(e.dashTarget.x, e.dashTarget.y);
        
        // Laser Sight Line (Connect Boss to Target)
        ctx.save();
        ctx.translate(-e.dashTarget.x, -e.dashTarget.y); // Undo translate to draw world line
        ctx.beginPath();
        ctx.moveTo(e.x, e.y);
        ctx.lineTo(e.dashTarget.x, e.dashTarget.y);
        ctx.strokeStyle = `rgba(239, 68, 68, ${0.4 + progress * 0.6})`;
        ctx.lineWidth = 2 + progress * 2;
        ctx.setLineDash([20, 10]);
        ctx.lineDashOffset = -time / 5; // Fast flowing
        ctx.stroke();
        ctx.restore();

        // Geometric Reticle [  ]
        // Size shrinks as lock completes. Starts HUGE (300) shrinks to (80)
        // Keep reticle distinct from the filling circle
        const size = 300 - (progress * 220); 
        const bracketSize = size * 0.4;
        
        let color = '#ffffff';
        if (progress > 0.5) color = '#facc15';
        if (progress > 0.8) color = '#ef4444';

        // Jitter effect near end
        if (progress > 0.7) {
            const shake = (progress - 0.7) * 20;
            ctx.translate((Math.random()-0.5)*shake, (Math.random()-0.5)*shake);
        }

        ctx.shadowBlur = 15 + progress * 20;
        ctx.shadowColor = color;

        // Draw THICK Brackets
        ctx.strokeStyle = color;
        ctx.lineWidth = 8 + (progress * 4); 
        ctx.lineCap = 'square';
        ctx.setLineDash([]);
        
        // Top Left
        ctx.beginPath();
        ctx.moveTo(-size, -size + bracketSize);
        ctx.lineTo(-size, -size);
        ctx.lineTo(-size + bracketSize, -size);
        ctx.stroke();

        // Top Right
        ctx.beginPath();
        ctx.moveTo(size - bracketSize, -size);
        ctx.lineTo(size, -size);
        ctx.lineTo(size, -size + bracketSize);
        ctx.stroke();

        // Bottom Right
        ctx.beginPath();
        ctx.moveTo(size, size - bracketSize);
        ctx.lineTo(size, size);
        ctx.lineTo(size - bracketSize, size);
        ctx.stroke();

        // Bottom Left
        ctx.beginPath();
        ctx.moveTo(-size + bracketSize, size);
        ctx.lineTo(-size, size);
        ctx.lineTo(-size, size - bracketSize);
        ctx.stroke();

        // Center Progress Text
        if (progress > 0.5) {
            ctx.fillStyle = color;
            ctx.font = `900 ${20 + progress * 10}px monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowBlur = 0;
            const text = progress > 0.9 ? "LOCK" : `${Math.floor(progress * 100)}%`;
            ctx.fillText(text, 0, 0);
        }

        ctx.restore();
    }
};
