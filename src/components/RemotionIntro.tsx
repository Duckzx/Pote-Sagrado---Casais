import React, { useState, useEffect } from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { Player } from "@remotion/player";
import { MousePointer2, Plus, Sparkles, Plane, ShieldCheck, Heart } from "lucide-react";

// --- Scene 1: Welcome ---
const WelcomeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = interpolate(frame, [0, 15, 75, 90], [0, 1, 1, 0], {
    extrapolateRight: "clamp",
  });
  const scale = spring({ fps, frame, config: { damping: 12 } });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        opacity,
      }}
    >
      <div style={{ transform: `scale(${scale})`, textAlign: "center" }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', gap: '8px' }}>
            <Plane size={48} color="#C5A059" />
            <Heart size={48} color="#E07A5F" />
        </div>
        <h1 style={{ fontFamily: "serif", fontSize: "42px", color: "white", marginBottom: "8px" }}>
          Bem-vindo ao<br />
          <span style={{ color: "#C5A059" }}>Pote Sagrado</span>
        </h1>
        <p
          style={{
            fontFamily: "sans-serif",
            fontSize: "14px",
            textTransform: "uppercase",
            letterSpacing: "4px",
            color: "rgba(255,255,255,0.7)",
          }}
        >
          Sua jornada começa aqui
        </p>
      </div>
    </AbsoluteFill>
  );
};

// --- Scene 2: Interactive Walkthrough (Figma Style) ---
const WalkthroughScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // App UI Animations
  const progress = spring({ fps, frame: frame - 100, from: 5, to: 35, config: { damping: 14 } });
  
  // Modal Animations
  const showModal = frame > 60 && frame < 130;
  const modalScale = spring({ fps, frame: frame - 60, from: 0, to: 1, config: { damping: 14 } });
  const hideModalProgress = frame > 120 ? spring({ fps, frame: frame - 120, from: 0, to: 1 }) : 0;
  
  // Cursor Animations
  const cursorX = interpolate(frame, [20, 50, 80, 110, 140, 170], [300, 290, 200, 200, 200, 150], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const cursorY = interpolate(frame, [20, 50, 80, 110, 140, 170], [700, 650, 650, 480, 480, 750], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  
  const isClickingBtn = frame > 50 && frame < 60;
  const isClickingConfirm = frame > 110 && frame < 120;
  const cursorScale = isClickingBtn || isClickingConfirm ? 0.8 : 1;

  // Add button pulse
  const btnScale = isClickingBtn ? 0.9 : 1;
  const confirmBtnScale = isClickingConfirm ? 0.95 : 1;

  const opacity = interpolate(frame, [180, 195], [1, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0f0f0f", alignItems: "center", justifyContent: "center", opacity }}>
      {/* Mock Mobile Device */}
      <div style={{ width: "340px", height: "700px", border: "8px solid #222", borderRadius: "40px", backgroundColor: "#1A1A1A", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        
        {/* Mock Header */}
        <div style={{ padding: "32px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontFamily: "serif", color: "white", fontSize: "20px", margin: 0 }}>Pote Sagrado</h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", margin: 0 }}>O sonho de Paris</p>
          </div>
          <div style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)' }} />
        </div>

        {/* Mock Progress */}
        <div style={{ padding: "24px" }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'white', fontSize: 12 }}>Progresso</span>
              <span style={{ color: '#C5A059', fontSize: 12, fontWeight: 'bold' }}>{Math.round(progress)}%</span>
           </div>
           <div style={{ height: "16px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progress}%`, backgroundColor: "#C5A059" }} />
           </div>
        </div>

        {/* Mock Content area */}
        <div style={{ flex: 1, padding: "0 24px" }}>
            <div style={{ height: 80, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, marginBottom: 16 }} />
            <div style={{ height: 80, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16 }} />
        </div>

        {/* Mock Bottom Nav & FAB */}
        <div style={{ height: "80px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-around", alignItems: "center" }}>
            <div style={{ width: 24, height: 24, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4 }} />
            <div style={{ width: 24, height: 24, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4 }} />
            <div style={{ width: 24, height: 24, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4 }} />
        </div>

        <div style={{ position: "absolute", bottom: "100px", right: "24px", width: "56px", height: "56px", borderRadius: "28px", backgroundColor: "#C5A059", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${btnScale})`, transition: 'transform 0.1s' }}>
          <Plus size={24} color="white" />
        </div>

        {/* Modal Overlay */}
        {showModal && (
          <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 1 - hideModalProgress }}>
             <div style={{ width: "85%", padding: "24px", backgroundColor: "#222", borderRadius: "24px", transform: `scale(${modalScale})` }}>
                <h3 style={{ color: "white", fontFamily: "serif", fontSize: "18px", marginBottom: "16px", textAlign: 'center' }}>Adicionar Valor</h3>
                <div style={{ height: "40px", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "12px", marginBottom: "16px", display: 'flex', alignItems: 'center', padding: '0 16px' }}>
                    <span style={{ color: 'white' }}>R$ 150,00</span>
                </div>
                <div style={{ height: "40px", backgroundColor: "#C5A059", borderRadius: "12px", display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${confirmBtnScale})` }}>
                    <span style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>Depositar</span>
                </div>
             </div>
          </div>
        )}

      </div>

      {/* The Fake Cursor */}
      <div style={{ position: "absolute", left: cursorX, top: cursorY, transform: `scale(${cursorScale})`, transition: "transform 0.1s", zIndex: 100 }}>
        <MousePointer2 size={32} color="white" fill="rgba(255,255,255,0.2)" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' }} />
      </div>

    </AbsoluteFill>
  );
};

// --- Scene 3: Final Call to Action ---
const FinalScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const scale = spring({ fps, frame, config: { damping: 12 } });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", backgroundColor: "#1A1A1A", opacity }}>
       <div style={{ transform: `scale(${scale})`, textAlign: "center" }}>
          <div style={{ display: 'inline-flex', padding: '16px', backgroundColor: 'rgba(197, 160, 89, 0.1)', borderRadius: '50%', marginBottom: '24px' }}>
             <ShieldCheck size={64} color="#C5A059" />
          </div>
          <h2 style={{ fontFamily: "serif", fontSize: "36px", color: "white", marginBottom: "16px" }}>
            Tudo pronto!
          </h2>
          <p style={{ fontFamily: "sans-serif", fontSize: "16px", color: "rgba(255,255,255,0.7)", maxWidth: '80%', margin: '0 auto' }}>
            Comece a registrar seus depósitos, cumpra missões e acompanhe a evolução do seu sonho.
          </p>
       </div>
    </AbsoluteFill>
  )
}

