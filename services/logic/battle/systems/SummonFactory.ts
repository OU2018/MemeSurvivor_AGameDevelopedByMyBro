
import { SUMMON_STATS } from "../../../../data/summons/summonStats";
import { Projectile } from "../../../../types"; 
import { SynergyLogic } from "../../synergyLogic";
import { unlockEntry } from "../../upgradeLogic"; // Import unlockEntry

export const SummonFactory = {
    /**
     * Creates a summon projectile and adds it to the game engine.
     * Returns the created projectile for further modification.
     */
    createSummon: (engine: any, type: string, x: number, y: number): Projectile | undefined => {
        const config = SUMMON_STATS[type];
        if (!config) {
            console.error(`Summon type ${type} not found`);
            return undefined;
        }

        // --- UNLOCK COMPENDIUM ENTRY ---
        // SAFETY CHECK: Ensure engine has unlockedCompendium before calling unlockEntry
        if (engine.unlockedCompendium) {
            unlockEntry(engine, type);
        }

        const p = engine.state.player;
        let emoji = config.emoji;
        
        // Dynamic Props
        let radius = config.radius;
        let maxHp = config.maxHp;
        let hp = config.hp;
        let duration = config.duration;
        let color = config.color;

        // --- SYNERGY CHECK (HR Department) ---
        const counts = SynergyLogic.getSynergyCounts(p.items);
        const tiers = SynergyLogic.getActiveTiers(counts);
        const hrLevel = tiers['hr'] || 0;

        // HR (2): HP +30%, Duration +50%
        if (hrLevel >= 2) {
            maxHp = Math.ceil(maxHp * 1.3);
            hp = maxHp;
            if (duration < 999999) { // Don't extend infinite
                duration = Math.ceil(duration * 1.5);
            }
        }

        // --- CLONE SPECIFIC LOGIC ---
        if (type === 'clone') {
            emoji = p.emoji;
            radius = p.radius; 
            hp = 999999;
            maxHp = 999999; 
            color = '#374151'; // Dark Grey for Shadow Clone
        }

        // --- BUFF LOGIC ---
        // SE01: Megaphone (Faster Fire Rate)
        let fireRate = config.fireRate;
        
        // H-04 HAZARD: ENDLESS MEETINGS (Slower Cooldowns)
        if (engine.state.activeMutators && engine.state.activeMutators.includes('endless_meetings')) {
            if (fireRate) fireRate = Math.floor(fireRate * 1.3); // +30% Fire Delay
        }

        if (p.items.includes('扩音喇叭') && fireRate) {
            fireRate = Math.floor(fireRate * 0.8); 
        }
        
        // SS03: 24h Power
        let damage = config.damage;
        if (type === 'chatbot' && p.items.includes('24小时电源')) {
            if (fireRate) fireRate = Math.floor(fireRate * 0.66); 
            damage = Math.floor(damage * 1.5); 
        }

        // SE02: Team Pizza
        let hpRegen = 0;
        if (p.items.includes('团建披萨')) {
            maxHp = Math.floor(maxHp * 1.5);
            hp = maxHp;
            hpRegen = Math.max(1, Math.floor(maxHp * 0.05)); 
        }
        
        // SS02: Full-time Offer
        if (type === 'intern' && p.items.includes('转正名额')) {
            duration = 999999; 
            maxHp += 50;
            hp = maxHp;
        }

        // SE04: Explosive Contract
        let isExplosive = config.isExplosive;
        let maxExplosionRadius = config.maxExplosionRadius;
        
        if (p.items.includes('爆炸合同')) {
            isExplosive = true;
            maxExplosionRadius = Math.max(maxExplosionRadius || 0, 150);
            damage = Math.max(damage, 25); 
        }
        
        // SS01: Macro
        if (type === 'troll' && p.items.includes('键盘宏')) {
            maxExplosionRadius = (maxExplosionRadius || 100) * 1.5;
        }

        // SE05: Stock Options
        if (p.items.includes('股权激励')) {
            const multiplier = 1 + (Math.floor(p.gold / 100) * 0.05);
            damage = Math.floor(damage * multiplier);
        }

        // SE03: Wolf Protocol & HR (6)
        let critChance = 0;
        if (p.items.includes('狼性协议')) {
            critChance += 0.15;
        }
        // HR (6): +15% Crit
        if (hrLevel >= 6) {
            critChance += 0.15;
        }

        // SE06: Remote Work
        const remoteWorkCount = p.items.filter((i: string) => i === '远程办公').length;
        const rangeMultiplier = 1.0 + (remoteWorkCount * 0.5);

        // SS05: Mirror Server
        let pierce = 0;
        if (type === 'clone' && p.items.includes('镜像服务器')) {
            pierce = p.projectilePierce;
        }

        const summon: Projectile = {
            id: Math.random().toString(),
            x, y,
            radius: radius,
            emoji: emoji,
            vx: 0, vy: 0,
            damage: damage,
            life: duration,
            isEnemy: false,
            color: color,
            text: emoji,
            pierce: pierce,
            hitIds: [],
            isSummon: true,
            summonType: config.aiType as any,
            hp: hp,
            maxHp: maxHp,
            hpRegen: hpRegen,
            
            // Applied Props
            isExplosive: isExplosive,
            maxExplosionRadius: maxExplosionRadius,
            isInvincible: config.isInvincible,
            fireCooldown: 0, 
            critChance: critChance, 
            
            // Visuals
            trailConfig: config.trailConfig, 

            // Range Overrides
            rangeMultiplier: rangeMultiplier,
            detectRangeOverride: config.detectRange ? config.detectRange * rangeMultiplier : undefined,
            attackRangeOverride: config.attackRange ? config.attackRange * rangeMultiplier : undefined,

            // Initialize angle for orbiting units
            angle: type === 'drone' ? Math.random() * Math.PI * 2 : 0,
            active: true
        };

        // --- CRITICAL VISUAL FIX ---
        // Ensure Pacman uses the dedicated canvas renderer, NOT emoji
        if (type === 'hr_pacman') {
            summon.renderStyle = 'pacman_style';
            summon.text = ''; // Clear text to prevent default renderer from drawing emoji over it
            summon.emoji = ''; // Also clear runtime emoji for battlefield
            // Add default behavior to prevent immediate expiration if logic missing elsewhere
            if (!summon.behaviors) summon.behaviors = []; 
            // Note: logic is mostly handled by SummonSystem, behaviors array here is just metadata
        }

        // Pass modified fire rate via a temporary prop
        (summon as any).fireRateOverride = fireRate;

        engine.state.projectiles.push(summon);
        return summon;
    }
};
