
import React, { useState, useEffect, useRef } from 'react';
import { gameEngine } from '../../../services/gameEngine';

// More complex, "scary" glitch characters (Block elements, geometric shapes, system errors)
const GLITCH_CHARS = '█▓▒░▚▞▀▄▌▐▖▗▘▙▚▛▜▝▞▟░▒▓█⚡☠☢⚠⨂⨁⨀⫸⫷NULL_POINTER_EXCEPTION_0x00_FATAL';
const BASE_TITLE = "木更大乱斗";

export const CyberTitle: React.FC = () => {
    // --- Glitch State Logic ---
    const [titleText, setTitleText] = useState(BASE_TITLE);
    const [isSevereGlitch, setIsSevereGlitch] = useState(false);
    
    // New Visual States
    const [isBlackout, setIsBlackout] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [isPremonition, setIsPremonition] = useState(false); // New: Audio swelling phase
    
    const isHoveringRef = useRef(false); // For interval access
    const isGlitchingRef = useRef(false); // To prevent overlap
    
    // EASTER EGG: Abyss Gazer
    const hoverTimeRef = useRef(0);
    
    // SAFETY NET: Ensure glitch happens at least every 30s
    const lastGlitchTimeRef = useRef(Date.now());

    // --- Hover Sound Handlers ---
    const handleMouseEnter = () => {
        setIsHovering(true);
        isHoveringRef.current = true;
        gameEngine.audio.startHoverStatic(); // Start continuous static
    };

    const handleMouseLeave = () => {
        setIsHovering(false);
        isHoveringRef.current = false;
        gameEngine.audio.stopHoverStatic(); // Fade out continuous static
    };

    useEffect(() => {
        // --- Advanced Title Glitch Loop ---
        let glitchTimer = 0;

        const glitchLoop = setInterval(() => {
            glitchTimer++;
            const hovering = isHoveringRef.current;
            const now = Date.now();

            // --- EASTER EGG LOGIC ---
            if (hovering) {
                hoverTimeRef.current += 100; // +100ms
                if (hoverTimeRef.current > 10000) { // 10 seconds
                    gameEngine.unlockAchievement('abyss_gazer');
                }
            } else {
                hoverTimeRef.current = 0;
            }
            // ------------------------

            // --- GEIGER COUNTER (Hover Interaction) ---
            // Play faint clicks when hovering to simulate radiation/interference
            if (hovering && !isGlitchingRef.current && Math.random() < 0.2) {
                 gameEngine.audio.play('ui_glitch_minor');
            }

            // --- MAJOR GLITCH LOGIC (Premonition Sequence) ---
            // Trigger probability
            const severeProb = hovering ? 0.05 : 0.005;
            // Force trigger if 30s passed
            const forceTrigger = (now - lastGlitchTimeRef.current) > 25000; // 25s safety net
            
            if (!isGlitchingRef.current && (Math.random() < severeProb || forceTrigger)) {
                isGlitchingRef.current = true;
                lastGlitchTimeRef.current = now; // Reset timer
                
                // 1. Start Premonition (Audio Swell + Nervous Visual)
                setIsPremonition(true);
                
                // Play procedural atmospheric glitch sound
                gameEngine.audio.playAtmosphericGlitch();
                
                // 2. Sync Visual Glitch to Audio Climax (approx 2.5s)
                setTimeout(() => {
                    setIsPremonition(false);
                    setIsSevereGlitch(true);
                    
                    // 3. Glitch Duration (0.4s) -> Reset
                    setTimeout(() => {
                        setIsSevereGlitch(false);
                        setTitleText(BASE_TITLE);
                        isGlitchingRef.current = false;
                        
                        // 4. Chance for Blackout Aftershock
                        if (Math.random() < 0.5) {
                            setIsBlackout(true);
                            // Removed ui_power_down sound here to avoid "laser gun" effect
                            setTimeout(() => setIsBlackout(false), 200);
                        }
                        
                    }, 400); 
                    
                }, 2500); // 2.5s premonition delay (matches SoundManager peak)
            }

            // 3. Handle Glitch Text Updates
            if (isSevereGlitch) {
                // Major Glitch: Total Chaos + System Strings
                let garbled = "";
                // Sometimes replace whole title with a system error string
                if (Math.random() < 0.3) {
                    garbled = "SYSTEM_FAILURE";
                } else {
                    // Or just random block noise
                    const len = BASE_TITLE.length + Math.floor(Math.random() * 5);
                    for(let i=0; i<len; i++) {
                        garbled += GLITCH_CHARS.charAt(Math.floor(Math.random() * GLITCH_CHARS.length));
                    }
                }
                setTitleText(garbled);
            } else if (isBlackout) {
                if (Math.random() < 0.3) setTitleText(BASE_TITLE);
            } else {
                // Minor Glitch (Visual Only)
                // Only if not in premonition/severe state
                if (!isGlitchingRef.current && Math.random() < 0.05) { 
                    let newText = "";
                    let hasMinorGlitch = false;
                    for (let i = 0; i < BASE_TITLE.length; i++) {
                        if (Math.random() < 0.1) {
                            const charIndex = Math.floor(Math.random() * 10); 
                            newText += GLITCH_CHARS.charAt(charIndex);
                            hasMinorGlitch = true;
                        } else {
                            newText += BASE_TITLE[i];
                        }
                    }
                    if (hasMinorGlitch) setTitleText(newText);
                } else {
                    if (!isSevereGlitch) setTitleText(BASE_TITLE);
                }
            }

        }, 100); // Slower tick rate (100ms) for heavier feel

        return () => {
            clearInterval(glitchLoop);
        }
    }, [isSevereGlitch, isBlackout, isPremonition]);

    return (
        <div 
            className="relative mb-4 px-4 py-2 cursor-pointer"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <h1 
                className={`text-6xl font-black cyber-glitch-title retro-crt tracking-widest z-10 select-none 
                    ${isSevereGlitch ? 'severe' : ''}
                    ${isBlackout ? 'blackout' : ''}
                    ${isHovering || isPremonition ? 'nervous' : ''}
                `} 
                data-text={titleText}
            >
                {titleText}
            </h1>
        </div>
    );
};
