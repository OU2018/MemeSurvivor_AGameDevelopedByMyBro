
export interface TrailConfig {
  type: 'smoke' | 'pixel' | 'spark' | 'line';
  color: string;
  interval: number; // Frames between particles
  timer: number;    // Internal counter
  size?: number;
}

export interface FloatingText {
  active?: boolean; // POOLING
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  vy: number;
  type?: 'damage' | 'chat' | 'gold'; 
  
  // POOLING/MERGING
  targetId?: string; // The entity ID this text belongs to
  value?: number; // Numeric value for merging
  scale?: number; // For pop animation
  
  // CRIT & MERGE SYSTEM
  isCrit?: boolean; // Is this a critical hit?
  mergeCount?: number; // How many numbers merged into this one?
}

// --- PARTICLE SYSTEM 2.0 ---
export interface Particle {
  active?: boolean; // POOLING
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number; // Added for alpha/scale calc
  color: string;
  size: number;
  
  // Advanced Visuals
  type?: 'circle' | 'rect' | 'ring' | 'text' | 'spark' | 'lightning';
  text?: string; // For 'text' type
  
  // For Lightning / Line particles
  tx?: number; // Target X
  ty?: number; // Target Y
  
  rotation?: number;
  angularVelocity?: number;
  
  scale?: number;
  scaleDelta?: number; // Change in scale per frame
  
  alpha?: number;
  alphaDelta?: number; // Change in alpha per frame
  
  blendMode?: GlobalCompositeOperation; // e.g. 'lighter' for fire/magic
}
