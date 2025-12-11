
import React from 'react';

export const GlitchStyles: React.FC = () => (
    <style>{`
        .cyber-glitch-title {
            position: relative;
            color: #fff;
            text-transform: uppercase;
            /* Base Glow - slightly unstable */
            text-shadow: 
                0 0 2px rgba(255,255,255,0.8),
                0 0 10px rgba(14, 165, 233, 0.5),
                0 0 20px rgba(217, 70, 239, 0.5);
            z-index: 10;
            mix-blend-mode: hard-light;
            transition: text-shadow 0.1s, transform 0.1s, filter 0.1s;
        }

        /* Create duplicate layers for RGB split */
        .cyber-glitch-title::before,
        .cyber-glitch-title::after {
            content: attr(data-text);
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0.8;
            background: #0f172a; /* Hides the main text behind cuts */
            mix-blend-mode: screen; /* Additive color blending */
        }

        /* Red/Magenta Channel */
        .cyber-glitch-title::before {
            color: #ff00ff;
            z-index: -1;
            animation: glitch-anim-1 4s infinite linear alternate-reverse;
        }

        /* Blue/Cyan Channel */
        .cyber-glitch-title::after {
            color: #00ffff;
            z-index: -2;
            animation: glitch-anim-2 3s infinite linear alternate-reverse;
        }

        /* SEVERE GLITCH STATE (System Crash / Voltage Spike) */
        .cyber-glitch-title.severe {
            color: #ffffff;
            /* Violent shaking */
            animation: severe-shake 0.05s infinite;
            /* Overexposure / Brightness Spike */
            filter: brightness(1.8) contrast(1.5) drop-shadow(0 0 10px red);
            /* Massive RGB Split */
            text-shadow: 
                8px 0 #ff0000, 
                -8px 0 #00ff00;
        }
        .cyber-glitch-title.severe::before {
            animation: severe-slice-1 0.1s infinite;
            color: #ff0000;
            left: 10px;
            opacity: 1;
        }
        .cyber-glitch-title.severe::after {
            animation: severe-slice-2 0.1s infinite;
            color: #0000ff;
            left: -10px;
            opacity: 1;
        }

        /* --- CRT SCANLINES & STATIC CHROMATIC --- */
        .retro-crt {
            /* Static Chromatic Aberration (Always on) */
            text-shadow: 
                2px 0 rgba(255, 0, 0, 0.4), 
                -2px 0 rgba(0, 255, 255, 0.4),
                0 0 15px rgba(34, 211, 238, 0.3);
        }
        .retro-crt::after {
            content: " ";
            position: absolute;
            inset: 0;
            background: repeating-linear-gradient(
                0deg,
                rgba(0, 0, 0, 0.15),
                rgba(0, 0, 0, 0.15) 1px,
                transparent 1px,
                transparent 2px
            );
            background-size: 100% 2px;
            pointer-events: none;
            z-index: 20;
        }

        /* --- IMPROVED: INTERACTIVE VOLTAGE LEAK (Digital Snap) --- */
        @keyframes voltage-leak {
            0% { transform: translate(0, 0) skewX(0deg); }
            20% { transform: translate(-2px, 1px) skewX(-3deg); }
            40% { transform: translate(2px, -1px) skewX(3deg); }
            60% { transform: translate(-1px, -2px) skewX(0deg); }
            80% { transform: translate(1px, 2px) skewX(-1deg); }
            100% { transform: translate(0, 0) skewX(0deg); }
        }
        
        .nervous {
            /* steps(4) creates a snappy, robotic feel instead of smooth blur */
            animation: voltage-leak 0.15s steps(4) infinite;
            cursor: not-allowed;
            /* Over-drive the glow when hovering */
            filter: brightness(1.3) contrast(1.2);
        }

        /* When nervous, force the RGB layers to separate wildly */
        .nervous::before {
            animation: glitch-anim-1 0.2s steps(2) infinite reverse !important;
            left: 4px !important;
            opacity: 1 !important;
        }
        .nervous::after {
            animation: glitch-anim-2 0.2s steps(2) infinite reverse !important;
            left: -4px !important;
            opacity: 1 !important;
        }

        /* --- PHOSPHOR PERSISTENCE (BLACKOUT) --- */
        .blackout {
            color: #020202 !important; /* Nearly black */
            /* Greenish ghost glow remains */
            text-shadow: 0 0 8px rgba(20, 255, 50, 0.2) !important; 
            filter: brightness(0.5) contrast(1.2);
            transition: color 0.05s, text-shadow 0.5s ease-out;
        }
        .blackout::before, .blackout::after {
            opacity: 0 !important; /* Hide RGB split layers during blackout */
        }

        /* --- Animations --- */

        /* Slower, drifting RGB split for normal state */
        @keyframes glitch-anim-1 {
            0% { clip-path: inset(20% 0 80% 0); transform: translate(-2px, 1px); }
            20% { clip-path: inset(60% 0 10% 0); transform: translate(2px, -1px); }
            40% { clip-path: inset(40% 0 50% 0); transform: translate(-2px, 2px); }
            60% { clip-path: inset(80% 0 5% 0); transform: translate(2px, -2px); }
            80% { clip-path: inset(10% 0 70% 0); transform: translate(-2px, 1px); }
            100% { clip-path: inset(50% 0 30% 0); transform: translate(0); }
        }

        @keyframes glitch-anim-2 {
            0% { clip-path: inset(10% 0 60% 0); transform: translate(2px, -1px); }
            20% { clip-path: inset(80% 0 5% 0); transform: translate(-2px, 1px); }
            40% { clip-path: inset(30% 0 20% 0); transform: translate(2px, -2px); }
            60% { clip-path: inset(10% 0 80% 0); transform: translate(-2px, 2px); }
            80% { clip-path: inset(50% 0 30% 0); transform: translate(1px, -1px); }
            100% { clip-path: inset(20% 0 70% 0); transform: translate(0); }
        }

        /* Violent Shake for Severe Glitch */
        @keyframes severe-shake {
            0% { transform: translate(4px, 4px) skewX(20deg); }
            25% { transform: translate(-4px, -4px) skewX(-20deg); }
            50% { transform: translate(-4px, 4px) skewX(10deg); }
            75% { transform: translate(4px, -4px) skewX(-10deg); }
            100% { transform: translate(0, 0); }
        }

        /* Chaotic Slicing for Severe */
        @keyframes severe-slice-1 {
            0% { clip-path: inset(0 0 50% 0); transform: translate(20px, 0); }
            50% { clip-path: inset(30% 0 0 0); transform: translate(-20px, 0); }
            100% { clip-path: inset(0 0 0 0); transform: translate(0, 0); }
        }
        @keyframes severe-slice-2 {
            0% { clip-path: inset(50% 0 0 0); transform: translate(-20px, 0); }
            50% { clip-path: inset(0 0 30% 0); transform: translate(20px, 0); }
            100% { clip-path: inset(0 0 0 0); transform: translate(0, 0); }
        }
    `}</style>
);
