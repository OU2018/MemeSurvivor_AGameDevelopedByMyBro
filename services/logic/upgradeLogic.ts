
import { GameState, Player, IGameEngine, GlobalStats } from "../../types";
import { CHARACTERS } from "../../data/events";
import { ACHIEVEMENTS } from "../../data/achievements";
import { SynergyLogic } from "./synergyLogic";

// --- Helper: Apply Permanent Stat Bonuses from Achievements ---
function applyAchievementBonuses(player: Player, unlockedIds: string[]) {
    ACHIEVEMENTS.forEach(ach => {
        if (unlockedIds.includes(ach.id) && ach.reward) {
            // Apply each reward field
            Object.entries(ach.reward).forEach(([key, value]) => {
                const k = key as keyof Player;
                const v = value as number;
                
                // Additive for numbers
                if (typeof player[k] === 'number' && typeof v === 'number') {
                    // MIGRATION: Map old slots to new slot
                    if (key === 'shopUpgradeSlots' || key === 'shopItemSlots') {
                        player.shopSlots += v;
                    } else {
                        (player[k] as number) += v;
                    }
                }
            });
        }
    });

    // Clamp values if necessary
    if (player.shopDiscount < 0.1) player.shopDiscount = 0.1;
    if (player.attackSpeed < 2) player.attackSpeed = 2;
    
    // Ensure current HP matches new maxHP if initialized fresh
    if (player.hp < player.maxHp && player.hp > 0) { 
        if (player.gold === 0 && player.items.length === 0) {
            player.hp = player.maxHp;
        }
    }
}

