/**
 * Root.tsx — Remotion Root Component
 * Registra todas as composições do projeto.
 */

import React from 'react';
import { Composition } from 'remotion';
import {
  PoteSagradoCommercial,
  COMMERCIAL_FPS,
  COMMERCIAL_WIDTH,
  COMMERCIAL_HEIGHT,
  COMMERCIAL_FRAMES,
} from './PoteSagradoCommercial';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* ── Comercial Principal: 9:16 vertical (1080x1920 | 30fps | 46s) ── */}
      <Composition
        id="PoteSagradoCommercial"
        component={PoteSagradoCommercial}
        durationInFrames={COMMERCIAL_FRAMES}
        fps={COMMERCIAL_FPS}
        width={COMMERCIAL_WIDTH}
        height={COMMERCIAL_HEIGHT}
        defaultProps={{}}
      />

      {/* ── Versão preview reduzida para desenvolvimento ── */}
      <Composition
        id="PoteSagradoPreview"
        component={PoteSagradoCommercial}
        durationInFrames={COMMERCIAL_FRAMES}
        fps={COMMERCIAL_FPS}
        width={540}
        height={960}
        defaultProps={{}}
      />
    </>
  );
};
