
import React from 'react';
import { EnemyConfig, DifficultyConfig } from "../../../types";
import { ENEMIES } from "../../../data/enemies";

interface ShopHeaderProps {
    waveTitle: string;
    inflationRate: number;
    nextHpMult: number;
    diffCfg: DifficultyConfig;
    nextDmgMult: number;
    uniqueEnemies: string[];
    gold: number;
    hoverEnemy: string | null;
    setHoverEnemy: (val: string | null) => void;
    variant?: 'default' | 'retro'; // Updated type
}

export const ShopHeader: React.FC<ShopHeaderProps> = ({ 
    waveTitle, inflationRate, nextHpMult, diffCfg, nextDmgMult, uniqueEnemies, gold, hoverEnemy, setHoverEnemy, variant = 'default' 
}) => {
    const isRetro = variant === 'retro';

    const containerClass = isRetro 
        ? 'bg-[#FFFFE1] border-[#7F9DB9] text-black' 
        : 'bg-slate-800 border-slate-700 text-white';

    const titleClass = isRetro ? 'text-black font-tahoma' : 'text-white font-bold';
    const subTextClass = isRetro ? 'text-gray-600' : 'text-slate-400';
    const iconBgClass = isRetro ? 'bg-white border-gray-400 text-black' : 'bg-slate-700 border-slate-500 text-white';
    const tooltipClass = isRetro ? 'bg-[#FFFFE1] border-black text-black shadow-lg' : 'bg-slate-900 border-slate-500 text-white shadow-xl';
    
    // Dynamic Gold Color (Red if negative)
    let goldClass = isRetro ? 'bg-white border-[#7F9DB9] text-black' : 'bg-slate-900 border-yellow-600 text-yellow-400';
    if (gold < 0) {
        goldClass = isRetro ? 'bg-white border-red-500 text-red-600' : 'bg-red-900/50 border-red-500 text-red-400';
    }

    // Inflation visual logic
    const inflationPercent = Math.round(inflationRate * 100);
    let inflationColor = isRetro ? 'text-green-600' : 'text-green-400';
    let inflationIcon = '💹';
    
    if (inflationPercent >= 20) {
        inflationColor = 'text-red-500';
        inflationIcon = '🔥';
    } else if (inflationPercent > 0) {
        inflationColor = 'text-orange-400';
        inflationIcon = '📈';
    }

    return (
        <div className={`flex justify-between items-center mb-2 px-4 py-2 border shadow-sm shrink-0 ${containerClass}`}>
            <div className="flex flex-col">
                <h2 className={`text-lg font-bold ${titleClass}`}>{waveTitle}</h2>
                <div className={`text-xs font-bold flex items-center gap-1 ${inflationColor}`} title="通货膨胀率：影响商品价格，每波自动上涨。">
                    <span>{inflationIcon}</span>
                    <span>市场通胀:</span>
                    <span className="font-mono text-sm">{inflationPercent}%</span>
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                    <span className={`text-xs font-bold ${subTextClass}`}>下波情报:</span>
                </div>
                <div className="flex gap-2">
                    {uniqueEnemies.map(type => {
                        const cfg = ENEMIES[type];
                        if (!cfg) return null;
                        return (
                            <div key={type} className="relative group cursor-help"
                                    onMouseEnter={() => setHoverEnemy(type)}
                                    onMouseLeave={() => setHoverEnemy(null)}>
                                <span className={`text-2xl w-8 h-8 flex items-center justify-center rounded border shadow-sm ${iconBgClass}`}>{cfg.emoji}</span>
                                {hoverEnemy === type && (
                                    <div className={`absolute top-full mt-2 right-0 w-56 border p-2 text-xs z-[100] ${tooltipClass}`}>
                                        <h4 className="font-bold text-sm mb-1">{cfg.emoji} {cfg.name || cfg.description.split('，')[0]}</h4> 
                                        <p className={`mb-2 ${isRetro ? 'text-gray-700' : 'text-slate-300'}`}>{cfg.description}</p>
                                        <div className={`grid grid-cols-2 gap-1 text-[10px] font-mono p-1 border ${isRetro ? 'bg-white border-gray-300' : 'bg-slate-800 border-slate-600'}`}>
                                            <span>HP: {Math.floor(cfg.hp * nextHpMult)}</span>
                                            <span>ATK: {(cfg.damage * nextDmgMult).toFixed(1)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className={`text-2xl px-4 py-1 rounded border-2 shadow-inner flex items-center gap-2 font-mono font-bold ${goldClass}`}>
                    <span className={gold < 0 ? "animate-pulse" : "text-yellow-600"}>💰</span>
                    <span>{gold}</span>
                </div>
            </div>
        </div>
    );
};
