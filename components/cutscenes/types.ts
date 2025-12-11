
export interface ScriptLine {
  speaker: 'player' | 'boss' | 'narrator' | 'elite' | 'ally'; 
  name: string;        
  avatar: string; // Fixed character identity
  emotion?: string; // Floating emotion bubble
  text: string;        
  side: 'left' | 'right' | 'center'; 
  bgTheme?: 'normal' | 'boss' | 'elite' | 'red' | 'purple' | 'black'; 
  vfx?: 'code_rain' | 'sweep' | 'shake' | 'explosion';
}
