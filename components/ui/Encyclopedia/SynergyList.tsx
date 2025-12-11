
import React from 'react';
import { SYNERGIES } from '../../../data/synergies';

export const SynergyList: React.FC = () => {
    return (
        <div className="space-y-6 animate-pop-in pb-8">
            <h2 className="text-2xl font-bold text-white mb-6">部门架构 (羁绊)</h2>
            <p className="text-slate-400 text-sm mb-4">收集具有相同部门标签的物品（不重复）可激活部门羁绊，获得强力加成。</p>
            
            <div className="grid gap-4">
                {Object.values(SYNERGIES).map((syn) => {
                    const isBoard = syn.id === 'board';
                    
                    return (
                        <div 
                            key={syn.id} 
                            className={`
                                p-4 rounded-xl shadow-md transition-all
                                ${isBoard 
                                    ? 'bg-black border-2 border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.4)]' 
                                    : 'bg-slate-800 border-l-4'
                                }
                            `}
                            style={!isBoard ? { borderLeftColor: syn.color } : {}}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`
                                    text-3xl w-12 h-12 flex items-center justify-center rounded-full border
                                    ${isBoard 
                                        ? 'bg-black border-[#D4AF37] text-[#D4AF37] shadow-[inset_0_0_10px_rgba(212,175,55,0.2)]' 
                                        : 'bg-slate-900 border-slate-700'
                                    }
                                `}>
                                    {syn.icon}
                                </span>
                                <div>
                                    <h3 className="text-xl font-black" style={{ color: syn.color }}>{syn.name}</h3>
                                    <p className={`text-xs ${isBoard ? 'text-[#D4AF37]/80' : 'text-slate-400'}`}>{syn.description}</p>
                                </div>
                            </div>
                            
                            <div className={`
                                grid gap-2 mt-3 p-3 rounded-lg
                                ${isBoard ? 'bg-[#111] border border-[#D4AF37]/30' : 'bg-slate-900/50'}
                            `}>
                                {syn.levels.map((level) => (
                                    <div key={level.count} className="flex items-center gap-3 text-sm">
                                        <span className={`
                                            px-2 py-0.5 rounded font-mono font-bold text-xs
                                            ${isBoard 
                                                ? 'bg-[#D4AF37] text-black border border-[#facc15]' 
                                                : 'bg-slate-700 text-white'
                                            }
                                        `}>
                                            ({level.count})
                                        </span>
                                        <span className={isBoard ? 'text-[#eab308]' : 'text-slate-300'}>{level.effectDesc}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
