
import { AMBIENT_CHORDS, AMBIENT_TWINKLE_SCALE, STORY_NOTES, SHOP_SCALE, BATTLE_NOTES, BATTLE_BASS_FREQ, BATTLE_FILTER_FREQ, GAMEOVER_NOTES } from "./presets/BGMData";
import { SoundConfig } from "./presets/SFXData";

type PlayToneFn = (config: SoundConfig, startTime?: number) => void;

export class MusicDirector {
    private ctx: AudioContext;
    private outputGain: GainNode; // Controlled gain for fade in/out
    private playTone: PlayToneFn;
    private getBuffer: (id: string) => AudioBuffer | undefined; // Access to baked buffers
    
    private activeNodes: AudioNode[] = [];
    private activeTimeouts: number[] = [];
    private currentType: string = 'none';

    constructor(
        ctx: AudioContext, 
        outputGain: GainNode, 
        playToneFn: PlayToneFn,
        getBufferFn: (id: string) => AudioBuffer | undefined
    ) {
        this.ctx = ctx;
        this.outputGain = outputGain;
        this.playTone = playToneFn;
        this.getBuffer = getBufferFn;
    }

    // --- Core Control ---

    stop() {
        // Cancel scheduled ramps to prevent conflicts
        this.outputGain.gain.cancelScheduledValues(this.ctx.currentTime);
        
        // Stop nodes
        this.activeNodes.forEach(n => {
            try { (n as any).stop && (n as any).stop(); } catch(e){}
            try { n.disconnect(); } catch(e){}
        });
        this.activeNodes = [];

        this.activeTimeouts.forEach(clearTimeout);
        this.activeTimeouts = [];
        
        this.currentType = 'none';
    }

    private fadeIn(duration: number = 2.0, targetVol: number = 0.5) {
        const now = this.ctx.currentTime;
        this.outputGain.gain.cancelScheduledValues(now);
        this.outputGain.gain.setValueAtTime(0, now);
        this.outputGain.gain.linearRampToValueAtTime(targetVol, now + duration);
    }

    private registerNode(...nodes: AudioNode[]) {
        this.activeNodes.push(...nodes);
    }

    private setTimeout(fn: () => void, ms: number) {
        const id = window.setTimeout(() => {
            const idx = this.activeTimeouts.indexOf(id);
            if (idx > -1) this.activeTimeouts.splice(idx, 1);
            fn();
        }, ms);
        this.activeTimeouts.push(id);
        return id;
    }

    // --- BGM Logic (Volumes Adjusted Lower) ---

    playAmbient(maxVolume: number) {
        if (this.currentType === 'ambient') return;
        this.stop();
        this.currentType = 'ambient';

        // Gentle Fade In - Extended to 6.0s to prevent loud first note startle
        this.fadeIn(6.0, 0.4); 

        let chordIdx = 0;

        const playChord = () => {
            if (this.currentType !== 'ambient') return;
            
            const notes = AMBIENT_CHORDS[chordIdx];
            notes.forEach((freq) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                
                osc.type = 'sine'; 
                osc.frequency.value = freq + (Math.random() - 0.5) * 2;
                
                const now = this.ctx.currentTime;
                const attack = 2.0 + Math.random();
                const decay = 4.0 + Math.random();
                
                // Low volume for background ambiance
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(0.03, now + attack); // Reduced from 0.05
                gain.gain.exponentialRampToValueAtTime(0.001, now + attack + decay);

                osc.connect(gain);
                gain.connect(this.outputGain);
                
                osc.start(now);
                osc.stop(now + attack + decay + 1);
                
                this.registerNode(osc, gain); 
            });

            chordIdx = (chordIdx + 1) % AMBIENT_CHORDS.length;
            this.setTimeout(playChord, 6000);
        };

        const playTwinkle = () => {
            if (this.currentType !== 'ambient') return;
             const freq = AMBIENT_TWINKLE_SCALE[Math.floor(Math.random() * AMBIENT_TWINKLE_SCALE.length)];
             // Workaround: We just keep volume very low here since playTone uses main master gain.
             this.playTone({
                 type: 'triangle',
                 startFreq: freq,
                 duration: 2.0,
                 volume: 0.015, // Very quiet
                 rampType: 'linear'
             });
             this.setTimeout(playTwinkle, 2000 + Math.random() * 4000);
        };

