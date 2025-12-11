
import React, { useState } from 'react';
import { Player } from "../../../types";
import { SynergyLogic } from "../../../services/logic/synergyLogic";
import { SYNERGIES } from "../../../data/synergies";

interface ShopStatsProps {
    player: Player;
    insuranceCount: number;
    maxInsurance: number;
    variant?: 'default' | 'retro'; // Updated type
}

export const ShopStats: React.FC<ShopStatsProps> = ({ player: p, insuranceCount, maxInsurance, variant = 'default' }) => {
    const [hoverState, setHoverState] = useState<{ tagId: string, top: number, left: number } | null>(null);
    const isRetro = variant === 'retro';

    const headerClass = isRetro 
        ? 'bg-gradient-to-r from-[#215DC6] to-[#215DC6]' 
        : 'bg-slate-800 border border-slate-700';
        
    const bodyClass = isRetro
        ? 'bg-[#D6DFF7] border-l border-r border-b border-[#fff]'
        : 'bg-slate-900/50 border border-slate-700';

    const contentClass = isRetro
        ? 'bg-white border-2 border-[#7F9DB9] text-black'
        : 'bg-transparent text-slate-300';

    const separatorClass = isRetro ? 'border-dashed border-gray-300' : 'border-slate-700';

    // Calculate Active Synergies
    const counts = SynergyLogic.getSynergyCounts(p.items);
    const activeTiers = SynergyLogic.getActiveTiers(counts);
    
    // Get all synergies that have at least 1 item
    const visibleSynergies = Object.keys(counts)
        .filter(id => counts[id] > 0)
        .sort((a, b) => {
            // Sort by count descending
            return counts[b] - counts[a];
        });

    const hasSynergies = visibleSynergies.length > 0;

    // --- CAPITAL L4 TRACKING ---
    const capitalTier = activeTiers['capital'] || 0;
    const showCapitalStats = capitalTier >= 4;
    const shieldBonus = showCapitalStats ? Math.floor(p.goldSpentInShop / 10 * 2) : 0;

    // --- DEBT CALCULATION ---
    // Each debt instance deducts 200 gold per wave
    const pigDebtTotal = (p.pigDebts || []).length * 200;

    // --- SUMMON STATS CALCULATION ---
    const hrTier = activeTiers['hr'] || 0;
    const hasSummonItems = p.items.some(i => ['招聘海报', '团建披萨', '打卡机', '扩音喇叭', '远程办公'].includes(i));
    const showSummonStats = hrTier > 0 || hasSummonItems || p.items.some(i => ['临时工合同', '水军', '实习生', '客服机器人', '外包团队', '影子分身', '猎头顾问', '祖传代码'].includes(i));

    // Base Multipliers
    let summonHpMult = 1.0;
    let summonDurationMult = 1.0;
    let summonAtkSpeedMult = 1.0;
    let summonRangeMult = 1.0;
    let summonCooldownReduct = 0;

    // Apply HR Synergy
    if (hrTier >= 2) { summonHpMult += 0.3; summonDurationMult += 0.5; }
    if (hrTier >= 4) { summonCooldownReduct += 30; } // 30% reduction

    // Apply Items (Count based)
    const posterCount = p.items.filter(i => i === '招聘海报').length;
    summonHpMult += 0.2 * posterCount;
    summonDurationMult += 0.2 * posterCount;

    if (p.items.includes('团建披萨')) summonHpMult += 0.5;
    
    const punchCardCount = p.items.filter(i => i === '打卡机').length;
    summonAtkSpeedMult += 0.1 * punchCardCount;

    const megaphoneCount = p.items.filter(i => i === '扩音喇叭').length;
    summonAtkSpeedMult += 0.2 * megaphoneCount;

    const remoteCount = p.items.filter(i => i === '远程办公').length;
    summonRangeMult += 0.5 * remoteCount;

    const handleMouseEnter = (tagId: string, e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setHoverState({
            tagId,
            top: rect.top,
            left: rect.right + 10
        });
    };

    return (
        <div className="w-60 flex flex-col gap-2 shrink-0 relative">
            <div className={`rounded-t-[4px] px-3 py-1 shadow-sm ${headerClass}`}>
                <h3 className="font-bold text-white text-sm">员工详情</h3>
            </div>
            
            <div className={`flex-1 shadow-sm p-3 overflow-hidden flex flex-col ${bodyClass}`}>
                <div className={`flex-1 overflow-y-auto scrollbar-hide p-2 text-xs ${contentClass}`}>
                    <div className={`space-y-1 ${isRetro ? 'font-tahoma' : 'font-sans'}`}>
                        <div className={`flex justify-between border-b ${separatorClass} pb-1`}><span>生命上限:</span> <span className="font-bold text-[#d12f2f]">{p.maxHp}</span></div>
                        <div className={`flex justify-between border-b ${separatorClass} pb-1`}><span>生命回复:</span> <span className="text-green-600">{p.hpRegen > 0 ? p.hpRegen.toFixed(1) : 0}/s</span></div>
                        <div className={`flex justify-between border-b ${separatorClass} pb-1`}><span>护盾上限:</span> <span className="text-blue-600">{p.maxShield}</span></div>
                        <div className={`flex justify-between border-b ${separatorClass} pb-1`}><span>攻击力:</span> <span className="font-bold">{p.attackDamage.toFixed(1)}</span></div>
                        <div className={`flex justify-between border-b ${separatorClass} pb-1`}><span>攻速:</span> <span>{(60/Math.max(1, p.attackSpeed)).toFixed(2)}/s</span></div>
                        <div className={`flex justify-between border-b ${separatorClass} pb-1`}><span>弹速:</span> <span>{p.projectileSpeed.toFixed(1)}</span></div>
                        <div className={`flex justify-between border-b ${separatorClass} pb-1`}><span>数量:</span> <span>{p.projectileCount}</span></div>
                        <div className={`flex justify-between border-b ${separatorClass} pb-1`}><span>穿透:</span> <span>{p.projectilePierce}</span></div>
                        <div className={`flex justify-between border-b ${separatorClass} pb-1`}><span>移速:</span> <span>{p.speed.toFixed(2)}</span></div>
                        <div className={`flex justify-between border-b ${separatorClass} pb-1`}><span>掉落:</span> <span>{(p.dropRate*100).toFixed(0)}%</span></div>
                        
                        {p.lifeSteal > 0 && <div className="flex justify-between text-red-600"><span>吸血:</span> <span>{(p.lifeSteal*100).toFixed(1)}%</span></div>}
                        {p.dodgeChance > 0 && <div className="flex justify-between text-purple-600"><span>闪避:</span> <span>{(p.dodgeChance*100).toFixed(0)}%</span></div>}
                        {p.damageReflection > 0 && <div className="flex justify-between text-gray-600"><span>反伤:</span> <span>{(p.damageReflection*100).toFixed(0)}%</span></div>}
                        {insuranceCount > 0 && <div className="flex justify-between text-orange-600 font-bold mt-2 pt-2 border-t border-gray-400"><span>保险额度:</span> <span>{p.insuranceGoldEarned}/{maxInsurance}</span></div>}
                        
                        {/* DEBT WARNING */}
                        {pigDebtTotal > 0 && (
                            <div className="flex justify-between text-red-500 font-bold mt-2 pt-2 border-t border-red-400/50 animate-pulse">
                                <span>下波账单:</span> 
                                <span>-{pigDebtTotal} G</span>
                            </div>
                        )}

                        {/* SUMMON STATS SECTION */}
                        {showSummonStats && (
                            <div className={`mt-2 pt-2 border-t ${separatorClass} text-[#22d3ee]`}>
                                <div className="font-bold mb-1 flex items-center gap-1">
                                    <span>🤖</span> 外包团队数据
                                </div>
                                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 pl-1">
                                    <span className="opacity-80">生命:</span> 
                                    <span className="font-mono text-right text-green-400">+{Math.round((summonHpMult-1)*100)}%</span>
                                    
                                    <span className="opacity-80">伤害:</span> 
                                    <span className="font-mono text-right text-red-400">100%</span>
                                    
                                    <span className="opacity-80">攻速:</span> 
                                    <span className="font-mono text-right text-yellow-300">+{Math.round((summonAtkSpeedMult-1)*100)}%</span>
                                    
                                    <span className="opacity-80">工期:</span> 
                                    <span className="font-mono text-right">+{Math.round((summonDurationMult-1)*100)}%</span>
                                    
                                    <span className="opacity-80">射程:</span> 
                                    <span className="font-mono text-right">+{Math.round((summonRangeMult-1)*100)}%</span>

                                    {summonCooldownReduct > 0 && (
                                        <>
                                            <span className="opacity-80">冷却:</span> 
                                            <span className="font-mono text-right text-purple-300">-{summonCooldownReduct}%</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* CAPITAL SYNERGY STATS */}
                        {showCapitalStats && (
                            <div className={`mt-2 pt-2 border-t ${separatorClass} text-[#facc15]`}>
                                <div className="font-bold mb-1 flex items-center gap-1">
                                    <span>💰</span> 财务部专享
                                </div>
                                <div className="flex justify-between pl-1">
                                    <span className="text-xs opacity-80">本轮消费:</span> 
                                    <span className="font-mono font-bold">{p.goldSpentInShop} G</span>
                                </div>
                                <div className="flex justify-between pl-1 text-blue-400">
                                    <span className="text-xs opacity-80">下波护盾:</span> 
                                    <span className="font-mono font-bold">+{shieldBonus} 🛡️</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Active Synergies Display */}
                    {hasSynergies && (
                        <div className={`mt-4 pt-2 border-t-2 ${separatorClass}`}>
                            <div className="font-bold mb-2 opacity-80 flex justify-between items-center">
                                <span>部门架构</span>
                                <span className="text-[9px] opacity-50 font-normal">收集进度</span>
                            </div>
                            <div className="space-y-1">
                                {visibleSynergies.map(tagId => {
                                    const syn = SYNERGIES[tagId];
                                    if (!syn) return null;
                                    
                                    const count = counts[tagId];
                                    const activeLevel = activeTiers[tagId] || 0;
                                    const isActive = activeLevel > 0;
                                    const isBoard = tagId === 'board';
                                    
                                    // Calculate Next Threshold
                                    const nextLevel = syn.levels.find(l => l.count > count);
                                    const maxCount = syn.levels[syn.levels.length - 1].count;
                                    const nextThreshold = nextLevel ? nextLevel.count : maxCount;
                                    const isMaxed = count >= maxCount;

                                    return (
                                        <div 
                                            key={tagId} 
                                            className={`
                                                relative flex flex-col rounded px-1.5 py-1 cursor-help transition-all border
                                                ${isActive 
                                                    ? (isBoard 
                                                        ? 'bg-black border-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.3)]' 
                                                        : (isRetro ? 'bg-white border-blue-300' : 'bg-slate-800 border-slate-600')
                                                      ) 
                                                    : (isRetro ? 'bg-gray-100 border-gray-300 opacity-80' : 'bg-slate-900/40 border-slate-800 opacity-70')
                                                }
                                                hover:opacity-100
                                            `}
                                            onMouseEnter={(e) => handleMouseEnter(tagId, e)}
                                            onMouseLeave={() => setHoverState(null)}
                                        >
                                            <div className="flex justify-between items-center z-10 relative">
                                                <div className="flex items-center gap-1.5">
                                                    <span className={isActive ? 'opacity-100' : 'opacity-50 grayscale'}>{syn.icon}</span>
                                                    <span style={{ color: isActive ? syn.color : (isRetro ? '#666' : '#94a3b8') }} className="font-bold">
                                                        {syn.name}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className={`font-mono text-[10px] ${isActive ? 'text-white' : 'text-slate-500'}`}>
                                                        {count}<span className="opacity-50">/{nextThreshold}</span>
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            {/* Mini Progress Bar */}
                                            <div className="h-1 w-full bg-black/20 rounded-full mt-1 overflow-hidden relative">
                                                <div 
                                                    className="h-full transition-all duration-300"
                                                    style={{ 
                                                        width: `${Math.min(100, (count / maxCount) * 100)}%`,
                                                        backgroundColor: isActive ? syn.color : '#94a3b8'
                                                    }}
                                                />
                                                {/* Threshold Markers */}
                                                {syn.levels.map(l => (
                                                    <div 
                                                        key={l.count}
                                                        className="absolute top-0 bottom-0 w-[1px] bg-black/30"
                                                        style={{ left: `${(l.count / maxCount) * 100}%` }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Tooltip Portal */}
            {hoverState && SYNERGIES[hoverState.tagId] && (
                <div 
                    className={`fixed z-[9999] w-64 p-3 shadow-2xl pointer-events-none rounded-lg animate-pop-in ${
                        isRetro 
                        ? 'bg-[#FFFFE1] border border-black text-black' 
                        : 'bg-slate-900/95 border border-slate-500 text-white backdrop-blur-sm'
                    }`}
                    style={{
                        top: Math.min(hoverState.top, window.innerHeight - 250),
                        left: hoverState.left
                    }}
                >
                    <div className={`flex items-center gap-2 mb-2 border-b pb-2 ${isRetro ? 'border-gray-400' : 'border-slate-600'}`}>
                        <span className="text-2xl">{SYNERGIES[hoverState.tagId].icon}</span>
                        <div>
                            <div className="font-bold text-sm" style={{color: SYNERGIES[hoverState.tagId].color}}>
                                {SYNERGIES[hoverState.tagId].name}
                            </div>
                            <div className={`text-[10px] ${isRetro ? 'text-gray-600' : 'text-slate-400'}`}>
                                持有物品: <span className="font-mono font-bold text-white bg-slate-700 px-1 rounded">{counts[hoverState.tagId]}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="text-[10px] mb-2 opacity-90 italic">
                        {SYNERGIES[hoverState.tagId].description}
                    </div>

                    <div className="space-y-1.5">
                        {SYNERGIES[hoverState.tagId].levels.map(l => {
                            const isUnlocked = counts[hoverState.tagId] >= l.count;
                            return (
                                <div key={l.count} className={`flex items-start gap-2 text-[10px] ${
                                    isUnlocked
                                    ? (isRetro ? 'text-black font-bold' : 'text-green-400 font-bold') 
                                    : 'opacity-50'
                                }`}>
                                    <span className={`font-mono min-w-[24px] text-center rounded px-1 ${isUnlocked ? 'bg-green-900/50 border border-green-700' : 'bg-slate-800 border border-slate-700'}`}>
                                        {l.count}件
                                    </span>
                                    <span className="leading-tight flex-1">{l.effectDesc}</span>
                                    {isUnlocked && <span>✓</span>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
