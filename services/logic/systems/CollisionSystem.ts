
import { IGameEngine } from "../../../types";
import { SpatialHashGrid } from "../utils/SpatialGrid";
import { PlayerHitHandler } from "./collision/PlayerHitHandler";
import { EnemyHitHandler } from "../battle/systems/collision/EnemyHitHandler";
import { ExplosionHandler } from "./collision/ExplosionHandler";
import { SpecialCollisionHandler } from "./collision/SpecialCollisionHandler";
import { GameEventType } from "../events/events";
import { killEnemy } from "../battle/enemySystem";
import { spawnParticles, spawnFloatingText } from "../utils";

export const CollisionSystem = {
    damagePlayer: PlayerHitHandler.damagePlayer,

    checkCollisions: (engine: IGameEngine) => {
        // --- OPTIMIZATION: BUILD SPATIAL GRID ONCE ---
        const grid = new SpatialHashGrid(400);
        grid.insertAll(engine.state.enemies);

        const p = engine.state.player;
        const hasPrivateDriver = p.items.includes('专职司机');
        const currentTime = engine.state.timeAlive;
        
        // CACHE SUMMONS FOR MEAT SHIELD LOGIC (Optimize Performance)
        const activeSummons = engine.state.projectiles.filter(s => s.isSummon && !s.isInvincible && s.hp && s.hp > 0);

        // --- 0. ENEMY BODY vs PLAYER BODY COLLISION ---
        if (!p.isDying) { 
            const nearbyEnemies = grid.query(p.x, p.y);
            
            for (const e of nearbyEnemies) {
                if (e.hp <= 0 || e.isTransitioning) continue;
                
                if (e.isUnstable) continue;
                if (e.config.type === 'boss_glitch' && e.customVars?.activeSkill === 'overflow') continue;

                const dist = Math.hypot(e.x - p.x, e.y - p.y);
                const collisionThreshold = e.radius + p.radius * 0.8; 
                
                if (dist < collisionThreshold) {
                    
                    // --- PRIVATE DRIVER RAMMING LOGIC ---
                    if (hasPrivateDriver) {
                        const speed = Math.hypot(p.vx, p.vy);
                        if (speed > 0.5) {
                            const facingAngle = p.facingAngle || 0;
                            const enemyAngle = Math.atan2(e.y - p.y, e.x - p.x);
                            let angleDiff = Math.abs(facingAngle - enemyAngle);
                            if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
                            const isFrontal = angleDiff < (Math.PI / 3);

                            if (isFrontal) {
                                if (!e.customVars) e.customVars = {};
                                const lastRam = e.customVars.lastRamTime || 0;
                                const cooldown = 18; 

                                if (currentTime - lastRam > cooldown) {
                                    e.customVars.lastRamTime = currentTime;
                                    const isHighSpeed = speed > 2.0;
                                    let ramDamage = 0;
                                    let knockbackForce = 0;
                                    let isCrit = false;

                                    if (isHighSpeed) {
                                        ramDamage = Math.floor(p.attackDamage * 2.0 + p.maxHp * 0.1);
                                        knockbackForce = 60; 
                                        isCrit = true;
                                        engine.audio.play('ui_shield_break');
                                        spawnFloatingText(engine, e.x, e.y, "🚛 砰!", "#ef4444", 'damage');
                                    } else {
                                        ramDamage = Math.floor(p.attackDamage * 0.5);
                                        knockbackForce = 25; 
                                        isCrit = false;
                                    }

                                    e.hp -= ramDamage;
                                    engine.state.waveStats.damageDealt += ramDamage;
                                    
                                    engine.emit(GameEventType.ENTITY_DAMAGED, { x: e.x, y: e.y, text: `${ramDamage}`, color: isCrit ? '#ef4444' : '#ffffff', isCrit: isCrit });
                                    spawnParticles(engine, (e.x + p.x)/2, (e.y + p.y)/2, '#ffffff', isHighSpeed ? 12 : 4);

                                    const angle = Math.atan2(e.y - p.y, e.x - p.x);
                                    e.vx = Math.cos(angle) * knockbackForce;
                                    e.vy = Math.sin(angle) * knockbackForce;
                                    e.stunTimer = isHighSpeed ? 60 : 15; 

                                    if (e.hp <= 0) {
                                        const idx = engine.state.enemies.indexOf(e);
                                        if (idx > -1) killEnemy(engine, idx);
                                    }
                                } else {
                                    const angle = Math.atan2(e.y - p.y, e.x - p.x);
                                    const push = 10;
                                    e.vx += Math.cos(angle) * push;
                                    e.vy += Math.sin(angle) * push;
                                }
                                continue; 
                            }
                        }
                    }

                    if (e.config.type === 'leech') {
                        if (e.captureState !== 'latched') {
                            e.captureState = 'latched';
                            PlayerHitHandler.damagePlayer(engine, e.config.damage, 'leech_latch');
                            e.vx = 0; e.vy = 0;
                        }
                        continue; 
                    }

                    if (p.invulnerableTime <= 0) {
                        const contactDamage = e.config.damage;
                        if (contactDamage > 0 || e.config.behavior === 'thief') {
                            PlayerHitHandler.damagePlayer(engine, contactDamage, e.config.type, e.x, e.y);
                            e.hitFlashTimer = 5; 
                            const angle = Math.atan2(p.y - e.y, p.x - e.x);
                            const pushForce = 15;
                            p.vx += Math.cos(angle) * pushForce;
                            p.vy += Math.sin(angle) * pushForce;
                            if (e.config.behavior !== 'boss' && e.config.behavior !== 'turret') {
                                e.vx -= Math.cos(angle) * (pushForce * 0.5);
                                e.vy -= Math.sin(angle) * (pushForce * 0.5);
                            }
                        }
                        if (e.config.behavior === 'balloon') { e.hp = 0; }
                    }
                }
            }
        }

        // --- PROJECTILE COLLISIONS ---
        for (let i = engine.state.projectiles.length - 1; i >= 0; i--) {
            const proj = engine.state.projectiles[i];

            if (proj.z && proj.z > 0) continue;
            if (proj.isFake) continue;

            if (proj.isCaptureBeacon && proj.life > 0) {
                if (SpecialCollisionHandler.handleCaptureBeacon(engine, proj, grid)) {
                    if (proj.life <= 0) { engine.state.projectiles.splice(i, 1); continue; }
                }
                if (proj.life <= 0) { engine.state.projectiles.splice(i, 1); continue; }
            }

            if (proj.summonType === 'code_mountain' && proj.life > 0) {
                SpecialCollisionHandler.handleCodeMountain(engine, proj, grid);
                continue;
            }

            if (proj.isExploding) {
                if (proj.isEnemy) {
                    PlayerHitHandler.checkExplosionHit(engine, proj);
                } else {
                    ExplosionHandler.handle(engine, proj, grid);
                }
                continue;
            }

            let destroyBullet = false;

            if (proj.isEnemy && !proj.isCaptureBeacon) {
                // --- SUMMON MEAT SHIELD LOGIC ---
                // Find nearest summon to bullet from Cached Array
                for (const s of activeSummons) {
                    const d = Math.hypot(s.x - proj.x, s.y - proj.y);
                    const blockRadius = s.radius + proj.radius + 5; // A bit generous for blocking
                    if (d < blockRadius) {
                        // Summon Hit!
                        const dmg = proj.damage;
                        if (s.hp) s.hp -= dmg;
                        
                        // Visuals
                        engine.emit(GameEventType.FLOATING_TEXT, { x: s.x, y: s.y - 10, text: "格挡!", color: "#cbd5e1" });
                        engine.emit(GameEventType.PARTICLE_SPAWN, { x: proj.x, y: proj.y, color: '#ffffff', count: 2 });
                        
                        destroyBullet = true;
                        break;
                    }
                }

                if (!destroyBullet) {
                    destroyBullet = PlayerHitHandler.checkPlayerHit(engine, proj);
                }
            } else if (!proj.isEnemy) {
                destroyBullet = EnemyHitHandler.handle(engine, proj, grid);
            }

            if (destroyBullet && !proj.isExplosive) {
                engine.emit(GameEventType.PARTICLE_SPAWN, { x: proj.x, y: proj.y, color: proj.color, count: 3 });
                proj.life = 0;
            }
        }
    }
};
