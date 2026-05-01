import React, { useState, useCallback, useRef } from "react";
import { Sparkles, Download, ReceiptText } from "lucide-react";
import domtoimage from "dom-to-image-more";

interface ReceiptWidgetProps {
  deposit: any;
  destination: string;
  onClose: () => void;
}

export const ReceiptWidget: React.FC<ReceiptWidgetProps> = ({
  deposit,
  destination,
  onClose,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);
  
  const isExpense = deposit.type === "expense";
  const amountStr = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(deposit.amount);

  const handleShare = useCallback(async () => {
    try {
      setIsExporting(true);
      await new Promise((resolve) => setTimeout(resolve, 50));
      if (!widgetRef.current) return;
      
      const blob = await domtoimage.toBlob(widgetRef.current, {
        bgcolor: 'transparent',
        scale: 2,
        height: widgetRef.current.offsetHeight * 2,
        width: widgetRef.current.offsetWidth * 2,
        style: {
          transform: 'scale(2)',
          transformOrigin: 'top left',
          width: widgetRef.current.offsetWidth + 'px',
          height: widgetRef.current.offsetHeight + 'px',
        }
      });
      
      if (!blob) {
        setIsExporting(false);
        return;
      }
      
      const file = new File([blob], `comprovante-${deposit.id}.png`, {
        type: "image/png",
      });
      
      let shared = false;
      try {
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "Comprovante - Pote Sagrado",
            text: "Mais um passo para a nossa viagem!",
          });
          shared = true;
        }
      } catch (shareErr) {
        console.error("Share API failed:", shareErr);
      }
      
      if (!shared) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `comprovante-${deposit.id}.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
      setIsExporting(false);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Erro ao compartilhar:", err);
      }
      setIsExporting(false);
    }
  }, [deposit.id]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-modal-backdrop"
      style={{
        background: "rgba(253,251,247,0.95)",
        backdropFilter: "blur(8px)",
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          ref={widgetRef}
          className="rounded-3xl p-8 shadow-2xl overflow-hidden relative"
          style={{
            background: "#FDFBF7",
            border: "1px solid #E8E4D9",
            color: "#1C1A17",
          }}
        >
          {/* Top Notch for Receipt Look */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-6 bg-[rgba(253,251,247,0.95)] rounded-full border border-[#E8E4D9] blur-[2px]" />

          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Sparkles size={80} color="#C5A059" />
          </div>

          <div className="relative z-10 text-center flex flex-col items-center">
            <div className="w-12 h-12 bg-[#F3EFE6] rounded-full flex items-center justify-center mb-4 border border-[#E8E4D9]">
              <ReceiptText size={20} color="#C5A059" />
            </div>

            <h3
              className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold mb-1"
              style={{ color: "#C5A059" }}
            >
              Comprovante
            </h3>
            <h2 className="font-serif italic text-2xl text-[#1C1A17] mb-6">
              Pote Sagrado
            </h2>

            <div className="w-full border-t border-dashed border-[#E8E4D9] mb-6" />

            <div className="w-full space-y-4 text-left">
              <div>
                <p className="font-sans text-[9px] uppercase tracking-widest text-[#1C1A17]/40 font-bold mb-1">
                  Valor {isExpense ? "Retirado" : "Adicionado"}
                </p>
                <p className={`font-serif text-3xl font-medium ${isExpense ? "text-red-500" : "text-emerald-600"}`}>
                  {isExpense ? "− " : "+ "}{amountStr}
                </p>
              </div>

              <div>
                <p className="font-sans text-[9px] uppercase tracking-widest text-[#1C1A17]/40 font-bold mb-1">
                  Descrição
                </p>
                <p className="font-serif text-lg text-[#1C1A17] leading-tight">
                  {deposit.action || (isExpense ? "Saída" : "Entrada")}
                </p>
              </div>

              <div className="flex justify-between items-center bg-[#F3EFE6] p-3 rounded-xl border border-[#E8E4D9]">
                <div>
                  <p className="font-sans text-[9px] uppercase tracking-widest text-[#1C1A17]/40 font-bold mb-0.5">
                    Por
                  </p>
                  <p className="font-serif text-sm text-[#1C1A17] font-medium">
                    {deposit.whoName.split(' ')[0]}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-sans text-[9px] uppercase tracking-widest text-[#1C1A17]/40 font-bold mb-0.5">
                    Destino
                  </p>
                  <p className="font-serif text-sm text-[#C5A059] font-medium">
                    {destination || "Nossa Viagem"}
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full border-t border-dashed border-[#E8E4D9] mt-6 mb-4" />

            <p
              className="font-sans text-[9px] uppercase tracking-widest font-bold"
              style={{ color: "#1C1A17", opacity: 0.3 }}
            >
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
              "Exportando..."
            ) : (
              <>
                <Download size={14} /> Partilhar Recibo
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
