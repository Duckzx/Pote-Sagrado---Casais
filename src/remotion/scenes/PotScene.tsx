/**
 * Cena 03 — O Pote Ganha Vida (Home + Depósito)
 * frames 240–450 (8s–15s)
 *
 * - Mostra Home com pote (24% preenchido)
 * - Cursor clica no FAB (+)
 * - Depósito rápido: digita R$ 150,00, "Começamos nosso sonho"
 * - Confirma → pote sobe para ~30%, confete
 */

import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { PhoneFrame } from '../components/PhoneFrame';
import { AppHomeScreen } from '../components/AppScreens';
import { CursorClick, TypingText } from '../components/CursorClick';
import { GoldenParticles } from '../components/GoldenParticles';
import { COLORS, DEMO } from '../data/timing';

const C = COLORS;
const SERIF = '"Cormorant Garamond", Georgia, serif';
const SANS  = '"Inter", -apple-system, sans-serif';

export const PotScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // ---- Phase timeline (local frames, scene starts at 0) ----
  // 0–30:   phone slides in
  // 30–60:  home displayed, cursor moves to FAB
  // 60–70:  click FAB — deposit modal opens
  // 70–110: amount typed
  // 110–135: desc typed
  // 135–155: confirm button click
  // 155–210: pot fills up + confetti

  const phoneSpring = spring({ fps, frame: frame - 3, config: { damping: 16, stiffness: 100 } });
  const phoneY = interpolate(phoneSpring, [0, 1], [200, 0]);
  const phoneScale = interpolate(phoneSpring, [0, 1], [0.9, 1]);

  // Determine deposit modal state
  const showDeposit = frame >= 62;
  const depositAmount = frame >= 70 ? '' : '';

  // Amount typing
  const amountFull = 'R$ 150,00';
  const amountChars = frame >= 72 ? Math.min(amountFull.length, Math.floor((frame - 72) * 0.55)) : 0;
  const typedAmount = amountFull.slice(0, amountChars);

  // Desc typing
  const descFull = 'Começamos nosso sonho';
  const descChars = frame >= 115 ? Math.min(descFull.length, Math.floor((frame - 115) * 0.7)) : 0;
  const typedDesc = descFull.slice(0, descChars);

  const depositSubmitted = frame >= 150;
  const showConfetti = frame >= 155 && frame <= 208;

  // Fill percent animation
  const fillPct = frame >= 155
    ? interpolate(frame, [155, 190], [24, 30], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' })
    : 24;

  // Cursor track
  const FAB_X = width / 2 + 150;
  const FAB_Y = height / 2 + 100;
  const CONFIRM_X = width / 2;
  const CONFIRM_Y = height / 2 + 260;

  const cursorTrack = {
    points: [
      { frame: 20,  x: width * 0.7,  y: height * 0.4 },
      { frame: 55,  x: FAB_X,        y: FAB_Y         },
      { frame: 65,  x: FAB_X,        y: FAB_Y         },
      { frame: 140, x: CONFIRM_X,    y: CONFIRM_Y     },
      { frame: 155, x: CONFIRM_X,    y: CONFIRM_Y     },
    ],
    clickFrames: [62, 148],
  };

  // Text overlay
  const textOpacity = interpolate(frame, [5, 25], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
  const textOutOpacity = interpolate(frame, [55, 65], [1, 0], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

  const fadeOut = interpolate(frame, [195, 210], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

  // Small celebration pulse on pot
  const celebrationGlow = showConfetti
    ? 0.15 + Math.sin((frame - 155) / 6 * Math.PI) * 0.15
    : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: '#F5F3EE', overflow: 'hidden' }}>

      {/* Warm light bg */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 60% 30%, rgba(197,160,89,0.1) 0%, transparent 60%)`,
        pointerEvents: 'none',
      }} />

      {/* Overlay text */}
      <div style={{
        position: 'absolute',
        top: 140, left: 60, right: 60,
        textAlign: 'center',
        opacity: textOpacity * textOutOpacity,
      }}>
        <p style={{
          fontFamily: SERIF,
          fontSize: 48,
          color: C.text,
          fontStyle: 'italic',
          fontWeight: 300,
          lineHeight: 1.2,
          margin: 0,
        }}>
          "Cada escolha<br/>enche o pote."
        </p>
      </div>

      {/* Phone + app */}
      <div style={{
        position: 'absolute',
        left: '50%', top: '53%',
        transform: `translate(-50%, -50%) translateY(${phoneY}px) scale(${phoneScale})`,
      }}>
        {/* Gold glow when celebrating */}
        {celebrationGlow > 0 && (
          <div style={{
            position: 'absolute',
            inset: -40,
            borderRadius: 80,
            background: `radial-gradient(circle, rgba(197,160,89,${celebrationGlow}) 0%, transparent 70%)`,
            pointerEvents: 'none',
            zIndex: 0,
          }} />
        )}

        <PhoneFrame scale={0.78} shadow>
          <AppHomeScreen
            fillPercent={fillPct}
            showDeposit={showDeposit}
            depositAmount={typedAmount}
            depositDesc={typedDesc}
            depositSubmitted={depositSubmitted}
            showConfetti={showConfetti}
          />
        </PhoneFrame>
      </div>

      {/* Cursor */}
      <div style={{
        position: 'absolute', left: 0, top: 0,
        transform: `translateY(${phoneY}px)`,
      }}>
        <CursorClick track={cursorTrack} />
      </div>

      {/* Celebration banner */}
      {depositSubmitted && frame >= 155 && (
        <div style={{
          position: 'absolute',
          top: 140, left: 60, right: 60,
          opacity: interpolate(frame, [155, 170], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }),
          transform: `translateY(${interpolate(frame, [155, 170], [20, 0], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' })}px)`,
          textAlign: 'center',
        }}>
          <p style={{
            fontFamily: SERIF,
            fontSize: 42,
            color: C.gold,
            fontStyle: 'italic',
            fontWeight: 400,
            lineHeight: 1.25,
            margin: 0,
            textShadow: `0 2px 16px rgba(197,160,89,0.3)`,
          }}>
            +R$ 150,00 no pote! 🎉
          </p>
        </div>
      )}

      {/* Floating particles on celebrate */}
      {showConfetti && <GoldenParticles count={8} intensity={1.2} />}

      {/* Fade out */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundColor: '#F5F3EE',
        opacity: fadeOut,
        pointerEvents: 'none',
      }} />
    </AbsoluteFill>
  );
};
