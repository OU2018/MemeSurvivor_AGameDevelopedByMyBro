
import React, { useEffect } from 'react';
import { CHARACTERS } from '../../data/memeContent';
import { CHARACTER_LORE } from '../../data/encyclopedia/characterLore';
import { Button } from '../Button';
import { gameEngine } from '../../services/gameEngine';

export const CharacterSelectView: React.FC<{ onSelect: (charId: string) => void, onBack: () => void }> = ({ onSelect, onBack }) => {
    useEffect(() => {
        gameEngine.audio.playAmbientBGM();
    }, []);

    return (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-50 p-8">
            <h2 className="text-4xl font-black text-white mb-8">选择你的打工人</h2>
            {/* Added pt-10 to prevent hover clipping */}
            <div className="flex gap-6 mb-8 overflow-x-auto pb-4 pt-10 max-w-full px-4 snap-x">
                {Object.values(CHARACTERS)
                    .filter(char => char.id !== 'cleaner') // Hide Cleaner (Scrapped Character)
                    .map(char => {
                    // Check unlock condition
                    let isLocked = false;
                    let lockReason = "";
                    
                    if (char.id === 'ev_creator') {
                        const hasBossKill = gameEngine.state.achievements.includes('kpi_crusher');
                        if (!hasBossKill) {
                            isLocked = true;
                            lockReason = "解锁条件：击败 KPI 大魔王 1 次";
                        }
                    } else if (char.id === '007') {
                        const hasPlayed = gameEngine.state.achievements.includes('first_blood');
                        if (!hasPlayed) {
                            isLocked = true;
                            lockReason = "解锁条件：需进行一局游戏解锁";
                        }
                    }
                    
                    const lore = CHARACTER_LORE[char.id];

                    return (
                        <div key={char.id} className={`
                            bg-slate-800 border-4 rounded-xl p-6 w-72 flex flex-col shrink-0 transition-all cursor-pointer relative overflow-hidden snap-center group
                            ${isLocked ? 'border-slate-700 opacity-80' : 'border-slate-600 hover:border-yellow-500 hover:bg-slate-750 hover:-translate-y-2'}
                        `} 
                        onClick={() => !isLocked && onSelect(char.id)}>
                            
                            {isLocked && (
                                <div className="absolute inset-0 bg-black/80 z-20 flex flex-col items-center justify-center text-center p-4 backdrop-blur-sm">
                                    <div className="text-6xl mb-4 grayscale opacity-50">{char.emojiNormal}</div>
                                    <div className="text-red-400 font-bold mb-2 border-b border-red-900 pb-1">角色未解锁</div>
                                    <div className="text-xs text-slate-400">{lockReason}</div>
                                </div>
                            )}

                            <div className="flex items-center gap-4 mb-4 border-b border-slate-700 pb-4">
                                <div className="text-5xl group-hover:scale-110 transition-transform">{char.emojiNormal}</div>
                                <div>
                                    <div className="text-xl font-bold text-yellow-400 leading-tight">{char.name}</div>
                                    <div className="text-xs font-bold text-slate-500 uppercase mt-1 bg-slate-900 px-2 py-0.5 rounded inline-block">
                                        {char.title}
                                    </div>
                                </div>
                            </div>

                            {/* Flavor Text (Description) */}
                            <div className="text-xs text-slate-400 italic mb-4 min-h-[48px] bg-slate-900/30 p-2 rounded leading-relaxed border-l-2 border-slate-600">
                                {char.description}
                            </div>

                            {/* SKILLS SECTION ONLY */}
                            {lore && (
                                <div className="space-y-2 mb-4 flex-1">
                                    {lore.skills.map((skill, idx) => (
                                        <div key={idx} className="flex gap-2 items-start text-left bg-slate-900/50 p-2 rounded border border-slate-700/50">
                                            <span className="text-lg shrink-0">{skill.icon}</span>
                                            <div>
                                                <div className="text-xs font-bold text-white mb-0.5">{skill.name}</div>
                                                <div className="text-[10px] text-slate-400 leading-tight">{skill.description}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="mt-auto w-full relative z-10">
                                 <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-500" disabled={isLocked}>
                                     {isLocked ? '未解锁' : '入职登记'}
                                 </Button>
                            </div>
                        </div>
                    );
                })}
            </div>
            <Button variant="outline" onClick={onBack}>返回</Button>
        </div>
    );
};
