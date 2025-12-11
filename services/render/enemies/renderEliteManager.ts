
import { Enemy, GameState } from "../../../types";

export const renderEliteManagerEffects = (ctx: CanvasRenderingContext2D, e: Enemy, state: GameState) => {
    // --- 1. Elite Manager Railgun (Multi-Layer Focusing Laser) ---
    if (e.aimAngle !== undefined && e.customVars && e.customVars.laserAlpha > 0.01) {
        const isLocked = e.customVars.isLocked;
        const isFiring = e.customVars.isFiring;
        const chargeLevel = e.customVars.chargeLevel || 0; // 0 to 1
        const alpha = e.customVars.laserAlpha || 0; // Master opacity
        const beamLength = 4000; 
        
        ctx.save();
        ctx.translate(e.x, e.y);
        ctx.rotate(e.aimAngle); // Rotate entire context to aim direction

        // --- LAYER A: WARNING ZONE (Static Wide Box) ---
        // A wide, faint red box indicating the full possible danger area
        const warningWidth = 140;
        if (alpha > 0.1 && !isFiring) {
            ctx.fillStyle = `rgba(255, 0, 0, ${0.1 * alpha})`; 
            ctx.fillRect(0, -warningWidth/2, beamLength, warningWidth);
            
            // Faint borders
            ctx.strokeStyle = `rgba(255, 0, 0, ${0.2 * alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, -warningWidth/2);
            ctx.lineTo(beamLength, -warningWidth/2);
            ctx.moveTo(0, warningWidth/2);
            ctx.lineTo(beamLength, warningWidth/2);
            ctx.stroke();
        }

        // --- LAYER B: FOCUSING BOX (Dynamic Charge) ---
        // Width shrinks from 140 -> 10 as chargeLevel goes 0 -> 1
        // Opacity increases from 0.1 -> 0.8
        if (!isFiring) {
            const minWidth = 10;
            const currentWidth = warningWidth - (warningWidth - minWidth) * chargeLevel;
            
            const focusAlpha = (0.2 + chargeLevel * 0.6) * alpha;
            const colorR = 255;
            const colorG = Math.floor(255 * (1 - chargeLevel)); // Fade out green to become red
            const colorB = Math.floor(255 * (1 - chargeLevel)); // Fade out blue
            
            ctx.fillStyle = `rgba(${colorR}, ${colorG}, ${colorB}, ${focusAlpha})`;
            ctx.fillRect(0, -currentWidth/2, beamLength, currentWidth);
            
            // Add a bright leading edge or inner highlight
            ctx.fillStyle = `rgba(255, 255, 255, ${0.3 * chargeLevel * alpha})`;
            ctx.fillRect(0, -currentWidth/4, beamLength, currentWidth/2);
        }

        // --- LAYER C: HIGH ENERGY CORE (Lock & Fire) ---
        // Appears when nearly locked or fully locked
        if (chargeLevel > 0.8 || isLocked) {
            const coreAlpha = ((chargeLevel - 0.8) / 0.2) * alpha; // 0 -> 1 in last 20%
            
            ctx.shadowBlur = 15 * coreAlpha;
            ctx.shadowColor = '#ffffff';
            ctx.fillStyle = `rgba(255, 255, 255, ${coreAlpha})`;
            
            // Thin, intense beam
            const coreThickness = isLocked ? 6 : 2;
            ctx.fillRect(0, -coreThickness/2, beamLength, coreThickness);
            
            // Reset shadow for subsequent draws
            ctx.shadowBlur = 0;
        }

        // --- LAYER D: FIRING (Muzzle Flash & Beam) ---
        if (isFiring) {
            ctx.globalCompositeOperation = 'lighter';
            
            // 1. Massive White Beam
            const grad = ctx.createLinearGradient(0, -50, 0, 50);
            grad.addColorStop(0, 'rgba(255, 50, 50, 0)');
            grad.addColorStop(0.4, 'rgba(255, 200, 200, 0.8)');
            grad.addColorStop(0.5, '#ffffff'); // White hot center
            grad.addColorStop(0.6, 'rgba(255, 200, 200, 0.8)');
            grad.addColorStop(1, 'rgba(255, 50, 50, 0)');
            
            ctx.fillStyle = grad;
            ctx.fillRect(0, -50, beamLength, 100);
            
            // 2. Muzzle Blast
            ctx.fillStyle = '#fffbeb'; // Warm white
            ctx.beginPath();
            ctx.arc(0, 0, 80, 0, Math.PI * 2);
            ctx.fill();
            
            // 3. Shockwave rings
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(0, 0, 120, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
    }

    // --- 2. Capture Beacon Tethers ---
    state.projectiles.forEach(p => {
        if (p.isCaptureBeacon && p.sourceType === e.id) {
            ctx.save();
            const time = Date.now() / 30;
            
            ctx.beginPath();
            ctx.moveTo(e.x, e.y);
            ctx.lineTo(p.x, p.y);
            ctx.lineWidth = 4;
            ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)'; 
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(e.x, e.y);
            ctx.lineTo(p.x, p.y);
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#e9d5ff'; 
            ctx.setLineDash([15, 15]);
            ctx.lineDashOffset = -time; 
            ctx.stroke(); 

            ctx.restore();
        }
    });

    // --- 3. Drag Tethers ---
    state.enemies.forEach(minion => {
        if (minion.captureState === 'being_dragged' && minion.captureTargetId === e.id) {
             ctx.save();
             
             ctx.strokeStyle = '#a855f7'; 
             ctx.lineWidth = 4;
             ctx.globalAlpha = 0.5;
             ctx.beginPath();
             ctx.moveTo(e.x, e.y);
             ctx.lineTo(minion.x, minion.y);
             ctx.stroke();

             ctx.globalAlpha = 1;
             ctx.strokeStyle = '#ffffff';
             ctx.lineWidth = 2;
             ctx.setLineDash([10, 10]);
             ctx.lineDashOffset = Date.now() / 20;
             ctx.stroke();
             
             ctx.restore();
        }
    });
};
