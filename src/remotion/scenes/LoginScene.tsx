/**
 * Cena 02 — Entrada no App (Login → Home transition)
 * frames 120–240 (4s–8s)
 */

import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Sequence } from 'remotion';
import { PhoneFrame } from '../components/PhoneFrame';
import { AppLoginScreen } from '../components/AppScreens';
import { CursorClick } from '../components/CursorClick';
import { COLORS } from '../data/timing';

const C = COLORS;
const SERIF = '"Cormorant Garamond", Georgia, serif';
const SANS  = '"Inter", -apple-system, sans-serif';

export const LoginScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Phone floats in from below
  const phoneSpring = spring({ fps, frame: frame - 5, config: { damping: 16, stiffness: 120 } });
  const phoneY = interpolate(phoneSpring, [0, 1], [300, 0]);
  const phoneOpacity = interpolate(frame, [5, 25], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
  const phoneScale = interpolate(phoneSpring, [0, 1], [0.85, 1]);

  // Cursor track — moves towards Google button
  const PHONE_CENTER_X = width / 2;
  const PHONE_CENTER_Y = height / 2;
  const BUTTON_Y_OFFSET = 200; // approx position of "Entrar" button on phone

  const cursorTrack = {
    points: [
      { frame: 30, x: PHONE_CENTER_X + 80, y: PHONE_CENTER_Y + 100 },
      { frame: 65, x: PHONE_CENTER_X,      y: PHONE_CENTER_Y + BUTTON_Y_OFFSET },
      { frame: 85, x: PHONE_CENTER_X,      y: PHONE_CENTER_Y + BUTTON_Y_OFFSET },
    ],
    clickFrames: [72],
  };

  // Overlay text
  const textOpacity = interpolate(frame, [10, 30], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
  const textY = interpolate(frame, [10, 30], [15, 0], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

  // Fade out
  const fadeOut = interpolate(frame, [105, 120], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

  // Background
  return (
    <AbsoluteFill style={{ backgroundColor: '#F2EFE8', overflow: 'hidden' }}>

      {/* Warm bg gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 0%, rgba(197,160,89,0.12) 0%, rgba(142,127,109,0.06) 40%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Overlay text */}
      <div style={{
        position: 'absolute',
        top: 160, left: 60, right: 60,
        textAlign: 'center',
        opacity: textOpacity,
        transform: `translateY(${textY}px)`,
      }}>
        <p style={{
          fontFamily: SERIF,
          fontSize: 46,
          color: C.text,
          fontStyle: 'italic',
          fontWeight: 300,
          lineHeight: 1.25,
          margin: 0,
        }}>
          "Transforme planos<br/>em metas."
        </p>
        <div style={{
          width: 60, height: 2,
          backgroundColor: C.gold,
          margin: '20px auto 0',
          borderRadius: 1,
        }} />
      </div>

      {/* Phone frame with login screen */}
      <div style={{
        position: 'absolute',
        left: '50%', top: '50%',
        transform: `translate(-50%, -38%) translateY(${phoneY}px) scale(${phoneScale})`,
        opacity: phoneOpacity,
      }}>
        <PhoneFrame scale={0.72} shadow>
          <AppLoginScreen logoScale={1} />
        </PhoneFrame>
      </div>

      {/* Cursor */}
      <div style={{
        position: 'absolute',
        left: 0, top: 0,
        transform: `translateY(${phoneY}px)`,
        opacity: phoneOpacity,
      }}>
        <CursorClick track={cursorTrack} />
      </div>

      {/* Click ripple at button position */}
      {frame >= 72 && frame <= 95 && (() => {
        const t = (frame - 72) / 23;
        return (
          <div style={{
            position: 'absolute',
            left: PHONE_CENTER_X - 60,
            top: PHONE_CENTER_Y + BUTTON_Y_OFFSET - 60 - phoneY,
            width: 120,
            height: 120,
            borderRadius: '50%',
            border: `2px solid rgba(197,160,89,${0.8 - t * 0.8})`,
            transform: `scale(${0.5 + t * 1.5}) translateY(${phoneY}px)`,
            pointerEvents: 'none',
          }} />
        );
      })()}

      {/* Fade overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundColor: '#F2EFE8',
        opacity: fadeOut,
        pointerEvents: 'none',
      }} />
    </AbsoluteFill>
  );
};
