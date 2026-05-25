/**
 * Cena 05 — Mais do que dinheiro (LoveCards)
 * frames 630–900 (21s–30s)
 *
 * - Abre aba Cartas do Amor
 * - Navega categorias
 * - Toca em carta (flip animation)
 * - Abre drawer de resposta
 * - Digita: "Aquela noite com pizza, filme ruim e a gente rindo de tudo."
 * - Clica enviar — feedback de sucesso
 */

import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { PhoneFrame } from '../components/PhoneFrame';
import { AppLoveCardsScreen } from '../components/AppScreens';
import { CursorClick } from '../components/CursorClick';
import { COLORS, DEMO } from '../data/timing';

const C = COLORS;
const SERIF = '"Cormorant Garamond", Georgia, serif';
const SANS  = '"Inter", -apple-system, sans-serif';

export const LoveCardsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Phase timeline:
  // 0–25:   slide in
  // 25–60:  LoveCards tab shown, cursor moves to card
  // 60–80:  card flipped
  // 80–110: drawer opens
  // 110–210: text typed
  // 210–240: confirm clicked → submitted
  // 240–270: fade out

  const phoneSpring = spring({ fps, frame: frame - 3, config: { damping: 16, stiffness: 100 } });
  const phoneY = interpolate(phoneSpring, [0, 1], [220, 0]);
  const phoneScale = interpolate(phoneSpring, [0, 1], [0.9, 1]);

  const isFlipped       = frame >= 65 && frame < 85;
  const showAnswerDrawer = frame >= 85;

  // Text typing
  const answerFull = DEMO.loveCardAnswer;
  const answerChars = frame >= 112
    ? Math.min(answerFull.length, Math.floor((frame - 112) * 0.62))
    : 0;
  const typedAnswer = answerFull.slice(0, answerChars);
  const submitted   = frame >= 220;

  // Cursor
  const CARD_X   = width / 2;
  const CARD_Y   = height / 2 + 30;
  const SEND_X   = width / 2;
  const SEND_Y   = height / 2 + 290;

  const cursorTrack = {
    points: [
      { frame: 18,  x: width * 0.45,  y: height * 0.52 },
      { frame: 55,  x: CARD_X,        y: CARD_Y        },
      { frame: 68,  x: CARD_X,        y: CARD_Y        },
      { frame: 90,  x: CARD_X,        y: CARD_Y + 80   },
      { frame: 205, x: SEND_X,        y: SEND_Y        },
      { frame: 220, x: SEND_X,        y: SEND_Y        },
    ],
    clickFrames: [62, 86, 215],
  };

  // Text overlays
  const headline1Opacity = interpolate(frame, [8, 28], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
  const headline1Out    = interpolate(frame, [55, 72], [1, 0], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

  const headline2Opacity = interpolate(frame, [135, 155], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
  const headline2Out    = interpolate(frame, [210, 228], [1, 0], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

  const sentBadgeOpacity = interpolate(frame, [222, 240], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

  const fadeOut = interpolate(frame, [255, 270], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: '#F7F4EF', overflow: 'hidden' }}>

      {/* bg */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 30% 20%, rgba(142,127,109,0.08) 0%, transparent 55%)`,
        pointerEvents: 'none',
      }} />

      {/* Headline 1 */}
      <div style={{
        position: 'absolute',
        top: 140, left: 60, right: 60,
        textAlign: 'center',
        opacity: headline1Opacity * headline1Out,
      }}>
        <p style={{
          fontFamily: SERIF, fontSize: 50,
          color: C.text, fontStyle: 'italic', fontWeight: 300,
          lineHeight: 1.2, margin: 0,
        }}>
          "Conexão também<br/>é conquista."
        </p>
      </div>

      {/* Headline 2 — emotional */}
      {frame >= 135 && (
        <div style={{
          position: 'absolute',
          top: 140, left: 60, right: 60,
          textAlign: 'center',
          opacity: headline2Opacity * headline2Out,
        }}>
          <p style={{
            fontFamily: SERIF, fontSize: 38,
            color: C.text, fontStyle: 'italic', fontWeight: 300,
            lineHeight: 1.35, margin: 0,
          }}>
            "Não é só sobre guardar<br/>dinheiro. É sobre lembrar<br/>por que vocês começaram."
          </p>
        </div>
      )}

      {/* Sent confirmation */}
      {frame >= 222 && (
        <div style={{
          position: 'absolute',
          top: 150, left: 60, right: 60,
          textAlign: 'center',
          opacity: sentBadgeOpacity,
          transform: `scale(${interpolate(frame, [222, 238], [0.8, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' })})`,
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '14px 30px',
            borderRadius: 99,
            backgroundColor: `rgba(16,185,129,0.15)`,
            border: `1px solid rgba(16,185,129,0.35)`,
          }}>
            <span style={{ fontSize: 20 }}>💌</span>
            <span style={{
              fontFamily: SANS, fontSize: 13, fontWeight: 700,
              color: '#10B981',
              textTransform: 'uppercase', letterSpacing: '0.12em',
            }}>
              Resposta enviada!
            </span>
          </div>
        </div>
      )}

      {/* Phone */}
      <div style={{
        position: 'absolute',
        left: '50%', top: '54%',
        transform: `translate(-50%, -50%) translateY(${phoneY}px) scale(${phoneScale})`,
      }}>
        <PhoneFrame scale={0.78} shadow>
          <AppLoveCardsScreen
            showCard={true}
            isFlipped={isFlipped}
            showAnswerDrawer={showAnswerDrawer}
            typedAnswer={typedAnswer}
            submitted={submitted}
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

      {/* Fade */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundColor: '#F7F4EF',
        opacity: fadeOut,
        pointerEvents: 'none',
      }} />
    </AbsoluteFill>
  );
};
