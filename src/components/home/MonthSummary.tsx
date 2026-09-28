import React, { useMemo } from "react";
import { AppIcon } from "../ui/app-icon";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { toDate } from "../../lib/progress";

const brl = (v: number) => Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

interface MonthStats {
  net: number;
  income: number;
  count: number;
  biggest: { amount: number; action: string } | null;
  byPerson: Record<string, { name: string; total: number }>;
}

function statsFor(deposits: any[], year: number, month: number): MonthStats {
  const s: MonthStats = { net: 0, income: 0, count: 0, biggest: null, byPerson: {} };
  deposits.forEach((d) => {
    const date = toDate(d.createdAt);
    if (!date || date.getFullYear() !== year || date.getMonth() !== month || d.isXpBonus) return;
    const amount = Number(d.amount) || 0;
    if (d.type === "expense") {
      s.net -= amount;
      return;
    }
    s.net += amount;
    s.income += amount;
    s.count++;
    if (!s.biggest || amount > s.biggest.amount) s.biggest = { amount, action: d.action || "Depósito" };
    const key = d.who || "?";
    if (!s.byPerson[key]) s.byPerson[key] = { name: (d.whoName || "Alguém").split(" ")[0], total: 0 };
    s.byPerson[key].total += amount;
  });
  return s;
}

/** This month's savings compared with last month, plus highlights. */
export const MonthSummary: React.FC = () => {
  const deposits = useAppStore((s) => s.deposits);
  const mode = useAppStore((s) => s.mode);
  const user = useAppStore((s) => s.user);

  const { current, previous, monthName } = useMemo(() => {
    const now = new Date();
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return {
      current: statsFor(deposits, now.getFullYear(), now.getMonth()),
      previous: statsFor(deposits, prev.getFullYear(), prev.getMonth()),
      monthName: now.toLocaleDateString("pt-BR", { month: "long" }),
    };
  }, [deposits]);

  if (current.count === 0 && previous.count === 0) return null;

  const diff = previous.net !== 0 ? ((current.net - previous.net) / Math.abs(previous.net)) * 100 : null;
  const up = diff === null ? current.net >= 0 : diff >= 0;
  const top = Object.entries(current.byPerson).sort((a, b) => b[1].total - a[1].total)[0];
  const topName = top ? (top[0] === user?.uid ? "Você" : top[1].name) : null;

  return (
    <section className="rounded-3xl p-5 border border-cookbook-border bg-cookbook-bg/85 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
      <p className="font-sans text-[11px] uppercase tracking-[0.2em] font-bold text-cookbook-text/70">
        Resumo de {monthName}
      </p>
      <div className="flex items-end justify-between gap-3 mt-2">
        <span data-money className="font-serif text-4xl text-cookbook-text leading-none">
          {brl(current.net)}
        </span>
        {diff !== null && (
          <span
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-sans text-[11px] font-bold ${
              up ? "bg-emerald-500/10 text-emerald-700" : "bg-red-500/10 text-red-600"
            }`}
          >
            {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {up ? "+" : ""}
            {Math.round(diff)}% vs mês passado
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4">
        <div className="rounded-2xl bg-cookbook-text/[0.04] p-3">
          <p className="font-serif text-xl text-cookbook-text leading-none">{current.count}</p>
          <p className="font-sans text-[11px] text-cookbook-text/70 mt-1">depósitos</p>
        </div>
        <div className="rounded-2xl bg-cookbook-text/[0.04] p-3 col-span-2 min-w-0">
          <p data-money className="font-serif text-xl text-cookbook-text leading-none">
            {current.biggest ? brl(current.biggest.amount) : "—"}
          </p>
          <p className="font-sans text-[11px] text-cookbook-text/70 mt-1 truncate">
            maior: {current.biggest?.action || "ainda nada"}
          </p>
        </div>
      </div>

      {mode !== "solo" && topName && (
        <p className="font-sans text-xs text-cookbook-text/70 mt-3 flex items-center gap-1.5">
          <AppIcon name="trophy" size={16} weight="fill" className="text-cookbook-gold shrink-0" /> <span className="font-bold text-cookbook-text">{topName}</span> é quem mais guardou este mês
        </p>
      )}
    </section>
  );
};
