import React, { useMemo, useState } from "react";
import { CalendarClock } from "lucide-react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useAppStore } from "../../store/useAppStore";
import { computePlan } from "../../lib/progress";
import { handleFirestoreError, OperationType } from "../../lib/firestore-errors";

const brl = (v: number) => Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
const fmtDate = (d: Date) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).replace(".", "");
const inputDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/**
 * "Plano até a data": how much to save per week/day to reach the goal on the
 * chosen date, and when it's reached at the current pace.
 */
export const GoalPlanCard: React.FC = () => {
  const casalId = useAppStore((s) => s.casalId);
  const deposits = useAppStore((s) => s.deposits);
  const totalSaved = useAppStore((s) => s.totalSaved);
  const goalAmount = useAppStore((s) => s.tripConfig?.goalAmount || 0);
  const targetDate = useAppStore((s) => s.tripConfig?.targetDate || "");
  const setTripConfig = useAppStore((s) => s.setTripConfig);
  const mode = useAppStore((s) => s.mode);
  const arrive = mode === "solo" ? "você chega" : mode === "grupo" ? "a turma chega" : "vocês chegam";
  const [editing, setEditing] = useState(false);

  const plan = useMemo(
    () => computePlan(deposits, totalSaved, goalAmount, targetDate),
    [deposits, totalSaved, goalAmount, targetDate],
  );

  if (!(goalAmount > 0)) return null;

  const saveDate = async (value: string) => {
    if (!casalId) return;
    setTripConfig((prev) => (prev ? { ...prev, targetDate: value } : prev));
    setEditing(false);
    try {
      await setDoc(doc(db, `casais/${casalId}/trip_config`, "main"), { targetDate: value }, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `casais/${casalId}/trip_config`);
    }
  };

  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

  if (!plan || editing) {
    return (
      <section className="rounded-3xl p-5 border border-dashed border-cookbook-primary/30 bg-cookbook-bg/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cookbook-primary/10 text-cookbook-primary flex items-center justify-center">
            <CalendarClock size={18} />
          </div>
          <div className="flex-1">
            <p className="font-serif text-xl text-cookbook-text leading-tight">Até quando?</p>
            <p className="font-sans text-[11px] text-cookbook-text/55">Escolha a data e veja quanto guardar por semana.</p>
          </div>
        </div>
        <input
          type="date"
          min={inputDate(tomorrow)}
          defaultValue={targetDate}
          onChange={(e) => e.target.value && saveDate(e.target.value)}
          className="mt-4 w-full bg-cookbook-bg border border-cookbook-border rounded-2xl px-4 py-3 font-sans text-base text-cookbook-text focus:outline-none focus:border-cookbook-primary"
          aria-label="Data para alcançar a meta"
        />
      </section>
    );
  }

  const reached = plan.remaining === 0;
  const expired = !reached && plan.daysLeft === 0;

  return (
    <section className="rounded-3xl p-5 border border-cookbook-border bg-cookbook-bg/85 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between">
        <p className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold text-cookbook-text/50">Plano até a data</p>
        <button onClick={() => setEditing(true)} className="font-sans text-[10px] uppercase tracking-widest font-bold text-cookbook-primary">
          {fmtDate(new Date(`${targetDate}T12:00:00`))}
        </button>
      </div>

      {reached ? (
        <p className="font-serif text-2xl text-cookbook-text mt-2">Meta alcançada! 🎉</p>
      ) : expired ? (
        <p className="font-serif text-xl text-cookbook-text mt-2">A data chegou. Que tal escolher uma nova? 💪</p>
      ) : (
        <>
          <div className="flex items-end gap-2 mt-2">
            <span className="font-serif text-4xl text-cookbook-primary leading-none">{brl(plan.perWeek)}</span>
            <span className="font-sans text-xs text-cookbook-text/60 pb-1">por semana</span>
          </div>
          <p className="font-sans text-xs text-cookbook-text/60 mt-1">
            ≈ {brl(plan.perDay)} por dia · faltam {brl(plan.remaining)} em {plan.daysLeft} {plan.daysLeft === 1 ? "dia" : "dias"}
          </p>
          <div
            className={`mt-3 rounded-2xl px-3 py-2.5 font-sans text-xs leading-snug ${
              plan.onTrack ? "bg-emerald-500/10 text-emerald-700" : "bg-amber-500/10 text-amber-800"
            }`}
          >
            {plan.etaAtCurrentPace
              ? plan.onTrack
                ? `No ritmo atual (${brl(plan.currentWeeklyPace)}/semana) ${arrive} em ${fmtDate(plan.etaAtCurrentPace)}. Dentro do prazo! 🙌`
                : `No ritmo atual (${brl(plan.currentWeeklyPace)}/semana) a meta chega só em ${fmtDate(plan.etaAtCurrentPace)}. Bora acelerar!`
              : "Ainda sem depósitos nos últimos 30 dias. O primeiro passo conta muito!"}
          </div>
        </>
      )}
    </section>
  );
};
