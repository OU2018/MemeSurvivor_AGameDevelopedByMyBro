
export const DROP_CONFIG = {
    MAX_GLOBAL_DROPS: 400, // Limit total drops to prevent lag
    MAX_HEALTH_PACKS: 15,
    MERGE_RADIUS: 60, // Range to merge gold
    GOLD_LIFETIME: 3600, // 60s
    PICKUP_DELAY: 45, // Frames before magnet works (gives time for "bounce")
    VACUUM_THRESHOLD: 350, // Count at which we start aggressive recycling

    // Gold Tiers (Value Thresholds) - Optimized for frequent high-tier sightings
    TIER_1_LIMIT: 5,    // Copper < 5
    TIER_2_LIMIT: 25,   // Silver < 25
    TIER_3_LIMIT: 100,  // Gold < 100
    TIER_4_LIMIT: 500,  // Diamond < 500
    // Anything >= 500 is Singularity
};
