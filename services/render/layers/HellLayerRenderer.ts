
import { GameState } from "../../../types";
import { RENDER_SCALE } from "../renderConfig";

export const HellLayerRenderer = {
    hellCache: null as HTMLCanvasElement | null,

    render(ctx: CanvasRenderingContext2D, state: GameState, width: number, height: number) {
        // Check if the hell fire zone is active
        const hellFire = state.zones.find(z => z.type === 'kpi_hell_fire');
        if (!hellFire) return;

        // Init offscreen canvas
        if (!this.hellCache || this.hellCache.width !== width || this.hellCache.height !== height) {
            this.hellCache = document.createElement('canvas');
            this.hellCache.width = width;
            this.hellCache.height = height;
        }
        const hCtx = this.hellCache.getContext('2d');
        if (!hCtx) return;

        hCtx.clearRect(0, 0, width, height);

        // 1. Draw the "Hell" texture (Dark Red Glitch - No Strobing)
        hCtx.save();
        const time = Date.now();
        
        // Base Dark Red Background (Stable Opacity)
        // No sine wave pulsing for opacity to avoid flashing
        hCtx.fillStyle = 'rgba(69, 10, 10, 0.4)'; // Dark Red #450a0a
        hCtx.fillRect(0, 0, width, height);

        // --- DARK GLITCH ELEMENTS ---
        // Instead of 'lighter', we use 'source-over' with dark colors
        
        // Digital Rain / Glitch Lines (Black/Darker Red)
        hCtx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        
        // Scanlines
        for(let y = 0; y < height; y += 120) {
            const scanOffset = (y + Math.floor(time * 0.2)) % height;
            hCtx.fillRect(0, scanOffset, width, 6);
        }
        
        // Random "Dead Pixel" blocks (Black)
        if (Math.random() < 0.4) {
            hCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            const count = 5;
            for(let i=0; i<count; i++) {
                const rx = Math.random() * width;
                const ry = Math.random() * height;
                const rw = 50 + Math.random() * 150;
                const rh = 10 + Math.random() * 40;
                hCtx.fillRect(rx, ry, rw, rh);
            }
        }

        // --- STATIC NOISE (Grain) ---
        // Draw some static noise without flashing
        // We simulate this by drawing a few random thin lines
        hCtx.strokeStyle = 'rgba(50, 0, 0, 0.5)';
        hCtx.lineWidth = 1;
        hCtx.beginPath();
        for(let i=0; i<10; i++) {
            const y = Math.random() * height;
            hCtx.moveTo(0, y);
            hCtx.lineTo(width, y);
        }
        hCtx.stroke();

        // 2. MASKING: Punch holes for Safe Zones using 'destination-out'
        hCtx.globalCompositeOperation = 'destination-out';
        
        // We need to transform World Space coordinates of zones to Screen Space for the mask
        const cam = state.camera;
        const scale = RENDER_SCALE;
        const screenCX = width / 2;
        const screenCY = height / 2;

        state.zones.forEach(z => {
            if (z.type === 'safe_haven') {
                const sx = (z.x - cam.x) * scale + screenCX;
                const sy = (z.y - cam.y) * scale + screenCY;
                const sRadius = z.radius * scale; // Keep tight to visual

                hCtx.beginPath();
                hCtx.arc(sx, sy, sRadius, 0, Math.PI * 2);
                hCtx.fill();
            }
        });

        hCtx.restore();

        // 3. Draw the masked layer onto the main canvas
        ctx.drawImage(this.hellCache, 0, 0);
    }
};
