
import React, { useEffect, useState } from 'react';

interface ConfettiSystemProps {
    active: boolean;
}

export const ConfettiSystem: React.FC<ConfettiSystemProps> = ({ active }) => {
    const [isRendered, setIsRendered] = useState(false);
    const [isFading, setIsFading] = useState(false);

    useEffect(() => {
        if (active) {
            setIsRendered(true);
            setIsFading(false);
        } else {
            // Start fading out
            setIsFading(true);
            // Remove from DOM after transition (2s matches CSS)
            const timer = setTimeout(() => {
                setIsRendered(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [active]);

    if (!isRendered) return null;

    return (
        <div className={`confetti-container ${isFading ? 'opacity-0 transition-opacity duration-[2000ms] ease-out' : 'opacity-100'}`}>
            {Array.from({ length: 60 }).map((_, i) => {
                const colors = ['#f43f5e', '#10b981', '#3b82f6', '#facc15', '#a855f7'];
                const color = colors[Math.floor(Math.random() * colors.length)];
                const left = Math.random() * 100;
                const delay = Math.random() * 3;
                const duration = 3 + Math.random() * 2;
                
                return (
                    <div key={i} className="confetti-piece" style={{
                        left: `${left}%`,
                        backgroundColor: color,
                        animation: `confetti-fall ${duration}s linear infinite`,
                        animationDelay: `${delay}s`
                    }} />
                );
            })}
        </div>
    );
};
