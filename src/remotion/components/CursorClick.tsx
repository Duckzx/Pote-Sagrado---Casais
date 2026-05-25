import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

interface ClickPoint {
  frame: number; // frame in which click happens
  x: number;     // absolute x
  y: number;     // absolute y
}

interface CursorTrack {
  points: Array<{ frame: number; x: number; y: number }>;
  clickFrames?: number[];
}

interface CursorClickProps {
  track: CursorTrack;
}

export const CursorClick: React.FC<CursorClickProps> = ({ track }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const { points, clickFrames = [] } = track;

  // Interpolate cursor position
  if (points.length < 2) return null;

  const frames = points.map(p => p.frame);
  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);

  const cursorX = interpolate(frame, frames, xs, { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const cursorY = interpolate(frame, frames, ys, { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Is there a click happening near current frame?
  const activeClick = clickFrames.find(cf => Math.abs(frame - cf) < 15);
  const clickProgress = activeClick !== undefined
    ? interpolate(frame - activeClick, [0, 8, 15], [0, 1, 0], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' })
    : 0;

  const cursorScale = 1 - clickProgress * 0.3;

  // Visibility — show only when within track range
  const visible = frame >= frames[0] && frame <= frames[frames.length - 1];
  if (!visible) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: cursorX - 14,
        top: cursorY - 8,
        zIndex: 200,
        pointerEvents: 'none',
        transform: `scale(${cursorScale})`,
        transition: 'transform 0.05s',
      }}
    >
      {/* Cursor SVG — elegant arrow */}
      <svg width="28" height="34" viewBox="0 0 28 34" fill="none">
        <path
          d="M4 4L4 27L10 21L15 30L19 28L14 19L22 19L4 4Z"
          fill="white"
          stroke="rgba(0,0,0,0.3)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>

      {/* Golden halo on click */}
      {clickProgress > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 40 + clickProgress * 30,
            height: 40 + clickProgress * 30,
            borderRadius: '50%',
            backgroundColor: 'rgba(197, 160, 89, 0.3)',
            border: '2px solid rgba(197, 160, 89, 0.6)',
            opacity: 1 - clickProgress * 0.5,
          }}
        />
      )}
    </div>
  );
};

// =====================================================
// Typing Text — simulates keyboard typing
// =====================================================

interface TypingTextProps {
  text: string;
  startFrame: number;
  charsPerSecond?: number;
  style?: React.CSSProperties;
}

export const TypingText: React.FC<TypingTextProps> = ({
  text,
  startFrame,
  charsPerSecond = 8,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const elapsed = Math.max(0, frame - startFrame);
  const charsVisible = Math.min(text.length, Math.floor(elapsed * (charsPerSecond / fps)));
  const displayed = text.slice(0, charsVisible);
  const showCursor = charsVisible < text.length;

  return (
    <span style={style}>
      {displayed}
      {showCursor && (
        <span
          style={{
            opacity: Math.floor(elapsed / 8) % 2 === 0 ? 1 : 0,
            borderRight: '2px solid currentColor',
            marginLeft: 1,
          }}
        />
      )}
    </span>
  );
};
