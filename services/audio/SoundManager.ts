
import { SOUND_LIBRARY, SoundConfig } from "./presets/SFXData";
import { ACHIEVEMENT_NOTES, STORY_THEME_CONFIG } from "./presets/BGMData";
import { MusicDirector } from "./MusicDirector";

export class SoundManager {
  ctx: AudioContext | null = null;
  masterGain: GainNode | null = null;
  bgmGain: GainNode | null = null; // New: Dedicated BGM channel
  
  // The music director handles sequencing
  private musicDirector: MusicDirector | null = null;
  
  muted: boolean = false;
  volume: number = 0.5;
  
  noiseBuffer: AudioBuffer | null = null; // Cache noise
  bufferCache: Map<string, AudioBuffer> = new Map(); // New: Baked Audio Cache

  // --- AUDIO OPTIMIZATION: Throttling ---
  private lastPlayed: Record<string, number> = {};
  private readonly COOLDOWNS: Record<string, number> = {
      'explosion_cyber': 80,  
      'explosion_normal': 80, 
      'player_shoot': 50,     
      'ui_coin': 40,          
      'ui_hit': 50,           
      'ui_typewriter': 30,
      'neon_impact': 80,
      'ui_glitch_minor': 80
  };
  private readonly DEFAULT_COOLDOWN = 30;

  // --- PROCEDURAL AUDIO STATE ---
  private hoverNodes: AudioNode[] = [];

