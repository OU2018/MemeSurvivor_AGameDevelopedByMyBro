
import { gameEngine } from "../gameEngine";
import { SaveEncoder } from "./SaveEncoder";
import { SaveDecoder, SavePreview } from "./SaveDecoder";
import { tryApplyCheat } from "../cheatCodes";

export const SaveManager = {
    generateCode: (includeRun: boolean): string => {
        try {
            // LOGIC FIX: Only include run if it is "meaningful"
            // Meaningful = Passed Wave 1 (reached shop) OR Currently > Wave 1
            let shouldIncludeRun = includeRun;
            
            const currentWave = gameEngine.state.currentWave;
            const waveEnded = gameEngine.state.waveEnded;
            
            // If we are in Wave 1 and it hasn't ended yet, it's basically a fresh run.
            // Saving this is pointless and causes "ghost run" issues on import.
            if (currentWave <= 1 && !waveEnded) {
                shouldIncludeRun = false;
            }

            // Use V3 Encoder but wrap in V1 header to maintain "version" appearance
            const payload = SaveEncoder.encodeV3(
                gameEngine.state, 
                gameEngine.globalStats,
                gameEngine.unlockedCompendium,
                shouldIncludeRun
            );
            // "V1$" header is used for compatibility perception, payload is binary base64
            return `V1$${payload}`;
        } catch (e) {
            console.error("Save generation failed", e);
            return "ERROR";
        }
    },

    getPreview: (code: string): { success: boolean, data?: SavePreview, message?: string } => {
        // CHEAT CODE CHECK REMOVED from Preview
        // Secret codes should not be revealed during typing.
        
        const preview = SaveDecoder.getPreview(code);
        if (preview.valid) {
            return { success: true, data: preview };
        }
        return { success: false, message: preview.error || "无效的代码" };
    },

    importCode: (code: string): { success: boolean, message: string } => {
        // Cheats are checked only upon explicit import action
        const cheatMsg = tryApplyCheat(code);
        if (cheatMsg) return { success: true, message: cheatMsg };

        try {
            const data = SaveDecoder.decode(code);
            
            gameEngine.state.highScore = Math.max(gameEngine.state.highScore, data.highScore);
            
            gameEngine.globalStats.totalKills = Math.max(gameEngine.globalStats.totalKills, data.globalStats.totalKills);
            gameEngine.globalStats.totalTimePlayed = Math.max(gameEngine.globalStats.totalTimePlayed, data.globalStats.totalTimePlayed);
            gameEngine.globalStats.totalGamesPlayed = Math.max(gameEngine.globalStats.totalGamesPlayed, data.globalStats.totalGamesPlayed);

            let unlockCount = 0;
            data.achievements.forEach(id => {
                if (!gameEngine.state.achievements.includes(id)) {
                    gameEngine.state.achievements.push(id);
                    unlockCount++;
                }
            });
            
            data.unlockedCompendium.forEach(id => {
                if (!gameEngine.unlockedCompendium.has(id)) {
                    gameEngine.unlockedCompendium.add(id);
                }
            });
            
            gameEngine.saveAchievements();
            gameEngine.saveEncyclopedia();

            if (data.runState) {
                const r = data.runState;
                const p = data.runState.player;
                
                gameEngine.init(gameEngine.canvasWidth, gameEngine.canvasHeight, r.characterId, r.difficultyId);
                
                gameEngine.state.currentWave = r.currentWave;
                gameEngine.state.isEndless = r.isEndless;
                gameEngine.state.endlessWaveCount = r.endlessWaveCount;
                
                gameEngine.state.player.gold = p.gold;
                gameEngine.state.player.maxHp = p.maxHp;
                gameEngine.state.player.hp = p.hp;
                gameEngine.state.player.shield = p.shield;
                gameEngine.state.player.items = p.items;
                gameEngine.state.player.pigDebts = p.pigDebts;
                
                gameEngine.state.waveEnded = true;
                gameEngine.state.isWaveClearing = false;
                
                return { success: true, message: "对局已恢复 (位于商店/整备阶段)。" };
            } else {
                // FIX: If no run state in save, reset current run to avoid phantom state
                // This ensures user is forced back to "New Game" state
                gameEngine.resetCurrentRun();
            }

            return { success: true, message: `成功导入! (同步了 ${unlockCount} 个新成就)` };

        } catch (e) {
            console.error(e);
            return { success: false, message: "HR表示看不懂这份火星文简历 (代码无效)" };
        }
    }
};
