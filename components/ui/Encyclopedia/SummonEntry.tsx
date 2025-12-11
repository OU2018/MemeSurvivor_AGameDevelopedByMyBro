
import React from 'react';
import { SummonConfig } from '../../../data/summons/summonStats';

interface SummonEntryProps {
    summon: SummonConfig;
    isUnlocked: boolean; // Added Prop
    isSelected: boolean;
    onClick: () => void;
}

export const SummonEntry: React.FC<SummonEntryProps> = ({ summon, isUnlocked, isSelected, onClick }) => {
    const tier = summon.tier || 'common';
    
    let borderClass = 'border-slate-600 bg-slate-800';
    
    if (isUnlocked) {
        if (tier === 'mythic') borderClass = 'border-red-900 shadow-red-500/20 shadow-sm bg-red-950/30';
        else if (tier === 'epic') borderClass = 'border-yellow-600 shadow-yellow-500/10 shadow-sm bg-yellow-950/30';
        else if (tier === 'rare') borderClass = 'border-purple-800 bg-purple-950/30';
        else borderClass = 'border-slate-600 bg-slate-800'; // Common
    } else {
        borderClass = 'border-slate-800 grayscale brightness-50';
    }

    if (isSelected) {
        borderClass += ' border-cyan-400 ring-1 ring-cyan-400 bg-slate-700';
    } else if (isUnlocked) {
        borderClass += ' hover:border-cyan-500/50';
    }

    return (
        <div 
            onClick={onClick}
            className={`
                aspect-square rounded-lg border-2 flex items-center justify-center text-3xl cursor-pointer transition-all hover:scale-105 relative
                ${borderClass}
            `}
        >
            {isUnlocked ? summon.emoji : '?'}
            
            {/* Optional Rank Dot (Only if unlocked) */}
            {isUnlocked && tier !== 'common' && (
                <div className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${
                    tier === 'mythic' ? 'bg-red-500' :
                    tier === 'epic' ? 'bg-yellow-500' :
                    'bg-purple-500'
                }`} />
            )}
        </div>
    );
};
