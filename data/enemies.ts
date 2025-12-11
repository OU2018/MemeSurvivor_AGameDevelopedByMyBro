
import { EnemyConfig } from "../types";
import { COMMON_ENEMIES } from "./enemies/common";
import { RARE_ENEMIES } from "./enemies/rare";
import { EPIC_ENEMIES } from "./enemies/epic";
import { BOSS_ENEMIES } from "./enemies/boss";

export const ENEMIES: Record<string, EnemyConfig> = {
  ...COMMON_ENEMIES,
  ...RARE_ENEMIES,
  ...EPIC_ENEMIES,
  ...BOSS_ENEMIES
};

export { COMMON_ENEMIES, RARE_ENEMIES, EPIC_ENEMIES, BOSS_ENEMIES };
