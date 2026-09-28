import React, { useMemo } from "react";
import { useAppStore } from "../../store/useAppStore";
import { localDayKey, toDate } from "../../lib/progress";

const WEEKS = 12;

/** GitHub-style grid of the last 12 weeks: darker = more saved that day. */
export const SavingHeatmap: React.FC = () => {
  const deposits = useAppStore((s) => s.deposits);

  const { columns, activeDays, max } = useMemo(() => {
    const byDay = new Map<string, number>();
    deposits.forEach((d) => {
      if (d.type === "expense" || d.isXpBonus) return;
      const date = toDate(d.createdAt);
      if (!date) return;
      const key = localDayKey(date);
      byDay.set(key, (byDay.get(key) || 0) + (Number(d.amount) || 0));
    });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Start on the Monday WEEKS-1 weeks ago
    const start = new Date(today);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7) - (WEEKS - 1) * 7);
    const cols: { key: string; value: number; future: boolean }[][] = [];
    let maxValue = 0;
    let active = 0;
    for (let w = 0; w < WEEKS; w++) {
      const col = [];
      for (let d = 0; d < 7; d++) {
        const day = new Date(start);
        day.setDate(start.getDate() + w * 7 + d);
        const key = localDayKey(day);
        const value = byDay.get(key) || 0;
        if (value > 0) active++;
        maxValue = Math.max(maxValue, value);
        col.push({ key, value, future: day > today });
      }
      cols.push(col);
    }
    return { columns: cols, activeDays: active, max: maxValue };
  }, [deposits]);

  if (activeDays === 0) return null;

  const level = (v: number) => (v <= 0 ? 0 : v >= max * 0.66 ? 3 : v >= max * 0.33 ? 2 : 1);
  const shades = ["bg-cookbook-text/[0.06]", "bg-cookbook-primary/30", "bg-cookbook-primary/60", "bg-cookbook-primary"];

  return (
    <section className="rounded-3xl p-5 border border-cookbook-border bg-cookbook-bg/85 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between mb-3">
        <p className="font-sans text-[11px] uppercase tracking-[0.2em] font-bold text-cookbook-text/70">Últimas 12 semanas</p>
        <p className="font-sans text-[11px] font-bold text-cookbook-primary">{activeDays} {activeDays === 1 ? "dia" : "dias"} guardando</p>
      </div>
      <div className="flex gap-1 justify-between">
        {columns.map((col, i) => (
          <div key={i} className="flex flex-col gap-1">
            {col.map((cell) => (
              <div
                key={cell.key}
                title={cell.key}
                className={`w-[18px] h-[18px] sm:w-5 sm:h-5 rounded-[5px] ${cell.future ? "opacity-0" : shades[level(cell.value)]}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-1 mt-3">
        <span className="font-sans text-[11px] text-cookbook-text/70 mr-1">menos</span>
        {shades.map((s) => (
          <span key={s} className={`w-3 h-3 rounded-[3px] ${s}`} />
        ))}
        <span className="font-sans text-[11px] text-cookbook-text/70 ml-1">mais</span>
      </div>
    </section>
  );
};
