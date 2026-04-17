import React from 'react';
import { Download, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const InstallPrompt: React.FC = () => {
  const { canInstall, installPrompt, clearInstallPrompt } = useAppContext();

  if (!canInstall || !installPrompt) return null;

  const handleInstallClick = async () => {
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      clearInstallPrompt();
    }
  };

  return (
    <div className="bg-cookbook-primary/10 border border-cookbook-primary/20 rounded-xl p-4 flex items-center shadow-sm relative overflow-hidden">
      <div className="bg-cookbook-primary text-white p-2.5 rounded-lg mr-4 shrink-0 shadow-sm z-10">
        <Download size={22} />
      </div>
      <div className="flex-1 pr-4 z-10">
        <h4 className="font-serif italic text-cookbook-text text-[15px] leading-tight mb-1">
          Instale o App
        </h4>
        <p className="font-sans text-[10px] uppercase tracking-wider text-cookbook-text/60 font-bold">
          Experiência mais rápida e nativa no celular.
        </p>
      </div>
      <div className="flex flex-col items-center space-y-2 z-10">
        <button 
          onClick={handleInstallClick}
          className="text-xs bg-cookbook-primary text-white px-3 py-1.5 rounded-full font-bold uppercase tracking-wider"
        >
          Instalar
        </button>
      </div>
      <button 
        onClick={clearInstallPrompt}
        className="absolute top-2 right-2 text-cookbook-text/30 hover:text-cookbook-text z-10"
      >
        <X size={14} />
      </button>
    </div>
  );
};
