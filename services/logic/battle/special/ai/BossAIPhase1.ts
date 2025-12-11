
import { IGameEngine } from "../../../../../types";
import { spawnFloatingText, spawnParticles, PoolUtils } from "../../../utils";
import { EnemySpawner } from "../../systems/EnemySpawner";
import { AiStormSkill } from "../skills/ai/AiStormSkill";
import { CONFIG } from "./BossAIConfig";

export const Phase1 = {
    update: (engine: IGameEngine, e: any, p: any) => {
        // 1. Force Center Position (Turret Mode)
        e.x = 0; e.y = 0; e.vx = 0; e.vy = 0;
        
        // --- FORCE START SPAWN ON FRAME 1 ---
        if (e.stateTimer === 1) {
            e.subState = 'building';
            e.customVars.buildTimer = 0;
            e.customVars.nodesToSpawn = 2; // Start with 2 nodes immediately
        }

        // Check building state
        if (e.subState === 'building') {
            e.customVars.buildTimer = (e.customVars.buildTimer || 0) + 1;
            
            // If location not calculated yet, calculate it now
            if (!e.customVars.nextSpawnLocation) {
                // SMART SPAWN: Find furthest edge position
                e.customVars.nextSpawnLocation = calculateSmartSpawnPos(engine, e);
            }

            // Audio tick
            if (e.customVars.buildTimer % 30 === 0) {
                engine.audio.play('ui_static_tick');
            }

            // CAST FINISHED -> SPAWN
            if (e.customVars.buildTimer >= CONFIG.phase1.buildTime) {
                const loc = e.customVars.nextSpawnLocation;
                
                if (loc) {
                    spawnNodeAt(engine, e, loc.x, loc.y);
                    spawnFloatingText(engine, e.x, e.y - 150, "节点上线", "#a855f7", 'chat');
                    spawnParticles(engine, e.x, e.y, '#a855f7', 30);
                }

                // Decrement remaining count
                e.customVars.nodesToSpawn--;
                
                // Reset for next node OR finish
                e.customVars.buildTimer = 0;
                e.customVars.nextSpawnLocation = null; // Clear warning to force recalculation for next node

                if (e.customVars.nodesToSpawn <= 0 || e.customVars.nodes.length >= CONFIG.phase1.maxNodes) {
                    // Batch Complete
                    e.subState = 'normal'; 
                    e.stateTimer = 2; // Reset main timer
                }
            }
            
            handleProxyNodes(engine, e);
            return; // Stop attacking while building
        }

        // 2. CHECK SPAWN CONDITION (Start Batch)
        e.customVars.nodes = e.customVars.nodes.filter((id: string) => engine.state.enemies.some(en => en.id === id && en.hp > 0));
        
        if (e.stateTimer >= CONFIG.phase1.nodeSpawnInterval && e.customVars.nodes.length < CONFIG.phase1.maxNodes) {
            e.subState = 'building';
            e.customVars.buildTimer = 0;
            e.customVars.nodesToSpawn = 1; // Maintain logic
        }
        
        handleProxyNodes(engine, e);

        // 3. SKILL COOLDOWN MANAGEMENT
        const stormCD = e.customVars.skillCooldowns['storm'] || 0;
        if (stormCD > 0) e.customVars.skillCooldowns['storm']--;

        const barrageCD = e.customVars.skillCooldowns['barrage'] || 0;
        if (barrageCD > 0) e.customVars.skillCooldowns['barrage']--;

        // 4. SKILL SELECTION (If Idle)
        if (!e.customVars.activeSkill) {
            
            // Priority 1: Yellow Barrage (High Frequency)
            if (barrageCD <= 0) {
                e.customVars.activeSkill = 'data_stream';
                e.customVars.subTimer = 0;
                e.customVars.skillCooldowns['barrage'] = CONFIG.phase1.barrageCooldown;
                // Randomly select pattern: Helix (Cross) or Quad (Sweep)
                e.customVars.streamPattern = Math.random() < 0.5 ? 'helix' : 'quad';
                spawnFloatingText(engine, e.x, e.y - 120, "⚠ 异常数据流 ⚠", "#facc15", 'chat');
                engine.audio.play('ui_glitch_minor');
            }
            // Priority 2: Triple Storm (Heavy Hitter)
            else if (stormCD <= 0 && e.stateTimer > 300) { 
                e.customVars.activeSkill = 'triple_storm';
                e.customVars.stormCharges = 3; 
                e.customVars.subTimer = 0;
                e.customVars.skillCooldowns['storm'] = CONFIG.phase1.stormCooldown;
            }
            // Default: Auto Attack (Spiral Voltage)
            else if (e.stateTimer % CONFIG.phase1.shootRate === 0) {
                e.customVars.shootAngle = (e.customVars.shootAngle || 0) + 0.3; 
                for(let i=0; i<3; i++) {
                    const angle = e.customVars.shootAngle + (i * (Math.PI * 2 / 3));
                    EnemySpawner.spawnSingleBullet(engine, e, angle, false, '●');
                    const lastProj = engine.state.projectiles[engine.state.projectiles.length - 1];
                    if (lastProj) {
                        lastProj.renderStyle = 'glitch_tangle'; 
                        lastProj.color = '#a855f7'; 
                        lastProj.radius = 16; 
                        lastProj.damage = 18;
                    }
                }
            }
        }

        // 5. EXECUTE ACTIVE SKILL
        
        // --- A. DATA STREAM (Yellow Barrage) ---
        if (e.customVars.activeSkill === 'data_stream') {
            e.customVars.subTimer++;
            
            if (e.customVars.subTimer % CONFIG.phase1.barrageFireRate === 0) {
                const spawnBullet = (a: number) => {
                    const proj = PoolUtils.getProjectile(engine);
                    proj.x = e.x; proj.y = e.y;
                    proj.radius = 18; // Large Donut
                    proj.vx = Math.cos(a) * 7; 
                    proj.vy = Math.sin(a) * 7;
                    proj.damage = 15; 
                    proj.life = 300; // Increased life to 5s so they fly off-screen
                    proj.isEnemy = true;
                    proj.color = '#facc15'; // Yellow
                    proj.emoji = ''; // No Text
                    proj.text = ''; // No Text
                    proj.renderStyle = 'donut_ring'; // USE DONUT RENDERER
                    proj.sourceType = 'boss_ai';
                    proj.behaviors = ['move_linear', 'decay_life', 'check_bounds']; 
                    proj.active = true;
                    engine.state.projectiles.push(proj);
                };

                if (e.customVars.streamPattern === 'quad') {
                    // --- PATTERN B: QUAD SWEEP (The Fan) ---
                    // 4 arms rotating in same direction
                    const rotationSpeed = 0.12; // Slower uniform rotation
                    e.customVars.streamAngle = (e.customVars.streamAngle || 0) + rotationSpeed;
                    const baseAngle = e.customVars.streamAngle;
                    
                    for(let i=0; i<4; i++) {
                        spawnBullet(baseAngle + (i * Math.PI / 2));
                    }
                } else {
                    // --- PATTERN A: HELIX (The DNA) ---
                    // 2 streams rotating in opposite directions
                    const rotationSpeed = 0.2; // Faster counter-rotation
                    e.customVars.streamAngle = (e.customVars.streamAngle || 0) + rotationSpeed;
                    const baseAngle = e.customVars.streamAngle;
                    
                    // Stream 1: Clockwise
                    spawnBullet(baseAngle);
                    // Stream 2: Counter-Clockwise (Offset PI)
                    spawnBullet(-baseAngle + Math.PI);
                }

                if (e.customVars.subTimer % 10 === 0) engine.audio.play('shoot_boss_glitch');
            }

            if (e.customVars.subTimer >= CONFIG.phase1.barrageDuration) {
                e.customVars.activeSkill = 'system_cooling';
                e.customVars.subTimer = 0;
                spawnFloatingText(engine, e.x, e.y - 100, ">>> 系统过热 <<<", "#fbbf24", 'chat');
            }
        }

        // --- B. TRIPLE DEFRAG STORM ---
        else if (e.customVars.activeSkill === 'triple_storm') {
            e.customVars.subTimer++;
            
            // Trigger wave every 60 frames (1 second) if charges remain
            if (e.customVars.subTimer % 60 === 1 && e.customVars.stormCharges > 0) {
                AiStormSkill.start(engine, e, CONFIG.phase1.stormCount, `⚠ 碎片整理 (${e.customVars.stormCharges}/3) ⚠`, "#d8b4fe");
                e.customVars.stormCharges--;
            }
            
            AiStormSkill.update(engine, e, p, CONFIG.phase1.stormInterval);
            
            // Finish Storm Sequence -> Enter Cooling
            if (e.customVars.stormCharges <= 0 && e.customVars.subTimer > 240) {
                e.customVars.activeSkill = 'system_cooling';
                e.customVars.subTimer = 0;
                spawnFloatingText(engine, e.x, e.y - 100, ">>> 系统过热 <<<", "#94a3b8", 'chat');
            }
        }

        // --- C. SYSTEM COOLING (Vulnerable State) ---
        else if (e.customVars.activeSkill === 'system_cooling') {
            e.customVars.subTimer++;
            
            // Visual feedback for cooling
            if (e.customVars.subTimer % 30 === 0) {
                spawnParticles(engine, e.x + (Math.random()-0.5)*100, e.y + (Math.random()-0.5)*100, '#94a3b8', 3);
            }

            if (e.customVars.subTimer > CONFIG.phase1.coolingDuration) {
                e.customVars.activeSkill = null; // Resume normal behavior
                spawnFloatingText(engine, e.x, e.y - 100, "重启完成", "#22c55e", 'chat');
            }
        }
    }
};