export function getInitialState(charId: string, difficultyId: string): GameState {
    const charConfig = CHARACTERS[charId] || CHARACTERS['9527'];
    const MAP_WIDTH = 2500;
    const MAP_HEIGHT = 2000;

    return {
      player: {
        id: 'player',
        characterId: charId,
        x: 0, y: 0, 
        radius: 24,
        emoji: charConfig.emojiNormal,
        hp: charConfig.baseStats.maxHp || 100, 
        maxHp: charConfig.baseStats.maxHp || 100,
        hpRegen: 0, 
        shield: 0, maxShield: 0,
        speed: charConfig.baseStats.speed || 6,
        
        vx: 0, vy: 0,
        facingAngle: 0, // Default facing right

        gold: 0,
        goldSpentInShop: 0, // NEW: Init spending tracker
        attackDamage: charConfig.baseStats.attackDamage || 15,
        attackSpeed: charConfig.baseStats.attackSpeed || 25,
        flatAttackSpeedBonus: charConfig.baseStats.flatAttackSpeedBonus || 0, // NEW: Init
        
        projectileSpeed: 9.0, // Increased from 7.5
        projectileCount: charConfig.baseStats.projectileCount || 1,
        projectileSpread: 0.2,
        projectilePierce: charConfig.baseStats.projectilePierce || 0,
        explosionRangeMultiplier: 1.0, 
        backwardShots: 0,
        knockback: 0.5, // NERFED: Reduced from 8 to 0.5 for harder gameplay
        lifeSteal: 0,
        dropRate: 0.02,
        dodgeChance: 0,
        damageReflection: 0,
        incomeMultiplier: charConfig.baseStats.incomeMultiplier || 1.0, 
        shopDiscount: 1.0,
        
        // NEW: Crit & Heat Infrastructure
        critChance: charConfig.baseStats.critChance || 0.05, // Default 5%
        critDamage: charConfig.baseStats.critDamage || 1.5, // Default 150%
        heatValue: 0,
        maxHeat: 100,
        isOverclocked: false,
        
        // NEW: Unified Shop Slots (Base 8)
        shopSlots: 8, 

        lastShotTime: 0,
        lastDamageTime: 0,
        lastHealTime: 0,
        isRegeneratingShield: false,
        invulnerableTime: 0,
        items: [],
        insuranceGoldEarned: 0,
        pigButcheringTimer: 0, 
        pigDebts: [], // New: Debt stack
        
        // REFACTORED: Generic Timer Container
        customTimers: {}, // NEW: Timer Dictionary

        // Specific timers (Legacy being migrated)
        // firewallTimer and involutionTimer removed
        
        standStillTimer: 0,
        minerTimer: 0,
        memoryLeakTimer: 0,
        chatbotTimer: 0,
        droneTimer: 0,
        cloneTimer: 0,
        
        // Batch 3 Summons
        headhunterTimer: 0, 
        codeMountainTimer: 0,
        
        // Summon Buffs
        summonCooldownSpeed: 1.0,

        isDying: false,
        deathTimer: 0,
        speechSentenceIndex: 0,
        speechCharIndex: 0,
        speechPauseTimer: 0,
        
        swingCount: 0, 
        mopAngle: 0,
        maxMultiKill: 0
      },
      enemies: [],
      enemyPool: [],
      projectiles: [],
      projectilePool: [],
      floatingTexts: [],
      floatingTextPool: [],
      particles: [],
      particlePool: [],
      drops: [],
      zones: [],
      camera: { x: 0, y: 0 },
      score: 0,
      highScore: 0,
      timeAlive: 0,
      fps: 60, // Initialize FPS
      
      mapWidth: MAP_WIDTH,
      mapHeight: MAP_HEIGHT,
      currentWave: 1,
      waveTimer: 0,
      waveEnded: false,
      isWaveClearing: false,
      waveTransitionTimer: 0,
      
      killStreak: 0,
      killStreakTimer: 0,

      isOvertime: false,
      isCustomDebugMode: false,
      debugEnemyTypes: [],

      waveStats: {
        enemiesKilled: 0,
        damageDealt: 0,
        goldEarned: 0,
        damageMitigated: 0,
        bonusGold: 0
      },

      restockCost: 10,
      refreshCount: 0,
      modalMessage: null,
      achievementPopup: null, 
      achievementNotificationQueue: [], 
      
      difficultyId: difficultyId,
      isEndless: false,
      endlessWaveCount: 0,
      inflationRate: 0,
      isPaused: false,
      
      shopState: {
          stock: [] // Merged stock
      },
      hasRefreshedThisWave: false,
      hasPurchasedThisWave: false,
      achievements: [],
      
      activeMutators: [], // Init empty mutators
      uniqueSpawns: [], // Init unique spawns

      // NEW: Revive Sequence State
      reviveSequence: {
          active: false,
          timer: 0,
          phase: 'start',
          lostGold: 0
      },

      // NEW: Derived Stats (Optimized Calculation)
      derivedStats: {
          synergies: {},
          activeTiers: {}
      }
    };
}

export function saveGame(engine: IGameEngine) {
    try {
        const saveState = {
            ...engine.state,
            projectiles: [],
            particles: [],
            floatingTexts: [],
            enemyPool: [],
            projectilePool: [],
            particlePool: [],
            floatingTextPool: []
        };
        localStorage.setItem('meme_game_save', JSON.stringify(saveState));
    } catch (e) {
        console.error("Save failed", e);
    }
}

