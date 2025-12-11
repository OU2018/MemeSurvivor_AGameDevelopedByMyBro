
import { IGameEngine } from "../../../types";
import { spawnFloatingText, spawnParticles } from "../utils";

export const ReviveSystem = {
    update: (engine: IGameEngine): boolean => {
        const state = engine.state.reviveSequence;
        if (!state.active) return false;

        state.timer++;

        // PHASE 1: SYSTEM FREEZE (FATAL ERROR)
        // 0-20: Instant stop, red glitch
        if (state.phase === 'start') {
            if (state.timer === 1) {
                // Sound: Glitch Stop
                engine.audio.play('revive_error'); 
            }

            if (state.timer > 20) {
                state.phase = 'coin_enter'; // This is now "Injection Phase"
                state.timer = 0;
                // Sound: Data Stream / Injection
                engine.audio.play('revive_inject'); 
            }
        }
        
        // PHASE 2: INJECTION (The "Singularity" & Data Drain)
        // 0-100: Assets draining into the center glitch core
        else if (state.phase === 'coin_enter') {
            // Typing sounds for the console logs happening in renderer
            if (state.timer % 5 === 0 && state.timer < 60) {
                engine.audio.play('ui_typewriter');
            }

            // Trigger REBOOT
            if (state.timer > 120) {
                state.phase = 'shatter'; // This is now "Hard Reboot"
                state.timer = 0;
            }
        }

        // PHASE 3: REBOOT (System Override)
        else if (state.phase === 'shatter') {
            if (state.timer === 1) {
                // --- LOGIC: RESTORE PLAYER ---
                const p = engine.state.player;
                
                // 1. Consume Gold (Logic commit)
                p.gold = 0; 
                
                // 2. Restore Stats
                p.hp = Math.floor(p.maxHp * 0.5); // Restore 50% HP
                p.isDying = false; 
                p.invulnerableTime = 180; // 3 seconds invulnerability
                
                // 3. Push Back Enemies (Survival Space)
                engine.state.enemies.forEach(e => {
                    const dist = Math.hypot(e.x - p.x, e.y - p.y);
                    if (dist < 800) {
                        const angle = Math.atan2(e.y - p.y, e.x - p.x);
                        e.vx += Math.cos(angle) * 40;
                        e.vy += Math.sin(angle) * 40;
                        e.stunTimer = 120; // 2s Stun
                    }
                });

                // 4. Clear Enemy Projectiles
                engine.state.projectiles = engine.state.projectiles.filter(proj => !proj.isEnemy);

                // --- AUDIO & VISUALS ---
                engine.audio.play('revive_reboot'); // Heavy Bass Drop
                
                // World Particles (Pixel Blast)
                spawnParticles(engine, p.x, p.y, '#00ffff', 100);
                spawnFloatingText(engine, p.x, p.y - 120, "SYSTEM RESTORED", "#00ffff", 'chat');
                
                // Create a shockwave zone (Visual + Physics backup)
                engine.state.zones.push({
                    id: Math.random().toString(),
                    x: p.x, y: p.y,
                    radius: 1200, // Screen wide
                    type: 'explosion_shockwave',
                    life: 45,
                    maxLife: 45,
                    color: '#00ffff', // Cyan
                    emoji: ''
                });
            }

            if (state.timer > 60) {
                state.phase = 'cleanup';
                state.timer = 0;
            }
        }

        // PHASE 4: CLEANUP (Fade out overlay)
        else if (state.phase === 'cleanup') {
            if (state.timer > 30) {
                state.active = false;
                state.phase = 'start';
                state.timer = 0;
                
                // Resume BGM if needed
                engine.audio.playBattleBGM();
            }
        }

        return true; // Block other game updates while reviving
    }
};
