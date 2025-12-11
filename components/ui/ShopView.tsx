
import React, { useState, useEffect, useReducer } from 'react';
import { WAVES, DIFFICULTY_SETTINGS } from '../../data/memeContent';
import { ENEMIES } from '../../data/enemies';
import { SHOP_ITEMS } from '../../data/items';
import { gameEngine } from '../../services/gameEngine';
import { Button } from '../Button';
import { ShopSystem } from '../../services/logic/systems/ShopSystem';

import { ShopHeader } from './Shop/ShopHeader';
import { ShopStats } from './Shop/ShopStats';
import { ShopInventory } from './Shop/ShopInventory';
import { ShopItemCard } from './Shop/ShopItemCard';
import { ShopItemCardXP } from './Shop/ShopItemCardXP';

interface ShopViewProps {
    onNextWave: () => void;
    onLinkCode?: () => void;
}

interface Toast {
    id: number;
    title: string;
    text?: string;
    type: 'win' | 'info' | 'error';
}

export const ShopView: React.FC<ShopViewProps> = ({ onNextWave, onLinkCode }) => {
    // We no longer manage shopStock locally. We read from gameEngine.
    const shopStock = gameEngine.state.shopState.stock;
    
    const [hoverEnemy, setHoverEnemy] = useState<string | null>(null);
    const [, forceUpdate] = useReducer(x => x + 1, 0);
    const [toasts, setToasts] = useState<Toast[]>([]);

    const p = gameEngine.state.player;
    const discount = p.shopDiscount;
    const discountText = discount < 1 ? ` (会员 ${(discount*10).toFixed(1)}折)` : '';
    
    // Read skin setting
    const isRetro = gameEngine.settings.shopSkin === 'retro';

    // --- Helper: Add Toast ---
    const addToast = (title: string, type: 'win' | 'info' | 'error', text?: string) => {
        const id = Date.now() + Math.random();
        // Limit to 3 toasts at a time to prevent center clutter
        setToasts(prev => [...prev.slice(-2), { id, title, text, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 2000); // Shorter duration for center toast
    };

    // --- Initialization ---
    useEffect(() => {
        gameEngine.audio.playShopBGM();
        // Use System to Init
        ShopSystem.init(gameEngine);
        forceUpdate(); // Ensure UI reflects new stock
    }, []);

    // --- Global Modal Check (Converted to Toast) ---
    useEffect(() => {
        const interval = setInterval(() => {
            if (gameEngine.state.modalMessage) {
                const m = gameEngine.state.modalMessage;
                addToast(m.title, m.type, m.text);
                gameEngine.state.modalMessage = null; 
            }
        }, 100);
        return () => clearInterval(interval);
    }, []);

    // --- Actions ---
    const restockShop = () => {
        const result = ShopSystem.refresh(gameEngine);
        if (result.success) {
            forceUpdate();
        } else {
            addToast("余额不足", 'error', result.message || "这点钱很难帮你办事啊...");
        }
    };

    const toggleLock = (index: number) => {
        ShopSystem.toggleLock(gameEngine, index);
        forceUpdate();
    };

    const buyItem = (index: number) => {
        const result = ShopSystem.purchase(gameEngine, index);

        if (result.success) {
            if (result.message) addToast(result.message.title, result.message.type, result.message.text);
            forceUpdate();
        } else {
            if (result.message) addToast(result.message.title, result.message.type, result.message.text);
            else addToast("余额不足", 'error', "这点钱很难帮你办事啊...");
        }
    };

    // --- Helpers ---
    const inventoryMap: Record<string, {count: number, desc: string, icon: string}> = {};
    p.items.forEach(name => {
        if (!inventoryMap[name]) {
            let desc = "未知物品";
            let icon = "📦";
            const ref = SHOP_ITEMS.find(i => i.items?.includes(name) || i.title === name);
            if(ref) {
                desc = ref.description;
                icon = ref.icon;
            }
            inventoryMap[name] = {count: 0, desc, icon};
        }
        inventoryMap[name].count++;
    });

    const nextWaveNum = gameEngine.state.currentWave + 1;
    const effectiveWaveNum = gameEngine.state.isEndless ? ((gameEngine.state.endlessWaveCount) % 8) + 1 : nextWaveNum;
    const nextWaveConfig = WAVES.find(w => w.waveNumber === effectiveWaveNum) || WAVES[WAVES.length - 1];
    const uniqueEnemies = Array.from(new Set(nextWaveConfig.enemies.map(e => e.type)));
    const isEndless = gameEngine.state.isEndless;
    const waveTitle = isEndless ? `无尽加班 (第 ${gameEngine.state.endlessWaveCount} 波)` : `第 ${gameEngine.state.currentWave} 波 结束`;
    const diffCfg = DIFFICULTY_SETTINGS.find(d => d.id === gameEngine.state.difficultyId) || DIFFICULTY_SETTINGS[1];
    const nextHpMult = diffCfg.hpMult * (1 + (nextWaveNum - 1) * 0.1) * (isEndless ? Math.pow(1.10, gameEngine.state.endlessWaveCount) : 1);
    const nextDmgMult = diffCfg.damageMult * (1 + (nextWaveNum - 1) * 0.05) * (isEndless ? Math.pow(1.1, gameEngine.state.endlessWaveCount) : 1);
    const insuranceCount = p.items.filter(i => i === '高额意外险').length;
    const maxInsurance = insuranceCount * (p.items.includes('高额意外险') ? 1200 : 800);
    
    // Get cost from System
    const currentRefreshCost = ShopSystem.getRefreshCost(gameEngine);

    // --- TOAST RENDERER (CENTERED) ---
    const renderToasts = () => (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[200] flex flex-col gap-3 pointer-events-none items-center w-full max-w-md">
            {toasts.map(t => {
                const bg = t.type === 'win' 
                    ? (isRetro ? 'bg-[#FFFFE1] border-[#0054E3] text-black shadow-[4px_4px_0px_rgba(0,0,0,0.5)]' : 'bg-green-600 border-green-400 text-white shadow-[0_0_20px_rgba(34,197,94,0.6)]')
                    : t.type === 'error'
                        ? (isRetro ? 'bg-red-100 border-red-500 text-red-900 shadow-[4px_4px_0px_rgba(0,0,0,0.5)]' : 'bg-red-600 border-red-400 text-white shadow-[0_0_20px_rgba(239,68,68,0.6)]')
                        : (isRetro ? 'bg-white border-[#7F9DB9] text-black shadow-[4px_4px_0px_rgba(0,0,0,0.5)]' : 'bg-slate-700 border-slate-500 text-white shadow-xl');
                
                return (
                    <div key={t.id} className={`px-6 py-4 rounded-xl border-4 animate-pop-in pointer-events-auto w-full text-center ${bg}`}>
                        <div className="font-black text-xl flex items-center justify-center gap-3">
                            <span className="text-2xl">{t.type === 'win' ? '🎉' : t.type === 'error' ? '🚫' : 'ℹ️'}</span>
                            {t.title}
                        </div>
                        {t.text && <div className="text-sm font-bold opacity-90 mt-2">{t.text}</div>}
                    </div>
                );
            })}
        </div>
    );

    // --- RENDER: RETRO XP STYLE ---
    if (isRetro) {
        return (
            <div className="absolute inset-0 bg-[#3A6EA5] flex flex-col items-center justify-center z-50 p-4 font-sans select-none overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{backgroundImage: 'radial-gradient(circle at center, white 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>
                
                {renderToasts()}
                
                <div className="w-full max-w-7xl h-full flex flex-col bg-[#ECE9D8] rounded-t-xl border-[3px] border-[#0054E3] shadow-[0_0_20px_rgba(0,0,0,0.5)] relative overflow-hidden z-10">
                    <div className="bg-gradient-to-r from-[#0058EE] via-[#3593FF] to-[#0058EE] h-8 flex justify-between items-center px-3 shrink-0">
                        <div className="flex items-center gap-2">
                            <span className="text-white font-bold font-tahoma text-sm drop-shadow-md">摸鱼小卖部 - Microsoft Internet Explorer</span>
                        </div>
                        <div className="flex gap-1">
                            <div className="w-5 h-5 bg-[#D5452F] rounded-[3px] border border-white/50 flex items-center justify-center shadow-sm cursor-pointer hover:brightness-110">
                                <span className="text-white font-bold text-xs leading-none">X</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#ECE9D8] border-b border-[#D1D1D1] px-2 py-1 flex items-center gap-4 text-xs text-black shrink-0">
                        <span>文件(F)</span><span>编辑(E)</span><span>查看(V)</span><span>收藏(A)</span>
                        <button onClick={onLinkCode} className="text-blue-600 underline hover:text-blue-800 ml-auto">保存进度/分享代码</button>
                    </div>

                    <div className="flex flex-1 gap-2 p-3 overflow-hidden min-h-0 bg-[#ECE9D8]">
                        <ShopStats player={p} insuranceCount={insuranceCount} maxInsurance={maxInsurance} variant="retro" />
                        <div className="flex-1 flex flex-col gap-2 overflow-hidden">
                            <ShopHeader waveTitle={waveTitle} inflationRate={gameEngine.state.inflationRate} nextHpMult={nextHpMult} diffCfg={diffCfg} nextDmgMult={nextDmgMult} uniqueEnemies={uniqueEnemies} gold={p.gold} hoverEnemy={hoverEnemy} setHoverEnemy={setHoverEnemy} variant="retro" />
                            <div className="flex-1 bg-white border-2 border-[#7F9DB9] p-3 overflow-hidden flex flex-col shadow-inner">
                                <div className="flex justify-between items-center mb-3 shrink-0 bg-[#F0F0F0] p-2 border-b border-[#E0E0E0]">
                                    <h3 className="text-lg font-bold text-[#444] flex items-center gap-2 font-tahoma">🛒 每日特惠 <span className="text-xs font-normal text-gray-500">{discountText}</span></h3>
                                    <button onClick={restockShop} className="px-4 py-1.5 bg-gradient-to-b from-[#3dc753] to-[#2d913d] border-[2px] border-[#2b6334] rounded-tr-xl rounded-bl-xl rounded-tl-sm rounded-br-sm text-white text-sm font-bold hover:brightness-110 flex items-center gap-2 active:translate-y-[1px] shadow-md transition-all" title="花费金币刷新当前商品列表">
                                        <span className="italic text-lg">♻</span><span>进货刷新</span>
                                        {currentRefreshCost === 0 ? (
                                            <span className="bg-yellow-100 px-1.5 rounded text-yellow-800 font-mono text-xs border border-yellow-300">免费!</span>
                                        ) : (
                                            <span className="bg-white/20 px-1.5 rounded text-yellow-100 font-mono text-xs">-{currentRefreshCost}G</span>
                                        )}
                                    </button>
                                </div>
                                <div className="grid grid-cols-4 gap-3 overflow-y-auto scrollbar-hide content-start flex-1 p-1">
                                    {shopStock.map((item, idx) => {
                                        // Calculate Owned Count
                                        const ownedCount = p.items.filter(i => i === item.title || (item.items && item.items.includes(i))).length;
                                        return (
                                            <ShopItemCardXP 
                                                key={item.uuid} 
                                                item={item} 
                                                discount={discount} 
                                                playerGold={p.gold} 
                                                onBuy={() => buyItem(idx)} 
                                                onToggleLock={() => toggleLock(idx)} 
                                                ownedCount={ownedCount} 
                                            />
                                        );
                                    })}
                                    {Array.from({ length: Math.max(0, p.shopSlots - shopStock.length) }).map((_, i) => (
                                        <div key={`empty-${i}`} className="border border-dashed border-gray-300 rounded bg-gray-50 flex items-center justify-center min-h-[160px]"><span className="text-3xl opacity-10 grayscale">📦</span></div>
                                    ))}
                                </div>
                                <div className="text-[10px] text-gray-500 mt-1 text-right flex items-center justify-end gap-1">
                                    <span>💡 小贴士：点击卡片右上角的</span><span className="border border-gray-400 px-1 rounded bg-gray-100">🔓</span><span>可锁定心仪商品，刷新时不会消失。</span>
                                </div>
                            </div>
                        </div>
                        <ShopInventory inventoryMap={inventoryMap} variant="retro" />
                    </div>
                    <div className="bg-[#ECE9D8] border-t border-[#D1D1D1] p-3 flex justify-center shrink-0">
                        <button onClick={onNextWave} className="px-10 py-2 bg-gradient-to-b from-[#44c767] to-[#28a049] border-2 border-[#18ab29] rounded-[4px] text-white font-bold text-xl shadow-md hover:brightness-110 active:border-[#1e6f2a] active:translate-y-[1px] font-tahoma">
                            {isEndless ? '继续加班 (下一波) >>' : (nextWaveNum === 8 ? '💀 直面 KPI (最终决战)' : '打卡上班 (下一波) >>')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- RENDER: DEFAULT STYLE ---
    return (
        <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center z-50 p-4 font-sans select-none overflow-hidden">
            {renderToasts()}

            <div className="w-full max-w-7xl h-full flex flex-col relative overflow-hidden z-10">
                <div className="flex justify-between items-center mb-4 shrink-0 bg-slate-900/80 p-4 rounded-xl border border-slate-700 backdrop-blur">
                    <h2 className="text-2xl font-black text-white">摸鱼小卖部 <span className="text-sm font-normal text-slate-400 ml-2">{isEndless ? '无尽模式' : '剧情模式'}</span></h2>
                    <button onClick={onLinkCode} className="text-cyan-400 hover:text-cyan-300 underline text-sm">保存进度 / 分享代码</button>
                </div>

                <div className="flex flex-1 gap-4 overflow-hidden min-h-0">
                    <ShopStats player={p} insuranceCount={insuranceCount} maxInsurance={maxInsurance} variant="default" />
                    
                    <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                        <ShopHeader waveTitle={waveTitle} inflationRate={gameEngine.state.inflationRate} nextHpMult={nextHpMult} diffCfg={diffCfg} nextDmgMult={nextDmgMult} uniqueEnemies={uniqueEnemies} gold={p.gold} hoverEnemy={hoverEnemy} setHoverEnemy={setHoverEnemy} variant="default" />
                        
                        <div className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl p-4 overflow-hidden flex flex-col shadow-inner">
                            <div className="flex justify-between items-center mb-4 shrink-0">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">🛒 每日特惠 <span className="text-sm font-normal text-slate-400">{discountText}</span></h3>
                                <Button size="sm" onClick={restockShop} variant="secondary">
                                    {currentRefreshCost === 0 ? (
                                        <span>🚚 进货刷新 (免费!)</span>
                                    ) : (
                                        <span>🚚 进货刷新 (-{currentRefreshCost} G)</span>
                                    )}
                                </Button>
                            </div>
                            
                            <div className="grid grid-cols-4 gap-4 overflow-y-auto scrollbar-hide content-start flex-1 pr-1">
                                {shopStock.map((item, idx) => {
                                    // Calculate Owned Count
                                    const ownedCount = p.items.filter(i => i === item.title || (item.items && item.items.includes(i))).length;
                                    return (
                                        <ShopItemCard 
                                            key={item.uuid} 
                                            item={item} 
                                            discount={discount} 
                                            playerGold={p.gold} 
                                            onBuy={() => buyItem(idx)} 
                                            onToggleLock={() => toggleLock(idx)} 
                                            ownedCount={ownedCount} 
                                        />
                                    );
                                })}
                                {Array.from({ length: Math.max(0, p.shopSlots - shopStock.length) }).map((_, i) => (
                                    <div key={`empty-${i}`} className="border-2 border-dashed border-slate-700 rounded-lg bg-slate-800/30 flex items-center justify-center min-h-[160px]">
                                        <span className="text-4xl opacity-20 grayscale">📦</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <ShopInventory inventoryMap={inventoryMap} variant="default" />
                </div>

                <div className="mt-4 flex justify-center shrink-0">
                    <Button size="lg" onClick={onNextWave} variant="success" className="px-12 py-4 text-2xl shadow-lg shadow-green-900/20">
                        {isEndless ? '继续加班 (下一波) >>' : (nextWaveNum === 8 ? '💀 直面 KPI (最终决战)' : '打卡上班 (下一波) >>')}
                    </Button>
                </div>
            </div>
        </div>
    );
};
