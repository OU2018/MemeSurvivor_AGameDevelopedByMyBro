
import React, { useState, useEffect, useRef } from 'react';
import { ScriptLine } from './types';
import { gameEngine } from '../../services/gameEngine';

interface CutsceneEngineProps {
    script: ScriptLine[];
    onFinish: () => void;
}

export const CutsceneEngine: React.FC<CutsceneEngineProps> = ({ script, onFinish }) => {
    const [step, setStep] = useState(0);
    const [displayedText, setDisplayedText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [animState, setAnimState] = useState<'enter' | 'idle' | 'exit'>('enter');
    
    // VFX State
    const [vfxElements, setVfxElements] = useState<React.ReactNode[]>([]);
    
    const typeIntervalRef = useRef<number | null>(null);
    const vfxIntervalRef = useRef<number | null>(null);

    const current = script[Math.min(step, script.length - 1)];

    // Clean up intervals
    useEffect(() => {
        return () => {
            if (typeIntervalRef.current) window.clearInterval(typeIntervalRef.current);
            if (vfxIntervalRef.current) window.clearInterval(vfxIntervalRef.current);
        };
    }, []);

    // VFX Logic
    useEffect(() => {
        if (!current) return;
        
        // Reset VFX if not persistent (or handle persistence logic)
        // For simplicity, we clear previous VFX when line changes, 
        // unless we want them to persist. Let's restart for now.
        setVfxElements([]); 
        if (vfxIntervalRef.current) {
            window.clearInterval(vfxIntervalRef.current);
            vfxIntervalRef.current = null;
        }

        if (current.vfx === 'code_rain') {
            const spawnCode = () => {
                const chars = "01<>{}bug;KPI";
                const left = Math.random() * 100;
                const duration = 1 + Math.random() * 2;
                const fontSize = 10 + Math.random() * 20;
                const text = chars[Math.floor(Math.random() * chars.length)];
                
                const el = (
                    <div key={Date.now() + Math.random()} 
                        className="absolute text-green-500 font-mono font-bold animate-fall pointer-events-none"
                        style={{
                            left: `${left}%`,
                            top: '-50px',
                            fontSize: `${fontSize}px`,
                            animationDuration: `${duration}s`,
                            opacity: 0.7
                        }}
                    >
                        {text}
                    </div>
                );
                
                setVfxElements(prev => [...prev.slice(-50), el]); // Keep max 50
            };
            vfxIntervalRef.current = window.setInterval(spawnCode, 50);
        } else if (current.vfx === 'sweep') {
            // Sweep effect: A big white swipe
            const el = (
                <div key="sweep" className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent animate-swipe pointer-events-none z-0" />
            );
            setVfxElements([el]);
            gameEngine.audio.play('ui_shield_break'); // Use existing sound as swipe
        } else if (current.vfx === 'shake') {
             // Shake logic handled in container class
             gameEngine.audio.playExplosion();
        }

    }, [current]);

    // Typewriter effect
    useEffect(() => {
        if (!current) return;
        
        setAnimState('enter');
        const fullText = current.text;
        setDisplayedText("");
        setIsTyping(true);
        let charIndex = 0;

        if (typeIntervalRef.current) {
            window.clearInterval(typeIntervalRef.current);
        }

        typeIntervalRef.current = window.setInterval(() => {
            if (charIndex < fullText.length) {
                setDisplayedText(fullText.substring(0, charIndex + 1));
                if (charIndex % 3 === 0) gameEngine.audio.playTypewriter();
                charIndex++;
            } else {
                setIsTyping(false);
                setAnimState('idle');
                if (typeIntervalRef.current) window.clearInterval(typeIntervalRef.current);
            }
        }, 30); 

    }, [step, current]);

    const handleClick = () => {
        if (isTyping) {
            if (typeIntervalRef.current) window.clearInterval(typeIntervalRef.current);
            setDisplayedText(current.text);
            setIsTyping(false);
            setAnimState('idle');
        } else {
            if (step < script.length - 1) {
                setStep(s => s + 1);
            } else {
                onFinish();
            }
        }
    };

    if (!current) return null;

    // --- THEME & LAYOUT LOGIC ---
    let bgStyle = "bg-slate-950";
    let bgPattern = "";
    
    if (current.bgTheme === 'boss' || current.bgTheme === 'red') {
        bgStyle = "bg-red-950";
        bgPattern = "radial-gradient(circle at center, rgba(153,27,27,0.4) 0%, rgba(0,0,0,0.8) 100%)";
    } else if (current.bgTheme === 'elite' || current.bgTheme === 'purple') {
        bgStyle = "bg-purple-950";
        bgPattern = "radial-gradient(circle at center, rgba(107,33,168,0.4) 0%, rgba(0,0,0,0.8) 100%)";
    } else {
        bgPattern = "radial-gradient(circle at bottom left, rgba(15,23,42,1) 0%, rgba(0,0,0,1) 100%)";
    }

    let borderColor = 'border-slate-500';
    let textColor = 'text-slate-200';
    let shadowColor = 'shadow-slate-500/20';
    let nameBg = 'bg-slate-700';

    if (current.speaker === 'boss') {
        borderColor = 'border-red-500';
        textColor = 'text-red-100';
        shadowColor = 'shadow-red-500/40';
        nameBg = 'bg-red-800';
    } else if (current.speaker === 'player') {
        borderColor = 'border-cyan-400';
        textColor = 'text-cyan-100';
        shadowColor = 'shadow-cyan-400/40';
        nameBg = 'bg-cyan-700';
    } else if (current.speaker === 'narrator') {
        borderColor = 'border-yellow-400';
        textColor = 'text-yellow-100';
        shadowColor = 'shadow-yellow-400/40';
        nameBg = 'bg-yellow-700';
    } else if (current.speaker === 'elite') {
        borderColor = 'border-purple-400';
        textColor = 'text-purple-100';
        shadowColor = 'shadow-purple-400/40';
        nameBg = 'bg-purple-800';
    }

    const isCenter = current.side === 'center';
    const isRight = current.side === 'right';
    const contentAnim = animState === 'enter' ? 'animate-pop-in' : '';
    const shakeClass = current.vfx === 'shake' ? 'animate-shake' : '';

    return (
        <div 
            className={`absolute inset-0 flex flex-col items-center justify-center z-[90] cursor-pointer select-none overflow-hidden ${bgStyle} ${shakeClass}`} 
            onClick={handleClick}
            style={{ background: bgPattern }}
        >
            <style>{`
                @keyframes fall {
                    0% { transform: translateY(0); opacity: 1; }
                    100% { transform: translateY(100vh); opacity: 0; }
                }
                .animate-fall { animation-name: fall; animation-timing-function: linear; }
                
                @keyframes swipe {
                    0% { transform: translateX(-100%) skewX(-20deg); }
                    100% { transform: translateX(200%) skewX(-20deg); }
                }
                .animate-swipe { animation: swipe 0.5s ease-out forwards; }

                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }
                .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
            `}</style>

            {/* VFX Layer */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                {vfxElements}
            </div>

            {/* CRT Scanline Overlay */}
            {(current.bgTheme === 'boss' || current.bgTheme === 'elite') && (
                <div className="absolute inset-0 pointer-events-none z-0 opacity-10" style={{
                    backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
                    backgroundSize: '100% 2px, 3px 100%'
                }} />
            )}

            <div className={`w-full max-w-5xl px-4 relative z-10 transition-all duration-300 ${contentAnim}`}>
                
                {/* CENTER LAYOUT */}
                {isCenter ? (
                    <div className="flex flex-col items-center text-center space-y-8">
                        <div className="text-9xl filter drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] animate-pulse relative">
                            {current.avatar}
                            {/* Center Emotion */}
                            {current.emotion && (
                                <div className="absolute -top-4 -right-8 text-6xl animate-bounce drop-shadow-md">
                                    {current.emotion}
                                </div>
                            )}
                        </div>
                        <div className={`
                            relative bg-black/80 px-12 py-10 rounded-2xl border-4 backdrop-blur-md max-w-3xl w-full
                            ${borderColor} ${shadowColor} shadow-2xl
                        `}>
                            <div className={`
                                absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-1 rounded-full text-sm font-black tracking-[0.2em] uppercase shadow-lg border border-white/20
                                ${nameBg} text-white
                            `}>
                                {current.name}
                            </div>
                            <div className={`text-3xl md:text-4xl font-bold leading-relaxed ${textColor}`}>
                                {displayedText}
                                <span className={`inline-block w-3 h-8 ml-1 align-middle bg-current ${isTyping ? 'animate-pulse' : 'opacity-0'}`}></span>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* LEFT / RIGHT DIALOGUE */
                    <div className={`
                        flex items-end gap-6 md:gap-10
                        ${isRight ? 'flex-row-reverse' : 'flex-row'}
                    `}>
                        
                        {/* Avatar Container */}
                        <div className="flex flex-col items-center shrink-0 relative group">
                            {/* Avatar Circle */}
                            <div className={`
                                w-32 h-32 md:w-48 md:h-48 rounded-full border-4 shadow-2xl flex items-center justify-center bg-black/40 backdrop-blur-sm overflow-visible relative
                                ${borderColor} ${shadowColor}
                                transition-transform duration-300 ${isTyping ? 'scale-105' : 'scale-100'}
                            `}>
                                <div className="text-7xl md:text-9xl transform transition-transform group-hover:scale-110 duration-500">
                                    {current.avatar}
                                </div>

                                {/* Emotion Bubble */}
                                {current.emotion && (
                                    <div className={`
                                        absolute -top-4 -right-4 w-16 h-16 md:w-20 md:h-20 bg-white rounded-full border-4 ${borderColor} 
                                        flex items-center justify-center text-3xl md:text-5xl shadow-lg animate-bounce z-20
                                    `}>
                                        {current.emotion}
                                    </div>
                                )}
                            </div>
                            
                            {/* Name Badge */}
                            <div className={`
                                mt-[-20px] z-10 px-6 py-1.5 rounded-full text-sm md:text-base font-black tracking-widest uppercase shadow-lg border border-white/10
                                ${nameBg} text-white transform transition-transform group-hover:-translate-y-1
                            `}>
                                {current.name}
                            </div>
                        </div>

                        {/* Speech Bubble */}
                        <div className={`
                            flex-1 relative p-6 md:p-10 rounded-3xl min-h-[160px] flex items-center shadow-xl border-2 bg-slate-900/80 backdrop-blur-md
                            ${borderColor}
                            ${isRight ? 'mr-4' : 'ml-4'}
                        `}>
                            <div className={`text-2xl md:text-3xl font-bold leading-relaxed ${textColor} w-full`}>
                                {displayedText}
                                <span className={`inline-block w-3 h-6 md:h-8 ml-2 bg-current align-bottom ${isTyping ? 'animate-pulse' : 'opacity-0'}`}></span>
                            </div>
                            
                            {!isTyping && (
                                <div className="absolute bottom-4 right-4 text-xs font-mono animate-bounce opacity-50">
                                    ▼ 点击继续
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="absolute bottom-8 w-full text-center text-white/20 text-sm font-mono tracking-[0.3em] uppercase animate-pulse">
                {isTyping ? "Rendering..." : "Waiting for Input"}
            </div>
        </div>
    );
};
