
import { GameState } from "../../../types";

export const BackgroundRenderer = {
    boundaryCache: null as HTMLCanvasElement | null,
    cachedWidth: 0,
    cachedHeight: 0,

    getBoundaryCache(w: number, h: number): HTMLCanvasElement {
        if (this.boundaryCache && this.cachedWidth === w && this.cachedHeight === h) {
            return this.boundaryCache;
        }

        const canvas = document.createElement('canvas');
        const padding = 60; 
        canvas.width = w + padding * 2;
        canvas.height = h + padding * 2;
        const ctx = canvas.getContext('2d');
        if (!ctx) return canvas;

        ctx.translate(padding, padding);

        ctx.lineWidth = 12;
        ctx.strokeStyle = 'rgba(14, 165, 233, 0.2)'; 
        ctx.strokeRect(0, 0, w, h);
        
        ctx.lineWidth = 6;
        ctx.strokeStyle = 'rgba(14, 165, 233, 0.4)';
        ctx.strokeRect(0, 0, w, h);

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#0ea5e9';
        ctx.strokeRect(0, 0, w, h);

        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.6)';
        ctx.strokeRect(6, 6, w - 12, h - 12);

        ctx.lineWidth = 8;
        ctx.strokeStyle = '#e0f2fe'; 
        const cornerSize = 60;
        
        ctx.beginPath(); ctx.moveTo(0, cornerSize); ctx.lineTo(0, 0); ctx.lineTo(cornerSize, 0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(w - cornerSize, 0); ctx.lineTo(w, 0); ctx.lineTo(w, cornerSize); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(w, h - cornerSize); ctx.lineTo(w, h); ctx.lineTo(w - cornerSize, h); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cornerSize, h); ctx.lineTo(0, h); ctx.lineTo(0, h - cornerSize); ctx.stroke();

        this.boundaryCache = canvas;
        this.cachedWidth = w;
        this.cachedHeight = h;
        
        return canvas;
    },

    renderBackground(ctx: CanvasRenderingContext2D, state: GameState) {
        const mapLeft = -state.mapWidth / 2;
        const mapTop = -state.mapHeight / 2;
        
        ctx.save();
        ctx.beginPath();
        ctx.rect(mapLeft, mapTop, state.mapWidth, state.mapHeight);
        ctx.clip();
        
        ctx.strokeStyle = 'rgba(30, 41, 59, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const gridSize = 100;
        
        for(let x = mapLeft; x <= mapLeft + state.mapWidth; x+=gridSize) {
            ctx.moveTo(x, mapTop);
            ctx.lineTo(x, mapTop + state.mapHeight);
        }
        for(let y = mapTop; y <= mapTop + state.mapHeight; y+=gridSize) {
            ctx.moveTo(mapLeft, y);
            ctx.lineTo(mapLeft + state.mapWidth, y);
        }
        ctx.stroke();
        ctx.restore();

        const cache = this.getBoundaryCache(state.mapWidth, state.mapHeight);
        const padding = 60;
        ctx.drawImage(cache, mapLeft - padding, mapTop - padding);

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)'; 
        ctx.lineWidth = 4;
        const time = Date.now() / 50;
        ctx.setLineDash([50, 50]); 
        ctx.lineDashOffset = -time; 
        ctx.strokeRect(mapLeft, mapTop, state.mapWidth, state.mapHeight);
        ctx.restore();
    },

    renderMapMask(ctx: CanvasRenderingContext2D, state: GameState) {
        const w = state.mapWidth;
        const h = state.mapHeight;
        const maskSize = 10000; // Giant rects
        
        ctx.fillStyle = '#0f172a'; // Match background color (or black)
        
        // Draw 4 rectangles around the center map area
        ctx.fillRect(-maskSize/2, -maskSize/2 - h/2, maskSize, maskSize/2);
        ctx.fillRect(-maskSize/2, h/2, maskSize, maskSize/2);
        ctx.fillRect(-maskSize/2 - w/2, -h/2, maskSize/2, h);
        ctx.fillRect(w/2, -h/2, maskSize/2, h);
    }
};
