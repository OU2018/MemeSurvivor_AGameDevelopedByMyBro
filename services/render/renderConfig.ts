
export const RENDER_SCALE = 0.6;

// Shared bounds interface
export interface ViewBounds {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    isLowQuality: boolean; // LOD Flag
}
