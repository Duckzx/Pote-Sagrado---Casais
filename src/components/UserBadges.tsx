import React, { useMemo, useEffect, useState, useRef } from "react";
import {
  Award,
  Flame,
  Coffee,
  Trophy,
  Target,
  X,
  Star,
  Zap,
  TrendingUp,
} from "lucide-react";
import { clsx } from "clsx";
import confetti from "canvas-confetti";

interface UserBadgesProps {
  deposits: any[];
  currentUser: any;
  goalAmount: number;
}

const ALL_BADGES = [
  {
    id: "primeiro_passo",
    title: "Primeiro Passo",
    desc: "Fez o primeiro depósito.",
    icon: <Target size={20} />,
    color: "text-cookbook-primary",
    bg: "bg-cookbook-primary/10",
    border: "border-cookbook-primary/20",
    glowColor: "rgba(142, 127, 109, 0.4)",
    xp: 100,
  },
  {
    id: "combo_3",
    title: "Combo 3 Dias",
    desc: "3 dias seguidos economizando.",
    icon: <Flame size={20} />,
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    glowColor: "rgba(239, 68, 68, 0.4)",
    xp: 250,
  },
  {
    id: "combo_7",
    title: "Combo 7 Dias",
    desc: "7 dias seguidos economizando!",
    icon: <Zap size={20} />,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    glowColor: "rgba(168, 85, 247, 0.4)",
    xp: 500,
  },
  {
    id: "foco_total",
    title: "Metade do Caminho",
    desc: "Alcançou 50% da meta.",
    icon: <TrendingUp size={20} />,
    color: "text-cookbook-gold",
    bg: "bg-cookbook-gold/10",
    border: "border-cookbook-gold/20",
    glowColor: "rgba(197, 160, 89, 0.4)",
    xp: 1000,
  },
  {
    id: "mestre_cuca",
    title: "Cozinheiros",
    desc: "Resistiu e comeu em casa 5x.",
    icon: <Coffee size={20} />,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    glowColor: "rgba(249, 115, 22, 0.4)",
    xp: 300,
  },
  {
    id: "sem_delivery",
    title: "Anti-iFood",
    desc: "Fugiu do delivery 5x.",
    icon: <Star size={20} />,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    glowColor: "rgba(16, 185, 129, 0.4)",
    xp: 300,
  },
  {
    id: "centenario",
    title: "Colecionadores",
    desc: "100+ depósitos no pote!",
    icon: <Trophy size={20} />,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    glowColor: "rgba(245, 158, 11, 0.4)",
    xp: 2000,
  },
  {
    id: "meta_batida",
    title: "Meta Batida",
    desc: "Atingiu 100% da meta!",
    icon: <Award size={20} />,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    glowColor: "rgba(234, 179, 8, 0.5)",
    xp: 5000,
  },
];

const CELEBRATION_PARTICLES = ["✨", "🌟", "⭐", "💫", "🎉", "🎊"];

// Fun couple levels based on XP
const COUPLE_LEVELS = [
  { level: 1, name: "Viajantes de Sofá", minXp: 0 },
  { level: 2, name: "Economistas Amadores", minXp: 300 },
  { level: 3, name: "Sócios do Cofrinho", minXp: 800 },
  { level: 4, name: "Investidores do Amor", minXp: 1500 },
  { level: 5, name: "Mestres da Poupança", minXp: 3000 },
  { level: 6, name: "Colecionadores de Milhas", minXp: 5000 },
  { level: 7, name: "Nômades Românticos", minXp: 8000 },
  { level: 8, name: "Lendas do Aeroporto", minXp: 15000 },
];

