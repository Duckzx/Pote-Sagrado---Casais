import React, { useState, useEffect, useCallback, useRef } from "react";
import { X, Trophy, Heart, Sparkles, Coins, Flame, ArrowRight, Share2, Download } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toPng } from "html-to-image";

import { useAppStore } from "../store/useAppStore";

interface WrappedModalProps {
  onClose: () => void;
}

export const WrappedModal: React.FC<WrappedModalProps> = ({
  onClose,
}) => {

  const deposits = useAppStore(s => s.deposits);
  const tripConfig = useAppStore(s => s.tripConfig);
  const { goalAmount = 0, destination = "" } = tripConfig;
  const totalSaved = deposits
    .filter((d) => d.type !== "expense")
    .reduce((acc, d) => acc + (d.amount || 0), 0);
  const [slide, setSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const storyRef = useRef<HTMLDivElement>(null);

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

  const totalSteps = 5;
  const slideDuration = 6000;
  
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
    if (isPaused) return;
    if (slide >= totalSteps - 1) return;
    const timer = setTimeout(() => {
      nextSlide();
    }, slideDuration);
    return () => clearTimeout(timer);
  }, [slide, isPaused, nextSlide, progressKey]);

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width * 0.3) {
      prevSlide();
    } else {
      nextSlide();
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Nosso Sonho ❤️",
          text: `Já guardamos ${Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalSaved)} e estamos ${progress.toFixed(0)}% mais perto de ${destination || "nosso destino"}!`,
          url: window.location.href
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    }
  };

  const handleExportImage = () => {
    if (!storyRef.current) return;
    setIsPaused(true);
    toPng(storyRef.current, { quality: 0.95, cacheBust: true })
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = `pote-wrapped-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
        setIsPaused(false);
      })
      .catch((err) => {
        console.error("Error exporting image", err);
        setIsPaused(false);
      });
  };

  const renderContent = () => {
    switch (slide) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.8 }}
            className="h-full flex flex-col items-center justify-center text-center space-y-8"
            key={`slide-0-${progressKey}`}
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="w-24 h-24 shadow-[0_0_40px_rgba(197,160,89,0.3)] bg-cookbook-gold/20 rounded-full flex items-center justify-center"
            >
              <Sparkles size={40} className="text-cookbook-gold" />
            </motion.div>
            <div className="px-4">
              <motion.h2 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.6 }}
                className="font-serif italic text-4xl text-white mb-2 leading-tight"
              >
                Nosso <br /> Pote Sagrado <br />
                <span className="text-cookbook-gold">Wrapped</span>
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1 }}
                className="font-sans text-[10px] uppercase tracking-widest text-white/70 mt-4"
              >
                A jornada do casal
              </motion.p>
            </div>
          </motion.div>
        );
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="h-full flex flex-col items-center justify-center text-center space-y-6"
            key={`slide-1-${progressKey}`}
          >
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }} 
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-20 h-20 bg-[#E07A5F]/20 rounded-full flex items-center justify-center"
            >
              <Flame size={36} className="text-[#E07A5F]" />
            </motion.div>
            <div className="px-6">
              <h2 className="font-sans text-[12px] uppercase tracking-widest text-[#E07A5F] font-bold mb-4">
                Constância
              </h2>
              <p className="font-serif italic text-6xl text-white mb-4">
                {numDeposits}
                <span className="block text-3xl text-white/60 not-italic font-sans font-light mt-2">vezes</span>
              </p>
              <p className="font-sans text-xs text-white/80 leading-relaxed max-w-[280px] mx-auto">
                Vocês investiram no sonho! Cada depósito foi um passo para transformar a rotina na viagem de vocês.
              </p>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="h-full flex flex-col items-center justify-center text-center space-y-6"
            key={`slide-2-${progressKey}`}
          >
            <div className="relative">
              <motion.div 
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100 }}
                className="w-24 h-24 bg-cookbook-gold/20 rounded-full flex items-center justify-center z-10 relative"
              >
                <Trophy size={42} className="text-cookbook-gold" />
              </motion.div>
              <div className="absolute inset-0 bg-cookbook-gold/30 blur-2xl rounded-full" />
            </div>
            <div className="px-6 relative z-10">
              <h2 className="font-sans text-[12px] uppercase tracking-widest text-cookbook-gold font-bold mb-4">
                Mestre do Pote
              </h2>
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="font-serif italic text-4xl text-white mb-4"
              >
                {topSaver}
              </motion.p>
              <p className="font-sans text-sm text-white/80 text-balance leading-relaxed max-w-[280px] mx-auto">
                {user1Total === user2Total || !user1 || !user2
                  ? "A união de vocês é perfeita! Guardaram juntos equilibrando a balança."
                  : `Carregou o pote com amor, somando ${Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(bestAmount)}. Que orgulho!`}
              </p>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex flex-col items-center justify-center text-center space-y-6"
            key={`slide-3-${progressKey}`}
          >
            <motion.div 
              initial={{ y: -50 }}
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              className="w-20 h-20 bg-cookbook-primary/20 rounded-full flex items-center justify-center"
            >
              <Coins size={36} className="text-white" />
            </motion.div>
            <div className="px-6">
              <h2 className="font-sans text-[12px] uppercase tracking-widest text-white/60 font-bold mb-4">
                Maior Aporte
              </h2>
              <motion.p 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="font-serif text-5xl text-white mb-2"
              >
                {Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(biggestSave)}
              </motion.p>
              <p className="font-sans text-[10px] uppercase tracking-widest text-cookbook-gold font-bold mb-6">
                por {biggestSaver}
              </p>
              <p className="font-sans text-xs text-white/80 text-balance leading-relaxed max-w-[260px] mx-auto">
                Aquele depósito de respeito que deu um salto absurdo no Pote Sagrado.
              </p>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex flex-col items-center justify-center text-center space-y-6 relative"
            key={`slide-4-${progressKey}`}
          >
            <div className="relative w-full aspect-square max-w-[260px] mx-auto -mt-8 flex items-center justify-center">
              {/* Animated Progress Circle */}
              <div className="absolute inset-0 bg-cookbook-gold/10 rounded-full blur-3xl animate-pulse" />
              <svg width="200" height="200" viewBox="0 0 200 200" className="relative z-10 transform -rotate-90">
                <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                <motion.circle 
                  cx="100" cy="100" r="90" fill="none" stroke="#C5A059" strokeWidth="8"
                  strokeDasharray="565"
                  initial={{ strokeDashoffset: 565 }}
                  animate={{ strokeDashoffset: 565 - (565 * progress) / 100 }}
                  transition={{ duration: 2, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="font-serif text-4xl text-white font-medium"
                >
                  {progress.toFixed(0)}%
                </motion.p>
              </div>
            </div>
            
            <div className="px-6 -mt-8 relative z-20">
              <h2 className="font-sans text-[12px] uppercase tracking-widest text-cookbook-gold font-bold mb-4">
                A Caminho do Sonho
              </h2>
              <p className="font-sans text-sm text-white/80 max-w-[250px] mx-auto text-balance leading-relaxed mb-8">
                Juntos, construindo algo maior. {destination ? destination : "O nosso destino"} nos aguarda!
              </p>

              <div className="flex gap-4 justify-center" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={handleExportImage}
                  className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-md transition-all active:scale-95"
                >
                  <Download size={20} />
                </button>
                {navigator.share && (
                  <button
                    onClick={handleShare}
                    className="bg-cookbook-gold text-white font-sans text-[10px] uppercase tracking-widest py-3 px-6 rounded-full font-bold shadow-[0_4px_20px_rgba(197,160,89,0.4)] flex items-center gap-2 active:scale-95"
                  >
                    <Share2 size={16} /> Compartilhar
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 bg-black/90 backdrop-blur-sm animate-modal-backdrop"
      onClick={onClose}
    >
      <div
        ref={storyRef}
        className="w-full h-full md:max-w-[400px] md:h-[90vh] md:max-h-[850px] relative overflow-hidden md:rounded-3xl border-0 md:border border-white/10 shadow-2xl flex flex-col"
        onClick={handleTap}
        onPointerDown={() => setIsPaused(true)}
        onPointerUp={() => setIsPaused(false)}
        onPointerLeave={() => setIsPaused(false)}
        style={{
          background: "linear-gradient(to bottom, #111 0%, #1a1a1a 100%)",
          touchAction: "none",
        }}
      >
        <div
          className="absolute inset-0 opacity-40 transition-colors duration-1000 pointer-events-none"
          style={{
            background: slide === 0
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

        {/* Progress Bars */}
        <div className="absolute top-4 left-0 w-full px-4 flex gap-1 z-30">
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
          className="absolute top-8 right-4 text-white/60 hover:text-white z-40 p-2 rounded-full backdrop-blur-md bg-black/20"
        >
          <X size={18} />
        </button>

        <div className="flex-1 relative z-20 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

