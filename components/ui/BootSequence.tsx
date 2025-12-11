
import React, { useState, useEffect, useRef } from 'react';
import { gameEngine } from '../../services/gameEngine';

interface BootSequenceProps {
    onComplete: () => void;
}

export const BootSequence: React.FC<BootSequenceProps> = ({ onComplete }) => {
    // 0: Wait for Click, 1: Engine, 2: Studio, 3: Warning, 4: Finished
    const [step, setStep] = useState(0); 
    const [terminalText, setTerminalText] = useState("");
    const [showPrompt, setShowPrompt] = useState(false); // New: Control prompt visibility
    
    // Transition State
    const [opacity, setOpacity] = useState(1);
    
    // Skip Logic State
    const [isHolding, setIsHolding] = useState(false);
    const [skipProgress, setSkipProgress] = useState(0);

    // Glitch State for Engine Page (Triggered after delay)
    const [engineGlitchActive, setEngineGlitchActive] = useState(false);

    // Refs for cleaning up timers
    const sequenceTimer = useRef<number | null>(null);
    const skipInterval = useRef<number | null>(null);

    // Particles (Static generation for performance)
    const [particles] = useState(() => Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100 + 100, // Start below screen effectively or random
        delay: Math.random() * 5,
        duration: 10 + Math.random() * 10,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.1
    })));

    // Helper: Schedule next step with fade transition
    const scheduleNextStep = (nextStepIndex: number, delayMs: number) => {
        if (sequenceTimer.current) clearTimeout(sequenceTimer.current);
        
        sequenceTimer.current = window.setTimeout(() => {
            // 1. Fade Out
            setOpacity(0);
            setEngineGlitchActive(false); // Reset glitch
            
            // 2. Wait for fade (500ms), then switch content & Fade In
            setTimeout(() => {
                setStep(nextStepIndex);
                setOpacity(1);
            }, 800);
        }, delayMs);
    };

    // --- STEP 0: TYPEWRITER EFFECT ---
    useEffect(() => {
        if (step !== 0) return;
        
        const lines = [
            "正在初始化 BIOS...",
            "正在加载: 'MO_YU' (摸鱼) 内核 V2.0...",
            "警告: 检测到当前生产力水平过高...",
            "系统资源不足，正在尝试重新分配...",
            "" // Empty line for spacing
            // Prompt removed from here to be handled separately
        ];

        let lineIdx = 0;
        let charIdx = 0;
        
        // Reset state
        setTerminalText("");
        setShowPrompt(false);

        const typeLoop = setInterval(() => {
            if (lineIdx >= lines.length) {
                clearInterval(typeLoop);
                setShowPrompt(true); // Trigger prompt appearance
                return;
            }

            const currentLine = lines[lineIdx];
            
            // Calculate displayed text based on indices
            const prevText = lines.slice(0, lineIdx).join('\n');
            const currentLinePart = currentLine.substring(0, charIdx + 1);
            setTerminalText((prevText ? prevText + '\n' : '') + currentLinePart);

            charIdx++;
            if (charIdx >= currentLine.length) {
                lineIdx++;
                charIdx = 0;
            }
        }, 30);

        return () => clearInterval(typeLoop);
    }, [step]);

    // --- SEQUENCER LOGIC ---
    useEffect(() => {
        // Only run sequencer when opacity is 1 (fade in complete) to avoid timing issues during transition
        if (opacity === 0) return;

        if (step === 1) {
            // Small delay to ensure AudioContext is fully running
            setTimeout(() => {
                gameEngine.audio.play('boot_engine'); // High End Deep Drone
            }, 50);
            
            // Trigger glitch effect after 1.5s
            setTimeout(() => setEngineGlitchActive(true), 1500);
            scheduleNextStep(2, 5000); // 5s for Engine (Increased to match longer sound)
        } else if (step === 2) {
            gameEngine.audio.play('boot_studio'); // Ethereal Chord
            scheduleNextStep(3, 4500); // 4.5s for Studio
        } else if (step === 3) {
            gameEngine.audio.play('boot_warning'); // Low Pulse
            scheduleNextStep(4, 7500); // 7.5s for Warning
        } else if (step === 4) {
            // Removed loud 'boot_transition' sound here
            onComplete();
        }
    }, [step, opacity]);

    // --- INTERACTION: INITIAL CLICK ---
    const handleInitialClick = () => {
        if (step !== 0) return;
        
        // 1. Resume Audio (Browser Policy)
        gameEngine.audio.resume();
        
        // Play simple feedback sound for the click itself
        gameEngine.audio.play('ui_typewriter'); 

        // 2. Fullscreen attempt & Keyboard Lock
        try {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().then(() => {
                    // EXPERIMENTAL: Lock Escape key
                    if ('keyboard' in navigator && (navigator as any).keyboard.lock) {
                        (navigator as any).keyboard.lock(['Escape']).catch((err: any) => {
                            console.log("Keyboard Lock failed:", err);
                        });
                    }
                }).catch(() => {});
            }
        } catch (e) {}

        // 3. Start Sequence with DELAY for Fullscreen Animation
        // Browser fullscreen animations usually take 500ms - 800ms
        // We fade out the text immediately, then wait, then fade in Engine
        setOpacity(0);
        
        setTimeout(() => {
            setStep(1);
            setOpacity(1);
        }, 1000); // 1.0s Delay
    };

    // --- INTERACTION: LONG PRESS TO SKIP ---
    const startHold = () => {
        if (step > 0) setIsHolding(true);
    };

    const endHold = () => {
        setIsHolding(false);
    };

    useEffect(() => {
        if (isHolding) {
            skipInterval.current = window.setInterval(() => {
                setSkipProgress(prev => {
                    const next = prev + 2; // Fill in about 1 second
                    if (next >= 100) {
                        if (skipInterval.current) clearInterval(skipInterval.current);
                        onComplete(); 
                        return 100;
                    }
                    return next;
                });
            }, 20);
        } else {
            if (skipInterval.current) clearInterval(skipInterval.current);
            setSkipProgress(0);
        }

        return () => {
            if (skipInterval.current) clearInterval(skipInterval.current);
        };
    }, [isHolding]);

    return (
        <div 
            className="absolute inset-0 bg-black z-[9999] flex flex-col items-center justify-center overflow-hidden cursor-pointer select-none font-sans"
            onMouseDown={step === 0 ? handleInitialClick : startHold}
            onMouseUp={endHold}
            onMouseLeave={endHold}
            onTouchStart={step === 0 ? handleInitialClick : startHold}
            onTouchEnd={endHold}
        >
            <style>{`
                @keyframes float-up {
                    from { transform: translateY(0); opacity: 0; }
                    10% { opacity: 1; }
                    to { transform: translateY(-100vh); opacity: 0; }
                }
                @keyframes fade-slide-up {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes rgb-split {
                    0% { text-shadow: 0 0 0 transparent; transform: translate(0,0); }
                    20% { text-shadow: -2px 0 red, 2px 0 blue; transform: translate(-1px, 1px); }
                    40% { text-shadow: 2px 0 red, -2px 0 blue; transform: translate(1px, -1px); }
                    60% { text-shadow: -1px 0 red, 1px 0 blue; transform: translate(-1px, 0); }
                    80% { text-shadow: 1px 0 red, -1px 0 blue; transform: translate(0, 1px); }
                    100% { text-shadow: 0 0 0 transparent; transform: translate(0,0); }
                }
                .glitch-active {
                    animation: rgb-split 0.2s steps(2) infinite;
                }
                .tracking-widest-plus {
                    letter-spacing: 0.5em;
                }
            `}</style>

            {/* PARTICLES BACKGROUND */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {particles.map(p => (
                    <div 
                        key={p.id}
                        className="absolute bg-white rounded-full"
                        style={{
                            left: `${p.left}%`,
                            top: '100%',
                            width: `${p.size}px`,
                            height: `${p.size}px`,
                            opacity: p.opacity,
                            animation: `float-up ${p.duration}s linear infinite`,
                            animationDelay: `-${p.delay}s`
                        }}
                    />
                ))}
            </div>

            {/* CONTENT CONTAINER */}
            <div 
                className="w-full h-full flex flex-col items-center justify-center transition-opacity duration-700 ease-in-out relative z-10"
                style={{ opacity: opacity }}
            >
                {/* STEP 0: TERMINAL (Click Trap) */}
                {step === 0 && (
                    <div className="w-full max-w-3xl p-8 flex flex-col items-center">
                        <div className="text-green-500 whitespace-pre-wrap leading-relaxed text-lg md:text-xl font-mono drop-shadow-[0_0_8px_rgba(34,197,94,0.6)] min-h-[120px]">
                            {terminalText}
                            {!showPrompt && <span className="animate-pulse inline-block w-3 h-6 bg-green-500 ml-1 align-middle"></span>}
                        </div>
                        {showPrompt && (
                            <div className="mt-6 text-xl md:text-2xl font-bold text-green-400 animate-pulse tracking-widest cursor-pointer self-center">
                                {">> 点击屏幕注入灵魂 <<"}
                            </div>
                        )}
                    </div>
                )}

                {/* STEP 1: ENGINE LOGO (High End Parody) */}
                {step === 1 && (
                    <div className={`flex flex-col items-center gap-12 ${engineGlitchActive ? 'glitch-active' : ''}`}>
                        {/* Cube Logo */}
                        <div className="w-40 h-40 border-[6px] border-white relative transform rotate-45 flex items-center justify-center shadow-[0_0_60px_rgba(255,255,255,0.15)] bg-black">
                             <div className="w-20 h-20 bg-white transform rotate-90 opacity-90"></div>
                             {/* Decorative Lines */}
                             <div className="absolute w-full h-[2px] bg-black transform rotate-90"></div>
                             <div className="absolute w-[2px] h-full bg-black transform rotate-90"></div>
                        </div>
                        
                        <div className="flex flex-col items-center gap-4 text-center">
                             <h1 className="text-5xl md:text-6xl font-black text-white tracking-widest-plus font-sans">
                                 SPAGHETTI ENGINE
                             </h1>
                             <div className="h-px w-64 bg-slate-500"></div>
                             <h2 className="text-3xl md:text-4xl font-bold text-slate-200 font-serif tracking-widest">
                                 屎 山 引 擎
                             </h2>
                             <div className="text-sm md:text-base text-slate-500 tracking-[0.2em] uppercase mt-4 font-mono">
                                 Powered by Legacy Code & Prayers
                                 <br/>
                                 <span className="text-[10px] opacity-60">始于陈年老码 · 运行全靠祈祷</span>
                             </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: STUDIO LOGO (High End) */}
                {step === 2 && (
                    <div className="flex flex-col items-center gap-8">
                        <div className="text-9xl mb-6 animate-pulse filter drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">🐟</div>
                        
                        <div className="flex flex-col items-center gap-2">
                            <h1 className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 tracking-tighter">
                                Ev Studio
                            </h1>
                            <div className="text-2xl md:text-3xl text-slate-300 font-light tracking-widest uppercase">
                                Ev 独立工作室
                            </div>
                        </div>

                        <div className="w-16 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 my-4"></div>
                        
                        <div className="text-center space-y-2">
                            <p className="text-slate-400 text-sm tracking-widest uppercase">
                                A Subsidiary of <span className="text-white font-bold">Touch Fish Group</span>
                            </p>
                            <p className="text-slate-500 text-xs tracking-widest">
                                摸鱼集团 (Touch Fish Group) 成员企业
                            </p>
                        </div>
                        
                        <p className="text-xs text-slate-600 mt-12 italic font-serif opacity-0 animate-[fade-slide-up_1s_ease-out_forwards] animation-delay-1000">
                            Crafting Digital Chaos since 2025
                        </p>
                    </div>
                )}

                {/* STEP 3: WARNING (Formal) */}
                {step === 3 && (
                    <div className="max-w-4xl px-12 py-10 border border-red-900/30 bg-red-950/10 backdrop-blur-sm text-center flex flex-col gap-8 shadow-2xl">
                        <div className="flex items-center justify-center gap-6 text-red-500 border-b border-red-800/50 pb-6">
                            <span className="text-5xl">⚠</span>
                            <div className="flex flex-col">
                                <h2 className="text-3xl font-black uppercase tracking-[0.2em] text-white">Health & Safety</h2>
                                <h3 className="text-xl font-bold tracking-widest text-red-400">健康与职场安全警告</h3>
                            </div>
                            <span className="text-5xl">⚠</span>
                        </div>
                        
                        <div className="space-y-6 text-slate-300 text-lg leading-relaxed font-serif">
                            <p>
                                <span className="text-white font-bold">PLEASE READ BEFORE PLAYING</span>
                            </p>
                            <p>
                                本游戏包含大量烂梗、高频闪烁图像和极强的摸鱼诱导因素。
                                <br/>
                                This game contains intense memes, flashing images, and extreme procrastination triggers.
                            </p>
                            <p className="text-sm text-slate-400 border-l-2 border-red-800 pl-4 py-2 mx-auto max-w-2xl text-left">
                                如果在工作时间游玩，请务必留意 <span className="text-red-400 font-bold">老板的脚步声 (Boss Footsteps)</span>。
                                开发团队不对任何形式的 <span className="text-yellow-500 font-bold">被解雇 (Fired)</span> 或 <span className="text-yellow-500 font-bold">扣绩效 (KPI Loss)</span> 负责。
                            </p>
                        </div>

                        <div className="mt-4 flex justify-between items-center text-xs text-slate-600 font-mono border-t border-slate-800 pt-4">
                            <span>V1.9999.PRO.MAX</span>
                            <span className="animate-pulse">LOADING ASSETS... 99%</span>
                        </div>
                    </div>
                )}
            </div>

            {/* F11 HINT (Bottom Center) */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-slate-600 text-xs font-mono tracking-wider opacity-60 z-20 pointer-events-none">
                [F11] 获得最佳体验 | 暂离按 P 或 Esc
            </div>

            {/* SKIP INDICATOR (Bottom Right) */}
            {step > 0 && (
                <div className="absolute bottom-8 right-8 flex items-center gap-4 transition-opacity duration-300 opacity-80 hover:opacity-100 z-30">
                    <div className="text-right">
                        <div className="text-white font-bold text-sm tracking-widest">长按跳过</div>
                        <div className="text-[10px] text-slate-500">HOLD TO SKIP</div>
                    </div>
                    {/* Ring Progress */}
                    <div className="relative w-12 h-12">
                        <svg className="w-full h-full transform -rotate-90 overflow-visible">
                            <circle
                                cx="24" cy="24" r="18"
                                stroke="rgba(255,255,255,0.2)"
                                strokeWidth="4"
                                fill="none"
                            />
                            <circle
                                cx="24" cy="24" r="18"
                                stroke="#ffffff"
                                strokeWidth="4"
                                fill="none"
                                strokeDasharray="113.1"
                                strokeDashoffset={113.1 * (1 - skipProgress / 100)}
                                strokeLinecap="round"
                                className="transition-all duration-75 ease-linear"
                            />
                        </svg>
                    </div>
                </div>
            )}
        </div>
    );
};
