
import { IGameEngine } from "../../../types";
import { SHOP_ITEMS } from "../../../data/items";
import { getRandomShopItems, calculateRestockCost, executePurchase, PurchaseResult } from "../shopLogic";

export const ShopSystem = {
    /**
     * Initialize the shop when entering the phase.
     * Handles inflation logic for preserved items and fills empty slots.
     */
    init: (engine: IGameEngine) => {
        const state = engine.state;
        const p = state.player;

        // 1. Handle Preserved Items (Locked & Not Purchased)
        const preserved = state.shopState.stock.filter(i => i.locked && !i.purchased);
        
        // Apply inflation to preserved items
        preserved.forEach(item => {
            if (item.originalPrice) {
                item.price = Math.floor(item.originalPrice * (1 + state.inflationRate));
            }
        });

        // 2. Fill Empty Slots
        const preservedIds = preserved.map(i => i.id);
        const slotsNeeded = Math.max(0, p.shopSlots - preserved.length);
        
        const newItems = getRandomShopItems(
            state,
            SHOP_ITEMS,
            slotsNeeded,
            preservedIds,
            (id) => engine.unlockEntry(id)
        );

        // 3. Commit to State
        state.shopState.stock = [...preserved, ...newItems];
        
        // 4. Initial Achievement Check
        engine.checkAchievements();
    },

    /**
     * Reroll the shop items.
     * Returns success status and optional message for UI toast.
     */
    refresh: (engine: IGameEngine): { success: boolean; message?: string; cost: number } => {
        const state = engine.state;
        const cost = calculateRestockCost(state);

        if (state.player.gold >= cost) {
            state.player.gold -= cost;
            state.player.goldSpentInShop = (state.player.goldSpentInShop || 0) + cost; // Capital L4 Track
            
            state.refreshCount++;
            state.hasRefreshedThisWave = true;
            
            // Recalculate cost for next refresh (state updated)
            state.restockCost = calculateRestockCost(state);
            engine.audio.playCoin();

            // Logic: Keep locked, reroll others
            const locked = state.shopState.stock.filter(p => p.locked && !p.purchased);
            const lockedIds = locked.map(i => i.id);
            const need = state.player.shopSlots - locked.length;
            
            const newItems = getRandomShopItems(
                state, 
                SHOP_ITEMS, 
                need, 
                lockedIds, 
                (id) => engine.unlockEntry(id)
            );

            state.shopState.stock = [...locked, ...newItems];
            
            engine.checkAchievements();
            return { success: true, cost };
        } else {
            return { success: false, cost, message: "余额不足" };
        }
    },

    /**
     * Purchase an item at a specific index.
     */
    purchase: (engine: IGameEngine, index: number): PurchaseResult => {
        const state = engine.state;
        const item = state.shopState.stock[index];

        if (!item || item.purchased) {
            return { success: false, finalPrice: 0 };
        }

        const result = executePurchase(
            state,
            item,
            (type) => {
                if (type === 'coin') engine.audio.playCoin();
                else if (type === 'synergy') engine.audio.playPowerup();
            }
        );

        if (result.success) {
            // Update Item State
            // We create a new object to ensure immutability conventions where helpful, 
            // though we are mutating the array in place.
            state.shopState.stock[index] = { 
                ...item, 
                purchased: true, 
                locked: false 
            };
            
            engine.checkAchievements();
        }

        return result;
    },

    /**
     * Toggle the lock status of an item.
     */
    toggleLock: (engine: IGameEngine, index: number) => {
        const item = engine.state.shopState.stock[index];
        if (item && !item.purchased) {
            item.locked = !item.locked;
        }
    },

    /**
     * Get current restock cost (Wrapper)
     */
    getRefreshCost: (engine: IGameEngine): number => {
        return calculateRestockCost(engine.state);
    }
};
