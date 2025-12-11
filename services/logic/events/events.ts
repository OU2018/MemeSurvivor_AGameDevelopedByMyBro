
export enum GameEventType {
    // Combat
    PLAYER_SHOOT = 'PLAYER_SHOOT',
    ENEMY_SHOOT = 'ENEMY_SHOOT',
    PROJECTILE_EXPLODE = 'PROJECTILE_EXPLODE',
    ENTITY_HIT = 'ENTITY_HIT',
    ENTITY_DAMAGED = 'ENTITY_DAMAGED', // For floating text numbers
    ENTITY_DIE = 'ENTITY_DIE',
    PLAYER_HURT = 'PLAYER_HURT',
    SHIELD_BREAK = 'SHIELD_BREAK',
    WALL_HIT = 'WALL_HIT', // New: Projectile hits wall
    
    // Environment
    PARTICLE_SPAWN = 'PARTICLE_SPAWN',
    FLOATING_TEXT = 'FLOATING_TEXT',
    
    // Meta
    ITEM_PICKUP = 'ITEM_PICKUP',
    LEVEL_UP = 'LEVEL_UP'
}

export interface GameEvent {
    type: GameEventType;
    x?: number;
    y?: number;
    data?: any;
}
