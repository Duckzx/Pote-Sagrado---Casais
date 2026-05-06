import React from "react";
import { Target, Swords, Settings, Pin, LayoutGrid, FileText } from "lucide-react";
import { cn } from "../lib/utils";
import { motion } from "motion/react";
import { useAppContext } from "../context/AppContext";

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
  const { tripConfig } = useAppContext();
  const mods = tripConfig?.activeModules || {};

  const allTabs = [
    { id: "mural", icon: LayoutGrid, label: "Feed", active: mods.feed !== false },
    { id: "missoes", icon: Target, label: "Conquistas", active: mods.missoes !== false },
    { id: "extrato", icon: FileText, label: "Extrato", active: mods.extrato !== false },
    { id: "disputa", icon: Swords, label: "Duelo", active: mods.disputa !== false },
  ].filter(t => t.active);

  // Split into left and right, leaving config always on the right
  const leftCount = Math.ceil(allTabs.length / 2);
  const tabsLeft = allTabs.slice(0, leftCount);
  const tabsRight = [...allTabs.slice(leftCount), { id: "config", icon: Settings, label: "Ajustes", active: true }];

  const totalTabs = tabsLeft.length + tabsRight.length;
  // Make the bottom nav slightly wider if there are many tabs, and adjust icon bounds
  const maxWidthClass = totalTabs >= 5 ? "max-w-[400px]" : "max-w-[360px]";
  const iconSizeClass = totalTabs >= 5 ? "w-10 h-10" : "w-12 h-12";
  const iconPixelSize = totalTabs >= 5 ? 18 : 20;

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center w-full px-2 md:px-4 pointer-events-none pb-safe">
      <div className={cn("bg-cookbook-bg/85 backdrop-blur-xl text-cookbook-text/60 rounded-3xl h-16 flex items-center w-full px-2 shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-cookbook-border/50 pointer-events-auto relative", maxWidthClass)}>
        
        {/* Left Tabs */}
        <div className="flex flex-1 justify-around h-full items-center">
          {tabsLeft.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex flex-col items-center justify-center rounded-full transition-all duration-400 ease-out z-10",
                  iconSizeClass,
                  isActive
                    ? "text-cookbook-primary"
                    : "hover:text-cookbook-text active:scale-95",
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-cookbook-text/5 rounded-full"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                )}
                <Icon
                  size={iconPixelSize}
                  strokeWidth={isActive ? 2.5 : 2}
                  className="relative z-10"
                />
              </button>
            );
          })}
        </div>
        
        {/* Espaçador central travado no meio */}
        <div className="w-16 shrink-0" />

        {/* Center Prominent Home Button (Absolute exactly in middle) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center z-20">
          <button
            onClick={() => setActiveTab("home")}
            className={cn(
               "absolute -top-12 flex flex-col items-center justify-center w-16 h-16 rounded-full shadow-[0_8px_20px_rgba(40,129,156,0.3)] border-4 border-cookbook-bg transition-transform duration-300 z-20",
              activeTab === "home"
                ? "bg-cookbook-primary scale-105"
                : "bg-cookbook-primary/90 hover:bg-cookbook-primary hover:scale-105 active:scale-95",
            )}
          >
            <SacredPotIcon
              size={24}
              strokeWidth={activeTab === "home" ? 2.5 : 2}
              className={cn(
                "transition-colors",
                activeTab === "home" ? "text-cookbook-gold" : "text-white",
              )}
            />
          </button>
        </div>
        
        {/* Right Tabs */}
        <div className="flex flex-1 justify-around h-full items-center">
          {tabsRight.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex flex-col items-center justify-center rounded-full transition-all duration-400 ease-out z-10",
                  iconSizeClass,
                  isActive
                    ? "text-cookbook-primary"
                    : "hover:text-cookbook-text active:scale-95",
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-cookbook-text/5 rounded-full"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                )}
                <Icon
                  size={iconPixelSize}
                  strokeWidth={isActive ? 2.5 : 2}
                  className="relative z-10"
                />
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
