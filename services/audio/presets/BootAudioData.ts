
// Boot Sequence Audio Configuration

// 1. ENGINE START (Cinematic Deep Drone - High End Style)
// Represents the "Spaghetti Engine" with a sense of scale and mystery.
// Inspired by THX / Hans Zimmer style deep impacts.
export const BOOT_ENGINE_SFX = {
    duration: 4.5, // Much longer duration for atmosphere
    volume: 0.7,
    components: [
        // Layer 1: Sub-bass Swell (The Foundation)
        // Starts low, drops slightly, holds long.
        { 
            type: 'sine', 
            startFreq: 60, 
            endFreq: 30, 
            duration: 4.0, 
            volume: 0.8, 
            attack: 0.1, // Not instant, but heavy
            rampType: 'exponential' 
        },
        // Layer 2: Texture Pad (Sawtooth with Lowpass Filter opening)
        // Adds the "Tech" feel, evolving over time.
        { 
            type: 'sawtooth', 
            startFreq: 55, // Low A
            endFreq: 55, 
            duration: 3.5, 
            volume: 0.25, 
            attack: 0.5, // Fade in slowly
            filterType: 'lowpass',
            filterFreq: 100,
            filterEndFreq: 600, // Filter opens up to reveal brightness
            rampType: 'linear'
        },
        // Layer 3: High Tension Shimmer (Subtle)
        // Adds "gloss" to the sound.
        { 
            type: 'triangle', 
            startFreq: 220, 
            duration: 3.0, 
            volume: 0.05, 
            attack: 1.0,
            filterType: 'highpass',
            filterFreq: 1000
        },
        // Layer 4: Stereo Widener Simulation (Detuned layer)
        { 
            type: 'sawtooth', 
            startFreq: 56, // Slightly detuned from 55
            duration: 3.5, 
            volume: 0.2, 
            attack: 0.5,
            filterType: 'lowpass',
            filterFreq: 100,
            filterEndFreq: 500
        }
    ]
};

// 2. STUDIO LOGO (Ethereal Crystal Chord)
// Represents "Ev Studio" - Clean, creative, futuristic.
// Chord: Am9 (A, C, E, G, B) for a mysterious/thoughtful vibe.
export const BOOT_STUDIO_SFX = {
    duration: 5.0,
    volume: 0.5,
    components: [
        // Base Pad (Am7)
        { type: 'triangle', startFreq: 220.00, duration: 4.0, volume: 0.15, attack: 0.5 }, // A3
        { type: 'triangle', startFreq: 261.63, duration: 4.0, volume: 0.15, attack: 0.6 }, // C4
        { type: 'triangle', startFreq: 329.63, duration: 4.0, volume: 0.15, attack: 0.7 }, // E4
        { type: 'triangle', startFreq: 392.00, duration: 4.0, volume: 0.15, attack: 0.8 }, // G4
        // High Sparkle (Extension)
        { type: 'sine', startFreq: 493.88, duration: 3.5, volume: 0.1, attack: 0.9 },   // B4
        { type: 'sine', startFreq: 1174.66, duration: 3.0, volume: 0.05, attack: 0.2 }, // D6 (Ping)
        { type: 'sine', startFreq: 1567.98, duration: 3.0, volume: 0.03, attack: 1.5 }  // G6 (Echo)
    ]
};

// 3. WARNING (Deep Throbbing Pulse)
// Represents the Health & Safety Warning - Oppressive, serious low frequency.
export const BOOT_WARNING_SFX = {
    duration: 6.0,
    volume: 0.5,
    components: [
        // Sub Pulse (Binaural beat style detuning)
        { type: 'square', startFreq: 60, duration: 6.0, volume: 0.15, filterFreq: 100, filterType: 'lowpass' },
        { type: 'sawtooth', startFreq: 62, duration: 6.0, volume: 0.15, filterFreq: 120, filterType: 'lowpass' },
        // High Tension Whine (Barely audible, subconscious tension)
        { type: 'sine', startFreq: 12000, endFreq: 12000, duration: 5.0, volume: 0.01 }
    ]
};

// 4. TRANSITION (Vacuum/Suck Back)
// Used when entering the main menu.
export const BOOT_TRANSITION_SFX = {
    duration: 0.8,
    volume: 0.6,
    type: 'noise',
    attack: 0.0,
    filterType: 'highpass',
    startFreq: 500,
    endFreq: 5000, // Sweep up
    rampType: 'exponential'
};
