
import React from 'react';
import { SummonConfig } from '../../../data/summons/summonStats';
import { gameEngine } from '../../../services/gameEngine';
import { SUMMON_LORE } from '../../../data/encyclopedia/summonLore'; // Import Lore

interface SummonDetailProps {
    summon: SummonConfig;
}

const AI_LABEL_MAP: Record<string, string> = {
    'temp_worker': '直线冲撞 (自毁)',
    'intern': '跟随护主 (远程)',
    'troll': '巡逻索敌 (自爆)',
    'drone': '环绕护卫 (近战)',
    'chatbot': '固定炮台 (速射)',
    'clone': '镜像替身 (复制)',
    'headhunter': '游走挖角 (策反)',
    'code_mountain': '随机蠕动 (肉盾)',
    'troll_mini': '弱智冲锋 (自爆)',
    'pacman': '曼哈顿巡逻 (吞噬)'
};

export const SummonDetail: React.FC<SummonDetailProps> = ({ summon }) => {
    // Check unlock status directly from engine (simpler than passing prop down 3 layers again)
    const isUnlocked = gameEngine.unlockedCompendium.has(summon.id);
    const lore = SUMMON_LORE[summon.aiType] || SUMMON_LORE[summon.id]; // Try match aiType or ID

    if (!isUnlocked) {
        return (
            <div className="flex flex-col items-center gap-4 animate-pop-in">
                <div className="text-9xl grayscale brightness-0 opacity-50">?</div>
                <h2 className="text-3xl font-black text-slate-600">???</h2>
                <p className="text-slate-500">未招募的单位</p>
            </div>
        );
    }

    const tier = summon.tier || 'common';

    const getRarityColor = (r: string) => {
        switch(r) {
            case 'mythic': return 'text-red-500';
            case 'epic': return 'text-yellow-400';
            case 'rare': return 'text-purple-400';
            default: return 'text-slate-300';
        }
    };

    const getRarityBadge = (r: string) => {
         switch(r) {
            case 'mythic': return <span className="bg-red-900 text-red-300 px-2 py-0.5 rounded text-xs font-bold border border-red-700">传说单位</span>;
            case 'epic': return <span className="bg-yellow-900 text-yellow-300 px-2 py-0.5 rounded text-xs font-bold border border-yellow-700">史诗单位</span>;
            case 'rare': return <span className="bg-purple-900 text-purple-300 px-2 py-0.5 rounded text-xs font-bold border border-purple-700">稀有单位</span>;
            default: return <span className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded text-xs font-bold border border-slate-500">普通单位</span>;
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-pop-in">
            <div className="flex items-center gap-6">
                <div className={`text-8xl bg-slate-800 p-6 rounded-xl border-4 shadow-lg ${
                    tier === 'mythic' ? 'border-red-500 shadow-red-900/50' :
                    tier === 'epic' ? 'border-yellow-500 shadow-yellow-900/50' :
                    tier === 'rare' ? 'border-purple-500 shadow-purple-900/50' :
                    'border-slate-500'
                }`} style={{ color: summon.color }}>
                    {summon.emoji}
                </div>
                <div>
                    <h2 className={`text-4xl font-black mb-2 ${getRarityColor(tier)}`}>{summon.name}</h2>
                    <div className="flex gap-2">
                        <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-slate-800 text-slate-400 border border-slate-600">
                            外包单位
                        </span>
                        {getRarityBadge(tier)}
                    </div>
                </div>
            </div>

            {/* SKILLS SECTION (New) */}
            {lore && lore.skills && lore.skills.length > 0 && (
                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                    <h3 className="text-xl font-bold text-purple-400 border-b border-slate-700 pb-2 mb-4 flex items-center gap-2">
                        <span>⚡</span> 技能模组
                    </h3>
                    <div className="grid gap-3">
                        {lore.skills.map((skill, idx) => (
                            <div key={idx} className="flex gap-3 items-start bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                                <div className="text-2xl mt-1">{skill.icon}</div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-white text-base">{skill.name}</span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                            skill.type === 'ultimate' ? 'bg-red-900 text-red-200 border border-red-700' :
                                            skill.type === 'active' ? 'bg-blue-900 text-blue-200 border border-blue-700' :
                                            skill.type === 'mechanism' ? 'bg-purple-900 text-purple-200 border border-purple-700' :
                                            'bg-slate-700 text-slate-300 border border-slate-600'
                                        }`}>
                                            {skill.type === 'ultimate' ? '终极技能' : 
                                             skill.type === 'active' ? '主动技能' : 
                                             skill.type === 'mechanism' ? '特殊机制' : '被动特性'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-400">
                                        {skill.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 space-y-4">
                <h3 className="text-xl font-bold text-cyan-400 border-b border-slate-700 pb-2">基础属性</h3>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                     <div className="bg-slate-900 p-2 rounded flex justify-between">
                         <span className="text-slate-400">基础生命</span> 
                         <span className="text-green-400 font-mono font-bold">
                             {summon.isInvincible || summon.maxHp > 9000 ? '∞ (无限)' : summon.maxHp}
                         </span>
                     </div>
                     <div className="bg-slate-900 p-2 rounded flex justify-between"><span className="text-slate-400">基础伤害</span> <span className="text-red-400 font-mono font-bold">{summon.damage}</span></div>
                     <div className="bg-slate-900 p-2 rounded flex justify-between"><span className="text-slate-400">移动速度</span> <span className="text-blue-400 font-mono font-bold">{summon.speed}</span></div>
                     <div className="bg-slate-900 p-2 rounded flex justify-between">
                         <span className="text-slate-400">存在时间</span> 
                         <span className="text-yellow-400 font-mono font-bold">
                             {summon.duration > 9000 ? '∞ (直至死亡)' : `${(summon.duration/60).toFixed(1)}s`}
                         </span>
                     </div>
                     <div className="bg-slate-900 p-2 rounded flex justify-between"><span className="text-slate-400">攻击间隔</span> <span className="text-orange-400 font-mono font-bold">{summon.fireRate ? `${(summon.fireRate/60).toFixed(1)}s` : 'N/A'}</span></div>
                     <div className="bg-slate-900 p-2 rounded flex justify-between"><span className="text-slate-400">索敌范围</span> <span className="text-purple-400 font-mono font-bold">{summon.detectRange || summon.attackRange || 'N/A'}</span></div>
                </div>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 space-y-4">
                 <h3 className="text-xl font-bold text-yellow-400 border-b border-slate-700 pb-2">特性描述</h3>
                 
                 <div className="text-sm text-slate-300 leading-relaxed min-h-[60px]">
                    {summon.description || "暂无详细描述。"}
                 </div>

                 {summon.quote && (
                     <div className="bg-black/30 p-3 rounded-lg border-l-4 border-yellow-600 italic text-yellow-100/80 text-sm">
                         {summon.quote}
                     </div>
                 )}

                 <div className="grid grid-cols-1 gap-2 mt-4">
                     <div className="bg-slate-900 px-3 py-2 rounded flex items-center gap-2 border border-slate-700">
                         <span className="text-slate-500 text-xs font-bold uppercase">行动逻辑</span>
                         <span className="text-white font-bold text-sm">{AI_LABEL_MAP[summon.aiType] || summon.aiType}</span>
                     </div>
                     
                     {summon.isExplosive && (
                         <div className="bg-red-900/30 px-3 py-2 rounded flex items-center gap-2 border border-red-900/50">
                             <span className="text-red-400">💥</span>
                             <span className="text-red-200 text-xs">死亡时产生爆炸 (范围: {summon.maxExplosionRadius})</span>
                         </div>
                     )}
                     {summon.isInvincible && (
                         <div className="bg-yellow-900/30 px-3 py-2 rounded flex items-center gap-2 border border-yellow-900/50">
                             <span className="text-yellow-400">🛡️</span>
                             <span className="text-yellow-200 text-xs">无敌单位 (无法被选中或摧毁)</span>
                         </div>
                     )}
                 </div>
            </div>
        </div>
    );
};
