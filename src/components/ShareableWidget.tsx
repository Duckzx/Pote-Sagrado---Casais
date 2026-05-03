import React, { useRef, useState } from "react";
import { Sparkles, Copy, Heart, Instagram, Facebook, Share, ArrowUpRight } from "lucide-react";
import domtoimage from "dom-to-image-more";
import { useAppStore } from "../store/useAppStore";


interface ShareableWidgetProps {
  onClose: () => void;
}

const WhatsappIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.88-.788-1.482-1.761-1.655-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.052 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
  </svg>
)

const ShareButton = ({ icon, label, onClick, active }: any) => (
  <button 
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    className={`flex flex-col items-center justify-center gap-[6px] w-[56px] h-[64px] rounded-xl border transition-colors
      ${active 
        ? "bg-[#C5A059] border-[#C5A059] text-[#1A1A1A]" 
        : "bg-transparent border-white/10 text-white/70 hover:bg-white/5 hover:text-white"
      }`}
  >
    <div className={`${active ? 'text-[#1A1A1A]' : ''}`}>
      {icon}
    </div>
    <span className="font-sans leading-tight font-medium" style={{ fontSize: '8px' }}>{label}</span>
  </button>
)

const PotDrawing = ({ percentage }: { percentage: number }) => {
  const fillHeight = (percentage / 100) * 80;
  return (
    <div className="relative w-32 h-44 mx-auto mb-6 flex justify-center items-center isolate">
      {/* Background radial glow */}
      <div className="absolute w-28 h-28 bg-[#C5A059]/30 blur-[40px] rounded-full z-0 pointer-events-none" />
      
      <svg
        viewBox="0 -10 100 130"
        className="w-full h-full relative z-10 drop-shadow-[0_0_15px_rgba(253,246,227,0.3)] pointer-events-none"
        overflow="visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id="potClipWidget2">
            <path d="M35 25v10C35 45 20 50 20 65v30a10 10 0 0 0 10 10h40a10 10 0 0 0 10-10V65c0-15-15-20-15-30V25Z" />
          </clipPath>
        </defs>
        
        {/* Fill Area with glow */}
        <g clipPath="url(#potClipWidget2)">
          <rect
            x="0"
            y={105 - fillHeight}
            width="100"
            height={fillHeight + 20}
            fill="#C5A059"
          />
        </g>
        
        {/* Outline */}
        <path
          d="M35 15h30"
          stroke="#FDF6E3"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M32 25h36"
          stroke="#FDF6E3"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="4 4"
        />
        <path
          d="M35 25v10C35 45 20 50 20 65v30a10 10 0 0 0 10 10h40a10 10 0 0 0 10-10V65c0-15-15-20-15-30V25Z"
          fill="none"
          stroke="#FDF6E3"
          strokeWidth="4"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        
        {/* Shine */}
        <path
          d="M45 40v30"
          stroke="#fff"
          strokeWidth="4"
          strokeOpacity="0.8"
          strokeLinecap="round"
        />
      </svg>
      {/* Text inside the jar */}
      <div className="absolute inset-0 flex items-center justify-center translate-y-6 z-20 pointer-events-none">
        <span className="font-serif text-[42px] font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-none">
          {percentage.toFixed(0)}%
        </span>
      </div>
    </div>
  );
};