// --- SMART SPAWN LOGIC ---
// Calculates the 4 cardinal edge points and picks the one furthest from existing nodes
function calculateSmartSpawnPos(engine: IGameEngine, boss: any) {
    const mapW = engine.state.mapWidth;
    const mapH = engine.state.mapHeight;
    const margin = 40; // Reduced margin to 40 (Closer to wall)
    
    // 4 Potential Candidate Points
    const candidates = [
        { x: 0, y: -mapH/2 + margin, id: 'top' },
        { x: mapW/2 - margin, y: 0, id: 'right' },
        { x: 0, y: mapH/2 - margin, id: 'bottom' },
        { x: -mapW/2 + margin, y: 0, id: 'left' }
    ];

    // If no nodes exist, pick random
    if (!boss.customVars.nodes || boss.customVars.nodes.length === 0) {
        return candidates[Math.floor(Math.random() * candidates.length)];
    }

    let bestCandidate = candidates[0];
    let maxMinDist = -1;

    // Evaluate each candidate
    for (const cand of candidates) {
        let minDist = Infinity;
        
        // Find distance to the CLOSEST existing node
        for (const nodeId of boss.customVars.nodes) {
            const node = engine.state.enemies.find(en => en.id === nodeId);
            if (node) {
                const d = Math.hypot(node.x - cand.x, node.y - cand.y);
                if (d < minDist) minDist = d;
            }
        }

        // We want to MAXIMIZE this minimum distance (spawn as far as possible from the swarm)
        if (minDist > maxMinDist) {
            maxMinDist = minDist;
            bestCandidate = cand;
        }
    }
    
    // Add slight jitter to prevent robotic alignment
    return {
        x: bestCandidate.x + (Math.random() - 0.5) * 100,
        y: bestCandidate.y + (Math.random() - 0.5) * 100
    };
}

