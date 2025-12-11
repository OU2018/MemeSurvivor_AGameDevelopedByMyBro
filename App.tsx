
import React from 'react';
import { GamePhase } from './types';
import { gameEngine } from './services/gameEngine';
import { StatusPanel } from './components/StatusPanel';
import { useGameCore } from './hooks/useGameCore';

// Import Views
import { WelcomeView } from './components/ui/WelcomeView';
import { SettingsView } from './components/ui/SettingsView';
import { DifficultySelectView } from './components/ui/DifficultySelectView';
import { CharacterSelectView } from './components/ui/CharacterSelectView';
import { ShopView } from './components/ui/ShopView';
import { VictoryView } from './components/ui/VictoryView';
import { GameOverView } from './components/ui/GameOverView';
import { PauseOverlay } from './components/ui/PauseOverlay';
import { EncyclopediaView } from './components/ui/EncyclopediaView';
import { WaveSummaryView } from './components/ui/WaveSummaryView';
import { AchievementsView } from './components/ui/AchievementsView';
import { LeaderboardView } from './components/ui/LeaderboardView';
import { LinkView } from './components/ui/LinkView';
import { SandboxView } from './components/ui/SandboxView'; 
import { AchievementPopup } from './components/ui/AchievementPopup'; 
import { CursorOverlay } from './components/ui/CursorOverlay';
import { BootSequence } from './components/ui/BootSequence'; // Import BootSequence

// Import New Cutscene Engine & Scripts
import { CutsceneEngine } from './components/cutscenes/CutsceneEngine';
import { OPENING_SCRIPTS, BOSS_SCRIPTS, ELITE_SCRIPTS } from './data/scripts';
import { DirectorSystem } from './services/logic/systems/DirectorSystem';

