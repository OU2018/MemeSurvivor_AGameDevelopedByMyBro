
export const EliteManagerConfig = {
    Movement: {
        minRange: 1200,
        maxRange: 2000,
        panicRange: 700,
        normalSpeedMult: 1.0,
        aimingSpeedMult: 0.8,
        panicSpeedMult: 1.8,
        strafeSpeedMult: 0.6,
        separationDist: 1500,
        separationForce: 4.0
    },
    Timing: {
        cycleDuration: 1000,
        phase1End: 360,     // 6s: Recruitment
        
        // Phase 2 Duration: 840 - 360 = 480 frames
        // Shot Interval: 110 + 5 + 45 = 160 frames
        // 480 / 160 = 3.0 shots exactly (Fixes cutoff aim)
        phase2End: 840,     
        
        phase3End: 1000,     // Coffee Break
        
        captureFireRate: 60, 
        coverFireRate: 45,   
        
        // Railgun Sequence
        // Total shot cycle: ~160 frames
        trackTime: 110,    // 1.8s: Tracking & Focusing
        preFireTime: 5,    // 0.08s: Instant Trigger
        recoilTime: 45,    // 0.75s: Recoil & Fade
        
        get shotInterval() {
            return this.trackTime + this.preFireTime + this.recoilTime;
        }
    },
    Combat: {
        beaconSpeed: 75,
        throwSpeed: 95,
        dragSpeed: 15,
        orbitRadius: 140,
        orbitRotationSpeed: 0.03,
        minAmmoRefillThreshold: 2,
        ammoSpawnDistance: 100,
        maxAmmo: 6,        
        
        // Aiming Parameters
        aimPrediction: 35,
        aimTurnSpeed: 0.25, 
        aimJitterMagnitude: 0.25 
    }
};
