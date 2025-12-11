
import { IGameEngine, Projectile } from "../../../types";
import { SpatialHashGrid } from "../../utils/SpatialGrid";
import { GameEventType } from "../../events/events";
import { killEnemy } from "../../battle/enemySystem";

export const SpecialCollisionHandler = {
    handleCaptureBeacon: (engine: IGameEngine, proj: Projectile, grid: SpatialHashGrid): boolean => {
        const neighbors = grid.query(proj.x, proj.y);
        let hit = false;
        
        for (const e of neighbors) {
            if (e.id === proj.sourceType) continue; 
            if (e.captureState === 'targeted') {
                if (proj.targetId && e.id !== proj.targetId) continue;
            } else if (e.captureState) continue; 
            if (e.linkedById) continue; 
            if (e.config.behavior === 'boss') continue; 
            if (e.config.type === 'elite_manager') continue; 
            if (e.isThrown) continue; 

            const dist = Math.hypot(proj.x - e.x, proj.y - e.y);
            if (dist < proj.radius + e.radius) {
                e.captureState = 'being_dragged';
                e.captureTargetId = proj.sourceType;
                engine.emit(GameEventType.FLOATING_TEXT, { x: e.x, y: e.y, text: "被捕!", color: "#a855f7", category: 'chat' });
                proj.life = 0; 
                hit = true;
                break;
            }
        }
        return hit;
    },

    handleCodeMountain: (engine: IGameEngine, proj: Projectile, grid: SpatialHashGrid) => {
        const neighbors = grid.query(proj.x, proj.y);
        for(const e of neighbors) {
            const dx = e.x - proj.x;
            const dy = e.y - proj.y;
            const dist = Math.hypot(dx, dy);
            if (dist < proj.radius + e.radius) {
                e.vx *= 0.5; e.vy *= 0.5;
                if (dist > 0) { e.x += dx/dist * 0.5; e.y += dy/dist * 0.5; }
                if (engine.state.timeAlive % 20 === 0) {
                    e.hp -= proj.damage;
                    engine.emit(GameEventType.ENTITY_DAMAGED, { x: e.x, y: e.y, text: `-${proj.damage}`, color: '#84cc16', isCrit: false, targetId: e.id });
                    if (proj.hp !== undefined) { proj.hp -= 5; if (proj.hp <= 0) proj.life = 0; }
                    if (e.hp <= 0) { const idx = engine.state.enemies.indexOf(e); if (idx > -1) killEnemy(engine, idx); }
                }
            }
        }
    }
};
