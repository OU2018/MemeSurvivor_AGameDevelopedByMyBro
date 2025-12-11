
import React from 'react';
import { CharacterConfig } from '../../../types';
import { CHARACTER_LORE } from '../../../data/encyclopedia/characterLore';

interface EmployeeDetailProps {
    character: CharacterConfig;
    isUnlocked: boolean;
}

export const EmployeeDetail: React.FC<EmployeeDetailProps> = ({ character, isUnlocked }) => {
    if (!isUnlocked) {
         return (
            <div className="flex flex-col items-center gap-4 animate-pop-in">
                <div className="text-9xl grayscale brightness-0 opacity-50">?</div>
                <h2 className="text-3xl font-black text-slate-600">???</h2>
                <p className="text-slate-500">员工档案未解锁</p>
            </div>
        );
    }
    
    const lore = CHARACTER_LORE[character.id];
    const isScrapped = !!lore?.devNote;

    return (
        <div className={`flex flex-col gap-6 animate-pop-in relative ${isScrapped ? 'overflow-hidden' : ''}`}>
            
            {/* Scrapped Visual Glitch Overlay */}
            {isScrapped && (
                <>
                    <div className="absolute top-0 right-0 p-4 transform rotate-12 opacity-30 pointer-events-none z-20">
                        <div className="border-4 border-red-500 text-red-500 font-black text-6xl px-4 py-2">
                            SCRAPPED
                        </div>
                    </div>
                    <style>{`
                        .glitch-container {
                            animation: glitch-skew 3s infinite linear alternate-reverse;
                        }
                        @keyframes glitch-skew {
                            0% { transform: skew(0deg); }
                            20% { transform: skew(-1deg); }
                            40% { transform: skew(1deg); }
                            60% { transform: skew(0deg); }
                            80% { transform: skew(2deg); }
                            100% { transform: skew(0deg); }
                        }
                    `}</style>
                </>
            )}

            <div className={`flex items-center gap-6 ${isScrapped ? 'glitch-container filter hue-rotate-90' : ''}`}>
                <div className={`text-8xl bg-slate-800 p-6 rounded-xl border-4 shadow-lg ${isScrapped ? 'border-red-600 shadow-red-500/20' : 'border-indigo-500'}`}>
                    {character.emojiNormal}
                </div>
                <div>
                    <h2 className={`text-4xl font-black mb-2 ${isScrapped ? 'text-red-500 line-through decoration-4' : 'text-indigo-400'}`}>
                        {character.name}
                    </h2>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${isScrapped ? 'bg-red-900 text-red-200' : 'bg-indigo-900 text-indigo-200'}`}>
                        {isScrapped ? '档案已封存' : character.title}
                    </span>
                </div>
            </div>

            {/* Scrapped Dev Note */}
            {isScrapped && lore?.devNote && (
                <div className="bg-red-950/50 border border-red-500/50 p-4 rounded-lg text-sm text-red-200 font-mono whitespace-pre-wrap relative z-10">
                    {lore.devNote}
                </div>
            )}

            {/* SKILLS SECTION */}
            {lore && lore.skills && lore.skills.length > 0 && (
                <div className={`bg-slate-800/50 p-6 rounded-xl border border-slate-700 ${isScrapped ? 'opacity-60' : ''}`}>
                    <h3 className="text-xl font-bold text-indigo-400 border-b border-slate-700 pb-2 mb-4 flex items-center gap-2">
                        <span>⚡</span> 能力评估
                    </h3>
                    <div className="grid gap-3">
                        {lore.skills.map((skill, idx) => (
                            <div key={idx} className="flex gap-3 items-start bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                                <div className="text-2xl mt-1">{skill.icon}</div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-white text-base">{skill.name}</span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                            skill.type === 'active' ? 'bg-blue-900 text-blue-200 border border-blue-700' :
                                            skill.type === 'mechanism' ? 'bg-purple-900 text-purple-200 border border-purple-700' :
                                            'bg-slate-700 text-slate-300 border border-slate-600'
                                        }`}>
                                            {skill.type === 'active' ? '主动技能' : 
                                             skill.type === 'mechanism' ? '特殊机制' : '被动特性'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-400">
                                        {skill.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className={`bg-slate-800/50 p-6 rounded-xl border border-slate-700 space-y-4 ${isScrapped ? 'opacity-40 grayscale' : ''}`}>
                <h3 className="text-xl font-bold text-cyan-400 border-b border-slate-700 pb-2">基础档案</h3>
                
                {/* Flavor Text */}
                <div className="bg-black/20 p-4 rounded-lg border-l-4 border-indigo-500">
                    <p className="text-sm text-slate-300 italic leading-relaxed">
                        {character.description}
                    </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                     <div className="bg-slate-900 p-2 rounded flex justify-between"><span>基础生命</span> <span className="text-green-400">{character.baseStats.maxHp}</span></div>
                     <div className="bg-slate-900 p-2 rounded flex justify-between"><span>基础攻击</span> <span className="text-red-400">{character.baseStats.attackDamage}</span></div>
                     <div className="bg-slate-900 p-2 rounded flex justify-between"><span>移动速度</span> <span className="text-blue-400">{character.baseStats.speed}</span></div>
                     <div className="bg-slate-900 p-2 rounded flex justify-between"><span>收入系数</span> <span className="text-yellow-400">{character.baseStats.incomeMultiplier}x</span></div>
                     <div className="bg-slate-900 p-2 rounded flex justify-between"><span>攻击频率</span> <span className="text-orange-400">{(60/(character.baseStats.attackSpeed||25)).toFixed(1)}/s</span></div>
                     <div className="bg-slate-900 p-2 rounded flex justify-between"><span>子弹速度</span> <span className="text-cyan-400">7.5</span></div>
                </div>
            </div>
        </div>
    );
};
