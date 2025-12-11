
import React, { useState } from 'react';
import { ENEMIES, SHOP_ITEMS, CHARACTERS } from '../../data/memeContent';
import { SUMMON_STATS } from '../../data/summons/summonStats';
import { gameEngine } from '../../services/gameEngine';
import { Button } from '../Button';

// Import sub-components
import { MonsterEntry } from './Encyclopedia/MonsterEntry';
import { ItemEntry } from './Encyclopedia/ItemEntry';
import { EmployeeEntry } from './Encyclopedia/EmployeeEntry';
import { SummonEntry } from './Encyclopedia/SummonEntry';
import { EntryDetail } from './Encyclopedia/EntryDetail';

interface EncyclopediaViewProps {
    onBack: () => void;
}

export const EncyclopediaView: React.FC<EncyclopediaViewProps> = ({ onBack }) => {
    const [tab, setTab] = useState<'enemies' | 'items' | 'employees' | 'summons' | 'glossary' | 'synergies' | 'hazards'>('enemies');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const unlocked = gameEngine.unlockedCompendium;
    const achievements = gameEngine.state.achievements;

    // Data Preparation
    const allEnemies = Object.values(ENEMIES);
    const sortedEnemies = [...allEnemies].sort((a, b) => {
        const tiers = { common: 1, rare: 2, epic: 3, boss: 4 };
        const tA = a.tier || 'common';
        const tB = b.tier || 'common';
        return (tiers[tA as keyof typeof tiers] || 1) - (tiers[tB as keyof typeof tiers] || 1);
    });

    // Sort Items by Rarity
    // Updated: Consumable is higher than Mythic
    const rarityWeight: Record<string, number> = { 
        consumable: 6, 
        mythic: 5, 
        epic: 4, 
        rare: 3, 
        excellent: 2, 
        common: 1 
    };
    const sortedItems = [...SHOP_ITEMS].sort((a, b) => {
        const wA = rarityWeight[a.rarity] || 1;
        const wB = rarityWeight[b.rarity] || 1;
        return wA - wB; 
    });

    const charList = Object.values(CHARACTERS);
    const summonList = Object.values(SUMMON_STATS);

    const isCharUnlocked = (charId: string) => {
        if (charId === 'ev_creator') return achievements.includes('boss_killer');
        if (charId === '007') return achievements.includes('first_blood');
        return true;
    };

    return (
        <div className="absolute inset-0 bg-slate-900 flex flex-col items-center z-50 p-8 overflow-hidden">
            <div className="w-full max-w-6xl flex flex-col h-full">
                <div className="flex justify-between items-center mb-8 shrink-0">
                    <h1 className="text-4xl font-black text-white">黑市情报 (图鉴)</h1>
                    <div className="flex gap-4">
                        <Button variant="outline" onClick={onBack}>返回</Button>
                    </div>
                </div>

                <div className="flex flex-1 gap-8 overflow-hidden min-h-0">
                    {/* Left: Navigation & Grid */}
                    <div className="w-1/2 flex flex-col gap-4 bg-slate-800/50 rounded-xl border border-slate-700 p-4">
                        <div className="grid grid-cols-2 gap-3 shrink-0">
                            <Button 
                                size="sm" 
                                variant={tab === 'enemies' ? 'primary' : 'outline'} 
                                onClick={() => { setTab('enemies'); setSelectedId(null); }}
                                className="text-xs flex items-center justify-center gap-2"
                            >
                                <span>👾</span> 怪物档案
                            </Button>
                            <Button 
                                size="sm" 
                                variant={tab === 'items' ? 'primary' : 'outline'} 
                                onClick={() => { setTab('items'); setSelectedId(null); }}
                                className="text-xs flex items-center justify-center gap-2"
                            >
                                <span>📦</span> 物资清单
                            </Button>
                            <Button 
                                size="sm" 
                                variant={tab === 'employees' ? 'primary' : 'outline'} 
                                onClick={() => { setTab('employees'); setSelectedId(null); }}
                                className="text-xs flex items-center justify-center gap-2"
                            >
                                <span>🆔</span> 员工名录
                            </Button>
                            <Button 
                                size="sm" 
                                variant={tab === 'summons' ? 'primary' : 'outline'} 
                                onClick={() => { setTab('summons'); setSelectedId(null); }}
                                className="text-xs flex items-center justify-center gap-2"
                            >
                                <span>🤖</span> 外包单位
                            </Button>
                            <Button 
                                size="sm" 
                                variant={tab === 'synergies' ? 'primary' : 'outline'} 
                                onClick={() => { setTab('synergies'); setSelectedId(null); }}
                                className="text-xs flex items-center justify-center gap-2"
                            >
                                <span>🔗</span> 部门架构
                            </Button>
                            <Button 
                                size="sm" 
                                variant={tab === 'hazards' ? 'primary' : 'outline'} 
                                onClick={() => { setTab('hazards'); setSelectedId(null); }}
                                className={`text-xs flex items-center justify-center gap-2 ${
                                    tab === 'hazards' 
                                    ? 'bg-red-600 border-red-500 hover:bg-red-500' 
                                    : 'text-red-300 border-red-900 hover:bg-red-900/50'
                                }`}
                            >
                                <span>☣️</span> 职场危害
                            </Button>
                            <Button 
                                size="sm" 
                                variant={tab === 'glossary' ? 'primary' : 'outline'} 
                                onClick={() => { setTab('glossary'); setSelectedId(null); }}
                                className="text-xs col-span-2 flex items-center justify-center gap-2"
                            >
                                <span>📖</span> 黑话词典
                            </Button>
                        </div>

                        {tab !== 'glossary' && tab !== 'synergies' && tab !== 'hazards' ? (
                            <div className="flex-1 overflow-y-auto scrollbar-hide grid grid-cols-4 content-start gap-3 bg-slate-900/30 p-2 rounded-lg border border-slate-700/50">
                                {tab === 'enemies' && sortedEnemies.map((e: any) => (
                                    <MonsterEntry 
                                        key={e.type}
                                        config={e}
                                        isUnlocked={unlocked.has(e.type)}
                                        isSelected={selectedId === e.type}
                                        onClick={() => setSelectedId(e.type)}
                                    />
                                ))}
                                
                                {tab === 'items' && sortedItems.map((i: any) => (
                                    <ItemEntry 
                                        key={i.id}
                                        item={i}
                                        isUnlocked={unlocked.has(i.id)}
                                        isSelected={selectedId === i.id}
                                        onClick={() => setSelectedId(i.id)}
                                    />
                                ))}

                                {tab === 'employees' && charList.map((c: any) => (
                                    <EmployeeEntry 
                                        key={c.id}
                                        character={c}
                                        isUnlocked={isCharUnlocked(c.id)}
                                        isSelected={selectedId === c.id}
                                        onClick={() => setSelectedId(c.id)}
                                    />
                                ))}

                                {tab === 'summons' && summonList.map((s: any) => (
                                    <SummonEntry 
                                        key={s.id}
                                        summon={s}
                                        isUnlocked={unlocked.has(s.id)} // Pass unlock status
                                        isSelected={selectedId === s.id}
                                        onClick={() => setSelectedId(s.id)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-slate-500 bg-slate-900/30 rounded-lg border border-slate-700/50">
                                <div className="text-center space-y-2">
                                    <div className="text-4xl opacity-20">👉</div>
                                    <p className="text-xs">请在右侧查看详情</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Details */}
                    <div className="w-1/2 bg-slate-900/80 rounded-xl border border-slate-700 p-8 overflow-y-auto scrollbar-hide shadow-inner">
                        <EntryDetail tab={tab} selectedId={selectedId} />
                    </div>
                </div>
            </div>
        </div>
    );
};
