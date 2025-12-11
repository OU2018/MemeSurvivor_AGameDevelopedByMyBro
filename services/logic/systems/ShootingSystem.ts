
import { IGameEngine } from "../../../types";
import { spawnFloatingText } from "../utils";
import { GameEventType } from "../events/events";
import { SynergyLogic } from "../synergyLogic";
import { TargetingMechanics } from "../shooting/TargetingMechanics";
import { BulletFactory } from "../shooting/BulletFactory";

export const ShootingSystem = {
    shoot: (engine: IGameEngine, speedMult: number = 1.0, flatSpeedBonus: number = 0, explosionRangeMult: number = 1.0) => {
        const p = engine.state.player;
        
        // --- H-01 HAZARD: CARPAL TUNNEL (腱鞘炎) ---
        if (engine.state.activeMutators.includes('carpal_tunnel')) {
            // 15% chance to jam
            if (Math.random() < 0.15) {
                if (engine.state.timeAlive % 30 === 0) { // Throttle floating text
                    spawnFloatingText(engine, p.x, p.y - 50, "手麻了!", "#fb923c");
                }
                return; // Cancel shot
            }
        }

        // 1. Loan Item Check
        if (p.items.includes('贷款上班')) {
            const cost = 5;
            if (p.gold < cost) {
                if (engine.state.timeAlive % 30 === 0) {
                    spawnFloatingText(engine, p.x, p.y - 50, "没钱了!", "#ef4444");
                }
                return;
            }
            p.gold -= cost;
        }

        // --- SYNERGY CHECK ---
        const counts = SynergyLogic.getSynergyCounts(p.items);
        const tiers = SynergyLogic.getActiveTiers(counts);

        // --- HARDCORE (6): Heat Accumulation ---
        if ((tiers['hardcore'] || 0) >= 6) {
            if (!p.isOverclocked) {
                p.heatValue = Math.min(100, p.heatValue + 5);
                
                // Trigger Overclock
                if (p.heatValue >= 100) {
                    p.isOverclocked = true;
                    spawnFloatingText(engine, p.x, p.y - 60, "过载启动!!!", "#ef4444", 'chat');
                    engine.audio.playPowerup(); 
                }
            }
        }

        // 2. Targeting
        const angle = TargetingMechanics.getAimAngle(engine);
    
        engine.emit(GameEventType.PLAYER_SHOOT, { player: p });
        
        // --- CLEANER SPECIAL LOGIC (Melee Mop Sweep) ---
        if (p.characterId === 'cleaner') {
            BulletFactory.createMeleeSwing(engine, angle);
            return; 
        }

        // --- TECH (6): BSOD Strike (Sudo rm -rf) ---
        // Keeps Zone logic here as it's not a projectile
        if ((tiers['tech'] || 0) >= 6) {
            if (p.customTimers['tech_bsod_counter'] === undefined) p.customTimers['tech_bsod_counter'] = 0;
            p.customTimers['tech_bsod_counter']++;
            
            if (p.customTimers['tech_bsod_counter'] >= 15) {
                p.customTimers['tech_bsod_counter'] = 0;
                
                const aimDist = 200;
                const zoneX = p.x + Math.cos(angle) * aimDist;
                const zoneY = p.y + Math.sin(angle) * aimDist;
                
                engine.state.zones.push({
                    id: Math.random().toString(),
                    x: zoneX, 
                    y: zoneY,
                    radius: 200, 
                    type: 'bsod',
                    life: 120, // 2 seconds
                    maxLife: 120,
                    color: '#0000AA', // BSOD Blue
                    emoji: ':(',
                });
                
                spawnFloatingText(engine, p.x, p.y - 60, "SUDO RM -RF", "#3b82f6", 'chat');
                engine.audio.play('ui_glitch_severe'); // Distinct sound
                return; // Stop normal shoot
            }
        }

        // --- CAPITAL (6): Wealth Coin Attack ---
        if ((tiers['capital'] || 0) >= 6) {
            if (Math.random() < 0.05) {
                BulletFactory.createWealthCoin(engine, angle, speedMult, flatSpeedBonus);
            }
        }

        // 3. Create Main Projectiles
        const count = p.projectileCount;
        const spread = p.projectileSpread;
        const startAngle = angle - (spread * (count - 1)) / 2;
        
        for (let i = 0; i < count; i++) {
            BulletFactory.createPlayerProjectile(
                engine, 
                startAngle + spread * i, 
                p.x, 
                p.y, 
                speedMult, 
                flatSpeedBonus, 
                explosionRangeMult
            );
        }
    
        // 4. Backward Shots (Quirky Gun)
        if (p.backwardShots > 0) {
            const backAngle = angle + Math.PI;
            const backStartAngle = backAngle - (spread * (p.backwardShots - 1)) / 2;
            for (let i = 0; i < p.backwardShots; i++) {
                BulletFactory.createPlayerProjectile(
                    engine, 
                    backStartAngle + spread * i, 
                    p.x, 
                    p.y, 
                    speedMult, 
                    flatSpeedBonus, 
                    explosionRangeMult
                );
            }
        }

        // 5. Clone Shots
        const clones = engine.state.projectiles.filter((proj: any) => proj.summonType === 'clone');
        clones.forEach((clone: any) => {
            BulletFactory.createPlayerProjectile(
                engine, 
                angle, 
                clone.x, 
                clone.y, 
                speedMult, 
                flatSpeedBonus, 
                explosionRangeMult, 
                true, // isClone
                clone
            );
        });
    }
};