        playChord();
        playTwinkle();
    }

    playStory() {
        if (this.currentType === 'story') return;
        this.stop();
        this.currentType = 'story';
        
        // Attempt to play the high-quality loop
        const tryPlayLoop = () => {
            const buffer = this.getBuffer('story_theme');
            if (buffer) {
                // If we were polling, clear any pending timeouts
                this.activeTimeouts.forEach(clearTimeout);
                this.activeTimeouts = [];

                this.fadeIn(2.0, 0.6); // Fade in over 2s
                
                const source = this.ctx.createBufferSource();
                source.buffer = buffer;
                source.loop = true;
                source.connect(this.outputGain);
                source.start();
                
                this.registerNode(source);
                return true;
            }
            return false;
        };

        if (tryPlayLoop()) {
            return;
        }

        // --- Fallback & Polling ---
        // If buffer isn't ready yet, play placeholder random notes and poll for buffer
        console.log("Story BGM not ready, polling...");
        this.fadeIn(1.0, 0.5);

        const playFallbackOrSwitch = () => {
            if (this.currentType !== 'story') return;
            
            // 1. Check if Buffer is ready now
            if (tryPlayLoop()) {
                console.log("Story BGM loaded, switching.");
                return; // Exit fallback loop
            }

            // 2. Play Placeholder Note
            const freq = STORY_NOTES[Math.floor(Math.random() * STORY_NOTES.length)] * (Math.random() > 0.8 ? 2 : 1);
            this.playTone({
                type: 'triangle', startFreq: freq, duration: 0.2, volume: 0.05,
            });
            
            // 3. Schedule next check
            this.setTimeout(playFallbackOrSwitch, 200);
        };
        
        playFallbackOrSwitch();
    }

    playBossIntro() {
        if (this.currentType === 'boss') return;
        this.stop();
        this.currentType = 'boss';
        this.outputGain.gain.value = 0.6; // Instant start for boss

        const playDrum = () => {
            if (this.currentType !== 'boss') return;
            this.playTone({
                type: 'triangle', startFreq: 80, endFreq: 30, duration: 0.5, volume: 0.4, rampType: 'exponential'
            });
        };

        const playTension = () => {
             if (this.currentType !== 'boss') return;
             const osc = this.ctx.createOscillator();
             const gain = this.ctx.createGain();
             osc.type = 'sawtooth'; osc.frequency.value = 800; 
             const lfo = this.ctx.createOscillator(); lfo.frequency.value = 15; 
             const lfoGain = this.ctx.createGain(); lfoGain.gain.value = 20;
             lfo.connect(lfoGain); lfoGain.connect(osc.frequency);
             
             const now = this.ctx.currentTime;
             gain.gain.setValueAtTime(0, now);
             gain.gain.linearRampToValueAtTime(0.03, now + 1); // Reduced volume
             gain.gain.linearRampToValueAtTime(0, now + 2);
             
             osc.connect(gain); gain.connect(this.outputGain);
             osc.start(); lfo.start();
             osc.stop(now + 2.2); lfo.stop(now + 2.2);
             this.registerNode(osc, gain, lfo, lfoGain);
        };

        let beat = 0;
        const loop = () => {
            if (this.currentType !== 'boss') return;
            if (beat % 4 === 0) playDrum(); 
            if (beat % 8 === 6) playDrum(); 
            if (beat % 16 === 0) playTension(); 
            beat++;
            this.setTimeout(loop, 300); 
        };
        loop();
    }

    playShop() {
        if (this.currentType === 'shop') return;
        this.stop();
        this.currentType = 'shop';
        this.fadeIn(1.0, 0.4);

        const playNote = () => {
            if (this.currentType !== 'shop') return;
            const noteIdx = Math.floor(Math.random() * SHOP_SCALE.length);
            let freq = SHOP_SCALE[noteIdx];
            if (Math.random() > 0.7) freq /= 2;
            this.playTone({
                type: Math.random() > 0.5 ? 'sine' : 'triangle', startFreq: freq, duration: 1.0, volume: 0.03
            });
            this.setTimeout(playNote, [400, 600, 800][Math.floor(Math.random() * 3)]);
        };
        playNote();
    }

    playBattle() {
        if (this.currentType === 'battle') return;
        this.stop();
        this.currentType = 'battle';
        this.fadeIn(2.0, 0.5); // Slow fade in for battle

        // Bass Drone
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'sawtooth'; bassOsc.frequency.value = BATTLE_BASS_FREQ;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass'; filter.frequency.value = BATTLE_FILTER_FREQ;

        bassOsc.connect(filter); filter.connect(bassGain); bassGain.connect(this.outputGain);
        bassGain.gain.value = 0.02; // Reduced drone volume
        bassOsc.start();
        this.registerNode(bassOsc, bassGain, filter);

        // Melody Loop
        let noteIndex = 0;
        const playNote = () => {
          if (this.currentType !== 'battle') return;
          // Very quiet melody to not clash with shooting
          this.playTone({ type: 'square', startFreq: BATTLE_NOTES[noteIndex], duration: 0.35, volume: 0.015 });
          noteIndex = (noteIndex + 1) % BATTLE_NOTES.length;
          this.setTimeout(playNote, 180); 
        };
        playNote();
    }

    playGameOver() {
        if (this.currentType === 'gameover') return;
        this.stop();
        this.currentType = 'gameover';
        this.outputGain.gain.value = 0.5;

        let noteIndex = 0;
        const playNote = () => {
            if (this.currentType !== 'gameover') return;
            this.playTone({ type: 'sine', startFreq: GAMEOVER_NOTES[noteIndex], duration: 2.1, volume: 0.04 });
            noteIndex = (noteIndex + 1) % GAMEOVER_NOTES.length;
            this.setTimeout(playNote, 1500); 
        };
        playNote();
    }
}
