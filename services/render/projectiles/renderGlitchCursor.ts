
import { Projectile } from "../../../types";

export const renderGlitchCursor = (ctx: CanvasRenderingContext2D, p: Projectile) => {
    ctx.save();
    ctx.translate(p.x, p.y);
    const time = Date.now() / 50;

    // Jitter Effect
    const jx = (Math.random() - 0.5) * 4;
    const jy = (Math.random() - 0.5) * 4;
    ctx.translate(jx, jy);

    // Orientation: Point in velocity direction
    // If p.angle is set, use it. Otherwise calc from velocity
    let angle = p.angle || Math.atan2(p.vy, p.vx);
    
    // Adjust because cursor graphic usually points up-left (-45deg or -PI/4)
    // We want the tip to point in velocity direction. 
    // Standard cursor tip is at 0,0.
    ctx.rotate(angle + Math.PI / 4); // Rotate to align tip to right (0 rad)

    const scale = p.radius / 10; // Scale based on radius (e.g. radius 20 -> scale 2)
    ctx.scale(scale, scale);

    // Draw Helper
    const drawCursor = (color: string, offset: number) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        // Standard Mouse Cursor Shape
        ctx.moveTo(0, 0); // Tip
        ctx.lineTo(0, 20); // Left edge down
        ctx.lineTo(5, 15); // Indent
        ctx.lineTo(9, 24); // Tail left
        ctx.lineTo(12, 22); // Tail right
        ctx.lineTo(8, 14); // Indent right
        ctx.lineTo(14, 14); // Right edge
        ctx.closePath();
        ctx.fill();
    };

    // RGB Split Layers (Glitch)
    if (Math.random() < 0.5) {
        ctx.globalAlpha = 0.6;
        ctx.save();
        ctx.translate(-2, -2);
        drawCursor('#00ffff', 0); // Cyan
        ctx.restore();

        ctx.save();
        ctx.translate(2, 2);
        drawCursor('#ff00ff', 0); // Magenta
        ctx.restore();
    }

    // Main Body
    ctx.globalAlpha = 1;
    // Flicker between White and Red/Blue
    const coreColor = Math.floor(time) % 4 === 0 ? '#ef4444' : '#ffffff';
    drawCursor(coreColor, 0);

    // Stroke
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.stroke();

    ctx.restore();
};
