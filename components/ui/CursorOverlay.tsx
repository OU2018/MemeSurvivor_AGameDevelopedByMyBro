
import React, { useEffect, useRef } from 'react';
import { CursorRenderer } from '../../services/render/CursorRenderer';
import { GamePhase } from '../../types';
import { gameEngine } from '../../services/gameEngine';

interface CursorOverlayProps {
    phase: GamePhase;
    isPaused?: boolean;
}

export const CursorOverlay: React.FC<CursorOverlayProps> = ({ phase, isPaused = false }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rendererRef = useRef(new CursorRenderer());
    
    // Track mouse position globally
    const mousePos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

    useEffect(() => {
        const handleMove = (e: MouseEvent) => {
            mousePos.current = { x: e.clientX, y: e.clientY };
            // Update game engine mouse pos for laser sight logic
            // Note: GameEngine usually handles this via its own listener, but overlay doesn't block it.
        };

        window.addEventListener('mousemove', handleMove);
        return () => window.removeEventListener('mousemove', handleMove);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animId: number;

        const renderLoop = () => {
            if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
            
            const { x, y } = mousePos.current;
            
            // Pass gameEngine.state for camera info logic inside renderer if needed
            // The renderer imports gameEngine directly so we don't need to pass state.
            rendererRef.current.update(x, y, phase);
            rendererRef.current.render(ctx, canvas.width, canvas.height, phase);

            animId = requestAnimationFrame(renderLoop);
        };

        animId = requestAnimationFrame(renderLoop);
        return () => cancelAnimationFrame(animId);
    }, [phase]);

    // Use 'difference' blending only during active combat (unpaused) to create the inverted high-contrast effect.
    // When paused or in menus (Shop, Welcome), stick to 'normal' blending to preserve UI colors and ensure the black system cursor is visible.
    const isCombat = (phase === GamePhase.PLAYING || phase === GamePhase.SANDBOX);
    const blendMode = (isCombat && !isPaused) ? 'difference' : 'normal';

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-[9999]"
            style={{ mixBlendMode: blendMode }}
        />
    );
};