export const UserBadges: React.FC<UserBadgesProps> = ({
  deposits,
  currentUser,
  goalAmount,
}) => {
  const [newlyUnlocked, setNewlyUnlocked] = useState<
    (typeof ALL_BADGES)[0] | null
  >(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const prevEarnedRef = useRef<Set<string>>(new Set());
  const prevLevelRef = useRef<number>(1);
  const isInitialLoad = useRef(true);

  const { earnedBadges, totalXp, currentLevelInfo, nextLevelInfo, xpProgress } = useMemo(() => {
    const getDateObj = (val: any) => {
      if (!val) return null;
      if (typeof val.toDate === "function") return val.toDate();
      if (val instanceof Date) return val;
      if (typeof val === "string" || typeof val === "number") return new Date(val);
      return null;
    };

    if (!currentUser) return { 
      earnedBadges: new Set<string>(), 
      totalXp: 0, 
      currentLevelInfo: COUPLE_LEVELS[0], 
      nextLevelInfo: COUPLE_LEVELS[1],
      xpProgress: 0 
    };

    const earned = new Set<string>();
    const userDeposits =
      deposits.filter((d) => d.who === currentUser.uid && d.type !== "expense");
    
    // Base XP from deposits
    let calcXp = userDeposits.length * 50; // 50 XP per deposit

    if (userDeposits.length > 0) earned.add("primeiro_passo");

    const foodDeposits = userDeposits.filter(
      (d) =>
        d.action?.toLowerCase().includes("marmita") ||
        d.action?.toLowerCase().includes("jantar") ||
        d.action?.toLowerCase().includes("café") ||
        d.action?.toLowerCase().includes("comida")
    );
    if (foodDeposits.length >= 5) earned.add("mestre_cuca");

    const totalGlobalSaved = deposits.reduce(
      (acc, d) => (d.type === "expense" ? acc - d.amount : acc + d.amount),
      0
    );
    if (goalAmount > 0 && totalGlobalSaved >= goalAmount / 2) earned.add("foco_total");

    const depositDates = Array.from(
      new Set(
        userDeposits
          .map((d) => {
            const date = getDateObj(d.createdAt);
            return date ? date.toISOString().split("T")[0] : null;
          })
          .filter(Boolean) as string[]
      )
    ).sort();

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
      if (currentStreak > maxStreak) maxStreak = currentStreak;
    }

    if (maxStreak >= 3) earned.add("combo_3");
    if (maxStreak >= 7) earned.add("combo_7");

    const noDeliveryDeposits = userDeposits.filter(
      (d) =>
        d.action?.toLowerCase().includes("ifood") ||
        d.action?.toLowerCase().includes("delivery") ||
        d.action?.toLowerCase().includes("resistiu")
    );
    if (noDeliveryDeposits.length >= 5) earned.add("sem_delivery");
    if (userDeposits.length >= 100) earned.add("centenario");
    if (goalAmount > 0 && totalGlobalSaved >= goalAmount) earned.add("meta_batida");

    // Add XP from badges
    earned.forEach(badgeId => {
      const badge = ALL_BADGES.find(b => b.id === badgeId);
      if (badge) calcXp += badge.xp;
    });

    let currentLvl = COUPLE_LEVELS[0];
    let nextLvl = COUPLE_LEVELS[1];

    for (let i = 0; i < COUPLE_LEVELS.length; i++) {
      if (calcXp >= COUPLE_LEVELS[i].minXp) {
        currentLvl = COUPLE_LEVELS[i];
        nextLvl = COUPLE_LEVELS[i + 1] || currentLvl;
      } else {
        break;
      }
    }

    let progress = 100;
    if (nextLvl.level !== currentLvl.level) {
      const range = nextLvl.minXp - currentLvl.minXp;
      const doneInLevel = calcXp - currentLvl.minXp;
      progress = Math.min(100, Math.max(0, (doneInLevel / range) * 100));
    }

    return { 
      earnedBadges: earned, 
      totalXp: calcXp, 
      currentLevelInfo: currentLvl, 
      nextLevelInfo: nextLvl,
      xpProgress: progress 
    };
  }, [deposits, currentUser, goalAmount]);

  useEffect(() => {
    if (isInitialLoad.current) {
      if (deposits.length > 0) {
        prevEarnedRef.current = new Set(earnedBadges);
        prevLevelRef.current = currentLevelInfo.level;
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
        setTimeout(() => confetti({ particleCount: 80, spread: 60, origin: { x: 0.3, y: 0.5 }, zIndex: 100, colors: ["#8E7F6D", "#C5A059", "#F2CC8F", "#FFD700"] }), 300);
        setTimeout(() => confetti({ particleCount: 100, spread: 90, origin: { x: 0.7, y: 0.5 }, zIndex: 100, colors: ["#8E7F6D", "#2C2A26", "#C5A059", "#F2CC8F"] }), 600);
        setTimeout(() => confetti({ particleCount: 50, spread: 120, origin: { x: 0.5, y: 0.4 }, zIndex: 100, colors: ["#FFD700", "#FFA500", "#FF6347"] }), 900);
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
      <div className="space-y-6">
        {/* Nível do Casal / Gamification Wrapper */}
        <div className="bg-cookbook-surface border border-cookbook-border rounded-3xl p-5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Trophy size={100} />
          </div>
          
          <div className="relative z-10 flex flex-col mb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold text-cookbook-primary">
                Nível do Casal
              </span>
              <div className="bg-cookbook-primary/20 text-cookbook-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                Lvl {currentLevelInfo.level}
              </div>
            </div>
            <h3 className="font-serif text-2xl text-cookbook-text leading-tight mb-3">
              {currentLevelInfo.name}
            </h3>
            
            <div className="flex items-center justify-between mb-1.5 text-[10px] font-sans font-bold uppercase tracking-widest text-cookbook-text/60">
              <span>{totalXp} XP</span>
              {currentLevelInfo.level !== nextLevelInfo.level && (
                <span>Próximo Lvl: {nextLevelInfo.minXp} XP</span>
              )}
            </div>
            
            <div className="h-1.5 w-full bg-cookbook-bg rounded-full overflow-hidden border border-cookbook-border/50">
              <div 
                className="h-full bg-gradient-to-r from-cookbook-primary to-cookbook-gold rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${xpProgress}%` }}
              />
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between px-2 mb-4">
            <h3 className="font-sans text-[10px] uppercase tracking-[0.15em] text-cookbook-text/40 font-bold">
              {" "}
              Medalhas e Conquistas{" "}
            </h3>{" "}
            <span className="font-sans text-[10px] uppercase tracking-widest text-cookbook-primary font-bold">
              {" "}
              {earnedBadges.size} / {ALL_BADGES.length}{" "}
            </span>{" "}
          </div>{" "}
          <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar -mx-6 px-6">
            {" "}
            {ALL_BADGES.map((badge) => {
              const isEarned = earnedBadges.has(badge.id);
              return (
                <div
                  key={badge.id}
                  className={clsx(
                    "snap-start shrink-0 w-[140px] rounded-[24px] p-4 flex flex-col items-center text-center border transition-all duration-500",
                    isEarned
                      ? `bg-cookbook-surface ${badge.border} shadow-sm badge-newly-earned`
                      : "bg-cookbook-bg/50 border-cookbook-border/50 opacity-60 grayscale",
                  )}
                  style={
                    isEarned
                      ? { boxShadow: `0 4px 20px ${badge.glowColor}` }
                      : undefined
                  }
                >
                  {" "}
                  <div
                    className={clsx(
                      "w-12 h-12 rounded-full flex items-center justify-center mb-3 text-current transition-all duration-500",
                      isEarned
                        ? badge.bg
                        : "bg-cookbook-border/50 text-cookbook-text/40",
                      isEarned ? badge.color : "",
                    )}
                  >
                    {" "}
                    {badge.icon}{" "}
                  </div>{" "}
                  <h4
                    className={clsx(
                      "font-serif italic text-sm mb-1 leading-tight transition-colors duration-500",
                      isEarned ? "text-cookbook-text" : "text-cookbook-text/50",
                    )}
                  >
                    {" "}
                    {badge.title}{" "}
                  </h4>{" "}
                  <p className="font-sans text-[9px] uppercase tracking-wider text-cookbook-text/60 font-medium mb-2 opacity-80">
                    {" "}
                    {badge.desc}{" "}
                  </p>{" "}
                  <span className={clsx("font-sans text-[9px] font-bold px-2 py-0.5 rounded-full mt-auto", isEarned ? badge.color + " " + badge.bg : "text-cookbook-text/40 bg-cookbook-bg")}>
                    +{badge.xp} XP
                  </span>
                </div>
              );
            })}{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}

      {/* Achievement Unlock Celebration Modal */}{" "}
      {newlyUnlocked && (
        <div
          className={clsx(
            "fixed inset-0 z-[70] flex items-center justify-center p-4",
            showCelebration
              ? "animate-badge-unlock-backdrop"
              : "opacity-0 pointer-events-none",
          )}
          style={{
            background:
              "radial-gradient(circle at center, rgba(253,251,247,0.95) 0%, rgba(44,42,38,0.85) 100%)",
            backdropFilter: "blur(8px)",
            transition: "opacity 0.3s ease-out",
          }}
          onClick={handleClose}
        >
          {" "}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {" "}
            {CELEBRATION_PARTICLES.map((particle, i) => (
              <div
                key={i}
                className="absolute text-2xl"
                style={{
                  left: `${15 + i * 14}%`,
                  bottom: "30%",
                  animation: `float-particle ${1.5 + i * 0.3}s ease-out ${i * 0.15}s forwards`,
                  opacity: 0,
                }}
              >
                {" "}
                {particle}{" "}
              </div>
            ))}{" "}
          </div>{" "}
          <div
            className={clsx(
              "relative w-full max-w-sm",
              showCelebration ? "animate-badge-unlock-card" : "",
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {" "}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ top: "-20%" }}
            >
              {" "}
              <div
                className="w-48 h-48 rounded-full border-2 animate-badge-shimmer"
                style={{ borderColor: newlyUnlocked.glowColor }}
              />{" "}
            </div>{" "}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ top: "-20%" }}
            >
              {" "}
              <div
                className="w-64 h-64 rounded-full border animate-badge-shimmer-delayed"
                style={{ borderColor: newlyUnlocked.glowColor }}
              />{" "}
            </div>{" "}
            <div className="bg-cookbook-bg border border-cookbook-border rounded-2xl w-full p-8 shadow-2xl relative text-center overflow-hidden">
              {" "}
              <div
                className="absolute top-0 left-0 w-full h-1"
                style={{
                  background: `linear-gradient(90deg, transparent, ${newlyUnlocked.glowColor}, transparent)`,
                }}
              />{" "}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-cookbook-text/40 hover:text-cookbook-text z-10 transition-colors"
              >
                {" "}
                <X size={20} />{" "}
              </button>{" "}
              <div className="animate-badge-text-reveal reveal-delay-1 font-sans text-[10px] uppercase tracking-[0.25em] text-cookbook-primary font-bold mb-6">
                {" "}
                🏆 Nova Conquista!{" "}
              </div>{" "}
              <div className="relative w-28 h-28 mx-auto mb-6">
                {" "}
                <div
                  className="absolute inset-0 rounded-full animate-badge-glow"
                  style={{
                    background: `radial-gradient(circle, ${newlyUnlocked.glowColor} 0%, transparent 70%)`,
                  }}
                />{" "}
                <div
                  className={clsx(
                    "relative w-28 h-28 rounded-full flex items-center justify-center shadow-lg animate-badge-icon-spin",
                    newlyUnlocked.bg,
                    newlyUnlocked.color,
                  )}
                >
                  {" "}
                  {React.cloneElement(
                    newlyUnlocked.icon as React.ReactElement<any>,
                    { size: 52, className: newlyUnlocked.color },
                  )}{" "}
                </div>{" "}
              </div>{" "}
              <h3 className="animate-badge-text-reveal reveal-delay-2 font-serif italic text-3xl text-cookbook-text mb-3">
                {" "}
                {newlyUnlocked.title}{" "}
              </h3>{" "}
              <p className="animate-badge-text-reveal reveal-delay-3 font-sans text-xs uppercase tracking-wider text-cookbook-text/60 mb-2 leading-relaxed px-4">
                {" "}
                {newlyUnlocked.desc}{" "}
              </p>{" "}
              <div className="animate-badge-text-reveal reveal-delay-3 font-sans text-xs font-bold text-cookbook-primary mb-8">
                +{newlyUnlocked.xp} XP
              </div>
              <button
                onClick={handleClose}
                className="animate-badge-text-reveal reveal-delay-4 w-full text-white font-sans text-[10px] uppercase tracking-widest py-4 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95"
                style={{
                  background: `linear-gradient(135deg, var(--theme-primary), var(--theme-gold))`,
                }}
              >
                {" "}
                ✨ Continuar Jornada{" "}
              </button>{" "}
            </div>{" "}
          </div>{" "}
        </div>
      )}{" "}
    </>
  );
};

