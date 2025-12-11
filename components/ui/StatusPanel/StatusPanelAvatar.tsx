
import React from 'react';
import { Player } from '../../../types';

interface StatusPanelAvatarProps {
    player: Player;
    activeTiers: Record<string, number>;
}

export const StatusPanelAvatar: React.FC<StatusPanelAvatarProps> = ({ player, activeTiers }) => {
    // --- UI Calculations ---
    const hpPercent = Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100));
    const displayMaxShield = Math.max(player.maxShield, player.shield, 50);
    const shieldPercent = Math.min(100, (player.shield / displayMaxShield) * 100);
    const showShieldBar = player.shield > 0 || player.maxShield > 0;

    // Capital Synergy Check (Lv 4+) -> Gold Shield
    let capitalTier = activeTiers['capital'] || 0;
    const isGoldShield = capitalTier >= 4;

    const shieldBarColor = isGoldShield 
        ? 'bg-gradient-to-r from-yellow-300 to-yellow-500 shadow-[0_0_10px_#facc15]'
        : 'bg-blue-400';
    const shieldBorderColor = isGoldShield ? 'border-yellow-600' : 'border-blue-900';
    const shieldTextColor = isGoldShield ? 'text-yellow-900' : 'text-white/90';
    
    // Heat Bar logic
    const heatPercent = Math.min(100, (player.heatValue / player.maxHeat) * 100);
    const showHeatBar = (activeTiers['hardcore'] || 0) >= 6;

    return (
        <div className="flex items-center gap-3 bg-slate-900/80 p-3 rounded-xl border-2 border-slate-600 backdrop-blur-sm shadow-xl pointer-events-auto">
            <div className={`text-5xl filter drop-shadow-lg ${player.isOverclocked ? 'animate-ping text-red-500' : 'animate-bounce'}`}>
                {player.emoji}
            </div>
            <div className="flex-1 flex flex-col gap-2 min-w-[140px]">
                <div className="flex justify-between text-base text-slate-300 font-bold">
                    <span className="text-xs uppercase tracking-wider opacity-70">STATUS</span>
                    <span>{Math.ceil(player.hp)}/{Math.ceil(player.maxHp)}</span>
                </div>
                
                {/* HP Bar */}
                <div className="h-5 bg-slate-800 rounded-full overflow-hidden border border-slate-600 relative shadow-inner">
                    <div 
                        className={`absolute top-0 left-0 h-full transition-all duration-200
                                   ${hpPercent < 30 ? 'bg-red-600 animate-pulse' : 'bg-green-500'}`} 
                        style={{width: `${hpPercent}%`}}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] text-white/80 font-bold uppercase tracking-widest drop-shadow-md">
                        HP
                    </span>
                </div>

                {/* Shield Bar */}
                {showShieldBar && (
                    <div className={`h-4 bg-slate-800 rounded-full overflow-hidden border ${shieldBorderColor} relative shadow-inner -mt-1`}>
                         <div 
                            className={`absolute top-0 left-0 h-full transition-all duration-200 ${shieldBarColor}`} 
                            style={{width: `${shieldPercent}%`}}
                        />
                        <span className={`absolute inset-0 flex items-center justify-center text-[8px] ${shieldTextColor} font-bold drop-shadow-md`}>
                            {isGoldShield ? '💰' : '🛡️'} {Math.floor(player.shield)}
                        </span>
                    </div>
                )}

                {/* HARDCORE HEAT BAR */}
                {showHeatBar && (
                    <div className={`h-4 rounded-full overflow-hidden border-2 relative shadow-inner -mt-1 transition-colors
                        ${player.isOverclocked ? 'bg-red-950 border-red-500 animate-pulse shadow-[0_0_10px_red]' : 'bg-slate-800 border-orange-500'}
                    `}>
                         <div 
                            className={`absolute top-0 left-0 h-full transition-all duration-100
                                ${player.isOverclocked ? 'bg-gradient-to-r from-red-600 to-yellow-500' : 'bg-gradient-to-r from-orange-600 to-orange-400'}
                            `}
                            style={{width: `${heatPercent}%`}}
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-[9px] text-white font-bold drop-shadow-md tracking-widest z-10">
                            {player.isOverclocked ? "🔥 火力全开 🔥" : `内卷热量 ${Math.floor(heatPercent)}%`}
                        </span>
                    </div>
                )}
            </div>
         </div>
    );
};
