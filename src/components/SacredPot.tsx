import React, { useEffect, useState, useRef } from 'react';
import { AnimatedNumber } from './AnimatedNumber';
import confetti from 'canvas-confetti';
import './SacredPot.css';

interface SacredPotProps {
  totalSaved: number;
  goalAmount: number;
  achievements?: any[];
  isBreaking?: boolean;
  isBroken?: boolean;
}

export const SacredPot: React.FC<SacredPotProps> = ({ totalSaved, goalAmount, achievements = [], isBreaking = false, isBroken = false }) => {
  const [fillHeight, setFillHeight] = useState(0);
  // Cap visual fill at 95% to prevent the wave animation from spilling out of the top of the CSS pot
  const calculatedPct = goalAmount > 0 ? (totalSaved / goalAmount) * 100 : 0;
  const targetProgress = Math.min(95, Math.max(0, calculatedPct));
  const isGoalReached = totalSaved >= goalAmount && goalAmount > 0;
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isBroken) {
      setFillHeight(0);
      return;
    }
    const timer = setTimeout(() => {
      setFillHeight(targetProgress);
    }, 150);
    return () => clearTimeout(timer);
  }, [targetProgress, isBroken]);

  // Trigger continuous light confetti if goal reached
  useEffect(() => {
    if (isGoalReached && !isBreaking && !isBroken && canvasRef.current) {
      const customConfetti = confetti.create(canvasRef.current, {
        resize: false,
        useWorker: false
      });
      
      const interval = setInterval(() => {
        customConfetti({
          particleCount: 8,
          spread: 40,
          origin: { x: 0.5, y: 0.4 }, // Center of the local absolute canvas
          colors: ['#FFD700', '#FDB931', '#FF8C00', '#FFF8DC'], // Gold variants
          disableForReducedMotion: true,
          ticks: 100,
          gravity: 0.8,
          scalar: 0.6,
          zIndex: 10,
        });
      }, 1500);
      return () => {
        clearInterval(interval);
        customConfetti.reset();
      };
    }
  }, [isGoalReached, isBreaking, isBroken]);

  return (
    <div className="sacred-pot-container relative">
      {/* Background Glow when Goal Reached */}
      {isGoalReached && !isBroken && (
        <div className="absolute inset-x-0 -inset-y-10 z-0 bg-cookbook-gold/20 blur-3xl rounded-full scale-110 animate-pulse-slow"></div>
      )}
      
      {/* Local Confetti Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full pointer-events-none z-50 scale-150"
      />

      <div className={`sacred-pot relative z-10 transition-transform duration-75 ${isBreaking && !isBroken ? 'scale-105 rotate-1' : ''} ${!isBreaking && !isBroken ? 'animate-float' : ''}`}>
        
        {/* Visual Identity Logo/Sticker */}
        <div className={`absolute -left-6 top-8 z-20 bg-[#1A1A1C] text-white px-3 py-1 rounded-full shadow-lg border border-white/10 rotate-[-12deg] pointer-events-none transition-opacity ${isBroken ? 'opacity-0' : 'opacity-100'}`}>
          <span className="font-serif italic text-sm font-bold tracking-wider">Pote Sagrado</span>
        </div>

        {/* Dynamic Achievements Badges */}
        {achievements.length > 0 && (
          <div className={`absolute -right-4 top-16 z-20 bg-cookbook-gold text-white px-3 py-1.5 rounded-2xl shadow-lg rotate-[8deg] flex items-center space-x-1 border border-white/20 transition-opacity ${isBroken ? 'opacity-0' : 'opacity-100'}`}>
            <span className="text-xs">🏆</span>
            <span className="font-sans text-[10px] uppercase tracking-widest font-bold">
              {achievements.length}x Cheios
            </span>
          </div>
        )}

        {/* Glass cracking overlay (appears when isBreaking but not completely broken) */}
        {isBreaking && !isBroken && (
          <div className="absolute inset-x-0 inset-y-10 z-[15] pointer-events-none" style={{ backgroundImage: 'radial-gradient(ellipse at center, rgba(255,255,255,0.8) 0%, transparent 60%)' }}>
            <svg viewBox="0 0 100 120" className="w-full h-full opacity-80" preserveAspectRatio="none">
              <path d="M50 0 L45 30 L60 50 L40 70 L55 90 L48 120" stroke="white" strokeWidth="2" fill="none" strokeDasharray="100" strokeDashoffset="0">
                <animate attributeName="stroke-dashoffset" from="100" to="0" dur="0.2s" fill="freeze" />
              </path>
              <path d="M45 30 L20 40 M60 50 L80 45 M40 70 L15 80" stroke="white" strokeWidth="1" fill="none" strokeDasharray="50" strokeDashoffset="0">
                <animate attributeName="stroke-dashoffset" from="50" to="0" dur="0.2s" begin="0.1s" fill="freeze" />
              </path>
            </svg>
          </div>
        )}

        <div className={`pot-lid transition-opacity duration-300 ${isBroken ? 'opacity-0 -translate-y-20' : 'opacity-100'}`}></div>
        <div className={`pot-glass transition-all duration-300 ${isBroken ? 'opacity-0 scale-125' : 'opacity-100 scale-100'}`}>
          <div className="absolute inset-0 overflow-hidden rounded-t-[10px] rounded-b-[80px]">
            <div 
              className="pot-liquid transition-all duration-1000" 
              style={{ height: `${fillHeight}%`, opacity: isBroken ? 0 : 1 }}
            />
          </div>
        </div>
        
        <div className={`pot-label transition-opacity duration-300 ${isBroken ? 'opacity-0' : 'opacity-100'}`}>
          <div className="font-serif text-3xl font-bold text-cookbook-primary">
            <AnimatedNumber value={totalSaved} />
          </div>
          <p className="font-sans text-[10px] uppercase tracking-widest text-cookbook-text/60 mt-1 font-bold">
            de {Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(goalAmount)}
          </p>
        </div>
      </div>
    </div>
  );
};