export const ShareableWidget: React.FC<ShareableWidgetProps> = ({
  onClose,
}) => {
  const deposits = useAppStore(s => s.deposits);
  const tripConfig = useAppStore(s => s.tripConfig);
  const goalAmount = tripConfig.goalAmount || 0;
  const destination = tripConfig.destination || "Nossa Viagem";
  const totalSaved = deposits
    .filter((d) => d.type !== "expense")
    .reduce((acc, d) => acc + (d.amount || 0), 0);

  const [isExporting, setIsExporting] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);
  
  const percentage = goalAmount > 0 ? Math.min((totalSaved / goalAmount) * 100, 100) : 0;
  
  const formattedTotal = Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalSaved);
  const formattedGoal = Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(goalAmount);
  
  const handleShare = async () => {
    try {
      setIsExporting(true);
      await new Promise((resolve) => setTimeout(resolve, 50));
      if (!widgetRef.current) return;
      const blob = await domtoimage.toBlob(widgetRef.current, {
        bgcolor: '#111111',
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
      const file = new File([blob], "pote-sagrado-status.png", { type: "image/png" });
      let shared = false;
      try {
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "Pote Sagrado",
            text: "Meu Status!",
          });
          shared = true;
        }
      } catch (shareErr) {
        console.error("Share API failed:", shareErr);
      }
      if (!shared) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = "pote-sagrado-status.png";
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
      setIsExporting(false);
    } catch (err: any) {
      console.error(err);
      setIsExporting(false);
    }
  };

  const copyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert("Link copiado para a área de transferência!");
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`Acompanhe nossa meta para ${destination || "nossa viagem"}! Já conseguimos ${percentage.toFixed(0)}% do valor. Acesse: ${window.location.href}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(12px)",
      }}
      onClick={onClose}
    >
      <div className="w-full max-w-[360px] animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <div
          ref={widgetRef}
          className="rounded-[32px] p-6 shadow-2xl relative overflow-hidden"
          style={{ backgroundColor: "#151515" }}
        >
          {/* Custom Sparkle Background Element */}
          <div className="absolute top-8 right-6 text-[#3A362D] opacity-40 pointer-events-none">
            <svg width="80" height="80" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 50 10 Q 50 50 90 50 Q 50 50 50 90 Q 50 50 10 50 Q 50 50 50 10 Z" />
              <circle cx="20" cy="80" r="6" fill="currentColor" />
              <path d="M 80 15 Q 80 25 90 25 Q 80 25 80 35 Q 80 25 70 25 Q 80 25 80 15 Z" />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col items-center">
            {/* Header: -- POTE SAGRADO -- */}
            <div className="flex items-center gap-4 mb-8 relative z-20">
              <div className="w-6 h-[1px] bg-[#C5A059] opacity-60" />
              <span className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold text-[#C5A059]">
                Pote Sagrado
              </span>
              <div className="w-6 h-[1px] bg-[#C5A059] opacity-60" />
            </div>

            <PotDrawing percentage={percentage} />

            <h2 className="font-serif text-[28px] leading-tight text-white mb-6 text-center relative z-20">
              <span className="italic text-[#C5A059]">Destino:</span>{" "}
              <span className="italic">{destination || "Nossa Viagem"}</span>
            </h2>

            {/* Progress Box */}
            <div className="w-full bg-[#1F1F1F] rounded-2xl p-4 mb-4 shadow-inner relative z-20">
              <div className="flex justify-between items-center mb-3">
                <span className="font-sans text-[9px] uppercase tracking-[0.1em] text-white/60 font-bold">
                  Progresso Guardado
                </span>
                <span className="font-sans text-[14px] font-bold text-[#C5A059]">
                  {formattedTotal}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#111] overflow-hidden mb-3 border border-white/5">
                <div 
                  className="h-full bg-[linear-gradient(90deg,#967332,#C5A059)] rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="text-[10px] text-white/40 font-sans tracking-wide">
                Meta: {formattedGoal} • {percentage.toFixed(0)}% concluído
              </div>
            </div>

            {/* Share action box */}
            {/* Not rendered in image output if exporting, but since we capture the whole ref we will capture it. 
                The user's example image *includes* the share box in the screenshot, so we leave it. */}
            <div className="w-full bg-[#1F1F1F] rounded-2xl p-4 shadow-inner relative z-20 mb-5">
              <h4 className="font-sans text-[9px] uppercase tracking-[0.1em] font-bold text-white/60 mb-1">
                Compartilhe e ajude
              </h4>
              <p className="font-sans text-[10px] text-white/40 mb-4 tracking-wide">
                Juntos, transformando rotina em passagem.
              </p>
              <div className="flex justify-between gap-1">
                <ShareButton icon={<WhatsappIcon />} label="WhatsApp" onClick={shareWhatsApp} />
                <ShareButton icon={<Instagram size={18} />} label="Instagram" onClick={() => handleShare()} />
                <ShareButton icon={<Facebook size={18} />} label="Facebook" onClick={shareFacebook} />
                <ShareButton icon={<Copy size={18} />} label="Copiar link" onClick={copyLink} />
                <ShareButton icon={<ArrowUpRight size={18} />} label="Compartilhar" onClick={handleShare} active />
              </div>
            </div>

            {/* Footer heart text */}
            <div className="flex items-center justify-center gap-2 text-white/30 text-[9px] font-bold relative z-20">
              <Heart size={10} className="text-white/30" />
              Obrigado por apoiar essa jornada!
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
