import React from "react";
import { Target, Settings, LayoutGrid, Heart, Trophy, ReceiptText } from "lucide-react";
import { cn } from "../lib/utils";
import { motion } from "motion/react";
import { useAppStore } from "../store/useAppStore";
import { PoteMode, TabId } from "../types";

/* Custom SVG matching the theme format, designed to perfectly resemble the animated Safe Pot */ const SacredPotIcon =
  ({ size = 24, strokeWidth = 2, className = "" }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {" "}
      {/* Tampa do Pote (Lid) - Narrower than body */}{" "}
      <path d="M8 2h8a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" />{" "}
      {/* Detalhe de amarrilho da tampa opcional */}{" "}
      <path d="M7 8h10" strokeOpacity={0.7} />{" "}
      {/* Corpo do Pote (Body) - Curves expanding outwards to mimic a real glass jar */}{" "}
      <path d="M9 6v2C9 10 4 11 4 13v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6c0-2-5-3-5-5V6" />{" "}
      {/* Marca do Líquido/Moedas (Fill line) */}{" "}
      <path d="M4.5 15h15" strokeDasharray="3 3" strokeOpacity={0.6} />{" "}
    </svg>
  );
interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

type NavTab = { id: TabId; icon: React.ComponentType<any>; label: string };

const MURAL: NavTab = { id: "mural", icon: LayoutGrid, label: "Mural" };
const MISSOES: NavTab = { id: "missoes", icon: Target, label: "Missões" };
const AJUSTES: NavTab = { id: "config", icon: Settings, label: "Ajustes" };

/** Four side tabs around the central pot button, per usage mode. */
const NAV_BY_MODE: Record<PoteMode, NavTab[]> = {
  casal: [MURAL, MISSOES, { id: "lovecards", icon: Heart, label: "Cartas" }, AJUSTES],
  grupo: [MURAL, MISSOES, { id: "disputa", icon: Trophy, label: "Ranking" }, AJUSTES],
  solo: [MURAL, MISSOES, { id: "extrato", icon: ReceiptText, label: "Extrato" }, AJUSTES],
};

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const hasUnreadNotifications = useAppStore(s => s.hasUnreadNotifications);
  const mode = useAppStore(s => s.mode);
  const tabs = NAV_BY_MODE[mode];
  const displayTabs: (NavTab | "home")[] = [tabs[0], tabs[1], "home", tabs[2], tabs[3]];

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed left-0 right-0 z-50 flex justify-center w-full px-3 pointer-events-none bottom-[max(0.75rem,env(safe-area-inset-bottom))] md:top-0 md:bottom-0 md:w-24 md:h-[100dvh] md:px-0 md:flex-col md:justify-center md:items-center"
    >
      <div className="bg-cookbook-bg/85 backdrop-blur-xl text-cookbook-text/55 rounded-[28px] h-[68px] flex items-center justify-around w-full max-w-[400px] px-1 shadow-[0_20px_40px_rgba(0,0,0,0.12)] border border-cookbook-border/60 pointer-events-auto md:h-full md:max-w-none md:flex-col md:justify-center md:gap-3 md:rounded-none md:border-r md:border-y-0 md:border-l-0 md:shadow-none md:py-8">
        {displayTabs.map((tab) => {
          if (tab === "home") {
            const isHome = activeTab === "home";
            return (
              <div key="home" className="relative flex items-center justify-center w-16 shrink-0 md:h-16 md:my-4">
                <button
                  onClick={() => setActiveTab("home")}
                  aria-label="Início"
                  aria-current={isHome ? "page" : undefined}
                  className={cn(
                    "absolute -top-11 md:static flex items-center justify-center w-16 h-16 rounded-full shadow-[0_10px_24px_color-mix(in_srgb,var(--theme-primary)_45%,transparent)] border-4 border-cookbook-bg transition-transform duration-300 z-20",
                    isHome ? "bg-cookbook-primary scale-105" : "bg-cookbook-primary/90 active:scale-95",
                  )}
                >
                  <SacredPotIcon
                    size={24}
                    strokeWidth={isHome ? 2.5 : 2}
                    className={cn("transition-colors", isHome ? "text-cookbook-gold" : "text-white")}
                  />
                </button>
              </div>
            );
          }

          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 w-16 h-14 rounded-2xl transition-colors z-10",
                isActive ? "text-cookbook-primary" : "active:scale-95",
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-cookbook-primary/10 rounded-2xl"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                />
              )}
              <Icon size={20} strokeWidth={isActive ? 2.4 : 1.9} className="relative z-10" />
              <span className={cn("relative z-10 font-sans text-[10px] leading-none", isActive ? "font-bold" : "font-medium")}>
                {tab.label}
              </span>
              {tab.id === "lovecards" && hasUnreadNotifications && (
                <span className="absolute top-1.5 right-3 w-2 h-2 bg-red-500 rounded-full border border-white z-20" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
