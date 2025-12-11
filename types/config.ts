
import { GameState, IGameEngine, GlobalStats } from './core';
import { Player, Enemy, Projectile } from './entities';

// --- New Hook Interfaces ---
export interface ItemHooks {
    // Triggered when an enemy is killed
    onKill?: (engine: IGameEngine, enemy: Enemy, count: number) => void;
    // Triggered on every game tick (frame)
    onTick?: (engine: IGameEngine, count: number) => void;
    // Triggered when hitting an enemy (reserved)
    onHit?: (engine: IGameEngine, target: Enemy, damage: number, count: number) => void;
    // Triggered when taking damage (reserved)
    onDamageTaken?: (engine: IGameEngine, amount: number, count: number) => number;
}

// Game Configuration Data
export interface UpgradeOption {
  id: string;
  title: string;
  description: string;
  rarity: 'common' | 'excellent' | 'rare' | 'epic' | 'mythic' | 'consumable'; // Added consumable
  category: 'upgrade' | 'item'; 
  price: number;
  originalPrice?: number; 
  icon: string;
  effect: (state: GameState) => void;
  maxCount?: number; 
  
  // Custom text for limited purchase (e.g. "HR Warning: Headcount Full")
  limitReason?: string;

  // New: Dynamic Description based on owned count
  getDynamicDescription?: (count: number) => string;

  // Encyclopedia Flavor Text (吐槽)
  quote?: string;

  minWave?: number; 
  
  items?: string[];
  
  // Tag System for flexible filtering
  tags?: string[]; // e.g., 'slacker', 'hardcore', 'capital', 'tech'
  
  // NEW: Functional Stat Tags (e.g., "Attack+", "HP+")
  statTags?: string[]; 

  // Logic Hooks (Behavior Capsule)
  hooks?: ItemHooks;

  locked?: boolean;
  purchased?: boolean;
  uuid?: string; 
  
  // Prerequisites: Must own any item in this list
  prerequisites?: string[];

  // Legacy Hooks (Deprecated in favor of hooks object, kept for compatibility)
  onWaveStart?: (engine: IGameEngine, count: number) => void;
  onTick?: (engine: IGameEngine, count: number) => void;
}

export interface SynergyConfig {
    id: string;
    name: string;
    description: string;
    color: string;
    icon: string;
    levels: {
        count: number;
        effectDesc: string;
    }[];
}

export interface EnemyConfig {
  type: string;
  name?: string; // New: Explicit display name
  emoji: string;
  hp: number;
  speed: number;
  damage: number;
  score: number;
  description: string; 
  behavior: 'chase' | 'shooter' | 'rusher' | 'boss' | 'circle' | 'turret' | 'tank' | 'minion' | 'bonus' | 'support' | 'spawner' | 'linker' | 'summoner_orbit' | 'devourer' | 'balloon' | 'thief'; 
  tier?: 'common' | 'rare' | 'epic' | 'boss'; 
  projectileChar?: string;
  projectileOptions?: string[]; 
  projectileRenderStyle?: string; // NEW: Custom render style for projectiles
  burstPhrases?: string[]; 
  attackPattern?: 'single' | 'spread' | 'spiral' | 'circle' | 'explode' | 'burst'; 
  sizeScale?: number; 
  projectileSize?: number;
  projectileColor?: string;
  deathQuotes?: string[]; 
}

export interface CharacterConfig {
  id: string;
  name: string;
  title: string;
  description: string;
  emojiNormal: string;
  emojiHurt: string;
  emojiCritical: string;
  baseStats: Partial<Player>;
  
  // Tag Filtering
  bannedTags?: string[]; // Tags this character CANNOT find in shop
  exclusiveTags?: string[]; // Tags ONLY this character can find (optional)
}

export interface DifficultyConfig {
  id: string;
  name: string;
  description: string;
  hpMult: number;
  damageMult: number;
  scoreMult: number;
  emoji: string;
}

export interface WaveConfig {
  waveNumber: number;
  duration: number; 
  enemies: { type: string, weight: number }[];
  spawnRate: number;
  isBossWave?: boolean;
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    // Updated condition signature to include GlobalStats
    condition: (state: GameState, stats: GlobalStats) => boolean;
    unlocked: boolean;
    // New: Permanent stat reward for unlocking
    reward?: Partial<Player>;
    rewardDescription?: string;
}

export interface LeaderboardEntry {
    name: string;
    score: number;
    title: string;
    avatar: string;
    isPlayer?: boolean;
}

export interface HazardConfig {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    quote?: string; // Added flavor text
}
