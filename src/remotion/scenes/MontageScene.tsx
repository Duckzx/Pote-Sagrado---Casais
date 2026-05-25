/**
 * Cena 07 — Momento de Marca (Montagem rápida)
 * frames 1080–1260 (36s–42s)
 *
 * Montagem com: pote enchendo, missão, carta, progress, card casal
 * Texto: "Metas. Momentos. Vocês."
 */

import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { GoldenParticles } from '../components/GoldenParticles';
import { COLORS, DEMO } from '../data/timing';

const C = COLORS;
const SERIF = '"Cormorant Garamond", Georgia, serif';
const SANS  = '"Inter", -apple-system, sans-serif';

// Mini card — small feature showcase
const MiniCard: React.FC<{
  emoji: string;
  title: string;
  desc: string;
  enterFrame: number;
  scale?: number;
  rotation?: number;
  offsetX?: number;
  offsetY?: number;
}> = ({ emoji, title, desc, enterFrame, scale = 1, rotation = 0, offsetX = 0, offsetY = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s = spring({ fps, frame: Math.max(0, frame - enterFrame), config: { damping: 14, stiffness: 140 } });
  const cardScale = interpolate(s, [0, 1], [0.5, scale]);
  const cardOpacity = interpolate(s, [0, 0.3], [0, 1]);

  return (
    <div style={{
      position: 'absolute',
      left: `calc(50% + ${offsetX}px)`,
      top: `calc(50% + ${offsetY}px)`,
      transform: `translate(-50%, -50%) scale(${cardScale}) rotate(${rotation}deg)`,
      opacity: cardOpacity,
      width: 280,
      backgroundColor: `${C.bg}F8`,
      border: `1px solid ${C.border}`,
      borderRadius: 28,
      padding: '20px 22px',
      boxShadow: '0 16px 40px rgba(0,0,0,0.12)',
      zIndex: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          backgroundColor: `${C.gold}20`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20,
          border: `1px solid ${C.gold}40`,
        }}>
          {emoji}
        </div>
        <div>
          <p style={{ fontFamily: SERIF, fontSize: 15, color: C.text, margin: 0, fontWeight: 500 }}>{title}</p>
          <p style={{ fontFamily: SANS, fontSize: 10, color: `${C.text}66`, margin: '2px 0 0' }}>{desc}</p>
        </div>
      </div>
      {/* Mini progress bar */}
      <div style={{ height: 4, backgroundColor: `${C.border}`, borderRadius: 2, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: '65%',
          background: `linear-gradient(90deg, ${C.primary}, ${C.gold})`,
          borderRadius: 2,
        }} />
      </div>
    </div>
  );
};

// Center Pote icon
const BigPot: React.FC<{ progress: number }> = ({ progress }) => {
  const fill = Math.min(95, progress * 95);
  return (
    <svg width={220} height={260} viewBox="0 0 220 260" overflow="visible">
      <defs>
        <clipPath id="potClipMontage">
          <path d="M 83 48 C 83 48 103 42 110 42 C 117 42 137 48 137 48 L 137 75 C 137 75 158 85 163 112 L 168 182 C 168 200 157 210 142 210 L 78 210 C 63 210 52 200 52 182 L 57 112 C 62 85 83 75 83 75 Z" />
        </clipPath>
        <linearGradient id="montageGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.gold} />
          <stop offset="100%" stopColor="#7A6014" />
        </linearGradient>
        <linearGradient id="montagePot" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D8C9B4" />
          <stop offset="100%" stopColor="#B8A07A" />
        </linearGradient>
      </defs>

      {/* Glow */}
      <ellipse cx="110" cy="225" rx="70" ry="14" fill={C.gold} opacity={0.2} />

      {/* Fill */}
      <g clipPath="url(#potClipMontage)">
        <rect x="48" y={210 - fill / 100 * 168} width="128" height="180" fill="url(#montageGold)" />
      </g>

      {/* Body */}
      <path
        d="M 83 48 C 83 48 103 42 110 42 C 117 42 137 48 137 48 L 137 75 C 137 75 158 85 163 112 L 168 182 C 168 200 157 210 142 210 L 78 210 C 63 210 52 200 52 182 L 57 112 C 62 85 83 75 83 75 Z"
        fill="url(#montagePot)"
        stroke={C.border}
        strokeWidth="2.5"
      />

      {/* Rim */}
      <rect x="78" y="36" width="64" height="16" rx="8" fill="#D4C5B0" stroke={C.border} strokeWidth="1.5" />

      {/* Shine */}
      <path d="M 83 92 Q 87 130, 88 175" stroke="rgba(255,255,255,0.3)" strokeWidth="4.5" strokeLinecap="round" fill="none" />

      {/* Plane */}
      <text x="110" y="148" textAnchor="middle" fontSize="32" fill={C.primary} opacity={0.18}>✈</text>

      {/* Sticker */}
      <g transform="translate(12, 45) rotate(-14)">
        <rect x="0" y="0" width="80" height="22" rx="11" fill="#1A1A1C" />
        <text x="40" y="15" textAnchor="middle" fontFamily="Georgia, serif" fontSize="11" fill="white" fontStyle="italic" fontWeight="bold">Pote Sagrado</text>
      </g>

      {/* Percentage label */}
      <text x="110" y="258" textAnchor="middle" fontFamily="Georgia, serif" fontSize="18" fill={C.gold} fontStyle="italic" fontWeight="bold">
        {Math.round(fill / 0.95)}%
      </text>
    </svg>
  );
};

export const MontageScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Pot grows
  const potSpring = spring({ fps, frame: frame - 5, config: { damping: 16, stiffness: 100 } });
  const potScale  = interpolate(potSpring, [0, 1], [0.5, 1]);
  const potOpacity = interpolate(potSpring, [0, 0.3], [0, 1]);
  const potProgress = interpolate(frame, [5, 80], [0.24, 0.3], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

  // Gold particles
  const particlesOpacity = interpolate(frame, [30, 60], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

  // Main text reveal
  const textOpacity = interpolate(frame, [100, 130], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
  const word1 = interpolate(frame, [100, 118], [20, 0], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
  const word2 = interpolate(frame, [112, 130], [20, 0], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
  const word3 = interpolate(frame, [124, 142], [20, 0], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

  const fadeOut = interpolate(frame, [165, 180], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: '#0E0C0A', overflow: 'hidden' }}>

      {/* Premium dark bg */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 40%, rgba(197,160,89,0.1) 0%, transparent 65%)`,
        pointerEvents: 'none',
      }} />

      {/* Particles */}
      <div style={{ opacity: particlesOpacity }}>
        <GoldenParticles count={10} intensity={0.8} />
      </div>

      {/* Big centered Pot */}
      <div style={{
        position: 'absolute',
        left: '50%', top: '42%',
        transform: `translate(-50%, -50%) scale(${potScale})`,
        opacity: potOpacity,
        zIndex: 5,
      }}>
        <BigPot progress={potProgress} />
      </div>

      {/* Mini feature cards orbiting */}
      <MiniCard
        emoji="🏆"
        title="Missão Concluída!"
        desc={DEMO.mission}
        enterFrame={25}
        scale={0.88}
        rotation={-6}
        offsetX={-320}
        offsetY={-60}
      />
      <MiniCard
        emoji="💕"
        title="Cartas do Amor"
        desc="Match perfeito! ✨"
        enterFrame={40}
        scale={0.88}
        rotation={5}
        offsetX={300}
        offsetY={-40}
      />
      <MiniCard
        emoji="✈️"
        title="Maragogi"
        desc="24% da meta concluída"
        enterFrame={55}
        scale={0.88}
        rotation={-4}
        offsetX={-310}
        offsetY={130}
      />
      <MiniCard
        emoji="💌"
        title="LoveCards"
        desc={`"${DEMO.loveCardAnswer.slice(0, 28)}..."`}
        enterFrame={70}
        scale={0.88}
        rotation={4}
        offsetX={295}
        offsetY={140}
      />

      {/* Main tagline */}
      <div style={{
        position: 'absolute',
        bottom: 360,
        left: 60, right: 60,
        textAlign: 'center',
      }}>
        <div style={{ overflow: 'hidden' }}>
          <span style={{
            fontFamily: SERIF, fontSize: 72, fontStyle: 'italic',
            color: '#F9F8F6',
            opacity: interpolate(frame, [100, 118], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }),
            transform: `translateY(${word1}px)`,
            display: 'inline-block',
            marginRight: 6,
          }}>Metas.</span>
          <span style={{
            fontFamily: SERIF, fontSize: 72, fontStyle: 'italic',
            color: C.gold,
            opacity: interpolate(frame, [112, 130], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }),
            transform: `translateY(${word2}px)`,
            display: 'inline-block',
            marginRight: 6,
          }}>Momentos.</span>
          <span style={{
            fontFamily: SERIF, fontSize: 72, fontStyle: 'italic',
            color: '#F9F8F6',
            opacity: interpolate(frame, [124, 142], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }),
            transform: `translateY(${word3}px)`,
            display: 'inline-block',
          }}>Vocês.</span>
        </div>
      </div>

      {/* Couple badge */}
      {frame >= 80 && (
        <div style={{
          position: 'absolute',
          bottom: 280,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'center', gap: 10,
          opacity: interpolate(frame, [80, 100], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }),
        }}>
          <div style={{
            padding: '6px 20px',
            borderRadius: 99,
            backgroundColor: `${C.gold}22`,
            border: `1px solid ${C.gold}55`,
          }}>
            <span style={{
              fontFamily: SANS, fontSize: 12, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.2em',
              color: C.gold,
            }}>
              {DEMO.coupleNames} • {DEMO.daysTogether} dias juntos
            </span>
          </div>
        </div>
      )}

      {/* Fade */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundColor: '#0E0C0A',
        opacity: fadeOut,
        pointerEvents: 'none',
      }} />
    </AbsoluteFill>
  );
};
