import React, { Suspense, lazy } from "react";
import { AnimatePresence, motion } from "motion/react";
import { loginWithGoogle } from "./firebase";
import { ColorBends } from "./components/ColorBends";
import { BottomNav } from "./components/BottomNav";
import { ToastContainer } from "./components/Toast";
import { OnboardingModal } from "./components/OnboardingModal";
import { AppProvider, useAppContext } from "./context/AppContext";
import { useAppStore } from "./store/useAppStore";

// ========================================
// Code Splitting — Lazy loaded tabs (T3)
// ========================================
const HomeTab = lazy(() =>
  import("./components/HomeTab").then((m) => ({ default: m.HomeTab })),
);
const MissoesTab = lazy(() =>
  import("./components/MissoesTab").then((m) => ({ default: m.MissoesTab })),
);
const PinboardTab = lazy(() =>
  import("./components/PinboardTab").then((m) => ({ default: m.PinboardTab })),
);
const DisputaTab = lazy(() =>
  import("./components/DisputaTab").then((m) => ({ default: m.DisputaTab })),
);
const ConfigTab = lazy(() =>
  import("./components/ConfigTab").then((m) => ({ default: m.ConfigTab })),
);

import { RemotionIntro } from "./components/RemotionIntro";
import { SacredJarIcon } from "./components/SacredJarIcon";

