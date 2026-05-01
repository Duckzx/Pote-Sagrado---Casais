import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, spring, interpolate, Img } from 'remotion';
import { ThreeDScene } from './RemotionIntro';

export interface WrappedData {
  numDeposits: number;
  topSaver: string;
  bestAmount: number;
  biggestSave: number;
  biggestSaver: string;
  progress: number;
}

const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = interpolate(frame, [0, 15, 75, 90], [0, 1, 1, 0], { extrapolateRight: 'clamp' });
  const scale = spring({ fps, frame, config: { damping: 12 } });

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A1A1A', opacity }}>
      <div style={{ transform: `scale(${scale})`, textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'serif', fontStyle: 'italic', fontSize: '48px', color: 'white', marginBottom: '8px' }}>
          Nosso <br /> Pote Sagrado <br /> 
          <span style={{ color: '#C5A059' }}>Wrapped</span>
        </h2>
        <p style={{ fontFamily: 'sans-serif', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '4px', color: 'rgba(255,255,255,0.7)', marginTop: '16px' }}>
          A jornada do casal
        </p>
      </div>
    </AbsoluteFill>
  );
};

const ConstancyScene: React.FC<{ numDeposits: number }> = ({ numDeposits }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = interpolate(frame, [0, 15, 75, 90], [0, 1, 1, 0], { extrapolateRight: 'clamp' });
  const yOffset = interpolate(frame, [0, 20], [50, 0], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
  
  const formattedNum = Math.round(interpolate(frame, [10, 40], [0, numDeposits], { extrapolateRight: 'clamp' }));

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#8E4835', opacity }}>
      <div style={{ transform: `translateY(${yOffset}px)`, textAlign: 'center', padding: '0 32px' }}>
        <h2 style={{ fontFamily: 'sans-serif', fontSize: '16px', textTransform: 'uppercase', letterSpacing: '4px', color: '#ffbfae', fontWeight: 'bold', marginBottom: '16px' }}>
          Constância
        </h2>
        <p style={{ fontFamily: 'serif', fontStyle: 'italic', fontSize: '64px', color: 'white', marginBottom: '16px' }}>
          {formattedNum} <span style={{ fontSize: '36px', color: 'rgba(255,255,255,0.6)' }}>vezes</span>
        </p>
        <p style={{ fontFamily: 'sans-serif', fontSize: '16px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.5' }}>
          Vocês investiram no sonho! Cada depósito foi um passo para transformar rotina em viagem.
        </p>
      </div>
    </AbsoluteFill>
  );
};

const MasterSaverScene: React.FC<{ topSaver: string; bestAmount: number }> = ({ topSaver, bestAmount }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 15, 75, 90], [0, 1, 1, 0], { extrapolateRight: 'clamp' });
  const scale = interpolate(frame, [0, 90], [0.9, 1.1]);

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A2A22', opacity }}>
      <div style={{ transform: `scale(${scale})`, textAlign: 'center', padding: '0 32px' }}>
        <h2 style={{ fontFamily: 'sans-serif', fontSize: '16px', textTransform: 'uppercase', letterSpacing: '4px', color: '#4ADE80', fontWeight: 'bold', marginBottom: '16px' }}>
          Investidor Mestre
        </h2>
        <p style={{ fontFamily: 'serif', fontStyle: 'italic', fontSize: '56px', color: 'white', marginBottom: '16px' }}>
          {topSaver}
        </p>
        <p style={{ fontFamily: 'sans-serif', fontSize: '16px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.5' }}>
          Carregou o pote somando {Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(bestAmount)}. Que orgulho!
        </p>
      </div>
    </AbsoluteFill>
  );
};

const BiggestSaveScene: React.FC<{ biggestSave: number; biggestSaver: string }> = ({ biggestSave, biggestSaver }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = interpolate(frame, [0, 15, 75, 90], [0, 1, 1, 0], { extrapolateRight: 'clamp' });
  
  const amount = interpolate(frame, [10, 40], [0, biggestSave], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#2D2013', opacity }}>
      <div style={{ textAlign: 'center', padding: '0 32px' }}>
        <h2 style={{ fontFamily: 'sans-serif', fontSize: '16px', textTransform: 'uppercase', letterSpacing: '4px', color: '#C5A059', fontWeight: 'bold', marginBottom: '16px' }}>
          Maior Aporte
        </h2>
        <p style={{ fontFamily: 'serif', fontSize: '48px', color: 'white', marginBottom: '8px' }}>
          {Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount)}
        </p>
        <p style={{ fontFamily: 'sans-serif', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '4px', color: '#C5A059', fontWeight: 'bold', marginBottom: '24px' }}>
          por {biggestSaver}
        </p>
        <p style={{ fontFamily: 'sans-serif', fontSize: '16px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.5' }}>
          Aquele depósito de respeito que deu um salto absurdo no nosso Pote.
        </p>
      </div>
    </AbsoluteFill>
  );
};

const FinaleScene: React.FC<{ progress: number }> = ({ progress }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = interpolate(frame, [0, 15, 165, 180], [0, 1, 1, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: '#1A1A1A', opacity }}>
      <ThreeDScene fillPercentage={progress / 100} />
      <div style={{ 
        position: 'absolute', bottom: '40px', width: '100%', textAlign: 'center',
        opacity: interpolate(frame, [50, 80], [0, 1], { extrapolateRight: 'clamp' })
      }}>
        <h2 style={{ fontFamily: 'sans-serif', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '4px', color: '#C5A059', fontWeight: 'bold', marginBottom: '8px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
          A Caminho do Sonho
        </h2>
        <p style={{ fontFamily: 'serif', fontSize: '64px', color: 'white', textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
          {progress.toFixed(0)}%
        </p>
      </div>
    </AbsoluteFill>
  );
};

export const WrappedRemotionVideo: React.FC<WrappedData> = (props) => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#1A1A1A' }}>
      <Sequence from={0} durationInFrames={90}>
        <TitleScene />
      </Sequence>
      <Sequence from={90} durationInFrames={90}>
        <ConstancyScene numDeposits={props.numDeposits} />
      </Sequence>
      <Sequence from={180} durationInFrames={90}>
        <MasterSaverScene topSaver={props.topSaver} bestAmount={props.bestAmount} />
      </Sequence>
      <Sequence from={270} durationInFrames={90}>
        <BiggestSaveScene biggestSave={props.biggestSave} biggestSaver={props.biggestSaver} />
      </Sequence>
      <Sequence from={360} durationInFrames={180}>
        <FinaleScene progress={props.progress} />
      </Sequence>
    </AbsoluteFill>
  );
};
