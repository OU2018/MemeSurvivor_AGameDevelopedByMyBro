
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../Button';
import { SaveManager } from '../../services/save/SaveManager';
import { CHARACTERS } from '../../data/events';
import { gameEngine } from '../../services/gameEngine';
import { CLICK_SCRIPT, GLITCH_CONTENT, FIRST_REWARD } from '../../data/easterEggScript';
import { ConfettiSystem } from './ConfettiSystem';

interface LinkViewProps {
    onBack: () => void;
    onImportSuccess: (msg: string) => void;
}

const IMPORT_FAIL_MESSAGES = [
    "HR表示看不懂这份简历 (代码无效)",
    "这是哪家公司的加密算法? (格式错误)",
    "简历文件已损坏，请重试",
    "系统拒绝了你的访问请求 (校验失败)",
    "404 Resume Not Found",
    "能不能别乱输? 后台报错了"
];

export const LinkView: React.FC<LinkViewProps> = ({ onBack, onImportSuccess }) => {
    const [mode, setMode] = useState<'generate' | 'import'>('generate');
    const [code, setCode] = useState("");
    const [message, setMessage] = useState<{text: string, type: 'success' | 'error' | 'info'} | null>(null);
    const [includeRun, setIncludeRun] = useState(true);
    const [previewData, setPreviewData] = useState<any>(null);
    const [popup, setPopup] = useState<{title: string, text: string, type: 'win' | 'info' | 'error'} | null>(null);

    // --- Easter Egg State ---
    const [isPraiseCode, setIsPraiseCode] = useState(false);
    const [praiseClicks, setPraiseClicks] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const [persistentPopup, setPersistentPopup] = useState<{title: string, textPart1: string, textPart2?: string, type: 'win' | 'glitch', buttonText: string, action?: () => void} | null>(null);
    
    // --- Timer Ref for Debouncing Popup ---
    const popupTimerRef = useRef<number | null>(null);

    // --- Fake Reboot State ---
    const [isFakeRebooting, setIsFakeRebooting] = useState(false);

    // Clean up timer on unmount
    useEffect(() => {
        return () => {
            if (popupTimerRef.current) {
                window.clearTimeout(popupTimerRef.current);
            }
        };
    }, []);

    // Poll for Global Modal Messages
    useEffect(() => {
        const timer = setInterval(() => {
             if (gameEngine.state.modalMessage) {
                 // Clear any existing local popup timer to prevent conflict
                 if (popupTimerRef.current) {
                     window.clearTimeout(popupTimerRef.current);
                 }
                 
                 setPopup(gameEngine.state.modalMessage);
                 gameEngine.state.modalMessage = null; 
                 
                 popupTimerRef.current = window.setTimeout(() => {
                     setPopup(null);
                     popupTimerRef.current = null;
                 }, 3000);
             }
        }, 200);
        return () => clearInterval(timer);
    }, []);

    const hasMeaningfulRun = gameEngine.state.currentWave > 1 || (gameEngine.state.currentWave === 1 && gameEngine.state.waveEnded);

    const handleGenerate = () => {
        try {
            const generated = SaveManager.generateCode(includeRun);
            setCode(generated);
            if (includeRun && !hasMeaningfulRun) {
                setMessage({ text: "已生成代码 (当前进度过短，未包含在内)", type: 'info' });
            } else {
                setMessage({ text: "代码已生成！", type: 'success' });
            }
        } catch (e) {
            setMessage({ text: "生成失败。", type: 'error' });
        }
    };

    const handleCopy = () => {
        if (!code) return;
        navigator.clipboard.writeText(code).then(() => {
            setMessage({ text: "已复制到剪贴板！", type: 'success' });
        }).catch(() => {
            setMessage({ text: "复制失败，请手动复制。", type: 'error' });
        });
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                handleCodeInput(text);
            }
        } catch (e) {
            setMessage({ text: "无法读取剪贴板，请手动粘贴。", type: 'info' });
        }
    };

    const handleCodeInput = (inputVal: string) => {
        setCode(inputVal);
        const trimmed = inputVal.trim().replace(/\s/g, '');
        
        // Check for Praise Code
        if (trimmed === "作者好帅") {
            setIsPraiseCode(true);
            setPreviewData(null);
            setMessage(null);
            return;
        } else {
            setIsPraiseCode(false);
        }
        
        if (!inputVal.trim()) {
            setPreviewData(null);
            setMessage(null);
            return;
        }

        const result = SaveManager.getPreview(inputVal);
        if (result.success && result.data) {
            setPreviewData(result.data);
            setMessage({ text: "✅ 有效的简历代码", type: 'success' });
        } else {
            setPreviewData(null);
            setMessage(null); 
        }
    };

    // --- THE REBOOT SEQUENCE ---
    const triggerFakeReboot = () => {
        setIsFakeRebooting(true);
        gameEngine.audio.play('ui_power_down');
        
        // Close glitch popup
        setPersistentPopup(null);

        // Wait for animation then reset
        setTimeout(() => {
            // Reset local state for next time
            setMode('generate');
            setCode("");
            setIsPraiseCode(false);
            setPraiseClicks(0);
            setIsFakeRebooting(false);
            
            // Go back to main menu
            onBack();
        }, 1500); // 1.5s Reboot time
    };

    const handlePraiseClick = () => {
        const newCount = praiseClicks + 1;
        setPraiseClicks(newCount);

        if (newCount === 1) {
            // First Time: Big Reward
            setShowConfetti(true);
            gameEngine.audio.playAchievementSound();
            gameEngine.unlockAchievement('luck_dog'); 
            
            setPersistentPopup({
                title: FIRST_REWARD.title,
                textPart1: FIRST_REWARD.textPart1,
                textPart2: FIRST_REWARD.textPart2,
                type: 'win',
                buttonText: "开心收下"
            });

        } else if (newCount > 15) {
             // >15: Glitch/Error Egg (System Crash)
            gameEngine.audio.play('ui_glitch_severe');
            setPersistentPopup({
                title: GLITCH_CONTENT.title,
                textPart1: GLITCH_CONTENT.text,
                type: 'glitch',
                buttonText: GLITCH_CONTENT.buttonText,
                action: triggerFakeReboot // Trigger Soft Reboot
            });
        } else {
            // 2-15: Linear Scripted Messages
            // Index 0 of script corresponds to 2nd click
            const scriptIndex = newCount - 2;
            
            if (scriptIndex >= 0 && scriptIndex < CLICK_SCRIPT.length) {
                const msg = CLICK_SCRIPT[scriptIndex];
                gameEngine.audio.play('ui_typewriter');
                
                // Warning audio for higher levels
                if (newCount >= 11) {
                     gameEngine.audio.play('ui_glitch_minor');
                }

                // Clear previous timer to prevent premature closing
                if (popupTimerRef.current) {
                    window.clearTimeout(popupTimerRef.current);
                }

                setPopup({
                    title: newCount >= 11 ? "⚠️ 警告" : "提示",
                    text: msg,
                    type: newCount >= 11 ? 'error' : 'info'
                });
                
                // Set new timer
                popupTimerRef.current = window.setTimeout(() => {
                    setPopup(null);
                    popupTimerRef.current = null;
                }, 2000);
            }
        }
    };

    const handleClosePersistent = () => {
        if (persistentPopup?.action) {
            persistentPopup.action();
        } else {
            // Just close the "First Reward" modal
            setPersistentPopup(null);
            // Stop generating NEW confetti (fade out existing)
            setShowConfetti(false);
        }
    };

    const handleImport = () => {
        if (isPraiseCode) {
            handlePraiseClick();
            return;
        }
        if (!code) {
            setMessage({ text: "请输入代码。", type: 'error' });
            return;
        }
        const importResult = SaveManager.importCode(code);
        if (importResult.success) {
             if (importResult.message.includes("指令") || importResult.message.includes("夸奖")) {
                 setMessage({ text: importResult.message, type: 'success' });
             } else {
                 onImportSuccess(importResult.message);
             }
        } else {
             const randomMsg = IMPORT_FAIL_MESSAGES[Math.floor(Math.random() * IMPORT_FAIL_MESSAGES.length)];
             setMessage({ text: randomMsg, type: 'error' });
        }
    };

    const renderButton = () => {
        if (isPraiseCode) {
            if (praiseClicks === 0) {
                return (
                    <Button 
                        onClick={handleImport} 
                        variant="danger" 
                        className="w-full mt-auto transition-all duration-100 bg-red-700 hover:bg-red-600 border-red-900 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                    >
                        <span className="flex items-center justify-center gap-2">
                            ⚠️ <span className="animate-nervous inline-block">不要点击这个按钮！！</span> ⚠️
                        </span>
                    </Button>
                );
            } else {
                const isCritical = praiseClicks >= 11;
                return (
                    <Button 
                        onClick={handleImport} 
                        variant="danger" // Use Danger to keep it Red/Warning colored
                        className={`w-full mt-auto transition-all duration-100 ${
                            isCritical 
                                ? 'bg-red-950 border-red-950 text-red-500 animate-pulse border-2' // Critical State
                                : 'bg-red-600 border-red-800 hover:bg-red-500' // Warning State (Red but static)
                        }`}
                    >
                        <span className="flex items-center justify-center gap-2">
                            {isCritical ? "⛔ SYSTEM UNSTABLE ⛔" : "别再继续点了..."}
                        </span>
                    </Button>
                );
            }
        }

        return (
            <Button 
                onClick={handleImport} 
                variant="danger" 
                className="w-full mt-auto" 
                disabled={!code}
            >
                 {previewData ? "确认覆盖并导入" : "解析并导入"}
            </Button>
        );
    };

    return (
        <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center z-50 p-6 overflow-hidden">
            
            {/* Confetti System */}
            <ConfettiSystem active={showConfetti} />

            {/* FAKE REBOOT OVERLAY */}
            {isFakeRebooting && (
                <div className="absolute inset-0 z-[999] bg-black flex items-center justify-center animate-crt-off overflow-hidden">
                    {/* White horizontal line collapsing */}
                    <div className="absolute w-full h-[2px] bg-white top-1/2 -translate-y-1/2 shadow-[0_0_20px_white] opacity-80" />
                    {/* Static Noise (Instability) */}
                    <div className="absolute inset-0 static-noise opacity-20" />
                </div>
            )}

            {/* Persistent Popup (Reward / Crash) */}
            {persistentPopup && (
                <div className="absolute inset-0 flex items-center justify-center z-[110] bg-black/80 backdrop-blur-sm animate-pop-in">
                    <div className={`
                        border-4 p-8 rounded-2xl shadow-2xl text-center max-w-md transform scale-110 pointer-events-auto relative overflow-hidden
                        ${persistentPopup.type === 'win' ? 'bg-slate-800 border-yellow-500' : 'bg-fuchsia-900 border-fuchsia-500'}
                    `}>
                        {persistentPopup.type === 'glitch' && (
                             <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+Cjwvc3ZnPg==')]"></div>
                        )}

                        <div className="text-6xl mb-4 animate-bounce">
                            {persistentPopup.type === 'win' ? '🥰' : '👾'}
                        </div>
                        <h3 className={`text-3xl font-black mb-4 tracking-wider ${persistentPopup.type === 'win' ? 'text-yellow-400' : 'text-fuchsia-300 glitch-text'}`} data-text={persistentPopup.title}>
                            {persistentPopup.title}
                        </h3>
                        <div className={`font-bold text-lg mb-8 flex flex-col gap-2 ${persistentPopup.type === 'win' ? 'text-white' : 'text-fuchsia-100'}`}>
                            <p>{persistentPopup.textPart1}</p>
                            {persistentPopup.textPart2 && (
                                <p className="text-2xl mt-2">{persistentPopup.textPart2}</p>
                            )}
                        </div>
                        
                        <Button onClick={handleClosePersistent} className={`w-full text-xl py-3 ${
                            persistentPopup.type === 'win' 
                                ? 'bg-yellow-600 border-yellow-800 hover:bg-yellow-500' 
                                : 'bg-fuchsia-600 border-fuchsia-800 hover:bg-fuchsia-500'
                        }`}>
                            {persistentPopup.buttonText}
                        </Button>
                    </div>
                </div>
            )}

            {/* Standard Transient Popup */}
            {popup && (
                <div className="absolute inset-0 flex items-center justify-center z-[100] bg-black/60 backdrop-blur-sm animate-pop-in pointer-events-none">
                    <div className={`
                        border-4 p-8 rounded-2xl shadow-2xl text-center max-w-md transform scale-110 pointer-events-auto
                        ${popup.type === 'win' ? 'bg-slate-800 border-yellow-500' : 'bg-slate-800 border-slate-500'}
                    `}>
                        <div className="text-6xl mb-4 animate-bounce">{popup.type === 'win' ? '🎉' : '🤔'}</div>
                        <h3 className={`text-3xl font-black mb-4 tracking-wider ${popup.type === 'win' ? 'text-yellow-400' : 'text-white'}`}>
                            {popup.title}
                        </h3>
                        <p className="text-white font-bold text-lg">{popup.text}</p>
                    </div>
                </div>
            )}

            {/* Main UI */}
            <div className="w-full max-w-2xl bg-slate-800 p-8 rounded-2xl border-4 border-cyan-500 shadow-2xl flex flex-col h-[600px] relative z-10">
                <h1 className="text-4xl font-black text-white mb-6 text-center">电子简历 (存档管理)</h1>

                <div className="flex gap-4 justify-center mb-6 shrink-0">
                    <Button 
                        variant={mode === 'generate' ? 'primary' : 'outline'} 
                        onClick={() => { setMode('generate'); setCode(""); setMessage(null); setPreviewData(null); setIsPraiseCode(false); setPraiseClicks(0); }}
                    >
                        导出简历
                    </Button>
                    <Button 
                        variant={mode === 'import' ? 'primary' : 'outline'} 
                        onClick={() => { setMode('import'); setCode(""); setMessage(null); setPreviewData(null); setIsPraiseCode(false); setPraiseClicks(0); }}
                    >
                        入职登记
                    </Button>
                </div>

                <div className="flex-1 bg-slate-900 p-6 rounded-xl border border-slate-700 flex flex-col gap-4 relative overflow-hidden">
                    {mode === 'generate' ? (
                        <>
                            <div className="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-700">
                                <div className="flex flex-col">
                                    <span className="text-white font-bold text-sm">包含当前对局进度</span>
                                    <span className="text-xs text-slate-500">
                                        {includeRun && !hasMeaningfulRun 
                                            ? "⚠️ 进度过短，生成时将自动忽略" 
                                            : "包含金币、物品和关卡信息"}
                                    </span>
                                </div>
                                <div 
                                    className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors relative ${includeRun ? 'bg-green-500' : 'bg-slate-600'}`}
                                    onClick={() => setIncludeRun(!includeRun)}
                                >
                                    <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ${includeRun ? 'translate-x-5' : 'translate-x-0'}`} />
                                </div>
                            </div>

                            <div className="flex-1 relative">
                                <textarea 
                                    readOnly 
                                    value={code} 
                                    placeholder="点击生成代码..."
                                    className="w-full h-full bg-black text-green-400 font-mono text-sm p-4 rounded border border-slate-600 resize-none focus:outline-none focus:border-green-500"
                                    onClick={e => (e.target as HTMLTextAreaElement).select()}
                                />
                                {!code && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <span className="text-slate-600 text-sm">请点击下方按钮生成</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 mt-auto">
                                <Button onClick={handleGenerate} className="flex-1">生成代码</Button>
                                {code && (
                                    <Button onClick={handleCopy} variant="secondary" className="w-32">复制</Button>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            {previewData && (
                                <div className="bg-slate-800/50 p-4 rounded-lg border border-indigo-500/50 mb-2 animate-pop-in">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-indigo-300 font-bold text-sm">存档预览</span>
                                        {previewData.hasRun && <span className="bg-green-900 text-green-400 text-[10px] px-2 py-0.5 rounded">包含进度</span>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                                        <div>🏆 最高分: <span className="text-yellow-400">{previewData.highScore}</span></div>
                                        <div>🎮 总局数: {previewData.totalGames}</div>
                                        {previewData.runDetails && (
                                            <>
                                                <div className="col-span-2 border-t border-slate-700 my-1"></div>
                                                <div>👤 角色: <span className="text-white font-bold">{CHARACTERS[previewData.runDetails.characterName]?.name || previewData.runDetails.characterName}</span></div>
                                                <div>🌊 波次: {previewData.runDetails.wave} {previewData.runDetails.isEndless ? '(无尽)' : ''}</div>
                                                <div>💰 资金: <span className="text-yellow-400">{previewData.runDetails.gold}</span></div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="flex-1 relative">
                                <textarea 
                                    value={code}
                                    onChange={e => handleCodeInput(e.target.value)}
                                    placeholder="在此粘贴简历代码..."
                                    className="w-full h-full bg-black text-white font-mono text-sm p-4 rounded border border-slate-600 resize-none focus:outline-none focus:border-cyan-500"
                                />
                                <button 
                                    onClick={handlePaste}
                                    className="absolute top-2 right-2 text-xs bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded border border-slate-500"
                                >
                                    粘贴
                                </button>
                            </div>
                            
                            {renderButton()}
                        </>
                    )}
                </div>

                {message && (
                    <div className={`mt-4 p-3 rounded text-center font-bold text-sm animate-pop-in shrink-0 ${
                        message.type === 'success' ? 'bg-green-900/50 text-green-400 border border-green-600' : 
                        message.type === 'error' ? 'bg-red-900/50 text-red-400 border border-red-600' :
                        'bg-blue-900/50 text-blue-400 border border-blue-600'
                    }`}>
                        {message.text}
                    </div>
                )}
                
                <div className="mt-6 flex justify-center shrink-0">
                    <Button variant="outline" onClick={onBack}>返回</Button>
                </div>
            </div>
        </div>
    );
};
