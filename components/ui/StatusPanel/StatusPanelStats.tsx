
import React, { useEffect, useRef, useState } from 'react';

interface StatusPanelStatsProps {
    gold: number;
}

export const StatusPanelStats: React.FC<StatusPanelStatsProps> = ({ gold }) => {
    // Gold Effect Logic
    const lastGoldRef = useRef(gold);
    const [goldDiff, setGoldDiff] = useState(0);

    useEffect(() => {
        if (gold !== lastGoldRef.current) {
            const diff = gold - lastGoldRef.current;
            lastGoldRef.current = gold; 
            
            if (diff > 0) {
                setGoldDiff(diff);
                const t = setTimeout(() => setGoldDiff(0), 1000);
                return () => clearTimeout(t);
            } else {
                setGoldDiff(0);
            }
        }
    }, [gold]);

    return (
         <div className="flex items-center gap-2 bg-yellow-900/80 px-4 py-2 rounded-full border-2 border-yellow-600 self-start shadow-lg relative pointer-events-auto">
             <span className="text-2xl">💰</span>
             <span className="text-yellow-300 font-mono font-bold text-2xl">{gold}</span>
             {goldDiff > 0 && (
                 <span className="absolute -right-12 top-0 text-yellow-300 font-bold animate-ping">+{goldDiff}</span>
             )}
         </div>
    );
};
