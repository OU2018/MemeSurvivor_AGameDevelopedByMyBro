
import { IGameEngine, Zone } from "../../../../types";
import { spawnFloatingText, spawnParticles } from "../../utils";
import { PlayerHitHandler } from "../collision/PlayerHitHandler";

export const CommonZoneLogic = {
    handle: (engine: IGameEngine, z: Zone) => {
        // --- E-01: PIE TRAP ---
        if (z.type === 'pie_trap' && z.life <= 0) {
            // Explosion Logic
            engine.state.zones.push({
                id: Math.random().toString(),
                x: z.x, y: z.y,
                radius: z.radius * 1.2, 
                type: 'explosion_shockwave',
                life: 20, 
                maxLife: 20,
                color: '#fbbf24',
                emoji: ''
            });
            engine.audio.playExplosion();
            
            const p = engine.state.player;
            const dist = Math.hypot(p.x - z.x, p.y - z.y);
            if (dist < z.radius * 1.2 && p.invulnerableTime <= 0) {
                PlayerHitHandler.damagePlayer(engine, 25, 'pie_trap');
                spawnFloatingText(engine, p.x, p.y, "被大饼噎住了!", "#ef4444", 'chat');
                // Knockback
                const angle = Math.atan2(p.y - z.y, p.x - z.x);
                p.vx += Math.cos(angle) * 20;
                p.vy += Math.sin(angle) * 20;
            }
        }

        // --- BOSS AOE EXPLOSION ---
        if (z.type === 'boss_aoe' && z.life <= 0) {
            // Explode - Only for Red Circle (Boss)
            if (z.color !== '#fbbf24') { // Ignore Micro Manager Yellow Zone (which is harmless indicator?)
                // Actually boss_aoe usually triggers a damaging projectile or direct hit
                // Here we spawn a projectile to handle collision/damage
                engine.state.projectiles.push({
                    id: Math.random().toString(),
                    x: z.x, y: z.y,
                    radius: z.radius,
                    emoji: '',
                    vx: 0, vy: 0,
                    damage: 30,
                    life: 5,
                    isEnemy: true,
                    color: '#ef4444',
                    text: '',
                    pierce: 999,
                    hitIds: [],
                    isExplosive: true,
                    isExploding: true,
                    maxExplosionRadius: z.radius,
                    sourceType: 'boss_aoe',
                    active: true
                });
                engine.audio.playExplosion();
            }
        }
    }
};
