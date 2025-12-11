
import React, { useState } from 'react';
import { SYNERGIES } from '../../../data/synergies';

interface StatusPanelSynergiesProps {
    synergies: Record<string, number>;
}

export const StatusPanelSynergies: React.FC<StatusPanelSynergiesProps> = ({ synergies }) => {
    const [hoveredSynergy, setHoveredSynergy] = useState<string | null>(null);

    return (
         <div className="flex flex-col gap-1 mt-2 items-start pointer-events-auto relative">
             {Object.entries(synergies)
                .sort(([, countA], [, countB]) => (countB as number) - (countA as number))
                .map(([tagId, rawCount]) => {
                 const count = rawCount as number;
                 const syn = SYNERGIES[tagId];
                 if (!syn) return null;
                 
                 // Find current active tier locally for visual check
                 let currentTier = 0;
                 let nextTier = null;
                 
                 for (const level of syn.levels) {
                     if (count >= level.count) {
                         currentTier = level.count;
                     } else {
                         if (!nextTier) nextTier = level;
                     }
                 }
                 const isActive = currentTier > 0;
                 
                 return (
                     <div 
                        key={tagId} 
                        className={`flex items-center gap-2 px-2 py-1 rounded border shadow-sm backdrop-blur-sm transition-all cursor-help
                            ${isActive ? 'bg-slate-800/90 border-slate-500' : 'bg-slate-900/50 border-slate-700 opacity-70'}`}
                        onMouseEnter={() => setHoveredSynergy(tagId)}
                        onMouseLeave={() => setHoveredSynergy(null)}
                     >
                         <span className="text-lg">{syn.icon}</span>
                         <span className="text-xs font-bold" style={{color: syn.color}}>{syn.name}</span>
                         <span className="text-[10px] text-slate-300 bg-slate-700 px-1 rounded font-mono">
                             {count} / {nextTier ? nextTier.count : currentTier}
                         </span>

                         {/* HOVER TOOLTIP */}
                         {hoveredSynergy === tagId && (
                             <div className="absolute left-full ml-2 top-0 w-64 bg-slate-900 border border-slate-500 p-3 rounded-lg shadow-2xl z-50 text-left animate-pop-in">
                                 <h4 className="font-bold text-sm mb-1" style={{color: syn.color}}>
                                     {syn.icon} {syn.name} ({count})
                                 </h4>
                                 <p className="text-[10px] text-slate-400 mb-2 italic">{syn.description}</p>
                                 
                                 <div className="space-y-1">
                                     {syn.levels.map(level => {
                                         const isUnlocked = count >= level.count;
                                         return (
                                             <div key={level.count} className={`flex gap-2 text-[10px] ${isUnlocked ? 'text-white' : 'text-slate-600'}`}>
                                                 <span className={`font-mono font-bold ${isUnlocked ? 'text-green-400' : ''}`}>({level.count})</span>
                                                 <span>{level.effectDesc}</span>
                                                 {isUnlocked && <span>✅</span>}
                                             </div>
                                         );
                                     })}
                                 </div>
                             </div>
                         )}
                     </div>
                 );
             })}
         </div>
    );
};
