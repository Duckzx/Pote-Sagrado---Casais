import React, { useState, useCallback, useRef, useEffect, useId } from 'react';
import { Sparkles, AlertCircle, Download } from 'lucide-react';
import { toPng } from 'html-to-image';

interface ShareableWidgetProps {
  goalAmount: number;
  totalSaved: number;
  destination: string;
  onClose: () => void;
}

const PotDrawing = ({ percentage }: { percentage: number }) => {
  const rawId = useId();
  const clipId = `pot-clip-${rawId.replace(/:/g, '')}`;
  const fillHeightValue = (percentage / 100) * 80;
  const yPos = 105 - fillHeightValue;

  return (
    <div className="relative w-32 h-44 mx-auto mb-4 drop-shadow-xl animate-fade-in">
      <svg viewBox="0 0 100 120" className="w-full h-full" overflow="visible" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id={clipId}>
            <path d="M35 25v10C35 45 20 50 20 65v30a10 10 0 0 0 10 10h40a10 10 0 0 0 10-10V65c0-15-15-20-15-30V25Z" />
          </clipPath>
        </defs>
        
        <path d="M35 15h30" stroke="#E8E4D9" strokeWidth="8" strokeOpacity="0.4" strokeLinecap="round" />
        <path d="M30 25h40" stroke="#E8E4D9" strokeWidth="6" strokeOpacity="0.6" strokeLinecap="round" />
        
        <path d="M35 25v10C35 45 20 50 20 65v30a10 10 0 0 0 10 10h40a10 10 0 0 0 10-10V65c0-15-15-20-15-30V25Z" fill="rgba(255,255,255,0.15)" stroke="#E8E4D9" strokeWidth="4" />
        
        <g clipPath={`url(#${clipId})`}>
          <rect 
            x="0" 
            y={yPos} 
            width="100" 
            height={fillHeightValue + 20} 
            fill="rgba(197, 160, 89, 0.6)" 
          />
        </g>

        <path d="M45 40v30" stroke="#fff" strokeWidth="3" strokeOpacity="0.9" strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-8">
        <span className="font-serif text-3xl font-bold text-white drop-shadow-md">{percentage.toFixed(0)}%</span>
      </div>
    </div>
  );
};

export const ShareableWidget: React.FC<ShareableWidgetProps> = ({ goalAmount, totalSaved, destination, onClose }) => {
  const [isExporting, setIsExporting] = useState(false);
  const percentage = goalAmount > 0 ? Math.min((totalSaved / goalAmount) * 100, 100) : 0;
  const widgetRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleShare = useCallback(async () => {
    if (!widgetRef.current || isExporting) return;

    try {
      setIsExporting(true);
      
      const originalNode = widgetRef.current;
      if (!originalNode) throw new Error('Elemento não encontrado');

      // 1. Criar um clone do nó
      const clone = originalNode.cloneNode(true) as HTMLElement;
      
      // 2. Garantir que o clone tenha as dimensões corretas
      const rect = originalNode.getBoundingClientRect();
      clone.style.width = `${rect.width}px`;
      clone.style.height = `${rect.height}px`;
      clone.style.transform = 'none';
      clone.style.animation = 'none';
      clone.style.transition = 'none';

      // 3. Adicionar ao contêiner temporário (fora da árvore do React)
      const container = document.getElementById('capture-temp');
      if (!container) throw new Error('Contêiner de captura não encontrado');
      container.innerHTML = ''; // Limpar qualquer resíduo
      container.appendChild(clone);

      // Pequeno delay para garantir que o DOM renderizou o clone
      await new Promise(resolve => requestAnimationFrame(resolve));

      // 4. Capturar o clone
      const dataUrl = await toPng(clone, {
        cacheBust: true,
        backgroundColor: '#1C1A17',
        pixelRatio: 2,
      });

      // 5. Limpar o clone imediatamente
      container.innerHTML = '';

      if (!dataUrl) throw new Error('Falha ao gerar a imagem');

      if (!isMounted.current) return;

      const response = await fetch(dataUrl);
      const blob = await response.blob();

      if (!isMounted.current) return;

      const file = new File([blob], 'pote-sagrado-status.png', { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
          });
        } catch (shareErr: any) {
          if (shareErr.name !== 'AbortError') {
            console.error("Erro no popup de share:", shareErr);
          }
        }
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'pote-sagrado-status.png';
        link.href = url;
        link.click();
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 2000);
      }

    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error("Erro ao compartilhar:", err);
      }
    } finally {
      if (isMounted.current) {
        setIsExporting(false);
      }
    }
  }, [isExporting]);

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-6"
      style={{ background: 'rgba(253,251,247,0.95)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div 
        className="relative bg-[#1C1A17] rounded-[2rem] border border-[#C5A059]/20 shadow-2xl overflow-hidden max-w-sm w-full"
        onClick={e => e.stopPropagation()}
      >
        <div ref={widgetRef} className="p-8 relative" style={{ background: 'linear-gradient(to bottom right, #1C1A17, #2C2A26)', color: '#C5A059' }}>
          <div className="absolute top-0 right-0 p-3 opacity-20">
            <Sparkles size={100} color="#C5A059" />
          </div>
          
          <div className="relative z-10 text-center">
            <h3 className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold mb-4" style={{ color: '#C5A059' }}>Pote Sagrado</h3>
            
            <PotDrawing percentage={percentage} />
            
            <h2 className="font-serif italic text-2xl text-white mb-2">Destino: {destination || "Nossa Viagem"}</h2>
            
            <div className="rounded-2xl p-4 mt-6" style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-sans text-[9px] uppercase tracking-widest font-bold" style={{ color: '#E8E4D9' }}>Progresso Guardado</span>
                <span className="font-sans text-xs font-bold" style={{ color: '#C5A059' }}>{Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalSaved)}</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
                <div 
                  className="h-full rounded-full"
                  style={{ width: `${percentage}%`, background: 'linear-gradient(to right, #C5A059, #FDE047)' }}
                />
              </div>
            </div>
            
            <p className="font-sans text-[9px] uppercase tracking-widest font-bold mt-6 mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Juntos, transformando rotina em passagem.
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-between gap-4">
          <button 
            onClick={onClose}
            disabled={isExporting}
            className="flex-1 py-3 bg-cookbook-border text-cookbook-text font-sans text-[10px] uppercase tracking-widest font-bold rounded-xl active:scale-95 transition-transform disabled:opacity-50"
          >
            Fechar
          </button>
          
          <button 
            onClick={handleShare}
            disabled={isExporting}
            className="flex-1 py-3 bg-cookbook-primary text-white font-sans text-[10px] uppercase tracking-widest font-bold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg disabled:opacity-50"
          >
            {isExporting ? (
              'Exportando...'
            ) : (
              <>
                <Download size={14} />
                Salvar P/ Story
              </>
            )}
          </button>
        </div>
        
        <p className="text-center font-sans text-[9px] text-cookbook-text/40 font-bold tracking-wider mt-4">
          <AlertCircle size={10} className="inline mr-1" />
          A imagem com fundo transparente será baixada para compartilhar no Instagram!
        </p>

      </div>
    </div>
  );
};