export function loadGame(engine: IGameEngine): boolean {
    try {
        const data = localStorage.getItem('meme_game_save');
        if (!data) return false;
        const loaded = JSON.parse(data);
        
        const currentAchievements = engine.state.achievements;
        const currentHighScore = engine.state.highScore;
        
        // Initialize base state
        const charId = loaded.player?.characterId || '9527';
        const diffId = loaded.difficultyId || 'normal';
        const baseState = getInitialState(charId, diffId);

        // MIGRATION: Convert old split shop state to new unified state
        if (loaded.shopState && (loaded.shopState.upgrades || loaded.shopState.items)) {
            const oldUpgrades = loaded.shopState.upgrades || [];
            const oldItems = loaded.shopState.items || [];
            loaded.shopState.stock = [...oldUpgrades, ...oldItems];
            delete loaded.shopState.upgrades;
            delete loaded.shopState.items;
        }

        // MIGRATION: Convert old player slots to shopSlots
        if (loaded.player) {
            if (loaded.player.shopUpgradeSlots !== undefined || loaded.player.shopItemSlots !== undefined) {
                const uSlots = loaded.player.shopUpgradeSlots || 4;
                const iSlots = loaded.player.shopItemSlots || 4;
                loaded.player.shopSlots = uSlots + iSlots;
            }
        }

        // Load base state + save data (Merge)
        engine.state = { ...baseState, ...loaded };
        
        if (loaded.shopState && loaded.shopState.stock) {
            engine.state.shopState.stock = loaded.shopState.stock;
        }

        // Restore achievements
        engine.state.achievements = currentAchievements;
        
        // Ensure new properties are initialized
        const p = engine.state.player;
        if (p.pigDebts === undefined) p.pigDebts = [];
        if (p.swingCount === undefined) p.swingCount = 0;
        if (p.mopAngle === undefined) p.mopAngle = 0;
        if (p.maxMultiKill === undefined) p.maxMultiKill = 0;
        if (p.explosionRangeMultiplier === undefined) p.explosionRangeMultiplier = 1.0;
        if (p.customTimers === undefined) p.customTimers = {}; 
        if (p.facingAngle === undefined) p.facingAngle = 0; // Ensure angle exists
        
        // Step 1 Infrastructure Checks
        if (p.critChance === undefined) p.critChance = 0.05;
        if (p.critDamage === undefined) p.critDamage = 1.5;
        if (p.heatValue === undefined) p.heatValue = 0;
        if (p.maxHeat === undefined) p.maxHeat = 100;
        if (p.isOverclocked === undefined) p.isOverclocked = false;
        if (p.flatAttackSpeedBonus === undefined) p.flatAttackSpeedBonus = 0;
        if (p.goldSpentInShop === undefined) p.goldSpentInShop = 0; // NEW: Safe init
        if (p.summonCooldownSpeed === undefined) p.summonCooldownSpeed = 1.0;
        if (p.lastHealTime === undefined) p.lastHealTime = 0; // NEW: Init lastHealTime

        // Ensure Revive State exists on loaded games
        if (!engine.state.reviveSequence) {
            engine.state.reviveSequence = {
                active: false,
                timer: 0,
                phase: 'start',
                lostGold: 0
            };
        }

        // Ensure Kill Streak State
        if (engine.state.killStreak === undefined) engine.state.killStreak = 0;
        if (engine.state.killStreakTimer === undefined) engine.state.killStreakTimer = 0;
        
        // Ensure mutators exist
        if (!engine.state.activeMutators) engine.state.activeMutators = [];
        
        // Ensure uniqueSpawns exists
        if (!engine.state.uniqueSpawns) engine.state.uniqueSpawns = [];

        // Ensure derivedStats exist (if loading from old save)
        if (!engine.state.derivedStats) {
            engine.state.derivedStats = { synergies: {}, activeTiers: {} };
        }

        if (p.pigButcheringTimer > 0 && p.pigDebts.length === 0) {
            p.pigDebts = [p.pigButcheringTimer];
            p.pigButcheringTimer = 0;
        }

        if (!engine.state.enemyPool) engine.state.enemyPool = [];
        if (!engine.state.projectilePool) engine.state.projectilePool = [];
        if (!engine.state.particlePool) engine.state.particlePool = [];
        if (!engine.state.floatingTextPool) engine.state.floatingTextPool = [];

        // Ensure timers init
        const timers = ['standStillTimer', 'minerTimer', 'memoryLeakTimer', 'chatbotTimer', 'droneTimer', 'cloneTimer', 'headhunterTimer', 'codeMountainTimer'];
        timers.forEach(t => {
            if ((p as any)[t] === undefined) (p as any)[t] = 0;
        });

        // Ensure new Board State Flags are present
        if (engine.state.hasRefreshedThisWave === undefined) engine.state.hasRefreshedThisWave = false;
        if (engine.state.hasPurchasedThisWave === undefined) engine.state.hasPurchasedThisWave = false;

        engine.state.highScore = currentHighScore;
        engine.state.achievementPopup = null;
        engine.state.achievementNotificationQueue = [];
        
        // Refresh Stats
        SynergyLogic.refreshDerivedStats(engine.state);

        engine.audio.resume();
        return true;
    } catch (e) {
        console.error("Load failed", e);
        return false;
    }
}

