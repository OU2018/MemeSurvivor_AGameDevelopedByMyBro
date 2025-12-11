
import { GameState, Vector2D } from "../../types";

export const renderTacticalLine = (ctx: CanvasRenderingContext2D, state: GameState, mousePos?: Vector2D) => {
    // Only render if unpaused
    if (state.isPaused || !mousePos) return;

    const p = state.player;
    
    const x = mousePos.x;
    const y = mousePos.y;
    
    // Create Flowing Gradient Line
    // Start (Player) -> End (Mouse)
    // Opacity fades out towards mouse
    const grad = ctx.createLinearGradient(p.x, p.y, x, y);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.4)'); // Near player
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');   // Fade out

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(x, y);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2;
    
    // Animated Dash (Flows AWAY from player)
    ctx.setLineDash([20, 15]);
    ctx.lineDashOffset = -Date.now() / 4; 
    ctx.stroke();
    
    ctx.restore();
};
