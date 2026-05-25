import React from 'react';
import { COLORS } from '../data/timing';

interface PhoneFrameProps {
  children: React.ReactNode;
  scale?: number;
  offsetX?: number;
  offsetY?: number;
  rotation?: number;
  shadow?: boolean;
}

// iPhone-style phone frame that wraps app screen content
export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  children,
  scale = 1,
  offsetX = 0,
  offsetY = 0,
  rotation = 0,
  shadow = true,
}) => {
  const PHONE_W = 390;
  const PHONE_H = 844;
  const BORDER = 12;
  const RADIUS = 50;

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px)) scale(${scale}) rotate(${rotation}deg)`,
        width: PHONE_W + BORDER * 2,
        height: PHONE_H + BORDER * 2,
        borderRadius: RADIUS,
        background: 'linear-gradient(145deg, #2A2A2A 0%, #1A1A1A 40%, #222 100%)',
        boxShadow: shadow
          ? `0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08) inset, 0 0 40px rgba(197,160,89,0.05)`
          : 'none',
        zIndex: 10,
      }}
    >
      {/* Side buttons */}
      <div style={{
        position: 'absolute', left: -4, top: 140, width: 4, height: 40,
        backgroundColor: '#333', borderRadius: '2px 0 0 2px',
      }} />
      <div style={{
        position: 'absolute', left: -4, top: 200, width: 4, height: 60,
        backgroundColor: '#333', borderRadius: '2px 0 0 2px',
      }} />
      <div style={{
        position: 'absolute', left: -4, top: 280, width: 4, height: 60,
        backgroundColor: '#333', borderRadius: '2px 0 0 2px',
      }} />
      <div style={{
        position: 'absolute', right: -4, top: 200, width: 4, height: 80,
        backgroundColor: '#333', borderRadius: '0 2px 2px 0',
      }} />

      {/* Screen bezel */}
      <div
        style={{
          position: 'absolute',
          top: BORDER,
          left: BORDER,
          right: BORDER,
          bottom: BORDER,
          borderRadius: RADIUS - BORDER,
          overflow: 'hidden',
          backgroundColor: COLORS.bg,
        }}
      >
        {/* Notch */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 120,
            height: 34,
            backgroundColor: '#1A1A1A',
            borderRadius: '0 0 20px 20px',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#333', marginRight: 6 }} />
          <div style={{ width: 60, height: 6, borderRadius: 3, backgroundColor: '#222' }} />
        </div>

        {/* Screen reflection */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '40%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%)',
            zIndex: 5,
            pointerEvents: 'none',
            borderRadius: `${RADIUS - BORDER}px ${RADIUS - BORDER}px 0 0`,
          }}
        />

        {/* Content */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

// =====================================================
// GlowHighlight — dourado halo ao redor de um elemento clicado
// =====================================================

interface GlowHighlightProps {
  x: number;
  y: number;
  intensity?: number; // 0–1
  color?: string;
}

export const GlowHighlight: React.FC<GlowHighlightProps> = ({
  x, y, intensity = 1, color = 'rgba(197,160,89,0.4)',
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: x - 40,
        top: y - 40,
        width: 80,
        height: 80,
        borderRadius: '50%',
        backgroundColor: color,
        opacity: intensity,
        filter: 'blur(20px)',
        pointerEvents: 'none',
        zIndex: 150,
      }}
    />
  );
};

// =====================================================
// SceneTransition — fade/wipe entre cenas
// =====================================================
import { useCurrentFrame, interpolate } from 'remotion';

interface SceneTransitionProps {
  type?: 'fade' | 'slide-up';
  duration?: number; // frames
  direction?: 'in' | 'out';
}

export const SceneTransition: React.FC<SceneTransitionProps> = ({
  type = 'fade',
  duration = 15,
  direction = 'in',
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, duration],
    direction === 'in' ? [1, 0] : [0, 1],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#1A1A1A',
        opacity,
        zIndex: 999,
        pointerEvents: 'none',
      }}
    />
  );
};
