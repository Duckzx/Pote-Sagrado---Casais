import React, { useMemo } from "react";
import { CalendarHeart, Heart } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Same day-of-month, clamped to the month length (e.g. 31 -> 30/28). */
function dateInMonth(year: number, month: number, day: number) {
  const last = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(day, last));
}

function computeDates(startIso: string) {
  const start = new Date(`${startIso}T00:00:00`);
  if (isNaN(start.getTime())) return null;
  const today = startOfToday();
  if (start > today) return null;

  // Next month-anniversary
  let next = dateInMonth(today.getFullYear(), today.getMonth(), start.getDate());
  if (next < today || next.getTime() === start.getTime()) {
    next = dateInMonth(today.getFullYear(), today.getMonth() + 1, start.getDate());
  }
  const monthsTogether =
    (next.getFullYear() - start.getFullYear()) * 12 + (next.getMonth() - start.getMonth());

  // Next yearly anniversary
  let nextYear = dateInMonth(today.getFullYear(), start.getMonth(), start.getDate());
  if (nextYear < today || nextYear.getTime() === start.getTime()) {
    nextYear = dateInMonth(today.getFullYear() + 1, start.getMonth(), start.getDate());
  }
  const years = nextYear.getFullYear() - start.getFullYear();

  return {
    daysToMonth: Math.round((next.getTime() - today.getTime()) / DAY_MS),
    monthsTogether,
    nextMonth: next,
    daysToYear: Math.round((nextYear.getTime() - today.getTime()) / DAY_MS),
    years,
    nextYear,
  };
}

const fmt = (d: Date) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "");

/**
 * "Mêsversário" countdown, built from the relationship start date that the
 * couple sets in Configurações.
 */
export const AnniversaryCountdown: React.FC = () => {
  const startDate = useAppStore((s) => s.tripConfig?.relationshipStartDate || "");
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const info = useMemo(() => (startDate ? computeDates(startDate) : null), [startDate]);

  if (!info) {
    return (
      <button
        onClick={() => setActiveTab("config")}
        className="w-full text-left bg-cookbook-bg/80 backdrop-blur-2xl border border-dashed border-cookbook-primary/30 rounded-3xl p-5 flex items-center gap-4 transition-all active:scale-[0.98] hover:border-cookbook-primary/60"
      >
        <div className="w-11 h-11 rounded-full bg-cookbook-primary/10 text-cookbook-primary flex items-center justify-center shrink-0">
          <CalendarHeart size={18} />
        </div>
        <div>
          <p className="font-serif text-lg text-cookbook-text leading-tight">Quando tudo começou?</p>
          <p className="font-sans text-[10px] uppercase tracking-widest text-cookbook-text/40 font-bold mt-1">
            Adicione a data e ganhe a contagem do mêsversário
          </p>
        </div>
      </button>
    );
  }

  const isToday = info.daysToMonth === 0;
  const isAnniversaryToday = info.daysToYear === 0;

  return (
    <section className="relative overflow-hidden rounded-3xl p-5 border border-cookbook-primary/20 shadow-[0_8px_30px_rgb(0,0,0,0.05)] bg-gradient-to-br from-cookbook-primary/[0.12] via-cookbook-bg to-cookbook-gold/[0.12]">
      <Heart
        size={96}
        fill="currentColor"
        className="absolute -right-5 -top-5 text-cookbook-primary opacity-[0.08] rotate-12 pointer-events-none"
      />
      <h3 className="font-sans tracking-[0.2em] uppercase text-[10px] font-bold text-cookbook-text/50 mb-3">
        Mêsversário
      </h3>

      {isAnniversaryToday ? (
        <p className="font-serif text-3xl text-cookbook-text leading-tight">
          Hoje fazem <span className="italic text-cookbook-primary">{info.years} {info.years === 1 ? "ano" : "anos"}</span> 🥂
        </p>
      ) : isToday ? (
        <p className="font-serif text-3xl text-cookbook-text leading-tight">
          Feliz <span className="italic text-cookbook-primary">{info.monthsTogether}º</span> mêsversário 💐
        </p>
      ) : (
        <div className="flex items-end gap-3">
          <span className="font-serif text-6xl leading-none text-cookbook-primary">{info.daysToMonth}</span>
          <div className="pb-1">
            <p className="font-serif text-lg text-cookbook-text leading-tight">
              {info.daysToMonth === 1 ? "dia" : "dias"} para o {info.monthsTogether}º mês
            </p>
            <p className="font-sans text-[10px] uppercase tracking-widest text-cookbook-text/40 font-bold">
              {fmt(info.nextMonth)}
            </p>
          </div>
        </div>
      )}

      {!isAnniversaryToday && (
        <div className="mt-4 pt-3 border-t border-cookbook-primary/10 flex items-center justify-between">
          <span className="font-sans text-xs text-cookbook-text/60">
            {info.years}º aniversário de namoro
          </span>
          <span className="font-sans text-xs font-bold text-cookbook-text/80">
            em {info.daysToYear} {info.daysToYear === 1 ? "dia" : "dias"}
          </span>
        </div>
      )}
    </section>
  );
};
