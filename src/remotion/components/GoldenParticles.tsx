import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { COLORS } from '../data/timing';

interface Particle {
  x: number;
  y: number;
  size: number;
  delay: number;
  speed: number;
  opacity: number;
}

// Deterministic particles (no Math.random during render)
const PARTICLES: Particle[] = [
  { x: 0.15, y: 0.8,  size: 4,  delay: 0,  speed: 1.2, opacity: 0.7 },
  { x: 0.35, y: 0.7,  size: 3,  delay: 8,  speed: 0.9, opacity: 0.5 },
  { x: 0.55, y: 0.9,  size: 5,  delay: 4,  speed: 1.4, opacity: 0.8 },
  { x: 0.72, y: 0.75, size: 3,  delay: 12, speed: 1.1, opacity: 0.6 },
  { x: 0.88, y: 0.85, size: 4,  delay: 6,  speed: 1.0, opacity: 0.7 },
  { x: 0.25, y: 0.6,  size: 2,  delay: 15, speed: 1.3, opacity: 0.4 },
  { x: 0.62, y: 0.65, size: 3,  delay: 3,  speed: 0.8, opacity: 0.6 },
  { x: 0.45, y: 0.85, size: 2,  delay: 10, speed: 1.2, opacity: 0.5 },
  { x: 0.78, y: 0.6,  size: 4,  delay: 7,  speed: 1.0, opacity: 0.7 },
  { x: 0.08, y: 0.7,  size: 3,  delay: 2,  speed: 1.5, opacity: 0.5 },
  { x: 0.92, y: 0.5,  size: 2,  delay: 18, speed: 0.9, opacity: 0.4 },
  { x: 0.50, y: 0.55, size: 5,  delay: 5,  speed: 1.1, opacity: 0.8 },
];

interface GoldenParticlesProps {
  count?: number;
  intensity?: number; // 0–1
}

export const GoldenParticles: React.FC<GoldenParticlesProps> = ({
  count = 12,
  intensity = 1,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {PARTICLES.slice(0, count).map((p, i) => {
        const localFrame = (frame + p.delay * 10) % 120; // loop every 4s
        const progress = localFrame / 120;
        const yOffset = progress * 180 * p.speed;
        const opacity = interpolate(
          progress,
          [0, 0.1, 0.8, 1],
          [0, p.opacity * intensity, p.opacity * intensity, 0],
          { extrapolateRight: 'clamp' }
        );

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: p.x * width,
              top: p.y * height - yOffset,
              width: p.size * 2,
              height: p.size * 2,
              borderRadius: '50%',
              backgroundColor: COLORS.gold,
              opacity,
              boxShadow: `0 0 ${p.size * 3}px ${COLORS.gold}`,
            }}
          />
        );
      })}
    </div>
  );
};
