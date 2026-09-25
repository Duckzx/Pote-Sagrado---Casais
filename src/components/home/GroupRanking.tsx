import React from "react";
import { motion } from "motion/react";
import { Crown } from "lucide-react";
import { BorderBeam } from "../magicui/border-beam";

interface RankEntry {
  name: string;
  total: number;
  count: number;
}

const brl = (v: number) => Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
const MEDALS = ["🥇", "🥈", "🥉"];

/** Monthly contribution ranking for group pots: podium + list. */
export const GroupRanking: React.FC<{ ranking: RankEntry[] }> = ({ ranking }) => {
  const max = Math.max(1, ...ranking.map((r) => r.total));
  const leader = ranking[0];

  return (
    <div className="relative bg-cookbook-bg/80 backdrop-blur-3xl border border-cookbook-border rounded-[2rem] p-6 shadow-2xl overflow-hidden">
      {leader && leader.total > 0 && (
        <div className="text-center mb-6">
          <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-cookbook-gold/40 to-cookbook-primary/30 border-2 border-cookbook-gold/60">
            <Crown size={20} className="absolute -top-4 text-cookbook-gold" fill="currentColor" />
            <span className="font-serif text-3xl text-cookbook-text">{leader.name.charAt(0).toUpperCase()}</span>
          </div>
          <p className="font-serif text-2xl text-cookbook-text mt-2">{leader.name}</p>
          <p className="font-sans text-[10px] uppercase tracking-widest font-bold text-cookbook-primary">
            lidera com {brl(leader.total)}
          </p>
        </div>
      )}

      <ol className="space-y-3">
        {ranking.map((r, i) => (
          <li key={`${r.name}-${i}`} className="flex items-center gap-3">
            <span className="w-7 text-center text-lg">{MEDALS[i] || <span className="font-sans text-xs font-bold text-cookbook-text/40">{i + 1}º</span>}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-sans text-sm font-bold text-cookbook-text truncate">{r.name}</span>
                <span className="font-sans text-xs font-bold tabular-nums text-cookbook-text/70">{brl(r.total)}</span>
              </div>
              <div className="h-2 mt-1.5 rounded-full bg-cookbook-border/50 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(3, (Math.max(0, r.total) / max) * 100)}%` }}
                  transition={{ duration: 0.9, delay: 0.1 * i, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-cookbook-primary to-cookbook-gold"
                />
              </div>
            </div>
          </li>
        ))}
      </ol>

      {ranking.length === 0 && (
        <p className="font-serif italic text-center text-cookbook-text/40 py-6">Convide a turma para começar o ranking</p>
      )}
      <BorderBeam size={120} duration={8} colorFrom="var(--theme-gold)" colorTo="var(--theme-primary)" />
    </div>
  );
};
