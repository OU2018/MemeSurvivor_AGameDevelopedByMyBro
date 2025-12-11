
import { Particle, IGameEngine, Projectile, FloatingText, Enemy } from "../../types";

// PERFORMANCE: Hard limit for particles
const MAX_PARTICLES = 500;

// Chat Throttling State
let lastChatTime = 0;
const CHAT_THROTTLE_MS = 250; // Minimum time between chat bubbles

// --- POOLING SYSTEM ---
export const PoolUtils = {
    // --- PROJECTILES ---
    getProjectile: (engine: IGameEngine): Projectile => {
        if (engine.state.projectilePool.length > 0) {
            const p = engine.state.projectilePool.pop()!;
            p.active = true;
            p.id = Math.random().toString();
            
            // Reset ALL fields to prevent logic leaks
            p.hitIds = [];
            p.behaviors = undefined;
            p.trailConfig = undefined;
            p.trailHistory = undefined; // Reset trail history
            p.isExplosive = false;
            p.isExploding = false;
            p.explodeOnExpire = false;
            p.isSummon = false;
            p.summonType = undefined;
            p.renderStyle = undefined;
            p.isStopped = false;
            p.pierce = 0;
            p.isInvincible = false;
            p.damageWindow = undefined;
            
            // Cleaner Specific Resets
            p.isSweeper = false;
            p.swingDirection = undefined;
            p.maxLife = undefined;
            p.angle = 0;
            
            // Tech Specific Resets
            p.bounceCount = 0;
            p.canChain = false;
            
            // Physics
            p.z = 0;
            p.vz = 0;
            p.gravity = 0;
            p.tx = undefined;
            p.ty = undefined;
            p.targetId = undefined;
            
            // Crit
            p.isCrit = false;
            
            // Glitch Boss & AI Boss
            p.isFake = false;
            p.isMimic = false;
            
            return p;
        }
        return {
            id: Math.random().toString(),
            x: 0, y: 0, radius: 10, emoji: '', vx: 0, vy: 0, damage: 0, life: 0,
            isEnemy: false, color: '#fff', text: '', pierce: 0, hitIds: [], active: true,
            isMimic: false
        };
    },
    releaseProjectile: (engine: IGameEngine, proj: Projectile) => {
        proj.active = false;
        engine.state.projectilePool.push(proj);
    },

    // --- ENEMIES ---
    getEnemy: (engine: IGameEngine): Enemy => {
        if (engine.state.enemyPool.length > 0) {
            const e = engine.state.enemyPool.pop()!;
            e.active = true;
            e.id = Math.random().toString();
            
            // Soft Reset
            e.vx = 0; e.vy = 0;
            e.isTransitioning = false;
            e.stunTimer = 0;
            e.burstQueue = [];
            e.dashTimer = 0;
            e.isAimingDash = false;
            e.warningTimer = 0;
            e.linkedById = undefined;
            e.captureState = undefined;
            e.captureTargetId = undefined;
            e.orbitTargetId = undefined;
            e.isThrown = false;
            e.phase = 1;
            e.subState = undefined;
            e.skillTimer = 0;
            e.loadedMinionId = null;
            e.healTargetId = undefined;
            e.strafeDir = undefined;
            e.anxietyTimer = 0;
            
            // CRITICAL FIX: Reset Custom Vars to prevent Boss Glitch logic leak
            e.customVars = undefined;
            e.isUnstable = false;
            
            return e;
        }
        return {
            id: Math.random().toString(),
            x: 0, y: 0, radius: 24, emoji: '', hp: 0, maxHp: 0,
            config: {} as any, vx: 0, vy: 0, attackCooldown: 0, active: true
        };
    },
    releaseEnemy: (engine: IGameEngine, e: Enemy) => {
        e.active = false;
        engine.state.enemyPool.push(e);
    },

    // --- PARTICLES ---
    getParticle: (engine: IGameEngine): Particle => {
        if (engine.state.particlePool.length > 0) {
            const p = engine.state.particlePool.pop()!;
            p.active = true;
            p.id = Math.random().toString();
            // Defaults
            p.scale = 1;
            p.scaleDelta = undefined;
            p.rotation = 0;
            p.angularVelocity = undefined;
            p.alpha = 1;
            p.alphaDelta = undefined;
            p.blendMode = undefined;
            p.type = 'circle';
            p.text = undefined;
            p.tx = undefined;
            p.ty = undefined;
            return p;
        }
        return {
            id: Math.random().toString(),
            x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 0, color: '#fff', size: 0,
            active: true
        };
    },
    releaseParticle: (engine: IGameEngine, p: Particle) => {
        p.active = false;
        engine.state.particlePool.push(p);
    },

    // --- FLOATING TEXT ---
    getFloatingText: (engine: IGameEngine): FloatingText => {
        if (engine.state.floatingTextPool.length > 0) {
            const ft = engine.state.floatingTextPool.pop()!;
            ft.active = true;
            ft.id = Math.random().toString();
            ft.targetId = undefined;
            ft.value = undefined;
            ft.scale = 1; 
            ft.isCrit = false;
            ft.mergeCount = 0;
            return ft;
        }
        return {
            id: Math.random().toString(),
            x: 0, y: 0, text: '', color: '#fff', life: 0, vy: 0, active: true, scale: 1, isCrit: false, mergeCount: 0
        };
    },
    releaseFloatingText: (engine: IGameEngine, ft: FloatingText) => {
        ft.active = false;
        engine.state.floatingTextPool.push(ft);
    }
};

