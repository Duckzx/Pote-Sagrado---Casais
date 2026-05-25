/**
 * Cena 08 — Encerramento / CTA
 * frames 1260–1380 (42s–46s)
 *
 * Tela final minimalista: logo, tagline, CTA
 * Fundo escuro com brilho dourado
 */

import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { GoldenParticles } from '../components/GoldenParticles';
import { COLORS } from '../data/timing';

const C = COLORS;
const SERIF = '"Cormorant Garamond", Georgia, serif';
const SANS  = '"Inter", -apple-system, sans-serif';

// Sacred Jar icon for end card
const EndCardPot: React.FC<{ opacity: number; scale: number }> = ({ opacity, scale }) => (
  <svg
    width={100} height={100}
    viewBox="0 0 100 100"
    style={{ opacity, transform: `scale(${scale})` }}
    fill="none"
  >
    <path
      d="M35 28 L35 40 C35 40 18 48 18 65 L18 80 C18 88 25 92 35 92 L65 92 C75 92 82 88 82 80 L82 65 C82 48 65 40 65 40 L65 28 Z"
      fill={`${C.gold}22`}
      stroke={C.gold}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <rect x="30" y="20" width="40" height="12" rx="6" fill={`${C.gold}33`} stroke={C.gold} strokeWidth="2" />
    <path d="M45 60 C45 56 50 54 50 58 C50 54 55 56 55 60 C55 65 50 69 50 69 C50 69 45 65 45 60 Z" fill={C.gold} />
    <path d="M30 55 Q33 70 35 80" strokeWidth="3" stroke={`${C.gold}66`} strokeLinecap="round" />
    <circle cx="50" cy="57" r="44" stroke={C.gold} strokeWidth="0.5" opacity="0.2" />
    {/* Inner glow rings */}
    <circle cx="50" cy="57" r="36" stroke={C.gold} strokeWidth="0.3" opacity="0.15" />
  </svg>
);

export const ClosingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Entrance animations
  const logoSpring  = spring({ fps, frame: frame - 3,  config: { damping: 14, stiffness: 100 } });
  const textSpring  = spring({ fps, frame: frame - 20, config: { damping: 14, stiffness: 100 } });
  const ctaSpring   = spring({ fps, frame: frame - 45, config: { damping: 14, stiffness: 100 } });
  const subSpring   = spring({ fps, frame: frame - 60, config: { damping: 14, stiffness: 100 } });

  const logoScale   = interpolate(logoSpring, [0, 1], [0.3, 1]);
  const logoOpacity = interpolate(logoSpring, [0, 0.3], [0, 1]);

  const textY       = interpolate(textSpring,  [0, 1], [30, 0]);
  const textOpacity = interpolate(textSpring,  [0, 0.3], [0, 1]);

  const ctaY        = interpolate(ctaSpring,   [0, 1], [25, 0]);
  const ctaOpacity  = interpolate(ctaSpring,   [0, 0.3], [0, 1]);

  const subOpacity  = interpolate(subSpring,   [0, 0.3], [0, 1]);

  // Pulsing glow
  const glowPulse = 0.12 + Math.sin((frame / fps) * Math.PI * 2) * 0.05;

  // Shimmer on CTA button
  const shimmerX = interpolate(frame % 90, [0, 90], [-200, 400], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: '#0D0C0B', overflow: 'hidden' }}>

      {/* Radial bg glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 40%, rgba(197,160,89,${glowPulse * 1.5}) 0%, transparent 60%)`,
        pointerEvents: 'none',
      }} />

      {/* Grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `radial-gradient(rgba(197,160,89,0.04) 1px, transparent 1px)`,
        backgroundSize: '55px 55px',
        opacity: 0.7,
        pointerEvents: 'none',
      }} />

      {/* Particles */}
      <GoldenParticles count={8} intensity={0.5} />

      {/* Content — centered column */}
      <div style={{
        position: 'absolute',
        left: '50%', top: '50%',
        transform: 'translate(-50%, -55%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 0,
        width: '100%', padding: '0 60px',
        boxSizing: 'border-box',
        textAlign: 'center',
      }}>

        {/* Logo pot */}
        <div style={{
          transform: `scale(${logoScale})`,
          opacity: logoOpacity,
          marginBottom: 24,
          filter: `drop-shadow(0 0 ${20 * glowPulse}px ${C.gold})`,
        }}>
          <EndCardPot opacity={1} scale={1} />
        </div>

        {/* Brand name */}
        <div style={{
          opacity: textOpacity,
          transform: `translateY(${textY}px)`,
          marginBottom: 8,
        }}>
          <h1 style={{
            fontFamily: SERIF,
            fontSize: 90,
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
        <div style={{ opacity: textOpacity, marginBottom: 56 }}>
          <p style={{
            fontFamily: SANS, fontSize: 12,
            textTransform: 'uppercase', letterSpacing: '0.28em',
            color: 'rgba(249,248,246,0.4)', fontWeight: 600, margin: 0,
          }}>
            Casais
          </p>
        </div>

        {/* Horizontal line */}
        <div style={{
          width: interpolate(frame, [40, 70], [0, 180], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }),
          height: 1,
          backgroundColor: C.gold,
          opacity: 0.35,
          marginBottom: 48,
        }} />

        {/* CTA Button */}
        <div style={{
          opacity: ctaOpacity,
          transform: `translateY(${ctaY}px)`,
          width: '100%', maxWidth: 440,
          marginBottom: 24,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            width: '100%',
            background: `linear-gradient(135deg, #B8892A 0%, ${C.gold} 50%, #B8892A 100%)`,
            borderRadius: 20,
            padding: '22px 40px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 12px 40px rgba(197,160,89,0.3), 0 4px 12px rgba(0,0,0,0.2)`,
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Shimmer */}
            <div style={{
              position: 'absolute',
              top: 0, bottom: 0,
              left: shimmerX,
              width: 100,
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
              pointerEvents: 'none',
            }} />
            <span style={{
              fontFamily: SANS, fontSize: 14,
              fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.18em', color: '#1A1A1A',
              position: 'relative', zIndex: 1,
            }}>
              Comece o pote de vocês
            </span>
          </div>
        </div>

        {/* Sub CTA */}
        <div style={{ opacity: subOpacity }}>
          <p style={{
            fontFamily: SERIF, fontSize: 22,
            color: 'rgba(249,248,246,0.35)',
            fontStyle: 'italic', fontWeight: 300, margin: 0,
          }}>
            Em breve disponível
          </p>
        </div>
      </div>

      {/* Bottom brand signature */}
      <div style={{
        position: 'absolute',
        bottom: 120,
        left: 0, right: 0,
        textAlign: 'center',
        opacity: subOpacity * 0.5,
      }}>
        <p style={{
          fontFamily: SANS, fontSize: 10,
          textTransform: 'uppercase', letterSpacing: '0.25em',
          color: 'rgba(197,160,89,0.4)', margin: 0, fontWeight: 600,
        }}>
          pote sagrado • casais
        </p>
      </div>
    </AbsoluteFill>
  );
};
