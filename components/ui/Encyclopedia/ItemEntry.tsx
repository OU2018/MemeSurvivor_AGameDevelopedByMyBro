
import React from 'react';
import { UpgradeOption } from '../../../types';

interface ItemEntryProps {
    item: UpgradeOption;
    isUnlocked: boolean;
    isSelected: boolean;
    onClick: () => void;
}

export const ItemEntry: React.FC<ItemEntryProps> = ({ item, isUnlocked, isSelected, onClick }) => {
    let borderClass = 'border-slate-600 bg-slate-800';
    
    if (isUnlocked) {
        if (item.rarity === 'mythic') borderClass = 'border-red-900 shadow-red-500/20 shadow-sm';
        else if (item.rarity === 'consumable') borderClass = 'border-amber-200 shadow-[0_0_15px_rgba(251,191,36,0.3)] shadow-sm bg-black'; // Luxury Black Gold
        else if (item.rarity === 'epic') borderClass = 'border-yellow-600 shadow-yellow-500/10 shadow-sm';
        else if (item.rarity === 'rare') borderClass = 'border-purple-800';
        else if (item.rarity === 'excellent') borderClass = 'border-blue-600';
    } else {
        borderClass = 'grayscale brightness-50 border-slate-800';
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
            {isUnlocked ? item.icon : '?'}
        </div>
    );
};
