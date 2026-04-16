import React from 'react';
import { Home, Grid, Swords, Settings, Receipt } from 'lucide-react';
import { cn } from '../lib/utils';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Diário' },
    { id: 'bingo', icon: Grid, label: 'Bingo' },
    { id: 'gastos', icon: Receipt, label: 'Gastos' },
    { id: 'disputa', icon: Swords, label: 'Batalha' },
    { id: 'config', icon: Settings, label: 'Ajustes' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-cookbook-bg/90 backdrop-blur-md border-t border-cookbook-border pb-safe">
      <div className="flex justify-around items-center h-20 max-w-md mx-auto px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center w-14 h-full space-y-1.5 transition-opacity text-cookbook-text",
                isActive ? "opacity-100" : "opacity-40 hover:opacity-60"
              )}
            >
              <div className="w-6 h-6 border border-current rounded flex items-center justify-center">
                <Icon size={14} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[9px] font-sans uppercase tracking-widest font-bold">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
