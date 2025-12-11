
import { Vector2D } from './shared';
import { EnemyConfig } from './config';
import { TrailConfig } from './visuals';

// 运行时实体
export interface Entity {
  id: string;
  x: number;
  y: number;
  radius: number;
  emoji: string;
}

export interface Player extends Entity {
  characterId: string; 
  hp: number;
  maxHp: number;
  hpRegen: number; 
  shield: number; 
  maxShield: number;
  speed: number;
  
  // Physics for knockback
  vx: number;
  vy: number;
  facingAngle: number; // New: Persistent movement direction

  gold: number;
  goldSpentInShop: number; // New: Track spending for Capital Synergy L4
  
  attackDamage: number;
  
  // --- ATTACK SPEED INFRASTRUCTURE ---
  attackSpeed: number; // Base Cooldown in Frames (Legacy base)
  flatAttackSpeedBonus: number; // New: Flat Attacks Per Second addition (APS)
  
  projectileSpeed: number;
  projectileCount: number;
  projectileSpread: number;
  projectilePierce: number;
  explosionRangeMultiplier: number; 
  backwardShots: number; 
  knockback: number;
  lifeSteal: number;
  dropRate: number; 
  dodgeChance: number; 
  damageReflection: number; 
  incomeMultiplier: number; 
  
  // --- CRIT & HEAT INFRASTRUCTURE ---
  critChance: number; // 0.0 to 1.0 (0% to 100%)
  critDamage: number; // Multiplier (e.g., 1.5 for 150%)
  
  heatValue: number; // Current Heat (0-100)
  maxHeat: number;   // Heat Threshold (default 100)
  isOverclocked: boolean; // State flag
  
  shopDiscount: number; 
  
  // REFACTORED: Single Shop Slot Count
  shopSlots: number; 

  lastShotTime: number;
  lastDamageTime: number; 
  lastHealTime: number; // New: For visual feedback
  isRegeneratingShield: boolean; 
  invulnerableTime: number;
  items: string[]; 
  
  insuranceGoldEarned: number; 
  pigButcheringTimer: number; 
  pigDebts: number[]; 
  
  // REFACTORED: Generic Timer Container
  // Holds all logic timers (firewall, involution, summons, etc.)
  customTimers: Record<string, number>;
  
  // Generic Variable Container (For complex mechanics like Rollback coordinates)
  customVars?: Record<string, any>;

  // New Item Timers (Can be migrated to customTimers in future phases)
  standStillTimer: number; 
  minerTimer: number; 
  memoryLeakTimer: number; 
  chatbotTimer: number; 
  droneTimer: number; 
  cloneTimer: number; 
  
  // Batch 3 Summons
  headhunterTimer: number; 
  codeMountainTimer: number; 
  
  // Summon Buffs
  summonCooldownSpeed: number; // Multiplier for summon spawn rates (Default 1.0)

  isDying: boolean; 
  deathTimer: number; 

  // 9527 Speech Logic
  speechSentenceIndex: number;
  speechCharIndex: number;
  speechPauseTimer: number;

  // Cleaner Melee Logic
  swingCount: number; 
  mopAngle: number; 

  // Achievement Tracking
  maxMultiKill: number; 
  
  // Camera Control
  justTeleported?: boolean; // If true, camera snaps to player instantly next frame

  // --- STATUS EFFECTS ---
  isCharmed?: boolean;      // If true, input disabled and forced walk
  charmSourceId?: string;   // ID of the entity that charmed (to walk towards)
  charmTimer?: number;      // Duration of charm
  charmImmunityTimer?: number; // Post-charm immunity
}

export interface Enemy extends Entity {
  active?: boolean; // POOLING
  id: string;
  config: EnemyConfig;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  
  // BOSS MECHANIC: Temporary Shield (Grey Health)
  tempShield?: number;
  maxTempShield?: number;

  attackCooldown: number;
  attackState?: number;
  stateTimer?: number; 
  phase?: number; 
  
  // For Boss Complex Logic and Enemy Skills
  subState?: 'moving_center' | 'prepping' | 'exploding' | 'normal' | 'chase' | 'charging' | 'pounce' | 'assess' | 'lock' | 'dash' | 'rest' | 'laser_grid_charge' | 'laser_grid_fire' | 'wipe_move_center' | 'wipe_warning' | 'wipe_damage' | 'wipe_mechanic_move' | 'skill_pot' | 'skill_laser' | 'skill_spiral' | 'idle' | 'transition' | 'wipe_prepare' | 'wipe_cooldown' | 'skill_lag' | 'skill_z_fighting' | 'skill_bsod' | 'skill_overflow' | 'building';

  isTransitioning?: boolean; 
  dashTimer?: number; 
  isAimingDash?: boolean; 
  aimX?: number;
  aimY?: number;
  aimAngle?: number;
  stunTimer?: number; 
  burstQueue?: string[]; 
  burstTimer?: number; 
  
  // For special behaviors
  healTargetId?: string;
  linkedId?: string; 
  linkedById?: string; 
  isThrown?: boolean; 
  
  // Micro Manager Capture Logic
  captureState?: 'free' | 'being_dragged' | 'orbiting' | 'targeted' | 'latched';
  captureTargetId?: string; 

  orbitTargetId?: string; 
  orbitAngle?: number;
  trailTimer?: number; 
  
  warningTimer?: number; 
  dashTarget?: Vector2D; 

  // Micro Manager Skill
  skillTimer?: number;
  isGathering?: boolean;
  loadedMinionId?: string | null;
  
  // Elite HR Skill
  hrStateTimer?: number;
  dashStart?: Vector2D;
  
