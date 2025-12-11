
import { IGameEngine } from "../../../types";
import { WAVES } from "../../../data/memeContent";
import { spawnFloatingText } from "../utils";
import { spawnEnemy } from "../battle/enemySystem";
import { unlockAchievement } from "../upgradeLogic";
import { SummonFactory } from "../battle/systems/SummonFactory";
import { SHOP_ITEMS } from "../../../data/items";
import { SynergyLogic } from "../synergyLogic";
import { HAZARDS } from "../../../data/hazards";

// Boss Mapping Config
const BOSS_MAPPING: Record<string, string> = {
    'ev_creator': 'boss_glitch', 
    '1024': 'boss_glitch',
    'default': 'boss_kpi'
};

// Endless Mode Safe Waves (High density, no boss)
const ENDLESS_WAVE_POOL = [3, 5, 7]; 

export const DirectorSystem = {
    
    getBossTypeForPlayer: (charId: string): string => {
        return BOSS_MAPPING[charId] || BOSS_MAPPING['default'];
    },

    startWave: (engine: IGameEngine, waveNum: number) => {
        if (engine.state.isEndless) {
            engine.state.endlessWaveCount++;
            engine.state.currentWave = engine.state.currentWave + 1;
            
            // --- ENDLESS MUTATION LOGIC ---
            if (engine.state.endlessWaveCount % 5 === 0) {
                const available = HAZARDS.filter(h => !engine.state.activeMutators.includes(h.id));
                if (available.length > 0) {
                    const newHazard = available[Math.floor(Math.random() * available.length)];
                    engine.state.activeMutators.push(newHazard.id);
                    engine.state.modalMessage = {
                        title: "环境突变!",
                        text: `【${newHazard.name}】生效: ${newHazard.description}`,
                        type: 'error'
                    };
                    engine.audio.play('ui_glitch_minor');
                } else {
                    engine.state.inflationRate += 0.2;
                    engine.state.modalMessage = {
                        title: "至暗时刻",
                        text: "所有恶劣环境已叠加... 祝你好运。",
                        type: 'error'
                    };
                }
            }

        } else {
            engine.state.currentWave = waveNum;
        }

        if (engine.state.currentWave > 1) {
            const softLandingCount = engine.state.player.items.filter(i => i === '软着陆').length;
            let inflationStep = 0.05;
            if (softLandingCount > 0) {
                inflationStep = 0.05 * Math.pow(2, softLandingCount);
            }
            engine.state.inflationRate += inflationStep;
        } else {
            engine.state.inflationRate = 0;
        }

        engine.state.waveTimer = 0;
        engine.state.waveEnded = false;
        engine.state.isWaveClearing = false;
        engine.state.waveTransitionTimer = 0;
        engine.state.isOvertime = false;
        
        engine.state.waveStats = {
            enemiesKilled: 0,
            damageDealt: 0,
            goldEarned: 0,
            damageMitigated: 0,
            bonusGold: 0
        };
        
        engine.state.player.x = 0;
        engine.state.player.y = 0;
        
        if (!engine.state.achievements.includes('onboarding')) {
            unlockAchievement(engine, 'onboarding');
        }
        if (!engine.state.achievements.includes('first_blood')) {
            unlockAchievement(engine, 'first_blood');
        }

        // --- RESET MEMORY LEAK STATS ---
        if (engine.state.player.customVars) {
            const accumulatedDmg = engine.state.player.customVars['mem_leak_acc_dmg'];
            const accumulatedRad = engine.state.player.customVars['mem_leak_acc_rad'];
            
            let resetHappened = false;
            
            if (accumulatedDmg && accumulatedDmg > 0) {
                engine.state.player.attackDamage = Math.max(1, engine.state.player.attackDamage - accumulatedDmg);
                engine.state.player.customVars['mem_leak_acc_dmg'] = 0;
                resetHappened = true;
            }
            
            if (accumulatedRad && accumulatedRad > 0) {
                engine.state.player.radius = Math.max(10, engine.state.player.radius - accumulatedRad);
                engine.state.player.customVars['mem_leak_acc_rad'] = 0;
                resetHappened = true;
            }
            
            if (resetHappened) {
                spawnFloatingText(engine, engine.state.player.x, engine.state.player.y - 120, "内存释放 (属性重置)", "#ef4444", 'chat');
            }
        }
        
        // --- ITEM HOOKS: On Wave Start ---
        SHOP_ITEMS.forEach(item => {
            if (item.onWaveStart) {
                const tags = item.items || [item.title];
                const count = engine.state.player.items.filter(i => tags.includes(i)).length;
                if (count > 0) {
                    item.onWaveStart(engine, count);
                }
            }
        });

        if (engine.state.player.items.includes('祖传屎山')) {
            const hpGain = 50;
            engine.state.player.maxHp += hpGain;
            engine.state.player.radius *= 1.10; 
            engine.state.player.speed *= 0.95; 
            spawnFloatingText(engine, engine.state.player.x, engine.state.player.y - 100, "屎山堆积! HP+50", '#8b5cf6', 'chat');
        }

        if (engine.state.player.pigDebts && engine.state.player.pigDebts.length > 0) {
            let totalDeduction = 0;
            let remainingDebts = 0;
            engine.state.player.pigDebts = engine.state.player.pigDebts.map((duration: number) => {
                totalDeduction += 200;
                remainingDebts++;
                return duration - 1;
            }).filter((duration: number) => duration > 0);

            if (totalDeduction > 0) {
                engine.state.player.gold -= totalDeduction;
                spawnFloatingText(engine, engine.state.player.x, engine.state.player.y - 90, `杀猪盘扣款: -${totalDeduction}`, '#ef4444', 'gold');
                spawnFloatingText(engine, engine.state.player.x, engine.state.player.y - 60, `当前 ${remainingDebts} 笔负债`, '#ef4444', 'chat');
            }
        }

        engine.state.player.hp = engine.state.player.maxHp;
        
        if (engine.state.player.items.includes('养鱼塘')) {
             if (engine.state.player.shield > engine.state.player.maxShield) {
                 engine.state.player.shield = engine.state.player.maxShield;
             }
        } else {
             engine.state.player.shield = engine.state.player.maxShield;
        }
        
        const counts = SynergyLogic.getSynergyCounts(engine.state.player.items);
        const tiers = SynergyLogic.getActiveTiers(counts);
        if ((tiers['capital'] || 0) >= 4) {
            const spent = engine.state.player.goldSpentInShop || 0;
            if (spent > 0) {
                const shieldGain = Math.floor(spent / 10) * 2;
                if (shieldGain > 0) {
                    engine.state.player.shield += shieldGain;
                    spawnFloatingText(engine, engine.state.player.x, engine.state.player.y - 60, `消费护盾+${shieldGain}`, '#3b82f6', 'chat');
                }
            }
        }
        engine.state.player.goldSpentInShop = 0;

        engine.state.player.isRegeneratingShield = false;
        engine.state.player.insuranceGoldEarned = 0; 
        engine.state.player.isDying = false;
        engine.state.player.deathTimer = 0;
        
        engine.state.refreshCount = 0;
        let baseRefresh = 10 + (engine.state.isEndless ? engine.state.endlessWaveCount : 0);
        engine.state.restockCost = baseRefresh;
        
        if (engine.state.player.characterId === '9527') {
            const income = Math.floor(100 * engine.state.player.incomeMultiplier);
            if (income > 0) {
                engine.state.player.gold += income;
                engine.state.score += income; 
                engine.state.waveStats.goldEarned += income;
                engine.state.waveStats.bonusGold += income;
            }
        }

        engine.state.projectiles = [];
        engine.state.enemies = [];
        engine.state.drops = [];
        engine.state.zones = [];
        
        engine.audio.playBattleBGM();
        
        const buffer = 300;
        const chatbotCount = engine.state.player.items.filter((i: string) => i === '客服机器人').length;
        if (chatbotCount > 0) {
            spawnFloatingText(engine, engine.state.player.x, engine.state.player.y - 80, `客服上线 x${chatbotCount}`, '#a855f7', 'chat');
            for (let i = 0; i < chatbotCount; i++) {
                const spawnX = (Math.random() - 0.5) * (engine.MAP_WIDTH - buffer);
                const spawnY = (Math.random() - 0.5) * (engine.MAP_HEIGHT - buffer);
                SummonFactory.createSummon(engine, 'chatbot', spawnX, spawnY);
            }
        }

        const cloneItems = engine.state.player.items.filter((i: string) => i === '影子分身').length;
        if (cloneItems > 0) {
            let totalClones = cloneItems;
            if (engine.state.player.items.includes('镜像服务器')) {
                totalClones *= 2;
            }

            spawnFloatingText(engine, engine.state.player.x, engine.state.player.y - 80, `分身部署 x${totalClones}`, '#a855f7', 'chat');
            for (let i = 0; i < totalClones; i++) {
                const spawnX = (Math.random() - 0.5) * (engine.MAP_WIDTH - buffer);
                const spawnY = (Math.random() - 0.5) * (engine.MAP_HEIGHT - buffer);
                SummonFactory.createSummon(engine, 'clone', spawnX, spawnY);
            }
        }
        
        const headhunterCount = engine.state.player.items.filter((i: string) => i === '猎头顾问').length;
        if (headhunterCount > 0) {
             for (let i = 0; i < headhunterCount; i++) {
                SummonFactory.createSummon(engine, 'headhunter', engine.state.player.x, engine.state.player.y);
             }
        }
        
        if (engine.state.isCustomDebugMode) {
            spawnFloatingText(engine, 0, -100, "测试模式启动", "#a855f7", 'chat');
            return;
        }

        if (!engine.state.isEndless) {
            const waveConfig = WAVES.find(w => w.waveNumber === engine.state.currentWave) || WAVES[WAVES.length - 1];
            if (waveConfig.isBossWave) {
                const bossId = DirectorSystem.getBossTypeForPlayer(engine.state.player.characterId);
                spawnEnemy(engine, bossId, 0, -800);
                
                if (engine.state.player.characterId === 'ev_creator' && bossId === 'boss_glitch') {
                    engine.unlockEntry('boss_ai');
                    engine.unlockEntry('boss_ai_clone');
                    engine.unlockEntry('boss_ai_node');
                }
            } 
            else {
                const isHighDiff = engine.state.difficultyId === 'hard' || engine.state.difficultyId === 'ultimate';
                if (isHighDiff) {
                    if (engine.state.currentWave === 4) {
                         spawnEnemy(engine, 'elite_manager', -700, 0); 
                         spawnEnemy(engine, 'elite_manager', 700, 0); 
                         engine.state.isOvertime = true; 
                    } else if (engine.state.currentWave === 6) {
                         if (!engine.state.uniqueSpawns.includes('elite_hr')) {
                             spawnEnemy(engine, 'elite_hr', 0, -500); 
                             engine.state.uniqueSpawns.push('elite_hr');
                             engine.state.isOvertime = true; 
                         } else {
                             spawnEnemy(engine, 'capital_crocodile', 0, -500);
                         }
                    }
                }
            }
        }
    },

    update: (engine: IGameEngine) => {
        if (engine.state.isCustomDebugMode) {
            if (engine.state.waveTimer % 40 === 0 && engine.state.debugEnemyTypes && engine.state.debugEnemyTypes.length > 0) {
                 const randType = engine.state.debugEnemyTypes[Math.floor(Math.random() * engine.state.debugEnemyTypes.length)];
                 DirectorSystem.spawnEnemyRandomly(engine, randType);
            }
            return;
        }

        let effectiveWaveNum: number;
        
        if (engine.state.isEndless) {
            const poolIndex = (engine.state.endlessWaveCount - 1) % ENDLESS_WAVE_POOL.length;
            effectiveWaveNum = ENDLESS_WAVE_POOL[poolIndex];
            
            if (engine.state.waveTimer % 1200 === 0 && engine.state.waveTimer > 0) {
                DirectorSystem.triggerHorde(engine);
            }

        } else {
            effectiveWaveNum = engine.state.currentWave;
        }

        const waveConfig = WAVES.find(w => w.waveNumber === effectiveWaveNum) || WAVES[WAVES.length - 1];
        let maxTime = waveConfig.duration * 60; 
        
        const isHighDiff = engine.state.difficultyId === 'hard' || engine.state.difficultyId === 'ultimate';

        if (isHighDiff && !engine.state.isEndless) {
            if (engine.state.currentWave === 4 || engine.state.currentWave === 6) {
                maxTime = 90 * 60; 
            }
        }

        if (engine.state.waveTimer % 600 === 0) {
            if (engine.state.currentWave > 1) {
                if (Math.random() < 0.15) { 
                    const rnd = Math.random();
                    if (rnd < 0.5) {
                        DirectorSystem.spawnEnemyRandomly(engine, 'bonus_chest');
                        spawnFloatingText(engine, engine.state.player.x, engine.state.player.y - 100, "🎁 年终奖快跑!", "#fbbf24", 'chat');
                    } else {
                        DirectorSystem.spawnEnemyRandomly(engine, 'delivery_guy');
                        spawnFloatingText(engine, engine.state.player.x, engine.state.player.y - 100, "🛵 外卖到了!", "#fbbf24", 'chat');
                    }
                }
            }
        }
        
        const hasCroc = engine.state.enemies.some((e: any) => e.config.type === 'capital_crocodile');
        if (engine.state.waveTimer === 1) {
            const hasCrocInConfig = waveConfig.enemies.some(e => e.type === 'capital_crocodile');
            if (hasCrocInConfig) {
                DirectorSystem.spawnEnemyRandomly(engine, 'capital_crocodile');
            }
        }

        if (waveConfig.isBossWave && !engine.state.isEndless) {
            // Boss logic wait
        } else {
            if (engine.state.waveTimer >= maxTime && !engine.state.isWaveClearing) {
                DirectorSystem.triggerWaveEnd(engine);
            } else {
               let currentSpawnRate = waveConfig.spawnRate;
               
               if (engine.state.difficultyId === 'easy') currentSpawnRate = Math.ceil(currentSpawnRate * 1.2); 
               else if (engine.state.difficultyId === 'hard') currentSpawnRate = Math.ceil(currentSpawnRate * 0.8); 
               else if (engine.state.difficultyId === 'ultimate') currentSpawnRate = Math.ceil(currentSpawnRate * 0.6); 

               if (engine.state.isEndless) {
                   const endlessSpeedBoost = Math.floor(engine.state.endlessWaveCount / 5); 
                   currentSpawnRate = Math.max(2, 15 - endlessSpeedBoost);
               } 
               // Apply global slight speed increase for later waves
               else if (engine.state.currentWave >= 5) {
                   currentSpawnRate = Math.ceil(currentSpawnRate * 0.8);
               }

               if (hasCroc) currentSpawnRate = Math.max(10, Math.floor(currentSpawnRate * 0.7)); 
               currentSpawnRate = Math.max(2, currentSpawnRate);

               if (engine.state.waveTimer % currentSpawnRate === 0) {
                   const totalWeight = waveConfig.enemies.reduce((sum, e) => sum + e.weight, 0);
                   let r = Math.random() * totalWeight;
                   let selectedType = waveConfig.enemies[0].type;
                   for(const e of waveConfig.enemies) {
                       r -= e.weight;
                       if (r <= 0) {
                           selectedType = e.type;
                           break;
                       }
                   }
                   
                   if (selectedType === 'elite_hr') {
                       if (engine.state.uniqueSpawns.includes('elite_hr')) {
                           selectedType = Math.random() > 0.5 ? 'bonus_chest' : 'capital_crocodile';
                       } else {
                           engine.state.uniqueSpawns.push('elite_hr');
                       }
                   }

                   DirectorSystem.spawnEnemyRandomly(engine, selectedType);
               }
            }
        }
    },

    triggerWaveEnd: (engine: IGameEngine) => {
        const counts = SynergyLogic.getSynergyCounts(engine.state.player.items);
        const tiers = SynergyLogic.getActiveTiers(counts);
        
        if ((tiers['capital'] || 0) >= 2) {
            const interest = Math.min(200, Math.floor(engine.state.player.gold * 0.1));
            if(interest > 0) {
                engine.state.player.gold += interest;
                engine.state.waveStats.goldEarned += interest;
                engine.state.waveStats.bonusGold += interest;
            }
        }

        engine.state.hasRefreshedThisWave = false;
        engine.state.hasPurchasedThisWave = false;

        engine.state.isWaveClearing = true;
        engine.state.waveTransitionTimer = 150; 
        
        engine.state.enemies = [];
        engine.state.projectiles = [];
        
        engine.saveGame();
    },
    
    triggerHorde: (engine: IGameEngine) => {
        spawnFloatingText(engine, 0, -150, "⚠ 大批需求正在接近 ⚠", "#ef4444", 'chat');
        engine.audio.play('ui_glitch_severe');
        
        const types = ['tian_gou', 'marketing_account', 'minion']; 
        const type = types[Math.floor(Math.random() * types.length)];
        const count = 20 + Math.min(30, engine.state.endlessWaveCount);
        
        for(let i=0; i<count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const dist = 1200 + Math.random() * 200;
            const x = engine.state.player.x + Math.cos(angle) * dist;
            const y = engine.state.player.y + Math.sin(angle) * dist;
            spawnEnemy(engine, type, x, y);
        }
    },

    spawnEnemyRandomly: (engine: IGameEngine, type: string) => {
        if (type === 'elite_hr') {
            if (engine.state.uniqueSpawns.includes('elite_hr')) {
                return; 
            } else {
                engine.state.uniqueSpawns.push('elite_hr');
            }
        }

        if (type === 'cyber_goddess') {
            const count = engine.state.enemies.filter(e => e.config.type === 'cyber_goddess').length;
            if (count >= 2) type = 'river_crab'; 
        }

        if (type === 'capital_crocodile') {
            const count = engine.state.enemies.filter(e => e.config.type === 'capital_crocodile').length;
            if (count >= 1) type = Math.random() > 0.5 ? 'product_manager' : 'river_crab';
        }

        const angle = Math.random() * Math.PI * 2;
        const spawnDist = 900; 
        const spawnX = Math.max(-engine.MAP_WIDTH/2, Math.min(engine.MAP_WIDTH/2, engine.state.player.x + Math.cos(angle) * spawnDist));
        const spawnY = Math.max(-engine.MAP_HEIGHT/2, Math.min(engine.MAP_HEIGHT/2, engine.state.player.y + Math.sin(angle) * spawnDist));
        spawnEnemy(engine, type, spawnX, spawnY);
    }
};
