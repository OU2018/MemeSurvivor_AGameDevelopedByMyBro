
import { IGameEngine, Drop } from "../../../types";
import { DropManager } from "../drops/DropManager";
import { GoldLogic } from "../drops/GoldLogic";
import { PickupLogic } from "../drops/PickupLogic";

export const DropSystem = {
    // Main Update Loop
    update: (engine: IGameEngine) => {
        DropManager.update(engine);
    },
    
    // Public API: Spawn Gold with auto-merge
    spawnGold: (engine: IGameEngine, x: number, y: number, value: number) => {
        GoldLogic.spawn(engine, x, y, value);
    },
    
    // Public API: Spawn Item with limits
    spawnPickup: (engine: IGameEngine, drop: Drop) => {
        PickupLogic.spawn(engine, drop);
    }
};
