import React, { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Download, Link2, Share2, X, Loader2 } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { renderShareCard, ShareFormat } from "../lib/shareCard";
import { ShimmerButton } from "./magicui/shimmer-button";
import { vibrate } from "../lib/audio";

interface ShareableWidgetProps {
  goalAmount: number;
  totalSaved: number;
  destination: string;
  /** Optional title when opened by a milestone (e.g. "Vocês chegaram a 50%!") */
  celebration?: string;
  onClose: () => void;
}

const WhatsappIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.88-.788-1.482-1.761-1.655-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.052 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
  </svg>
);

/** Link used in every share: brings new people to the app (not an invite to this pot). */
const shareUrl = () => `${window.location.origin}/?ref=share`;

export const ShareableWidget: React.FC<ShareableWidgetProps> = ({
  goalAmount,
  totalSaved,
  destination,
  celebration,
  onClose,
}) => {
  const addToast = useAppStore((s) => s.addToast);
  const mode = useAppStore((s) => s.mode);
  const groupName = useAppStore((s) => s.groupName);
  const theme = useAppStore((s) => s.theme);

  const [format, setFormat] = useState<ShareFormat>("story");
  const [blob, setBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const percentage = goalAmount > 0 ? Math.min((totalSaved / goalAmount) * 100, 100) : 0;
  const pct = Math.round(percentage);
  const goalText = destination?.trim() || "o nosso sonho";

  const { headline, subline, message } = useMemo(() => {
    const done = pct >= 100;
    if (mode === "solo") {
      return {
        headline: done ? "Meta batida! Eu consegui 🎉" : `Já juntei ${pct}% do meu sonho`,
        subline: `rumo a: ${goalText}`,
        message: `${done ? "Bati minha meta" : `Já juntei ${pct}% para ${goalText}`} no Pote Sagrado 🍯✨ Crie o seu pote grátis:`,
      };
    }
    if (mode === "grupo") {
      const who = groupName ? `A turma ${groupName}` : "A turma";
      return {
        headline: done ? `${who} bateu a meta! 🎉` : `${who} já juntou ${pct}%`,
        subline: `rumo a: ${goalText}`,
        message: `${done ? "Batemos a meta" : `Já juntamos ${pct}% para ${goalText}`} com a turma no Pote Sagrado 🫶 Monte o pote da sua turma:`,
      };
    }
    return {
      headline: done ? "Conseguimos! Meta batida 🎉" : `Já juntamos ${pct}% do nosso sonho`,
      subline: `rumo a: ${goalText}`,
      message: `${done ? "Batemos nossa meta" : `Já juntamos ${pct}% para ${goalText}`} no Pote Sagrado 💞 Crie o pote de vocês:`,
    };
  }, [mode, groupName, pct, goalText]);

  // Render the card as soon as the modal opens (and when the format changes),
  // so tapping "share" can call the native sheet immediately.
  useEffect(() => {
    let cancelled = false;
    let url: string | null = null;
    setBlob(null);
    setFailed(false);
    renderShareCard({
      percentage,
      totalSaved,
      goalAmount,
      goalLabel: goalText,
      headline,
      subline,
      siteUrl: window.location.origin,
      format,
    })
      .then((b) => {
        if (cancelled) return;
        url = URL.createObjectURL(b);
        setBlob(b);
        setPreviewUrl(url);
      })
      .catch((e) => {
        console.error("Share card failed", e);
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
    // theme: colors come from CSS variables
  }, [format, percentage, totalSaved, goalAmount, goalText, headline, subline, theme]);

  const fileName = `pote-sagrado-${pct}.png`;

  const download = () => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    addToast("Imagem salva 📸", "Agora é só postar nos Stories!", "success");
  };

  const shareNative = async () => {
    if (!blob) return;
    vibrate(15);
    const file = new File([blob], fileName, { type: "image/png" });
    const text = `${message} ${shareUrl()}`;
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text, title: "Pote Sagrado" });
        return;
      }
      if (navigator.share) {
        await navigator.share({ text, url: shareUrl(), title: "Pote Sagrado" });
        download();
        return;
      }
    } catch (e: any) {
      if (e?.name === "AbortError") return; // user closed the sheet
      console.warn("Native share failed, downloading instead", e);
    }
    download();
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`${message} ${shareUrl()}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${message} ${shareUrl()}`);
      addToast("Copiado!", "Cole onde quiser compartilhar.", "success");
    } catch {
      addToast("Ops!", "Não foi possível copiar.", "info");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 24, stiffness: 260 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-[400px] max-h-[100dvh] overflow-y-auto bg-[#1B0F14] text-white rounded-t-[32px] sm:rounded-[32px] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-sans text-[10px] uppercase tracking-[0.25em] font-bold text-white/50">Compartilhar</p>
            <h3 className="font-serif text-2xl leading-tight">{celebration || "Mostre sua conquista ✨"}</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-white/10" aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        {/* Format toggle */}
        <div className="flex p-1 rounded-full bg-white/10 mb-4">
          {(["story", "feed"] as ShareFormat[]).map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`flex-1 py-2 rounded-full font-sans text-[10px] uppercase tracking-widest font-bold transition-colors ${
                format === f ? "bg-white text-[#1B0F14]" : "text-white/60"
              }`}
            >
              {f === "story" ? "Stories 9:16" : "Feed 4:5"}
            </button>
          ))}
        </div>

        {/* Preview */}
        <div className={`relative mx-auto rounded-2xl overflow-hidden bg-white/5 ${format === "story" ? "w-[56%] aspect-[9/16]" : "w-[72%] aspect-[4/5]"}`}>
          {previewUrl && !failed ? (
            <img src={previewUrl} alt="Prévia da imagem para compartilhar" className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white/50">
              {failed ? <span className="font-sans text-xs px-4 text-center">Não foi possível gerar a imagem.</span> : <Loader2 className="animate-spin" />}
            </div>
          )}
        </div>

        <ShimmerButton
          onClick={shareNative}
          disabled={!blob}
          background="var(--theme-primary)"
          className="w-full mt-5 py-4 gap-2 font-sans text-xs uppercase tracking-[0.2em] font-bold disabled:opacity-50"
        >
          <Share2 size={16} /> Compartilhar imagem
        </ShimmerButton>

        <div className="grid grid-cols-3 gap-2 mt-3">
          <button onClick={download} disabled={!blob} className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-white/10 active:scale-95 disabled:opacity-40">
            <Download size={18} />
            <span className="font-sans text-[10px] font-bold">Salvar</span>
          </button>
          <button onClick={shareWhatsApp} className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-[#25D366]/20 text-[#7CF0A8] active:scale-95">
            <WhatsappIcon />
            <span className="font-sans text-[10px] font-bold">WhatsApp</span>
          </button>
          <button onClick={copyLink} className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-white/10 active:scale-95">
            <Link2 size={18} />
            <span className="font-sans text-[10px] font-bold">Copiar texto</span>
          </button>
        </div>

        <p className="font-sans text-[10px] text-white/40 text-center mt-4 leading-relaxed">
          Dica: poste nos Stories e marque quem está juntando com você 💞
        </p>
      </motion.div>
    </div>
  );
};
