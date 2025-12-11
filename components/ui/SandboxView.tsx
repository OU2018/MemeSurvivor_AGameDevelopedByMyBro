
import React, { useState, useEffect, useRef } from 'react';
import { gameEngine } from '../../services/gameEngine';
import { Button } from '../Button';
import { ENEMIES } from '../../data/enemies';
import { SHOP_ITEMS, WEAPON_ITEMS, SURVIVAL_ITEMS, ECONOMY_ITEMS, SUMMON_ITEMS, SPECIAL_ITEMS, PIERCE_ITEMS, BOARD_ITEMS, MARKET_ITEMS } from '../../data/items';
import { CHARACTERS } from '../../data/events';
import { SYNERGIES } from '../../data/synergies';
import { spawnEnemy } from '../../services/logic/battle/enemySystem';
import { DirectorSystem } from '../../services/logic/systems/DirectorSystem';
import { SynergyLogic } from '../../services/logic/synergyLogic';

interface SandboxViewProps {
    onExit: () => void;
}

export const SandboxView: React.FC<SandboxViewProps> = ({ onExit }) => {
    const [activeTab, setActiveTab] = useState<'spawn' | 'stats' | 'items' | 'identity'>('spawn');
    const [refreshKey, setRefreshKey] = useState(0);
    const [isDebugFrozen, setIsDebugFrozen] = useState(false);
    const [itemCategory, setItemCategory] = useState<'all' | 'weapon' | 'survival' | 'economy' | 'summon' | 'special'>('all');
    const [selectedSynergy, setSelectedSynergy] = useState<string | null>(null);
    
    // Spawner Settings - CHANGED DEFAULT TO 'random'
    const [spawnLocation, setSpawnLocation] = useState<'mouse' | 'random'>('random');
    const [autoSpawnActive, setAutoSpawnActive] = useState(false);
    const [selectedAutoEnemies, setSelectedAutoEnemies] = useState<Set<string>>(new Set());
    const [autoSpawnRate, setAutoSpawnRate] = useState(60); // Frames per spawn (60 = 1s)

    const p = gameEngine.state.player;

    // Force update UI loop
    useEffect(() => {
        const interval = setInterval(() => {
            setRefreshKey(k => k + 1);
        }, 200);
        return () => clearInterval(interval);
    }, []);

    // Auto Spawner Logic
    useEffect(() => {
        if (!autoSpawnActive || selectedAutoEnemies.size === 0) return;

        const interval = setInterval(() => {
            if (gameEngine.state.isPaused) return;
            
            // Pick random enemy from selection
            const types = Array.from(selectedAutoEnemies);
            const randomType = types[Math.floor(Math.random() * types.length)] as string;
            
            if (randomType) {
                performSpawn(randomType, spawnLocation);
            }

        }, (autoSpawnRate / 60) * 1000);

        return () => clearInterval(interval);
    }, [autoSpawnActive, selectedAutoEnemies, spawnLocation, autoSpawnRate]);

    const performSpawn = (type: string, location: 'mouse' | 'random') => {
        if (location === 'random') {
            DirectorSystem.spawnEnemyRandomly(gameEngine, type);
        } else {
            spawnEnemy(gameEngine, type, gameEngine.mousePos.x, gameEngine.mousePos.y);
        }
    };

    const handleManualSpawn = (type: string) => {
        performSpawn(type, spawnLocation);
    };

    const toggleAutoSelect = (type: string) => {
        const next = new Set(selectedAutoEnemies);
        if (next.has(type)) {
            next.delete(type);
        } else {
            next.add(type);
        }
        setSelectedAutoEnemies(next);
    };

    const handleClearEnemies = () => {
        gameEngine.state.enemies = [];
        gameEngine.state.projectiles = [];
    };

    const handleToggleFreeze = () => {
        gameEngine.state.isDebugFrozen = !gameEngine.state.isDebugFrozen;
        setIsDebugFrozen(!!gameEngine.state.isDebugFrozen);
    };

    const handleAddItem = (itemId: string) => {
        const item = SHOP_ITEMS.find(i => i.id === itemId);
        if (item) {
            item.effect(gameEngine.state);
            // Auto add logic for tracking pure stat items
            if (!item.items || item.items.length === 0) {
                p.items.push(item.title);
            }
            // Trigger synergy recalculation
            SynergyLogic.refreshDerivedStats(gameEngine.state);
            
            gameEngine.spawnFloatingText(p.x, p.y - 50, `添加: ${item.title}`, '#ffffff', 'chat');
        }
    };

    const handleRemoveItem = (index: number) => {
        const removedName = p.items[index];
        p.items.splice(index, 1);
        
        // Trigger synergy recalculation
        SynergyLogic.refreshDerivedStats(gameEngine.state);
        
        gameEngine.spawnFloatingText(p.x, p.y - 50, `移除: ${removedName}`, '#ef4444', 'chat');
    };

    const handleSwitchChar = (charId: string) => {
        const config = CHARACTERS[charId];
        if (!config) return;
        
        p.characterId = charId;
        p.emoji = config.emojiNormal;
        gameEngine.spawnFloatingText(p.x, p.y - 50, `变身: ${config.name}`, '#fbbf24', 'chat');
    };

    const handleSimulateNextWave = () => {
        const nextWave = gameEngine.state.currentWave + 1;
        DirectorSystem.startWave(gameEngine, nextWave);
        gameEngine.spawnFloatingText(p.x, p.y - 100, `模拟第 ${nextWave} 波开始`, '#a855f7', 'chat');
        gameEngine.spawnFloatingText(p.x, p.y - 70, `(触发利息/回血/扣款)`, '#cbd5e1', 'chat');
    };

    const enemyList = Object.values(ENEMIES);
    const charList = Object.values(CHARACTERS);

    const getFilteredItems = () => {
        let items: any[] = [];
        // 1. Filter by Category
        switch(itemCategory) {
            case 'weapon': items = [...WEAPON_ITEMS, ...PIERCE_ITEMS]; break;
            case 'survival': items = SURVIVAL_ITEMS; break;
            case 'economy': items = ECONOMY_ITEMS; break;
            case 'summon': items = SUMMON_ITEMS; break;
            case 'special': items = [...SPECIAL_ITEMS, ...BOARD_ITEMS, ...MARKET_ITEMS]; break;
            default: items = SHOP_ITEMS;
        }

        // 2. Filter by Synergy Tag
        if (selectedSynergy) {
            items = items.filter(i => i.tags && i.tags.includes(selectedSynergy));
        }

        return items;
    };

    const itemList = getFilteredItems();

    // Color code FPS
    const fps = gameEngine.state.fps;
    const fpsColor = fps >= 50 ? 'text-green-400' : fps >= 30 ? 'text-yellow-400' : 'text-red-500';

    return (
        <>
            {/* Debug Overlay (Top Center) */}
            <div className="fixed top-2 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm border border-slate-600 rounded-lg p-3 z-[100] pointer-events-none shadow-xl flex gap-6 font-mono text-xs">
                <div className="flex flex-col items-center">
                    <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">FPS</span>
                    <span className={`text-xl font-black ${fpsColor}`}>{fps}</span>
                </div>
                <div className="w-px bg-slate-700"></div>
                <div className="flex flex-col items-center">
                    <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Enemies</span>
                    <span className="text-xl font-bold text-white">{gameEngine.state.enemies.length}</span>
                </div>
                <div className="w-px bg-slate-700"></div>
                <div className="flex flex-col items-center">
                    <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Projectiles</span>
                    <span className="text-xl font-bold text-cyan-300">{gameEngine.state.projectiles.length}</span>
                </div>
            </div>

            <div className="absolute inset-0 pointer-events-none z-50 flex justify-end">
                
                {/* Right Panel: Spawner & Controls */}
                <div className="w-96 bg-black/90 pointer-events-auto border-l border-slate-700 flex flex-col h-full shadow-2xl">
                    <div className="p-4 border-b border-slate-700 bg-slate-900">
                        <h2 className="text-green-400 font-black text-xl flex items-center gap-2">
                            🧪 开发者实验室 v2.0
                        </h2>
                        <div className="text-xs text-slate-500 font-mono mt-1">
                            Pools: E{gameEngine.state.enemyPool.length} | P{gameEngine.state.projectilePool.length} | FX{gameEngine.state.particlePool.length}
                        </div>
                    </div>

                    <div className="flex border-b border-slate-700">
                        <button onClick={() => setActiveTab('spawn')} className={`flex-1 py-2 text-xs font-bold ${activeTab === 'spawn' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>造物</button>
                        <button onClick={() => setActiveTab('stats')} className={`flex-1 py-2 text-xs font-bold ${activeTab === 'stats' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>属性</button>
                        <button onClick={() => setActiveTab('items')} className={`flex-1 py-2 text-xs font-bold ${activeTab === 'items' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>背包</button>
                        <button onClick={() => setActiveTab('identity')} className={`flex-1 py-2 text-xs font-bold ${activeTab === 'identity' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>身份</button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 scrollbar-hide bg-slate-900/50">
                        
                        {/* TAB: SPAWN */}
                        {activeTab === 'spawn' && (
                            <div className="space-y-6">
                                {/* Global Controls */}
                                <div className="grid grid-cols-2 gap-2">
                                    <Button size="sm" variant="danger" onClick={handleClearEnemies}>清空全场</Button>
                                    <Button size="sm" variant={isDebugFrozen ? "primary" : "secondary"} onClick={handleToggleFreeze}>
                                        {isDebugFrozen ? "AI已冻结 ❄️" : "AI运行中 ▶"}
                                    </Button>
                                </div>

                                {/* Wave Simulator */}
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="w-full border-dashed border-slate-500 text-slate-300 hover:text-white hover:border-white"
                                    onClick={handleSimulateNextWave}
                                >
                                    ⏭️ 模拟下一波 (结算利息/效果)
                                </Button>

                                {/* Spawn Settings */}
                                <div className="bg-slate-800 p-3 rounded-lg border border-slate-600">
                                    <div className="text-xs text-slate-400 font-bold mb-2 uppercase">生成位置</div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => setSpawnLocation('mouse')}
                                            className={`flex-1 py-1 text-xs rounded border ${spawnLocation === 'mouse' ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-700 border-slate-600 text-slate-300'}`}
                                        >
                                            🖱️ 鼠标位置
                                        </button>
                                        <button 
                                            onClick={() => setSpawnLocation('random')}
                                            className={`flex-1 py-1 text-xs rounded border ${spawnLocation === 'random' ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-700 border-slate-600 text-slate-300'}`}
                                        >
                                            🎲 随机/边缘
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Manual Spawn Grid */}
                                <div>
                                    <div className="text-xs text-slate-400 mb-2 font-bold uppercase">点击生成 (单只)</div>
                                    <div className="grid grid-cols-5 gap-2">
                                        {enemyList.map(e => (
                                            <button 
                                                key={e.type} 
                                                onClick={() => handleManualSpawn(e.type)} 
                                                className={`aspect-square bg-slate-800 rounded hover:bg-slate-700 border border-slate-600 flex items-center justify-center text-xl relative group`}
                                                title={e.description}
                                            >
                                                {e.emoji}
                                                {/* Tier Indicator */}
                                                <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ${
                                                    e.tier === 'boss' ? 'bg-red-500' : 
                                                    e.tier === 'epic' ? 'bg-yellow-500' : 
                                                    e.tier === 'rare' ? 'bg-purple-500' : 'bg-slate-500'
                                                }`}></span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Auto Spawner */}
                                <div className="bg-slate-800 p-3 rounded-lg border border-slate-600">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="text-xs text-slate-400 font-bold uppercase">自动刷怪器 (波次模拟)</div>
                                        <div className={`w-3 h-3 rounded-full ${autoSpawnActive ? 'bg-green-500 animate-pulse' : 'bg-red-900'}`}></div>
                                    </div>
                                    
                                    <div className="mb-3">
                                        <div className="text-[10px] text-slate-500 mb-1">选择怪物池 (点击选中):</div>
                                        <div className="grid grid-cols-6 gap-1 max-h-32 overflow-y-auto">
                                            {enemyList.map(e => (
                                                <button 
                                                    key={'auto-'+e.type} 
                                                    onClick={() => toggleAutoSelect(e.type)} 
                                                    className={`aspect-square rounded flex items-center justify-center text-lg border ${
                                                        selectedAutoEnemies.has(e.type) 
                                                        ? 'bg-green-900 border-green-500 opacity-100' 
                                                        : 'bg-slate-900 border-slate-700 opacity-50 hover:opacity-80'
                                                    }`}
                                                >
                                                    {e.emoji}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-xs text-slate-400 whitespace-nowrap">频率: {autoSpawnRate}帧/只</span>
                                        <input 
                                            type="range" 
                                            min="1" max="180" 
                                            value={autoSpawnRate} 
                                            onChange={e => setAutoSpawnRate(parseInt(e.target.value))}
                                            className="w-full h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-green-500"
                                        />
                                    </div>

                                    <Button 
                                        size="sm" 
                                        className={`w-full ${autoSpawnActive ? 'bg-red-600 hover:bg-red-500 border-red-800' : 'bg-green-600 hover:bg-green-500 border-green-800'}`}
                                        onClick={() => setAutoSpawnActive(!autoSpawnActive)}
                                        disabled={selectedAutoEnemies.size === 0}
                                    >
                                        {autoSpawnActive ? "停止刷怪" : "开始自动刷怪"}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* TAB: STATS */}
                        {activeTab === 'stats' && (
                            <div className="space-y-6">
                                {/* Cheats */}
                                <div className="flex gap-2 mb-4">
                                    <Button size="sm" variant="success" onClick={() => { p.hp = p.maxHp = 99999; p.shield = 99999; }} className="flex-1">无敌 (God)</Button>
                                    <Button size="sm" variant="secondary" onClick={() => p.gold += 10000} className="flex-1">+1万金币</Button>
                                </div>

                                {/* Detailed Table */}
                                <div className="bg-slate-800 rounded-lg border border-slate-600 overflow-hidden">
                                    <div className="bg-slate-700 px-3 py-1 text-xs font-bold text-white">核心数据一览</div>
                                    <div className="grid grid-cols-2 gap-px bg-slate-600 p-px">
                                        {[
                                            { label: "生命", value: `${Math.floor(p.hp)} / ${p.maxHp}` },
                                            { label: "护盾", value: `${Math.floor(p.shield)} / ${p.maxShield}` },
                                            { label: "攻击力", value: p.attackDamage.toFixed(1) },
                                            { label: "攻速", value: `${(60/Math.max(1, p.attackSpeed)).toFixed(1)} 次/秒` },
                                            { label: "子弹数", value: p.projectileCount },
                                            { label: "穿透", value: p.projectilePierce },
                                            { label: "移速", value: p.speed.toFixed(1) },
                                            { label: "闪避率", value: `${(p.dodgeChance*100).toFixed(0)}%` },
                                            { label: "吸血", value: `${(p.lifeSteal*100).toFixed(0)}%` },
                                            { label: "掉落率", value: `${(p.dropRate*100).toFixed(0)}%` },
                                            { label: "反伤", value: `${(p.damageReflection*100).toFixed(0)}%` },
                                            { label: "收入系数", value: `${p.incomeMultiplier.toFixed(2)}x` },
                                        ].map((stat, i) => (
                                            <div key={i} className="bg-slate-900 px-3 py-2 flex justify-between items-center">
                                                <span className="text-[10px] text-slate-400">{stat.label}</span>
                                                <span className="text-xs font-mono text-yellow-300">{stat.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Sliders */}
                                <div className="space-y-4 text-sm text-white pt-2 border-t border-slate-700">
                                    <div className="text-xs text-slate-500 font-bold mb-2 uppercase">数值微调</div>
                                    <div>
                                        <div className="flex justify-between text-xs text-slate-400 mb-1"><span>攻击力</span> <span>{p.attackDamage.toFixed(1)}</span></div>
                                        <input type="range" min="1" max="500" value={p.attackDamage} onChange={e => p.attackDamage = parseFloat(e.target.value)} className="w-full accent-indigo-500" />
                                    </div>
                                    
                                    <div>
                                        <div className="flex justify-between text-xs text-slate-400 mb-1"><span>攻速 (帧间隔, 越小越快)</span> <span>{p.attackSpeed.toFixed(1)}</span></div>
                                        <input type="range" min="1" max="60" value={p.attackSpeed} onChange={e => p.attackSpeed = parseFloat(e.target.value)} className="w-full accent-indigo-500" />
                                    </div>
                                    
                                    <div>
                                        <div className="flex justify-between text-xs text-slate-400 mb-1"><span>移速</span> <span>{p.speed.toFixed(1)}</span></div>
                                        <input type="range" min="1" max="30" value={p.speed} onChange={e => p.speed = parseFloat(e.target.value)} className="w-full accent-indigo-500" />
                                    </div>
                                    
                                    <div>
                                        <div className="flex justify-between text-xs text-slate-400 mb-1"><span>子弹数</span> <span>{p.projectileCount}</span></div>
                                        <input type="range" min="1" max="20" value={p.projectileCount} onChange={e => p.projectileCount = parseFloat(e.target.value)} className="w-full accent-indigo-500" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB: ITEMS */}
                        {activeTab === 'items' && (
                            <div className="flex flex-col h-full gap-4">
                                {/* Current Inventory */}
                                <div className="bg-slate-800 p-3 rounded-lg border border-slate-600 min-h-[150px] shrink-0">
                                    <div className="text-xs text-slate-400 font-bold uppercase mb-2 flex justify-between">
                                        <span>当前背包 (点击删除)</span>
                                        <span>{p.items.length}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {p.items.map((itemName, idx) => {
                                            // Find icon
                                            const ref = SHOP_ITEMS.find(i => i.title === itemName || (i.items && i.items.includes(itemName)));
                                            const icon = ref ? ref.icon : '📦';
                                            
                                            return (
                                                <button 
                                                    key={idx} 
                                                    onClick={() => handleRemoveItem(idx)}
                                                    className="w-8 h-8 bg-slate-700 border border-slate-500 rounded flex items-center justify-center text-lg hover:bg-red-900 hover:border-red-500 relative group"
                                                    title={`移除: ${itemName}`}
                                                >
                                                    {icon}
                                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 text-[8px] flex items-center justify-center">x</div>
                                                </button>
                                            );
                                        })}
                                        {p.items.length === 0 && <span className="text-xs text-slate-600 italic">暂无物品</span>}
                                    </div>
                                    <div className="text-[10px] text-yellow-600 mt-2 italic">⚠️ 注意：移除物品仅删除标签，部分已生效的永久属性(如+5攻击)无法撤销。</div>
                                </div>

                                {/* Item Adder with Filters */}
                                <div className="flex-1 overflow-y-auto flex flex-col">
                                    <div className="text-xs text-slate-400 font-bold uppercase mb-2">添加物品 (点击获取)</div>
                                    
                                    {/* Category Filter */}
                                    <div className="flex flex-wrap gap-1 mb-2">
                                        {[
                                            { id: 'all', label: '全部' },
                                            { id: 'weapon', label: '武器' },
                                            { id: 'survival', label: '生存' },
                                            { id: 'economy', label: '经济' },
                                            { id: 'summon', label: '召唤' },
                                            { id: 'special', label: '特殊' }
                                        ].map(tab => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setItemCategory(tab.id as any)}
                                                className={`px-2 py-1 text-[10px] rounded border ${itemCategory === tab.id 
                                                    ? 'bg-indigo-600 border-indigo-400 text-white' 
                                                    : 'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700'}`}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Synergy Filter */}
                                    <div className="mb-2 bg-slate-800 p-2 rounded border border-slate-600">
                                        <div className="text-[10px] text-slate-500 mb-1">部门套系筛选</div>
                                        <div className="flex flex-wrap gap-1">
                                            <button
                                                onClick={() => setSelectedSynergy(null)}
                                                className={`px-2 py-1 text-[10px] rounded border ${!selectedSynergy 
                                                    ? 'bg-slate-200 text-black border-white' 
                                                    : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                                            >
                                                全部
                                            </button>
                                            {Object.values(SYNERGIES).map(syn => (
                                                <button
                                                    key={syn.id}
                                                    onClick={() => setSelectedSynergy(selectedSynergy === syn.id ? null : syn.id)}
                                                    className={`px-2 py-1 text-[10px] rounded border flex items-center gap-1 ${
                                                        selectedSynergy === syn.id 
                                                        ? 'bg-slate-700 text-white border-white' 
                                                        : 'bg-slate-900 border-slate-700 text-slate-400'
                                                    }`}
                                                    style={selectedSynergy === syn.id ? { borderColor: syn.color } : {}}
                                                >
                                                    <span>{syn.icon}</span>
                                                    <span>{syn.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-5 gap-2 overflow-y-auto scrollbar-hide pb-4">
                                        {itemList.map(item => (
                                            <button key={item.uuid || item.id} onClick={() => handleAddItem(item.id)} className="aspect-square bg-slate-800 rounded hover:bg-slate-700 border border-slate-600 flex flex-col items-center justify-center p-1 group relative" title={item.description}>
                                                <span className="text-xl">{item.icon}</span>
                                                <span className="text-[8px] text-slate-400 truncate w-full text-center">{item.title.substring(0,2)}</span>
                                                
                                                {/* Category Dot */}
                                                <span className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${item.category === 'upgrade' ? 'bg-blue-500' : 'bg-orange-500'}`}></span>
                                                
                                                {/* Synergy Dot */}
                                                {item.tags && item.tags.length > 0 && (
                                                    <span 
                                                        className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full" 
                                                        style={{ backgroundColor: SYNERGIES[item.tags[0]]?.color || '#fff' }}
                                                    ></span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB: IDENTITY */}
                        {activeTab === 'identity' && (
                            <div className="grid grid-cols-1 gap-2">
                                {charList.map(c => (
                                    <button key={c.id} onClick={() => handleSwitchChar(c.id)} 
                                        className={`p-3 rounded border flex items-center gap-3 ${p.characterId === c.id ? 'bg-green-900/50 border-green-500' : 'bg-slate-800 border-slate-600 hover:bg-slate-700'}`}>
                                        <span className="text-3xl">{c.emojiNormal}</span>
                                        <div className="text-left overflow-hidden">
                                            <div className="text-sm font-bold text-white truncate">{c.name}</div>
                                            <div className="text-xs text-slate-400 truncate">{c.title}</div>
                                            <div className="text-[10px] text-slate-500 mt-1 line-clamp-1">{c.description}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-slate-700 bg-slate-900">
                        <Button onClick={onExit} variant="outline" className="w-full text-sm">退出实验室 (返回主菜单)</Button>
                    </div>
                </div>

                {/* Mouse Follower for Spawning (Only visible in Mouse Mode) */}
                {activeTab === 'spawn' && spawnLocation === 'mouse' && (
                    <div className="fixed pointer-events-none text-white text-xs bg-black/50 px-2 py-1 rounded transform -translate-y-full -translate-x-1/2 mt-[-10px]" 
                         style={{left: gameEngine.mousePos.x * 0.6 + window.innerWidth/2 - gameEngine.state.camera.x*0.6, top: gameEngine.mousePos.y * 0.6 + window.innerHeight/2 - gameEngine.state.camera.y*0.6}}>
                        生成点
                    </div>
                )}

            </div>
        </>
    );
};
