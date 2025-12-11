
// SFX Configuration Presets

import { BOOT_ENGINE_SFX, BOOT_STUDIO_SFX, BOOT_WARNING_SFX, BOOT_TRANSITION_SFX } from "./BootAudioData";

export interface SoundConfig {
    type?: 'sine' | 'square' | 'sawtooth' | 'triangle' | 'noise'; // Added 'noise'
    startFreq?: number; // Optional for container/noise
    endFreq?: number;
    duration: number;
    volume: number;
    attack?: number; // Fade-in duration
    filterFreq?: number;
    filterEndFreq?: number;
    filterType?: BiquadFilterType; // 'lowpass', 'highpass', 'bandpass', etc.
    rampType?: 'linear' | 'exponential';
    distortion?: number;
    components?: SoundConfig[]; // New: Layered sounds
}

// --- UNIFIED SOUND LIBRARY ---
export const SOUND_LIBRARY: Record<string, SoundConfig | SoundConfig[]> = {
    // --- BOOT SEQUENCE (NEW) ---
    'boot_engine': BOOT_ENGINE_SFX as SoundConfig,
    'boot_studio': BOOT_STUDIO_SFX as SoundConfig,
    'boot_warning': BOOT_WARNING_SFX as SoundConfig,
    'boot_transition': BOOT_TRANSITION_SFX as SoundConfig,

    // Player Actions (UNCHANGED)
    'player_shoot': [
        { type: 'triangle', startFreq: 220, endFreq: 50, duration: 0.15, volume: 0.1, rampType: 'exponential' },
        { type: 'triangle', startFreq: 240, endFreq: 50, duration: 0.15, volume: 0.1, rampType: 'exponential' },
        { type: 'triangle', startFreq: 200, endFreq: 50, duration: 0.15, volume: 0.1, rampType: 'exponential' }
    ],

    // UI & Feedback
    'ui_coin': { type: 'sine', startFreq: 1200, endFreq: 1600, duration: 0.3, volume: 0.1, rampType: 'exponential' },
    'ui_hit': { type: 'triangle', startFreq: 100, endFreq: 50, duration: 0.1, volume: 0.05, rampType: 'linear' },
    'ui_typewriter': { type: 'sine', startFreq: 800, duration: 0.06, volume: 0.03, rampType: 'exponential' },
    'ui_shield_break': { type: 'triangle', startFreq: 800, endFreq: 200, duration: 0.3, volume: 0.1, rampType: 'exponential' },
    'ui_powerup': { type: 'sine', startFreq: 400, endFreq: 800, duration: 0.2, volume: 0.1, rampType: 'linear' },

    // Glitch Effects (Menu & UI) - REFACTORED: Atmospheric Static Bed
    'ui_glitch_severe': {
        duration: 3.5,
        volume: 0.05, // Lower overall volume
        components: [
            // Layer 1: The Mains Hum (Electrical Grounding Noise)
            {
                type: 'sawtooth',
                startFreq: 55, // 55Hz Hum
                duration: 3.5,
                volume: 0.05,
                attack: 1.5, // Slow fade in
                filterType: 'lowpass',
                filterFreq: 120, 
                rampType: 'linear'
            },
            // Layer 2: The Static Floor (Bandpass Noise)
            {
                type: 'noise',
                duration: 3.5,
                volume: 0.04,
                attack: 1.5,
                filterType: 'bandpass',
                filterFreq: 1500, // Mid-range radio static
                rampType: 'linear'
            }
        ]
    },
    'ui_glitch_minor': { 
        // Geiger Counter Click (Dry, short, high-pass)
        type: 'noise', 
        duration: 0.005, 
        volume: 0.08, 
        filterType: 'highpass', 
        filterFreq: 3000 
    }, 
    'ui_static_tick': { type: 'noise', duration: 0.02, volume: 0.02, filterFreq: 4000 }, 
    'ui_power_down': { type: 'sine', startFreq: 2000, endFreq: 50, duration: 0.4, volume: 0.03, rampType: 'exponential' }, 

    // --- PACMAN SOUNDS (8-bit Retro) ---
    // 1. Waka Waka (Short Triangle Blip) - Played repeatedly
    'pacman_waka': {
        type: 'triangle',
        startFreq: 300,
        endFreq: 50,
        duration: 0.15,
        volume: 0.2,
        rampType: 'linear'
    },
    // 2. Power Pellet Activate (Siren loop-ish sound)
    'pacman_power_up': {
        duration: 1.5,
        volume: 0.3,
        components: [
            { type: 'sine', startFreq: 400, endFreq: 1200, duration: 1.5, volume: 0.2, rampType: 'linear' }, // Rising siren
            { type: 'square', startFreq: 600, endFreq: 800, duration: 1.5, volume: 0.05, rampType: 'linear' }  // Digital buzz
        ]
    },
    // 3. Eat Ghost (Chirp)
    'pacman_eat_ghost': {
        type: 'sawtooth',
        startFreq: 800,
        endFreq: 1600,
        duration: 0.2,
        volume: 0.3,
        rampType: 'exponential'
    },

    // --- REVIVE SOUNDS (CYBERPUNK REWORK) ---
    // Phase 1: The Fatal Error (Sharp Glitch Stop)
    'revive_error': {
        duration: 0.5,
        volume: 0.5,
        components: [
            { type: 'sawtooth', startFreq: 50, endFreq: 10, duration: 0.3, volume: 0.4, distortion: 50 },
            { type: 'square', startFreq: 2000, endFreq: 500, duration: 0.1, volume: 0.2, rampType: 'exponential' },
            { type: 'noise', duration: 0.2, volume: 0.3, filterType: 'highpass', filterFreq: 1000 }
        ]
    },
    // Phase 2: Data Injection (Dial-up modem style + Bass rise)
    'revive_inject': {
        duration: 2.0,
        volume: 0.4,
        components: [
            // Rising Data Stream
            { type: 'square', startFreq: 200, endFreq: 1200, duration: 2.0, volume: 0.1, rampType: 'linear' },
            // Bass Swell
            { type: 'sine', startFreq: 30, endFreq: 100, duration: 2.0, volume: 0.4, attack: 0.5 },
            // Digital Chatter
            { type: 'sawtooth', startFreq: 800, endFreq: 200, duration: 0.1, volume: 0.05 } // Short blip repeated manually or just once here
        ]
    },
    // Phase 3: Hard Reboot (Heavy Bass Drop + Clear Chime)
    'revive_reboot': {
        duration: 1.5,
        volume: 0.7,
        components: [
            // The Drop
            { type: 'sine', startFreq: 150, endFreq: 10, duration: 1.0, volume: 0.6, rampType: 'exponential' },
            // The Clarity (Reboot success)
            { type: 'triangle', startFreq: 1000, endFreq: 2000, duration: 0.5, volume: 0.2, attack: 0.05 },
            // The Shockwave
            { type: 'noise', duration: 0.5, volume: 0.4, filterFreq: 500, filterEndFreq: 100, filterType: 'lowpass' }
        ]
    },

    // Explosions
    'explosion_normal': [
        { type: 'triangle', startFreq: 80, endFreq: 10, duration: 0.6, volume: 0.6, filterFreq: 300, filterEndFreq: 50, rampType: 'exponential' },
        { type: 'sine', startFreq: 120, endFreq: 20, duration: 0.4, volume: 0.8, filterFreq: 150, rampType: 'exponential' },
    ],
    
    // High-Fidelity Layered Cyber Explosion
    'explosion_cyber': [
        // Variation 1: Deep Impact
        {
            duration: 0.8,
            volume: 0.4, 
            components: [
                { type: 'sine', startFreq: 100, endFreq: 5, duration: 0.8, volume: 0.4, rampType: 'exponential' },
                { type: 'noise', duration: 0.5, volume: 0.2, filterFreq: 800, filterEndFreq: 20, rampType: 'exponential', distortion: 5 },
                { type: 'sawtooth', startFreq: 1200, endFreq: 100, duration: 0.25, volume: 0.04, distortion: 20, rampType: 'exponential' }
            ]
        },
        // Variation 2: Glitch Scatter
        {
            duration: 0.6,
            volume: 0.4, 
            components: [
                { type: 'triangle', startFreq: 140, endFreq: 30, duration: 0.4, volume: 0.25, rampType: 'exponential' },
                { type: 'noise', duration: 0.3, volume: 0.15, filterFreq: 2000, filterEndFreq: 50, rampType: 'exponential', distortion: 10 },
                { type: 'sawtooth', startFreq: 1800, endFreq: 100, duration: 0.15, volume: 0.03, rampType: 'exponential' }
            ]
        }
    ],

    // Redesigned Neon Sanction (Holy Tech Launch)
    'neon_launch': {
        duration: 3.0,
        volume: 0.35, // Lowered significantly from 0.6
        components: [
            // Layer 1: Divine Resonance (Lower Octave, warm pad)
            { 
                type: 'triangle', 
                startFreq: 440, // A4
                endFreq: 440,   
                duration: 2.5, 
                volume: 0.2, 
                attack: 0.5,
                filterFreq: 800, // Lowpass to soften sharpness
                filterType: 'lowpass'
            },
            // Layer 2: Harmonic Shimmer (Higher Octave, very soft)
            { 
                type: 'sine', 
                startFreq: 880, // A5
                endFreq: 880,
                duration: 2.0, 
                volume: 0.05, 
                attack: 0.2,
            },
            // Layer 3: Holy Bass Surge (Power)
            { 
                type: 'sawtooth', 
                startFreq: 50, 
                endFreq: 80, // Subtle rise
                duration: 1.5, 
                volume: 0.25, 
                filterFreq: 150,
                filterType: 'lowpass',
                attack: 0.1
            },
            // Layer 4: Ethereal Wind (Noise sweep for atmosphere)
            { 
                type: 'noise', 
                duration: 2.0, 
                volume: 0.1, 
                filterFreq: 400,
                filterEndFreq: 1200, // Sweep up
                filterType: 'bandpass',
                attack: 0.5
            }
        ]
    },
    'neon_impact': {
        duration: 0.4,
        volume: 0.6, 
        components: [
            { type: 'sawtooth', startFreq: 800, endFreq: 100, duration: 0.2, volume: 0.15, rampType: 'exponential' },
            { type: 'sine', startFreq: 150, endFreq: 50, duration: 0.2, volume: 0.3, rampType: 'exponential' }
        ]
    },

    // Enemy Attacks
    'shoot_keyboard_man': { type: 'sine', startFreq: 600, endFreq: 300, duration: 0.1, volume: 0.02, rampType: 'exponential' },
    'shoot_marketing_account': { type: 'triangle', startFreq: 150, endFreq: 50, duration: 0.15, volume: 0.025, filterFreq: 400, rampType: 'linear' },
    'shoot_boss_kpi': { type: 'sawtooth', startFreq: 80, endFreq: 40, duration: 0.2, volume: 0.04, filterFreq: 200, rampType: 'linear' },
    'shoot_boss_glitch': { type: 'square', startFreq: 120, endFreq: 30, duration: 0.2, volume: 0.04, filterFreq: 500, rampType: 'exponential' },
    'shoot_boss_ai': { type: 'sawtooth', startFreq: 220, endFreq: 55, duration: 0.2, volume: 0.04, filterFreq: 800, rampType: 'exponential' },
    'shoot_da_ye': { type: 'sine', startFreq: 300, endFreq: 100, duration: 0.2, volume: 0.02, rampType: 'exponential' },
    'shoot_chi_gua': { type: 'square', startFreq: 800, duration: 0.05, volume: 0.01, filterFreq: 1000 },
    'shoot_default': { type: 'triangle', startFreq: 300, endFreq: 100, duration: 0.1, volume: 0.015, rampType: 'exponential' }
};

// Compatibility exports
export const ENEMY_SHOOT_CONFIGS: Record<string, SoundConfig> = {
    'keyboard_man': SOUND_LIBRARY['shoot_keyboard_man'] as SoundConfig,
    'marketing_account': SOUND_LIBRARY['shoot_marketing_account'] as SoundConfig,
    'boss_kpi': SOUND_LIBRARY['shoot_boss_kpi'] as SoundConfig,
    'boss_glitch': SOUND_LIBRARY['shoot_boss_glitch'] as SoundConfig,
    'boss_ai': SOUND_LIBRARY['shoot_boss_ai'] as SoundConfig,
    'da_ye': SOUND_LIBRARY['shoot_da_ye'] as SoundConfig,
    'chi_gua': SOUND_LIBRARY['shoot_chi_gua'] as SoundConfig,
    'default': SOUND_LIBRARY['shoot_default'] as SoundConfig
};

export const SHOOT_VARIATIONS = [220, 240, 200];
export const COIN_SFX = SOUND_LIBRARY['ui_coin'] as SoundConfig;
export const HIT_SFX = SOUND_LIBRARY['ui_hit'] as SoundConfig;
export const TYPEWRITER_SFX = SOUND_LIBRARY['ui_typewriter'] as SoundConfig;
