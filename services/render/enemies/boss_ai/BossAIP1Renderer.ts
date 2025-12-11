
import { Enemy } from "../../../../types";
import { TextCache } from "../../TextCache";

export const BossAIP1Renderer = {
    render: (ctx: CanvasRenderingContext2D, e: Enemy) => {
        const time = Date.now() / 1000;
        
        // Check if in cinematic freeze (Transition phase)
        const isFreezing = e.customVars && e.customVars.inCinematicTransition;
        const transitionPhase = e.customVars?.transitionPhase || 0;

        let hoverY = Math.sin(time * 2) * 5;
        let shakeX = 0;
        
        if (isFreezing) {
            const intensity = 5 + (transitionPhase * 5); 
            hoverY = (Math.random() - 0.5) * intensity;
            shakeX = (Math.random() - 0.5) * intensity;
        }

        ctx.save();
        ctx.translate(e.x, e.y);

        // 1. Boss Body (Stable Core)
        const fontSize = 160;
        const texture = TextCache.getTexture(e.emoji, fontSize, '#fff');
        
        ctx.drawImage(texture, -texture.width/2 + shakeX, -texture.height/2 + hoverY);

        // 2. Holographic Gyroscope
        ctx.save();
        let baseColor = '#22d3ee';
        let speedMult = 1.0;
        let ringJitter = 0;

        if (isFreezing) {
            speedMult = 5.0 + (transitionPhase * 5);
            ringJitter = transitionPhase * 3;
            if (transitionPhase >= 2) baseColor = '#ef4444';
            else if (transitionPhase >= 1) baseColor = '#fbbf24';
        }
        
        const rings = [
            { radiusX: 120, radiusY: 40, speed: 0.5 * speedMult, color: baseColor },
            { radiusX: 110, radiusY: 110, speed: -0.3 * speedMult, color: baseColor }, 
            { radiusX: 130, radiusY: 30, speed: 0.4 * speedMult, color: isFreezing ? '#ffffff' : '#67e8f9', offset: Math.PI / 4 }
        ];

        ctx.globalCompositeOperation = 'lighter';
        ctx.lineWidth = isFreezing ? 4 : 2;

        rings.forEach((ring) => {
            ctx.save();
            const rotation = time * ring.speed + (ring.offset || 0);
            const jitterRot = isFreezing ? (Math.random() - 0.5) * 0.2 : 0;
            ctx.rotate(rotation + jitterRot);
            
            const distortX = (Math.random()-0.5) * ringJitter;
            const distortY = (Math.random()-0.5) * ringJitter;

            ctx.strokeStyle = ring.color;
            ctx.shadowColor = ring.color;
            ctx.shadowBlur = isFreezing ? 20 : 10;
            
            ctx.beginPath();
            ctx.ellipse(0, 0, ring.radiusX + distortX, ring.radiusY + distortY, 0, 0, Math.PI * 2);
            ctx.stroke();
            
            const beadCount = isFreezing ? 6 : 3;
            for(let b=0; b<beadCount; b++) {
                const beadAngle = (time * (2 * speedMult) + (b * Math.PI * 2 / beadCount)) % (Math.PI*2);
                const bx = Math.cos(beadAngle) * ring.radiusX;
                const by = Math.sin(beadAngle) * ring.radiusY;
                
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(bx, by, isFreezing ? 5 : 3, 0, Math.PI*2);
                ctx.fill();
            }
            ctx.restore();
        });

        // 3. Hexagon Forcefield
        if (!isFreezing) {
            ctx.save();
            ctx.rotate(-time * 0.1);
            ctx.strokeStyle = 'rgba(34, 211, 238, 0.3)';
            ctx.lineWidth = 1;
            ctx.setLineDash([10, 10]);
            
            const hexSize = 160;
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = i * Math.PI / 3;
                const hx = Math.cos(angle) * hexSize;
                const hy = Math.sin(angle) * hexSize;
                if (i === 0) ctx.moveTo(hx, hy);
                else ctx.lineTo(hx, hy);
            }
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
        }

        ctx.restore();

        // 4. Status Text (Rendered above body rotation)
        ctx.save();
        ctx.translate(e.x, e.y);
        if (isFreezing) {
            ctx.fillStyle = transitionPhase >= 2 ? '#ef4444' : '#facc15';
            ctx.font = '900 24px monospace';
            ctx.textAlign = 'center';
            ctx.shadowBlur = 20;
            ctx.shadowColor = transitionPhase >= 2 ? 'red' : 'yellow';
            const text = transitionPhase === 3 ? "CRITICAL FAILURE" : (transitionPhase === 2 ? "SYSTEM MELTDOWN" : "WARNING");
            ctx.fillText(`⚠ ${text} ⚠`, 0, -160 + hoverY);
        } else {
            ctx.fillStyle = '#22d3ee';
            ctx.font = 'bold 12px monospace';
            ctx.textAlign = 'center';
            ctx.shadowBlur = 5;
            ctx.shadowColor = 'cyan';
            ctx.fillText("[ SYSTEM_LOCKED ]", 0, -140 + hoverY);
        }
        ctx.restore();
    }
};
