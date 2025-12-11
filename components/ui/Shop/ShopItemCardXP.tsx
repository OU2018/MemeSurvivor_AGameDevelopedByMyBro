
import React, { useState } from 'react';
import { UpgradeOption } from "../../../types";

interface ShopItemCardProps {
    item: UpgradeOption;
    discount: number;
    playerGold: number;
    onBuy: () => void;
    onToggleLock: () => void;
    ownedCount: number; // New Prop
}

export const ShopItemCardXP: React.FC<ShopItemCardProps> = ({ 
    item, discount, playerGold, onBuy, onToggleLock, ownedCount 
}) => {
    const [isHovered, setIsHovered] = useState(false);

    // XP Style Color Schemes based on Rarity
    const getTheme = (r: string) => {
        switch(r) {
            case 'mythic': 
                return {
                    header: 'bg-gradient-to-r from-[#d12f2f] to-[#ff6b6b]', // Red Gradient
                    body: 'bg-[#fff0f0]', // Light Red Tint
                    border: 'border-[#8a1c1c]',
                    text: 'text-[#5c0000]',
                    btn: 'bg-gradient-to-b from-[#ffcccc] to-[#ff6666] border-[#cc0000] hover:brightness-110'
                };
            case 'consumable':
                return {
                    // Luxury Platinum/Black Theme for XP
                    header: 'bg-gradient-to-r from-[#2c2c2c] via-[#505050] to-[#2c2c2c]', // Dark Gradient
                    body: 'bg-[#f8f8f8]', // Pure White
                    border: 'border-[#b8860b]', // Gold Border
                    text: 'text-black',
                    btn: 'bg-gradient-to-b from-[#fff7cc] to-[#ffd700] border-[#b8860b] hover:brightness-110 text-black'
                };
            case 'epic': 
                return {
                    header: 'bg-gradient-to-r from-[#e6b800] to-[#ffd700]', // Gold Gradient
                    body: 'bg-[#fffff0]', // Light Yellow Tint
                    border: 'border-[#b8860b]',
                    text: 'text-[#5c4d00]',
                    btn: 'bg-gradient-to-b from-[#fffacd] to-[#ffd700] border-[#daa520] hover:brightness-110'
                };
            case 'rare': 
                return {
                    header: 'bg-gradient-to-r from-[#800080] to-[#ba55d3]', // Purple Gradient
                    body: 'bg-[#fcf0ff]', // Light Purple Tint
                    border: 'border-[#4b0082]',
                    text: 'text-[#2e004f]',
                    btn: 'bg-gradient-to-b from-[#e6e6fa] to-[#dda0dd] border-[#800080] hover:brightness-110'
                };
            case 'excellent': 
                return {
                    header: 'bg-gradient-to-r from-[#0054e3] to-[#2585ea]', // XP Blue Gradient
                    body: 'bg-[#f0f8ff]', // Alice Blue
                    border: 'border-[#003c74]',
                    text: 'text-[#002b52]',
                    btn: 'bg-gradient-to-b from-[#bbeeff] to-[#66ccff] border-[#0054e3] hover:brightness-110'
                };
            default: // Common (XP Greenish/Neutral)
                return {
                    header: 'bg-gradient-to-r from-[#21a121] to-[#3cd13c]', // XP Greenish
                    body: 'bg-white',
                    border: 'border-[#448f44]',
                    text: 'text-black',
                    btn: 'bg-gradient-to-b from-[#f0f0f0] to-[#dcdcdc] border-[#888888] hover:brightness-110'
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

    // Dynamic Description
    const descriptionText = (ownedCount > 0 && item.getDynamicDescription)
        ? item.getDynamicDescription(ownedCount)
        : item.description;

    // Helper: Get color for stat tag (XP Style - Lighter Backgrounds)
    const getStatColor = (tag: string) => {
        if (tag.includes('攻速') || tag.includes('伤害') || tag.includes('弹速') || tag.includes('穿透') || tag.includes('数量') || tag.includes('暴击')) 
            return 'bg-red-100 text-red-800 border-red-300';
        if (tag.includes('生命') || tag.includes('护盾') || tag.includes('回血') || tag.includes('减伤') || tag.includes('闪避') || tag.includes('移速') || tag.includes('防御') || tag.includes('反伤')) 
            return 'bg-green-100 text-green-800 border-green-300';
        if (tag.includes('搞钱') || tag.includes('折扣') || tag.includes('运气') || tag.includes('掉落') || tag.includes('特权')) 
            return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        if (tag.includes('召唤') || tag.includes('炮台') || tag.includes('环绕') || tag.includes('复制')) 
            return 'bg-blue-100 text-blue-800 border-blue-300';
        return 'bg-purple-100 text-purple-800 border-purple-300';
    };

    // Helper: Smart Highlighting for Description (XP Light Theme)
    const formatDescription = (text: string) => {
        const regex = /([+\-]?\d+(?:\.\d+)?%?)|(攻击力|攻击速度|攻速|生命上限|生命值|生命|护盾|移速|伤害|弹速|穿透|数量|暴击|吸血|闪避|反伤|掉落|金币|价格|减速|眩晕|回复|治疗|无敌|秒杀|爆炸|范围)/g;
        
        const parts = text.split(regex);
        
        return parts.map((part, i) => {
            if (!part) return null;
            
            // Number matching (Red for visibility in XP style)
            if (/^[+\-]?\d+(?:\.\d+)?%?$/.test(part)) {
                return <span key={i} className="text-[#d12f2f] font-bold font-mono text-[11px] mx-0.5">{part}</span>;
            }
            
            // Keyword matching (Using XP standard system colors roughly)
            switch (part) {
                case '攻击力': case '攻击速度': case '攻速': case '伤害': case '弹速': case '穿透': case '数量': case '暴击': case '秒杀': case '爆炸': case '范围':
                    return <span key={i} className="text-[#800000] font-bold">{part}</span>;
                
                case '生命上限': case '生命值': case '生命': case '回复': case '治疗':
                    return <span key={i} className="text-[#006400] font-bold">{part}</span>;
                    
                case '护盾': case '防御': case '反伤': case '减伤': case '无敌': case '减速': case '眩晕':
                    return <span key={i} className="text-[#00008b] font-bold">{part}</span>;
                    
                case '移速':
                    return <span key={i} className="text-[#008b8b] font-bold">{part}</span>;
                    
                case '掉落': case '金币': case '价格':
                    return <span key={i} className="text-[#b8860b] font-bold">{part}</span>;
                    
                default:
                    return <span key={i}>{part}</span>;
            }
        });
    };

    return (
        <div 
            className={`
                relative flex flex-col rounded-t-lg overflow-hidden transition-all duration-200
                border-2 ${theme.border} ${theme.body} shadow-md
                ${item.purchased ? 'opacity-60 grayscale filter' : 'hover:shadow-xl'}
            `}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ fontFamily: 'Tahoma, sans-serif' }}
        >
            {/* Windows XP Window Title Bar */}
            <div className={`${theme.header} px-1.5 py-0.5 flex justify-between items-center h-6 shrink-0`}>
                <div className="flex items-center gap-1 flex-1 min-w-0">
                    <span className="text-white font-bold text-xs shadow-black drop-shadow-md truncate">
                        {item.title}
                    </span>
                    {/* Unique/Limit Badge in Header */}
                    {item.maxCount && (
                        <span className="text-[8px] text-white bg-black/20 px-1 rounded border border-white/30 shrink-0">
                            {item.maxCount === 1 ? '唯一' : `${ownedCount}/${item.maxCount}`}
                        </span>
                    )}
                </div>
                
                {/* Lock Button - ALWAYS VISIBLE */}
                {!item.purchased && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onToggleLock(); }} 
                        className={`
                            w-5 h-4 flex items-center justify-center rounded-[2px] border 
                            ${item.locked 
                                ? 'bg-red-600 border-red-800 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.5)]' 
                                : 'bg-white/20 border-white/40 hover:bg-white/40'}
                            transition-colors text-[9px] ml-1
                        `}
                        title={item.locked ? "已锁定 (刷新时不消失)" : "点击锁定 (刷新时保留)"}
                    >
                        {item.locked ? '🔒' : '🔓'}
                    </button>
                )}
            </div>

            {/* Content Body */}
            <div className="p-1.5 flex flex-col flex-1 gap-1">
                <div className="flex gap-1.5">
                    <div className="w-8 h-8 bg-white border border-gray-400 shadow-inner flex items-center justify-center text-xl shrink-0 rounded-[2px] relative">
                        {item.icon}
                    </div>
                    
                    <div className="flex flex-col min-w-0 flex-1">
                        {/* STAT TAGS ROW (XP Style) */}
                        {item.statTags && item.statTags.length > 0 && (
                            <div className="flex flex-wrap gap-0.5 mb-0.5">
                                {item.statTags.map(tag => (
                                    <span key={tag} className={`text-[8px] px-1 rounded border ${getStatColor(tag)} whitespace-nowrap`}>
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                        
                        <div className={`text-[10px] ${theme.text} leading-tight overflow-y-auto max-h-[50px] scrollbar-hide whitespace-pre-wrap`}>
                            {formatDescription(descriptionText)}
                        </div>
                    </div>
                </div>

                {/* Flavor Text (Quote) for XP Style */}
                {item.quote && (
                    <div className={`text-[9px] opacity-70 italic border-t ${theme.border.replace('border-', 'border-dashed ')} pt-1 mt-0.5 ${theme.text}`}>
                        {item.quote}
                    </div>
                )}

                <div className="mt-auto pt-0.5">
                    <button 
                        disabled={isDisabled}
                        onClick={(e) => { e.stopPropagation(); onBuy(); }}
                        className={`
                            w-full px-1.5 py-0.5 text-[10px] font-bold rounded-[3px] border-b-2 active:border-b-0 active:translate-y-[1px]
                            flex justify-between items-center shadow-sm transition-all
                            ${item.purchased 
                                ? 'bg-gray-300 border-gray-500 text-gray-600 cursor-not-allowed' 
                                : isMaxed
                                    ? 'bg-red-100 border-red-300 text-red-900 cursor-not-allowed'
                                    : canAfford 
                                        ? `${theme.btn} ${theme.text}` 
                                        : 'bg-gray-200 border-gray-400 text-gray-500 cursor-not-allowed'}
                        `}
                    >
                        {item.purchased ? (
                            <span className="mx-auto">已售罄</span>
                        ) : isMaxed ? (
                            <span className="mx-auto text-[9px]">{item.limitReason || '已达上限'}</span>
                        ) : (
                            <>
                                <span>💰 {finalPrice}</span>
                                {inflationDiff > 0 && (
                                    <span className="text-[8px] opacity-70">+{inflationDiff}</span>
                                )}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
