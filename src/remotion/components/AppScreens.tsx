/**
 * AppScreens.tsx
 * Recriações fiéis das telas reais do Pote Sagrado
 * Usando o design system real do app (cores, fontes, layout)
 *
 * Paleta real:
 *   bg:      #F9F8F6
 *   text:    #2C2A26
 *   border:  #E6E2D8
 *   primary: #8E7F6D
 *   gold:    #C5A059
 *
 * Fontes: Cormorant Garamond (serif), Inter (sans)
 */

import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { COLORS, DEMO } from '../data/timing';
import { formatBRL } from '../../lib/maskUtils';

// =====================================================
// Tokens
// =====================================================
const C = COLORS;
const SERIF = '"Cormorant Garamond", Georgia, serif';
const SANS  = '"Inter", -apple-system, sans-serif';

// =====================================================
// TELA 1 — Login Screen
// =====================================================
export const AppLoginScreen: React.FC<{ logoScale?: number }> = ({ logoScale = 1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoSpring = spring({ fps, frame: frame - 5, config: { damping: 14 } });
  const textOpacity = interpolate(frame, [15, 35], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
  const btnOpacity  = interpolate(frame, [30, 50], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
  const btnY        = interpolate(frame, [30, 50], [20, 0], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

  return (
    <div style={{
      width: '100%', height: '100%',
      backgroundColor: C.bg,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '60px 40px',
      boxSizing: 'border-box',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Radial gradient bg */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(circle at 50% -10%, rgba(142,127,109,0.12) 0%, transparent 60%)`,
        pointerEvents: 'none',
      }} />

      {/* Color bends effect — wave lines */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%',
        background: `linear-gradient(180deg, transparent 0%, rgba(142,127,109,0.06) 100%)`,
        pointerEvents: 'none',
      }} />

      {/* Logo mark — Sacred Jar SVG */}
      <div style={{
        transform: `scale(${logoSpring * logoScale})`,
        marginBottom: 32,
      }}>
        <PoteIcon size={112} color={C.primary} />
      </div>

      {/* Title */}
      <div style={{ textAlign: 'center', opacity: textOpacity, marginBottom: 60 }}>
        <h1 style={{
          fontFamily: SERIF,
          fontSize: 64,
          lineHeight: 0.88,
          color: C.text,
          fontWeight: 400,
          margin: 0,
          letterSpacing: '-0.02em',
        }}>
          Pote<br/>
          <span style={{ color: C.primary, fontStyle: 'italic' }}>Sagrado</span>
        </h1>
        <p style={{
          fontFamily: SANS,
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.25em',
          color: `${C.text}99`,
          fontWeight: 700,
          marginTop: 16,
        }}>
          O diário financeiro do casal
        </p>
      </div>

      {/* Google Login Button */}
      <div style={{
        width: '100%',
        opacity: btnOpacity,
        transform: `translateY(${btnY}px)`,
      }}>
        <div style={{
          width: '100%',
          backgroundColor: C.text,
          color: C.bg,
          borderRadius: 20,
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          boxShadow: '0 12px 24px rgba(0,0,0,0.12)',
        }}>
          {/* Google G */}
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span style={{
            fontFamily: SANS,
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
          }}>
            Entrar com Google
          </span>
        </div>
      </div>
    </div>
  );
};

// =====================================================
// TELA 2 — Home Tab (SacredPot + Info)
// =====================================================
interface AppHomeScreenProps {
  fillPercent?: number;    // 0–100 (pote enchendo)
  showDeposit?: boolean;
  depositAmount?: string;
  depositDesc?: string;
  depositSubmitted?: boolean;
  showConfetti?: boolean;
}

export const AppHomeScreen: React.FC<AppHomeScreenProps> = ({
  fillPercent = 24,
  showDeposit = false,
  depositAmount = '',
  depositDesc = '',
  depositSubmitted = false,
  showConfetti = false,
}) => {
  const frame = useCurrentFrame();

  const pctDisplay = Math.min(100, Math.max(0, fillPercent));

  return (
    <div style={{
      width: '100%', height: '100%',
      backgroundColor: C.bg,
      display: 'flex', flexDirection: 'column',
      overflowY: 'hidden',
      position: 'relative',
      boxSizing: 'border-box',
    }}>
      {/* Bg gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(circle at 50% -10%, rgba(142,127,109,0.1) 0%, transparent 55%)`,
        pointerEvents: 'none',
      }} />

      {/* Premium Banner */}
      <div style={{
        margin: '44px 20px 0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '6px 16px 6px 6px',
        backgroundColor: C.bg,
        border: `1px solid ${C.border}`,
        borderRadius: 99,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            backgroundColor: C.gold,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 14 }}>👑</span>
          </div>
          <div>
            <p style={{ fontFamily: SANS, fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 700, color: `${C.text}66`, margin: 0 }}>Versão Gratuita</p>
            <p style={{ fontFamily: SERIF, fontSize: 13, color: C.text, margin: 0 }}>Fazer upgrade para Premium</p>
          </div>
        </div>
        <span style={{ color: `${C.text}33`, fontSize: 14 }}>›</span>
      </div>

      {/* Header */}
      <div style={{
        textAlign: 'center', padding: '16px 20px 0',
        position: 'relative',
      }}>
        <p style={{
          fontFamily: SANS, fontSize: 10, textTransform: 'uppercase',
          letterSpacing: '0.2em', fontWeight: 700,
          color: `${C.text}99`, margin: 0,
        }}>Reserva de Casal</p>
        <p style={{
          fontFamily: SERIF, fontSize: 15, fontStyle: 'italic',
          color: C.primary, margin: '4px 0 0',
        }}>
          {DEMO.daysTogether} dias juntos ❤️
        </p>

        {/* Share btn */}
        <div style={{
          position: 'absolute', right: 20, top: 14,
          width: 32, height: 32, borderRadius: '50%',
          backgroundColor: `${C.primary}22`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ color: C.primary, fontSize: 14 }}>⇪</span>
        </div>
      </div>

      {/* Sacred Pot */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <PotVisualization fillPercent={pctDisplay} totalSaved={DEMO.totalSaved} goalAmount={DEMO.goalAmount} />
      </div>

      {/* Bottom nav */}
      <BottomNavBar active="home" />

      {/* FAB */}
      <div style={{
        position: 'absolute',
        bottom: 88, right: 20,
        width: 56, height: 56, borderRadius: '50%',
        backgroundColor: C.primary,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 8px 24px rgba(142,127,109,0.35)',
        zIndex: 30,
      }}>
        <span style={{ color: 'white', fontSize: 26, lineHeight: 1, marginTop: -2 }}>+</span>
      </div>

      {/* Deposit Modal */}
      {showDeposit && (
        <AppDepositModal
          amount={depositAmount}
          desc={depositDesc}
          submitted={depositSubmitted}
        />
      )}

      {/* Confetti dots */}
      {showConfetti && <ConfettiOverlay />}
    </div>
  );
};

// =====================================================
// Deposit Modal — bottom sheet fiel ao app
// =====================================================
interface AppDepositModalProps {
  amount: string;
  desc: string;
  submitted?: boolean;
}
export const AppDepositModal: React.FC<AppDepositModalProps> = ({ amount, desc, submitted }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideUp = spring({ fps, frame, config: { damping: 20, stiffness: 200 } });
  const translateY = interpolate(slideUp, [0, 1], [300, 0]);

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 60,
      backgroundColor: `${C.bg}E6`,
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'flex-end',
    }}>
      <div style={{
        width: '100%',
        backgroundColor: C.bg,
        borderRadius: '28px 28px 0 0',
        padding: '16px 24px 32px',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.08)',
        border: `1px solid ${C.border}`,
        transform: `translateY(${translateY}px)`,
        boxSizing: 'border-box',
      }}>
        {/* Handle */}
        <div style={{
          width: 40, height: 4, borderRadius: 2,
          backgroundColor: `${C.border}`,
          margin: '0 auto 20px',
        }} />

        <h3 style={{
          fontFamily: SERIF, fontSize: 20, color: C.text,
          textAlign: 'center', margin: '0 0 20px', fontWeight: 400,
        }}>
          Depósito Rápido
        </h3>

        {/* Income/Expense toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <div style={{
            flex: 1, padding: '12px', borderRadius: 18, textAlign: 'center',
            backgroundColor: '#10B981', color: 'white',
            fontFamily: SANS, fontSize: 10, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.1em',
          }}>↑ Entrada</div>
          <div style={{
            flex: 1, padding: '12px', borderRadius: 18, textAlign: 'center',
            backgroundColor: `${C.border}88`, color: `${C.text}88`,
            fontFamily: SANS, fontSize: 10, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.1em',
            border: `1px solid ${C.border}`,
          }}>↓ Saída</div>
        </div>

        {/* Amount */}
        <div style={{
          backgroundColor: `${C.bg}EE`,
          border: `1px solid ${C.border}`,
          borderRadius: 18,
          padding: '14px',
          marginBottom: 12,
          textAlign: 'center',
        }}>
          <span style={{
            fontFamily: SERIF, fontSize: 36, color: C.text,
          }}>
            {amount || 'R$ 0,00'}
          </span>
        </div>

        {/* Description */}
        <div style={{
          backgroundColor: `${C.bg}EE`,
          border: `1px solid ${C.border}`,
          borderRadius: 18,
          padding: '14px 16px',
          marginBottom: 20,
        }}>
          <span style={{
            fontFamily: SANS, fontSize: 13, color: desc ? C.text : `${C.text}66`,
          }}>
            {desc || 'Descrição (opcional)'}
          </span>
        </div>

        {/* Submit button */}
        <div style={{
          backgroundColor: submitted ? '#10B981' : C.primary,
          borderRadius: 18,
          padding: '18px',
          textAlign: 'center',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          transition: 'background-color 0.3s',
        }}>
          <span style={{
            fontFamily: SANS, fontSize: 11, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.15em', color: 'white',
          }}>
            {submitted ? '✓ Guardado no Pote!' : 'Guardar no Pote'}
          </span>
        </div>
      </div>
    </div>
  );
};

// =====================================================
// TELA 3 — Missions Tab
// =====================================================
export const AppMissionsScreen: React.FC<{ highlightMission?: boolean }> = ({ highlightMission = false }) => {
  const frame = useCurrentFrame();

  const missions = [
    { id: 'jantar', icon: '🍝', title: 'Jantar em Casa', desc: 'Cozinharam juntos ao invés de pedir delivery.', done: true },
    { id: 'delivery', icon: '🛵', title: DEMO.mission, desc: 'Venceram a tentação do delivery hoje.', done: false, highlight: true },
    { id: 'cafe', icon: '☕', title: 'Café em Casa', desc: 'Fizeram café ao invés de comprar na rua.', done: true },
    { id: 'bus', icon: '🚌', title: 'Transporte Econômico', desc: 'Usaram transporte público ou foram a pé.', done: false },
  ];

  return (
    <div style={{
      width: '100%', height: '100%',
      backgroundColor: C.bg,
      display: 'flex', flexDirection: 'column',
      boxSizing: 'border-box',
      position: 'relative',
    }}>
      {/* Bg */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(circle at 50% -10%, rgba(142,127,109,0.08) 0%, transparent 55%)`,
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{ padding: '44px 24px 16px', textAlign: 'center' }}>
        <p style={{ fontFamily: SANS, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 700, color: `${C.text}99`, margin: 0 }}>
          MISSÕES & CONQUISTAS
        </p>
        <h2 style={{ fontFamily: SERIF, fontSize: 28, color: C.text, margin: '8px 0 0', fontWeight: 400 }}>
          Desafios do Casal
        </h2>
      </div>

      {/* Stats row */}
      <div style={{
        margin: '0 24px 16px',
        display: 'flex', gap: 12,
      }}>
        {[
          { label: 'Completadas', value: '2' },
          { label: 'Em progresso', value: '2' },
          { label: 'Sequência', value: '3 dias 🔥' },
        ].map((stat, i) => (
          <div key={i} style={{
            flex: 1,
            backgroundColor: C.bg,
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            padding: '12px 8px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}>
            <p style={{ fontFamily: SERIF, fontSize: 20, color: C.text, margin: 0, fontWeight: 600 }}>{stat.value}</p>
            <p style={{ fontFamily: SANS, fontSize: 8, color: `${C.text}66`, margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Missions list */}
      <div style={{ flex: 1, padding: '0 24px', overflowY: 'hidden' }}>
        {missions.map((m, i) => {
          const isHighlighted = m.highlight && highlightMission;
          return (
            <div key={m.id} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              backgroundColor: isHighlighted ? `${C.gold}18` : C.bg,
              border: `1px solid ${isHighlighted ? C.gold : C.border}`,
              borderRadius: 20,
              padding: '16px',
              marginBottom: 12,
              boxShadow: isHighlighted ? `0 4px 20px ${C.gold}33` : '0 2px 8px rgba(0,0,0,0.03)',
              transition: 'all 0.3s',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                backgroundColor: isHighlighted ? `${C.gold}22` : `${C.text}08`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22,
                border: `1px solid ${isHighlighted ? C.gold : C.border}55`,
                flexShrink: 0,
              }}>
                {m.icon}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{
                  fontFamily: SERIF, fontSize: 15, color: isHighlighted ? C.text : C.text,
                  margin: 0, fontWeight: 500,
                }}>{m.title}</p>
                <p style={{
                  fontFamily: SANS, fontSize: 10, color: `${C.text}66`,
                  margin: '3px 0 0',
                }}>{m.desc}</p>
              </div>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                backgroundColor: m.done ? '#10B981' : isHighlighted ? `${C.gold}33` : `${C.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                boxShadow: m.done ? '0 2px 8px rgba(16,185,129,0.3)' : 'none',
              }}>
                {m.done ? (
                  <span style={{ color: 'white', fontSize: 12 }}>✓</span>
                ) : (
                  <span style={{ color: C.primary, fontSize: 10, fontWeight: 700 }}>○</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <BottomNavBar active="missoes" />
    </div>
  );
};

// =====================================================
// TELA 4 — LoveCards Tab
// =====================================================
interface AppLoveCardsScreenProps {
  showCard?: boolean;
  isFlipped?: boolean;
  showAnswerDrawer?: boolean;
  typedAnswer?: string;
  submitted?: boolean;
}

export const AppLoveCardsScreen: React.FC<AppLoveCardsScreenProps> = ({
  showCard = true,
  isFlipped = false,
  showAnswerDrawer = false,
  typedAnswer = '',
  submitted = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const flipProgress = isFlipped
    ? interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' })
    : 0;

  const drawerSlide = showAnswerDrawer
    ? spring({ fps, frame, config: { damping: 22, stiffness: 220 } })
    : 0;

  return (
    <div style={{
      width: '100%', height: '100%',
      backgroundColor: C.bg,
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Bg */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(circle at 50% -10%, rgba(142,127,109,0.08) 0%, transparent 55%)`,
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{ padding: '44px 24px 8px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ color: `${C.primary}CC`, fontSize: 18 }}>♥</span>
          <h2 style={{ fontFamily: SERIF, fontSize: 26, color: C.text, margin: 0, fontWeight: 400 }}>Cartas do Amor</h2>
          <span style={{ color: `${C.primary}CC`, fontSize: 18 }}>♥</span>
        </div>
        <p style={{
          fontFamily: SANS, fontSize: 9, textTransform: 'uppercase',
          letterSpacing: '0.2em', fontWeight: 700, color: `${C.text}66`, margin: 0,
        }}>
          Inspirado nos Mapas do Amor de Gottman
        </p>
      </div>

      {/* Gold Dust */}
      <div style={{
        margin: '12px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 16px',
          background: `linear-gradient(90deg, ${C.gold}18, rgba(197,160,89,0.08))`,
          borderRadius: 99, border: `1px solid ${C.gold}33`,
        }}>
          <span style={{ fontSize: 13 }}>✨</span>
          <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.gold }}>
            28 Pó de Ouro
          </span>
        </div>
        <div style={{
          padding: '6px 12px', borderRadius: 99,
          backgroundColor: `${C.text}08`, border: `1px solid ${C.border}`,
          fontFamily: SANS, fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.1em', color: C.primary,
        }}>
          Convidar Parceiro(a)
        </div>
      </div>

      {/* Category pills */}
      <div style={{
        display: 'flex', gap: 8,
        padding: '0 24px', overflowX: 'hidden',
        marginBottom: 12,
      }}>
        {[
          { label: 'Romance', emoji: '💕', active: true },
          { label: 'Conhecimento', emoji: '🧠', active: false },
          { label: 'Aventura', emoji: '🌟', active: false },
        ].map((cat, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 14px',
            borderRadius: 18,
            backgroundColor: cat.active ? C.text : `${C.bg}CC`,
            border: `1px solid ${cat.active ? C.text : C.border}`,
            boxShadow: cat.active ? '0 4px 12px rgba(0,0,0,0.1)' : '0 1px 4px rgba(0,0,0,0.03)',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 14 }}>{cat.emoji}</span>
            <span style={{
              fontFamily: SANS, fontSize: 9, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.1em',
              color: cat.active ? C.bg : `${C.text}99`,
            }}>
              {cat.label}
            </span>
            <span style={{
              fontFamily: SANS, fontSize: 8,
              backgroundColor: cat.active ? `${C.bg}33` : `${C.text}0A`,
              borderRadius: 99, padding: '2px 6px',
              color: cat.active ? `${C.bg}CC` : `${C.text}66`,
            }}>Nv.1</span>
          </div>
        ))}
      </div>

      {/* Level progress bar */}
      <div style={{
        margin: '0 24px 16px',
        backgroundColor: `${C.bg}CC`,
        border: `1px solid ${C.border}`,
        borderRadius: 16, padding: '12px 16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontFamily: SANS, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: `${C.text}66` }}>Nível 1</span>
          <span style={{ fontFamily: SANS, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: `${C.text}66` }}>2/6 cartas</span>
        </div>
        <div style={{ height: 6, backgroundColor: `${C.text}0A`, borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: '33%', background: `linear-gradient(90deg, ${C.primary}, ${C.gold})`, borderRadius: 3 }} />
        </div>
      </div>

      {/* The Card */}
      {showCard && (
        <div style={{
          margin: '0 24px', flex: 1,
          backgroundColor: `${C.bg}F5`,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${C.border}`,
          borderRadius: 32,
          padding: '28px 24px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.07)',
          position: 'relative', overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          minHeight: 280,
        }}>
          {/* Glow */}
          <div style={{
            position: 'absolute', top: -20, right: -20,
            width: 140, height: 140, borderRadius: '50%',
            backgroundColor: `${C.primary}22`,
            filter: 'blur(30px)', pointerEvents: 'none',
          }} />

          {!isFlipped ? (
            // Front
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <span style={{
                  padding: '4px 12px', borderRadius: 99,
                  backgroundColor: `${C.primary}18`,
                  fontFamily: SANS, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
                  color: C.primary, border: `1px solid ${C.primary}22`,
                }}>
                  💕 Romance
                </span>
                <span style={{
                  padding: '4px 10px', borderRadius: 99,
                  backgroundColor: `${C.text}08`,
                  fontFamily: SANS, fontSize: 9, fontWeight: 700,
                  color: `${C.text}66`, border: `1px solid ${C.border}55`,
                }}>
                  Nv.1
                </span>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <span style={{ fontSize: 60, marginBottom: 20, display: 'block' }}>💭</span>
                <h3 style={{ fontFamily: SERIF, fontSize: 20, color: C.text, margin: 0, fontWeight: 400 }}>
                  Momento que fico guardando
                </h3>
                <p style={{ fontFamily: SANS, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: `${C.text}55`, marginTop: 16, fontWeight: 700 }}>
                  Toque para virar ↻
                </p>
              </div>
            </div>
          ) : (
            // Back
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <span style={{ fontSize: 36, marginBottom: 14, display: 'block' }}>💭</span>
              <h3 style={{ fontFamily: SERIF, fontSize: 18, color: C.text, margin: '0 0 12px', fontWeight: 400 }}>
                Momento que fico guardando
              </h3>
              <p style={{
                fontFamily: SANS, fontSize: 14, color: `${C.text}AA`,
                lineHeight: 1.6, marginBottom: 24, maxWidth: 280,
              }}>
                {DEMO.loveCardQuestion}
              </p>

              <div style={{
                backgroundColor: C.text,
                borderRadius: 16, padding: '14px 28px',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ color: 'white', fontSize: 13 }}>↗</span>
                <span style={{
                  fontFamily: SANS, fontSize: 10, fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.1em', color: 'white',
                }}>Responder</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Answer Drawer */}
      {showAnswerDrawer && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 50,
          backgroundColor: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'flex-end',
        }}>
          <div style={{
            width: '100%',
            backgroundColor: C.bg,
            borderRadius: '32px 32px 0 0',
            padding: '20px 24px 36px',
            transform: `translateY(${interpolate(drawerSlide, [0, 1], [300, 0])}px)`,
            boxSizing: 'border-box',
          }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: C.border, margin: '0 auto 24px' }} />

            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <span style={{ fontSize: 40, display: 'block', marginBottom: 12 }}>💭</span>
              <h3 style={{ fontFamily: SERIF, fontSize: 20, color: C.text, margin: '0 0 8px', fontWeight: 400 }}>
                Momento que fico guardando
              </h3>
              <p style={{ fontFamily: SANS, fontSize: 13, color: `${C.text}AA`, margin: 0, lineHeight: 1.5 }}>
                {DEMO.loveCardQuestion}
              </p>
            </div>

            <div style={{
              backgroundColor: `${C.text}08`,
              border: `1px solid ${C.border}`,
              borderRadius: 20, padding: '14px 16px',
              marginBottom: 16,
              minHeight: 80,
            }}>
              <span style={{ fontFamily: SANS, fontSize: 14, color: typedAnswer ? C.text : `${C.text}55` }}>
                {typedAnswer || 'Escreva a sua resposta...'}
                {typedAnswer && !submitted && (
                  <span style={{ borderRight: `2px solid ${C.text}`, marginLeft: 2, opacity: Math.floor(frame / 8) % 2 === 0 ? 1 : 0 }} />
                )}
              </span>
            </div>

            <div style={{
              backgroundColor: submitted ? '#10B981' : C.text,
              borderRadius: 18, padding: '18px',
              textAlign: 'center',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: submitted ? '0 4px 16px rgba(16,185,129,0.3)' : 'none',
              opacity: typedAnswer || submitted ? 1 : 0.4,
            }}>
              <span style={{ color: 'white', fontSize: 13 }}>↗</span>
              <span style={{
                fontFamily: SANS, fontSize: 11, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.1em', color: 'white',
              }}>
                {submitted ? '✓ Resposta Enviada!' : 'Enviar Resposta'}
              </span>
            </div>
          </div>
        </div>
      )}

      <BottomNavBar active="lovecards" />
    </div>
  );
};

// =====================================================
// TELA 5 — ShareableWidget (card darkmode)
// =====================================================
export const AppShareWidget: React.FC<{ visible?: boolean }> = ({ visible = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scaleSpring = spring({ fps, frame, config: { damping: 16, stiffness: 200 } });
  const scale = interpolate(scaleSpring, [0, 1], [0.85, 1]);
  const opacity = interpolate(scaleSpring, [0, 1], [0, 1]);

  const pct = DEMO.percentage;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 200,
      backgroundColor: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{
        width: '100%', maxWidth: 340,
        transform: `scale(${scale})`,
        opacity,
      }}>
        {/* Card */}
        <div style={{
          borderRadius: 32,
          padding: 24,
          backgroundColor: '#151515',
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
        }}>
          {/* Sparkle bg */}
          <div style={{
            position: 'absolute', top: 20, right: 20, opacity: 0.15,
          }}>
            <span style={{ fontSize: 80, color: '#3A362D' }}>✦</span>
          </div>

          {/* Header line */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 12, marginBottom: 24,
          }}>
            <div style={{ width: 24, height: 1, backgroundColor: C.gold, opacity: 0.6 }} />
            <span style={{
              fontFamily: SANS, fontSize: 10, textTransform: 'uppercase',
              letterSpacing: '0.2em', fontWeight: 700, color: C.gold,
            }}>Pote Sagrado</span>
            <div style={{ width: 24, height: 1, backgroundColor: C.gold, opacity: 0.6 }} />
          </div>

          {/* Pot SVG */}
          <PotWidgetDrawing percentage={pct} />

          {/* Names + destination */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <h2 style={{
              fontFamily: SERIF, fontSize: 28, color: 'white',
              margin: 0, lineHeight: 1.2,
            }}>
              <span style={{ fontStyle: 'italic', color: C.gold }}>Destino:</span>{' '}
              <span style={{ fontStyle: 'italic' }}>Maragogi</span>
            </h2>
            <p style={{
              fontFamily: SERIF, fontSize: 16, color: 'rgba(255,255,255,0.5)',
              margin: '4px 0 0', fontStyle: 'italic',
            }}>
              {DEMO.coupleNames}
            </p>
          </div>

          {/* Progress box */}
          <div style={{
            backgroundColor: '#1F1F1F', borderRadius: 16, padding: 16, marginBottom: 16,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontFamily: SANS, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>
                Progresso Guardado
              </span>
              <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: C.gold }}>
                R$ 600,00
              </span>
            </div>
            <div style={{ height: 8, backgroundColor: '#111', borderRadius: 4, overflow: 'hidden', marginBottom: 10 }}>
              <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #967332, #C5A059)', borderRadius: 4 }} />
            </div>
            <div style={{ fontFamily: SANS, fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>
              Meta: R$ 2.500,00 • {pct}% concluído
            </div>
          </div>

          {/* Slogan */}
          <p style={{
            fontFamily: SERIF, fontSize: 14, fontStyle: 'italic',
            color: 'rgba(255,255,255,0.4)', textAlign: 'center', margin: 0,
          }}>
            "Nosso próximo capítulo já começou."
          </p>
        </div>
      </div>
    </div>
  );
};

// =====================================================
// Pot Visualization — field-faithful SVG pot
// =====================================================
interface PotVisualizationProps {
  fillPercent: number;
  totalSaved: number;
  goalAmount: number;
}
const PotVisualization: React.FC<PotVisualizationProps> = ({ fillPercent, totalSaved, goalAmount }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const floatOffset = Math.sin(frame / (fps * 0.8) * Math.PI * 2) * 6;

  return (
    <div style={{
      position: 'relative',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center',
      transform: `translateY(${floatOffset}px)`,
    }}>
      {/* Pote Sagrado sticker */}
      <div style={{
        position: 'absolute', left: -80, top: 30,
        backgroundColor: '#1A1A1C',
        color: 'white',
        padding: '5px 12px', borderRadius: 99,
        transform: 'rotate(-12deg)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        border: '1px solid rgba(255,255,255,0.08)',
        zIndex: 20,
      }}>
        <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 13, fontWeight: 700, letterSpacing: '0.05em' }}>
          Pote Sagrado
        </span>
      </div>

      {/* SVG Pot */}
      <PotSVG fillPercent={fillPercent} />

      {/* Amount display */}
      <div style={{ textAlign: 'center', marginTop: 4 }}>
        <p style={{
          fontFamily: SERIF, fontSize: 44, lineHeight: 1,
          color: C.primary, margin: 0, fontWeight: 700,
          letterSpacing: '-0.02em',
        }}>
          {formatBRL(totalSaved)}
        </p>
        <div style={{
          display: 'inline-block',
          padding: '4px 12px',
          backgroundColor: `${C.primary}18`,
          borderRadius: 99, marginTop: 8,
        }}>
          <span style={{
            fontFamily: SANS, fontSize: 9, textTransform: 'uppercase',
            letterSpacing: '0.2em', fontWeight: 700, color: `${C.primary}CC`,
          }}>
            de {formatBRL(goalAmount)}
          </span>
        </div>
        <p style={{
          fontFamily: SANS, fontSize: 11, fontWeight: 700,
          color: `${C.text}55`, marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.15em',
        }}>
          {DEMO.destination}
        </p>
        <p style={{
          fontFamily: SANS, fontSize: 10, fontWeight: 700,
          color: C.gold, marginTop: 4,
        }}>
          {fillPercent.toFixed(0)}% da meta ✈️
        </p>
      </div>
    </div>
  );
};

