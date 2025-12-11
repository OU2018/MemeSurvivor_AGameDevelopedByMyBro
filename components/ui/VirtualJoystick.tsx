
import React, { useState, useRef, useEffect } from 'react';

interface VirtualJoystickProps {
    side: 'left' | 'right';
    onMove: (x: number, y: number) => void;
    onEnd: () => void;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ side, onMove, onEnd }) => {
    const [active, setActive] = useState(false);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const baseRef = useRef<HTMLDivElement>(null);
    const touchIdRef = useRef<number | null>(null);

    const radius = 60; // Joy stick radius

    // Reset on unmount
    useEffect(() => {
        return () => {
            if (active) onEnd();
        };
    }, []);

    const handleTouchStart = (e: React.TouchEvent) => {
        e.preventDefault();
        // Only handle first touch that hits this element if not already active
        if (touchIdRef.current !== null) return;

        const touch = e.changedTouches[0];
        touchIdRef.current = touch.identifier;
        setActive(true);
        updatePos(touch.clientX, touch.clientY);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        e.preventDefault();
        if (touchIdRef.current === null) return;

        // Find our touch
        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === touchIdRef.current) {
                updatePos(e.changedTouches[i].clientX, e.changedTouches[i].clientY);
                break;
            }
        }
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        e.preventDefault();
        if (touchIdRef.current === null) return;

        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === touchIdRef.current) {
                touchIdRef.current = null;
                setActive(false);
                setPos({ x: 0, y: 0 });
                onEnd();
                break;
            }
        }
    };

    const updatePos = (clientX: number, clientY: number) => {
        if (!baseRef.current) return;
        const rect = baseRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        let dx = clientX - centerX;
        let dy = clientY - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Clamp
        if (dist > radius) {
            dx = (dx / dist) * radius;
            dy = (dy / dist) * radius;
        }

        setPos({ x: dx, y: dy });
        
        // Normalize -1 to 1
        const nx = dx / radius;
        const ny = dy / radius;
        onMove(nx, ny);
    };

    const positionStyle = side === 'left' ? { left: '40px', bottom: '40px' } : { right: '40px', bottom: '40px' };

    return (
        <div 
            ref={baseRef}
            className={`absolute z-[80] w-32 h-32 rounded-full border-2 backdrop-blur-sm transition-opacity touch-none
                        ${active ? 'border-cyan-400 bg-cyan-900/30 opacity-80' : 'border-slate-500 bg-slate-800/20 opacity-40'}`}
            style={positionStyle}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
        >
            {/* Inner Knob */}
            <div 
                className={`absolute w-14 h-14 rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2 pointer-events-none
                            ${active ? 'bg-cyan-400 shadow-cyan-500/50' : 'bg-slate-400'}`}
                style={{
                    left: '50%',
                    top: '50%',
                    transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`
                }}
            >
                {/* Decoration */}
                {side === 'right' && active && (
                    <div className="absolute inset-0 rounded-full animate-ping bg-red-500 opacity-50" />
                )}
            </div>
            
            {/* Label */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-white text-xs font-bold uppercase opacity-50 pointer-events-none tracking-widest">
                {side === 'left' ? 'MOVE' : 'AIM'}
            </div>
        </div>
    );
};
