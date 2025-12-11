
import { GameState } from "../../types";
import { ViewBounds } from "./renderConfig";

/**
 * 渲染世界空间内的飘字 (伤害数字, 聊天气泡)
 * 必须在 Camera Transform 生效时调用
 */
export const renderFloatingTexts = (ctx: CanvasRenderingContext2D, state: GameState, bounds: ViewBounds) => {
    state.floatingTexts.forEach(ft => {
        // Culling
        if (ft.x < bounds.minX || ft.x > bounds.maxX || ft.y < bounds.minY || ft.y > bounds.maxY) return;

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        if (ft.type === 'chat') {
            ctx.font = '16px "Noto Sans SC", sans-serif';
            
            if (bounds.isLowQuality) {
                ctx.fillStyle = 'white';
                ctx.fillText(ft.text, ft.x, ft.y - 25);
            } else {
                const textMetrics = ctx.measureText(ft.text);
                const width = textMetrics.width + 20;
                const height = 30;
                
                ctx.fillStyle = 'white';
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 2;
                
                ctx.beginPath();
                if (ctx.roundRect) {
                    ctx.roundRect(ft.x - width/2, ft.y - 40, width, height, 10);
                } else {
                    ctx.rect(ft.x - width/2, ft.y - 40, width, height);
                }
                ctx.fill();
                ctx.stroke();
                
                ctx.fillStyle = 'black';
                ctx.fillText(ft.text, ft.x, ft.y - 25);
            }
        } else {
            const scale = ft.scale || 1;
            const baseSize = ft.type === 'gold' ? 28 : 24;
            const fontSize = Math.floor(baseSize * scale);
            
            if (ft.isCrit) {
                ctx.save();
                ctx.translate(ft.x, ft.y);
                ctx.scale(scale, scale);
                ctx.rotate((Math.random() - 0.5) * 0.2); 
                
                ctx.fillStyle = '#ef4444'; 
                ctx.globalAlpha = 0.8;
                
                const spikes = 8;
                const outerR = 30;
                const innerR = 15;
                
                ctx.beginPath();
                for(let i=0; i<spikes*2; i++) {
                    const angle = (i / (spikes*2)) * Math.PI * 2;
                    const r = i%2===0 ? outerR : innerR;
                    ctx.lineTo(Math.cos(angle)*r, Math.sin(angle)*r);
                }
                ctx.closePath();
                ctx.fill();
                
                ctx.strokeStyle = '#facc15';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                ctx.restore();
            }

            ctx.fillStyle = ft.color;
            ctx.font = `900 ${fontSize}px "Arial Black", "Noto Sans SC", sans-serif`;
            
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 4;
            ctx.lineJoin = 'round';
            ctx.strokeText(ft.text, ft.x, ft.y);
            
            ctx.fillText(ft.text, ft.x, ft.y);
        }
        ctx.restore();
    });
};

// Helper: Render Windows 98 Style Popup
const renderSystemPopup = (ctx: CanvasRenderingContext2D, x: number, y: number, title: string, text: string) => {
    const w = 240;
    const h = 100;
    
    ctx.save();
    ctx.translate(x - w/2, y - h/2);
    
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(4, 4, w, h);
    
    // Window Body
    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(0, 0, w, h);
    
    // Bevel Highlight
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, 2);
    ctx.fillRect(0, 0, 2, h);
    
    // Bevel Shadow
    ctx.fillStyle = '#808080';
    ctx.fillRect(w-2, 0, 2, h);
    ctx.fillRect(0, h-2, w, 2);
    
    // Title Bar
    ctx.fillStyle = '#000080';
    ctx.fillRect(3, 3, w-6, 20);
    
    // Title Text
    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';
    ctx.fillText(title, 8, 17);
    
    // Close Button [X]
    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(w-20, 5, 14, 14);
    ctx.fillStyle = '#000';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('x', w-13, 15);
    
    // Content Icon (Red X)
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(30, 60, 15, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.moveTo(20, 50); ctx.lineTo(40, 70);
    ctx.moveTo(40, 50); ctx.lineTo(20, 70);
    ctx.stroke();
    
    // Content Text
    ctx.font = '12px "Noto Sans SC", sans-serif';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'left';
    ctx.fillText(text, 60, 55);
    
    // Button
    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(90, 75, 60, 20);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(90, 75, 60, 20);
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.fillText("OK", 120, 90);
    
    ctx.restore();
};

