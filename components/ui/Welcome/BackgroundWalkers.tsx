
import React, { useState, useEffect } from 'react';
import { MENU_QUOTES } from '../../../data/memeContent';

export const BackgroundWalkers: React.FC = () => {
    const [menuWalkers, setMenuWalkers] = useState<{id: number, x: number, y: number, text: string, dir: number, scale: number, speed: number}[]>([]);

    useEffect(() => {
        // Background Walkers Logic
        const spawnInterval = setInterval(() => {
            const count = Math.floor(Math.random() * 3) + 1;
            const newItems = [];
            for (let i = 0; i < count; i++) {
                const quote = MENU_QUOTES[Math.floor(Math.random() * MENU_QUOTES.length)];
                const direction = 1; 
                const startX = -200 - (Math.random() * 200); 
                const y = 50 + Math.random() * (window.innerHeight - 200);
                const scale = 0.4 + Math.random() * 1.1; 
                const speed = scale * 1.5; 

                newItems.push({
                    id: Date.now() + i,
                    x: startX,
                    y: y,
                    text: quote,
                    dir: direction,
                    scale: scale,
                    speed: speed
                });
            }
            setMenuWalkers(prev => [...prev, ...newItems]);
        }, 500); 

        const animFrame = setInterval(() => {
            setMenuWalkers(prev => prev
                .map(w => ({ ...w, x: w.x + (w.speed * w.dir) })) 
                .filter(w => w.x < window.innerWidth + 200) 
            );
        }, 16);

        return () => {
            clearInterval(spawnInterval);
            clearInterval(animFrame);
        };
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-60">
            {menuWalkers.map(w => {
                const opacity = 0.2 + (w.scale - 0.4) * 0.7;
                return (
                    <div key={w.id} className="absolute flex flex-col items-center" style={{
                        left: w.x, 
                        top: w.y, 
                        transform: `scale(${w.scale})`,
                        opacity: opacity,
                        zIndex: Math.floor(w.scale * 10)
                    }}>
                        <div className="bg-[#f1f5f9] text-black px-4 py-2 rounded-xl mb-1 text-sm font-bold whitespace-nowrap shadow-md">
                            {w.text}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
