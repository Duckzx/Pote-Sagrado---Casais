import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { SUBTITLES, Subtitle } from '../data/subtitles';
import { COLORS } from '../data/timing';

// Parses [GOLD]text[/GOLD] markup into styled spans
function parseSubtitle(text: string): React.ReactNode[] {
  const parts = text.split(/(\[GOLD\].*?\[\/GOLD\])/g);
  return parts.map((part, i) => {
    const match = part.match(/\[GOLD\](.*?)\[\/GOLD\]/);
    if (match) {
      return (
        <span
          key={i}
          style={{
            color: COLORS.gold,
            fontWeight: 700,
          }}
        >
          {match[1]}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export const SubtitleTrack: React.FC = () => {
  const frame = useCurrentFrame();

  // Find active subtitle
  const active = SUBTITLES.find(s => frame >= s.from && frame <= s.to);

  if (!active) return null;

  const localFrame = frame - active.from;
  const duration = active.to - active.from;

  // Fade in over 8 frames, fade out over 8 frames at end
  const opacity = interpolate(
    localFrame,
    [0, 8, duration - 8, duration],
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  // Subtle slide-up
  const translateY = interpolate(
    localFrame,
    [0, 10],
    [12, 0],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 160,
        left: 40,
        right: 40,
        opacity,
        transform: `translateY(${translateY}px)`,
        zIndex: 100,
        textAlign: 'center',
      }}
    >
      {/* Subtle background for readability */}
      <div
        style={{
          display: 'inline-block',
          padding: '12px 24px',
          borderRadius: 16,
          backgroundColor: 'rgba(26, 26, 26, 0.55)',
          backdropFilter: 'blur(8px)',
          maxWidth: '100%',
        }}
      >
        <p
          style={{
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontSize: 38,
            fontWeight: 400,
            color: '#FFFFFF',
            lineHeight: 1.35,
            margin: 0,
            textShadow: '0 2px 8px rgba(0,0,0,0.4)',
          }}
        >
          {parseSubtitle(active.text)}
        </p>
      </div>
    </div>
  );
};