const renderStaticNoise = (ctx: CanvasRenderingContext2D, width: number, height: number, intensity: number) => {
    if (intensity <= 0) return;
    
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    
    // Draw random rects for noise
    const count = Math.floor(intensity * 100);
    
    for (let i = 0; i < count; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const w = Math.random() * 200;
        const h = 2 + Math.random() * 4;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.3 * intensity})`;
        ctx.fillRect(x, y, w, h);
    }
    ctx.restore();
}

/**
 * 渲染屏幕空间内的 UI (Boss血条, 警告, 遮罩)
 * 必须在 ctx.restore() 之后调用 (Screen Space)
 */
export const renderUI = (ctx: CanvasRenderingContext2D, state: GameState, width: number, height: number) => {
    const now = state.timeAlive;
    
    // Damage Red Flash
    if (now - state.player.lastDamageTime < 15) {
        const alpha = 1 - (now - state.player.lastDamageTime) / 15;
        const grad = ctx.createRadialGradient(width/2, height/2, height*0.4, width/2, height/2, height*0.8);
        grad.addColorStop(0, 'rgba(255, 0, 0, 0)');
        grad.addColorStop(1, `rgba(255, 0, 0, ${0.4 * alpha})`);
        
        ctx.save();
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
    }

    // --- CINEMATIC TRANSITION OVERLAY (SYSTEM MELTDOWN) ---
    const boss = state.enemies.find(e => e.config.behavior === 'boss');
    if (boss && boss.customVars?.inCinematicTransition) {
        const timer = boss.customVars.transitionTimer || 0;
        const T = 600 - timer; // Elapsed frames (0-600)
        
        // 1. Dark Vignette (Base Layer)
        const vAlpha = Math.min(0.9, T / 120);
        ctx.fillStyle = `rgba(0, 0, 0, ${vAlpha})`;
        ctx.fillRect(0, 0, width, height);

        // 2. Popups (Phase 1 & 2)
        if (boss.customVars.popups) {
            boss.customVars.popups.forEach((p: any) => {
                const screenX = p.x * width;
                const screenY = p.y * height;
                renderSystemPopup(ctx, screenX, screenY, p.title, p.text);
            });
        }

        // 3. Glitch Effects (Phase 2) - Critical Meltdown
        if (T >= 360 && T < 540) { // 6s - 9s
            // Progressive Noise
            const noiseIntensity = (T - 360) / 180; // 0 to 1 over 3 seconds
            renderStaticNoise(ctx, width, height, noiseIntensity);

            // RGB Split Whole Screen
            if (Math.random() < 0.3) {
                const shift = (Math.random() - 0.5) * 20;
                const barH = Math.random() * 50;
                const y = Math.random() * height;
                
                try {
                    const slice = ctx.getImageData(0, y, width, barH);
                    ctx.putImageData(slice, shift, y);
                } catch(e) {} 
                
                ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 0, 0, 0.2)' : 'rgba(0, 255, 255, 0.2)';
                ctx.fillRect(0, y, width, barH);
            }
        }

        // 4. Singularity / TV Off (Phase 3: 9s - 10s)
        if (T >= 540) {
            const shutDuration = 15;
            const elapsedShut = T - 540;
            
            ctx.fillStyle = 'black';

            if (elapsedShut < shutDuration) {
                const progress = elapsedShut / shutDuration; // 0 to 1
                const snap = Math.pow(progress, 3); 
                
                const h = height * snap; 
                ctx.fillRect(0, 0, width, height / 2 * snap); 
                ctx.fillRect(0, height - (height / 2 * snap), width, height / 2 * snap); 
                
                const w = width * (snap * 0.2); 
                ctx.fillRect(0, 0, w, height);
                ctx.fillRect(width - w, 0, w, height);
                
                ctx.fillStyle = 'white';
                const lineH = 4 * (1 - snap);
                ctx.fillRect(0, height/2 - lineH/2, width, lineH);
                
            } else {
                ctx.fillRect(0, 0, width, height);
                
                const dotTime = elapsedShut - shutDuration;
                if (dotTime < 30) {
                    const fade = 1 - (dotTime / 30);
                    ctx.fillStyle = `rgba(255, 255, 255, ${fade})`;
                    const r = 4 * fade;
                    ctx.beginPath();
                    ctx.arc(width/2, height/2, r, 0, Math.PI * 2);
                    ctx.fill();
                    
                    ctx.shadowBlur = 20 * fade;
                    ctx.shadowColor = 'white';
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }
            }
        }
    }

    // --- WHITEOUT FLASH (Explosion Transition) ---
    if (boss && boss.customVars && boss.customVars.whiteoutTimer > 0) {
        boss.customVars.whiteoutTimer--;
        const alpha = boss.customVars.whiteoutTimer / 60; // Fade out over 1s
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fillRect(0, 0, width, height);
    }

    // Wave Clearing Overlay
    if (state.isWaveClearing) {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, height/2 - 60, width, 120);
        
        ctx.font = '900 60px "Noto Sans SC", sans-serif';
        ctx.fillStyle = '#fcd34d'; 
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 8;
        ctx.strokeText("打卡下班中...", width/2, height/2);
        ctx.fillText("打卡下班中...", width/2, height/2);
        ctx.restore();
    }

    // Boss Bar
    if (boss) {
        const bossPct = Math.max(0, boss.hp / boss.maxHp);
        const barW = Math.min(600, width - 40);
        const barH = 24;
        const startX = width / 2 - barW / 2;
        const startY = 120; 

        ctx.save();
        ctx.fillStyle = boss.phase === 3 ? '#3f3f46' : (boss.phase === 2 ? '#7f1d1d' : '#ef4444');
        ctx.font = 'bold 24px "Noto Sans SC", sans-serif';
        ctx.textAlign = 'center';
        
        let baseName = boss.config.name || "BOSS";
        if (!boss.config.name) {
            if (boss.config.type === 'boss_kpi') baseName = "KPI 大魔王";
            else if (boss.config.type === 'boss_glitch') baseName = "Bug 集合体";
            else if (boss.config.type === 'boss_ai') baseName = "AI 终结者";
            else baseName = boss.config.description.split('，')[0] || "BOSS";
        }

        const name = boss.isTransitioning || boss.customVars?.inCinematicTransition ? "系统重启中..." : (boss.phase === 3 ? `${baseName} (终极形态)` : (boss.phase === 2 ? `${baseName} (二阶段)` : baseName));
        
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        ctx.strokeText(name, width / 2, startY - 10);
        ctx.fillText(name, width / 2, startY - 10);

        // Bar Background
        ctx.fillStyle = '#1f2937';
        ctx.strokeStyle = boss.phase === 3 ? '#94a3b8' : (boss.phase === 2 ? '#ef4444' : '#fca5a5');
        ctx.lineWidth = 2;
        ctx.fillRect(startX, startY, barW, barH);
        ctx.strokeRect(startX, startY, barW, barH);

        // Bar Foreground
        if (!boss.isTransitioning && !boss.customVars?.inCinematicTransition) {
             ctx.fillStyle = boss.phase === 3 ? '#dc2626' : (boss.phase === 2 ? '#991b1b' : '#dc2626');
             ctx.fillRect(startX, startY, barW * bossPct, barH);
             
             if (boss.tempShield && boss.tempShield > 0 && boss.maxTempShield) {
                 const shieldPct = Math.min(1, boss.tempShield / boss.maxTempShield);
                 ctx.fillStyle = '#94a3b8'; 
                 ctx.fillRect(startX, startY, barW * shieldPct, barH);
                 
                 ctx.fillStyle = 'white';
                 ctx.font = 'bold 12px monospace';
                 ctx.fillText(`🛡️ ${Math.ceil(boss.tempShield)}`, startX + barW * shieldPct, startY - 5);
             }

             ctx.fillStyle = 'white';
             ctx.font = 'bold 14px sans-serif';
             ctx.strokeStyle = 'black';
             ctx.lineWidth = 2;
             ctx.strokeText(`${Math.ceil(boss.hp)} / ${Math.ceil(boss.maxHp)}`, width/2, startY + 17);
             ctx.fillText(`${Math.ceil(boss.hp)} / ${Math.ceil(boss.maxHp)}`, width/2, startY + 17);
        } else {
             const t = (Date.now() % 500) / 500;
             ctx.fillStyle = `rgba(255, 255, 255, ${t})`;
             ctx.fillRect(startX, startY, barW, barH);
        }
        ctx.restore();
    }
};