function spawnNodeAt(engine: IGameEngine, e: any, x: number, y: number) {
    EnemySpawner.spawnEnemy(engine, 'boss_ai_node', x, y);
    const newNode = engine.state.enemies[engine.state.enemies.length - 1];
    if (newNode) {
        e.customVars.nodes.push(newNode.id);
        newNode.customVars = { state: 'edge_patrol' };
        newNode.config.behavior = 'turret';
        newNode.vx = 0;
        newNode.vy = 0;
        // PACING: DISABLE ATTACKING FOR NODES
        newNode.attackCooldown = 99999999;
    }
}

function handleProxyNodes(engine: IGameEngine, e: any) {
    const mapW = engine.state.mapWidth;
    const mapH = engine.state.mapHeight;
    const margin = 40; // Reduced margin to 40 (Closer to wall)
    const speed = 2.5;

    engine.state.zones = engine.state.zones.filter(z => z.type !== 'ai_laser_link');

    e.customVars.nodes.forEach((id: string) => {
        const node = engine.state.enemies.find(en => en.id === id);
        if (node) {
            // 1. Edge Patrol Logic (Manual Position Update)
            const distTop = Math.abs(node.y - (-mapH/2 + margin));
            const distBottom = Math.abs(node.y - (mapH/2 - margin));
            const distLeft = Math.abs(node.x - (-mapW/2 + margin));
            const distRight = Math.abs(node.x - (mapW/2 - margin));
            
            const minDist = Math.min(distTop, distBottom, distLeft, distRight);
            
            // Move clockwise
            if (minDist === distTop) {
                if (node.x < mapW/2 - margin) { node.x += speed; node.y += ((-mapH/2 + margin) - node.y) * 0.2; } else { node.y += speed; }
            } else if (minDist === distRight) {
                if (node.y < mapH/2 - margin) { node.y += speed; node.x += ((mapW/2 - margin) - node.x) * 0.2; } else { node.x -= speed; }
            } else if (minDist === distBottom) {
                if (node.x > -mapW/2 + margin) { node.x -= speed; node.y += ((mapH/2 - margin) - node.y) * 0.2; } else { node.y -= speed; }
            } else {
                if (node.y > -mapH/2 + margin) { node.y -= speed; node.x += ((-mapW/2 + margin) - node.x) * 0.2; } else { node.x += speed; }
            }

            // 2. Draw Electric Link
            const dx = node.x - e.x;
            const dy = node.y - e.y;
            const dist = Math.hypot(dx, dy);
            const angle = Math.atan2(dy, dx);
            const midX = (e.x + node.x) / 2;
            const midY = (e.y + node.y) / 2;

            engine.state.zones.push({
                id: `link_${node.id}`,
                x: midX, y: midY,
                width: dist, 
                height: 20, radius: 10,
                angle: angle, type: 'ai_laser_link',
                life: 2, maxLife: 2,
                color: '#d8b4fe', emoji: ''
            });
        }
    });
}
