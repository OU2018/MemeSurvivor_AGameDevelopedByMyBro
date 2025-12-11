
import { IGameEngine } from "../../../types";
import { MapSystem } from "../systems/MapSystem";
import { spawnParticles } from "../utils";

export const PlayerMovement = {
    checkInput: (engine: IGameEngine): boolean => {
        let dx = engine.joystickInput.move.x;
        let dy = engine.joystickInput.move.y;

        if (dx === 0 && dy === 0) {
            if (engine.keysPressed['w'] || engine.keysPressed['arrowup']) dy -= 1;
            if (engine.keysPressed['s'] || engine.keysPressed['arrowdown']) dy += 1;
            if (engine.keysPressed['a'] || engine.keysPressed['arrowleft']) dx -= 1;
            if (engine.keysPressed['d'] || engine.keysPressed['arrowright']) dx += 1;
        }
        return dx !== 0 || dy !== 0;
    },

    update: (engine: IGameEngine, isMoving: boolean, speedMultiplier: number) => {
        const p = engine.state.player;

        // 1. Get Input Vector
        let dx = engine.joystickInput.move.x;
        let dy = engine.joystickInput.move.y;

        if (dx === 0 && dy === 0) {
            if (engine.keysPressed['w'] || engine.keysPressed['arrowup']) dy -= 1;
            if (engine.keysPressed['s'] || engine.keysPressed['arrowdown']) dy += 1;
            if (engine.keysPressed['a'] || engine.keysPressed['arrowleft']) dx -= 1;
            if (engine.keysPressed['d'] || engine.keysPressed['arrowright']) dx += 1;
        }

        // 2. Zone Interactions
        let zoneSpeedMod = 1.0;
        for (const zone of engine.state.zones) {
            if (zone.type === 'acid' || zone.type === 'acid_trail') {
                const dist = Math.hypot(zone.x - p.x, zone.y - p.y);
                if (dist < zone.radius) {
                    zoneSpeedMod = 0.4;
                    if (Math.random() < 0.1) {
                        spawnParticles(engine, p.x, p.y, '#a3e635', 1);
                    }
                }
            }
        }

        // Update facing direction if moving
        if (isMoving) {
            p.facingAngle = Math.atan2(dy, dx);
        }

        // 3. Apply Velocity (Standard)
        if (isMoving) {
            const len = Math.sqrt(dx*dx + dy*dy);
            const scale = len > 1 ? 1 / len : 1; 
            p.x += (dx * scale) * p.speed * zoneSpeedMod * speedMultiplier;
            p.y += (dy * scale) * p.speed * zoneSpeedMod * speedMultiplier;
        }

        // 4. Inertia / Physics
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.85;
        p.vy *= 0.85;
        if (Math.abs(p.vx) < 0.1) p.vx = 0;
        if (Math.abs(p.vy) < 0.1) p.vy = 0;

        // 5. Mop Angle Update (Cleaner)
        if (p.characterId === 'cleaner') {
            let targetAngle = p.mopAngle || 0;
            const aimX = engine.joystickInput.aim.x;
            const aimY = engine.joystickInput.aim.y;
            if (Math.abs(aimX) > 0.1 || Math.abs(aimY) > 0.1) {
                targetAngle = Math.atan2(aimY, aimX);
            } else {
                targetAngle = Math.atan2(engine.mousePos.y - p.y, engine.mousePos.x - p.x);
            }
            let diff = targetAngle - p.mopAngle;
            while (diff > Math.PI) diff -= 2 * Math.PI;
            while (diff < -Math.PI) diff += 2 * Math.PI;
            p.mopAngle += diff * 0.15; 
        }

        // 6. Constraints & Obstacles
        MapSystem.constrain(engine, p);
        MapSystem.checkObstacles(engine, p); 
        
        // --- CRITICAL NAN SAFEGUARD ---
        if (isNaN(p.x) || isNaN(p.y)) {
            console.warn("Player position NaN detected! Resetting to center.");
            p.x = 0;
            p.y = 0;
            p.vx = 0;
            p.vy = 0;
        }
    }
};
