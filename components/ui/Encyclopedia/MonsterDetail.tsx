
import React from 'react';
import { EnemyConfig } from '../../../types';
import { ENEMY_LORE } from '../../../data/encyclopedia/enemyLore';

interface MonsterDetailProps {
    enemy: EnemyConfig;
    isUnlocked: boolean;
}

const BEHAVIOR_MAP: Record<string, string> = {
    'chase': '追踪',
    'shooter': '远程射击',
    'rusher': '高速突进',
    'boss': '终极首领',
    'circle': '环绕冲撞',
    'turret': '固定炮台',
    'tank': '重装坦克',
    'minion': '普通杂兵',
    'bonus': '奖励单位',
    'support': '后勤支援',
    'spawner': '召唤师',
    'linker': '链接者',
    'summoner_orbit': '女神降临',
    'devourer': '吞噬进化',
    'balloon': '漂浮爆炸物'
};

const ATTACK_PATTERN_MAP: Record<string, string> = {
    'single': '单发点射',
    'spread': '扇形散射',
    'spiral': '螺旋弹幕',
    'circle': '全向扩散',
    'explode': '爆裂溅射',
    'burst': '连发速射'
};

export const MonsterDetail: React.FC<MonsterDetailProps> = ({ enemy, isUnlocked }) => {
    // Special handling for AI Boss and its minions - marked as Scrapped/Deprecated
    const isScrapped = ['boss_ai', 'boss_ai_clone', 'boss_ai_node'].includes(enemy.type);
    const lore = ENEMY_LORE[enemy.type];

    if (!isUnlocked) {
        return (
            <div className="flex flex-col items-center gap-4 animate-pop-in">
                <div className="text-9xl grayscale brightness-0 opacity-50">?</div>
                <h2 className="text-3xl font-black text-slate-600">???</h2>
                <p className="text-slate-500">未遭遇的生物</p>
            </div>
        );
    }

    const tier = enemy.tier || 'common';
    
    const getRarityColor = (r: string) => {
        switch(r) {
            case 'boss':
            case 'mythic': return 'text-red-500';
            case 'epic': return 'text-yellow-400';
            case 'rare': return 'text-purple-400';
            default: return 'text-white';
        }
    };

    const getRarityBadgeClass = (r: string) => {
         switch(r) {
            case 'boss':
            case 'mythic': return 'bg-red-900 text-red-300';
            case 'epic': return 'bg-yellow-900 text-yellow-300';
            case 'rare': return 'bg-purple-900 text-purple-300';
            default: return 'bg-slate-700 text-slate-300';
        }
    };
    
    const getRarityLabel = (r: string) => {
         switch(r) {
            case 'boss': return 'BOSS级 (灾难)';
            case 'epic': return '精英级 (严重)';
            case 'rare': return '稀有级 (警告)';
            default: return '普通级 (一般)';
        }
    };

    // Fallback to split logic only if name is missing (for safety)
    const displayName = enemy.name || enemy.description.split('，')[0] || enemy.description.split('。')[0];

    return (
        <div className={`flex flex-col gap-6 animate-pop-in relative ${isScrapped ? 'overflow-hidden' : ''}`}>
            
            {/* Scrapped AI Boss Visual Glitch Overlay */}
            {isScrapped && (
                <>
                    <div className="absolute top-0 right-0 p-4 transform rotate-12 opacity-30 pointer-events-none">
                        <div className="border-4 border-red-500 text-red-500 font-black text-6xl px-4 py-2">
                            DEPRECATED
                        </div>
                    </div>
                    <style>{`
                        .glitch-container {
                            animation: glitch-skew 3s infinite linear alternate-reverse;
                        }
                        @keyframes glitch-skew {
                            0% { transform: skew(0deg); }
                            20% { transform: skew(-2deg); }
                            40% { transform: skew(1deg); }
                            60% { transform: skew(0deg); }
                            80% { transform: skew(3deg); }
                            100% { transform: skew(0deg); }
                        }
                    `}</style>
                </>
            )}

            <div className={`flex items-center gap-6 ${isScrapped ? 'glitch-container filter hue-rotate-90' : ''}`}>
                <div className={`text-8xl bg-slate-800 p-6 rounded-full border-4 ${
                    tier === 'boss' ? 'border-red-600 shadow-red-500/30 shadow-lg' : 
                    tier === 'epic' ? 'border-yellow-500 shadow-yellow-500/30 shadow-lg' :
                    tier === 'rare' ? 'border-purple-500' : 'border-slate-600'
                }`}>
                    {enemy.emoji}
                </div>
                <div>
                    <h2 className={`text-4xl font-black mb-2 ${getRarityColor(tier)}`}>
                        {displayName}
                    </h2>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${getRarityBadgeClass(tier)}`}>
                        {getRarityLabel(tier)}
                    </span>
                    {enemy.behavior === 'bonus' && (
                        <span className="ml-2 px-2 py-0.5 rounded text-xs font-bold uppercase bg-yellow-500 text-black">
                            奖励单位
                        </span>
                    )}
                </div>
            </div>
            
            {/* Scrapped Dev Note */}
            {isScrapped && lore?.devNote && (
                <div className="bg-red-950/50 border border-red-500/50 p-4 rounded-lg text-sm text-red-200 font-mono whitespace-pre-wrap relative z-10">
                    {lore.devNote}
                </div>
            )}

            <div className={`bg-slate-800/50 p-6 rounded-xl border border-slate-700 space-y-4 ${isScrapped ? 'opacity-80' : ''}`}>
                <h3 className="text-xl font-bold text-cyan-400 border-b border-slate-700 pb-2">基础档案</h3>
                <p className="text-lg text-slate-300 leading-relaxed">{enemy.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                    <div className="flex justify-between bg-slate-900 p-2 rounded"><span>基础生命:</span> <span className="text-green-400">{enemy.hp}</span></div>
                    <div className="flex justify-between bg-slate-900 p-2 rounded"><span>基础伤害:</span> <span className="text-red-400">{enemy.damage}</span></div>
                    <div className="flex justify-between bg-slate-900 p-2 rounded"><span>移动速度:</span> <span className="text-blue-400">{enemy.speed}</span></div>
                    <div className="flex justify-between bg-slate-900 p-2 rounded"><span>击杀功德:</span> <span className="text-yellow-400">{enemy.score}</span></div>
                </div>
            </div>

            {/* NEW: Skills Section */}
            {lore && lore.skills && lore.skills.length > 0 && (
                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                    <h3 className="text-xl font-bold text-purple-400 border-b border-slate-700 pb-2 mb-4 flex items-center gap-2">
                        <span>⚡</span> 已识别技能模组
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
                                             skill.type === 'mechanism' ? '场景机制' : '被动特性'}
                                        </span>
                                    </div>
                                    <p className={`text-sm ${isScrapped ? 'text-slate-500 line-through' : 'text-slate-400'}`}>
                                        {skill.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                 <h3 className="text-xl font-bold text-red-400 border-b border-slate-700 pb-2 mb-4">行为模式</h3>
                 <div className="space-y-2 text-slate-300">
                     <p><span className="text-slate-500">行为类型:</span> <span className="text-white font-bold">{BEHAVIOR_MAP[enemy.behavior] || enemy.behavior}</span></p>
                     <p><span className="text-slate-500">攻击方式:</span> <span className="text-white font-bold">{ATTACK_PATTERN_MAP[enemy.attackPattern || 'single'] || '普通碰撞'}</span></p>
                     {enemy.projectileChar && <p><span className="text-slate-500">子弹:</span> <span className="text-white bg-slate-700 px-2 rounded">{enemy.projectileChar}</span></p>}
                     {enemy.deathQuotes && <p><span className="text-slate-500">遗言:</span> <span className="italic text-slate-400">"{enemy.deathQuotes[0]}"</span></p>}
                 </div>
            </div>
        </div>
    );
};
