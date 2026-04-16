import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { X, Sparkles, Loader2, MapPin } from 'lucide-react';

interface AIAkinatorModalProps {
  onClose: () => void;
  onSelectDestination: (destination: string) => void;
}

export const AIAkinatorModal: React.FC<AIAkinatorModalProps> = ({ onClose, onSelectDestination }) => {
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ destination: string; reason: string } | null>(null);
  const [preferences, setPreferences] = useState('');

  const handleGenerate = async () => {
    if (!preferences.trim()) return;
    setIsLoading(true);
    setStep(1); // Loading/Result step
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `
        Atue como um Consultor de Viagens Especialista.
        O casal está procurando o destino perfeito para a próxima viagem e me disse isso: "${preferences}"

        Com base nisso, sugira 1 (UM) destino perfeito (Cidade, País).
        Retorne APENAS um JSON válido com o seguinte formato, sem formatação markdown extra:
        {
          "destination": "Nome da Cidade, País",
          "reason": "Uma breve explicação (2-3 frases) do porquê este é o destino perfeito para eles, com um tom inspirador."
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
      });

      const text = response.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setResult(parsed);
      } else {
        throw new Error("Invalid JSON response");
      }
    } catch (error) {
      console.error("Error generating destination:", error);
      setResult({
        destination: "Paris, França",
        reason: "Tivemos um problema ao consultar o oráculo, mas Paris é sempre uma boa ideia para casais!"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Sparkles size={24} className="text-cookbook-gold mx-auto mb-3" />
              <h3 className="font-serif text-xl text-cookbook-text">Oráculo de Viagens</h3>
              <p className="font-sans text-xs text-cookbook-text/60 mt-2">
                Descreva rapidamente o que vocês curtem (ex: "praia tranquila e barata", "frio, vinho e neve", "aventura na natureza").
              </p>
            </div>
            <textarea
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              placeholder="O que vocês gostam de fazer?"
              className="w-full bg-white border border-cookbook-border rounded p-4 font-serif text-sm text-cookbook-text focus:outline-none focus:border-cookbook-primary h-32 resize-none"
              autoFocus
            />
            <button
              onClick={handleGenerate}
              disabled={!preferences.trim()}
              className="w-full bg-cookbook-primary text-white font-sans text-[10px] uppercase tracking-widest py-4 rounded font-bold transition-opacity disabled:opacity-50"
            >
              Descobrir Destino
            </button>
          </div>
        );
      case 1:
        if (isLoading || !result) {
          return (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
              <Loader2 size={32} className="text-cookbook-primary animate-spin" />
              <p className="font-serif italic text-cookbook-text/60">Cruzando dados e buscando o destino perfeito...</p>
            </div>
          );
        }
        return (
          <div className="text-center space-y-6 py-4">
            <div className="inline-block bg-cookbook-bg border border-cookbook-border px-4 py-1 rounded-full mb-2">
              <span className="font-sans text-[9px] uppercase tracking-widest text-cookbook-primary font-bold">Match Perfeito</span>
            </div>
            <h3 className="font-serif italic text-3xl text-cookbook-text text-balance leading-tight">
              {result.destination}
            </h3>
            <p className="font-sans text-sm text-cookbook-text/70 leading-relaxed max-w-[280px] mx-auto">
              {result.reason}
            </p>
            <div className="pt-6">
              <button
                onClick={() => onSelectDestination(result.destination)}
                className="w-full bg-cookbook-primary text-white font-sans text-[10px] uppercase tracking-widest py-4 rounded font-bold shadow-md"
              >
                Escolher este Destino
              </button>
              <button
                onClick={() => setStep(0)}
                className="w-full mt-3 bg-transparent text-cookbook-text/60 font-sans text-[10px] uppercase tracking-widest py-3 rounded font-bold hover:text-cookbook-text"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-cookbook-bg/90 backdrop-blur-sm">
      <div className="bg-white border border-cookbook-border rounded w-full max-w-sm p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cookbook-primary via-cookbook-gold to-cookbook-primary opacity-50" />
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-cookbook-text/40 hover:text-cookbook-text z-10"
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