export default function App() {
  const {
    canvasRef,
    phase,
    selectedChar,
    inTransition,
    isPausedUI,
    handleStart,
    handleEncyclopedia,
    handleAchievements,
    handleLeaderboard,
    handleContinue,
    handleSettingsBack,
    handleSettingsNext,
    handleBack,
    handleDifficultySelect,
    handleCharSelect,
    finishStory,
    handleNextWave,
    startEliteWave,
    handleWaveSummaryConfirm,
    startEndlessMode,
    startBossBattle,
    restartGame,
    goToMainMenu,
    resumeGame,
    handleLinkCode,
    handleImportSuccess,
    // We need a way to switch phase manually for the boot sequence
    // Using a direct setPhase approach isn't exposed by useGameCore, but useGameCore manages 'phase' state internally.
    // However, useGameCore's 'phase' state is initialized to WELCOME. We need to initialize it to BOOT.
    // NOTE: For this specific request, I will modify useGameCore to default to BOOT, OR handle it via a new exposed method.
    // Let's check useGameCore.ts... it has 'switchPhase'. I need to expose it or modify the hook.
    // Better yet, I will modify useGameCore.ts to initialize with BOOT.
  } = useGameCore();
  
  // Need to get the switchPhase function or similar to transition from BOOT to WELCOME.
  // Since useGameCore returns specific handlers but not a generic switchPhase, 
  // I will assume for this implementation that I should modify useGameCore to support the Boot phase transition.
  // BUT, I can't modify useGameCore in this file block. 
  // Wait, I am modifying App.tsx. I can pass a callback to BootSequence that calls `goToMainMenu`.
  // `goToMainMenu` sets phase to WELCOME. That fits perfectly!

  // --- Cutscene Script Resolution ---
  const getOpeningScript = () => OPENING_SCRIPTS[selectedChar] || OPENING_SCRIPTS['9527'];
  
  const getBossScript = () => {
      const bossType = DirectorSystem.getBossTypeForPlayer(gameEngine.state.player.characterId);
      const charId = gameEngine.state.player.characterId;
      
      // Special script for EV vs Glitch (Legacy Code)
      if (bossType === 'boss_glitch' && charId === 'ev_creator') {
          return BOSS_SCRIPTS['boss_glitch_ev'] || BOSS_SCRIPTS['boss_glitch'];
      }

      // Special script for 1024 vs Glitch
      if (bossType === 'boss_glitch' && charId === '1024') {
          return BOSS_SCRIPTS['boss_glitch_1024'] || BOSS_SCRIPTS['boss_glitch'];
      }

      return BOSS_SCRIPTS[bossType] || BOSS_SCRIPTS['boss_kpi'];
  };

  const getEliteScript = () => {
      // Next wave is current + 1 when intro plays
      const nextWave = gameEngine.state.currentWave + 1;
      return ELITE_SCRIPTS[nextWave] || [];
  };

  return (
    <div className="w-full h-full bg-black relative overflow-hidden cursor-none">
        <canvas ref={canvasRef} className="block w-full h-full" />
        
        <div className={`absolute inset-0 bg-black z-[60] pointer-events-none transition-opacity duration-500 ${inTransition ? 'opacity-100' : 'opacity-0'}`} />

        {/* Achievement Popup - Now Self-Managing */}
        <AchievementPopup />

        {/* Display Status Panel - No Props Needed */}
        {(phase === GamePhase.PLAYING || phase === GamePhase.SANDBOX) && (
            <StatusPanel />
        )}
        
        {/* Sandbox has its own built-in UI, but sits below PauseOverlay */}
        {phase === GamePhase.SANDBOX && (
            <SandboxView onExit={goToMainMenu} />
        )}
        
        {/* Enable Pause Overlay in Sandbox as well */}
        {(phase === GamePhase.PLAYING || phase === GamePhase.SHOP || phase === GamePhase.SANDBOX) && isPausedUI && (
            <PauseOverlay 
                onMainMenu={goToMainMenu} 
                onResume={resumeGame} 
                onLinkCode={handleLinkCode} 
            />
        )}
        
        {/* --- NEW BOOT SEQUENCE --- */}
        {phase === GamePhase.BOOT && (
            <BootSequence onComplete={goToMainMenu} />
        )}

        {phase === GamePhase.WELCOME && <WelcomeView onStart={handleStart} onEncyclopedia={handleEncyclopedia} onAchievements={handleAchievements} onLeaderboard={handleLeaderboard} onContinue={handleContinue} onLinkCode={handleLinkCode} />}
        {phase === GamePhase.SETTINGS && <SettingsView onNext={handleSettingsNext} onBack={handleSettingsBack} />}
        {phase === GamePhase.DIFFICULTY_SELECT && <DifficultySelectView onSelect={handleDifficultySelect} onBack={handleBack} />}
        {phase === GamePhase.CHARACTER_SELECT && <CharacterSelectView onSelect={handleCharSelect} onBack={handleBack} />}
        
        {/* Unified Cutscenes */}
        {phase === GamePhase.STORY && (
            <CutsceneEngine script={getOpeningScript()} onFinish={finishStory} />
        )}
        {phase === GamePhase.BOSS_INTRO && (
            <CutsceneEngine script={getBossScript()} onFinish={startBossBattle} />
        )}
        {phase === GamePhase.ELITE_INTRO && (
            <CutsceneEngine script={getEliteScript()} onFinish={startEliteWave} />
        )}

        {phase === GamePhase.WAVE_SUMMARY && <WaveSummaryView onNext={handleWaveSummaryConfirm} />}
        {phase === GamePhase.SHOP && <ShopView onNextWave={handleNextWave} onLinkCode={handleLinkCode} />}
        {phase === GamePhase.VICTORY && <VictoryView onMainMenu={goToMainMenu} onEndless={startEndlessMode} />}
        {phase === GamePhase.GAME_OVER && <GameOverView onRestart={restartGame} onMainMenu={goToMainMenu} />}
        {phase === GamePhase.ENCYCLOPEDIA && <EncyclopediaView onBack={handleBack} />}
        {phase === GamePhase.ACHIEVEMENTS && <AchievementsView onBack={handleBack} />}
        {phase === GamePhase.LEADERBOARD && <LeaderboardView onBack={handleBack} />}
        {phase === GamePhase.LINK_CODE && <LinkView onBack={handleBack} onImportSuccess={handleImportSuccess} />}

        {/* Global Custom Cursor Overlay - Renders on TOP of everything */}
        <CursorOverlay phase={phase} isPaused={isPausedUI} />
    </div>
  );
}
