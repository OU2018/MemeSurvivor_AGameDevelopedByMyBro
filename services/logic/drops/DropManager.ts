
import { IGameEngine } from "../../../types";
import { DROP_CONFIG } from "./DropConstants";
import { spawnFloatingText } from "../utils";

export const DropManager = {
    update: (engine: IGameEngine) => {
        const p = engine.state.player;
        const drops = engine.state.drops;
        const isWaveClearing = engine.state.isWaveClearing;

        // --- 1. VACUUM / RECYCLING LOGIC ---
        // If too many drops, force oldest to vacuum mode
        if (drops.length > DROP_CONFIG.MAX_GLOBAL_DROPS) {
             // Find first non-vacuuming drop
             const oldest = drops.find(d => !d.isVacuuming);
             if (oldest) {
                 oldest.isVacuuming = true;
             } else {
                 // If all are vacuuming, hard clip excess
                 drops.shift();
             }
        }

        // --- 2. UPDATE LOOP ---
        // Iterate backwards for safe splicing
        for (let i = drops.length - 1; i >= 0; i--) {
            const d = drops[i];

            // Initialize vacuum timer if needed
            if (d.isVacuuming && d.vacuumTimer === undefined) {
                d.vacuumTimer = 60; // 1 second life
            }

            // A. Physics
            if (d.vx !== undefined && d.vy !== undefined) {
                if (d.isVacuuming) {
                    // No friction in vacuum mode
                    d.x += d.vx;
                    d.y += d.vy;
                } else {
                    const friction = d.friction || 0.9;
                    d.vx *= friction;
                    d.vy *= friction;
                    
                    if (Math.abs(d.vx) < 0.1) d.vx = 0;
                    if (Math.abs(d.vy) < 0.1) d.vy = 0;
                    
                    d.x += d.vx;
                    d.y += d.vy;
                }
            }

            // B. Timers & Lifecycle
            if (d.pickupDelay && d.pickupDelay > 0) {
                d.pickupDelay--;
            }

            // Vacuum Timeout (Fail-safe)
            if (d.isVacuuming) {
                 d.vacuumTimer!--;
                 if (d.vacuumTimer! <= 0) {
                     // Auto-collect if close enough, else delete
                     // If it hasn't reached player by then, delete it
                     drops.splice(i, 1);
                     continue;
                 }
            } else if (!isWaveClearing) {
                d.life--;
                if (d.life <= 0) {
                    // Trigger vacuum instead of death
                    d.isVacuuming = true;
                }
            }

            // C. Magnet Logic
            const dx = p.x - d.x;
            const dy = p.y - d.y;
            const distSq = dx*dx + dy*dy;
            const dist = Math.sqrt(distSq);

            // Base Magnet Range
            let magnetRange = (d.type === 'gold' ? 180 : 150);
            // Wave Clear or Forced Vacuum means infinite range
            if (isWaveClearing || d.isVacuuming) magnetRange = Infinity;

            if (dist < magnetRange && (!d.pickupDelay || d.pickupDelay <= 0)) {
                let shouldMove = false;
                if (isWaveClearing || d.isVacuuming || d.type === 'gold' || d.type === 'love_heart') shouldMove = true;
                else if (d.type.includes('health') && p.hp < p.maxHp) shouldMove = true;

                if (shouldMove) {
                    let accel = 2.0;
                    let maxSpeed = 40;

                    if (d.isVacuuming || isWaveClearing) {
                        accel = 5.0; // Aggressive accel
                        // Override velocity vector to point directly at player
                        // "Vacuum" means getting sucked in, not orbiting
                        const speed = 25;
                        d.vx = (dx / dist) * speed;
                        d.vy = (dy / dist) * speed;
                    } else {
                        // Normal Magnet (Add Force)
                        const forceFactor = Math.min(20, 800 / (dist + 10));
                        accel *= forceFactor;
                        const dirX = dx / (dist || 1);
                        const dirY = dy / (dist || 1);
                        d.vx = (d.vx || 0) + dirX * accel;
                        d.vy = (d.vy || 0) + dirY * accel;
                        
                        // Cap speed
                        const currentSpeed = Math.hypot(d.vx, d.vy);
                        if (currentSpeed > maxSpeed) {
                            d.vx = (d.vx / currentSpeed) * maxSpeed;
                            d.vy = (d.vy / currentSpeed) * maxSpeed;
                        }
                    }
                }
            }

            // D. Collision (Pickup)
            const pickupRadius = (isWaveClearing || d.isVacuuming) ? p.radius + d.radius + 80 : p.radius + d.radius + 10;

            if (dist < pickupRadius && (!d.pickupDelay || d.pickupDelay <= 0)) {
                let picked = false;

                if (d.type === 'gold') {
                    p.gold += d.value;
                    engine.state.waveStats.goldEarned += d.value;
                    engine.audio.playCoin();
                    // Removed Floating Text for Gold
                    // if (d.value >= 100) spawnFloatingText(...) 
                    picked = true;
                }
                else if (d.type === 'health') {
                    if (p.hp < p.maxHp) {
                        p.hp = Math.min(p.maxHp, p.hp + d.value);
                        p.lastHealTime = engine.state.timeAlive;
                        spawnFloatingText(engine, p.x, p.y, `+${d.value}`, '#22c55e');
                        picked = true;
                    }
                }
                else if (d.type === 'big_health') {
                    if (p.hp < p.maxHp) {
                        p.hp = Math.min(p.maxHp, p.hp + d.value);
                        p.lastHealTime = engine.state.timeAlive;
                        spawnFloatingText(engine, p.x, p.y, `+${d.value}!!`, '#22c55e');
                        picked = true;
                    }
                }
                else if (d.type === 'love_heart') {
                    p.shield += d.value;
                    spawnFloatingText(engine, p.x, p.y, `护盾+${d.value}`, '#f472b6');
                    picked = true;
                }

                if (picked) {
                    if (d.type !== 'gold') engine.audio.playPowerup();
                    drops.splice(i, 1);
                    continue;
                }
            }
        }
    }
};
