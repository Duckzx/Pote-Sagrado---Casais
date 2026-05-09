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

  return (
    <div className={`relative group cursor-pointer ${className}`} onClick={onOpenPremium}>
      <div className="opacity-40 grayscale pointer-events-none blur-[2px] transition-all group-hover:blur-[3px]">
        {fallback || children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="w-12 h-12 bg-white/40 backdrop-blur-xl rounded-full flex items-center justify-center shadow-2xl border border-white/40 group-hover:scale-110 transition-transform duration-500">
          <Crown size={20} className="text-amber-600 drop-shadow-sm" fill="white" />
        </div>
        <div className="mt-4 overflow-hidden rounded-full shadow-lg shadow-amber-500/20">
           <div className="bg-amber-500 text-white font-sans text-[8px] uppercase tracking-[0.2em] font-bold px-4 py-2 premium-shimmer-button">
              Premium
           </div>
        </div>
      </div>
    </div>
  );
};
