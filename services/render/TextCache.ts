
export class TextCache {
    // Key format: "text_size_color_strokeColor"
    private static cache = new Map<string, HTMLCanvasElement>();
    private static accessTimes = new Map<string, number>();
    private static MAX_CACHE_SIZE = 1000;
    private static CLEANUP_INTERVAL = 600; // Frames (approx 10s)
    private static frameCount = 0;

    /**
     * Get a cached canvas element for the given text configuration.
     * Generates it if it doesn't exist.
     */
    static getTexture(
        text: string, 
        fontSize: number, 
        color: string, 
        strokeColor: string | null = null, 
        fontFace: string = '"Noto Sans SC", sans-serif'
    ): HTMLCanvasElement {
        // Round font size to reduce cache fragmentation (bucket by 2px)
        // Safety: Ensure size is at least 0 to avoid negative math
        const size = Math.max(0, Math.floor(fontSize / 2) * 2);
        const key = `${text}_${size}_${color}_${strokeColor || 'none'}`;
        const now = Date.now();

        if (this.cache.has(key)) {
            this.accessTimes.set(key, now);
            return this.cache.get(key)!;
        }

        // Generate new texture
        const canvas = document.createElement('canvas');
        // Add padding to accommodate glow/stroke/emoji bounding box issues
        const padding = Math.ceil(size * 0.5); 
        
        // FIX: Enforce minimum dimensions (1x1) to prevent IndexSizeError in drawImage
        // This prevents the "Black Screen / World Gone" bug when entities shrink to 0
        const w = Math.max(1, size + padding * 2);
        const h = Math.max(1, size + padding * 2);
        
        canvas.width = w;
        canvas.height = h;
        
        const ctx = canvas.getContext('2d');

        if (ctx) {
            // Only draw if size is reasonable
            if (size > 0) {
                ctx.font = `900 ${size}px ${fontFace}`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.translate(canvas.width / 2, canvas.height / 2);

                // Optimization: Only stroke if specifically requested (expensive)
                if (strokeColor) {
                    ctx.strokeStyle = strokeColor;
                    ctx.lineWidth = Math.max(2, size * 0.08);
                    ctx.lineJoin = 'round';
                    ctx.strokeText(text, 0, 0);
                }

                ctx.fillStyle = color;
                ctx.fillText(text, 0, 0);
            }
        }

        this.cache.set(key, canvas);
        this.accessTimes.set(key, now);

        // Periodic Cleanup
        this.frameCount++;
        if (this.frameCount > this.CLEANUP_INTERVAL) {
            this.cleanup();
            this.frameCount = 0;
        }

        return canvas;
    }

    private static cleanup() {
        if (this.cache.size <= this.MAX_CACHE_SIZE / 2) return;
        
        const now = Date.now();
        const EXPIRE_MS = 20000; // 20 seconds unused

        for (const [key, time] of this.accessTimes.entries()) {
            if (now - time > EXPIRE_MS) {
                this.cache.delete(key);
                this.accessTimes.delete(key);
            }
        }
        
        // Hard limit fallback
        if (this.cache.size > this.MAX_CACHE_SIZE) {
            this.cache.clear();
            this.accessTimes.clear();
        }
    }
}
