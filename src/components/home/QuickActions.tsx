import React from "react";
import { ReceiptText, Swords, Trophy, Target, Heart, Pin } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { TabId } from "../../types";
import { BlurFade } from "../magicui/blur-fade";

interface Action {
  tab: TabId;
  label: string;
  hint: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  tint: string;
}

/** Bento grid of shortcuts, adapted to the pot mode. */
export const QuickActions: React.FC = () => {
  const mode = useAppStore((s) => s.mode);
  const setActiveTab = useAppStore((s) => s.setActiveTab);

  const actions: Action[] = [
    { tab: "extrato", label: "Extrato", hint: "Entradas e saídas", icon: ReceiptText, tint: "from-emerald-400/20" },
    { tab: "missoes", label: "Missões", hint: "Economias e desafios", icon: Target, tint: "from-amber-400/20" },
  ];
  if (mode === "casal") {
    actions.push(
      { tab: "disputa", label: "Duelo do mês", hint: "Quem guarda mais?", icon: Swords, tint: "from-rose-400/25" },
      { tab: "lovecards", label: "Cartas", hint: "Perguntas a dois", icon: Heart, tint: "from-pink-400/25" },
    );
  } else if (mode === "grupo") {
    actions.push(
      { tab: "disputa", label: "Ranking", hint: "Quem mais contribuiu", icon: Trophy, tint: "from-violet-400/25" },
      { tab: "mural", label: "Mural", hint: "Fotos e planos", icon: Pin, tint: "from-fuchsia-400/20" },
    );
  } else {
    actions.push({ tab: "mural", label: "Mural", hint: "Sonhos e memórias", icon: Pin, tint: "from-rose-400/20" });
  }

  return (
    <section>
      <h3 className="font-sans tracking-[0.2em] uppercase text-[10px] font-bold text-cookbook-text/50 mb-3 px-1">
        Atalhos
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((a, i) => {
          const Icon = a.icon;
          const wide = actions.length % 2 === 1 && i === actions.length - 1;
          return (
            <BlurFade key={a.tab} delay={0.05 * i} inView className={wide ? "col-span-2" : ""}>
              <button
                onClick={() => setActiveTab(a.tab)}
                className={`relative w-full overflow-hidden text-left rounded-3xl p-4 border border-cookbook-border bg-cookbook-bg/80 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] active:scale-[0.97] transition-transform`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${a.tint} to-transparent pointer-events-none`} />
                <div className="relative">
                  <div className="w-9 h-9 rounded-2xl bg-cookbook-bg/80 border border-cookbook-border/60 flex items-center justify-center text-cookbook-primary mb-3">
                    <Icon size={16} />
                  </div>
                  <p className="font-serif text-lg text-cookbook-text leading-tight">{a.label}</p>
                  <p className="font-sans text-[10px] text-cookbook-text/50 mt-0.5">{a.hint}</p>
                </div>
              </button>
            </BlurFade>
          );
        })}
      </div>
    </section>
  );
};
