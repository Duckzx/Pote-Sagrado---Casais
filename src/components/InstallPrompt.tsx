import React, { useEffect, useState } from "react";
import { Download, X, Share, PlusSquare } from "lucide-react";
import { useAppStore } from "../store/useAppStore";

const DISMISS_KEY = "pote_installDismissedAt";

const isStandalone = () =>
  window.matchMedia?.("(display-mode: standalone)").matches || (navigator as any).standalone === true;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) && !/crios|fxios/i.test(navigator.userAgent);

/** Captures the browser's install event once for the whole app. */
export function listenForInstallPrompt() {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    const { setInstallPrompt, setCanInstall } = useAppStore.getState();
    setInstallPrompt(e);
    setCanInstall(true);
  });
  window.addEventListener("appinstalled", () => useAppStore.getState().clearInstallPrompt());
}

/**
 * "Instale o app": native install on Android/Chrome, step-by-step guide on
 * iPhone (Safari has no install prompt). Dismissible for 2 weeks.
 */
export const InstallPrompt: React.FC = () => {
  const canInstall = useAppStore((s) => s.canInstall);
  const installPrompt = useAppStore((s) => s.installPrompt);
  const clearInstallPrompt = useAppStore((s) => s.clearInstallPrompt);
  const [dismissed, setDismissed] = useState(true);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    try {
      const at = Number(localStorage.getItem(DISMISS_KEY) || 0);
      setDismissed(Date.now() - at < 14 * 24 * 60 * 60 * 1000);
    } catch {
      setDismissed(false);
    }
  }, []);

  if (dismissed || isStandalone()) return null;
  const ios = isIOS();
  if (!ios && !(canInstall && installPrompt)) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
    setDismissed(true);
  };

  const install = async () => {
    if (ios) {
      setShowIosGuide((v) => !v);
      return;
    }
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") clearInstallPrompt();
  };

  return (
    <div className="relative rounded-3xl p-4 border border-cookbook-primary/25 bg-cookbook-primary/[0.07]">
      <div className="flex items-center gap-3">
        <div className="bg-cookbook-primary text-cookbook-on-primary p-2.5 rounded-2xl shrink-0">
          <Download size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-serif text-lg text-cookbook-text leading-tight">Tenha o pote na tela inicial</p>
          <p className="font-sans text-[11px] text-cookbook-text/70">Abre mais rápido, em tela cheia, como um app.</p>
        </div>
        <button onClick={install} className="shrink-0 text-[11px] bg-cookbook-primary text-cookbook-on-primary px-3.5 py-2 rounded-full font-bold uppercase tracking-wider">
          {ios ? "Como?" : "Instalar"}
        </button>
      </div>
      {showIosGuide && (
        <ol className="mt-3 space-y-2 font-sans text-xs text-cookbook-text/80">
          <li className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-cookbook-primary text-cookbook-on-primary text-[11px] font-bold flex items-center justify-center">1</span>
            Toque em <Share size={14} className="inline text-cookbook-primary" /> <b>Compartilhar</b> na barra do Safari
          </li>
          <li className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-cookbook-primary text-cookbook-on-primary text-[11px] font-bold flex items-center justify-center">2</span>
            Escolha <PlusSquare size={14} className="inline text-cookbook-primary" /> <b>Adicionar à Tela de Início</b>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-cookbook-primary text-cookbook-on-primary text-[11px] font-bold flex items-center justify-center">3</span>
            Toque em <b>Adicionar</b>. Pronto! 🍯
          </li>
        </ol>
      )}
      <button onClick={dismiss} className="absolute top-2 right-2 p-1 text-cookbook-text/70" aria-label="Dispensar">
        <X size={14} />
      </button>
    </div>
  );
};
