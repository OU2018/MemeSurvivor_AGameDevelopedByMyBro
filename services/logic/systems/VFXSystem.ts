
import { IGameEngine } from "../../../types";
import { GameEventType } from "../events/events";
import { spawnFloatingText, spawnParticles, emitParticles } from "../utils";

export const VFXSystem = {
    handleEvent: (engine: IGameEngine, type: GameEventType, data: any = {}) => {
        const { x, y } = data;

        switch (type) {
            // --- COMBAT SOUNDS ---
            case GameEventType.PLAYER_SHOOT:
                engine.audio.play('player_shoot');
                break;
            
            case GameEventType.ENEMY_SHOOT:
                engine.audio.playEnemyShoot(data.enemyType);
                break;

            case GameEventType.PROJECTILE_EXPLODE:
                // Handle Cyberpunk vs Normal explosion sounds/visuals
                if (data.style === 'cyber_explosion' || data.isCyber) {
                    engine.audio.playCyberExplosion();
                    // Additional screen shake or flash could go here
                } else {
                    engine.audio.playExplosion();
                }
                // Trigger explosion zone particles if needed (handled by renderer mostly, but we can add debris)
                if (data.radius > 50 && engine.settings.screenShake) {
                    engine.state.camera.x += (Math.random() - 0.5) * 5;
                    engine.state.camera.y += (Math.random() - 0.5) * 5;
                }
                break;

            case GameEventType.ENTITY_HIT:
                // Standard hit feedback
                if (data.isPlayer) {
                    engine.audio.playHit();
                } else {
                    // Enemy hit sound could be added here
                }
                break;

            case GameEventType.PLAYER_HURT:
                engine.audio.playHit();
                spawnFloatingText(engine, x, y, "痛!", "#ef4444");
                // Camera Shake
                if (engine.settings.screenShake) {
                    engine.state.camera.x += (Math.random() - 0.5) * 20;
                    engine.state.camera.y += (Math.random() - 0.5) * 20;
                }
                break;

            case GameEventType.SHIELD_BREAK:
                engine.audio.playShieldBreak();
                spawnFloatingText(engine, x, y, "破盾!", "#3b82f6");
                spawnParticles(engine, x, y, '#3b82f6', 10);
                break;

            case GameEventType.WALL_HIT:
                // Subtle tick sound for wall hit using existing short click sound
                engine.audio.play('ui_typewriter'); 
                // Spark effect
                emitParticles(engine, {
                    x: x, y: y, 
                    color: data.color || '#ffffff', 
                    count: 4,
                    type: 'spark',
                    speed: 2,
                    life: 15,
                    blendMode: 'lighter'
                });
                break;

            // --- VISUALS ---
            case GameEventType.ENTITY_DAMAGED:
                // Damage Numbers (Now with Accumulation support via targetId)
                spawnFloatingText(
                    engine, 
                    x, 
                    y, 
                    data.text, 
                    data.color || '#fbbf24', 
                    data.isCrit ? 'damage' : 'damage',
                    data.targetId // Pass targetId for accumulation
                );
                break;

            case GameEventType.ENTITY_DIE:
                // Death explosion
                spawnParticles(engine, x, y, data.color || '#ffffff', 8);
                break;

            case GameEventType.FLOATING_TEXT:
                spawnFloatingText(engine, x, y, data.text, data.color, data.category);
                break;

            case GameEventType.PARTICLE_SPAWN:
                spawnParticles(engine, x, y, data.color, data.count);
                break;

            case GameEventType.ITEM_PICKUP:
                engine.audio.playPowerup();
                break;
        }
    }
};
