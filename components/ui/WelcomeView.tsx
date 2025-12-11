
import React, { useState, useEffect } from 'react';
import { Button } from '../Button';
import { CreditsModal } from './CreditsModal';
import { GlobalSettingsModal } from './GlobalSettingsModal';
import { gameEngine } from '../../services/gameEngine';

// Import sub-components
import { GlitchStyles } from './Welcome/GlitchStyles';
import { BackgroundWalkers } from './Welcome/BackgroundWalkers';
import { CyberTitle } from './Welcome/CyberTitle';

export const WelcomeView: React.FC<{ 
    onStart: () => void, 
    onEncyclopedia: () => void, 
    onAchievements: () => void, 
    onLeaderboard: () => void,
    onContinue?: () => void,
    onLinkCode: () => void
}> = ({ onStart, onEncyclopedia, onAchievements, onLeaderboard, onContinue, onLinkCode }) => {
    const [showCredits, setShowCredits] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [hasSave, setHasSave] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
    
    useEffect(() => {
        gameEngine.audio.playAmbientBGM();
        setHasSave(gameEngine.hasSave());

        const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFsChange);
        return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, []);

    const toggleFullscreen = () => {
        gameEngine.toggleFullscreen();
    };

    return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-50 text-center p-4 pointer-events-none bg-black/80">
      
      {/* Inject CSS */}
      <GlitchStyles />

      {/* Top Left: ESC Hint */}
      <div className="absolute top-6 left-6 pointer-events-auto flex items-center gap-3 z-30 animate-pulse">
          <div className="w-14 h-14 border-4 border-white/30 rounded flex items-center justify-center font-bold text-xl text-white shadow-lg bg-slate-900/50">
              Esc
          </div>
          <div className="text-sm text-slate-400 font-bold">暂停</div>
      </div>

      {/* Top Left: F11 Hint (Below ESC) */}
      <div className="absolute top-24 left-6 pointer-events-auto flex items-center gap-3 z-30 animate-pulse">
          <div className="w-14 h-14 border-4 border-white/30 rounded flex items-center justify-center font-bold text-xl text-white shadow-lg bg-slate-900/50">
              F11
          </div>
          <div className="text-sm text-slate-400 font-bold">退出/进入全屏</div>
      </div>

      {/* Top Right: Buttons */}
      <div className="absolute top-6 right-6 pointer-events-auto z-30 flex gap-4">
          <button 
            onClick={toggleFullscreen}
            className="w-14 h-14 border-4 border-slate-500/50 hover:border-cyan-400 rounded-full flex items-center justify-center text-2xl bg-slate-900/50 text-slate-300 hover:text-white hover:scale-105 transition-all shadow-lg"
            title={isFullscreen ? "退出全屏" : "进入全屏 (ESC不退出)"}
          >
              {isFullscreen ? '✖' : '⛶'}
          </button>

          <button 
            onClick={() => setShowSettings(true)}
            className="w-14 h-14 border-4 border-slate-500/50 hover:border-cyan-400 rounded-full flex items-center justify-center text-2xl bg-slate-900/50 text-slate-300 hover:text-white hover:scale-105 transition-all shadow-lg"
            title="全局设置"
          >
              ⚙️
          </button>
      </div>

      {/* Background Animation */}
      <BackgroundWalkers />

      <div className="pointer-events-auto bg-slate-900/90 p-12 rounded-xl border-4 border-cyan-500 shadow-[0_0_50px_rgba(34,211,238,0.2)] backdrop-blur-md max-w-2xl relative overflow-hidden z-10 flex flex-col items-center">
        
        {/* Main Title Logic */}
        <CyberTitle />

        <div className="text-3xl text-white font-bold mb-2 tracking-widest flex items-center gap-2">
            赛博清理员
        </div>

        <div className="text-sm text-slate-400 mb-1 font-mono flex flex-col items-center">
            <span>Ev Studio 制作</span>
            <span className="text-[10px] opacity-50 mt-1">版本号：V1.9999 PRO MAX</span>
        </div>
        
        <div className="text-xs text-red-400 mt-2 font-bold animate-bounce flex items-center gap-2">
            <span>🔥</span>
            <span>还差0.0001拼成，邀请好友助力，升级版本2.0</span>
            <span>🔥</span>
        </div>
        
        <div className="flex flex-col w-64 gap-4 mb-6 mt-8 relative z-20">
            <Button size="lg" onClick={onStart} className="text-2xl px-12 py-4 border-b-8 border-indigo-800">
                开始清理
            </Button>
            
            {hasSave && onContinue && (
                <Button size="lg" onClick={onContinue} className="text-xl px-12 py-3 border-b-8 !border-green-800 bg-green-600 hover:bg-green-500">
                    继续加班
                </Button>
            )}
        </div>

        <div className="grid grid-cols-2 gap-4 w-full justify-center px-8 relative z-20">
            <Button size="md" variant="secondary" onClick={onEncyclopedia} className="border-b-4">
                🕵️ 黑市情报
            </Button>
            <Button size="md" variant="secondary" onClick={onAchievements} className="border-b-4">
                📊 业绩考核
            </Button>
            <Button size="md" variant="secondary" onClick={onLeaderboard} className="border-b-4">
                🏆 卷王排行
            </Button>
            <Button size="md" variant="secondary" onClick={onLinkCode} className="border-b-4">
                📂 电子简历
            </Button>
        </div>
        
        <Button size="md" variant="danger" onClick={() => setShowCredits(true)} className="mt-6 px-10 relative z-20">
            制作人员
        </Button>
      </div>

      <div className="absolute left-10 bottom-10 flex flex-col items-center gap-4 text-white/50 animate-pulse z-20">
          <div className="text-2xl font-bold">移动</div>
          <div className="grid grid-cols-3 gap-2">
              <div />
              <div className="w-12 h-12 border-4 border-white/30 rounded flex items-center justify-center font-bold text-xl">W</div>
              <div />
              <div className="w-12 h-12 border-4 border-white/30 rounded flex items-center justify-center font-bold text-xl">A</div>
              <div className="w-12 h-12 border-4 border-white/30 rounded flex items-center justify-center font-bold text-xl">S</div>
              <div className="w-12 h-12 border-4 border-white/30 rounded flex items-center justify-center font-bold text-xl">D</div>
          </div>
      </div>

      <div className="absolute right-10 bottom-10 flex flex-col items-center gap-4 text-white/50 animate-pulse z-20">
          <div className="text-2xl font-bold">瞄准</div>
          <div className="w-24 h-36 border-4 border-white/30 rounded-full relative">
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-1 h-10 bg-white/30 rounded-full"></div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-full bg-white/10"></div>
          </div>
      </div>
      
      {showCredits && <CreditsModal onClose={() => setShowCredits(false)} />}
      {showSettings && <GlobalSettingsModal onClose={() => setShowSettings(false)} />}
    </div>
    );
};