// Faithful SVG pot matching SacredPot.css
const PotSVG: React.FC<{ fillPercent: number }> = ({ fillPercent }) => {
  const fill = Math.min(95, Math.max(0, fillPercent));
  const W = 200;
  const H = 240;

  return (
    <svg width={W} height={H} viewBox="0 0 200 240" overflow="visible">
      <defs>
        <clipPath id="potClipMain">
          <path d="
            M 75 40
            C 75 40, 95 35, 100 35
            C 105 35, 125 40, 125 40
            L 125 65
            C 125 65, 145 75, 150 100
            L 155 170
            C 155 185, 145 195, 130 195
            L 70 195
            C 55 195, 45 185, 45 170
            L 50 100
            C 55 75, 75 65, 75 65
            Z
          " />
        </clipPath>
        <linearGradient id="potFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.gold} />
          <stop offset="100%" stopColor="#8B6914" />
        </linearGradient>
        <linearGradient id="potBody" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D4C5B0" />
          <stop offset="50%" stopColor="#C9B99A" />
          <stop offset="100%" stopColor="#B5A080" />
        </linearGradient>
      </defs>

      {/* Glow */}
      <ellipse cx="100" cy="205" rx="60" ry="12" fill={C.gold} opacity={0.15} />

      {/* Fill liquid */}
      <g clipPath="url(#potClipMain)">
        <rect x="40" y={195 - (fill / 100) * 155} width="120" height={160} fill="url(#potFill)" />
        {/* Wave */}
        <path
          d={`M 40 ${196 - (fill / 100) * 155}
            Q 60 ${193 - (fill / 100) * 155}, 80 ${196 - (fill / 100) * 155}
            Q 100 ${199 - (fill / 100) * 155}, 120 ${196 - (fill / 100) * 155}
            Q 140 ${193 - (fill / 100) * 155}, 160 ${196 - (fill / 100) * 155}
            L 160 210 L 40 210 Z`}
          fill={C.gold}
          opacity={0.8}
        />
      </g>

      {/* Pot body outline */}
      <path
        d="
          M 75 40
          C 75 40, 95 35, 100 35
          C 105 35, 125 40, 125 40
          L 125 65
          C 125 65, 145 75, 150 100
          L 155 170
          C 155 185, 145 195, 130 195
          L 70 195
          C 55 195, 45 185, 45 170
          L 50 100
          C 55 75, 75 65, 75 65
          Z
        "
        fill="url(#potBody)"
        stroke={C.border}
        strokeWidth="2"
      />

      {/* Rim/lid */}
      <rect x="70" y="30" width="60" height="14" rx="7" fill="#D4C5B0" stroke={C.border} strokeWidth="1.5" />

      {/* Shine */}
      <path d="M 75 80 Q 78 120, 80 160" stroke="rgba(255,255,255,0.35)" strokeWidth="4" strokeLinecap="round" fill="none" />

      {/* Plane icon in pot center */}
      <text x="100" y="135" textAnchor="middle" fontSize="28" opacity={0.12} fill={C.primary}>✈</text>
    </svg>
  );
};

