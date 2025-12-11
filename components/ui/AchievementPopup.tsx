
import React, { useState, useEffect, useRef } from 'react';
import { gameEngine } from '../../services/gameEngine';

export const AchievementPopup: React.FC = () => {
    const [currentNotification, setCurrentNotification] = useState<{title: string, description: string, icon: string} | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    
    // Using a ref to track if we are currently processing a notification to prevent overlapping
    const processingRef = useRef(false);

    useEffect(() => {
        let intervalId: number;

        const processQueue = async () => {
            if (processingRef.current) return;

            const queue = gameEngine.state.achievementNotificationQueue;
            if (queue && queue.length > 0) {
                processingRef.current = true;
                
                // Get next item (FIFO)
                const nextItem = queue.shift();
                
                if (nextItem) {
                    setCurrentNotification(nextItem);
                    setIsVisible(true);

                    // Show Duration
                    await new Promise(resolve => setTimeout(resolve, 2500));
                    
                    setIsVisible(false);
                    
                    // Fade Out Duration
                    await new Promise(resolve => setTimeout(resolve, 300));
                    
                    setCurrentNotification(null);
                }
                
                processingRef.current = false;
                
                // If more items, trigger next immediately (small buffer)
                if (queue.length > 0) {
                    setTimeout(processQueue, 100); 
                }
            }
        };

        // Poll the queue frequently
        intervalId = window.setInterval(processQueue, 200);

        return () => clearInterval(intervalId);
    }, []);

    if (!currentNotification) return null;

    return (
         <div 
            className={`fixed bottom-4 right-4 bg-slate-800/95 backdrop-blur border-2 border-yellow-500 p-3 rounded-lg shadow-2xl flex items-center gap-4 z-[999] pointer-events-none transition-all duration-300 transform
            ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
            style={{ maxWidth: '320px' }}
         >
             <div className="text-3xl bg-slate-700/50 w-12 h-12 flex items-center justify-center rounded shrink-0 border border-slate-600">
                 {currentNotification.icon}
             </div>
             <div className="min-w-0">
                 <div className="text-yellow-400 font-bold text-[10px] uppercase tracking-wider mb-0.5">解锁成就</div>
                 <div className="text-white font-bold text-sm truncate">{currentNotification.title}</div>
                 <div className="text-slate-400 text-xs truncate">{currentNotification.description}</div>
             </div>
         </div>
    );
};
