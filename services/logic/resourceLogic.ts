
import { DropSystem } from "./systems/DropSystem";
import { ZoneSystem } from "./systems/ZoneSystem";

// Re-export for compatibility
export const updateDrops = DropSystem.update;
export const updateZones = ZoneSystem.update;
