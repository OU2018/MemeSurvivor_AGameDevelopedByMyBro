
import React from 'react';
import { UpgradeOption } from "../../../types";
import { Button } from "../../Button";
import { ShopItemCard } from "./ShopItemCard";
import { gameEngine } from "../../../services/gameEngine";

interface ShopShelfProps {
    title: string;
    items: UpgradeOption[];
    discount: number;
    discountText: string;
    refreshCost: number;
    playerGold: number;
    type: 'upgrade' | 'item';
    onRestock: (type: 'upgrade' | 'item', e: React.MouseEvent) => void;
    onToggleLock: (index: number) => void;
    onBuy: (index: number) => void;
    headerColor: string;
}

export const ShopShelf: React.FC<ShopShelfProps> = ({ 
    title, items, discount, discountText, refreshCost, playerGold, type, onRestock, onToggleLock, onBuy, headerColor 
}) => {
    const p = gameEngine.state.player;

    return (
        <div className="flex-1 flex flex-col gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700 overflow-hidden">
            <div className="flex justify-between items-center mb-2 shrink-0">
                <h3 className={`text-xl font-bold ${headerColor}`}>{title} {discountText}</h3>
                <Button size="sm" onClick={(e) => onRestock(type, e)} variant="outline">
                    🚚 进货 (花费: {refreshCost})
                </Button>
            </div>
            <div className="grid grid-cols-2 gap-3 overflow-y-auto scrollbar-hide content-start flex-1">
                {items.map((item, idx) => {
                    const ownedCount = p.items.filter(i => i === item.title || (item.items && item.items.includes(i))).length;
                    return (
                        <ShopItemCard 
                            key={item.uuid}
                            item={item}
                            discount={discount}
                            playerGold={playerGold}
                            onBuy={() => onBuy(idx)}
                            onToggleLock={() => onToggleLock(idx)}
                            ownedCount={ownedCount}
                        />
                    );
                })}
            </div>
        </div>
    );
};