export function saveAchievements(engine: IGameEngine) {
    try {
        localStorage.setItem('meme_game_achievements', JSON.stringify(engine.state.achievements));
        localStorage.setItem('meme_game_highscore', engine.state.highScore.toString());
        localStorage.setItem('meme_game_total_time', engine.totalPlayTime.toString());
        localStorage.setItem('meme_game_global_stats', JSON.stringify(engine.globalStats));
    } catch (e) {
        console.error("Failed to save achievements", e);
    }
}

export function loadAchievements(engine: IGameEngine) {
      try {
          const data = localStorage.getItem('meme_game_achievements');
          if (data) {
              engine.state.achievements = JSON.parse(data);
          }
      } catch (e) {
          console.error("Failed to load achievements", e);
          engine.state.achievements = [];
      }
      
      const highScore = localStorage.getItem('meme_game_highscore');
      engine.state.highScore = highScore ? parseInt(highScore) : 0;
      
      const savedTime = localStorage.getItem('meme_game_total_time');
      engine.totalPlayTime = savedTime ? parseInt(savedTime) : 0;

      try {
          const stats = localStorage.getItem('meme_game_global_stats');
          if (stats) {
              engine.globalStats = { ...engine.globalStats, ...JSON.parse(stats) };
          }
      } catch (e) {
          console.error("Failed to load global stats", e);
      }

      if (engine.state.player) {
          applyAchievementBonuses(engine.state.player, engine.state.achievements);
      }
}

export function unlockEntry(engine: IGameEngine, id: string) {
    if (!engine.unlockedCompendium.has(id)) {
        engine.unlockedCompendium.add(id);
        try {
            localStorage.setItem('meme_game_encyclopedia', JSON.stringify(Array.from(engine.unlockedCompendium)));
        } catch (e) {
            console.error("Failed to save encyclopedia", e);
        }
    }
}

export function unlockAchievement(engine: IGameEngine, id: string) {
    if (!engine.state.achievements.includes(id)) {
        engine.state.achievements.push(id);
        saveAchievements(engine);
        
        const achievement = ACHIEVEMENTS.find(a => a.id === id);
        if (achievement) {
            if (!engine.state.achievementNotificationQueue) engine.state.achievementNotificationQueue = [];
            engine.state.achievementNotificationQueue.push({
                title: achievement.title,
                description: achievement.description,
                icon: achievement.icon
            });
            engine.audio.playAchievementSound();
        }
    }
}

export function checkAchievements(engine: IGameEngine) {
    const aggregatedStats: GlobalStats = {
        totalGamesPlayed: engine.globalStats.totalGamesPlayed,
        totalKills: engine.globalStats.totalKills + engine.state.waveStats.enemiesKilled,
        totalGoldEarned: engine.globalStats.totalGoldEarned + engine.state.waveStats.goldEarned,
        totalTimePlayed: engine.globalStats.totalTimePlayed + engine.state.timeAlive,
        totalDeaths: engine.globalStats.totalDeaths,
        highestWave: Math.max(engine.globalStats.highestWave, engine.state.currentWave)
    };
    
    const allOthers = ACHIEVEMENTS.filter(a => a.id !== 'all_clear');
    const unlockedOthers = engine.state.achievements.filter((id: string) => id !== 'all_clear');
    if (unlockedOthers.length >= allOthers.length && !engine.state.achievements.includes('all_clear')) {
            unlockAchievement(engine, 'all_clear');
    }

    ACHIEVEMENTS.forEach(ach => {
        if (!engine.state.achievements.includes(ach.id)) {
            if (ach.condition(engine.state, aggregatedStats)) {
                unlockAchievement(engine, ach.id);
            }
        }
    });
}
