
import { IGameEngine, Entity, Projectile } from "../../../types";
import { GameEventType } from "../events/events";

export const MapSystem = {
    // Centralized Map Config
    DEFAULT_WIDTH: 2500,
    DEFAULT_HEIGHT: 2000,

    /**
     * Constrain entity within map boundaries (Physics Clamp)
     * Returns true if entity hit a wall
     */
    constrain: (engine: IGameEngine, entity: Entity & { vx?: number, vy?: number }) => {
        const width = engine.state.mapWidth;
        const height = engine.state.mapHeight;
        
        // Remove Buffer - Exact Edge
        const halfW = width / 2 - entity.radius;
        const halfH = height / 2 - entity.radius;
        
        let hit = false;

        // Hard Clamp: Stop exactly at edge, kill velocity in that direction
        if (entity.x < -halfW) { 
            entity.x = -halfW;
            if(entity.vx !== undefined && entity.vx < 0) entity.vx = 0; 
            hit = true; 
        }
        if (entity.x > halfW) { 
            entity.x = halfW;
            if(entity.vx !== undefined && entity.vx > 0) entity.vx = 0; 
            hit = true; 
        }
        if (entity.y < -halfH) { 
            entity.y = -halfH; 
            if(entity.vy !== undefined && entity.vy < 0) entity.vy = 0; 
            hit = true; 
        }
        if (entity.y > halfH) { 
            entity.y = halfH; 
            if(entity.vy !== undefined && entity.vy > 0) entity.vy = 0; 
            hit = true; 
        }
        
        return hit;
    },

    /**
     * Screen Wrapping for Pacman
     * If entity goes out one side, it appears on the other.
     */
    wrap: (engine: IGameEngine, entity: Entity) => {
        const width = engine.state.mapWidth;
        const height = engine.state.mapHeight;
        
        // Wrap X
        if (entity.x < -width / 2) {
            entity.x = width / 2;
        } else if (entity.x > width / 2) {
            entity.x = -width / 2;
        }
        
        // Wrap Y
        if (entity.y < -height / 2) {
            entity.y = height / 2;
        } else if (entity.y > height / 2) {
            entity.y = -height / 2;
        }
    },

    /**
     * Check projectile against boundaries
     * Handles destruction or explosion on impact
     */
    checkProjectile: (engine: IGameEngine, proj: Projectile) => {
        if (proj.isExploding) {
            return;
        }

        const width = engine.state.mapWidth;
        const height = engine.state.mapHeight;
        
        const halfW = width / 2 - proj.radius;
        const halfH = height / 2 - proj.radius;

        let hitWall = false;
        
        if (proj.x < -halfW) { proj.x = -halfW; hitWall = true; }
        else if (proj.x > halfW) { proj.x = halfW; hitWall = true; }
        else if (proj.y < -halfH) { proj.y = -halfH; hitWall = true; }
        else if (proj.y > halfH) { proj.y = halfH; hitWall = true; }

        if (hitWall) {
            if (proj.explodeOnExpire || proj.isExplosive) {
                if (!proj.isExploding) {
                    proj.isExploding = true;
                    proj.life = 15; 
                    proj.vx = 0; 
                    proj.vy = 0;
                    
                    if (!proj.isEnemy && (engine.state.player.characterId === '007' || engine.state.player.characterId === 'ev_creator')) {
                        proj.renderStyle = 'cyber_explosion';
                    }

                    engine.emit(GameEventType.PROJECTILE_EXPLODE, {
                        x: proj.x, 
                        y: proj.y,
                        radius: proj.maxExplosionRadius,
                        style: proj.renderStyle,
                        isCyber: proj.renderStyle === 'cyber_explosion' || (!proj.isEnemy && (engine.state.player.characterId === '007' || engine.state.player.characterId === 'ev_creator'))
                    });
                }
            } 
            else {
                proj.life = 0;
                engine.emit(GameEventType.WALL_HIT, { 
                    x: proj.x, 
                    y: proj.y, 
                    color: proj.color 
                });
            }
        }
    },

    /**
     * Check and handle collision against solid internal obstacles (e.g. BSOD Walls)
     * Updated to support ROTATED RECTANGLES vs CIRCLE
     */
    checkObstacles: (engine: IGameEngine, entity: Entity & { vx?: number, vy?: number }) => {
        // Only check against BSOD walls for now
        const walls = engine.state.zones.filter(z => z.type === 'glitch_bsod_wall');
        
        for (const w of walls) {
            // Wall Dimensions
            const width = w.width || 100;
            const height = w.height || 60;
            const halfW = width / 2;
            const halfH = height / 2;
            const angle = w.angle || 0;

            // 1. Transform Entity (Circle) center into Wall's Local Space
            // Translate
            const dx = entity.x - w.x;
            const dy = entity.y - w.y;

            // Rotate by -angle to align wall with axes
            const cos = Math.cos(-angle);
            const sin = Math.sin(-angle);
            const localX = dx * cos - dy * sin;
            const localY = dx * sin + dy * cos;

            // 2. Find closest point on the AABB to the circle center (in local space)
            const closestX = Math.max(-halfW, Math.min(localX, halfW));
            const closestY = Math.max(-halfH, Math.min(localY, halfH));

            // 3. Calculate distance in local space
            const distX = localX - closestX;
            const distY = localY - closestY;
            const distanceSquared = distX * distX + distY * distY;

            // 4. Check collision
            // Collision radius: entity.radius
            if (distanceSquared < entity.radius * entity.radius) {
                // Collision detected
                const distance = Math.sqrt(distanceSquared);
                
                // Normal vector in local space
                let normalX = 0;
                let normalY = 0;
                
                if (distance === 0) {
                    // Center is exactly inside, push out along smallest axis
                    if (Math.abs(localX) / halfW > Math.abs(localY) / halfH) {
                         normalX = localX > 0 ? 1 : -1;
                    } else {
                         normalY = localY > 0 ? 1 : -1;
                    }
                } else {
                    normalX = distX / distance;
                    normalY = distY / distance;
                }

                const overlap = entity.radius - distance;

                // 5. Transform normal back to World Space
                const worldCos = Math.cos(angle);
                const worldSin = Math.sin(angle);
                
                const worldNormalX = normalX * worldCos - normalY * worldSin;
                const worldNormalY = normalX * worldSin + normalY * worldCos;

                // 6. Resolve
                entity.x += worldNormalX * overlap;
                entity.y += worldNormalY * overlap;
                
                // Friction/Bounce
                if (entity.vx !== undefined) entity.vx *= 0.5;
                if (entity.vy !== undefined) entity.vy *= 0.5;
            }
        }
    }
};
