import React, { useState, useEffect } from "react";
import { Shield, Check, FileText } from "lucide-react";

export const ConsentBanner: React.FC = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("lgpd_consent");
    if (!consent) {
      // Small delay so it animates in
      setTimeout(() => setShow(true), 1500);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("lgpd_consent", "all");
    setShow(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem("lgpd_consent", "essential");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[100] pb-20 sm:pb-6 px-4 md:px-0">
      <div className="bg-[#1A1A1C] border border-white/10 rounded-2xl mx-auto max-w-xl p-5 shadow-2xl animate-fade-in-up text-white flex flex-col md:flex-row gap-4 md:items-center">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="text-cookbook-primary" size={16} />
            <h4 className="font-serif italic text-sm font-bold text-cookbook-primary">
              Privacidade e Cookies
            </h4>
          </div>
          <p className="font-sans text-xs text-white/70 leading-relaxed mb-4 md:mb-0">
            Nós usamos cookies essenciais para o funcionamento pilar do portal. Clicando em concordar, 
            você aceita nossas <button onClick={() => window.dispatchEvent(new CustomEvent('open-legal', { detail: 'privacidade' }))} className="underline text-white/90">Políticas de Privacidade</button> 
            (LGPD) de rastreio de navegação com dados anonimizados para aprimorar a sua experiência.
          </p>
        </div>
        <div className="flex justify-end gap-2 shrink-0 self-end md:self-center">
          <button
            onClick={handleAcceptEssential}
            className="px-4 py-2 text-[11px] font-sans font-bold uppercase tracking-wider bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
          >
            Apenas Essenciais
          </button>
          <button
            onClick={handleAcceptAll}
            className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-sans font-bold uppercase tracking-wider bg-cookbook-primary text-black rounded-lg shadow-md hover:bg-cookbook-primary-hover transition-colors"
          >
            <Check size={14} /> Aceitar
          </button>
        </div>
      </div>
    </div>
  );
};
