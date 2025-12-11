
import { useState, useEffect, useRef, useCallback } from 'react';
import { GamePhase } from '../types';
import { gameEngine } from '../services/gameEngine';
import { GameRenderer, RENDER_SCALE } from '../services/render/canvasRenderer';
import { spawnParticles } from '../services/logic/utils';
import { updateDrops, updateZones } from '../services/logic/resourceLogic';

export const useGameCore = () => {
  // CHANGED: Initial phase is now BOOT
  const [phase, setPhase] = useState<GamePhase>(GamePhase.BOOT);
  const [selectedChar, setSelectedChar] = useState<string>('9527');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('normal');
  const [previousPhase, setPreviousPhase] = useState<GamePhase>(GamePhase.WELCOME);
  
  // Transition State
  const [inTransition, setInTransition] = useState(false);
  const [isPausedUI, setIsPausedUI] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const keysRef = useRef<Record<string, boolean>>({});
  const mouseRef = useRef<{x: number, y: number}>({x: 0, y: 0});

  // FPS Calculation Refs
  const lastTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);

  const switchPhase = useCallback((newPhase: GamePhase) => {
      setInTransition(true);
      setTimeout(() => {
          setPhase(newPhase);
          setInTransition(false);
      }, 500);
  }, []);

  // --- Fullscreen Lock Listener (Global) ---
  useEffect(() => {
      const handleFsChange = () => {
          // LAYER 2: Passive Lock - Whenever we enter fullscreen (via button or F11), try to lock ESC
          if (document.fullscreenElement) {
              gameEngine.enforceFullscreenLock();
          }
      };

      document.addEventListener('fullscreenchange', handleFsChange);
      // Check initial state
      handleFsChange();

      return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // --- Focus Guard (Global Clicks) ---
  useEffect(() => {
      const handleGlobalClick = () => {
          if (document.fullscreenElement) {
              // NODE 2: Lock on interaction (Focus Guard)
              gameEngine.enforceFullscreenLock();
          }
      };
      window.addEventListener('mousedown', handleGlobalClick);
      return () => window.removeEventListener('mousedown', handleGlobalClick);
  }, []);

  // --- Input Event Listeners ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { 
        // LAYER 3: Rescue Lock (Key) - If user is typing but lock was lost, re-engage it
        if (document.fullscreenElement) gameEngine.enforceFullscreenLock();
        
        keysRef.current[e.key.toLowerCase()] = true;
        // Enable Pause in Playing, Shop AND Sandbox
        // Added 'P' key as alternative pause for browsers that don't support Keyboard Lock for ESC
        if ((e.key === 'Escape' || e.key.toLowerCase() === 'p') && (phase === GamePhase.PLAYING || phase === GamePhase.SHOP || phase === GamePhase.SANDBOX)) {
            // Prevent default behavior (Exit Fullscreen) if the lock happened to slip or not be supported perfectly
            e.preventDefault();
            
            gameEngine.state.isPaused = !gameEngine.state.isPaused;
            setIsPausedUI(gameEngine.state.isPaused);
        }
    };
    const handleKeyUp = (e: KeyboardEvent) => { keysRef.current[e.key.toLowerCase()] = false; };
    const handleMouseMove = (e: MouseEvent) => { 
        if(!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;
        
        const width = canvasRef.current.width;
        const height = canvasRef.current.height;
        
        const centeredX = screenX - width / 2;
        const centeredY = screenY - height / 2;
        
        const unscaledX = centeredX / RENDER_SCALE;
        const unscaledY = centeredY / RENDER_SCALE;
        
        const finalX = unscaledX + gameEngine.state.camera.x;
        const finalY = unscaledY + gameEngine.state.camera.y;

        mouseRef.current = { x: finalX, y: finalY };
    };
    const handleMouseDown = () => { 
        keysRef.current['mousedown'] = true; 
    };
    const handleMouseUp = () => { keysRef.current['mousedown'] = false; };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [phase]);

  // --- Resize Handler ---
  useEffect(() => {
      const handleResize = () => {
          if(canvasRef.current) {
              canvasRef.current.width = window.innerWidth;
              canvasRef.current.height = window.innerHeight;
              gameEngine.canvasWidth = window.innerWidth;
              gameEngine.canvasHeight = window.innerHeight;
          }
      };
      window.addEventListener('resize', handleResize);
      handleResize();
      return () => window.removeEventListener('resize', handleResize);
  }, [phase]);

  // --- Game Loop ---
  const gameLoop = useCallback(() => {
    // Run update loop in PLAYING and SANDBOX phases
    if (phase !== GamePhase.PLAYING && phase !== GamePhase.SANDBOX) return;

    // --- FPS CALCULATION ---
    const now = performance.now();
    if (lastTimeRef.current === 0) lastTimeRef.current = now;
    frameCountRef.current++;
    
    if (now - lastTimeRef.current >= 1000) {
        gameEngine.state.fps = frameCountRef.current;
        frameCountRef.current = 0;
        lastTimeRef.current = now;
    }
    // -----------------------

    gameEngine.handleInput(keysRef.current, mouseRef.current);
    gameEngine.update();

    // Achievement Popup Logic is now handled by AchievementPopup component via polling

    if (gameEngine.state.waveEnded && phase === GamePhase.PLAYING) { // Don't auto-end wave in sandbox
        if (!gameEngine.state.isEndless && gameEngine.state.currentWave >= 8) {
             // Wave 8 is the boss wave. If waveEnded is true, boss is dead.
             if (gameEngine.state.enemies.length === 0) {
                 switchPhase(GamePhase.VICTORY);
             }
        } 
        else if (gameEngine.state.isEndless && gameEngine.state.enemies.length === 0 && gameEngine.state.waveTimer > 60) {
             switchPhase(GamePhase.WAVE_SUMMARY);
        }
        else if (gameEngine.state.currentWave < 8) {
            switchPhase(GamePhase.WAVE_SUMMARY);
        }
        return;
    }

    if (gameEngine.state.player.isDying) {
        if (gameEngine.state.player.deathTimer <= 0) {
            switchPhase(GamePhase.GAME_OVER);
            return;
        }
    } 

    if (canvasRef.current) {
        GameRenderer.render(canvasRef.current, gameEngine.state, mouseRef.current);
    }
    
    requestRef.current = requestAnimationFrame(gameLoop);
  }, [phase, switchPhase]);

  useEffect(() => {
    if (phase === GamePhase.PLAYING || phase === GamePhase.SANDBOX) {
        if (canvasRef.current) {
            requestRef.current = requestAnimationFrame(gameLoop);
        }
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [phase, gameLoop]);

  // --- Handlers ---
  const handleStart = () => {
      if (localStorage.getItem('meme_game_played_before')) {
          switchPhase(GamePhase.DIFFICULTY_SELECT);
      } else {
          localStorage.setItem('meme_game_played_before', 'true');
          switchPhase(GamePhase.SETTINGS);
      }
  };

  const handleEncyclopedia = () => switchPhase(GamePhase.ENCYCLOPEDIA);
  const handleAchievements = () => switchPhase(GamePhase.ACHIEVEMENTS);
  const handleLeaderboard = () => switchPhase(GamePhase.LEADERBOARD);
  
  const handleContinue = () => {
      if (gameEngine.loadGame()) {
          switchPhase(GamePhase.SHOP);
      }
  };
  
  const handleSettingsBack = () => switchPhase(GamePhase.WELCOME);
  const handleSettingsNext = () => switchPhase(GamePhase.DIFFICULTY_SELECT);

  const handleBack = () => {
      if (phase === GamePhase.DIFFICULTY_SELECT) switchPhase(GamePhase.WELCOME);
      if (phase === GamePhase.CHARACTER_SELECT) switchPhase(GamePhase.DIFFICULTY_SELECT);
      if (phase === GamePhase.ENCYCLOPEDIA || phase === GamePhase.ACHIEVEMENTS || phase === GamePhase.LEADERBOARD) switchPhase(GamePhase.WELCOME);
      if (phase === GamePhase.LINK_CODE) switchPhase(previousPhase);
  };

  const handleDifficultySelect = (diffId: string) => {
      setSelectedDifficulty(diffId);
      switchPhase(GamePhase.CHARACTER_SELECT);
  };

  const handleCharSelect = (charId: string) => {
      setSelectedChar(charId);
      switchPhase(GamePhase.STORY);
  };
  
  const finishStory = () => {
      if(canvasRef.current) {
          gameEngine.init(canvasRef.current.width, canvasRef.current.height, selectedChar, selectedDifficulty);
      }
      switchPhase(GamePhase.PLAYING);
  };

  const handleNextWave = () => {
      const nextWave = gameEngine.state.currentWave + 1;
      
      if (nextWave === 8 && !gameEngine.state.isEndless) {
          switchPhase(GamePhase.BOSS_INTRO);
      } 
      else if (!gameEngine.state.isEndless && 
               (gameEngine.state.difficultyId === 'hard' || gameEngine.state.difficultyId === 'ultimate') && 
               (nextWave === 4 || nextWave === 6)) {
          switchPhase(GamePhase.ELITE_INTRO);
      }
      else {
          setInTransition(true);
          setTimeout(() => {
              gameEngine.startWave(nextWave);
              setPhase(GamePhase.PLAYING);
              setInTransition(false);
          }, 500);
      }
  };

  const startEliteWave = () => {
      const nextWave = gameEngine.state.currentWave + 1;
      gameEngine.startWave(nextWave);
      switchPhase(GamePhase.PLAYING);
  }

  const handleWaveSummaryConfirm = () => {
      switchPhase(GamePhase.SHOP);
  };
  
  const startEndlessMode = () => {
      gameEngine.state.isEndless = true;
      gameEngine.startWave(1); 
      switchPhase(GamePhase.PLAYING);
  };

  const startBossBattle = () => {
      gameEngine.startWave(8);
      switchPhase(GamePhase.PLAYING);
  };

  const restartGame = () => {
      if(canvasRef.current) {
          gameEngine.init(canvasRef.current.width, canvasRef.current.height, selectedChar, selectedDifficulty);
      }
      switchPhase(GamePhase.PLAYING);
  };

  const goToMainMenu = () => {
      gameEngine.state.isPaused = false;
      setIsPausedUI(false);
      switchPhase(GamePhase.WELCOME);
  };

  const resumeGame = () => {
      gameEngine.state.isPaused = false;
      setIsPausedUI(false);
  };

  const handleLinkCode = () => {
      setPreviousPhase(phase);
      switchPhase(GamePhase.LINK_CODE);
  };

  const handleImportSuccess = (message: string) => {
      // Sandbox Special Entrance
      if (message === "沙盒模式启动") {
          gameEngine.enterSandboxMode();
          switchPhase(GamePhase.SANDBOX);
          return;
      }

      if (message.includes("测试局") || message.includes("对局已恢复")) {
           if (message.includes("持续刷新")) {
               switchPhase(GamePhase.PLAYING);
           } else {
               switchPhase(GamePhase.SHOP); 
           }
      } 
      else if (message.includes("前夕")) {
           switchPhase(GamePhase.WAVE_SUMMARY);
      }
      else {
           switchPhase(GamePhase.WELCOME);
      }
  };

  return {
    canvasRef,
    phase,
    selectedChar,
    selectedDifficulty,
    inTransition,
    isPausedUI,
    // Handlers
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
    handleImportSuccess
  };
};
