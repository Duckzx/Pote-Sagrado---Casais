/**
 * Cena 01 — Abertura Emocional
 * frames 0–120 (0s–4s)
 * Fundo escuro, partículas douradas, pote surgindo com luz suave
 */

import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { GoldenParticles } from '../components/GoldenParticles';
import { COLORS } from '../data/timing';

const C = COLORS;
const SERIF = '"Cormorant Garamond", Georgia, serif';
const SANS  = '"Inter", -apple-system, sans-serif';

// Sacred Jar SVG icon
const PoteIconDark: React.FC<{ size: number; opacity: number }> = ({ size, opacity }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" opacity={opacity}>
    <path
      d="M35 28 L35 40 C35 40 18 48 18 65 L18 80 C18 88 25 92 35 92 L65 92 C75 92 82 88 82 80 L82 65 C82 48 65 40 65 40 L65 28 Z"
      fill="rgba(197,160,89,0.15)"
      stroke={C.gold}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <rect x="30" y="20" width="40" height="12" rx="6" fill="rgba(197,160,89,0.2)" stroke={C.gold} strokeWidth="2" />
    <path d="M45 60 C45 56 50 54 50 58 C50 54 55 56 55 60 C55 65 50 69 50 69 C50 69 45 65 45 60 Z" fill={C.gold} />
    <path d="M30 55 Q33 70 35 80" strokeWidth="3" stroke="rgba(197,160,89,0.5)" strokeLinecap="round" />
    {/* Glow ring */}
    <circle cx="50" cy="58" r="46" stroke={C.gold} strokeWidth="0.5" opacity="0.2" />
  </svg>
);

export const OpeningScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo spring in
  const logoSpring = spring({ fps, frame: frame - 8, config: { damping: 12, stiffness: 80 } });
  const logoScale = interpolate(logoSpring, [0, 1], [0.4, 1]);
  const logoOpacity = interpolate(frame, [8, 30], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

  // Text fade
  const textOpacity = interpolate(frame, [35, 60], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
  const textY = interpolate(frame, [35, 60], [20, 0], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

  // Subtitle text fade
  const taglineOpacity = interpolate(frame, [50, 75], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

  // Scene fade out at end
  const fadeOut = interpolate(frame, [105, 120], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

  // Glow pulse
  const glowPulse = 0.3 + Math.sin((frame / fps) * Math.PI * 2) * 0.15;

  // Radial bg glow that grows
  const glowRadius = interpolate(logoSpring, [0, 1], [0, 400]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0D0C0B',
        overflow: 'hidden',
      }}
    >
      {/* Radial glow behind logo */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -60%)',
        width: glowRadius,
        height: glowRadius,
        borderRadius: '50%',
        background: `radial-gradient(circle, rgba(197,160,89,${glowPulse}) 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Subtle warm grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `radial-gradient(rgba(197,160,89,0.06) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
        opacity: 0.6,
        pointerEvents: 'none',
      }} />

      {/* Golden Particles */}
      <GoldenParticles count={12} intensity={0.7} />

      {/* Main content — centered */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -58%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 20,
      }}>

        {/* Logo */}
        <div style={{
          transform: `scale(${logoScale})`,
          opacity: logoOpacity,
          filter: `drop-shadow(0 0 ${30 * glowPulse}px rgba(197,160,89,0.6))`,
        }}>
          <PoteIconDark size={140} opacity={1} />
        </div>

        {/* Brand name */}
        <div style={{
          opacity: textOpacity,
          transform: `translateY(${textY}px)`,
          textAlign: 'center',
        }}>
          <h1 style={{
            fontFamily: SERIF,
            fontSize: 80,
            lineHeight: 0.85,
            color: '#F9F8F6',
            fontWeight: 300,
            margin: 0,
            letterSpacing: '-0.025em',
          }}>
            Pote<br/>
            <span style={{ color: C.gold, fontStyle: 'italic', fontWeight: 400 }}>Sagrado</span>
          </h1>
        </div>

        {/* Tagline */}
        <div style={{
          opacity: taglineOpacity,
          textAlign: 'center',
          marginTop: 4,
        }}>
          <p style={{
            fontFamily: SANS,
            fontSize: 13,
            textTransform: 'uppercase',
            letterSpacing: '0.28em',
            color: 'rgba(249,248,246,0.5)',
            fontWeight: 600,
            margin: 0,
          }}>
            O diário financeiro do casal
          </p>
        </div>
      </div>

      {/* Bottom text */}
      <div style={{
        position: 'absolute',
        bottom: 320,
        left: 60, right: 60,
        textAlign: 'center',
        opacity: textOpacity,
      }}>
        <p style={{
          fontFamily: SERIF,
          fontSize: 44,
          color: 'rgba(249,248,246,0.85)',
          fontStyle: 'italic',
          fontWeight: 300,
          lineHeight: 1.3,
          margin: 0,
          textShadow: '0 2px 20px rgba(0,0,0,0.5)',
        }}>
          Todo casal tem um sonho.
        </p>
      </div>

      {/* Horizontal divider line */}
      <div style={{
        position: 'absolute',
        bottom: 290,
        left: '50%',
        transform: 'translateX(-50%)',
        width: interpolate(frame, [60, 90], [0, 200], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }),
        height: 1,
        backgroundColor: C.gold,
        opacity: 0.4,
      }} />

      {/* Fade to next scene */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundColor: '#0D0C0B',
        opacity: fadeOut,
        pointerEvents: 'none',
      }} />
    </AbsoluteFill>
  );
};
