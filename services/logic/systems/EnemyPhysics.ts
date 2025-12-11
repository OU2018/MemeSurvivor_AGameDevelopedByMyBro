
import { IGameEngine } from "../../../types";
import { spawnFloatingText, spawnParticles, PoolUtils } from "../../utils";
import { damagePlayer } from "../../battleLogic";
import { SkillSystem } from "../battle/skillSystem";
import { EliteManagerConfig } from "../battle/special/EliteManagerConfig";
import { MapSystem } from "./MapSystem";
import { SpatialHashGrid } from "../../utils/SpatialGrid";

export const EnemyPhysics = {
    // ... [Previous handleCaptureState remains unchanged]
    handleCaptureState: (engine: IGameEngine, e: any): boolean => {
        if (e.captureState === 'latched') {
            const p = engine.state.player;
            if (!e.latchOffset) {
                e.latchOffset = {
                    x: (Math.random() - 0.5) * 20,
                    y: (Math.random() - 0.5) * 20
                };
            }
            e.x = p.x + e.latchOffset.x;
            e.y = p.y + e.latchOffset.y;
            e.vx = 0; 
            e.vy = 0;
            return true;
        }
        if (e.captureState && e.captureState !== 'free' && e.captureTargetId) {
            const owner = engine.state.enemies.find((o: any) => o.id === e.captureTargetId);
            if (!owner) {
                e.captureState = 'free';
                e.captureTargetId = undefined;
                e.vx = (Math.random() - 0.5) * 10; 
                e.vy = (Math.random() - 0.5) * 10;
                spawnFloatingText(engine, e.x, e.y - e.radius - 20, "自由!", "#ffffff", 'chat');
            }
        }
        if (e.captureState === 'orbiting' || e.linkedById) {
            return true; 
        }
        if (e.captureState === 'targeted') {
            e.vx *= 0.9; e.vy *= 0.9;
            e.x += e.vx; e.y += e.vy;
            return true;
        }
        if (e.captureState === 'being_dragged') {
            const capturer = engine.state.enemies.find((boss: any) => boss.id === e.captureTargetId);
            if (capturer) {
                const dx = capturer.x - e.x;
                const dy = capturer.y - e.y;
                const dist = Math.hypot(dx, dy);
                const dragSpeed = EliteManagerConfig.Combat.dragSpeed; 
                if (dist > 140) { 
                    e.x += (dx / dist) * dragSpeed;
                    e.y += (dy / dist) * dragSpeed;
                    e.vx = 0; e.vy = 0; 
                } else {
                    e.captureState = 'orbiting';
                    e.x = capturer.x + (dx/dist)*140; 
                    e.y = capturer.y + (dy/dist)*140;
                }
            } else {
                e.captureState = 'free';
                e.captureTargetId = undefined;
            }
            return true; 
        }
        return false;
    },

    // ... [Previous handleBossTransition & updateThrownState unchanged]
    handleBossTransition: (engine: IGameEngine, e: any): boolean => {
        if (e.isTransitioning) {
            e.stateTimer = (e.stateTimer || 0) - 1;
            e.vx = 0; e.vy = 0;
            if (e.config.behavior === 'boss') {
                e.radius = 70 * 2.0 + (70 * 2.0) * (1 - (e.stateTimer! / 180)); 
            }
            if ((e.stateTimer || 0) <= 0) {
                e.isTransitioning = false;
                e.phase = 2;
                e.hp = e.maxHp;
                e.emoji = '👿';
                e.radius = 70 * 4.0;
                e.subState = 'normal'; 
                e.stateTimer = 0;
                spawnFloatingText(engine, e.x, e.y - e.radius - 20, "暴走模式!!!", "#ef4444", 'chat');
            }
            return true;
        }
        return false;
    },

    updateThrownState: (engine: IGameEngine, e: any, p: any, dmgMult: number): boolean => {
        if (!e.isThrown) return false;
        e.x += e.vx; e.y += e.vy;
        spawnParticles(engine, e.x, e.y, '#f59e0b', 2); 
        if (engine.state.timeAlive % 4 === 0) {
             engine.state.zones.push({
                 id: Math.random().toString(),
                 x: e.x, y: e.y,
                 radius: e.radius * 0.8,
                 type: 'scorch',
                 life: 120, maxLife: 120, color: '#1c1917', emoji: ''
             });
        }
        const pdx = p.x - e.x;
        const pdy = p.y - e.y;
        const pdist = Math.sqrt(pdx*pdx + pdy*pdy);
        if (pdist < e.radius + p.radius && p.invulnerableTime <= 0) {
             const damage = 40 * dmgMult; 
             const hitAngle = Math.atan2(pdy, pdx);
             const knockbackForce = 30;
             p.vx += Math.cos(hitAngle) * knockbackForce;
             p.vy += Math.sin(hitAngle) * knockbackForce;
             damagePlayer(engine, damage, 'elite_manager_thrown');
             spawnFloatingText(engine, p.x, p.y, "重击!", "#ef4444", 'damage');
             spawnParticles(engine, p.x, p.y, '#ef4444', 20);
             engine.audio.playExplosion();
             e.hp = 0; 
             const idx = engine.state.enemies.indexOf(e);
             if (idx > -1) engine.state.enemies.splice(idx, 1);
             return true;
        }
        engine.state.enemies.forEach((other: any) => {
            if (other === e || other.isThrown || other.config.behavior === 'boss' || other.config.type === 'elite_manager') return;
            const dx = other.x - e.x; const dy = other.y - e.y;
            const dist = Math.hypot(dx, dy);
            const pushRange = e.radius + other.radius + 100;
            if (dist < pushRange) {
                let pushDirX = dx / dist; let pushDirY = dy / dist;
                if (dist === 0) { pushDirX = 1; pushDirY = 0; }
                const intensity = 1 - (dist / pushRange);
                const pushForce = 20 * intensity;
                other.vx += pushDirX * pushForce; other.vy += pushDirY * pushForce;
                other.stunTimer = Math.max(other.stunTimer || 0, 20);
            }
        });
        const width = engine.state.mapWidth;
        const height = engine.state.mapHeight;
        if (Math.abs(e.x) > width/2 + 300 || Math.abs(e.y) > height/2 + 300) {
            e.hp = 0; const idx = engine.state.enemies.indexOf(e);
            if (idx > -1) engine.state.enemies.splice(idx, 1);
        }
        return true;
    },

    updateMovement: (engine: IGameEngine, e: any, p: any, dist: number, dx: number, dy: number, hasBrainDrain: boolean) => {
        let moveSpeed = e.config.speed;
        if (hasBrainDrain && dist < 350) {
            moveSpeed *= 0.4; 
            if (Math.random() < 0.1) {
                spawnParticles(engine, e.x, e.y, '#a855f7', 1); 
                spawnFloatingText(engine, e.x, e.y - e.radius - 10, "?", "#a855f7");
            }
        }

        let moveX = dx / dist;
        let moveY = dy / dist;

        // Minion/Bonus/Balloon Random Walk
        if (e.config.behavior === 'bonus' || e.config.behavior === 'minion' || e.config.behavior === 'balloon') {
             e.stateTimer = (e.stateTimer || 0) - 1;
             
             if (e.config.behavior === 'balloon') {
                 e.vx = moveX * e.config.speed;
                 e.vy = moveY * e.config.speed;
                 e.x += e.vx;
                 e.y += e.vy;
                 MapSystem.constrain(engine, e); 
                 MapSystem.checkObstacles(engine, e); 
                 return; 
             }

             if (e.stateTimer <= 0) {
                 const angle = Math.random() * Math.PI * 2;
                 e.vx = Math.cos(angle) * e.config.speed;
                 e.vy = Math.sin(angle) * e.config.speed;
                 e.stateTimer = 60 + Math.floor(Math.random() * 60); 
             }

             if (e.config.behavior === 'minion' && dist < 300 && Math.random() < 0.02) {
                  const angle = Math.atan2(p.y - e.y, p.x - e.x);
                  e.vx = Math.cos(angle) * e.config.speed;
                  e.vy = Math.sin(angle) * e.config.speed;
             }

             const margin = 200;
             if (e.x < -engine.MAP_WIDTH/2 + margin) e.vx += 0.5;
             if (e.x > engine.MAP_WIDTH/2 - margin) e.vx -= 0.5;
             if (e.y < -engine.MAP_HEIGHT/2 + margin) e.vy += 0.5;
             if (e.y > engine.MAP_HEIGHT/2 - margin) e.vy -= 0.5;

             const currentSpeed = Math.sqrt(e.vx*e.vx + e.vy*e.vy);
             if (currentSpeed > e.config.speed) {
                 e.vx = (e.vx / currentSpeed) * e.config.speed;
                 e.vy = (e.vy / currentSpeed) * e.config.speed;
             }

             e.x += e.vx; e.y += e.vy;
             
             MapSystem.constrain(engine, e);
             MapSystem.checkObstacles(engine, e); 
             return;
        }

        if (e.config.behavior === 'boss' && e.phase === 2) {
            moveSpeed *= 1.5;
        }

        if ((e.config.behavior === 'shooter' || e.config.behavior === 'support' || e.config.behavior === 'spawner' || e.config.behavior === 'summoner_orbit') && dist < 400) {
            moveSpeed *= 0.2; 
            moveX = -moveX;
            moveY = -moveY;
        } 
        else if (e.config.behavior === 'boss') {
            // FIX: Prevent movement AI from overwriting active skill movement (e.g. Glitch Boss Dash)
            if (e.customVars && e.customVars.activeSkill) {
                // Skip movement logic, allow SkillSystem to control e.vx/e.vy
                e.x += e.vx;
                e.y += e.vy;
                MapSystem.constrain(engine, e);
                return;
            }

            if (e.phase === 2 && (e.subState === 'moving_center' || e.subState === 'prepping')) {
                const dToCenter = Math.hypot(e.x, e.y);
                if (dToCenter > 10) {
                    const angle = Math.atan2(-e.y, -e.x);
                    e.vx = Math.cos(angle) * (e.config.speed * 3); 
                    e.vy = Math.sin(angle) * (e.config.speed * 3);
                } else {
                    e.vx = 0; e.vy = 0;
                }
                e.x += e.vx;
                e.y += e.vy;
                return; 
            }
            
            moveSpeed *= 0.8; 
            if (e.warningTimer && e.warningTimer > 0) {
                e.vx = 0; 
                e.vy = 0;
                e.warningTimer--;
                if (e.warningTimer <= 0) {
                    e.dashTimer = 60; 
                    const targetX = e.dashTarget ? e.dashTarget.x : p.x;
                    const targetY = e.dashTarget ? e.dashTarget.y : p.y;
                    const dashAngle = Math.atan2(targetY - e.y, targetX - e.x);
                    e.vx = Math.cos(dashAngle) * e.config.speed * 8; 
                    e.vy = Math.sin(dashAngle) * e.config.speed * 8;
                }
            } else if (e.dashTimer && e.dashTimer > 0) {
                 e.dashTimer--;
            } else {
                e.vx = moveX * moveSpeed;
                e.vy = moveY * moveSpeed;
            }
        }
        else if (e.config.type === 'river_crab') {
            if (!e.stateTimer) e.stateTimer = 0; e.stateTimer++;
            moveY = dy / dist; moveX = Math.sin(e.stateTimer / 20) * 1.5; moveSpeed = e.config.speed;
        }
        else if (e.config.behavior === 'tank') {
            moveSpeed *= 0.8;
        }
        else if (e.config.behavior === 'circle') {
            SkillSystem.handleCircleDash(engine, e, p, dist, dx, dy, moveSpeed);
        }
        else if (e.config.behavior === 'turret') {
            moveSpeed = 0;
        }
        
        // Apply Velocity
        if (e.config.behavior !== 'circle' && e.config.type !== 'river_crab' && (e.config.behavior !== 'boss' || ((e.dashTimer || 0) <= 0 && (e.warningTimer || 0) <= 0))) {
           if (e.config.type === 'elite_hr' && (e.isAimingDash || (e.dashTimer && e.dashTimer > 0))) {
               // Dashing handled in EliteHR
           } else {
               e.vx = moveX * moveSpeed;
               e.vy = moveY * moveSpeed;
           }
        }
        
        if (e.config.type === 'river_crab') {
            e.vx = moveX * moveSpeed;
            e.vy = moveY * moveSpeed * 0.3; 
        }
        
        if (e.config.behavior !== 'circle') {
           e.x += e.vx;
           e.y += e.vy;
        } else {
           e.x += e.vx;
           e.y += e.vy;
           MapSystem.constrain(engine, e);
           return;
        }

        // Apply obstacle collision for standard enemies
        if (e.config.behavior !== 'boss') {
            MapSystem.checkObstacles(engine, e);
        }
    }
};
