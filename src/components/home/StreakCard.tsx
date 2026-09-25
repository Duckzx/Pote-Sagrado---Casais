import React, { useMemo } from "react";
import { motion } from "motion/react";
import { useAppStore } from "../../store/useAppStore";
import { computeStreak } from "../../lib/progress";

/** Duolingo-style "ofensiva": consecutive days putting money in the pot. */
export const StreakCard: React.FC = () => {
  const deposits = useAppStore((s) => s.deposits);
  const mode = useAppStore((s) => s.mode);
  const streak = useMemo(() => computeStreak(deposits), [deposits]);

  const alive = streak.current > 0;
  const hint = streak.savedToday
    ? "Hoje já está garantido. Volte amanhã! ✨"
    : alive
      ? "Guarde qualquer valor hoje para não perder a ofensiva."
      : mode === "solo"
        ? "Guarde qualquer valor hoje e comece sua ofensiva."
        : "Guardem qualquer valor hoje e comecem a ofensiva.";

  return (
    <section className="relative overflow-hidden rounded-3xl p-5 border border-cookbook-border bg-cookbook-bg/85 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-4">
        <motion.div
          animate={alive ? { scale: [1, 1.12, 1], rotate: [0, -4, 4, 0] } : {}}
          transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 1.5 }}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 ${
            alive ? "bg-gradient-to-br from-amber-300/60 to-rose-400/50" : "bg-cookbook-text/5 grayscale"
          }`}
        >
          🔥
        </motion.div>
        <div className="flex-1 min-w-0">
          <p className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold text-cookbook-text/50">Ofensiva</p>
          <p className="font-serif text-2xl text-cookbook-text leading-tight">
            {streak.current} {streak.current === 1 ? "dia seguido" : "dias seguidos"}
          </p>
          <p className="font-sans text-[11px] text-cookbook-text/55 mt-0.5 leading-snug">{hint}</p>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 mt-4">
        {streak.week.map((d) => (
          <div key={d.key} className="flex flex-col items-center gap-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-colors ${
                d.done
                  ? "bg-gradient-to-br from-amber-400 to-cookbook-primary text-white shadow-sm"
                  : d.isToday
                    ? "border-2 border-dashed border-cookbook-primary/40"
                    : "bg-cookbook-text/[0.05]"
              }`}
            >
              {d.done ? "✓" : ""}
            </div>
            <span className={`font-sans text-[9px] font-bold ${d.isToday ? "text-cookbook-primary" : "text-cookbook-text/40"}`}>
              {d.isToday ? "hoje" : d.label}
            </span>
          </div>
        ))}
      </div>

      {streak.best > 1 && (
        <p className="font-sans text-[10px] text-cookbook-text/40 mt-3 text-right">Recorde: {streak.best} dias</p>
      )}
    </section>
  );
};
