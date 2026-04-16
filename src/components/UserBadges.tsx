import React, { useMemo, useEffect, useState, useRef } from 'react';
import { Award, Flame, Coffee, Trophy, Target, X } from 'lucide-react';
import { clsx } from 'clsx';
import confetti from 'canvas-confetti';

interface UserBadgesProps {
  deposits: any[];
  currentUser: any;
  goalAmount: number;
}

const ALL_BADGES = [
  { 
    id: 'primeiro_passo', 
    title: 'Primeiro Passo', 
    desc: 'Fez o primeiro depósito.',
    icon: <Target size={20} />,
    color: 'text-cookbook-primary',
    bg: 'bg-cookbook-primary/10',
    border: 'border-cookbook-primary/20',
    glowColor: 'rgba(142, 127, 109, 0.4)'
  },
  { 
    id: 'mestre_cuca', 
    title: 'Mestre Cuca', 
    desc: 'Guardou 5 vezes com comida em casa.',
    icon: <Coffee size={20} />,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    glowColor: 'rgba(249, 115, 22, 0.4)'
  },
  { 
    id: 'foco_total', 
    title: 'Foco Total', 
    desc: 'Alcançou 50% da meta global.',
    icon: <Award size={20} />,
    color: 'text-cookbook-gold',
    bg: 'bg-cookbook-gold/10',
    border: 'border-cookbook-gold/20',
    glowColor: 'rgba(197, 160, 89, 0.4)'
  },
  { 
    id: 'combo_3', 
    title: 'Combo 3 Dias', 
    desc: 'Guardou dinheiro por 3 dias seguidos.',
    icon: <Flame size={20} />,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    glowColor: 'rgba(239, 68, 68, 0.4)'
  },
];

const CELEBRATION_PARTICLES = ['✨', '🌟', '⭐', '💫', '🎉', '🎊'];