// Pot for Share Widget (matching ShareableWidget exactly)
const PotWidgetDrawing: React.FC<{ percentage: number }> = ({ percentage }) => {
  const fillHeight = (percentage / 100) * 80;
  return (
    <div style={{ position: 'relative', width: 128, height: 176, margin: '0 auto 24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ position: 'absolute', width: 112, height: 112, backgroundColor: 'rgba(197,160,89,0.2)', filter: 'blur(30px)', borderRadius: '50%' }} />
      <svg viewBox="0 -10 100 130" width="100%" height="100%" overflow="visible">
        <defs>
          <clipPath id="potClipWidget">
            <path d="M35 25v10C35 45 20 50 20 65v30a10 10 0 0 0 10 10h40a10 10 0 0 0 10-10V65c0-15-15-20-15-30V25Z" />
          </clipPath>
        </defs>
        <g clipPath="url(#potClipWidget)">
          <rect x="0" y={105 - fillHeight} width="100" height={fillHeight + 20} fill={C.gold} />
        </g>
        <path d="M35 15h30" stroke="#FDF6E3" strokeWidth="6" strokeLinecap="round" />
        <path d="M32 25h36" stroke="#FDF6E3" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 4" />
        <path d="M35 25v10C35 45 20 50 20 65v30a10 10 0 0 0 10 10h40a10 10 0 0 0 10-10V65c0-15-15-20-15-30V25Z" fill="none" stroke="#FDF6E3" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
        <path d="M45 40v30" stroke="#fff" strokeWidth="4" strokeOpacity="0.7" strokeLinecap="round" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'translateY(24px)' }}>
        <span style={{ fontFamily: SERIF, fontSize: 40, fontWeight: 700, color: 'white', textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}>
          {percentage}%
        </span>
      </div>
    </div>
  );
};

// =====================================================
// Bottom Nav — fiel ao BottomNav.tsx do app
// =====================================================
const NAV_ITEMS = [
  { id: 'home',      icon: '🏠', label: 'Home' },
  { id: 'missoes',   icon: '🏆', label: 'Missões' },
  { id: 'lovecards', icon: '💕', label: 'Cartas' },
  { id: 'mural',     icon: '📌', label: 'Mural' },
  { id: 'config',    icon: '⚙️', label: 'Config' },
];

const BottomNavBar: React.FC<{ active: string }> = ({ active }) => (
  <div style={{
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 80,
    backgroundColor: `${C.bg}F2`,
    backdropFilter: 'blur(12px)',
    borderTop: `1px solid ${C.border}`,
    display: 'flex', alignItems: 'center', justifyContent: 'space-around',
    padding: '0 8px 8px',
    zIndex: 20,
  }}>
    {NAV_ITEMS.map(item => {
      const isActive = item.id === active;
      return (
        <div key={item.id} style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 3,
          padding: '6px 12px',
          borderRadius: 14,
          backgroundColor: isActive ? `${C.primary}18` : 'transparent',
        }}>
          <span style={{ fontSize: 18, opacity: isActive ? 1 : 0.4 }}>{item.icon}</span>
          <span style={{
            fontFamily: SANS, fontSize: 8, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.08em',
            color: isActive ? C.primary : `${C.text}66`,
          }}>
            {item.label}
          </span>
        </div>
      );
    })}
  </div>
);

