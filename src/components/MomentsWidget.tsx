import React, { useMemo, useState, useEffect, memo } from "react";
import { Sparkles, Trophy, Heart, Star, TrendingUp, Calendar, Zap } from "lucide-react";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MomentsWidgetProps {
  deposits: any[];
  goalAmount: number;
  totalSaved: number;
  destination: string;
}

export const MomentsWidget: React.FC<MomentsWidgetProps> = memo(({
  deposits,
  goalAmount,
  totalSaved,
  destination,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Small delay to animate in
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const moment = useMemo(() => {
    if (!deposits || deposits.length === 0) return null;

    const validDeposits = deposits.filter((d) => d.createdAt?.seconds);
    if (validDeposits.length === 0) return null;

    const sortedDeposits = [...validDeposits].sort(
      (a, b) => a.createdAt.seconds - b.createdAt.seconds
    );

    const firstDepositDate = new Date(sortedDeposits[0].createdAt.seconds * 1000);
    const lastDepositDate = new Date(
      sortedDeposits[sortedDeposits.length - 1].createdAt.seconds * 1000
    );
    const now = new Date();
    const daysSinceStart = differenceInDays(now, firstDepositDate);
    const daysSinceLast = differenceInDays(now, lastDepositDate);

    const percentage = goalAmount > 0 ? (totalSaved / goalAmount) * 100 : 0;
    const count = sortedDeposits.length;

    const moments = [];

    // 1. Percentage Milestones
    const milestones = [10, 25, 50, 75, 90, 100];
    let achievedMilestone = 0;
    for (const m of milestones) {
      if (percentage >= m) achievedMilestone = m;
    }

    if (achievedMilestone > 0 && achievedMilestone < 100) {
      moments.push({
        id: `milestone-${achievedMilestone}`,
        type: "milestone",
        title: "Celebração Diária!",
        message: `Vocês alcançaram ${achievedMilestone}% da meta para ${
          destination || "a viagem"
        }. Pura dopamina de conquista!`,
        icon: <Trophy size={20} className="text-cookbook-gold" />,
        priority: achievedMilestone <= 50 ? 80 : 90, // higher priority as we reach bigger milestones
        color: "from-cookbook-gold/20 to-transparent",
        borderColor: "border-cookbook-gold/30",
        badge: "Marco Alcançado",
      });
    }

    if (achievedMilestone === 100) {
      moments.push({
        id: "milestone-100",
        type: "goal_reached",
        title: "Meta Atingida!",
        message: `Vocês conseguiram! O destino de vocês está garantido. Peguem as malas e celebrem!`,
        icon: <Sparkles size={20} className="text-cookbook-primary" />,
        priority: 1000,
        color: "from-cookbook-primary/20 to-transparent",
        borderColor: "border-cookbook-primary/30",
        badge: "Vitória",
      });
    }

    // 2. Deposit counts / Streaks
    if (count === 1) {
      moments.push({
        id: "start",
        type: "start",
        title: "O Primeiro Passo",
        message: `A jornada começou. A primeira contribuição já está guardada com carinho.`,
        icon: <Star size={20} className="text-cookbook-text/80" />,
        priority: 100, // Very high if it's the only one
        color: "from-cookbook-surface/50 to-transparent",
        borderColor: "border-cookbook-border",
        badge: "Início",
      });
    } else if (count >= 10 && count < 50) {
      moments.push({
        id: "habit-10",
        type: "habit",
        title: "Construtores de Sonhos",
        message: `${count} contribuições realizadas! Vocês estão transformando o sonho em hábito.`,
        icon: <TrendingUp size={20} className="text-[#3b82f6]" />,
        priority: 70,
        color: "from-[#3b82f6]/20 to-transparent",
        borderColor: "border-[#3b82f6]/30",
        badge: "Hábito",
      });
    }

    // 3. Time elapsed
    if (daysSinceStart > 0 && daysSinceStart % 30 === 0) {
      moments.push({
        id: "anniversary",
        type: "anniversary",
        title: `Mêsversário do Pote!`,
        message: `Faz ${
          daysSinceStart / 30
        } mês(es) que começaram. Olhem o quanto já evoluíram juntos!`,
        icon: <Calendar size={20} className="text-[#8b5cf6]" />,
        priority: 95,
        color: "from-[#8b5cf6]/20 to-transparent",
        borderColor: "border-[#8b5cf6]/30",
        badge: "Data Especial",
      });
    }

    // 4. Activity today
    if (daysSinceLast === 0) {
      moments.push({
        id: "today",
        type: "today",
        title: "Conexão de Hoje",
        message: `Um passo dado juntos hoje. O destino final ficou um pouquinho mais perto!`,
        icon: <Heart size={20} className="text-[#ef4444]" />,
        priority: 85,
        color: "from-[#ef4444]/20 to-transparent",
        borderColor: "border-[#ef4444]/30",
        badge: "Ação Quente",
      });
    }

    // 5. Dopamine fallback (Random positive encouragement if no specific event)
    if (moments.length === 0) {
      const genericMoments = [
        {
          id: "generic-1",
          title: "Pequenos Passos",
          message:
            "A grande viagem se constrói nas pequenas decisões do dia a dia. Continuem firmes!",
          icon: <Zap size={20} className="text-cookbook-gold" />,
          priority: 10,
          color: "from-cookbook-gold/10 to-transparent",
          borderColor: "border-cookbook-border",
          badge: "Inspiração",
        },
        {
          id: "generic-2",
          title: "Parceria em Alta",
          message:
            "Dividir uma meta tira o peso dos ombros e adiciona força na jornada.",
          icon: <Heart size={20} className="text-[#ef4444]" />,
          priority: 10,
          color: "from-[#ef4444]/10 to-transparent",
          borderColor: "border-cookbook-border",
          badge: "Lembrete",
        },
      ];
      // Pick one randomly day-based to not change on every render
      const dayIndex = new Date().getDay() % genericMoments.length;
      moments.push(genericMoments[dayIndex]);
    }

    moments.sort((a, b) => b.priority - a.priority);
    return moments[0];
  }, [deposits, goalAmount, totalSaved, destination]);

  if (!moment) return null;

  return (
    <div
      className={`mb-6 relative z-10 transition-all duration-1000 ease-out transform origin-top ${
        isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"
      }`}
    >
      <div
        className={`p-5 rounded-3xl bg-gradient-to-br ${moment.color} border ${moment.borderColor} shadow-sm backdrop-blur-md overflow-hidden group`}
      >
        {/* Animated Background Glow */}
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none" />

        {/* Small badge top right */}
        <div className="absolute top-4 right-4 border border-cookbook-border/50 bg-cookbook-bg/50 backdrop-blur-md px-2 py-0.5 rounded-full font-sans text-[8px] uppercase tracking-widest text-cookbook-text/60 font-bold flex items-center shadow-sm">
          {moment.badge}
        </div>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 bg-white/5 backdrop-blur-lg shadow-inner group-hover:scale-110 transition-transform duration-500 ease-out">
            {moment.icon}
          </div>
          <div className="relative z-10 pt-1 pr-6">
            <h4 className="font-serif text-[17px] font-medium text-cookbook-text leading-tight mb-1.5 flex items-center gap-1.5">
              {moment.title}
            </h4>
            <p className="font-sans text-[11.5px] text-cookbook-text/80 leading-relaxed font-medium">
              {moment.message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});
