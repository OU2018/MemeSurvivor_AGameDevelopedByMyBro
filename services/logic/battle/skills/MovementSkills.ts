import { IGameEngine } from "../../../../types";
import { spawnFloatingText } from "../../utils";

export const MovementSkills = {
    handleOrbit: (engine: IGameEngine, e: any): boolean => {
        if (e.orbitTargetId) {
            const target = engine.state.enemies.find((t: any) => t.id === e.orbitTargetId);
            if (target) {
                // If it's a frenzied simp, it aggressively orbits then breaks off
                const isFrenzied = e.config.type === 'tian_gou_frenzy';
                const orbitSpeed = isFrenzied ? 0.1 : 0.05;
                const orbitBaseR = target.radius + (isFrenzied ? 100 : 60);
                
                e.orbitAngle = (e.orbitAngle || 0) + orbitSpeed;
                
                const targetX = target.x + Math.cos(e.orbitAngle) * orbitBaseR;
                const targetY = target.y + Math.sin(e.orbitAngle) * orbitBaseR;
                
                // Aggressive movement
                e.x += (targetX - e.x) * (isFrenzied ? 0.2 : 0.1);
                e.y += (targetY - e.y) * (isFrenzied ? 0.2 : 0.1);
                
                // Break orbit check for Frenzied
                if (isFrenzied) {
                    const player = engine.state.player;
                    const dToPlayer = Math.hypot(player.x - e.x, player.y - e.y);
                    if (dToPlayer < 400) {
                        e.orbitTargetId = undefined; // Break formation and charge!
                        spawnFloatingText(engine, e.x, e.y - 30, "冲!", "#ef4444");
                    }
                }

                engine.state.enemies.forEach((other: any) => {
                    if (other !== e && other.orbitTargetId === e.orbitTargetId) {
                        const dx = e.x - other.x;
                        const dy = e.y - other.y;
                        const d = Math.hypot(dx, dy);
                        if (d < 40 && d > 0) {
                            e.x += dx/d * 2;
                            e.y += dy/d * 2;
                        }
                    }
                });
                return true;
            } else {
                e.orbitTargetId = undefined; 
            }
        }
        return false;
    },

    handleCircleDash: (engine: IGameEngine, e: any, p: any, dist: number, dx: number, dy: number, moveSpeed: number) => {
          e.dashTimer = (e.dashTimer || 0) + 1;
          const DASH_CYCLE = 300; 
          const WARNING_START = 240;
          const DASH_START = 270;
          
          let moveX = e.vx ? e.vx / moveSpeed : 0;
          let moveY = e.vy ? e.vy / moveSpeed : 0;

          if (e.dashTimer < WARNING_START) {
              e.isAimingDash = false;
              if (dist < 250) {
                  moveX = -(dx/dist); moveY = -(dy/dist); 
              } else {
                  const angle = Math.atan2(dy, dx) + Math.PI / 2;
                  moveX = Math.cos(angle);
                  moveY = Math.sin(angle);
              }
              e.vx = moveX * moveSpeed;
              e.vy = moveY * moveSpeed;
          } 
          else if (e.dashTimer < DASH_START) {
              e.isAimingDash = true;
              e.vx = 0;
              e.vy = 0;
              if (e.dashTimer === WARNING_START) {
                  e.aimX = p.x;
                  e.aimY = p.y;
              }
          } 
          else if (e.dashTimer < DASH_CYCLE) {
              e.isAimingDash = false; 
              if (e.dashTimer === DASH_START) {
                  const targetX = e.aimX ?? p.x;
                  const targetY = e.aimY ?? p.y;
                  const angle = Math.atan2(targetY - e.y, targetX - e.x);
                  
                  e.vx = Math.cos(angle) * (moveSpeed * 4.5);
                  e.vy = Math.sin(angle) * (moveSpeed * 4.5);
              }
          } 
          else {
              e.dashTimer = 0;
              e.aimX = undefined;
              e.aimY = undefined;
          }
    }
};