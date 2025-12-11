
import type { SoundManager } from '../services/audio/SoundManager';
import { GameEventType } from '../services/logic/events/events';
import { Vector2D } from './shared';
import { UpgradeOption } from './config';
import { Player, Enemy, Projectile, Drop, Zone } from './entities';
import { FloatingText, Particle } from './visuals';

export enum GamePhase {
  BOOT = 'BOOT', // New Boot Phase
  WELCOME = 'WELCOME',
  SETTINGS = 'SETTINGS',
  ENCYCLOPEDIA = 'ENCYCLOPEDIA',
  ACHIEVEMENTS = 'ACHIEVEMENTS',
  LEADERBOARD = 'LEADERBOARD',
  DIFFICULTY_SELECT = 'DIFFICULTY_SELECT',
  CHARACTER_SELECT = 'CHARACTER_SELECT',
  STORY = 'STORY', 
  PLAYING = 'PLAYING',
  WAVE_SUMMARY = 'WAVE_SUMMARY',
  SHOP = 'SHOP',
  BOSS_INTRO = 'BOSS_INTRO',
  ELITE_INTRO = 'ELITE_INTRO',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY',
  LINK_CODE = 'LINK_CODE',
  SANDBOX = 'SANDBOX',
}

export interface GameSettings {
  autoShoot: boolean;
  autoAim: boolean;
  soundEnabled: boolean;
  volume: number;
  shopSkin: 'default' | 'retro'; 
  screenShake: boolean;
}

export interface GlobalStats {
    totalGamesPlayed: number;
    totalKills: number;
    totalGoldEarned: number;
    totalTimePlayed: number; // in ticks (60 per sec)
    totalDeaths: number;
    highestWave: number;
}

export interface WaveStats {
    enemiesKilled: number;
    damageDealt: number;
    goldEarned: number;
    damageMitigated: number;
    bonusGold: number;
}

export interface ReviveSequenceState {
    active: boolean;
    timer: number;
    phase: 'start' | 'coin_enter' | 'shatter' | 'cleanup';
    lostGold: number;
}

export interface DerivedStats {
    synergies: Record<string, number>; // Raw counts
    activeTiers: Record<string, number>; // Active levels
}

export interface GameState {
  player: Player;
  enemies: Enemy[];
  enemyPool: Enemy[]; // POOLING
  projectiles: Projectile[];
  projectilePool: Projectile[]; // POOLING
  floatingTexts: FloatingText[];
  floatingTextPool: FloatingText[]; // POOLING
  particles: Particle[];
  particlePool: Particle[]; // POOLING
  drops: Drop[];
  zones: Zone[]; 
  camera: Vector2D; 
  score: number;
  highScore: number;
  timeAlive: number;
  fps: number; // New: FPS tracking
  
  mapWidth: number;
  mapHeight: number;
  currentWave: number;
  waveTimer: number;
  waveEnded: boolean;
  isWaveClearing: boolean; 
  waveTransitionTimer: number; 
  
  // Kill Streak Feature
  killStreak: number;
  killStreakTimer: number; // Frames until reset

  // Special Wave Logic
  isOvertime: boolean; // For elite waves

  // Custom Debug Logic
  isCustomDebugMode?: boolean; 
  debugEnemyTypes?: string[]; 
  isDebugFrozen?: boolean; // New: AI Freeze

  waveStats: WaveStats; // Current wave statistics

  restockCost: number;
  refreshCount: number;
  killer?: string; 

  difficultyId: string;
  isEndless: boolean;
  endlessWaveCount: number;
  inflationRate: number; 
  
  // NEW: Active Endless Mutators
  activeMutators: string[];

  // NEW: Track Unique Spawns (e.g. Elite HR)
  uniqueSpawns: string[];

  isPaused: boolean;
  // NEW: Cinematic Pause (Time Freeze for Dramatic Effect)
  cinematicPause?: boolean;
  
  // NEW: Pacman Global State
  isPacmanPowered?: boolean;

  modalMessage?: { title: string; text: string; type: 'win' | 'info' | 'error' } | null;
  
  // REFACTORED: Queue system for achievements to support multi-unlock and shop persistence
  achievementNotificationQueue: { title: string; description: string; icon: string }[];
  
  // Deprecated single popup, keep for type safety if legacy code references it (though we remove usage)
  achievementPopup?: { title: string; description: string; icon: string; timer: number } | null;

  // REFACTORED: Merged Shop State
  shopState: {
    stock: UpgradeOption[]; // Single unified list
    upgrades?: UpgradeOption[]; // Deprecated (kept briefly if needed for transition logic, but preferably remove)
    items?: UpgradeOption[]; // Deprecated
  };

  // NEW: Per-wave Shop State Tracking
  hasRefreshedThisWave: boolean;
  hasPurchasedThisWave: boolean;

  achievements: string[]; // List of unlocked achievement IDs

  // NEW: Revive Sequence State (Modal Animation)
  reviveSequence: ReviveSequenceState;

  // NEW: Cached Stats for Performance
  derivedStats: DerivedStats;
}

export interface IGameEngine {
  state: GameState;
  settings: GameSettings;
  globalStats: GlobalStats; // New: Persistent global stats
  canvasWidth: number;
  canvasHeight: number;
  keysPressed: Record<string, boolean>;
  mousePos: Vector2D;
  
  // New Input System for Mobile
  joystickInput: {
      move: Vector2D; // x, y from -1 to 1
      aim: Vector2D;  // x, y from -1 to 1
      isFiring: boolean;
  };

  audio: SoundManager;
  unlockedCompendium: Set<string>;
  totalPlayTime: number;
  MAP_WIDTH: number;
  MAP_HEIGHT: number;

  loadEncyclopedia(): void;
  loadAchievements(): void;
  saveEncyclopedia(): void;
  saveAchievements(): void;
  unlockEntry(id: string): void;
  unlockAchievement(id: string): void;
  checkAchievements(): void;
  hasSave(): boolean;
  saveGame(): void;
  loadGame(): boolean;
  updateSettings(newSettings: Partial<GameSettings>): void;
  getInitialState(charId: string, difficultyId: string): GameState;
  init(width: number, height: number, charId?: string, difficultyId?: string): void;
  startWave(waveNum: number): void;
  handleInput(keys: Record<string, boolean>, mouse: Vector2D): void;
  emit(type: GameEventType, data?: any): void;
  enterSandboxMode(): void;
  update(): void;
  spawnEnemy(type: string, x: number, y: number): void;
  spawnFloatingText(x: number, y: number, text: string, color?: string, type?: 'damage' | 'chat' | 'gold'): void;
  hardReset(): void; // Added hardReset method
  resetCurrentRun(): void; // Added resetCurrentRun method
}
