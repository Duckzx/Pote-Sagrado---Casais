/**
 * Cena 04 — Economizar pode ser divertido (Missões)
 * frames 450–630 (15s–21s)
 *
 * - Rápido depósito extra (R$ 120,00 / "Sem delivery essa semana")
 * - Abre tab Missões
 * - Destaca missão "Troquem um delivery por um date em casa"
 * - Realce dourado na missão
 */

import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { PhoneFrame } from '../components/PhoneFrame';
import { AppMissionsScreen } from '../components/AppScreens';
import { CursorClick } from '../components/CursorClick';
import { COLORS, DEMO } from '../data/timing';

const C = COLORS;
const SERIF = '"Cormorant Garamond", Georgia, serif';
const SANS  = '"Inter", -apple-system, sans-serif';

export const MissionsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Phase:
  // 0–20: slide in
  // 20–80: missions tab shown
  // 80–180: mission highlighted (cursor moves over it)

  const phoneSpring = spring({ fps, frame: frame - 3, config: { damping: 16, stiffness: 100 } });
  const phoneY = interpolate(phoneSpring, [0, 1], [200, 0]);
  const phoneScale = interpolate(phoneSpring, [0, 1], [0.9, 1]);

  const highlightMission = frame >= 60;

  // Cursor moves to mission area
  const MISSION_X = width / 2;
  const MISSION_Y = height / 2 + 20;

  const cursorTrack = {
    points: [
      { frame: 15, x: width * 0.5,   y: height * 0.35  },
      { frame: 50, x: width * 0.35,  y: height * 0.68  }, // tap nav
      { frame: 65, x: width * 0.35,  y: height * 0.68  },
      { frame: 90, x: MISSION_X,     y: MISSION_Y       },
      { frame: 160, x: MISSION_X,    y: MISSION_Y       },
    ],
    clickFrames: [55, 95],
  };

  // Text overlays
  const headlineOpacity = interpolate(frame, [8, 28], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
  const headlineOut    = interpolate(frame, [55, 70], [1, 0], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
  const highlight2Opacity = interpolate(frame, [90, 110], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

  const fadeOut = interpolate(frame, [165, 180], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: '#F0EDE5', overflow: 'hidden' }}>

      {/* bg */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 40% 20%, rgba(142,127,109,0.1) 0%, transparent 60%)`,
        pointerEvents: 'none',
      }} />

      {/* Headline text */}
      <div style={{
        position: 'absolute',
        top: 140, left: 60, right: 60,
        textAlign: 'center',
        opacity: headlineOpacity * headlineOut,
      }}>
        <p style={{
          fontFamily: SERIF, fontSize: 50,
          color: C.text, fontStyle: 'italic', fontWeight: 300,
          lineHeight: 1.2, margin: 0,
        }}>
          "Missões que<br/>fazem sentido."
        </p>
        <div style={{ width: 60, height: 2, backgroundColor: C.gold, margin: '18px auto 0', borderRadius: 1 }} />
      </div>

      {/* Phone */}
      <div style={{
        position: 'absolute',
        left: '50%', top: '53%',
        transform: `translate(-50%, -50%) translateY(${phoneY}px) scale(${phoneScale})`,
      }}>
        <PhoneFrame scale={0.78} shadow>
          <AppMissionsScreen highlightMission={highlightMission} />
        </PhoneFrame>
      </div>

      {/* Cursor */}
      <div style={{
        position: 'absolute', left: 0, top: 0,
        transform: `translateY(${phoneY}px)`,
      }}>
        <CursorClick track={cursorTrack} />
      </div>

      {/* Mission callout */}
      {frame >= 90 && (
        <div style={{
          position: 'absolute',
          top: 140, left: 60, right: 60,
          textAlign: 'center',
          opacity: highlight2Opacity,
          transform: `translateY(${interpolate(frame, [90, 110], [15, 0], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' })}px)`,
        }}>
          <div style={{
            display: 'inline-block',
            padding: '12px 28px',
            borderRadius: 99,
            backgroundColor: `${C.gold}22`,
            border: `1px solid ${C.gold}55`,
            marginBottom: 12,
          }}>
            <span style={{
              fontFamily: SANS, fontSize: 11, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.15em',
              color: C.gold,
            }}>
              🛵 Missão do Dia
            </span>
          </div>
          <p style={{
            fontFamily: SERIF, fontSize: 36,
            color: C.text, fontStyle: 'italic', fontWeight: 300,
            lineHeight: 1.3, margin: 0,
          }}>
            "{DEMO.mission}"
          </p>
        </div>
      )}

      {/* Fade */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundColor: '#F0EDE5',
        opacity: fadeOut,
        pointerEvents: 'none',
      }} />
    </AbsoluteFill>
  );
};
