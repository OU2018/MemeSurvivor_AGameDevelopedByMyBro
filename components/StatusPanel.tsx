
import React, { useEffect, useState } from 'react';
import { WAVES } from '../data/memeContent';
import { gameEngine } from '../services/gameEngine';
import { StatusPanelAvatar } from './ui/StatusPanel/StatusPanelAvatar';
import { StatusPanelStats } from './ui/StatusPanel/StatusPanelStats';
import { StatusPanelSynergies } from './ui/StatusPanel/StatusPanelSynergies';

export const StatusPanel: React.FC = () => {
  const p = gameEngine.state.player;
  const s = gameEngine.state;

  const [state, setState] = useState({
      player: p, // Pass full player object to Avatar
      gold: p.gold,
      wave: s.currentWave,
      waveTimer: s.waveTimer,
      isOvertime: s.isOvertime,
      derivedStats: s.derivedStats || { synergies: {}, activeTiers: {} }
  });

  // Poll Game Engine State independently (30fps is enough for UI)
  useEffect(() => {
      let animationFrameId: number;
      let lastUpdate = 0;

      const loop = (timestamp: number) => {
          if (timestamp - lastUpdate > 32) { // ~30fps throttling
              const currentS = gameEngine.state;
              
              // Update local state
              setState({
                  player: currentS.player,
                  gold: currentS.player.gold,
                  wave: currentS.currentWave,
                  waveTimer: currentS.waveTimer,
                  isOvertime: currentS.isOvertime,
                  derivedStats: currentS.derivedStats || { synergies: {}, activeTiers: {} }
              });
              
              lastUpdate = timestamp;
          }
          animationFrameId = requestAnimationFrame(loop);
      };
      
      animationFrameId = requestAnimationFrame(loop);
      return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // --- Wave Timer Logic ---
  const effectiveWave = ((state.wave - 1) % 8) + 1;
  const waveConfig = WAVES.find(w => w.waveNumber === effectiveWave) || WAVES[WAVES.length - 1];
  
  const timeLeft = Math.max(0, waveConfig.duration - Math.floor(state.waveTimer / 60));
  const timeStr = waveConfig.isBossWave ? "BOSS" : `${timeLeft}秒`;

  return (
    <div className="absolute top-6 left-6 right-6 flex justify-between items-start gap-4 z-10 pointer-events-none">
      {/* Left Column: Player Status & Synergies */}
      <div className="flex flex-col w-96 gap-2">
         {/* Avatar & Stats */}
         <StatusPanelAvatar player={state.player} activeTiers={state.derivedStats.activeTiers} />
         
         {/* Gold */}
         <StatusPanelStats gold={state.gold} />

         {/* Synergies List */}
         <StatusPanelSynergies synergies={state.derivedStats.synergies} />
      </div>

      {/* Center: Wave Timer */}
      {!state.isOvertime && (
          <div className="flex flex-col items-center">
               <div className="text-xl font-bold text-slate-300 drop-shadow-md">第 {state.wave} 波</div>
               <div className={`text-7xl font-black font-mono drop-shadow-2xl ${timeLeft < 10 && !waveConfig.isBossWave ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                   {timeStr}
               </div>
               {waveConfig.isBossWave && <div className="text-red-500 font-bold animate-bounce text-3xl mt-2 stroke-black">KPI大魔王!</div>}
          </div>
      )}
    </div>
  );
};