  // Market Dept
  anxietyTimer?: number; // 焦虑状态倒计时

  // Thief Logic
  isFleeing?: boolean;
  fleeTimer?: number;
  isPovertyFlee?: boolean;

  // Pooling Helpers
  strafeDir?: number;
  
  // Leech Visual State
  isOverflowing?: boolean;

  // Leech Latch Offset
  latchOffset?: {x: number, y: number};

  // VISUALS
  hitFlashTimer?: number; // Frames to flash white
  
  // Custom Logic Variables (Generic bucket)
  customVars?: Record<string, any>;
  
  // Glitch Boss State
  isUnstable?: boolean; // For flicker effect/intangibility

  // Capital Crocodile (Devourer)
  storedValue?: number; // Total gold value of eaten enemies
  swallowCount?: number; // Number of enemies eaten
}

export interface Projectile extends Entity {
  active: boolean; // POOLING
  vx: number;
  vy: number;
  damage: number;
  life: number;
  maxLife?: number; 
  isEnemy: boolean;
  color: string;
  text: string;
  pierce: number;
  hitIds: string[];
  angle?: number; 
  sourceType?: string; 
  
  // --- CRIT INFRASTRUCTURE ---
  isCrit?: boolean; // Flag if this specific bullet is a critical hit

  // Rendering Strategy
  renderStyle?: string; 
  
  // Logic Strategy
  behaviors?: string[]; 
  
  // VFX
  trailConfig?: TrailConfig;
  trailHistory?: {x: number, y: number, z?: number}[]; // New: For smooth curves

  isExplosive?: boolean;
  explodeOnExpire?: boolean; 
  isStopped?: boolean;
  stopTimer?: number;
  isExploding?: boolean;
  maxExplosionRadius?: number;
  
  // NEW: Damage Window to separate Physics from Visuals
  damageWindow?: number; // How many frames the explosion actually deals damage

  // Tracking Stats
  killCount?: number; 

  // Special Projectile Types
  isCaptureBeacon?: boolean;
  isSweeper?: boolean; 
  swingDirection?: number; 
  targetId?: string; 
  isFake?: boolean; // New: For Glitch Boss fake bullets (visual only)
  isMimic?: boolean; // New: For Boss AI mimicking player style
  isWealthCoin?: boolean; // New: For Capital L6 Double Gold
  
  // Tech Synergy
  bounceCount?: number; // L2: Smart Bounce
  canChain?: boolean;   // L4: Chain Lightning
  
  // Market Synergy
  alwaysAnxiety?: boolean; // L6: Viral Spread (100% chance)
  
  // Smart Bounce Logic
  ignoreId?: string; // ID to temporarily ignore collisions with (for self-bounce)
  ignoreTimer?: number; // Frames to ignore collision

  // For Summons
  isTroll?: boolean; 
  isSummon?: boolean; 
  summonType?: 'intern' | 'chatbot' | 'troll' | 'troll_mini' | 'drone' | 'clone' | 'headhunter' | 'code_mountain' | 'temp_worker' | 'pacman';
  fireCooldown?: number; 
  
  // Summon Stats
  hp?: number;
  maxHp?: number;
  aiState?: 'idle' | 'chase' | 'charge' | 'return' | 'ejecting';
  isInvincible?: boolean;
  hpRegen?: number; 
  critChance?: number; 
  
  // New Props for SE06/SS05
  detectRangeOverride?: number;
  attackRangeOverride?: number;
  rangeMultiplier?: number; 
  
  // Pooling
  aiTimer?: number;
  
  // Visual Scaling (Pseudo 3D)
  scale?: number;

  // --- ISOMETRIC 3D PHYSICS ---
  z?: number;        // Height from ground
  vz?: number;       // Vertical velocity
  gravity?: number;  // Gravity affecting vz
  
  // --- COORDINATE TARGETING ---
  tx?: number; // Target X (Coordinate Lock)
  ty?: number; // Target Y (Coordinate Lock)

  // Custom Logic Variables (Generic bucket)
  customVars?: Record<string, any>;

  // --- RENDER LAYERING ---
  isAerial?: boolean; // Render over mask?
}

export interface Drop extends Entity {
  type: 'health' | 'big_health' | 'love_heart' | 'gold'; 
  value: number;
  life: number; 
  vx?: number; // For Physics
  vy?: number;
  pickupDelay?: number; // New: Frames before it can be picked up
  friction?: number;    // New: Air resistance
  isVacuuming?: boolean; // New: Forced pickup mode
  vacuumTimer?: number;  // New: Max time to fly to player before force delete
}

export interface Zone extends Entity {
  type: 'acid' | 'heal' | 'acid_trail' | 'boss_aoe' | 'explosion_shockwave' | 'scorch' | 'firewall_wave' | 'slacker_wave' | 'bsod' | 'live_stream' | 'neon_sigil' | 'pie_trap' | 'palm_print' | 'laser_beam' | 'kpi_pie' | 'deadline_wall' | 'safe_haven' | 'kpi_hell_fire' | 'warning_circle' | 'kpi_doom_expansion' | 'safe_zone_hint' | 'glitch_lag_marker' | 'glitch_bsod_wall' | 'explosion_gap' | 'glitch_square' | 'firewall_rotate' | 'ai_laser_link' | 'glitch_memory_leak' | 'coffee_puddle' | 'bug_trail';
  life: number;
  maxLife?: number; 
  color: string;
  width?: number; 
  height?: number;
  angle?: number;
  gapAngle?: number; // For explosion_gap (radians)
  damage?: number; // NEW: Damage carried by the zone
}
