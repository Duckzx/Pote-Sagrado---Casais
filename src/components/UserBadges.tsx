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
    border: 'border-cookbook-primary/20'
  },
  { 
    id: 'mestre_cuca', 
    title: 'Mestre Cuca', 
    desc: 'Guardou 5 vezes com comida em casa.',
    icon: <Coffee size={20} />,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20'
  },
  { 
    id: 'foco_total', 
    title: 'Foco Total', 
    desc: 'Alcançou 50% da meta global.',
    icon: <Award size={20} />,
    color: 'text-cookbook-gold',
    bg: 'bg-cookbook-gold/10',
    border: 'border-cookbook-gold/20'
  },
  { 
    id: 'combo_3', 
    title: 'Combo 3 Dias', 
    desc: 'Guardou dinheiro por 3 dias seguidos.',
    icon: <Flame size={20} />,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20'
  },
];

export const UserBadges: React.FC<UserBadgesProps> = ({ deposits, currentUser, goalAmount }) => {
  const [newlyUnlocked, setNewlyUnlocked] = useState<typeof ALL_BADGES[0] | null>(null);
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
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.5 },
          zIndex: 100,
          colors: ['#8E7F6D', '#2C2A26', '#C5A059', '#F2CC8F']
        });
      }
      prevEarnedRef.current = new Set(earnedBadges);
    }
  }, [earnedBadges, deposits]);

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
                "snap-start shrink-0 w-[140px] rounded p-4 flex flex-col items-center text-center border transition-all",
                isEarned 
                  ? `bg-white ${badge.border} shadow-sm` 
                  : "bg-cookbook-bg/50 border-cookbook-border/50 opacity-60 grayscale"
              )}
            >
              <div className={clsx(
                "w-12 h-12 rounded-full flex items-center justify-center mb-3 text-current",
                isEarned ? badge.bg : "bg-cookbook-border/50 text-cookbook-text/40",
                isEarned ? badge.color : ""
              )}>
                {badge.icon}
              </div>
              <h4 className={clsx(
                "font-serif italic text-sm mb-1 leading-tight",
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

    {newlyUnlocked && (
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-cookbook-bg/80 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-white border border-cookbook-border rounded-xl w-full max-w-sm p-8 shadow-2xl relative text-center">
          <button 
            onClick={() => setNewlyUnlocked(null)}
            className="absolute top-4 right-4 text-cookbook-text/40 hover:text-cookbook-text"
          >
            <X size={20} />
          </button>
          
          <div className="font-sans text-[10px] uppercase tracking-[0.2em] text-cookbook-primary font-bold mb-4">
            Nova Conquista Desbloqueada!
          </div>

          <div className={clsx(
            "w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 shadow-inner",
            newlyUnlocked.bg,
            newlyUnlocked.color
          )}>
            {React.cloneElement(newlyUnlocked.icon as React.ReactElement, { size: 48, className: newlyUnlocked.color })}
          </div>
          
          <h3 className="font-serif italic text-3xl text-cookbook-text mb-2">
            {newlyUnlocked.title}
          </h3>
          <p className="font-sans text-xs uppercase tracking-wider text-cookbook-text/60 mb-8 leading-relaxed">
            {newlyUnlocked.desc}
          </p>

          <button
            onClick={() => setNewlyUnlocked(null)}
            className="w-full bg-cookbook-primary text-white font-sans text-[10px] uppercase tracking-widest py-4 rounded font-bold hover:bg-cookbook-primary/90 transition-colors shadow-md"
          >
            Continuar
          </button>
        </div>
      </div>
    )}
    </>
  );
};
