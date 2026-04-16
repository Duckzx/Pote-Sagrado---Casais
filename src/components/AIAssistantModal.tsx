import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import { X, Sparkles, Loader2 } from 'lucide-react';

interface AIAssistantModalProps {
  destination: string;
  origin: string;
  onClose: () => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ destination, origin, onClose }) => {
  const [response, setResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);

  const startConsultation = async () => {
    if (!destination) {
      setResponse("Por favor, defina um destino nos Ajustes primeiro.");
      setHasStarted(true);
      return;
    }

    setIsLoading(true);
    setHasStarted(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `
        O usuário está planejando uma viagem saindo de "${origin || 'Brasil'}" para: "${destination}".
        Atue como um Consultor de Viagens de Luxo e Economia Inteligente.
        
        Faça uma pesquisa atualizada e forneça:
        1. **Melhor Mês para Viajar**: Sugira o melhor mês focando em baixa temporada/melhor custo-benefício, mas com clima aceitável.
        2. **Pesquisa de Pacotes/Voos**: Pesquise os preços atuais de voos ou pacotes saindo de "${origin || 'Brasil'}" para esse destino nesse mês sugerido.
        3. **Meta de Economia**: Apresente o menor valor encontrado (ou uma estimativa realista baseada na pesquisa) como o "Parâmetro de Economia" (ex: R$ X.XXX por pessoa).
        
        Formate a resposta em Markdown, usando títulos curtos, listas e negrito para destacar os valores. Mantenha um tom elegante, inspirador e direto.
      `;

      const result = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} } as any],
        }
      });

      setResponse(result.text || "Não foi possível gerar a consulta no momento.");
    } catch (error) {
      console.error("Error generating AI response:", error);
      setResponse("Ocorreu um erro ao consultar a inteligência artificial. Tente novamente mais tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cookbook-bg/90 backdrop-blur-sm">
      <div className="bg-white border border-cookbook-border rounded w-full max-w-md h-[80vh] flex flex-col shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cookbook-primary via-cookbook-gold to-cookbook-primary opacity-50" />
        
        <div className="flex items-center justify-between p-4 border-b border-cookbook-border bg-cookbook-mural">
          <div className="flex items-center space-x-2 text-cookbook-primary">
            <Sparkles size={18} />
            <span className="font-sans text-[10px] uppercase tracking-widest font-bold">Consultor IA</span>
          </div>
          <button onClick={onClose} className="text-cookbook-text/40 hover:text-cookbook-text">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!hasStarted ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-16 h-16 bg-cookbook-bg rounded-full border border-cookbook-border flex items-center justify-center">
                <Sparkles size={24} className="text-cookbook-gold" />
              </div>
              <div>
                <h3 className="font-serif italic text-2xl text-cookbook-text mb-2">Análise de Viagem</h3>
                <p className="font-sans text-xs text-cookbook-text/60 leading-relaxed max-w-[250px] mx-auto">
                  Nossa IA vai pesquisar a melhor época, pacotes e voos para <strong className="text-cookbook-primary">{destination || 'seu destino'}</strong>.
                </p>
              </div>
              <button
                onClick={startConsultation}
                disabled={!destination}
                className="bg-cookbook-primary text-white font-sans text-[10px] uppercase tracking-widest py-3 px-6 rounded font-bold disabled:opacity-50 transition-transform active:scale-95 shadow-md"
              >
                Iniciar Pesquisa Profunda
              </button>
              {!destination && (
                <p className="font-sans text-[9px] uppercase tracking-widest text-cookbook-text/40">
                  Defina um destino nos Ajustes primeiro.
                </p>
              )}
            </div>
          ) : isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <Loader2 size={32} className="text-cookbook-primary animate-spin" />
              <p className="font-serif italic text-cookbook-text/60">Analisando dados globais de voos e pacotes...</p>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none prose-headings:font-serif prose-headings:italic prose-headings:text-cookbook-primary prose-p:font-sans prose-p:text-cookbook-text prose-strong:text-cookbook-text prose-a:text-cookbook-gold">
              <ReactMarkdown>{response}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
