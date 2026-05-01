import React, { useState, useEffect, useCallback, useRef } from "react";
import { X, Trophy, Heart, Map, Sparkles, Coins, Flame, Play, ArrowLeft, Plane } from "lucide-react";
import { Player, PlayerRef } from "@remotion/player";
import { WrappedRemotionVideo, WrappedData } from "./WrappedVideo";

interface WrappedModalProps {
  onClose: () => void;
  deposits: any[];
  goalAmount: number;
  totalSaved: number;
}

export const WrappedModal: React.FC<WrappedModalProps> = ({
  onClose,
  deposits = [],
  goalAmount,
  totalSaved,
}) => {
  const [slide, setSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const [mode, setMode] = useState<"story" | "video">("story");
  const playerRef = useRef<PlayerRef>(null);

  /* Statistics Calculation */ 
  const progress = goalAmount > 0 ? Math.min(100, (totalSaved / goalAmount) * 100) : 0;
  const savingsDeposits = deposits.filter((d) => d.type !== "expense");
  const numDeposits = savingsDeposits.length;
  
  let user1 = "";
  let user2 = "";
  let user1Total = 0;
  let user2Total = 0;
  
  savingsDeposits.forEach((d) => {
    if (!user1) {
      user1 = d.whoName;
      user1Total += d.amount;
    } else if (d.whoName === user1) {
      user1Total += d.amount;
    } else {
      user2 = d.whoName;
      user2Total += d.amount;
    }
  });
  
  const topSaver = user1Total > user2Total ? user1 : user2Total > user1Total ? user2 : "Vocês dois";
  const bestAmount = Math.max(user1Total, user2Total);
  
  let biggestSave = 0;
  let biggestSaver = "";
  
  savingsDeposits.forEach((d) => {
    if (d.amount > biggestSave) {
      biggestSave = d.amount;
      biggestSaver = d.whoName;
    }
  });

  const wrappedData: WrappedData = {
    numDeposits,
    topSaver,
    bestAmount,
    biggestSave,
    biggestSaver,
    progress
  };

  const totalSteps = 5;
  const slideDuration = 5000;
  
  const nextSlide = useCallback(() => {
    setSlide((s) => {
      if (s < totalSteps - 1) return s + 1;
      return s;
    });
    setProgressKey((k) => k + 1);
  }, []);
  
  const prevSlide = useCallback(() => {
    setSlide((s) => Math.max(0, s - 1));
    setProgressKey((k) => k + 1);
  }, []);
  
  useEffect(() => {
    if (mode === "video") return;
    if (isPaused) return;
    if (slide >= totalSteps - 1) return;
    const timer = setTimeout(() => {
      nextSlide();
    }, slideDuration);
    return () => clearTimeout(timer);
  }, [slide, isPaused, nextSlide, progressKey, mode]);

  /* Handle tap for navigating stories */ 
  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mode === "video") return;
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width * 0.3) {
      prevSlide();
    } else {
      nextSlide();
    }
  };

  const renderContent = () => {
    switch (slide) {
      case 0:
        return (
          <div
            className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-slide-up-fade"
            key={`slide-0-${progressKey}`}
          >
            <div className="w-24 h-24 bg-cookbook-gold/20 rounded-full flex items-center justify-center">
              <Sparkles size={40} className="text-cookbook-gold" />
            </div>
            <div className="px-4">
              <h2 className="font-serif italic text-4xl text-white mb-2 leading-tight">
                Nosso <br /> Pote Sagrado <br />
                <span className="text-cookbook-gold">Wrapped</span>
              </h2>
              <p className="font-sans text-[10px] uppercase tracking-widest text-white/70 mt-4">
                A jornada do casal
              </p>
            </div>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setMode("video");
              }}
              className="mt-8 bg-cookbook-gold text-white font-sans text-xs uppercase tracking-widest py-3 px-6 rounded-full font-bold shadow-lg flex items-center gap-2 animate-pulse active:scale-95 transition-transform"
            >
              <Play size={16} className="fill-white" />
              <span>Vídeo Remotion</span>
            </button>
          </div>
        );
      case 1:
        return (
          <div
            className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-slide-up-fade"
            key={`slide-1-${progressKey}`}
          >
            <div className="w-20 h-20 bg-cookbook-bg/10 rounded-full flex items-center justify-center">
              <Flame size={36} className="text-[#E07A5F]" />
            </div>
            <div className="px-6">
              <h2 className="font-sans text-[12px] uppercase tracking-widest text-[#E07A5F] font-bold mb-4">
                Constância
              </h2>
              <p className="font-serif italic text-5xl text-white mb-4">
                {numDeposits}
                <span className="text-3xl text-white/60">vezes</span>
              </p>
              <p className="font-sans text-xs text-white/80 leading-relaxed">
                Vocês investiram no sonho! Cada depósito foi um passo para transformar rotina em passagem.
              </p>
            </div>
          </div>
        );
      case 2:
        return (
          <div
            className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-slide-up-fade"
            key={`slide-2-${progressKey}`}
          >
            <div className="w-20 h-20 bg-cookbook-bg/10 rounded-full flex items-center justify-center">
              <Trophy size={36} className="text-cookbook-gold" />
            </div>
            <div className="px-6">
              <h2 className="font-sans text-[12px] uppercase tracking-widest text-cookbook-gold font-bold mb-4">
                Investidor Mestre
              </h2>
              <p className="font-serif italic text-4xl text-white mb-4">
                {topSaver}
              </p>
              <p className="font-sans text-xs text-white/80 text-balance leading-relaxed">
                {user1Total === user2Total || !user1 || !user2
                  ? "A união de vocês é perfeita! Estão guardando juntos com o mesmo peso."
                  : `Carregou o pote somando ${Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(bestAmount)}. Que orgulho!`}
              </p>
            </div>
          </div>
        );
      case 3:
        return (
          <div
            className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-slide-up-fade"
            key={`slide-3-${progressKey}`}
          >
            <div className="w-20 h-20 bg-cookbook-bg/10 rounded-full flex items-center justify-center">
              <Coins size={36} className="text-[#8E7F6D]" />
            </div>
            <div className="px-6">
              <h2 className="font-sans text-[12px] uppercase tracking-widest text-[#8E7F6D] font-bold mb-4">
                Maior Aporte
              </h2>
              <p className="font-serif text-4xl text-white mb-2">
                {Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(biggestSave)}
              </p>
              <p className="font-sans text-[10px] uppercase tracking-widest text-cookbook-gold font-bold mb-6">
                por {biggestSaver}
              </p>
              <p className="font-sans text-xs text-white/80 text-balance leading-relaxed">
                Aquele depósito de respeito que deu um salto absurdo no Pote Sagrado.
              </p>
            </div>
          </div>
        );
      case 4:
        return (
          <div
            className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-slide-up-fade relative"
            key={`slide-4-${progressKey}`}
          >
            <div className="relative w-full aspect-square max-w-[280px] mx-auto -mt-8 flex items-center justify-center">
              {/* Background Glow */}
              <div className="absolute inset-0 bg-cookbook-gold/10 rounded-full blur-3xl animate-pulse" />
              
              <svg width="240" height="240" viewBox="0 0 240 240" className="relative z-10 pointer-events-none">
                 <path d="M 30 200 Q 120 40 210 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" strokeDasharray="6 6" />
                 <path d="M 30 200 Q 120 40 210 40" fill="none" stroke="#C5A059" strokeWidth="4" strokeDasharray="6 6" className="animate-[dash_3s_ease-out_forwards]" strokeDashoffset="300" />
                 <style dangerouslySetInnerHTML={{__html: `
                    @keyframes dash {
                      to { stroke-dashoffset: 0; }
                    }
                    @keyframes fly {
                      0% { transform: translate(30px, 200px) rotate(45deg); opacity: 0; }
                      100% { transform: translate(210px, 40px) rotate(45deg); opacity: 1; }
                    }
                 `}} />
              </svg>

              <div className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ animation: "fly 3s ease-out forwards" }}>
                 <div className="absolute top-0 left-0 -ml-6 -mt-6">
                    <Plane size={48} className="text-cookbook-gold drop-shadow-lg" fill="#C5A059" />
                 </div>
              </div>
            </div>
            <div className="px-6 -mt-12 relative z-20">
              <h2 className="font-sans text-[12px] uppercase tracking-widest text-cookbook-gold font-bold mb-4">
                A Caminho do Sonho
              </h2>
              <p className="font-serif text-5xl text-white mb-2 font-medium drop-shadow-md">
                {progress.toFixed(0)}%
              </p>
              <p className="font-sans text-xs text-white/80 max-w-[250px] mx-auto text-balance leading-relaxed">
                A meta está cada vez mais perto. Continuem assim!
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="mt-6 bg-white/20 hover:bg-cookbook-border/30 backdrop-blur-md text-white font-sans text-[10px] uppercase tracking-widest py-3 px-8 rounded-full transition-all active:scale-95 border border-white/30 z-30 relative"
            >
              Voltaremos mais fortes
            </button>
          </div>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#1A1A1A] animate-modal-backdrop"
      onClick={onClose}
    >
      <div
        className="absolute inset-0 opacity-40 transition-colors duration-1000"
        style={{
          background: mode === "video" 
            ? "#000" 
            : slide === 0
              ? "radial-gradient(circle at center, #C5A059 0%, #1A1A1A 70%)"
              : slide === 1
                ? "radial-gradient(circle at center, #E07A5F 0%, #1A1A1A 70%)"
                : slide === 2
                  ? "radial-gradient(circle at center, #C5A059 0%, #1A1A1A 70%)"
                  : slide === 3
                    ? "radial-gradient(circle at center, #8E7F6D 0%, #1A1A1A 70%)"
                    : "radial-gradient(circle at center, #C5A059 0%, #1A1A1A 70%)",
        }}
      />
      
      <div
        className="w-full max-w-[400px] h-[90vh] max-h-[850px] relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl"
        onClick={handleTap}
        onPointerDown={() => setIsPaused(true)}
        onPointerUp={() => setIsPaused(false)}
        onPointerLeave={() => setIsPaused(false)}
        style={{
          background: mode === "video" ? "#1A1A1A" : "linear-gradient(to bottom, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)",
          backdropFilter: mode === "video" ? "none" : "blur(20px)",
          touchAction: "none",
        }}
      >
        {mode === "story" ? (
          <>
            <div className="absolute top-4 left-0 w-full px-4 flex gap-1 z-20">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm"
                >
                  <div
                    className={`h-full bg-white`}
                    style={{
                      width:
                        slide > i
                          ? "100%"
                          : slide === i
                            ? isPaused
                              ? "auto"
                              : "100%"
                            : "0%",
                      transition:
                        slide === i && !isPaused
                          ? `width ${slideDuration}ms linear`
                          : "none",
                    }}
                  />
                </div>
              ))}
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="absolute top-8 right-4 text-white/60 hover:text-white z-30 p-2 rounded-full backdrop-blur-md bg-black/20"
            >
              <X size={18} />
            </button>
            <div className="absolute inset-0 pt-16 flex flex-col justify-between">
              <div className="flex-1 flex flex-col justify-center select-none">
                {renderContent()}
              </div>
              <div className="h-32 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col bg-[#1a1a1a]">
            {/* The Video Mode */ }
            <div className="absolute top-4 left-4 z-30 flex items-center justify-between w-[calc(100%-2rem)]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMode("story");
                }}
                className="text-white/60 hover:text-white p-2 rounded-full backdrop-blur-md bg-black/40"
              >
                <ArrowLeft size={18} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="text-white/60 hover:text-white p-2 rounded-full backdrop-blur-md bg-black/40"
              >
                <X size={18} />
              </button>
            </div>
            
            <Player
              ref={playerRef}
              component={WrappedRemotionVideo}
              inputProps={wrappedData}
              durationInFrames={540} // 90 + 90 + 90 + 90 + 180
              compositionWidth={400}
              compositionHeight={800}
              fps={30}
              style={{ width: "100%", height: "100%" }}
              autoPlay
              controls
              loop={false}
            />
          </div>
        )}
      </div>
    </div>
  );
};
