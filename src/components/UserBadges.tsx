import React, { useMemo } from 'react';
import { Award, Flame, Coffee, Trophy, Target } from 'lucide-react';
import { clsx } from 'clsx';

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

  return (
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
  );
};