// ... (rest of file unchanged)
// Helper: Determine dynamic style for damage numbers
// Added mergeCount influence
const getDamageStyle = (amount: number, isCrit: boolean, mergeCount: number = 0) => {
    // Logarithmic scaling for size: 100 -> 1.0, 1000 -> 1.5, 10000 -> 2.0
    let scale = 1.0 + Math.max(0, Math.log10(amount) - 2) * 0.25; 
    
    // Merge Count Bonus to Scale: 5 merges = +0.5 scale
    scale += Math.min(1.0, mergeCount * 0.1);

    let color = '#ffffff';

    if (amount < 200) {
        color = '#fef08a'; // Pale Yellow (Scratches)
    } else if (amount < 1000) {
        color = '#fbbf24'; // Golden (Normal)
        scale *= 1.1;
    } else if (amount < 5000) {
        color = '#f97316'; // Orange (Big Hit)
        scale *= 1.2;
    } else if (amount < 20000) {
        color = '#ef4444'; // Red (Severe)
        scale *= 1.3;
    } else {
        color = '#d8b4fe'; // Purple (Catastrophic / Glitch)
        scale *= 1.5;
    }

    // Crit overrides or enhances
    if (isCrit) {
        scale *= 1.3; // Significantly bigger
        // If it was small but crit, bump it up
        if (amount < 200) color = '#fca5a5'; // Light Red
    }

    return { scale, color };
};

// Optimized Floating Text with Merging & Throttling
export function spawnFloatingText(
    engine: IGameEngine, 
    x: number, 
    y: number, 
    text: string, 
    color: string = '#ffffff', 
    type: 'damage' | 'chat' | 'gold' = 'damage',
    targetId?: string,
    isCritInput: boolean = false // Explicit crit flag
) {
    const now = Date.now();

    // 1. CHAT THROTTLING (Noise Filter)
    if (type === 'chat') {
        const isImportant = text.includes("BOSS") || color === '#ef4444' || color === '#fcd34d'; 
        if (!isImportant && (now - lastChatTime < CHAT_THROTTLE_MS)) {
            return; // Skip this chat bubble
        }
        lastChatTime = now;
    }

    // 2. DAMAGE ACCUMULATION (Merging within Range)
    // Merge damage numbers that are close to each other, creating a combo feel
    if (type === 'damage') {
        const mergeRadius = 60; // Slightly larger merge radius
        
        // Search active texts
        for (let i = engine.state.floatingTexts.length - 1; i >= 0; i--) {
            const ft = engine.state.floatingTexts[i];
            
            // Only merge damage texts
            if (ft.type === 'damage') {
                // Check distance
                const dist = Math.hypot(ft.x - x, ft.y - y);
                
                if (dist < mergeRadius) {
                    // Extract or use stored numeric value
                    const oldVal = ft.value !== undefined ? ft.value : parseInt(ft.text); 
                    const newVal = parseInt(text);
                    
                    if (!isNaN(newVal)) {
                        const safeOldVal = isNaN(oldVal) ? 0 : oldVal;
                        const sum = safeOldVal + newVal;
                        
                        ft.value = sum;
                        ft.mergeCount = (ft.mergeCount || 0) + 1;
                        
                        // Merge Critical State: If either is crit, result is crit
                        const isCritMerge = ft.isCrit || isCritInput;
                        ft.isCrit = isCritMerge;
                        
                        // Calculate new style based on SUM and MergeCount
                        const style = getDamageStyle(sum, isCritMerge, ft.mergeCount);
                        
                        ft.text = `${sum}`; // Just the number, no emojis
                        if (sum > 99999) ft.text += "!";
                        
                        ft.color = style.color;
                        ft.scale = style.scale;

                        // Reset life to keep it on screen
                        ft.life = 60; 
                        
                        // Visual Pop effect
                        ft.vy = -4; // Jump up harder on merge
                        
                        return; // Merged successfully, don't spawn new
                    }
                }
            }
        }
    }
    
    // 3. LOW VALUE CULLING
    if (engine.state.floatingTexts.length > 20 && type === 'damage' && !isCritInput) {
        const val = parseInt(text);
        if (!isNaN(val) && val < 50) return; // Aggressive culling for small numbers
    }

    // 4. HARD LIMIT (Aggressive Culling)
    if (engine.state.floatingTexts.length > 40) {
        const old = engine.state.floatingTexts.shift();
        if(old) PoolUtils.releaseFloatingText(engine, old);
    }

    const ft = PoolUtils.getFloatingText(engine);
    ft.x = x;
    ft.y = y;
    ft.text = text;
    ft.color = color;
    ft.life = 60;
    ft.vy = -2;
    ft.type = type;
    ft.targetId = targetId;
    ft.scale = 1.0; 
    ft.isCrit = isCritInput;
    ft.mergeCount = 0;
    
    // Init value for accumulation & Style
    if (type === 'damage') {
        const v = parseInt(text.replace(/[^\d-]/g, ''));
        if (!isNaN(v)) {
            ft.value = v;
            // Clean the text to just be number (remove potential emoji leftovers if any)
            ft.text = `${v}`; 
            
            const style = getDamageStyle(v, isCritInput, 0);
            ft.scale = style.scale;
            ft.color = style.color; 
        }
    } else {
        ft.scale = 1.2; // Standard pop for non-damage
    }
    
    engine.state.floatingTexts.push(ft);
}

