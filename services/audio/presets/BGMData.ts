
// BGM Data Presets

// --- Ambient BGM (Menu) ---
export const AMBIENT_CHORDS = [
    [261.63, 329.63, 392.00, 493.88], // Cmaj7
    [174.61, 220.00, 261.63, 329.63], // Fmaj7
    [220.00, 261.63, 329.63, 392.00], // Am7
    [196.00, 246.94, 293.66, 329.63], // G6
];

export const AMBIENT_TWINKLE_SCALE = [523.25, 587.33, 659.25, 783.99, 880.00];

// --- Story BGM (Procedural Config) ---
export const STORY_NOTES = [261.63, 329.63, 392.00, 523.25]; // Fallback

export const STORY_THEME_CONFIG = {
    length: 8.0, // seconds loop
    chords: [
        // Dark & Mystery: Cm9 -> AbMaj7
        { time: 0, duration: 4, notes: [130.81, 155.56, 196.00, 233.08] }, // C3, Eb3, G3, Bb3
        { time: 4, duration: 4, notes: [103.83, 130.81, 155.56, 196.00] }, // Ab2, C3, Eb3, G3
    ],
    melody: [
        // Sparse, digital bleeps (High pitch, low vol)
        { time: 0.0, freq: 783.99, duration: 0.1, vol: 0.04 }, // G5
        { time: 0.5, freq: 1174.66, duration: 0.1, vol: 0.02 }, // D6 (Echo)
        
        { time: 4.0, freq: 622.25, duration: 0.1, vol: 0.04 }, // Eb5
        { time: 4.5, freq: 932.33, duration: 0.1, vol: 0.02 }, // Bb5 (Echo)
        
        { time: 7.0, freq: 523.25, duration: 0.1, vol: 0.03 }, // C5
    ]
};

// --- Shop BGM ---
export const SHOP_SCALE = [261.63, 293.66, 329.63, 392.00, 440.00];

// --- Battle BGM ---
export const BATTLE_BASS_FREQ = 45;
export const BATTLE_FILTER_FREQ = 150;
export const BATTLE_NOTES = [
    110, 110, 130.81, 146.83, 130.81, 110, 
    164.81, 146.83, 130.81, 110, 110, 
    220, 196, 220, 261.63, 220, 196, 
    164.81, 130.81, 146.83, 110, 
    87.31, 87.31, 110, 130.81 
];

// --- Game Over BGM ---
export const GAMEOVER_NOTES = [220, 261.63, 196, 164.81, 146.83, 130.81];

// --- Achievement Jingle ---
export const ACHIEVEMENT_NOTES = [523.25, 659.25, 783.99, 1046.50];