  constructor() {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContext();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = this.volume;
      
      // BGM Channel (Connected to Master)
      this.bgmGain = this.ctx.createGain();
      this.bgmGain.connect(this.masterGain);
      this.bgmGain.gain.value = 1.0; // Controlled by MusicDirector

      // Generate White Noise Buffer once
      this.createNoiseBuffer();

      // Initialize Music Director with BGM Gain
      this.musicDirector = new MusicDirector(
          this.ctx, 
          this.bgmGain, 
          this.playTone.bind(this),
          (id) => this.bufferCache.get(id) // Pass buffer getter
      );

      // Start Baking Heavy Sounds
      this.bakeCommonSounds();
      this.bakeStoryBGM(); // Bake the Story BGM loop

    } catch (e) {
      console.error("Web Audio API not supported");
    }
  }

  private createNoiseBuffer() {
      if (!this.ctx) return;
      const bufferSize = this.ctx.sampleRate * 2; 
      this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
      }
  }

  // --- AUDIO BAKING (Pre-rendering) ---
  private async bakeCommonSounds() {
      const heavyKeys = [
          'explosion_cyber', 
          'neon_launch', 
          'neon_impact', 
          'explosion_normal', 
          'player_shoot', 
          'ui_coin', 
          'ui_hit',
          'revive_enter',
          'revive_shatter'
      ];
      for (const key of heavyKeys) {
          if (!this.bufferCache.has(key)) {
              await this.bakeAudio(key);
          }
      }
  }

  private async bakeStoryBGM() {
      if (this.bufferCache.has('story_theme')) return;

      const config = STORY_THEME_CONFIG;
      const duration = config.length;
      const sampleRate = 44100;
      
      try {
          const ctx = new OfflineAudioContext(2, sampleRate * duration, sampleRate);
          
          // 1. Texture Layer (Pink Noise Floor)
          const noise = ctx.createBufferSource();
          const noiseBuffer = ctx.createBuffer(1, sampleRate * duration, sampleRate);
          const data = noiseBuffer.getChannelData(0);
          let lastOut = 0;
          for(let i=0; i<data.length; i++) {
              const white = Math.random() * 2 - 1;
              data[i] = (lastOut + (0.02 * white)) / 1.02; // Simple pink noise
              lastOut = data[i];
              data[i] *= 3.5; 
          }
          noise.buffer = noiseBuffer;
          noise.loop = true;
          const noiseGain = ctx.createGain();
          noiseGain.gain.value = 0.03; // Subtle background texture
          noise.connect(noiseGain);
          noiseGain.connect(ctx.destination);
          noise.start();

          // 2. Chords (Pads)
          config.chords.forEach(chord => {
              const gain = ctx.createGain();
              gain.gain.value = 0.1;
              
              // ADSR Envelope
              gain.gain.setValueAtTime(0, chord.time);
              gain.gain.linearRampToValueAtTime(0.08, chord.time + 0.8);
              gain.gain.setValueAtTime(0.08, chord.time + chord.duration - 0.8);
              gain.gain.linearRampToValueAtTime(0, chord.time + chord.duration);

              const lpf = ctx.createBiquadFilter();
              lpf.type = 'lowpass';
              lpf.frequency.value = 400; // Muffled, underwater feel

              chord.notes.forEach(freq => {
                  // Oscillator 1
                  const osc = ctx.createOscillator();
                  osc.type = 'sawtooth';
                  osc.frequency.value = freq;
                  
                  // Oscillator 2 (Detuned)
                  const osc2 = ctx.createOscillator();
                  osc2.type = 'sawtooth';
                  osc2.frequency.value = freq;
                  osc2.detune.value = 8; 

                  osc.connect(lpf);
                  osc2.connect(lpf);
                  osc.start(chord.time);
                  osc.stop(chord.time + chord.duration);
                  osc2.start(chord.time);
                  osc2.stop(chord.time + chord.duration);
              });
              lpf.connect(gain);
              gain.connect(ctx.destination);
          });

          // 3. Melody (Digital Bleeps)
          config.melody.forEach(note => {
               const osc = ctx.createOscillator();
               osc.type = 'sine';
               osc.frequency.value = note.freq;
               
               const gain = ctx.createGain();
               gain.gain.setValueAtTime(0, note.time);
               gain.gain.linearRampToValueAtTime(note.vol, note.time + 0.05);
               gain.gain.exponentialRampToValueAtTime(0.001, note.time + note.duration);
               
               // Simple Delay line
               const delayOsc = ctx.createOscillator();
               delayOsc.type = 'sine';
               delayOsc.frequency.value = note.freq;
               const delayGain = ctx.createGain();
               delayGain.gain.setValueAtTime(0, note.time + 0.25);
               delayGain.gain.linearRampToValueAtTime(note.vol * 0.4, note.time + 0.3);
               delayGain.gain.exponentialRampToValueAtTime(0.001, note.time + note.duration + 0.25);

               osc.connect(gain);
               delayOsc.connect(delayGain);
               
               gain.connect(ctx.destination);
               delayGain.connect(ctx.destination);
               
               osc.start(note.time);
               osc.stop(note.time + note.duration + 0.1);
               delayOsc.start(note.time + 0.25);
               delayOsc.stop(note.time + note.duration + 0.35);
          });

          const buffer = await ctx.startRendering();
          this.bufferCache.set('story_theme', buffer);
      } catch (e) {
          console.warn("Failed to bake story BGM", e);
      }
  }

  private getMaxDuration(config: SoundConfig): number {
      if (config.components) {
          return Math.max(...config.components.map(c => this.getMaxDuration(c)));
      }
      return config.duration;
  }

  private async bakeAudio(key: string) {
      const rawConfig = SOUND_LIBRARY[key];
      if (!rawConfig) return;
      const config = Array.isArray(rawConfig) ? rawConfig[0] : rawConfig;
      
      const duration = this.getMaxDuration(config) + 0.2; // Add tail
      const sampleRate = 44100;
      
      try {
          const offlineCtx = new OfflineAudioContext(1, sampleRate * duration, sampleRate);
          
          let offlineNoiseBuffer = null;
          if (this.noiseBuffer) {
              offlineNoiseBuffer = offlineCtx.createBuffer(1, this.noiseBuffer.length, this.noiseBuffer.sampleRate);
              offlineNoiseBuffer.getChannelData(0).set(this.noiseBuffer.getChannelData(0));
          }

          this.scheduleSound(offlineCtx, offlineCtx.destination, config, 0, 0, offlineNoiseBuffer);
          
          const buffer = await offlineCtx.startRendering();
          this.bufferCache.set(key, buffer);
      } catch (e) {
          console.warn(`Failed to bake audio ${key}`, e);
      }
  }

  setVolume(vol: number) {
      this.volume = Math.max(0, Math.min(1, vol));
      if (this.masterGain) {
          this.masterGain.gain.value = this.muted ? 0 : this.volume;
      }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMute(mute: boolean) {
      this.muted = mute;
      if (this.masterGain) {
          this.masterGain.gain.value = mute ? 0 : this.volume;
      }
      if (mute) {
          if (this.ctx && this.ctx.state === 'running') this.ctx.suspend();
      } else {
          if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
      }
  }

  stopBGM() {
      if (this.musicDirector) {
          this.musicDirector.stop();
      }
  }

  private makeDistortionCurve(amount: number) {
      const k = typeof amount === 'number' ? amount : 50;
      const n_samples = 44100;
      const curve = new Float32Array(n_samples);
      const deg = Math.PI / 180;
      for (let i = 0; i < n_samples; ++i) {
          const x = (i * 2) / n_samples - 1;
          curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
      }
      return curve;
  }

  // --- PROCEDURAL AUDIO METHODS ---

  public startHoverStatic() {
      if (this.muted || !this.ctx || !this.masterGain) return;
      this.stopHoverStatic(); 

      const now = this.ctx.currentTime;

      if (!this.noiseBuffer) this.createNoiseBuffer();
      const noiseSrc = this.ctx.createBufferSource();
      noiseSrc.buffer = this.noiseBuffer;
      noiseSrc.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(400, now);
      filter.frequency.linearRampToValueAtTime(600, now + 10); 
      filter.Q.value = 1.0;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.025, now + 1.0); 

      noiseSrc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noiseSrc.start(now);

      this.hoverNodes = [noiseSrc, filter, gain];
  }

  public stopHoverStatic() {
      if (this.hoverNodes.length === 0 || !this.ctx) return;
      const now = this.ctx.currentTime;
      const gainNode = this.hoverNodes[this.hoverNodes.length - 1] as GainNode;

      if (gainNode) {
          try {
            gainNode.gain.cancelScheduledValues(now);
            gainNode.gain.setValueAtTime(gainNode.gain.value, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
          } catch(e) {}
      }

      const nodesToStop = this.hoverNodes;
      this.hoverNodes = [];

      setTimeout(() => {
          nodesToStop.forEach(n => {
              try { (n as any).stop && (n as any).stop(); } catch(e){}
              try { n.disconnect(); } catch(e){}
          });
      }, 1000);
  }

  public playAtmosphericGlitch() {
      if (this.muted || !this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const duration = 2.5 + Math.random() * 2.0; 

      if (!this.noiseBuffer) this.createNoiseBuffer();
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass'; 
      filter.Q.value = 1.5;
      filter.frequency.setValueAtTime(1500, now);
      filter.frequency.linearRampToValueAtTime(1200 + Math.random() * 600, now + duration);

      const gain = this.ctx.createGain();
      const targetVol = 0.05; 

      gain.gain.setValueAtTime(0, now);
      
      let cursor = now;
      const attackTime = 0.8;
      const releaseTime = 0.5;
      const endTime = now + duration;
      
      gain.gain.linearRampToValueAtTime(targetVol, cursor + attackTime);
      cursor += attackTime;

      while (cursor < endTime - releaseTime) {
          const segmentDuration = 0.1 + Math.random() * 0.6; 
          const isSound = Math.random() > 0.3;
          const val = isSound ? targetVol : 0;
          gain.gain.setTargetAtTime(val, cursor, 0.02);
          cursor += segmentDuration;
      }

      gain.gain.setTargetAtTime(0, endTime - releaseTime, 0.1); 
      gain.gain.linearRampToValueAtTime(0, endTime);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start(now);
      noise.stop(endTime + 0.5);
      
      setTimeout(() => {
          noise.disconnect();
          filter.disconnect();
          gain.disconnect();
      }, (duration + 1.0) * 1000);
  }

  // --- CORE SOUND SCHEDULER (Context Agnostic) ---
  private scheduleSound(ctx: BaseAudioContext, dest: AudioNode, config: SoundConfig, startTime: number = 0, detune: number = 0, noiseBuf: AudioBuffer | null = null) {
      const now = startTime || ctx.currentTime;

      if (config.components) {
          config.components.forEach(c => this.scheduleSound(ctx, dest, c, now, detune, noiseBuf));
          return;
      }

      const gain = ctx.createGain();
      let source: AudioNode;

      if (config.type === 'noise') {
          const bufferToUse = noiseBuf || this.noiseBuffer;
          
          if (!bufferToUse && ctx instanceof AudioContext) {
               this.createNoiseBuffer();
               // @ts-ignore
               source = ctx.createBufferSource();
               // @ts-ignore
               (source as AudioBufferSourceNode).buffer = this.noiseBuffer;
          } else if (bufferToUse) {
               const bufSrc = ctx.createBufferSource();
               bufSrc.buffer = bufferToUse;
               bufSrc.detune.value = detune;
               source = bufSrc;
          } else {
               const osc = ctx.createOscillator();
               source = osc; 
          }
      } else {
          const osc = ctx.createOscillator();
          osc.type = config.type || 'sine';
          osc.detune.value = detune; 

          if (config.startFreq) {
              osc.frequency.setValueAtTime(config.startFreq, now);
              if (config.endFreq) {
                  if (config.rampType === 'linear') {
                      osc.frequency.linearRampToValueAtTime(config.endFreq, now + config.duration);
                  } else {
                      osc.frequency.exponentialRampToValueAtTime(config.endFreq, now + config.duration);
                  }
              }
          }
          source = osc;
      }

      let currentNode: AudioNode = source;

      if (config.distortion && config.distortion > 0) {
          const shaper = ctx.createWaveShaper();
          shaper.curve = this.makeDistortionCurve(config.distortion);
          shaper.oversample = '4x';
          currentNode.connect(shaper);
          currentNode = shaper;
      }

      if (config.filterFreq) {
          const filter = ctx.createBiquadFilter();
          filter.type = config.filterType || 'lowpass';
          filter.frequency.setValueAtTime(config.filterFreq, now);
          
          if (filter.type === 'bandpass') {
              filter.Q.value = 1.5; 
          }

          if (config.filterEndFreq) {
               if (config.rampType === 'linear') {
                   filter.frequency.linearRampToValueAtTime(config.filterEndFreq, now + config.duration);
               } else {
                   filter.frequency.exponentialRampToValueAtTime(config.filterEndFreq, now + config.duration);
               }
          }
          currentNode.connect(filter);
          currentNode = filter;
      }

      currentNode.connect(gain);
      gain.connect(dest);
      
      if (config.attack && config.attack > 0) {
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(config.volume, now + config.attack);
          gain.gain.exponentialRampToValueAtTime(0.001, now + config.duration);
      } else {
          gain.gain.setValueAtTime(config.volume, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + config.duration);
      }

      (source as AudioScheduledSourceNode).start(now);
      (source as AudioScheduledSourceNode).stop(now + config.duration + 0.1);
  }

  private playTone(config: SoundConfig, startTime?: number, detune: number = 0) {
      if (this.muted || !this.ctx || !this.masterGain) return;
      this.scheduleSound(this.ctx, this.masterGain, config, startTime, detune, this.noiseBuffer);
  }

  public play(id: string) {
      if (this.muted) return;
      
      const now = Date.now();
      const last = this.lastPlayed[id] || 0;
      const cooldown = this.COOLDOWNS[id] || this.DEFAULT_COOLDOWN;

      if (now - last < cooldown) return; 
      this.lastPlayed[id] = now;

      const entry = SOUND_LIBRARY[id];
      if (!entry) return;

      const variation = (Math.random() - 0.5) * 200; 

      if (this.bufferCache.has(id) && this.ctx) {
          const source = this.ctx.createBufferSource();
          source.buffer = this.bufferCache.get(id)!;
          source.detune.value = variation;
          source.connect(this.masterGain!);
          source.start();
          return;
      }

      const config = Array.isArray(entry) ? entry[Math.floor(Math.random() * entry.length)] : entry;
      this.playTone(config, undefined, variation);
  }

  public playCyberExplosion() {
      this.play('explosion_cyber');
  }

  public playNeonImpact() {
      this.play('neon_impact');
  }

  // --- BGM Methods ---
  
  playAmbientBGM() {
      if (!this.musicDirector || this.muted) return;
      this.musicDirector.playAmbient(this.volume);
  }

  playStoryBGM() {
      if (!this.musicDirector || this.muted) return;
      // Check if we need to bake?
      if (!this.bufferCache.has('story_theme')) {
          this.bakeStoryBGM();
      }
      this.musicDirector.playStory();
  }

  playBossIntroBGM() {
      if (!this.musicDirector || this.muted) return;
      this.musicDirector.playBossIntro();
  }

  playShopBGM() {
    if (!this.musicDirector || this.muted) return;
    this.musicDirector.playShop();
  }

  playBattleBGM() {
    if (!this.musicDirector || this.muted) return;
    this.musicDirector.playBattle();
  }
  
  playGameOverBGM() {
    if (!this.musicDirector || this.muted) return;
    this.musicDirector.playGameOver();
  }

  playAchievementSound() {
      if (this.muted || !this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      ACHIEVEMENT_NOTES.forEach((freq, i) => {
        this.playTone({ type: 'sine', startFreq: freq, duration: 0.5, volume: 0.1 }, now + i * 0.1);
      });
  }

  // Wrappers
  playShoot() { this.play('player_shoot'); }
  playEnemyShoot(enemyType: string) { 
      const key = `shoot_${enemyType}`;
      if (SOUND_LIBRARY[key]) this.play(key);
      else this.play('shoot_default');
  }
  playHit() { this.play('ui_hit'); }
  playCoin() { this.play('ui_coin'); }
  playTypewriter() { 
      const variant = { ...SOUND_LIBRARY['ui_typewriter'] as SoundConfig, startFreq: 800 + Math.random() * 200 };
      this.playTone(variant);
  }
  playExplosion() { this.play('explosion_normal'); }
  playShieldBreak() { this.play('ui_shield_break'); }
  playPowerup() { this.play('ui_powerup'); }
}
