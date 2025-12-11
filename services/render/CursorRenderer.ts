
import { GamePhase } from "../../types";
import { RENDER_SCALE } from "./renderConfig";
import { gameEngine } from "../gameEngine";

interface CursorParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    color: string;
    size: number;
    type: 'code' | 'coin' | 'spark' | 'pixel' | 'ripple';
    char?: string;
}

export class CursorRenderer {
    private particles: CursorParticle[] = [];
    private lastPos = { x: 0, y: 0 };
    private hoverTarget: boolean = false;
    private isTitleHover: boolean = false; 

    // Matrix chars for system trail
    private chars = "01XYZA";

    update(mouseX: number, mouseY: number, phase: GamePhase) {
        // Calculate movement speed for particle emission intensity
        const dx = mouseX - this.lastPos.x;
        const dy = mouseY - this.lastPos.y;
        const speed = Math.sqrt(dx*dx + dy*dy);

        this.lastPos = { x: mouseX, y: mouseY };

        // Interactive Check (Hover)
        const el = document.elementFromPoint(mouseX, mouseY);
        
        // Generic interactive check
        this.hoverTarget = !!el?.closest('button, a, [role="button"], input, .cursor-pointer, [onClick]');
        
        // Specific Title Check for Glitch Cursor (Welcome Phase)
        this.isTitleHover = !!el?.closest('.cyber-glitch-title');

        // Spawn Particles Logic
        if (phase === GamePhase.SHOP) {
            // Gold trail in shop
            if (speed > 2 || Math.random() < 0.1) {
                 this.spawnTrail(mouseX, mouseY, 'coin', speed);
            }
        } else if (phase === GamePhase.WELCOME && this.isTitleHover) {
             // Data Hemorrhage: Spraying shards
             // Spawn multiple per frame for volume
             this.spawnTrail(mouseX, mouseY, 'code', speed);
             if (Math.random() < 0.7) this.spawnTrail(mouseX, mouseY, 'code', speed);
        } else if (speed > 5) {
             if (phase === GamePhase.PLAYING && !gameEngine.state.isPaused) {
                 // Minimal or no trail during combat to keep view clean
             } else if (this.hoverTarget) {
                 // Spawn ripples on fast move over interactive elements
                 if (Math.random() < 0.3) this.spawnTrail(mouseX, mouseY, 'ripple', speed);
             }
        }
        
        // Update Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            
            // Gravity for coins
            if (p.type === 'coin') {
                p.vy += 0.2;
            }
            
            // Physics for Data Leak (Code Shards)
            if (p.type === 'code') {
                p.vy += 0.4; // Heavy Gravity
                p.vx *= 0.95; // Air resistance
            }
            
            // Expansion for ripples
            if (p.type === 'ripple') {
                p.size += 0.5; 
            }
            
            p.life--;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    }

    private spawnTrail(x: number, y: number, type: 'coin' | 'code' | 'ripple', speed: number) {
        const life = 20 + Math.random() * 15;
        
        if (type === 'coin') {
            this.particles.push({
                x: x + (Math.random()-0.5)*10,
                y: y + (Math.random()-0.5)*10,
                vx: (Math.random()-0.5),
                vy: Math.random() * 2, // Drop down
                life, maxLife: life,
                color: Math.random() > 0.5 ? '#facc15' : '#fbbf24',
                size: 8 + Math.random() * 4,
                type: 'coin'
            });
        } else if (type === 'code') {
            // Data Hemorrhage: Fountain Ejection
            const angle = -Math.PI/2 + (Math.random()-0.5) * 1.5; // Upward cone
            const force = 3 + Math.random() * 5;
            
            const colors = ['#FFFFFF', '#FF00FF', '#00FFFF']; // Glitch Palette

            this.particles.push({
                x: x, 
                y: y,
                vx: Math.cos(angle) * force,
                vy: Math.sin(angle) * force,
                life: 30 + Math.random() * 20, 
                maxLife: 50,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: 3 + Math.random() * 5,
                type: 'code'
            });
        } else if (type === 'ripple') {
            this.particles.push({
                x: x, y: y,
                vx: 0, vy: 0,
                life: 20, maxLife: 20,
                color: '#22d3ee', // Cyan
                size: 2, // Start radius
                type: 'ripple'
            });
        }
    }

    render(ctx: CanvasRenderingContext2D, width: number, height: number, phase: GamePhase) {
        ctx.clearRect(0, 0, width, height);
        
        const { x, y } = this.lastPos;
        const time = Date.now();

        // 1. Render Particles (Behind Cursor)
        this.particles.forEach(p => {
            const alpha = p.life / p.maxLife;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            
            if (p.type === 'code') {
                // Draw Rect Shards for Glitch
                ctx.fillRect(p.x, p.y, p.size, p.size * (1 + Math.random())); // Flickering height
            } else if (p.type === 'coin') {
                ctx.font = '10px monospace';
                ctx.fillText('$', p.x, p.y);
            } else if (p.type === 'ripple') {
                ctx.strokeStyle = p.color;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
                ctx.stroke();
            }
        });
        ctx.globalAlpha = 1;

        // 2. Determine Cursor Type Logic
        const isPaused = gameEngine.state.isPaused;
        
        // Priority Logic
        if (phase === GamePhase.PLAYING || phase === GamePhase.SANDBOX) {
            if (isPaused) {
                // Show system/hover cursor in pause menu
                if (this.hoverTarget) this.renderHoverCursor(ctx, x, y, time);
                else this.renderSystemCursor(ctx, x, y);
            } else {
                this.renderCombatReticle(ctx, x, y);
            }
        } else if (phase === GamePhase.SHOP) {
            this.renderShopCursor(ctx, x, y, time);
        } else if ([GamePhase.STORY, GamePhase.BOSS_INTRO, GamePhase.ELITE_INTRO].includes(phase)) {
            this.renderDialogueCursor(ctx, x, y, time);
        } else if (phase === GamePhase.WELCOME && this.isTitleHover) {
            this.renderGlitchCursor(ctx, x, y, time);
        } else {
            if (this.hoverTarget) {
                this.renderHoverCursor(ctx, x, y, time);
            } else {
                this.renderSystemCursor(ctx, x, y);
            }
        }
    }
    
