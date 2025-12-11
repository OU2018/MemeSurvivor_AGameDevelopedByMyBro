
import React from 'react';
import { UpgradeOption } from '../../../types';
import { SYNERGIES } from '../../../data/synergies';

interface ItemDetailProps {
    item: UpgradeOption;
    isUnlocked: boolean;
}

export const ItemDetail: React.FC<ItemDetailProps> = ({ item, isUnlocked }) => {
    if (!isUnlocked) {
        return (
            <div className="flex flex-col items-center gap-4 animate-pop-in">
                <div className="text-9xl grayscale brightness-0 opacity-50">?</div>
                <h2 className="text-3xl font-black text-slate-600">???</h2>
                <p className="text-slate-500">未发现的物品</p>
            </div>
        );
    }

    const getRarityColor = (r: string) => {
        switch(r) {
            case 'boss':
            case 'mythic': return 'text-red-500';
            case 'consumable': return 'text-amber-100 drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]'; // Gold Glow
            case 'epic': return 'text-yellow-400';
            case 'rare': return 'text-purple-400';
            case 'excellent': return 'text-blue-400';
            default: return 'text-white';
        }
    };

    const getRarityBadgeClass = (r: string) => {
         switch(r) {
            case 'boss':
            case 'mythic': return 'bg-red-900 text-red-300';
            case 'consumable': return 'bg-black text-amber-200 border border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)]'; // Black Gold
            case 'epic': return 'bg-yellow-900 text-yellow-300';
            case 'rare': return 'bg-purple-900 text-purple-300';
            case 'excellent': return 'bg-blue-900 text-blue-300';
            default: return 'bg-slate-700 text-slate-300';
        }
    };

    const getRarityLabel = (r: string) => {
        switch(r) {
            case 'mythic': return '董事长级 (传说)';
            case 'consumable': return '奢侈品 (尊享)'; // Luxury
            case 'epic': return '总监级 (史诗)';
            case 'rare': return '经理级 (稀有)';
            case 'excellent': return '骨干级 (优秀)';
            default: return '摸鱼级 (普通)';
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-pop-in">
            <div className="flex items-center gap-6">
                <div className={`text-8xl bg-slate-800 p-6 rounded-xl border-4 ${
                    item.rarity === 'mythic' ? 'border-red-500 shadow-red-500/20 shadow-lg' : 
                    item.rarity === 'consumable' ? 'border-amber-200 shadow-amber-500/30 shadow-lg bg-slate-900' :
                    item.rarity === 'epic' ? 'border-yellow-500 shadow-yellow-500/20 shadow-lg' : 
                    item.rarity === 'rare' ? 'border-purple-500' : 
                    item.rarity === 'excellent' ? 'border-blue-500' : 'border-slate-600'
                }`}>
                    {item.icon}
                </div>
                <div>
                    <h2 className={`text-4xl font-black mb-2 ${getRarityColor(item.rarity)}`}>
                        {item.title}
                    </h2>
                    
                    <div className="flex flex-wrap gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${getRarityBadgeClass(item.rarity)}`}>
                            {getRarityLabel(item.rarity)}
                        </span>
                    </div>

                    {/* Synergy Tags Display */}
                    {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {item.tags.map(tagId => {
                                if (tagId === 'consumable') return null; // Don't show redundant tag for consumable items if rarity is already consumable
                                const syn = SYNERGIES[tagId];
                                if (!syn) return null;
                                return (
                                    <div key={tagId} className="flex items-center gap-1 px-2 py-0.5 rounded border text-xs bg-slate-900/80" style={{ borderColor: syn.color, color: syn.color }}>
                                        <span>{syn.icon}</span>
                                        <span className="font-bold">{syn.name}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
            
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 space-y-4">
                <h3 className="text-xl font-bold text-blue-400 border-b border-slate-700 pb-2">物品详情</h3>
                <p className="text-lg text-slate-300 leading-relaxed">{item.description}</p>
                
                {item.quote && (
                     <div className="bg-black/30 p-3 rounded-lg border-l-4 border-yellow-600 italic text-yellow-100/80 text-sm">
                         {item.quote}
                     </div>
                )}

                <div className="mt-4 flex justify-between items-center bg-slate-900 p-3 rounded">
                    <span className="text-slate-500">基准价格</span>
                    <span className="text-yellow-400 font-mono text-xl">💰 {item.price}</span>
                </div>
            </div>
        </div>
    );
};