// Updated spawnParticles to use new PoolUtils
export function spawnParticles(engine: IGameEngine, x: number, y: number, color: string, count: number) {
    if (engine.state.particles.length >= MAX_PARTICLES) return;
    const available = MAX_PARTICLES - engine.state.particles.length;
    const actualCount = Math.min(count, available);

    for(let i=0; i<actualCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4;
        const life = 30 + Math.random() * 20;
        
        const p = PoolUtils.getParticle(engine);
        p.x = x; p.y = y;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
        p.life = life;
        p.maxLife = life;
        p.color = color;
        p.size = 2 + Math.random() * 3;
        p.type = 'circle';
        p.rotation = Math.random() * Math.PI * 2;
        p.angularVelocity = (Math.random() - 0.5) * 0.2;
        p.scale = 1.0;
        p.scaleDelta = -0.01;
        p.alpha = 1.0;
        p.alphaDelta = 0;
        
        engine.state.particles.push(p);
    }
}

// New specialized emitter function for advanced effects
export function emitParticles(engine: IGameEngine, config: Partial<Particle> & { count: number, speed?: number, spread?: number }) {
    if (engine.state.particles.length >= MAX_PARTICLES) return;
    const count = config.count || 1;
    const available = MAX_PARTICLES - engine.state.particles.length;
    const actualCount = Math.min(count, available);
    const baseSpeed = config.speed || 4;
    
    for(let i=0; i<actualCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * baseSpeed;
        const life = config.life || 45;

        const p = PoolUtils.getParticle(engine);
        p.x = config.x || 0;
        p.y = config.y || 0;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
        p.life = life;
        p.maxLife = life;
        p.color = config.color || '#ffffff';
        p.size = config.size || 3;
        p.type = config.type || 'circle';
        p.rotation = config.rotation || Math.random() * 6;
        p.angularVelocity = config.angularVelocity || (Math.random() - 0.5) * 0.2;
        p.scale = config.scale || 1;
        p.scaleDelta = config.scaleDelta || -0.02;
        p.alpha = config.alpha || 1;
        p.alphaDelta = config.alphaDelta || 0;
        p.blendMode = config.blendMode;
        p.text = config.text;
        
        engine.state.particles.push(p);
    }
}

// --- NEW VISUAL: SPAWN LIGHTNING (Optimized LOD) ---
export function spawnLightning(engine: IGameEngine, x1: number, y1: number, x2: number, y2: number, color: string) {
    // LOD CHECK: If too many lightnings, fallback to simple sparks (Visual Deception)
    const lightningCount = engine.state.particles.filter(p => p.type === 'lightning').length;
    
    if (lightningCount > 10) {
        // Just spawn a spark at the target to simulate hit
        if (engine.state.particles.length < MAX_PARTICLES) {
            const p = PoolUtils.getParticle(engine);
            p.x = x2; 
            p.y = y2;
            p.color = color;
            p.type = 'spark'; // Simple spark/rect
            p.life = 10;
            p.maxLife = 10;
            p.size = 3 + Math.random() * 2;
            p.scaleDelta = -0.1;
            p.blendMode = 'lighter';
            engine.state.particles.push(p);
        }
        return;
    }

    if (engine.state.particles.length >= MAX_PARTICLES) return;
    
    const p = PoolUtils.getParticle(engine);
    p.x = x1;
    p.y = y1;
    p.tx = x2;
    p.ty = y2;
    p.color = color;
    p.type = 'lightning';
    p.life = 8; // Brief flash
    p.maxLife = 8;
    p.alpha = 1;
    p.alphaDelta = -0.1;
    
    engine.state.particles.push(p);
}
