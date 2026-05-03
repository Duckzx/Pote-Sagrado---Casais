import React from "react";
import { Target, Swords, Settings, Pin, LayoutGrid } from "lucide-react";
import { cn } from "../lib/utils";
import { motion } from "motion/react";
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
      {/* Tampa do Pote (Lid) - Narrower than body */} */{" "}
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
export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
}) => {
  /* Reduced to 5 focused items, removing Extrato since it mixes with Home's Diário de Bordo. Focus is now balanced around a prominent center. */ const tabsLeft =
    [
      { id: "mural", icon: LayoutGrid, label: "Feed" },
      { id: "missoes", icon: Target, label: "Conquistas" },
    ];
  const tabsRight = [
    { id: "disputa", icon: Swords, label: "Duelo" },
    { id: "config", icon: Settings, label: "Config" },
  ];
  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center w-full px-4 pointer-events-none pb-safe">
      {" "}
      <div className="bg-cookbook-bg/85 backdrop-blur-xl text-cookbook-text/60 rounded-3xl px-2 h-16 flex items-center justify-between w-full max-w-[360px] shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-cookbook-border/50 pointer-events-auto relative">
        {" "}
        {/* Left Tabs */}{" "}
        <div className="flex gap-1 w-[40%] justify-around">
          {" "}
          {tabsLeft.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-400 ease-out",
                  isActive
                    ? "text-cookbook-primary"
                    : "hover:text-cookbook-text active:scale-95",
                )}
              >
                {" "}
                {isActive && (
                  <motion.div
                    layoutId="nav-pill-left"
                    className="absolute inset-0 bg-cookbook-primary/10 rounded-full"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                )}{" "}
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 2}
                  className="relative z-10"
                />{" "}
              </button>
            );
          })}{" "}
        </div>{" "}
        {/* Center Prominent Home Button */}{" "}
        <div className="w-[20%] flex justify-center relative">
          {" "}
          <button
            onClick={() => setActiveTab("home")}
            className={cn(
              "absolute -top-12 flex flex-col items-center justify-center w-16 h-16 rounded-full shadow-[0_8px_20px_rgba(40,129,156,0.3)] border-4 border-cookbook-bg transition-transform duration-300 z-20",
              activeTab === "home"
                ? "bg-cookbook-primary scale-105"
                : "bg-cookbook-primary/90 hover:bg-cookbook-primary hover:scale-105 active:scale-95",
            )}
          >
            {" "}
            <SacredPotIcon
              size={24}
              strokeWidth={activeTab === "home" ? 2.5 : 2}
              className={cn(
                "transition-colors",
                activeTab === "home" ? "text-cookbook-gold" : "text-white",
              )}
            />{" "}
          </button>{" "}
        </div>{" "}
        {/* Right Tabs */}{" "}
        <div className="flex gap-1 w-[40%] justify-around">
          {" "}
          {tabsRight.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-400 ease-out",
                  isActive
                    ? "text-cookbook-primary"
                    : "hover:text-cookbook-text active:scale-95",
                )}
              >
                {" "}
                {isActive && (
                  <motion.div
                    layoutId="nav-pill-right"
                    className="absolute inset-0 bg-cookbook-primary/10 rounded-full"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                )}{" "}
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 2}
                  className="relative z-10"
                />{" "}
              </button>
            );
          })}{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};
