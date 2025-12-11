import { CoreSkills } from "./skills/CoreSkills";
import { MovementSkills } from "./skills/MovementSkills";
import { SupportSkills } from "./skills/SupportSkills";
import { AggressiveSkills } from "./skills/AggressiveSkills";
import { SpecialSkills } from "./skills/SpecialSkills";

// 统一对外暴露，API 保持完全一致
export const SkillSystem = {
    // Core
    handleSpawner: CoreSkills.handleSpawner,
    handleStun: CoreSkills.handleStun,

    // Movement
    handleOrbit: MovementSkills.handleOrbit,
    handleCircleDash: MovementSkills.handleCircleDash,

    // Support
    handleSupportHeal: SupportSkills.handleSupportHeal,
    handlePiePainter: SupportSkills.handlePiePainter,
    handleLemonTrail: SupportSkills.handleLemonTrail,

    // Aggressive
    handleTianGouPounce: AggressiveSkills.handleTianGouPounce,
    handleLeechCombat: AggressiveSkills.handleLeechCombat,
    handleLeech: AggressiveSkills.handleLeechCombat, // 保持兼容别名
    handleDevourer: AggressiveSkills.handleDevourer,

    // Special
    handleCyberGoddess: SpecialSkills.handleCyberGoddess,
    handleClownBalloon: SpecialSkills.handleClownBalloon,
    
    // Compatibility redirects (如果在原文件中有互调用的情况)
    handleLinker: (engine: any, e: any) => {
        // 原逻辑 fallback
        if (e.config.type === 'leech') {
            AggressiveSkills.handleLeechCombat(engine, e, engine.state.player);
        }
    }
};