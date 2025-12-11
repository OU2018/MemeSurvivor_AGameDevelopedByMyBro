
import { GameState } from "../../types";
import { REGISTRY } from "./SaveRegistry";
import { BitBuffer } from "./BitBuffer";

export const SaveEncoder = {
    encodeV3: (state: GameState, globalStats: any, unlockedCompendium: Set<string>, includeRun: boolean): string => {
        const buffer = new BitBuffer();

        // 1. GLOBAL STATS
        buffer.writeVarInt(state.highScore);
        buffer.writeVarInt(globalStats.totalKills || 0);
        buffer.writeVarInt(globalStats.totalTimePlayed || 0);
        buffer.writeVarInt(globalStats.totalGamesPlayed || 0);

        // 2. UNLOCKS
        // Achievements
        REGISTRY.ACHIEVEMENTS.forEach(id => {
            buffer.writeBit(state.achievements.includes(id) ? 1 : 0);
        });
        
        // Encyclopedia
        REGISTRY.ENCYCLOPEDIA.forEach(id => {
            buffer.writeBit(unlockedCompendium.has(id) ? 1 : 0);
        });

        // 3. RUN DATA
        if (includeRun && state.player.hp > 0) {
            buffer.writeBit(1); // Has Run
            
            const p = state.player;
            
            // Character Index
            const charIdx = REGISTRY.CHARACTERS.indexOf(p.characterId);
            buffer.writeBits(Math.max(0, charIdx), 5); // Support up to 32 chars

            // Difficulty Index
            const diffIdx = REGISTRY.DIFFICULTIES.indexOf(state.difficultyId);
            buffer.writeBits(Math.max(0, diffIdx), 3); // Support up to 8 diffs

            buffer.writeVarInt(state.currentWave);
            buffer.writeVarInt(p.gold);
            buffer.writeVarInt(Math.ceil(p.hp));
            buffer.writeVarInt(Math.ceil(p.maxHp));
            buffer.writeVarInt(Math.ceil(p.shield));
            
            buffer.writeBit(state.isEndless ? 1 : 0);
            buffer.writeVarInt(state.endlessWaveCount);

            // Inventory
            // Map item strings to Registry Indices
            const itemIndices: number[] = [];
            p.items.forEach(name => {
                const idx = REGISTRY.INVENTORY_ITEMS.indexOf(name);
                if (idx !== -1) itemIndices.push(idx);
            });

            buffer.writeVarInt(itemIndices.length);
            itemIndices.forEach(idx => {
                buffer.writeVarInt(idx);
            });

            // Debts
            const debts = p.pigDebts || [];
            buffer.writeVarInt(debts.length);
            debts.forEach(d => buffer.writeVarInt(d));

        } else {
            buffer.writeBit(0); // No Run
        }

        return buffer.toBase64();
    }
};
