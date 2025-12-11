
import React from 'react';
import { ENEMIES, SHOP_ITEMS, CHARACTERS } from '../../../data/memeContent';
import { SUMMON_STATS } from '../../../data/summons/summonStats';
import { MonsterDetail } from './MonsterDetail';
import { ItemDetail } from './ItemDetail';
import { EmployeeDetail } from './EmployeeDetail';
import { SummonDetail } from './SummonDetail';
import { GlossaryList } from './GlossaryList';
import { SynergyList } from './SynergyList';
import { HazardList } from './HazardList';
import { gameEngine } from '../../../services/gameEngine';

interface EntryDetailProps {
    tab: 'enemies' | 'items' | 'employees' | 'summons' | 'glossary' | 'synergies' | 'hazards';
    selectedId: string | null;
}

export const EntryDetail: React.FC<EntryDetailProps> = ({ tab, selectedId }) => {
    const unlocked = gameEngine.unlockedCompendium;
    const achievements = gameEngine.state.achievements;

    const isCharUnlocked = (charId: string) => {
        if (charId === 'ev_creator') return achievements.includes('boss_killer');
        if (charId === '007') return achievements.includes('first_blood');
        return true;
    };

    if (tab === 'glossary') {
        return <GlossaryList />;
    }

    if (tab === 'synergies') {
        return <SynergyList />;
    }

    if (tab === 'hazards') {
        return <HazardList />;
    }

    if (!selectedId) {
        return <div className="text-slate-500 italic text-center mt-20">点击图标查看详细信息</div>;
    }

    if (tab === 'enemies') {
        const enemy = ENEMIES[selectedId];
        if (!enemy) return null;
        return <MonsterDetail enemy={enemy} isUnlocked={unlocked.has(selectedId)} />;
    }

    if (tab === 'items') {
        const item = SHOP_ITEMS.find(i => i.id === selectedId);
        if (!item) return null;
        return <ItemDetail item={item} isUnlocked={unlocked.has(selectedId)} />;
    }

    if (tab === 'employees') {
        const char = Object.values(CHARACTERS).find(c => c.id === selectedId);
        if (!char) return null;
        return <EmployeeDetail character={char} isUnlocked={isCharUnlocked(char.id)} />;
    }

    if (tab === 'summons') {
        const summon = SUMMON_STATS[selectedId];
        if (!summon) return null;
        return <SummonDetail summon={summon} />;
    }

    return null;
};
