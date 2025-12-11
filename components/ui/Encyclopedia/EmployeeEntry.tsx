import React from 'react';
import { CharacterConfig } from '../../../types';

interface EmployeeEntryProps {
    character: CharacterConfig;
    isUnlocked: boolean;
    isSelected: boolean;
    onClick: () => void;
}

export const EmployeeEntry: React.FC<EmployeeEntryProps> = ({ character, isUnlocked, isSelected, onClick }) => {
    let borderClass = 'border-slate-600 bg-slate-800';

    if (!isUnlocked) {
        borderClass = 'grayscale brightness-50 border-slate-800';
    }

    if (isSelected) {
        borderClass += ' border-indigo-400 bg-slate-700';
    }

    return (
        <div 
            onClick={onClick}
            className={`
                aspect-square rounded-lg border-2 flex items-center justify-center text-3xl cursor-pointer transition-all hover:scale-105
                ${borderClass}
            `}
        >
            {isUnlocked ? character.emojiNormal : '?'}
        </div>
    );
};