// Main Composition
const AppWalkthroughVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#1A1A1A" }}>
      <Sequence from={0} durationInFrames={90}>
        <WelcomeScene />
      </Sequence>
      <Sequence from={90} durationInFrames={200}>
        <WalkthroughScene />
      </Sequence>
      <Sequence from={290} durationInFrames={110}>
        <FinalScene />
      </Sequence>
    </AbsoluteFill>
  );
};

// Player wrapper that can be rendered in the app
export const RemotionIntro: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    // If user clicks skip or video finishes
    if (isDone) {
      setTimeout(() => onComplete(), 500); // slight delay for fade out
    }
  }, [isDone, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[200] bg-[#1A1A1A] flex items-center justify-center transition-opacity duration-500 ${
        isDone ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="absolute inset-0 max-w-md mx-auto w-full h-full flex flex-col">
        <div className="flex-1 w-full relative">
            <Player
                component={AppWalkthroughVideo}
                durationInFrames={400}
                compositionWidth={400}
                compositionHeight={800}
                fps={30}
                style={{ width: "100%", height: "100%" }}
                autoPlay
                className="pointer-events-none" 
            />
        </div>
        
        {/* Overlay controls */}
        <div className="absolute bottom-10 left-0 w-full px-8 flex flex-col gap-4">
           {/* Auto-progress listener */}
           <div className="hidden">
              <Player
                component={() => {
                   const frame = useCurrentFrame();
                   if (frame >= 390 && !isDone) {
                      setIsDone(true);
                   }
                   return null;
                }}
                durationInFrames={400}
                compositionWidth={10}
                compositionHeight={10}
                fps={30}
                autoPlay
              />
           </div>
           
           <button
             onClick={() => setIsDone(true)}
             className="w-full bg-cookbook-gold text-white font-sans text-xs uppercase tracking-widest py-4 rounded-full font-bold shadow-lg active:scale-95 transition-transform text-center z-10"
           >
             Começar a Usar
           </button>
           <button
             onClick={() => setIsDone(true)}
             className="w-full text-white/50 hover:text-white font-sans text-[10px] uppercase tracking-widest py-2 active:scale-95 transition-all text-center z-10"
           >
             Pular Intro
           </button>
        </div>
      </div>
    </div>
  );
};
