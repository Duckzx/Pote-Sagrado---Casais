import React, { useState } from 'react';
import { X, Sparkles, MapPin, Compass, Sun, Snowflake, Trees, Loader2 } from 'lucide-react';

interface AIAkinatorModalProps {
  onClose: () => void;
  onSelectDestination: (destination: string) => void;
}

const LOCAL_DESTINATIONS = [
  { dest: "San Carlos de Bariloche, Argentina", tags: ["frio", "neve", "america"], reason: "Tem paisagens de neve deslumbrantes, chocolates divinos e é mais acessível que a Europa." },
  { dest: "Mendoza, Argentina", tags: ["frio", "america", "montanha"], reason: "Perfeito para casais que amam vinhos aos pés da Cordilheira dos Andes com um ótimo custo-benefício." },
  { dest: "Fernando de Noronha, Brasil", tags: ["praia", "calor", "natureza", "brasil"], reason: "O paraíso nacional com praias exclusivas, mergulhos inesquecíveis e pôr do sol de tirar o fôlego." },
  { dest: "Paris, França", tags: ["frio", "cidade", "europa"], reason: "A cidade do amor. Caminhar pelas margens do Sena ou tomar vinho diante da Torre Eiffel é um sonho clássico." },
  { dest: "Maragogi, Alagoas", tags: ["praia", "calor", "brasil", "natureza"], reason: "O 'Caribe Brasileiro' oferece piscinas naturais cristalinas perfeitas para relaxar e namorar." },
  { dest: "Gramado, Rio Grande do Sul", tags: ["frio", "cidade", "brasil", "montanha"], reason: "Clima europeu, fondues deliciosos e romantismo puro sem precisar atravessar o oceano." },
  { dest: "Cancún, México", tags: ["praia", "calor", "america"], reason: "Resorts all-inclusive, mar azul-turquesa e uma vida noturna agitada caso queiram festa." },
  { dest: "Santorini, Grécia", tags: ["praia", "calor", "europa"], reason: "A vista inconfundível do mar azul e casinhas brancas tornam qualquer jantar o mais romântico da vida." },
  { dest: "Kyoto, Japão", tags: ["cidade", "natureza", "asia"], reason: "Para casais que buscam um mergulho cultural, templos pacíficos e a magia das cerejeiras." },
  { dest: "Machu Picchu, Peru", tags: ["montanha", "natureza", "america"], reason: "Aventuras inesquecíveis nas alturas dos Andes. Ideal para fortalecer a parceria encarando trilhas marcantes." }
];

