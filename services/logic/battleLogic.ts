
import { ProjectileSystem } from "./systems/ProjectileSystem";
import { ShootingSystem } from "./systems/ShootingSystem";
import { CollisionSystem } from "./systems/CollisionSystem";
import { spawnEnemy, updateEnemies } from "./battle/enemySystem";

// Re-export for backward compatibility
export const shoot = ShootingSystem.shoot;
export const updateProjectiles = ProjectileSystem.update;
export const checkCollisions = CollisionSystem.checkCollisions;
export const damagePlayer = CollisionSystem.damagePlayer;

// Export spawn and update enemies directly
export { spawnEnemy, updateEnemies };
