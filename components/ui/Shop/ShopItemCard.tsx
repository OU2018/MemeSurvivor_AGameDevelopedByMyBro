
import React, { useState } from 'react';
import { UpgradeOption } from "../../../types";
import { SYNERGIES } from "../../../data/synergies";

interface ShopItemCardProps {
    item: UpgradeOption;
    discount: number;
    playerGold: number;
    onBuy: () => void;
    onToggleLock: () => void;
    ownedCount: number; // New Prop
}

export const ShopItemCard: React.FC<ShopItemCardProps> = ({ 
    item, discount, playerGold, onBuy, onToggleLock, ownedCount 
}) => {
    // Local state for tag hover to show tooltip
    const [hoverTag, setHoverTag] = useState<string | null>(null);

    const getTheme = (r: string) => {
        switch(r) {
            case 'mythic': return {
                card: 'bg-red-950/40 border-red-500/80 shadow-[0_10px_35px_-5px_rgba(239,68,68,0.7)]',
                btn: 'bg-gradient-to-b from-red-600 to-red-700 border-red-800 text-white hover:from-red-500 hover:to-red-600 shadow-red-900/50',
                title: 'text-red-100',
                iconBg: 'bg-red-900/30'
            };
            case 'consumable': return {
                // Luxury Black Gold Theme
                card: 'bg-slate-950 border-amber-200/60 shadow-[0_0_25px_rgba(251,191,36,0.25)] ring-1 ring-amber-500/30',
                btn: 'bg-gradient-to-b from-amber-600 to-yellow-700 border-amber-200 text-white hover:from-amber-500 hover:to-yellow-600 shadow-[0_4px_15px_rgba(245,158,11,0.4)]',
                title: 'text-amber-100 font-serif tracking-wide',
                iconBg: 'bg-gradient-to-br from-slate-800 to-black border-amber-500/50'
            };
            case 'epic': return {
                card: 'bg-yellow-950/40 border-yellow-500/80 shadow-[0_10px_30px_-5px_rgba(234,179,8,0.6)]',
                btn: 'bg-gradient-to-b from-yellow-600 to-yellow-700 border-yellow-800 text-white hover:from-yellow-500 hover:to-yellow-600 shadow-yellow-900/50',
                title: 'text-yellow-100',
                iconBg: 'bg-yellow-900/30'
            };
            case 'rare': return {
                card: 'bg-purple-950/40 border-purple-500/80 shadow-[0_8px_25px_-5px_rgba(168,85,247,0.5)]',
                btn: 'bg-gradient-to-b from-purple-600 to-purple-700 border-purple-800 text-white hover:from-purple-500 hover:to-purple-600 shadow-purple-900/50',
                title: 'text-purple-100',
                iconBg: 'bg-purple-900/30'
            };
            case 'excellent': return {
                card: 'bg-blue-950/40 border-blue-500/80 shadow-[0_8px_25px_-5px_rgba(59,130,246,0.5)]',
                btn: 'bg-gradient-to-b from-blue-600 to-blue-700 border-blue-800 text-white hover:from-blue-500 hover:to-blue-600 shadow-blue-900/50',
                title: 'text-blue-100',
                iconBg: 'bg-blue-900/30'
            };
            default: return {
                card: 'bg-slate-800/80 border-slate-600',
                btn: 'bg-slate-700 hover:bg-slate-600 border-slate-500 text-slate-200',
                title: 'text-white',
                iconBg: 'bg-slate-700/50'
            };
        }
    };

    const theme = getTheme(item.rarity);
    const finalPrice = Math.floor(item.price * discount);
    let inflationDiff = 0;
    if (item.originalPrice) {
        inflationDiff = item.price - item.originalPrice;
    }

    // Limit Check
    const isMaxed = item.maxCount && ownedCount >= item.maxCount;
    const canAfford = playerGold >= finalPrice;
    const isDisabled = !!item.purchased || isMaxed || !canAfford;

    // Use Dynamic Description if owned > 0
    const descriptionText = (ownedCount > 0 && item.getDynamicDescription)
        ? item.getDynamicDescription(ownedCount)
        : item.description;

    // Helper: Smart Highlighting for Description
    const formatDescription = (text: string) => {
        // Splits by:
        // 1. Numbers (with optional +/-, decimals, %)
        // 2. Keywords (Chinese attributes)
        const regex = /([+\-]?\d+(?:\.\d+)?%?)|(攻击力|攻击速度|攻速|生命上限|生命值|生命|护盾|移速|伤害|弹速|穿透|数量|暴击|吸血|闪避|反伤|掉落|金币|价格|减速|眩晕|回复|治疗|无敌|秒杀|爆炸|范围)/g;
        
        const parts = text.split(regex);
        
        return parts.map((part, i) => {
            if (!part) return null;
            
            // Number matching (Yellow/Gold)
            if (/^[+\-]?\d+(?:\.\d+)?%?$/.test(part)) {
                return <span key={i} className="text-yellow-300 font-bold font-mono text-[11px] mx-0.5">{part}</span>;
            }
            
            // Keyword matching
            switch (part) {
                // Offensive - Red
                case '攻击力':
                case '攻击速度':
                case '攻速':
                case '伤害':
                case '弹速':
                case '穿透':
                case '数量':
                case '暴击':
                case '秒杀':
                case '爆炸':
                case '范围':
                    return <span key={i} className="text-red-400 font-bold">{part}</span>;
                
                // Survival - Green
                case '生命上限':
                case '生命值':
                case '生命':
                case '回复':
                case '治疗':
                    return <span key={i} className="text-green-400 font-bold">{part}</span>;
                    
                // Defense - Blue
                case '护盾':
                case '防御':
                case '反伤':
                case '减伤':
                case '无敌':
                case '减速':
                case '眩晕':
                    return <span key={i} className="text-blue-400 font-bold">{part}</span>;
                    
                // Utility - Cyan
                case '移速':
                    return <span key={i} className="text-cyan-400 font-bold">{part}</span>;
                    
                // Economy - Yellow
                case '掉落':
                case '金币':
                case '价格':
                    return <span key={i} className="text-yellow-400 font-bold">{part}</span>;
                    
                default:
                    return <span key={i}>{part}</span>;
            }
        });
    };

    // Helper: Get color for stat tag
    const getStatColor = (tag: string) => {
        if (tag.includes('攻速') || tag.includes('伤害') || tag.includes('弹速') || tag.includes('穿透') || tag.includes('数量') || tag.includes('暴击')) 
            return 'bg-red-900/80 text-red-200 border-red-500';
        if (tag.includes('生命') || tag.includes('护盾') || tag.includes('回血') || tag.includes('减伤') || tag.includes('闪避') || tag.includes('移速') || tag.includes('防御') || tag.includes('反伤')) 
            return 'bg-emerald-900/80 text-emerald-200 border-emerald-500';
        if (tag.includes('搞钱') || tag.includes('折扣') || tag.includes('运气') || tag.includes('掉落') || tag.includes('特权')) 
            return 'bg-yellow-900/80 text-yellow-200 border-yellow-500';
        if (tag.includes('召唤') || tag.includes('炮台') || tag.includes('环绕') || tag.includes('复制')) 
            return 'bg-blue-900/80 text-blue-200 border-blue-500';
        return 'bg-purple-900/80 text-purple-200 border-purple-500'; // Special/Default
    };

    return (
        <div className={`
            p-2 rounded-lg border-2 transition-all flex flex-col relative min-h-[140px] group gap-1
            ${item.purchased ? 'opacity-50 grayscale bg-slate-900 border-slate-700' : `${theme.card}`}
        `}>
            {/* Optional: Overlay to enhance the "inner glow" feeling for high tiers */}
            {!item.purchased && item.rarity !== 'common' && (
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded-lg" />
            )}
            
            {/* Luxury Shine Effect */}
            {!item.purchased && item.rarity === 'consumable' && (
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-200/10 to-transparent pointer-events-none rounded-lg animate-pulse" />
            )}

            <div className="flex justify-between items-start mb-1 relative z-10">
                <div className={`w-8 h-8 rounded flex items-center justify-center text-xl ${theme.iconBg} border border-white/10 relative`}>
                    {item.icon}
                    
                    {/* COUNT BADGE (Only show if > 0 and NOT unique, unique info is in tags now) */}
                    {ownedCount > 0 && (!item.maxCount || item.maxCount > 1) && (
                        <div className={`absolute -top-1.5 -left-1.5 text-[8px] font-bold px-1 rounded-full border shadow-md ${
                            isMaxed ? 'bg-red-600 text-white border-red-400' : 'bg-slate-700 text-white border-slate-500'
                        }`}>
                            {ownedCount}{item.maxCount ? `/${item.maxCount}` : ''}
                        </div>
                    )}
                </div>
                <div className="flex gap-1">
                    {!item.purchased && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onToggleLock(); }} 
                            className={`
                                text-[10px] w-5 h-5 rounded flex items-center justify-center transition-colors border
                                ${item.locked 
                                    ? 'bg-red-500/20 border-red-500 text-red-400' 
                                    : 'bg-slate-800/50 border-slate-600 text-slate-500 hover:text-slate-300'}
                            `}
                            title="锁定商品"
                        >
                            {item.locked ? '🔒' : '🔓'}
                        </button>
                    )}
                </div>
            </div>
            
            <h4 className={`font-bold text-xs mb-0.5 ${theme.title} truncate relative z-10`}>{item.title}</h4>
            
            {/* TAGS DISPLAY */}
            <div className="flex flex-wrap gap-0.5 mb-1 relative z-10">
                {/* LIMIT/UNIQUE TAG */}
                {item.maxCount && (
                    <span className={`
                        text-[8px] px-1 py-0 rounded border cursor-help font-bold
                        ${item.maxCount === 1 
                            ? 'bg-purple-900/80 text-purple-200 border-purple-500 shadow-[0_0_5px_rgba(168,85,247,0.4)]' 
                            : 'bg-orange-900/80 text-orange-200 border-orange-500'}
                    `}>
                        {item.maxCount === 1 ? '唯一' : `${ownedCount}/${item.maxCount}`}
                    </span>
                )}
                
                {/* STAT TAGS (NEW) */}
                {item.statTags && item.statTags.map(tag => (
                    <span key={tag} className={`text-[8px] px-1 py-0 rounded border font-bold ${getStatColor(tag)}`}>
                        {tag}
                    </span>
                ))}

                {/* Consumable Tag - Now LUXURY */}
                {item.rarity === 'consumable' && (
                    <span className="text-[8px] px-1 py-0 rounded border border-amber-400 bg-black text-amber-200 font-bold shadow-[0_0_8px_rgba(251,191,36,0.3)]">
                        奢侈
                    </span>
                )}

                {item.tags && item.tags.length > 0 && item.tags.map(tagId => {
                    const syn = SYNERGIES[tagId];
                    if(!syn) return null;
                    if(tagId === 'consumable') return null; // Skip duplicate logic
                    
                    const isBoard = tagId === 'board';
                    
                    return (
                        <span 
                            key={tagId} 
                            className={`
                                text-[8px] px-1 py-0 rounded border cursor-help relative
                                ${isBoard 
                                    ? 'bg-black text-[#D4AF37] border-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.4)] font-bold' 
                                    : 'bg-black/40 text-slate-200 border-slate-600'
                                }
                            `}
                            style={!isBoard ? { borderColor: syn.color, color: syn.color } : {}}
                            onMouseEnter={() => setHoverTag(tagId)}
                            onMouseLeave={() => setHoverTag(null)}
                        >
                            {syn.name}
                            
                            {/* TOOLTIP */}
                            {hoverTag === tagId && (
                                <div className="absolute bottom-full left-0 mb-2 w-48 bg-slate-900 border border-slate-500 p-2 rounded shadow-xl z-50 pointer-events-none">
                                    <div className="font-bold text-xs mb-1" style={{color: syn.color}}>{syn.name}</div>
                                    <div className="text-[9px] text-slate-300 leading-tight mb-1">{syn.description}</div>
                                    <div className="space-y-0.5">
                                        {syn.levels.map(l => (
                                            <div key={l.count} className="flex justify-between text-[8px] text-slate-400">
                                                <span>({l.count})</span>
                                                <span>{l.effectDesc}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </span>
                    );
                })}
            </div>

            {/* DESCRIPTION (Formatted & Highlighted) */}
            <div className="text-[10px] text-slate-300 mb-1 flex-1 leading-relaxed relative z-10 whitespace-pre-wrap">
                {formatDescription(descriptionText)}
            </div>

            {/* FLAVOR TEXT (Quote) - Separated & Styled */}
            {item.quote && (
                <div className="mt-1 pt-1 border-t border-white/10 text-[9px] text-slate-500 italic leading-tight opacity-75 relative z-10 font-serif">
                    {item.quote}
                </div>
            )}
            
            <button 
                disabled={isDisabled}
                onClick={(e) => { e.stopPropagation(); onBuy(); }}
                className={`
                    w-full px-2 py-1.5 rounded text-xs font-bold border-b-4 active:border-b-0 active:translate-y-[2px] transition-all flex justify-between items-center shadow-lg relative z-10 mt-auto
                    ${item.purchased 
                        ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed shadow-none' 
                        : isMaxed
                            ? 'bg-red-900/50 border-red-800 text-red-300 cursor-not-allowed shadow-none'
                            : canAfford 
                                ? theme.btn
                                : 'bg-slate-800 border-slate-600 text-slate-500 cursor-not-allowed opacity-70'}
                `}
            >
                {item.purchased ? (
                    <span className="mx-auto">已售罄</span>
                ) : isMaxed ? (
                    <span className="mx-auto text-[10px]">{item.limitReason || '已达上限'}</span>
                ) : (
                    <>
                        <span>💰 {finalPrice}</span>
                        {inflationDiff > 0 && (
                            <span className="text-[9px] opacity-80 font-normal">+{inflationDiff}</span>
                        )}
                    </>
                )}
            </button>
        </div>
    );
};