export const AIAkinatorModal: React.FC<AIAkinatorModalProps> = ({ onClose, onSelectDestination }) => {
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<typeof LOCAL_DESTINATIONS[0] | null>(null);
  
  // Quiz state
  const [answers, setAnswers] = useState<string[]>([]);

  const handleSelectTag = (tag: string) => {
    const newAnswers = [...answers, tag];
    setAnswers(newAnswers);
    
    if (newAnswers.length >= 2) {
      // Find match
      processResult(newAnswers);
    } else {
      setStep(1); // Go to question 2
    }
  };

  const processResult = (finalAnswers: string[]) => {
    setIsLoading(true);
    setStep(2); // Result view
    
    setTimeout(() => {
      // Basic scoring algorithm
      let maxScore = -1;
      let matchedDest = LOCAL_DESTINATIONS[Math.floor(Math.random() * LOCAL_DESTINATIONS.length)]; // fallback

      LOCAL_DESTINATIONS.forEach(d => {
        let score = 0;
        finalAnswers.forEach(ans => {
          if (d.tags.includes(ans)) score++;
        });
        // Introduce slight randomness for ties
        score += Math.random() * 0.5;
        
        if (score > maxScore) {
          maxScore = score;
          matchedDest = d;
        }
      });

      setResult(matchedDest);
      setIsLoading(false);
    }, 1500);
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Compass size={32} className="text-cookbook-primary mx-auto mb-3" />
              <h3 className="font-serif text-xl text-cookbook-text">Oráculo de Viagens</h3>
              <p className="font-sans text-xs text-cookbook-text/60 mt-2">
                Descubram o destino ideal para o estilo do casal em 2 perguntas rápidas. Qual o clima preferido?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => handleSelectTag('calor')} className="bg-orange-50 border border-orange-200 text-orange-700 hover:bg-orange-100 rounded-xl p-4 flex flex-col items-center gap-2 transition-all active:scale-95">
                <Sun size={24} />
                <span className="font-sans font-bold text-[10px] uppercase tracking-widest">Calor & Sol</span>
              </button>
              <button onClick={() => handleSelectTag('frio')} className="bg-sky-50 border border-sky-200 text-sky-700 hover:bg-sky-100 rounded-xl p-4 flex flex-col items-center gap-2 transition-all active:scale-95">
                <Snowflake size={24} />
                <span className="font-sans font-bold text-[10px] uppercase tracking-widest">Frio & Aconchego</span>
              </button>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6 animate-badge-text-reveal">
            <div className="text-center mb-6">
              <Trees size={32} className="text-cookbook-primary mx-auto mb-3" />
              <h3 className="font-serif text-xl text-cookbook-text">Cenário Ideal</h3>
              <p className="font-sans text-xs text-cookbook-text/60 mt-2">
                Onde vocês acham que criariam as melhores memórias justos?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => handleSelectTag('praia')} className="bg-cyan-50 border border-cyan-200 text-cyan-700 hover:bg-cyan-100 rounded-xl p-4 flex flex-col items-center gap-2 transition-all active:scale-95">
                <span className="text-2xl block">🌊</span>
                <span className="font-sans font-bold text-[10px] uppercase tracking-widest">Praial</span>
              </button>
              <button onClick={() => handleSelectTag('cidade')} className="bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 rounded-xl p-4 flex flex-col items-center gap-2 transition-all active:scale-95">
                <span className="text-2xl block">🗽</span>
                <span className="font-sans font-bold text-[10px] uppercase tracking-widest">Cidade/Cultura</span>
              </button>
              <button onClick={() => handleSelectTag('natureza')} className="bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-xl p-4 flex flex-col items-center gap-2 transition-all active:scale-95 col-span-2">
                <span className="text-2xl block">🏕️</span>
                <span className="font-sans font-bold text-[10px] uppercase tracking-widest">Natureza ou Montanhas</span>
              </button>
            </div>
          </div>
        );
      case 2:
        if (isLoading || !result) {
          return (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
              <Loader2 size={32} className="text-cookbook-primary animate-spin" />
              <p className="font-serif italic text-cookbook-text/60">Cruzando dados e buscando o destino perfeito...</p>
            </div>
          );
        }
        return (
          <div className="text-center space-y-6 py-4 animate-modal-enter">
            <div className="inline-block bg-cookbook-gold/10 text-cookbook-gold border border-cookbook-gold/20 px-4 py-1 rounded-full mb-2">
              <span className="font-sans text-[9px] uppercase tracking-widest font-bold">Match Perfeito</span>
            </div>
            <h3 className="font-serif italic text-3xl text-cookbook-text text-balance leading-tight">
              {result.dest}
            </h3>
            <p className="font-sans text-sm text-cookbook-text/70 leading-relaxed max-w-[280px] mx-auto">
              {result.reason}
            </p>
            <div className="pt-6">
              <button
                onClick={() => onSelectDestination(result.dest)}
                className="w-full bg-cookbook-primary hover:bg-cookbook-primary-hover text-white font-sans text-[10px] uppercase tracking-widest py-4 rounded-xl font-bold shadow-md transition-all active:scale-95"
              >
                Definir como Meta!
              </button>
              <button
                onClick={() => { setStep(0); setAnswers([]); }}
                className="w-full mt-3 bg-transparent text-cookbook-text/60 font-sans text-[9px] uppercase tracking-widest py-3 rounded font-bold hover:text-cookbook-text transition-colors"
              >
                Tentar de Novo
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-cookbook-bg/90 backdrop-blur-sm animate-modal-backdrop" onClick={onClose}>
      <div 
        className="bg-white border border-cookbook-border rounded-xl w-full max-w-sm p-6 shadow-2xl relative overflow-hidden animate-modal-enter"
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cookbook-primary via-cookbook-gold to-cookbook-primary opacity-50" />
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-cookbook-text/40 hover:text-cookbook-text z-10 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="mt-4">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};
