
import React from 'react';
import { gameEngine } from '../../services/gameEngine';
import { Button } from '../Button';
import { SynergyLogic } from '../../services/logic/synergyLogic';

interface WaveSummaryViewProps {
    onNext: () => void;
}

export const WaveSummaryView: React.FC<WaveSummaryViewProps> = ({ onNext }) => {
    const stats = gameEngine.state.waveStats;
    const wave = gameEngine.state.isEndless ? gameEngine.state.endlessWaveCount : gameEngine.state.currentWave;
    
    // Check Capital L2 Status for UI hint
    const counts = SynergyLogic.getSynergyCounts(gameEngine.state.player.items);
    const tiers = SynergyLogic.getActiveTiers(counts);
    const hasInterest = (tiers['capital'] || 0) >= 2;

    return (
        <div className="absolute inset-0 bg-slate-900/95 flex items-center justify-center z-50 animate-bounce-in p-6">
            <div className="bg-slate-800 p-10 rounded-2xl border-4 border-slate-600 shadow-2xl max-w-2xl w-full text-center">
                <h1 className="text-4xl font-black text-white mb-2">下班打卡</h1>
                <p className="text-xl text-slate-400 mb-8 font-bold">第 {wave} 波 考勤统计</p>

                <div className="grid grid-cols-2 gap-6 text-left mb-8">
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                        <div className="text-sm text-slate-500 mb-1">清理垃圾 (击杀)</div>
                        <div className="text-3xl font-black text-white">{stats.enemiesKilled} <span className="text-sm font-normal text-slate-500">个</span></div>
                    </div>
                    
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                        <div className="text-sm text-slate-500 mb-1">输出强度 (伤害)</div>
                        <div className="text-3xl font-black text-red-400">{Math.floor(stats.damageDealt)}</div>
                    </div>

                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                        <div className="text-sm text-slate-500 mb-1">摸鱼所得 (工资)</div>
                        <div className="text-3xl font-black text-yellow-400">💰 {stats.goldEarned}</div>
                    </div>

                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 relative overflow-hidden">
                        <div className="text-sm text-slate-500 mb-1 flex justify-between relative z-10">
                            <span>年终奖 & 报销</span>
                            {hasInterest && (
                                <div className="flex items-center gap-1 animate-pulse">
                                    <span className="text-[10px] text-green-400 font-bold bg-green-900/50 px-1.5 rounded border border-green-600">
                                        含利息
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="text-3xl font-black text-yellow-200 relative z-10">💰 {stats.bonusGold}</div>
                        {hasInterest && <div className="absolute -bottom-4 -right-4 text-6xl opacity-10">📈</div>}
                    </div>

                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 col-span-2">
                         <div className="text-sm text-slate-500 mb-1">精神防御 (护盾抵消)</div>
                         <div className="text-3xl font-black text-blue-400">{Math.floor(stats.damageMitigated)}</div>
                    </div>
                </div>
                
                <Button size="lg" variant="success" onClick={onNext} className="w-full text-xl py-4">
                    确认打卡，去消费!
                </Button>
            </div>
        </div>
    );
};
