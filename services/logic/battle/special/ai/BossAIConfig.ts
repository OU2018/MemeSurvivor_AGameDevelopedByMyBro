
export const CONFIG = {
    // Phase 1: Turret Mode with Proxies & Storm
    phase1: {
        maxNodes: 12, 
        nodeSpawnInterval: 800, 
        buildTime: 120, 
        
        // Skill 1: "Defrag Storm" (Purple)
        stormCount: 40, 
        stormInterval: 4, 
        stormCooldown: 600, 
        
        // Skill 2: "Data Stream" (Yellow Barrage)
        barrageDuration: 240, 
        barrageCooldown: 500,
        barrageFireRate: 3,   
        
        // "High Voltage" (Auto Attack)
        shootRate: 45, 
        
        // Vulnerability Window
        coolingDuration: 150, // 2.5s
    },
    
    // Phase 2: Runaway Mode (Corrupted)
    phase2: {
        threshold: 0.5, // 50% HP
        moveAcceleration: 0.25, // Lower acceleration for heavier feel
        maxSpeed: 5.0, // Reduced from 9.0 based on previous request (Brownian motion)
        friction: 0.98, 
        
        // Passive: Leak Rate
        leakRate: 10, 
        chaosDamage: 12, 
        selfDamagePerShot: 10, 
        
        // Skill C: Chaos Morph
        chaosMorphCooldown: 120, 
        chaosMorphDuration: 600,

        // Skill D: Fatal Exception Dash (New)
        crashDash: {
            cooldown: 1200, // 20s
            aimDuration: 90, // 1.5s
            lockDuration: 30, // 0.5s
            dashSpeed: 30, // Very fast
            stunDuration: 120 // 2s
        }
    }
};
