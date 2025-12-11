
import { GameState } from "../../../types";
import { ViewBounds } from "../renderConfig";
import { renderBossZones } from "./zones/bossZones";
import { renderCommonZones } from "./zones/commonZones";
import { renderOverlayZones } from "./zones/overlayZones";
import { renderTechZones } from "./zones/renderTechZones";

export const ZoneRenderer = {
    renderZones(ctx: CanvasRenderingContext2D, state: GameState, bounds: ViewBounds) {
        
        // --- PASS 1: Base Zones (Floor) ---
        state.zones.forEach(z => {
            // Skip Overlays
            if (z.type === 'kpi_hell_fire' || z.type === 'warning_circle' || z.type === 'safe_haven') return;

            // Frustum Culling (Skip for long beams or global effects)
            if (z.type !== 'laser_beam' && z.type !== 'kpi_doom_expansion' && z.type !== 'firewall_rotate' && z.type !== 'ai_laser_link') {
                if (z.x + z.radius < bounds.minX || z.x - z.radius > bounds.maxX ||
                    z.y + z.radius < bounds.minY || z.y - z.radius > bounds.maxY) {
                    return;
                }
            }

            // Boss Specific Zones
            if (['ai_laser_link', 'glitch_square', 'glitch_bsod_wall', 'glitch_lag_marker', 'explosion_gap', 'kpi_doom_expansion', 'laser_beam'].includes(z.type)) {
                renderBossZones(ctx, z, bounds);
            } 
            // Tech Zones (BSOD, Firewall) - NEW
            else if (['bsod', 'firewall_wave'].includes(z.type)) {
                renderTechZones(ctx, z, bounds);
            }
            // Hint is part of overlays logic but rendered in base pass
            else if (z.type === 'safe_zone_hint') {
                renderOverlayZones(ctx, z, bounds);
            }
            // Common Zones
            else {
                renderCommonZones(ctx, z, bounds);
            }
        });

        // --- PASS 2: Warning Circles ---
        state.zones.forEach(z => {
            if (z.type === 'warning_circle') {
                renderOverlayZones(ctx, z, bounds);
            }
        });

        // --- PASS 3: Safe Havens (Top Most) ---
        state.zones.forEach(z => {
            if (z.type === 'safe_haven') {
                renderOverlayZones(ctx, z, bounds);
            }
        });
    }
};
