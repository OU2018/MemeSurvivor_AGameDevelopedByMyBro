
import React from 'react';
import { ACHIEVEMENTS } from '../../data/memeContent';
import { gameEngine } from '../../services/gameEngine';
import { Button } from '../Button';

interface AchievementsViewProps {
    onBack: () => void;
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({ onBack }) => {
    const unlockedIds = gameEngine.state.achievements;
    const unlockedCount = unlockedIds.length;
    const totalCount = ACHIEVEMENTS.length;
    const progress = Math.round((unlockedCount / totalCount) * 100);

    return (
        <div className="absolute inset-0 bg-slate-900 flex flex-col items-center z-50 p-4 md:p-8 overflow-hidden">
            <div className="w-full max-w-7xl flex flex-col h-full">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 shrink-0 gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700 backdrop-blur-sm">
                    <div className="flex-1 w-full">
                        <h1 className="text-2xl md:text-3xl font-black text-white mb-2 flex items-center gap-3">
                            📊 业绩考核 <span className="text-xs font-normal text-slate-400 bg-slate-800 px-2 py-1 rounded border border-slate-600">永久属性加成</span>
                        </h1>
                        <div className="flex items-center gap-4">
                            <div className="w-full max-w-md h-4 bg-slate-700 rounded-full overflow-hidden border border-slate-600 relative shadow-inner">
                                <div 
                                    className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-1000 ease-out" 
                                    style={{ width: `${progress}%` }}
                                >
                                    {progress > 0 && <div className="absolute inset-0 bg-white/20 animate-pulse"></div>}
                                </div>
                            </div>
                            <span className="text-yellow-400 font-bold font-mono text-sm whitespace-nowrap">{unlockedCount} / {totalCount} ({progress}%)</span>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={onBack} className="shrink-0">返回首页</Button>
                </div>

                {/* Scrollable Grid */}
                <div className="flex-1 overflow-y-auto scrollbar-hide pr-1 -mr-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 pb-20">
                        {ACHIEVEMENTS.map(ach => {
                            const isUnlocked = unlockedIds.includes(ach.id);
                            return (
                                <div key={ach.id} className={`
                                    relative p-4 rounded-xl border-2 transition-all duration-200 flex gap-4 items-start group
                                    ${isUnlocked 
                                        ? 'bg-slate-800 border-yellow-500/50 hover:border-yellow-400 hover:bg-slate-750 shadow-md' 
                                        : 'bg-slate-900/50 border-slate-700 opacity-60 grayscale hover:opacity-90 hover:grayscale-0'}
                                `}>
                                    {/* Icon Box - Medium Size */}
                                    <div className={`
                                        w-14 h-14 shrink-0 flex items-center justify-center rounded-lg text-3xl shadow-inner mt-1
                                        ${isUnlocked ? 'bg-slate-900 border border-slate-600' : 'bg-black border border-slate-800'}
                                    `}>
                                        <div className={`transform transition-transform duration-500 ${isUnlocked ? 'group-hover:scale-110 group-hover:rotate-6' : ''}`}>
                                            {ach.icon}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 flex flex-col h-full">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className={`text-base font-black truncate pr-2 ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>
                                                {ach.title}
                                            </h3>
                                            {isUnlocked && (
                                                <span className="bg-green-900/80 text-green-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-green-800 whitespace-nowrap">
                                                    已达成
                                                </span>
                                            )}
                                        </div>
                                        
                                        <p className="text-xs text-slate-400 mb-3 leading-relaxed line-clamp-2">
                                            {ach.description}
                                        </p>
                                        
                                        {/* Reward Box - Compact */}
                                        <div className={`
                                            mt-auto rounded p-1.5 flex items-center gap-2 transition-colors
                                            ${isUnlocked ? 'bg-yellow-900/20 border border-yellow-500/30' : 'bg-slate-900 border border-slate-700'}
                                        `}>
                                            <span className="text-sm">🎁</span>
                                            <div className="flex flex-col leading-none">
                                                <span className={`text-[9px] font-bold uppercase ${isUnlocked ? 'text-yellow-600' : 'text-slate-600'}`}>
                                                    奖励
                                                </span>
                                                <span className={`text-xs font-bold truncate ${isUnlocked ? 'text-yellow-400' : 'text-slate-500'}`}>
                                                    {ach.rewardDescription}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
