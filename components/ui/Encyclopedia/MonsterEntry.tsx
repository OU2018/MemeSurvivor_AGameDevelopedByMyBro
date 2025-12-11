import React from 'react';
import { EnemyConfig } from '../../../types';

interface MonsterEntryProps {
    config: EnemyConfig;
    isUnlocked: boolean;
    isSelected: boolean;
    onClick: () => void;
}

export const MonsterEntry: React.FC<MonsterEntryProps> = ({ config, isUnlocked, isSelected, onClick }) => {
    const tier = config.tier || 'common';
    const isBonus = config.behavior === 'bonus';

    let borderClass = 'border-slate-600 bg-slate-800';
    if (isUnlocked) {
        if (tier === 'boss') borderClass = 'border-red-600 bg-red-900/20';
        else if (tier === 'epic') borderClass = 'border-yellow-500 bg-yellow-900/20';
        else if (tier === 'rare') borderClass = 'border-purple-500 bg-purple-900/20';
        
        if (isBonus) borderClass += ' border-yellow-400 shadow-lg shadow-yellow-500/20';
    } else {
        borderClass = 'border-slate-800 grayscale brightness-50';
    }

    if (isSelected) {
        borderClass += ' border-cyan-400 bg-slate-700';
    }

    return (
        <div 
            onClick={onClick}
            className={`
                aspect-square rounded-lg border-2 flex items-center justify-center text-3xl cursor-pointer transition-all hover:scale-105
                ${borderClass}
            `}
        >
            {isUnlocked ? config.emoji : '?'}
        </div>
    );
};