
import { GameState, Vector2D, IGameEngine, GameSettings, GlobalStats } from "../types";
import { SoundManager } from "./audio/SoundManager";
import { spawnFloatingText, spawnParticles, PoolUtils } from "./logic/utils";
import { updateDrops, updateZones } from "./logic/resourceLogic";
import { getInitialState, saveGame, loadGame, saveAchievements, loadAchievements, unlockEntry, unlockAchievement, checkAchievements } from "./logic/upgradeLogic";
import { spawnEnemy, updateEnemies, updateProjectiles, checkCollisions } from "./logic/battleLogic";
import { PlayerSystem } from "./logic/systems/PlayerSystem";
import { DirectorSystem } from "./logic/systems/DirectorSystem";
import { VFXSystem } from "./logic/systems/VFXSystem";
import { GameEventType } from "./logic/events/events";
import { MapSystem } from "./logic/systems/MapSystem";
import { ReviveSystem } from "./logic/systems/ReviveSystem";
import { SynergyLogic } from "./logic/synergyLogic";
import { RENDER_SCALE } from "./render/renderConfig";
import { BossAi } from "./logic/battle/bossAi";

// --- Deep Merge Utility for Save Compatibility ---
function isObject(item: any) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

function deepMerge(target: any, source: any) {
  if (!source) return target;
  
  const output = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

const DEFAULT_GLOBAL_STATS: GlobalStats = {
    totalGamesPlayed: 0,
    totalKills: 0,
    totalGoldEarned: 0,
    totalTimePlayed: 0,
    totalDeaths: 0,
    highestWave: 0
};

export class GamePhysics implements IGameEngine {
  state: GameState;
  settings: GameSettings;
  globalStats: GlobalStats; // New: Global Stats
  canvasWidth: number = 800;
  canvasHeight: number = 600;
  keysPressed: Record<string, boolean> = {};
  mousePos: Vector2D = { x: 0, y: 0 };
  
  // Joystick Input State
  joystickInput = {
      move: { x: 0, y: 0 },
      aim: { x: 0, y: 0 },
      isFiring: false
  };

  audio: SoundManager;
  
  unlockedCompendium: Set<string> = new Set();
  totalPlayTime: number = 0; 
  
  // Use MapSystem constants
  readonly MAP_WIDTH = MapSystem.DEFAULT_WIDTH;
  readonly MAP_HEIGHT = MapSystem.DEFAULT_HEIGHT;

  // Throttling for keyboard lock to prevent browser spam
  private lastLockTime = 0;
  
  constructor() {
    this.settings = {
        autoShoot: true,
        autoAim: false,
        soundEnabled: true,
        volume: 0.5,
        shopSkin: 'default', // Default to original look
        screenShake: true // Default enabled
    };
    this.globalStats = { ...DEFAULT_GLOBAL_STATS }; // Init with defaults
    this.state = getInitialState('9527', 'normal');
    
    // Init Pools if missing (safety)
    if (!this.state.projectilePool) this.state.projectilePool = [];
    if (!this.state.enemyPool) this.state.enemyPool = [];
    if (!this.state.particlePool) this.state.particlePool = [];
    if (!this.state.floatingTextPool) this.state.floatingTextPool = [];
    
    this.audio = new SoundManager();
    this.loadEncyclopedia();
    
    // Ensure 'cleaner' is always unlocked (Scrapped Character Easter Egg)
    if (!this.unlockedCompendium.has('cleaner')) {
        this.unlockedCompendium.add('cleaner');
        // Don't save here to avoid unnecessary writes, wait for game loop or manual save
    }

    this.loadAchievements();
  }

  loadEncyclopedia() {
      try {
          const data = localStorage.getItem('meme_game_encyclopedia');
          if (data) {
              this.unlockedCompendium = new Set(JSON.parse(data));
          }
      } catch (e) {
          console.error("Failed to load encyclopedia", e);
      }
  }

  loadAchievements() {
      loadAchievements(this);
  }

  saveEncyclopedia() {
      try {
          localStorage.setItem('meme_game_encyclopedia', JSON.stringify(Array.from(this.unlockedCompendium)));
      } catch (e) {
          console.error("Failed to save encyclopedia", e);
      }
  }

  saveAchievements() {
      saveAchievements(this);
  }

  unlockEntry(id: string) {
      unlockEntry(this, id);
  }
  
  unlockAchievement(id: string) {
      unlockAchievement(this, id);
  }

  checkAchievements() {
      checkAchievements(this);
  }

  hasSave(): boolean {
      return !!localStorage.getItem('meme_game_save');
  }

  saveGame() {
      saveGame(this);
  }

  loadGame(): boolean {
      const success = loadGame(this);
      if (success) {
          this.audio.resume();
          // Ensure derived stats are fresh after load
          SynergyLogic.refreshDerivedStats(this.state);
      }
      return success;
  }

  updateSettings(newSettings: Partial<GameSettings>) {
      this.settings = { ...this.settings, ...newSettings };
      this.audio.setMute(!this.settings.soundEnabled);
      if (newSettings.volume !== undefined) {
          this.audio.setVolume(newSettings.volume);
      }
  }

  // Hard Reset: Clears all local storage data
  hardReset() {
      try {
          localStorage.clear();
          window.location.reload();
      } catch (e) {
          console.error("Hard reset failed", e);
      }
  }

  resetCurrentRun() {
      this.state = this.getInitialState('9527', 'normal');
      this.loadAchievements();
      SynergyLogic.refreshDerivedStats(this.state);
  }

  getInitialState(charId: string, difficultyId: string): GameState {
      return getInitialState(charId, difficultyId);
  }

  init(width: number, height: number, charId: string = '9527', difficultyId: string = 'normal') {
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.state = this.getInitialState(charId, difficultyId);
    
    // Update Global Play Count
    this.globalStats.totalGamesPlayed++;
    this.saveAchievements();

    // Initial Stats Calc
    SynergyLogic.refreshDerivedStats(this.state);

    this.startWave(1);
    this.audio.resume();
    this.audio.setMute(!this.settings.soundEnabled); 
    this.audio.setVolume(this.settings.volume);
    
    // Init Pacman Global State
    this.state.isPacmanPowered = false;
  }

  startWave(waveNum: number) {
      DirectorSystem.startWave(this, waveNum);
  }

  handleInput(keys: Record<string, boolean>, mouse: Vector2D) {
    this.keysPressed = keys;
    this.mousePos = mouse;
  }

  // --- Event Bus Interface ---
  emit(type: GameEventType, data: any = {}) {
      VFXSystem.handleEvent(this, type, data);
  }

  enterSandboxMode() {
      const charId = this.state.player.characterId;
      this.state = this.getInitialState(charId, 'normal');
      this.state.currentWave = 0; 
      this.state.isCustomDebugMode = true;
      this.state.isDebugFrozen = false;
      this.state.waveTimer = 0; 
      this.state.waveEnded = false;
      this.state.isPacmanPowered = false;
      
      // Init Stats
      SynergyLogic.refreshDerivedStats(this.state);

      this.audio.resume();
      this.audio.playBattleBGM(); 
  }

  // --- FULLSCREEN & KEYBOARD LOCK ---
  public async enforceFullscreenLock() {
      // 1. Check if we are actually in fullscreen. If not, locking is invalid.
      if (!document.fullscreenElement) return;

      // 2. Throttle requests to avoid browser console spam/rejection
      const now = Date.now();
      if (now - this.lastLockTime < 500) return;
      this.lastLockTime = now;

      // 3. Attempt Lock
      try {
          // @ts-ignore: Experimental API
          if (navigator.keyboard && navigator.keyboard.lock) {
              // @ts-ignore
              await navigator.keyboard.lock(['Escape']);
          }
      } catch (e) {
          // Silent fail or debug log
          // console.warn("Keyboard Lock failed (User might need to interact first):", e);
      }
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => {
            // LAYER 1: Active Lock immediately after promise resolves
            window.focus(); // Force focus to window to ensure lock receives target
            this.enforceFullscreenLock();
        }).catch(err => {
            console.error(`Error attempting to enable full-screen mode: ${err.message}`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
  }

  update() {
    if (this.state.isPaused) return;
    
    // --- REVIVE SEQUENCE INTERCEPTION ---
    if (ReviveSystem.update(this)) {
        return; // Pause game world while reviving
    }

    // --- CINEMATIC PAUSE (Time Freeze / Hit Stop) ---
    // Only update the Boss AI, freeze everything else
    if (this.state.cinematicPause) {
        // Find Boss(es) and update them manually so they can play their transition animation
        this.state.enemies.forEach(e => {
            if (e.config.behavior === 'boss') {
                // Manually call boss update. We pass a dummy shoot function as firing is disabled during freeze
                BossAi.updateBossBehavior(this, e, this.state.player, () => {});
            }
        });
        
        // Shake camera if requested (usually BossAI sets random offsets directly, 
        // but we ensure camera follows player + any offsets set by boss)
        this.updateCamera();
        
        // Skip all other updates
        return; 
    }

    if (!this.state.isCustomDebugMode && this.state.waveEnded) return;
    
    PlayerSystem.update(this);
    
    // Update Kill Streak Timer
    if (this.state.killStreakTimer > 0) {
        this.state.killStreakTimer--;
        if (this.state.killStreakTimer <= 0) {
            this.state.killStreak = 0; // Reset streak
        }
    }

    if (this.state.player.isDying) {
        this.state.player.deathTimer--;
        // Save Global Stats on actual death completion to ensure safety
        if (this.state.player.deathTimer === 1) {
             this.saveAchievements(); // Saves accumulated stats
        }
        return;
    }

    if (this.state.isWaveClearing) {
        this.state.waveTransitionTimer--;
        if (this.state.waveTransitionTimer <= 0) {
            this.state.waveEnded = true;
        }
        spawnParticles(this, this.state.player.x, this.state.player.y, '#ffffff', 0); 
        this.updateParticles();
        updateDrops(this);
        updateZones(this);
        this.updateCamera();
        return; 
    }

    this.state.timeAlive++;
    this.totalPlayTime++; 
    this.state.waveTimer++;

    if (this.state.score > this.state.highScore) {
        this.state.highScore = this.state.score;
    }
    
    if (this.state.timeAlive % 60 === 0) {
        this.checkAchievements();
    }
    
    // Auto-save progress periodically
    if (this.state.timeAlive % 3600 === 0) {
        this.saveAchievements();
    }

    DirectorSystem.update(this);
    
    updateEnemies(this);
    updateProjectiles(this);
    this.updateParticles();
    updateDrops(this);
    updateZones(this);
    checkCollisions(this);
    
    this.updateCamera();
  }

  private updateCamera() {
    let targetX = this.state.player.x;
    let targetY = this.state.player.y;
    
    const boss = this.state.enemies.find(e => e.isTransitioning);
    if (boss) {
        // Always shake for boss transitions regardless of setting? 
        // No, respect setting for comfort.
        if (this.settings.screenShake) {
            targetX += (Math.random() - 0.5) * 20;
            targetY += (Math.random() - 0.5) * 20;
        }
    }

    // TELEPORT LOGIC (Bug Glitch Fix)
    // If player was just teleported (e.g. Backtrace), snap camera immediately
    // to avoid "flying" sensation across map.
    if (this.state.player.justTeleported) {
        this.state.camera.x = targetX;
        this.state.camera.y = targetY;
        this.state.player.justTeleported = false; // Reset flag
    } else {
        // Normal smooth follow
        this.state.camera.x += (targetX - this.state.camera.x) * 0.1;
        this.state.camera.y += (targetY - this.state.camera.y) * 0.1;
    }
  }

  public spawnEnemy(type: string, x: number, y: number) {
      spawnEnemy(this, type, x, y);
  }

  spawnFloatingText(x: number, y: number, text: string, color: string = '#ffffff', type: 'damage' | 'chat' | 'gold' = 'damage') {
      spawnFloatingText(this, x, y, text, color, type);
  }

  private updateParticles() {
    // Swap-Pop optimization for Particles
    const particles = this.state.particles;
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      
      if (p.angularVelocity) {
          p.rotation = (p.rotation || 0) + p.angularVelocity;
      }
      if (p.scaleDelta) {
          p.scale = Math.max(0, (p.scale || 1) + p.scaleDelta);
      }
      if (p.alphaDelta !== undefined && p.alpha !== undefined) {
          p.alpha = Math.max(0, Math.min(1, p.alpha + p.alphaDelta));
      }

      p.life--;
      if (p.life <= 0) {
        PoolUtils.releaseParticle(this, p);
        const lastIdx = particles.length - 1;
        if (i !== lastIdx) {
            particles[i] = particles[lastIdx];
        }
        particles.pop();
      }
    }

    // Swap-Pop optimization for Floating Texts
    const texts = this.state.floatingTexts;
    for (let i = texts.length - 1; i >= 0; i--) {
        const ft = texts[i];
        ft.y += ft.vy;
        
        // Friction for pop animation
        ft.vy *= 0.9;
        
        // Scale decay
        if (ft.scale && ft.scale > 1) {
            ft.scale = Math.max(1, ft.scale - 0.1);
        }

        ft.life--;
        if (ft.life <= 0) {
            PoolUtils.releaseFloatingText(this, ft);
            const lastIdx = texts.length - 1;
            if (i !== lastIdx) {
                texts[i] = texts[lastIdx];
            }
            texts.pop();
        }
    }
  }
}

export const gameEngine = new GamePhysics();
