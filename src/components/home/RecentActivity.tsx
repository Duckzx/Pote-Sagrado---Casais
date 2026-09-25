import React, { useMemo } from "react";
import { useAppStore } from "../../store/useAppStore";
import { AnimatedList } from "../magicui/animated-list";

const brl = (v: number) => Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

function timeAgo(date: Date | null) {
  if (!date) return "agora";
  const mins = Math.round((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins} min`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.round(hours / 24);
  return days === 1 ? "ontem" : `${days} dias`;
}

/**
 * Latest movements of the pot as a notification-style animated feed
 * (Magic UI AnimatedList). Real-time: new deposits from others pop in.
 */
export const RecentActivity: React.FC = () => {
  const deposits = useAppStore((s) => s.deposits);
  const user = useAppStore((s) => s.user);
  const mode = useAppStore((s) => s.mode);

  const items = useMemo(
    () =>
      deposits
        .filter((d) => !d.isXpBonus)
        .slice(0, 5)
        .reverse(), // AnimatedList shows the last child on top
    [deposits],
  );

  if (items.length === 0) return null;

  return (
    <section>
      <h3 className="font-sans tracking-[0.2em] uppercase text-[10px] font-bold text-cookbook-text/50 mb-3 px-1">
        Atividade recente
      </h3>
      <AnimatedList delay={450} className="gap-2">
        {items.map((d) => {
          const isExpense = d.type === "expense";
          const isMe = d.who === user?.uid;
          const date = d.createdAt && "toDate" in d.createdAt ? d.createdAt.toDate() : null;
          const name = isMe ? "Você" : (d.whoName || "Alguém").split(" ")[0];
          return (
            <div
              key={d.id}
              className="w-full flex items-center gap-3 rounded-2xl p-3 bg-cookbook-bg/85 backdrop-blur-xl border border-cookbook-border shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
            >
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0 ${
                  isExpense ? "bg-red-500/10" : "bg-emerald-500/10"
                }`}
              >
                {isExpense ? "💸" : "🪙"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-sans text-sm text-cookbook-text truncate">
                  <span className="font-bold">{mode === "solo" ? "" : `${name} · `}</span>
                  {d.action || (isExpense ? "Gasto" : "Depósito")}
                </p>
                <p className="font-sans text-[10px] text-cookbook-text/40">{timeAgo(date)}</p>
              </div>
              <span className={`font-sans text-sm font-bold tabular-nums ${isExpense ? "text-red-500" : "text-emerald-600"}`}>
                {isExpense ? "-" : "+"}
                {brl(Number(d.amount) || 0)}
              </span>
            </div>
          );
        })}
      </AnimatedList>
    </section>
  );
};
