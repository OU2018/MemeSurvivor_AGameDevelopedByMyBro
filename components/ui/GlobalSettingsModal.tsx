
import React, { useState } from 'react';
import { Button } from '../Button';
import { gameEngine } from '../../services/gameEngine';

interface GlobalSettingsModalProps {
    onClose: () => void;
}

export const GlobalSettingsModal: React.FC<GlobalSettingsModalProps> = ({ onClose }) => {
    const [settings, setSettings] = useState(gameEngine.settings);
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    const updateVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        gameEngine.updateSettings({ volume: val });
        setSettings(prev => ({ ...prev, volume: val }));
    };

    const toggleShopSkin = () => {
        const newVal = settings.shopSkin === 'default' ? 'retro' : 'default';
        gameEngine.updateSettings({ shopSkin: newVal });
        setSettings(prev => ({ ...prev, shopSkin: newVal }));
    };

    const toggleScreenShake = () => {
        const newVal = !settings.screenShake;
        gameEngine.updateSettings({ screenShake: newVal });
        setSettings(prev => ({ ...prev, screenShake: newVal }));
    };

    const handleHardReset = () => {
        gameEngine.hardReset();
    };

    return (
        <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md flex items-center justify-center z-[100] animate-pop-in p-4 pointer-events-auto" onClick={onClose}>
            <div className="bg-slate-800 p-8 rounded-2xl border-4 border-slate-600 shadow-2xl max-w-lg w-full space-y-8 relative" onClick={e => e.stopPropagation()}>
                <h2 className="text-3xl font-black text-white mb-6 text-center border-b border-slate-700 pb-4">全局设置</h2>
                
                <div className="space-y-6">
                    {/* Volume */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-cyan-300">主音量</h3>
                            <span className="text-white font-mono">{(settings.volume * 100).toFixed(0)}%</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" max="1" step="0.05" 
                            value={settings.volume} 
                            onChange={updateVolume}
                            className="w-full accent-cyan-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <hr className="border-slate-700" />

                    {/* Screen Shake */}
                    <div className="flex justify-between items-center">
                        <div className="space-y-1 text-left">
                             <h3 className="text-lg font-bold text-white">屏幕震动</h3>
                             <p className="text-slate-400 text-xs">关闭以减少视觉疲劳和晕动症。</p>
                        </div>
                        <Button 
                            size="sm" 
                            variant={settings.screenShake ? 'primary' : 'outline'} 
                            onClick={toggleScreenShake}
                            className="w-24 shrink-0"
                        >
                            {settings.screenShake ? '开启' : '关闭'}
                        </Button>
                    </div>

                    <hr className="border-slate-700" />

                    {/* Shop Skin (Easter Egg) */}
                    <div className="flex justify-between items-center">
                        <div className="space-y-1 text-left">
                             <h3 className="text-lg font-bold text-purple-400">商店风格</h3>
                             <p className="text-slate-400 text-xs">切换怀旧风格或默认现代风格。</p>
                        </div>
                        <button 
                            onClick={toggleShopSkin}
                            className={`px-3 py-1.5 rounded border-2 font-bold text-xs w-28 transition-all ${
                                settings.shopSkin === 'retro' 
                                ? 'bg-[#ECE9D8] border-[#0054E3] text-[#0054E3] shadow-md' 
                                : 'bg-slate-900 border-slate-500 text-white'
                            }`}
                        >
                            {settings.shopSkin === 'retro' ? 'Windows XP' : '默认风格'}
                        </button>
                    </div>

                    <hr className="border-slate-700" />

                    {/* Danger Zone */}
                    {!showResetConfirm ? (
                        <div className="flex justify-between items-center pt-2">
                            <div className="text-xs text-red-400 font-bold">⚠ 危险区域</div>
                            <Button size="sm" variant="danger" onClick={() => setShowResetConfirm(true)} className="bg-red-900/50 border-red-800 hover:bg-red-800 text-xs">
                                重置所有数据
                            </Button>
                        </div>
                    ) : (
                        <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-xl text-center space-y-3 animate-pop-in">
                            <p className="text-red-400 font-bold text-sm">确定要删除所有存档、成就和图鉴吗？<br/>此操作无法撤销！</p>
                            <div className="flex gap-4 justify-center">
                                <Button size="sm" variant="outline" onClick={() => setShowResetConfirm(false)}>取消</Button>
                                <Button size="sm" variant="danger" onClick={handleHardReset}>确定重置</Button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-center pt-4">
                    <Button size="md" onClick={onClose} className="px-10">关闭</Button>
                </div>
            </div>
        </div>
    );
};
