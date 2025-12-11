
export class AssetCache {
    public static charmTexture: HTMLCanvasElement;
    public static frenziedSimpTexture: HTMLCanvasElement;

    // Initialize all assets
    static init() {
        if (!this.charmTexture) this.initCharmTexture();
        if (!this.frenziedSimpTexture) this.initFrenziedSimpTexture();
    }

    private static initCharmTexture() {
        const size = 64;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const center = size / 2;
        const radius = size * 0.4;

        // 1. Semi-transparent Pink Bubble (Glassy look)
        const grad = ctx.createRadialGradient(center - radius*0.3, center - radius*0.3, radius * 0.1, center, center, radius);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.9)'); // Highlight
        grad.addColorStop(0.3, 'rgba(244, 114, 182, 0.4)'); // Pink tint
        grad.addColorStop(1, 'rgba(236, 72, 153, 0.8)'); // Darker rim
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, Math.PI * 2);
        ctx.fill();

        // 2. Bubble shine (Reflection)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.ellipse(center - radius * 0.4, center - radius * 0.4, radius * 0.2, radius * 0.1, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        // 3. Heart Core
        ctx.font = '30px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ef4444'; // Red heart
        ctx.shadowColor = '#f472b6'; // Pink glow
        ctx.shadowBlur = 10;
        // Draw heart slightly lower to center visually
        ctx.fillText('❤', center, center + 2);

        this.charmTexture = canvas;
    }

    private static initFrenziedSimpTexture() {
        const size = 64; 
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const center = size / 2;

        // 1. Draw Dog Emoji
        ctx.font = '48px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🐶', center, center + 4);

        // 2. Draw Red Overlay (Rage Mode) - "Source Atop" keeps shape but tints it
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = 'rgba(239, 68, 68, 0.5)'; // 50% Red tint
        ctx.fillRect(0, 0, size, size);

        // 3. Reset Composite
        ctx.globalCompositeOperation = 'source-over';

        // 4. Angry Symbol
        ctx.font = '24px sans-serif';
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = 'white';
        ctx.shadowBlur = 2;
        ctx.fillText('💢', center + 20, center - 15);

        this.frenziedSimpTexture = canvas;
    }
}

// Auto-init on load if window exists
if (typeof window !== 'undefined') {
    AssetCache.init();
}
