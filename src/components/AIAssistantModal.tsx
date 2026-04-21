import React from 'react';
import { X, Plane, BedDouble, Search, Compass, Info, ExternalLink } from 'lucide-react';

interface AIAssistantModalProps {
  destination: string;
  origin: string;
  onClose: () => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ destination, origin, onClose }) => {
  // Constrói URLs de pesquisa para facilitar a vida do usuário de graça
  const destEncoded = encodeURIComponent(destination || 'viagem');
  const originEncoded = encodeURIComponent(origin || 'Brasil');
  
  const links = [
    {
      title: "Buscar Voos Baratos",
      desc: "Google Flights",
      url: `https://www.google.com/travel/flights?q=Voos+de+${originEncoded}+para+${destEncoded}`,
      icon: <Plane size={18} className="text-cookbook-primary" />,
      color: "border-cookbook-border bg-cookbook-bg/40 hover:bg-cookbook-primary/5"
    },
    {
      title: "Buscar Hospedagem",
      desc: "Booking.com",
      url: `https://www.booking.com/searchresults.pt-br.html?ss=${destEncoded}`,
      icon: <BedDouble size={18} className="text-cookbook-primary" />,
      color: "border-cookbook-border bg-cookbook-bg/40 hover:bg-cookbook-primary/5"
    },
    {
      title: "O Que Fazer / Dicas",
      desc: "TripAdvisor",
      url: `https://www.tripadvisor.com.br/Search?q=${destEncoded}`,
      icon: <Compass size={18} className="text-cookbook-primary" />,
      color: "border-cookbook-border bg-cookbook-bg/40 hover:bg-cookbook-primary/5"
    },
    {
      title: "Custo de Vida Diário",
      desc: "Budget Your Trip",
      url: `https://www.google.com/search?q=cost+of+travel+budget+your+trip+${destEncoded}`,
      icon: <Search size={18} className="text-cookbook-primary" />,
      color: "border-cookbook-border bg-cookbook-bg/40 hover:bg-cookbook-primary/5"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cookbook-bg/90 backdrop-blur-sm animate-modal-backdrop" onClick={onClose}>
      <div 
        className="bg-cookbook-bg border border-cookbook-border rounded-xl w-full max-w-md flex flex-col shadow-2xl relative overflow-hidden animate-modal-enter max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cookbook-primary via-cookbook-gold to-cookbook-primary opacity-50" />
        
        <div className="flex items-center justify-between p-4 border-b border-cookbook-border bg-cookbook-mural/50">
          <div className="flex items-center space-x-2 text-cookbook-primary">
            <Compass size={18} />
            <span className="font-sans text-[10px] uppercase tracking-widest font-bold">Portal do Destino</span>
          </div>
          <button onClick={onClose} className="text-cookbook-text/40 hover:text-cookbook-text transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!destination ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-8">
              <div className="w-16 h-16 bg-cookbook-bg rounded-full border border-cookbook-border flex items-center justify-center">
                <Info size={24} className="text-cookbook-gold" />
              </div>
              <h3 className="font-serif italic text-xl text-cookbook-text mb-2">Destino não definido</h3>
              <p className="font-sans text-xs text-cookbook-text/60 leading-relaxed max-w-[250px] mx-auto">
                Para o portal funcionar, preencha o destino dos sonhos de vocês na aba de Ajustes.
              </p>
              <button
                onClick={onClose}
                className="mt-4 bg-cookbook-primary text-cookbook-bg font-sans text-[9px] uppercase tracking-widest py-3 px-6 rounded-lg font-bold"
              >
                Certo, vou definir
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="font-serif italic text-3xl text-cookbook-text mb-1">{destination}</h3>
                <p className="font-sans text-[10px] uppercase tracking-widest text-cookbook-text/50 font-bold">
                  Sua próxima grande aventura
                </p>
              </div>

              <div className="bg-cookbook-bg border border-cookbook-border rounded-xl p-4 mb-6">
                <p className="font-sans text-xs text-cookbook-text/70 leading-relaxed text-center">
                  Use os atalhos rápidos abaixo para monitorar passagens em tempo real, explorar as melhores hospedagens e montar seu roteiro sem depender de agências. Tudo 100% grátis e no seu tempo!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {links.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block border rounded-xl p-4 transition-all hover:scale-[1.02] active:scale-[0.98] ${link.color}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-8 h-8 rounded-full bg-cookbook-bg border border-cookbook-border flex items-center justify-center shadow-sm">
                        {link.icon}
                      </div>
                      <ExternalLink size={14} className="text-cookbook-text/30" />
                    </div>
                    <h4 className="font-serif text-sm text-cookbook-text mb-1 leading-tight">{link.title}</h4>
                    <span className="font-sans text-[9px] uppercase tracking-widest text-cookbook-text/50 font-bold block">
                      {link.desc}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
