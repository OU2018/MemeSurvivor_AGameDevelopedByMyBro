
import React, { useState } from 'react';

interface InventoryItemData {
    count: number;
    desc: string;
    icon: string;
}

interface ShopInventoryProps {
    inventoryMap: Record<string, InventoryItemData>;
    variant?: 'default' | 'retro'; // Updated type
}

export const ShopInventory: React.FC<ShopInventoryProps> = ({ inventoryMap, variant = 'default' }) => {
    // Store hovered item ID and its screen position
    const [hoverState, setHoverState] = useState<{ name: string, top: number, right: number } | null>(null);
    
    const totalItems = Object.values(inventoryMap).reduce((sum: number, item: InventoryItemData) => sum + item.count, 0);
    const isRetro = variant === 'retro';

    const headerClass = isRetro 
        ? 'bg-gradient-to-r from-[#215DC6] to-[#215DC6]' 
        : 'bg-slate-800 border border-slate-700';
        
    const bodyClass = isRetro
        ? 'bg-[#D6DFF7] border-l border-r border-b border-[#fff]'
        : 'bg-slate-900/50 border border-slate-700';

    const contentClass = isRetro
        ? 'bg-white border-2 border-[#7F9DB9] inset-shadow'
        : 'bg-transparent';

    const itemBgClass = isRetro
        ? 'bg-white border border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-black'
        : 'bg-slate-800 border border-slate-600 hover:border-cyan-500 hover:bg-slate-700 text-white';

    const handleMouseEnter = (name: string, e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        // Calculate position: align top with item, place to the LEFT of the inventory panel
        // Since inventory is usually on the right, we calculate `right` based on window width - item.left
        const viewportWidth = window.innerWidth;
        
        // We want the tooltip to appear to the LEFT of the item
        // Tooltip is `fixed` positioned using `top` and `right`.
        // The `right` value should be the distance from right edge to the item's left edge + spacing
        
        const rightPos = viewportWidth - rect.left + 8; // 8px spacing

        setHoverState({
            name,
            top: rect.top,
            right: rightPos
        });
    };

    return (
        <div className="w-60 flex flex-col gap-2 shrink-0 relative">
            {/* Header */}
            <div className={`rounded-t-[4px] px-3 py-1 flex justify-between items-center shadow-sm ${headerClass}`}>
                <span className="font-bold text-white text-sm">已购资产</span>
                <span className={`text-[10px] px-1.5 rounded-sm font-bold ${isRetro ? 'bg-white text-[#215DC6]' : 'bg-slate-700 text-white'}`}>
                    {totalItems}
                </span>
            </div>
            
            {/* Content Box */}
            <div className={`flex-1 shadow-sm p-3 overflow-hidden flex flex-col ${bodyClass}`}>
                <div className={`flex-1 overflow-y-auto scrollbar-hide p-2 ${contentClass}`}>
                    <div className="grid grid-cols-3 gap-2 content-start">
                        {(Object.entries(inventoryMap) as [string, InventoryItemData][]).map(([name, data]) => (
                            <div 
                                key={name} 
                                className="relative group cursor-help shrink-0 aspect-square"
                                onMouseEnter={(e) => handleMouseEnter(name, e)}
                                onMouseLeave={() => setHoverState(null)}
                            >
                                <div className={`w-full h-full rounded-[2px] flex items-center justify-center text-xl relative transition-all shadow-sm ${itemBgClass}`}>
                                    {data.icon}
                                    {data.count > 1 && (
                                        <span className="absolute -bottom-1 -right-1 bg-white border border-gray-400 text-black text-[9px] font-bold px-1 rounded-sm shadow-sm z-10">
                                            {data.count}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                        
                        {Object.keys(inventoryMap).length === 0 && (
                            <div className="col-span-3 flex flex-col items-center justify-center text-gray-400 italic gap-2 py-10">
                                <span className="text-2xl opacity-50">🎒</span>
                                <span className="text-[10px]">暂无资产</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tooltip Portal (Rendered Fixed based on calculations) */}
            {hoverState && inventoryMap[hoverState.name] && (
                <div 
                    className={`fixed z-[9999] w-56 p-3 shadow-2xl pointer-events-none rounded-lg animate-pop-in ${
                        isRetro 
                        ? 'bg-[#FFFFE1] border border-black text-black' 
                        : 'bg-slate-900/95 border border-slate-500 text-white backdrop-blur-sm'
                    }`}
                    style={{
                        top: Math.min(hoverState.top, window.innerHeight - 150), // Prevent going off bottom
                        right: hoverState.right
                    }}
                >
                    <div className={`flex items-center gap-2 mb-2 border-b pb-2 ${isRetro ? 'border-gray-400' : 'border-slate-600'}`}>
                        <span className="text-2xl bg-black/10 p-1 rounded">{inventoryMap[hoverState.name].icon}</span>
                        <div>
                            <div className="font-bold text-sm">{hoverState.name}</div>
                            <div className={`text-[10px] ${isRetro ? 'text-gray-600' : 'text-slate-400'}`}>持有数量: <span className="font-mono font-bold">{inventoryMap[hoverState.name].count}</span></div>
                        </div>
                    </div>
                    <div className="text-xs leading-relaxed opacity-90">{inventoryMap[hoverState.name].desc}</div>
                </div>
            )}
        </div>
    );
};
