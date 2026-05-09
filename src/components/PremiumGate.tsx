import React from "react";
import { Lock, Crown } from "lucide-react";
import { useAppStore } from "../store/useAppStore";

interface PremiumGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onOpenPremium: () => void;
  className?: string;
}

export const PremiumGate: React.FC<PremiumGateProps> = ({ 
  children, 
  fallback, 
  onOpenPremium,
  className = ""
}) => {
  const isPremium = useAppStore((s) => s.isPremium);

  if (isPremium) {
    return <>{children}</>;
  }

  if (fallback) {
    return (
      <div className={`relative group cursor-pointer ${className}`} onClick={onOpenPremium}>
        <div className="opacity-40 grayscale-[0.5] pointer-events-none blur-[1px]">
          {fallback}
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/5 rounded-2xl group-hover:bg-black/10 transition-colors">
          <div className="bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-white/50 animate-bounce">
            <Lock size={24} className="text-amber-500" />
          </div>
          <div className="mt-2 bg-amber-500 text-white font-sans text-[9px] uppercase tracking-widest font-black px-3 py-1 rounded-full shadow-lg">
            Liberar Pro
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {children}
      <div 
        className="absolute inset-0 bg-white/10 backdrop-blur-[2px] flex flex-col items-center justify-center cursor-pointer transition-all hover:backdrop-blur-[4px] hover:bg-white/20"
        onClick={onOpenPremium}
      >
        <div className="bg-amber-500 text-white p-3 rounded-2xl shadow-xl animate-float">
          <Crown size={24} />
        </div>
        <p className="mt-3 font-sans text-[10px] uppercase tracking-[0.2em] font-black text-amber-600 bg-white/80 px-4 py-2 rounded-full shadow-sm border border-amber-200">
          Disponível no Premium
        </p>
      </div>
    </div>
  );
};
