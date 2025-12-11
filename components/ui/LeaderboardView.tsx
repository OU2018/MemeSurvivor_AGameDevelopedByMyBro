
import React from 'react';
import { LEADERBOARD_DATA } from '../../data/leaderboardData';
import { gameEngine } from '../../services/gameEngine';
import { Button } from '../Button';

interface LeaderboardViewProps {
    onBack: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ onBack }) => {
    const playerHighscore = gameEngine.state.highScore;
    
    // Combine player score with fake data and sort
    const allEntries = [
        ...LEADERBOARD_DATA,
        { name: "我 (你自己)", score: playerHighscore, title: "正在努力", avatar: "👤", isPlayer: true }
    ].sort((a, b) => b.score - a.score);

    const playerRank = allEntries.findIndex(e => e.isPlayer) + 1;

    return (
        <div className="absolute inset-0 bg-slate-900 flex flex-col items-center z-50 p-8 overflow-hidden">
            <div className="w-full max-w-3xl flex flex-col h-full">
                <div className="flex justify-between items-center mb-8 shrink-0">
                    <div>
                        <h1 className="text-4xl font-black text-white mb-2">卷王排行榜</h1>
                        <p className="text-slate-400">你的历史最高分: <span className="text-yellow-400 font-bold">{playerHighscore}</span> (当前排名: {playerRank})</p>
                    </div>
                    <Button variant="outline" onClick={onBack}>返回</Button>
                </div>

                <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col flex-1">
                    <div className="grid grid-cols-12 bg-slate-900 p-4 text-slate-400 font-bold text-sm border-b border-slate-700">
                        <div className="col-span-2 text-center">排名</div>
                        <div className="col-span-6">卷王</div>
                        <div className="col-span-4 text-right">功德 (积分)</div>
                    </div>
                    
                    <div className="overflow-y-auto scrollbar-hide flex-1 p-2">
                        {allEntries.map((entry, idx) => {
                            const rank = idx + 1;
                            const isTop3 = rank <= 3;
                            const rankColor = rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-gray-300' : rank === 3 ? 'text-orange-400' : 'text-slate-500';
                            
                            return (
                                <div key={idx} className={`
                                    grid grid-cols-12 items-center p-4 rounded-lg mb-1 transition-colors
                                    ${entry.isPlayer ? 'bg-indigo-900/50 border border-indigo-500 shadow-lg transform scale-[1.02]' : 'hover:bg-slate-700/50'}
                                `}>
                                    <div className={`col-span-2 text-center font-black text-xl ${rankColor}`}>
                                        {rank}
                                    </div>
                                    <div className="col-span-6 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-xl shadow-inner">
                                            {entry.avatar}
                                        </div>
                                        <div>
                                            <div className={`font-bold ${entry.isPlayer ? 'text-indigo-300' : 'text-white'}`}>
                                                {entry.name}
                                            </div>
                                            <div className="text-xs text-slate-500">{entry.title}</div>
                                        </div>
                                    </div>
                                    <div className="col-span-4 text-right font-mono text-lg font-bold text-yellow-500">
                                        {entry.score.toLocaleString()}
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