// =====================================================
// Sacred Jar Icon SVG — match SacredJarIcon.tsx
// =====================================================
const PoteIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    {/* Jar body */}
    <path d="M35 28 L35 40 C35 40 18 48 18 65 L18 80 C18 88 25 92 35 92 L65 92 C75 92 82 88 82 80 L82 65 C82 48 65 40 65 40 L65 28 Z" fill={`${color}18`} />
    {/* Rim */}
    <rect x="30" y="20" width="40" height="12" rx="6" fill={`${color}33`} />
    {/* Lid */}
    <path d="M38 20 L62 20" strokeWidth="4" />
    {/* Shine */}
    <path d="M30 55 Q33 70 35 80" strokeWidth="3.5" stroke={`${color}88`} />
    {/* Heart */}
    <path d="M45 60 C45 56, 50 54, 50 58 C50 54, 55 56, 55 60 C55 65, 50 69, 50 69 C50 69, 45 65, 45 60 Z" fill={color} stroke="none" />
  </svg>
);

// =====================================================
// Confetti overlay
// =====================================================
const CONFETTI_DOTS = [
  { x: 0.2, y: 0.3, color: C.gold,    size: 8  },
  { x: 0.5, y: 0.2, color: C.primary, size: 6  },
  { x: 0.8, y: 0.35, color: '#FFD700', size: 10 },
  { x: 0.3, y: 0.5, color: C.gold,    size: 5  },
  { x: 0.7, y: 0.25, color: C.bg,     size: 7  },
  { x: 0.1, y: 0.4, color: '#FFD700', size: 6  },
  { x: 0.9, y: 0.45, color: C.gold,   size: 8  },
  { x: 0.45, y: 0.15, color: C.primary, size: 5 },
];

const ConfettiOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 50 }}>
      {CONFETTI_DOTS.map((dot, i) => {
        const t = (frame + i * 8) % 60;
        const progress = t / 60;
        const yDrop = progress * 200;
        const opacity = interpolate(progress, [0, 0.1, 0.7, 1], [0, 1, 1, 0], { extrapolateRight: 'clamp' });
        const rotate = progress * 360 * (i % 2 === 0 ? 1 : -1);
        return (
          <div key={i} style={{
            position: 'absolute',
            left: dot.x * width - dot.size / 2,
            top: dot.y * height - dot.size / 2 + yDrop,
            width: dot.size,
            height: dot.size,
            borderRadius: 2,
            backgroundColor: dot.color,
            opacity,
            transform: `rotate(${rotate}deg)`,
          }} />
        );
      })}
    </div>
  );
};