// ========================================
// Error Boundary
// ========================================
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      let message = "Ocorreu um erro inesperado.";
      let stack = "";
      try {
        if (this.state.error) {
          message = this.state.error.message || String(this.state.error);
          stack = this.state.error.stack || "";

          try {
            const errInfo = JSON.parse(this.state.error.message);
            if (
              errInfo.error?.includes("Missing or insufficient permissions")
            ) {
              message =
                "Você não tem permissão para realizar esta ação ou acessar estes dados.";
            } else {
              message = errInfo.error || message;
            }
          } catch {}
        }
      } catch {
        /* fallback message */
      }
      return (
        <div className="min-h-[100dvh] bg-cookbook-bg flex flex-col items-center justify-center p-6 text-center overflow-auto">
          <h2 className="font-serif text-2xl text-red-500 mb-4">
            Ops! Algo deu errado.
          </h2>
          <p className="font-sans text-sm text-cookbook-text/80 font-bold mb-2">
            Error:
          </p>
          <p className="font-mono text-xs text-cookbook-text/60 mb-4 break-all bg-black/5 p-4 rounded text-left overflow-auto max-h-32 w-full">
            {message}
          </p>
          {stack && (
            <>
              <p className="font-sans text-sm text-cookbook-text/80 font-bold mb-2">
                Stack:
              </p>
              <pre className="font-mono text-[10px] text-cookbook-text/50 mb-8 break-all bg-black/5 p-4 rounded text-left overflow-auto max-h-64 w-full">
                {stack}
              </pre>
            </>
          )}
          <button
            onClick={() => window.location.reload()}
            className="bg-cookbook-primary text-white px-6 py-3 rounded font-bold text-xs uppercase tracking-widest"
          >
            Recarregar App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ========================================
// Tab Loading Fallback
// ========================================
function TabSkeleton() {
  return (
    <div className="pb-24 pt-6 px-6 max-w-md mx-auto space-y-6">
      <div className="h-8 bg-cookbook-border/30 rounded-lg animate-pulse w-48 mx-auto" />
      <div className="h-20 bg-cookbook-border/20 rounded-xl animate-pulse" />
      <div className="h-40 bg-cookbook-border/20 rounded-xl animate-pulse" />
      <div className="h-24 bg-cookbook-border/20 rounded-xl animate-pulse" />
    </div>
  );
}

// ========================================
// Inner App (uses context)
// ========================================
function AppContent() {
  const [hasSeenIntro, setHasSeenIntro] = React.useState(() => {
    return localStorage.getItem("pote_hasSeenIntro") === "true";
  });

  const handleIntroComplete = () => {
    setHasSeenIntro(true);
    localStorage.setItem("pote_hasSeenIntro", "true");
  };

  const {
    user,
    isAuthReady,
    isDataReady,
    activeTab,
    tabDirection,
    handleTabChange,
    toasts,
    addToast,
    removeToast,
    showOnboarding,
    handleCompleteOnboarding,
  } = useAppContext();

  // Notification Logic
  const deposits = useAppStore(s => s.deposits);
  const previousDepositsRef = React.useRef(deposits);

  React.useEffect(() => {
    if (!user || deposits.length === 0) {
      previousDepositsRef.current = deposits;
      return;
    }

    const previous = previousDepositsRef.current;
    if (previous && previous.length > 0) {
      deposits.forEach((currentDep) => {
        const prevDep = previous.find((p) => p.id === currentDep.id);
        if (prevDep) {
          if (
            currentDep.comments &&
            (!prevDep.comments || currentDep.comments.length > prevDep.comments.length)
          ) {
            const newComments = currentDep.comments.filter(
              (c: any) => !prevDep.comments?.some((pc: any) => pc.id === c.id)
            );
            newComments.forEach((nc: any) => {
              if (nc.who !== user.uid) {
                const messages = [
                  "Como é bom ler isso! 🥰",
                  "Alguém lembrou de você! 💌",
                  "Seu pote está cheio de amor! 💕",
                  "Uma surpresa pra você! 🌷",
                ];
                const randomMsg = messages[Math.floor(Math.random() * messages.length)];
                addToast(
                  "Novo Comentário!",
                  `${nc.whoName} comentou: "${nc.text}"\n\n${randomMsg}`,
                  "success"
                );
              }
            });
          }

          if (currentDep.reactions) {
            Object.keys(currentDep.reactions).forEach((uid) => {
              if (uid !== user.uid && (!prevDep.reactions || !prevDep.reactions[uid])) {
                const messages = [
                  "Você fisgou um coração! 💘",
                  "Olha quem amou isso! ✨",
                  "Mais um sorriso no pote! 😊",
                  "Amor espalhado com sucesso! 💖",
                ];
                const randomMsg = messages[Math.floor(Math.random() * messages.length)];
                addToast(
                  "Nova Curtida!",
                  `${randomMsg}\n\nSeu parceiro reagiu a um depósito.`,
                  "success"
                );
              }
            });
          }
        }
      });
    }

    previousDepositsRef.current = deposits;
  }, [deposits, user, addToast]);

  const [loginError, setLoginError] = React.useState<string | null>(null);

  if (!isAuthReady) {
    return (
      <div className="min-h-[100dvh] bg-cookbook-bg flex items-center justify-center">
        <div className="animate-pulse font-serif text-cookbook-text">
          Carregando...
        </div>
      </div>
    );
  }

  const handleLoginClick = async () => {
    setLoginError(null);
    try {
      await loginWithGoogle();
    } catch (e: any) {
      if (e?.code === "auth/unauthorized-domain") {
        setLoginError("unauthorized");
        addToast(
          "Domínio Não Autorizado",
          `Poxa! O link externo (pote-sagrado-casais.vercel.app) não está autorizado no Firebase. Lembre-se de adicionar: \n1. pote-sagrado-casais.vercel.app no Firebase (Auth > Settings > Authorized domains)\n2. No Google Cloud Console (OAuth 2.0 Web Client). \n\nPara acessar pelo Vercel, isto é essencial!`,
          "info",
          20000,
        );
      } else if (e.message?.includes("bloqueado")) {
        setLoginError("blocked");
        addToast(
          "Acesso Bloqueado pelo Navegador",
          `O navegador deste App (ex: Instagram/WhatsApp) bloqueou o login. Por favor, copie e abra este link externamente no Chrome/Safari: \n\nhttps://pote-sagrado-casais.vercel.app/`,
          "info",
          20000,
        );
      } else {
        setLoginError("general");
        addToast(
          "Ops!",
          e.message || "Erro ao tentar entrar. Tente novamente!",
          "info",
        );
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-[100dvh] bg-transparent flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        <ColorBends
          color="#8E7F6D"
          speed={0.2}
          frequency={1.0}
          noise={0.15}
          bandWidth={0.14}
          rotation={90}
          fadeTop={0.75}
          iterations={1}
          intensity={1.3}
        />

        <div className="relative z-10 text-center space-y-8 max-w-sm w-full">
          <div className="space-y-4">
            <SacredJarIcon className="w-24 h-24 mx-auto animate-float" />
            <div className="space-y-2">
              <h1 className="font-serif text-4xl text-cookbook-text">
                Pote Sagrado
              </h1>
              <p className="font-sans text-xs uppercase tracking-widest text-cookbook-text/60">
                O diário financeiro do casal
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleLoginClick}
              className="w-full bg-cookbook-text text-white font-sans text-xs uppercase tracking-widest py-4 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              Entrar com Google
            </button>

            {loginError === "blocked" && (
              <div className="bg-white/60 p-4 rounded-xl text-left shadow-sm mt-4 font-sans text-xs text-cookbook-text border border-red-200/50">
                <p className="font-bold mb-2">
                  Bloqueio do Navegador Detectado!
                </p>
                <p className="mb-4">
                  O Instagram/WhatsApp não permite login pelo Google nesta tela.
                </p>
                <p className="mb-4 font-bold">Como resolver:</p>
                <ol className="list-decimal pl-4 mb-4 space-y-1">
                  <li>Copie o link abaixo</li>
                  <li>Abra o Chrome ou Safari</li>
                  <li>Cole na barra de endereços e acesse</li>
                </ol>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      "https://pote-sagrado-casais.vercel.app/",
                    );
                    addToast(
                      "Link copiado!",
                      "Agora abra o Safari ou Chrome e cole na barra de busca.",
                      "success",
                    );
                  }}
                  className="w-full bg-white/40 border border-white/40 text-cookbook-text font-bold py-3 rounded-2xl flex items-center justify-center gap-2"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect
                      x="9"
                      y="9"
                      width="13"
                      height="13"
                      rx="2"
                      ry="2"
                    ></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  Copiar Link para Acesso Normal
                </button>
              </div>
            )}
            {loginError === "unauthorized" && (
              <div className="bg-white/60 p-4 rounded-xl text-left shadow-sm mt-4 font-sans text-xs text-cookbook-text border border-orange-200/50">
                <p className="font-bold mb-2">
                  Configuração do Firebase Pendente
                </p>
                <p className="mb-2">
                  Para entrar pelo{" "}
                  <strong className="font-bold">
                    pote-sagrado-casais.vercel.app
                  </strong>{" "}
                  você deve adicionar este domínio como Autorizado.
                </p>
                <p className="mb-1 text-[10px] opacity-80">
                  No painel do Firebase: Authentication &gt; Settings &gt;
                  Authorized Domains
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-transparent relative">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <ColorBends
        color="var(--theme-border)"
        speed={0.1}
        intensity={0.5}
        className="opacity-30"
      />

      <div className="relative z-10 overflow-hidden pb-28">
        {!isDataReady ? (
          <TabSkeleton />
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: tabDirection * 15, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: tabDirection * -15, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
            >
              <Suspense fallback={<TabSkeleton />}>
                {activeTab === "home" && <HomeTab />}
                {activeTab === "missoes" && <MissoesTab />}
                {activeTab === "mural" && <PinboardTab />}
                {activeTab === "disputa" && <DisputaTab />}
                {activeTab === "config" && <ConfigTab />}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <BottomNav activeTab={activeTab} setActiveTab={handleTabChange} />

      {showOnboarding && (
        <OnboardingModal onComplete={handleCompleteOnboarding} />
      )}
      {!hasSeenIntro && <RemotionIntro onComplete={handleIntroComplete} />}
    </div>
  );
}

// ========================================
// Root App
// ========================================
export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