export const UserBadges: React.FC<UserBadgesProps> = ({ deposits, currentUser, goalAmount }) => {
  const [newlyUnlocked, setNewlyUnlocked] = useState<typeof ALL_BADGES[0] | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const prevEarnedRef = useRef<Set<string>>(new Set());
  const isInitialLoad = useRef(true);

  const earnedBadges: Set<string> = useMemo(() => {
    if (!currentUser) return new Set<string>();

    const earned = new Set<string>();
    
    // User's deposits (only income, not expenses)
    const userDeposits = deposits.filter(d => d.who === currentUser.uid && d.type !== 'expense');
    
    // 1. Primeiro Passo
    if (userDeposits.length > 0) {
      earned.add('primeiro_passo');
    }

    // 2. Mestre Cuca (check for food related actions)
    const foodDeposits = userDeposits.filter(d => 
      d.action?.toLowerCase().includes('marmita') || 
      d.action?.toLowerCase().includes('jantar') ||
      d.action?.toLowerCase().includes('café') ||
      d.action?.toLowerCase().includes('comida')
    );
    if (foodDeposits.length >= 5) {
      earned.add('mestre_cuca');
    }

    // 3. Foco Total (50% of goal)
    const totalGlobalSaved = deposits.reduce((acc, d) => d.type === 'expense' ? acc - d.amount : acc + d.amount, 0);
    if (goalAmount > 0 && totalGlobalSaved >= goalAmount / 2) {
      earned.add('foco_total');
    }

    // 4. Combo 3 Dias (Streak calculation is tricky with just dates, doing a simplified version)
    // Map to unique date strings
    const depositDates = Array.from(new Set(userDeposits
      .map(d => d.createdAt?.toDate ? d.createdAt.toDate().toISOString().split('T')[0] : null)
      .filter(Boolean) as string[]
    )).sort();

    let maxStreak = 0;
    let currentStreak = 0;
    
    for (let i = 0; i < depositDates.length; i++) {
      if (i === 0) {
        currentStreak = 1;
      } else {
        const prevDate = new Date(depositDates[i - 1]);
        const currDate = new Date(depositDates[i]);
        const diffTime = Math.abs(currDate.getTime() - prevDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          currentStreak++;
        } else {
          currentStreak = 1;
        }
      }
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
      }
    }

    if (maxStreak >= 3) {
      earned.add('combo_3');
    }

    return earned;
  }, [deposits, currentUser, goalAmount]);

  useEffect(() => {
    if (isInitialLoad.current) {
      if (deposits.length > 0) { // Wait until we actually loaded some data to drop initial load guard
        prevEarnedRef.current = new Set(earnedBadges);
        isInitialLoad.current = false;
      }
      return;
    }

    const newBadgesList = Array.from(earnedBadges).filter(id => !prevEarnedRef.current.has(id));
    
    if (newBadgesList.length > 0) {
      const badgeData = ALL_BADGES.find(b => b.id === newBadgesList[0]);
      if (badgeData) {
        setNewlyUnlocked(badgeData);
        setShowCelebration(true);
        
        // Staggered confetti bursts for more drama
        setTimeout(() => {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { x: 0.3, y: 0.5 },
            zIndex: 100,
            colors: ['#8E7F6D', '#C5A059', '#F2CC8F', '#FFD700']
          });
        }, 300);
        
        setTimeout(() => {
          confetti({
            particleCount: 100,
            spread: 90,
            origin: { x: 0.7, y: 0.5 },
            zIndex: 100,
            colors: ['#8E7F6D', '#2C2A26', '#C5A059', '#F2CC8F']
          });
        }, 600);

        setTimeout(() => {
          confetti({
            particleCount: 50,
            spread: 120,
            origin: { x: 0.5, y: 0.4 },
            zIndex: 100,
            colors: ['#FFD700', '#FFA500', '#FF6347']
          });
        }, 900);
      }
      prevEarnedRef.current = new Set(earnedBadges);
    }
  }, [earnedBadges, deposits]);

  const handleClose = () => {
    setShowCelebration(false);
    setTimeout(() => setNewlyUnlocked(null), 400);
  };

  return (
    <>
      <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="font-sans text-[10px] uppercase tracking-[0.15em] text-cookbook-text/40 font-bold">
          Medalhas
        </h3>
        <span className="font-sans text-[10px] uppercase tracking-widest text-cookbook-primary font-bold">
          {earnedBadges.size} / {ALL_BADGES.length}
        </span>
      </div>
      
      <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar -mx-6 px-6">
        {ALL_BADGES.map((badge) => {
          const isEarned = earnedBadges.has(badge.id);
          
          return (
            <div 
              key={badge.id}
              className={clsx(
                "snap-start shrink-0 w-[140px] rounded p-4 flex flex-col items-center text-center border transition-all duration-500",
                isEarned 
                  ? `bg-white ${badge.border} shadow-sm badge-newly-earned` 
                  : "bg-cookbook-bg/50 border-cookbook-border/50 opacity-60 grayscale"
              )}
              style={isEarned ? { 
                boxShadow: `0 4px 20px ${badge.glowColor}` 
              } : undefined}
            >
              <div className={clsx(
                "w-12 h-12 rounded-full flex items-center justify-center mb-3 text-current transition-all duration-500",
                isEarned ? badge.bg : "bg-cookbook-border/50 text-cookbook-text/40",
                isEarned ? badge.color : ""
              )}>
                {badge.icon}
              </div>
              <h4 className={clsx(
                "font-serif italic text-sm mb-1 leading-tight transition-colors duration-500",
                isEarned ? "text-cookbook-text" : "text-cookbook-text/50"
              )}>
                {badge.title}
              </h4>
              <p className="font-sans text-[9px] uppercase tracking-wider text-cookbook-text/50 font-bold">
                {badge.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>

    {/* Achievement Unlock Celebration Modal */}
    {newlyUnlocked && (
      <div 
        className={clsx(
          "fixed inset-0 z-[70] flex items-center justify-center p-4",
          showCelebration ? "animate-badge-unlock-backdrop" : "opacity-0 pointer-events-none"
        )}
        style={{ 
          background: 'radial-gradient(circle at center, rgba(253,251,247,0.95) 0%, rgba(44,42,38,0.85) 100%)',
          backdropFilter: 'blur(8px)',
          transition: 'opacity 0.3s ease-out'
        }}
        onClick={handleClose}
      >
        {/* Floating celebration particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {CELEBRATION_PARTICLES.map((particle, i) => (
            <div
              key={i}
              className="absolute text-2xl"
              style={{
                left: `${15 + i * 14}%`,
                bottom: '30%',
                animation: `float-particle ${1.5 + i * 0.3}s ease-out ${i * 0.15}s forwards`,
                opacity: 0
              }}
            >
              {particle}
            </div>
          ))}
        </div>

        <div 
          className={clsx(
            "relative w-full max-w-sm",
            showCelebration ? "animate-badge-unlock-card" : ""
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Shimmer rings behind card */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ top: '-20%' }}>
            <div 
              className="w-48 h-48 rounded-full border-2 animate-badge-shimmer"
              style={{ borderColor: newlyUnlocked.glowColor }}
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ top: '-20%' }}>
            <div 
              className="w-64 h-64 rounded-full border animate-badge-shimmer-delayed"
              style={{ borderColor: newlyUnlocked.glowColor }}
            />
          </div>

          <div className="bg-white border border-cookbook-border rounded-2xl w-full p-8 shadow-2xl relative text-center overflow-hidden">
            {/* Top shine decoration */}
            <div 
              className="absolute top-0 left-0 w-full h-1"
              style={{ 
                background: `linear-gradient(90deg, transparent, ${newlyUnlocked.glowColor}, transparent)` 
              }}
            />

            <button 
              onClick={handleClose}
              className="absolute top-4 right-4 text-cookbook-text/40 hover:text-cookbook-text z-10 transition-colors"
            >
              <X size={20} />
            </button>
            
            {/* Label */}
            <div className="animate-badge-text-reveal reveal-delay-1 font-sans text-[10px] uppercase tracking-[0.25em] text-cookbook-primary font-bold mb-6">
              🏆 Nova Conquista Desbloqueada!
            </div>

            {/* Glowing icon */}
            <div className="relative w-28 h-28 mx-auto mb-6">
              {/* Glow ring */}
              <div 
                className="absolute inset-0 rounded-full animate-badge-glow"
                style={{ background: `radial-gradient(circle, ${newlyUnlocked.glowColor} 0%, transparent 70%)` }}
              />
              
              {/* Icon container */}
              <div className={clsx(
                "relative w-28 h-28 rounded-full flex items-center justify-center shadow-lg animate-badge-icon-spin",
                newlyUnlocked.bg,
                newlyUnlocked.color
              )}>
                {React.cloneElement(newlyUnlocked.icon as React.ReactElement, { size: 52, className: newlyUnlocked.color })}
              </div>
            </div>
            
            {/* Title with staggered reveal */}
            <h3 className="animate-badge-text-reveal reveal-delay-2 font-serif italic text-3xl text-cookbook-text mb-3">
              {newlyUnlocked.title}
            </h3>
            
            {/* Description */}
            <p className="animate-badge-text-reveal reveal-delay-3 font-sans text-xs uppercase tracking-wider text-cookbook-text/60 mb-8 leading-relaxed px-4">
              {newlyUnlocked.desc}
            </p>

            {/* CTA Button */}
            <button
              onClick={handleClose}
              className="animate-badge-text-reveal reveal-delay-4 w-full text-white font-sans text-[10px] uppercase tracking-widest py-4 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95"
              style={{ 
                background: `linear-gradient(135deg, var(--theme-primary), var(--theme-gold))`,
              }}
            >
              ✨ Incrível! Continuar
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};
