/**
 * Cena 06 — Progresso Compartilhável
 * frames 900–1080 (30s–36s)
 *
 * - Home com pote atualizado
 * - Cursor clica no botão Share (⇪)
 * - ShareableWidget aparece em destaque
 * - Card flutua para fora do phone e ocupa o quadro
 */

import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { PhoneFrame } from '../components/PhoneFrame';
import { AppHomeScreen, AppShareWidget } from '../components/AppScreens';
import { CursorClick } from '../components/CursorClick';
import { GoldenParticles } from '../components/GoldenParticles';
import { COLORS, DEMO } from '../data/timing';

const C = COLORS;
const SERIF = '"Cormorant Garamond", Georgia, serif';
const SANS  = '"Inter", -apple-system, sans-serif';

export const ShareScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Phase:
  // 0–25: slide in, home visible
  // 25–55: cursor moves to share btn
  // 55–65: click share
  // 65–140: share widget shown, card expands
  // 140–180: fade out

  const phoneSpring = spring({ fps, frame: frame - 3, config: { damping: 16, stiffness: 100 } });
  const phoneY = interpolate(phoneSpring, [0, 1], [200, 0]);
  const phoneScale = interpolate(phoneSpring, [0, 1], [0.88, 1]);

  const showShareWidget = frame >= 65;

  // Phone fades and scales down as widget takes over
  const phoneOpacityOut = interpolate(frame, [65, 100], [1, 0.35], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
  const phoneScaleOut   = interpolate(frame, [65, 100], [1, 0.7],  { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

  // Widget scale up (enters from phone area)
  const widgetSpring = spring({ fps, frame: Math.max(0, frame - 65), config: { damping: 18, stiffness: 160 } });
  const widgetScale  = interpolate(widgetSpring, [0, 1], [0.6, 1]);
  const widgetOpacity = interpolate(widgetSpring, [0, 0.3], [0, 1]);

  // Cursor
  const SHARE_BTN_X = width / 2 + 145;
  const SHARE_BTN_Y = height / 2 - 210;

  const cursorTrack = {
    points: [
      { frame: 15, x: width * 0.5,   y: height * 0.4 },
      { frame: 50, x: SHARE_BTN_X,   y: SHARE_BTN_Y  },
      { frame: 65, x: SHARE_BTN_X,   y: SHARE_BTN_Y  },
    ],
    clickFrames: [58],
  };

  // Text overlays
  const textOpacity = interpolate(frame, [6, 26], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
  const textOut     = interpolate(frame, [55, 68], [1, 0], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

  const cardTextOpacity = interpolate(frame, [85, 108], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

  const fadeOut = interpolate(frame, [165, 180], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: '#1A1715', overflow: 'hidden' }}>

      {/* Dark premium bg */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 30%, rgba(197,160,89,0.08) 0%, transparent 60%)`,
        pointerEvents: 'none',
      }} />

      {/* Subtle gold grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `radial-gradient(rgba(197,160,89,0.04) 1px, transparent 1px)`,
        backgroundSize: '50px 50px',
        opacity: 0.8,
        pointerEvents: 'none',
      }} />

      {/* Headline */}
      <div style={{
        position: 'absolute',
        top: 130, left: 60, right: 60,
        textAlign: 'center',
        opacity: textOpacity * textOut,
      }}>
        <p style={{
          fontFamily: SERIF, fontSize: 50,
          color: 'rgba(249,248,246,0.9)', fontStyle: 'italic', fontWeight: 300,
          lineHeight: 1.2, margin: 0,
          textShadow: '0 2px 16px rgba(0,0,0,0.3)',
        }}>
          "Compartilhe o<br/>próximo capítulo."
        </p>
        <div style={{ width: 60, height: 1, backgroundColor: C.gold, margin: '16px auto 0', borderRadius: 1, opacity: 0.6 }} />
      </div>

      {/* Phone */}
      <div style={{
        position: 'absolute',
        left: '50%', top: '53%',
        transform: `translate(-50%, -50%) translateY(${phoneY}px) scale(${phoneScale * phoneScaleOut})`,
        opacity: phoneOpacityOut,
      }}>
        <PhoneFrame scale={0.78} shadow>
          <AppHomeScreen fillPercent={30} showDeposit={false} />
        </PhoneFrame>
      </div>

      {/* Cursor */}
      <div style={{
        position: 'absolute', left: 0, top: 0,
        transform: `translateY(${phoneY}px)`,
        opacity: 1 - interpolate(frame, [65, 80], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }),
      }}>
        <CursorClick track={cursorTrack} />
      </div>

      {/* Share Widget — expands out of phone */}
      {showShareWidget && (
        <div style={{
          position: 'absolute',
          left: '50%', top: '50%',
          transform: `translate(-50%, -50%) scale(${widgetScale})`,
          opacity: widgetOpacity,
          width: 420, // slightly wider than phone width at this scale
        }}>
          <AppShareWidget visible />
        </div>
      )}

      {/* Card text overlay */}
      {frame >= 85 && (
        <div style={{
          position: 'absolute',
          top: 130, left: 60, right: 60,
          textAlign: 'center',
          opacity: cardTextOpacity,
        }}>
          <p style={{
            fontFamily: SERIF, fontSize: 40,
            color: 'rgba(249,248,246,0.85)', fontStyle: 'italic', fontWeight: 300,
            lineHeight: 1.3, margin: 0,
            textShadow: '0 2px 16px rgba(0,0,0,0.4)',
          }}>
            "Dá até vontade de<br/>mostrar para o mundo."
          </p>
        </div>
      )}

      {/* Golden particles subtle */}
      <GoldenParticles count={6} intensity={0.4} />

      {/* Fade */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundColor: '#1A1715',
        opacity: fadeOut,
        pointerEvents: 'none',
      }} />
    </AbsoluteFill>
  );
};