    // --- CURSOR STYLE RENDERERS ---

    private renderCombatReticle(ctx: CanvasRenderingContext2D, x: number, y: number) {
        // Just the Reticle, lines are handled in World Space now
        const isClicking = gameEngine.keysPressed['mousedown'];
        
        // High-Contrast Reticle (Difference Mode Enabled via CSS)
        // We draw in pure WHITE so that CSS 'mix-blend-mode: difference' 
        // can invert whatever background color is underneath.
        ctx.save();
        ctx.translate(x, y);
        
        // Dynamic State
        const scale = isClicking ? 0.8 : 1.0;
        const rotSpeed = isClicking ? 10 : 1;
        
        // Draw in pure WHITE to invert background colors effectively
        ctx.strokeStyle = '#ffffff'; 
        ctx.fillStyle = '#ffffff';
        ctx.lineWidth = 4; // Bold lines for visibility
        
        // Center Dot
        ctx.beginPath(); 
        ctx.arc(0, 0, 4, 0, Math.PI*2); 
        ctx.fill();
        
        // Outer Ring / Brackets
        const time = Date.now() / 1000;
        ctx.rotate(time * rotSpeed);
        ctx.scale(scale, scale);
        
        // Draw 4 Brackets
        const r = 16; // Slightly larger
        const gap = Math.PI / 3; // Wider gap
        
        for(let i=0; i<4; i++) {
            const startAngle = i * (Math.PI/2) + gap/2;
            const endAngle = (i+1) * (Math.PI/2) - gap/2;
            
            ctx.beginPath();
            ctx.arc(0, 0, r, startAngle, endAngle);
            ctx.stroke();
        }
        
        // Optional: If clicking, add a Red Pulse Ring (This will invert to Cyan on Black bg)
        if (isClicking) {
             ctx.strokeStyle = '#ff0000'; // Will show as Cyan on black
             ctx.lineWidth = 2;
             ctx.beginPath();
             ctx.arc(0, 0, r + 6, 0, Math.PI*2);
             ctx.stroke();
        }

        ctx.restore();
    }
    
    private renderSystemCursor(ctx: CanvasRenderingContext2D, x: number, y: number) {
        ctx.save();
        ctx.translate(x, y);
        
        // Cyber Arrow Shape
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 24);
        ctx.lineTo(6, 18);
        ctx.lineTo(12, 28); 
        ctx.lineTo(16, 26); 
        ctx.lineTo(10, 16);
        ctx.lineTo(18, 16);
        ctx.closePath();

        // Black Body
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fill();
        
        // Cyan Border
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#22d3ee'; 
        ctx.stroke();
        
        // Inner Glow Dot
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(6, 10, 1, 0, Math.PI*2); ctx.fill();

        ctx.restore();
    }

    private renderHoverCursor(ctx: CanvasRenderingContext2D, x: number, y: number, time: number) {
        const hoverY = Math.sin(time / 200) * 3; // Levitation
        
        ctx.save();
        ctx.translate(x, y + hoverY);
        
        // Tilt angle
        ctx.rotate(-Math.PI / 6); 

        // Hand Icon
        ctx.font = '30px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#22d3ee';
        ctx.shadowBlur = 10;
        ctx.fillText('👆', -8, 24); // Adjust position based on emoji alignment
        
        ctx.restore();
    }

    private renderShopCursor(ctx: CanvasRenderingContext2D, x: number, y: number, time: number) {
        const hoverY = Math.sin(time / 200) * 2;
        
        ctx.save();
        ctx.translate(x, y + hoverY);
        ctx.rotate(-Math.PI / 6); 

        // Golden Hand
        ctx.font = '30px sans-serif';
        ctx.fillStyle = '#facc15';
        ctx.shadowColor = '#b45309'; 
        ctx.shadowBlur = 5;
        ctx.fillText('👆', -8, 24);

        ctx.restore();
    }

    private renderDialogueCursor(ctx: CanvasRenderingContext2D, x: number, y: number, time: number) {
        ctx.save();
        ctx.translate(x, y);
        
        // Standard cursor for position base
        this.renderSystemCursor(ctx, 0, 0);

        // Animated "Next" bubble
        const offset = Math.sin(time / 150) * 3;
        
        ctx.font = '24px sans-serif';
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 5;
        ctx.fillText('💬', 20 + offset, 30); 

        ctx.restore();
    }

    private renderGlitchCursor(ctx: CanvasRenderingContext2D, x: number, y: number, time: number) {
        // DATA LEAK MODE:
        // Do NOT draw the main cursor. 
        // Just let the particles fountain (spawned in update loop).
        // This creates the effect that the cursor has dissolved into the leak.
    }
}
