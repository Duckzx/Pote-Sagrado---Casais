/**
 * PoteSagradoCommercial.tsx
 * =====================================================
 * Composição principal do comercial Pote Sagrado
 *
 * Formato: 1080x1920 (9:16 vertical) | 30fps | 46s
 * Para: Instagram Reels, TikTok, YouTube Shorts
 *
 * Estrutura de cenas:
 *  01 OpeningScene    0s–4s     (frames 0–120)
 *  02 LoginScene      4s–8s     (frames 120–240)
 *  03 PotScene        8s–15s    (frames 240–450)
 *  04 MissionsScene   15s–21s   (frames 450–630)
 *  05 LoveCardsScene  21s–30s   (frames 630–900)
 *  06 ShareScene      30s–36s   (frames 900–1080)
 *  07 MontageScene    36s–42s   (frames 1080–1260)
 *  08 ClosingScene    42s–46s   (frames 1260–1380)
 * =====================================================
 */

import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  interpolate,
  Audio,
} from 'remotion';

import { OpeningScene }   from './scenes/OpeningScene';
import { LoginScene }     from './scenes/LoginScene';
import { PotScene }       from './scenes/PotScene';
import { MissionsScene }  from './scenes/MissionsScene';
import { LoveCardsScene } from './scenes/LoveCardsScene';
import { ShareScene }     from './scenes/ShareScene';
import { MontageScene }   from './scenes/MontageScene';
import { ClosingScene }   from './scenes/ClosingScene';
import { SubtitleTrack }  from './components/SubtitleTrack';
import { SCENES, TOTAL_FRAMES } from './data/timing';

// =====================================================
// Global fonts — injected once for all scenes
// =====================================================
const GlobalFonts: React.FC = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600&family=Inter:wght@300;400;500;600;700&display=swap');
    * { box-sizing: border-box; }
  `}</style>
);

// =====================================================
// Cinematic letterbox overlay (top + bottom bars)
// =====================================================
const Letterbox: React.FC = () => (
  <>
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0,
      height: 60,
      background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 100%)',
      zIndex: 90,
      pointerEvents: 'none',
    }} />
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      height: 80,
      background: 'linear-gradient(0deg, rgba(0,0,0,0.25) 0%, transparent 100%)',
      zIndex: 90,
      pointerEvents: 'none',
    }} />
  </>
);

// =====================================================
// Main Commercial Composition
// =====================================================
export const PoteSagradoCommercial: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: '#0D0C0B', fontFamily: '"Inter", sans-serif' }}>
      <GlobalFonts />

      {/* ── Cena 01: Abertura ── */}
      <Sequence from={SCENES.OPENING.from} durationInFrames={SCENES.OPENING.duration}>
        <OpeningScene />
      </Sequence>

      {/* ── Cena 02: Login ── */}
      <Sequence from={SCENES.LOGIN.from} durationInFrames={SCENES.LOGIN.duration}>
        <LoginScene />
      </Sequence>

      {/* ── Cena 03: Pote + Depósito ── */}
      <Sequence from={SCENES.POT.from} durationInFrames={SCENES.POT.duration}>
        <PotScene />
      </Sequence>

      {/* ── Cena 04: Missões ── */}
      <Sequence from={SCENES.MISSIONS.from} durationInFrames={SCENES.MISSIONS.duration}>
        <MissionsScene />
      </Sequence>

      {/* ── Cena 05: LoveCards ── */}
      <Sequence from={SCENES.LOVECARDS.from} durationInFrames={SCENES.LOVECARDS.duration}>
        <LoveCardsScene />
      </Sequence>

      {/* ── Cena 06: Compartilhamento ── */}
      <Sequence from={SCENES.SHARE.from} durationInFrames={SCENES.SHARE.duration}>
        <ShareScene />
      </Sequence>

      {/* ── Cena 07: Montagem de marca ── */}
      <Sequence from={SCENES.MONTAGE.from} durationInFrames={SCENES.MONTAGE.duration}>
        <MontageScene />
      </Sequence>

      {/* ── Cena 08: Encerramento ── */}
      <Sequence from={SCENES.CLOSING.from} durationInFrames={SCENES.CLOSING.duration}>
        <ClosingScene />
      </Sequence>

      {/* ── Legendas globais (sempre no topo) ── */}
      <SubtitleTrack />

      {/* ── Letterbox cinematográfico ── */}
      <Letterbox />
    </AbsoluteFill>
  );
};

// =====================================================
// Exported constants (used by Root.tsx)
// =====================================================
export const COMMERCIAL_FPS    = 30;
export const COMMERCIAL_WIDTH  = 1080;
export const COMMERCIAL_HEIGHT = 1920;
export const COMMERCIAL_FRAMES = TOTAL_FRAMES;
