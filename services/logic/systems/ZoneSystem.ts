
import { IGameEngine } from "../../../types";
import { spawnFloatingText } from "../utils";
import { PlayerHitHandler } from "./collision/PlayerHitHandler";
import { BossZoneLogic } from "./zones/BossZoneLogic";
import { SkillZoneLogic } from "./zones/SkillZoneLogic";
import { CommonZoneLogic } from "./zones/CommonZoneLogic";

export const ZoneSystem = {
    update: (engine: IGameEngine) => {
        // --- SPECIAL CHECK: KPI HELL FIRE (Global Wipe) ---
        const hellFire = engine.state.zones.find(z => z.type === 'kpi_hell_fire');
        if (hellFire) {
            const p = engine.state.player;
            let isSafe = false;
            
            // Check if player is in ANY safe haven
            for (const z of engine.state.zones) {
                if (z.type === 'safe_haven') {
                    const dist = Math.hypot(p.x - z.x, p.y - z.y);
                    // 180 is visual radius, be generous (200)
                    if (dist < 200) {
                        isSafe = true;
                        break;
                    }
                }
            }

            // Apply True Damage if not safe
            if (!isSafe && engine.state.timeAlive % 30 === 0) { // Every 0.5s (30 frames)
                const damage = 100; // Fixed High Damage
                p.hp -= damage;
                p.lastDamageTime = engine.state.timeAlive; // Visual feedback trigger
                
                // Bypass invulnerability logic in standard handler, but use visual feedback
                spawnFloatingText(engine, p.x, p.y - 20, `-${damage}`, '#ef4444', 'damage');
                engine.audio.playHit();
                
                // Death check handled in PlayerSystem
            }
        }

        // Iterate backwards for safe deletion
        for (let i = engine.state.zones.length - 1; i >= 0; i--) {
            const z = engine.state.zones[i];
            
            // 1. Lifecycle
            if (z.life < 9000) {
                z.life--;
            }

            // 2. Delegate to Specific Logic Handlers
            if (['ai_laser_link', 'glitch_square', 'explosion_gap', 'laser_beam'].includes(z.type)) {
                BossZoneLogic.handle(engine, z);
            } 
            else if (['bsod', 'live_stream', 'firewall_wave', 'slacker_wave', 'coffee_puddle', 'bug_trail'].includes(z.type)) {
                SkillZoneLogic.handle(engine, z);
            }
            else if (['pie_trap', 'boss_aoe'].includes(z.type)) {
                CommonZoneLogic.handle(engine, z);
            }

            // 3. Cleanup
            // Infinite zones (life > 9000) don't expire via life counter
            // Or zones that trigger something on death (handled in handlers usually, but we check <=0 here)
            if (z.life <= 0 && z.life > -9000) { 
                engine.state.zones.splice(i, 1);
            }
        }
    }
};
