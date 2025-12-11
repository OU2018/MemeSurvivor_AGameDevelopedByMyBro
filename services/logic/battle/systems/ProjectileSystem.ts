
import { IGameEngine } from "../../../types";
import { SummonSystem } from "../battle/systems/SummonSystem";
import { BEHAVIORS, handleStoppedExplosive } from "../behaviors/projectileBehaviors";
import { PoolUtils } from "../utils";

export const ProjectileSystem = {
    update: (engine: IGameEngine) => {
        const projectiles = engine.state.projectiles;
        
        // Iterate backwards to safely remove elements using Swap-Pop
        for (let i = projectiles.length - 1; i >= 0; i--) {
          const proj = projectiles[i];
          
          // 1. Summon Logic (AI / Movement for Summons)
          if (proj.isSummon && !proj.isExploding) {
              SummonSystem.update(engine, proj);
          } 
          
          // 2. New Behavior System (Component Based)
          else if (proj.behaviors && proj.behaviors.length > 0) {
              // Execute all attached behaviors
              for(const b of proj.behaviors) {
                  if (BEHAVIORS[b]) {
                      BEHAVIORS[b](engine, proj);
                  }
              }
          }
          
          // 3. Legacy Fallback
          else {
              if (proj.isExplosive) {
                  if (proj.isExploding) {
                      BEHAVIORS['update_explosion'](engine, proj);
                      BEHAVIORS['decay_life'](engine, proj);
                  } else if (proj.isStopped) {
                      handleStoppedExplosive(engine, proj);
                  } else {
                      BEHAVIORS['move_linear'](engine, proj);
                      BEHAVIORS['decay_life'](engine, proj);
                      BEHAVIORS['check_bounds'](engine, proj);
                  }
              } else {
                  BEHAVIORS['move_linear'](engine, proj);
                  BEHAVIORS['decay_life'](engine, proj);
                  BEHAVIORS['check_bounds'](engine, proj);
              }
              // Legacy Trail
              if (proj.trailConfig) BEHAVIORS['emit_trail'](engine, proj);
          }
    
          // Death / Cleanup Check
          if (proj.life <= 0) {
             // Check if we need to trigger an explosion on death
             if (proj.explodeOnExpire && !proj.isExploding) {
                 // Transition to explosion phase
                 proj.isExploding = true;
                 
                 // UPDATED: 60 frames for Neon Missiles (longer fade), 30 for others
                 proj.life = (proj.renderStyle === 'neon_missile') ? 60 : 30;
                 
                 proj.vx = 0;
                 proj.vy = 0;
                 proj.hitIds = [];
                 
                 // NEW: Damage Window to separate Physics from Visuals
                 proj.damageWindow = 3;

                 // NEW: Instant Expansion for Clarity & Gameplay
                 if (proj.maxExplosionRadius) {
                     proj.radius = proj.maxExplosionRadius;
                 }
                 
                 // Default render style if missing
                 if (!proj.renderStyle || proj.renderStyle === 'text' || proj.renderStyle === 'black_pot') {
                     // For pot, convert to standard explosion render or specialized
                     proj.renderStyle = 'cyber_explosion'; 
                 }
                 
                 // --- DA YE: SPAWN PALM PRINT ---
                 if (proj.sourceType === 'da_ye' || proj.renderStyle === 'golden_palm') {
                     engine.state.zones.push({
                         id: Math.random().toString(),
                         x: proj.x,
                         y: proj.y,
                         radius: 120, // Palm size
                         type: 'palm_print',
                         life: 90, // 1.5 seconds fade
                         maxLife: 90,
                         color: '#fbbf24',
                         emoji: ''
                     });
                 }

                 engine.audio.playExplosion();
                 
                 if (proj.behaviors) {
                     if(!proj.behaviors.includes('update_explosion')) proj.behaviors.push('update_explosion');
                     if(!proj.behaviors.includes('decay_life')) proj.behaviors.push('decay_life');
                 }
             } else {
                 // --- POOLING & SWAP-POP REMOVAL ---
                 PoolUtils.releaseProjectile(engine, proj);
                 const lastIdx = projectiles.length - 1;
                 if (i !== lastIdx) {
                     projectiles[i] = projectiles[lastIdx];
                 }
                 projectiles.pop();
             }
          }
        }
    }
}
