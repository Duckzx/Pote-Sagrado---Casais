import React, { Suspense, lazy, ErrorInfo } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ColorBends } from "./components/ColorBends";
import { BottomNav } from "./components/BottomNav";
import { ToastContainer } from "./components/Toast";
import { GuidedTutorial } from "./components/GuidedTutorial";
import { LegalConsentPopup } from "./components/LegalConsentPopup";
import { PremiumModal } from "./components/PremiumModal";
import { useAppStore } from "./store/useAppStore";
import { ModePicker } from "./components/ModePicker";
import { LoginScreen } from "./components/LoginScreen";
import { SyncIssueBanner } from "./components/Diagnostics";
import { MODE_TABS } from "./lib/mode";

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
const ExtratoTab = lazy(() =>
  import("./components/ExtratoTab").then((m) => ({ default: m.ExtratoTab })),
);
const LoveCardsTab = lazy(() =>
  import("./components/LoveCardsTab").then((m) => ({ default: m.LoveCardsTab })),
);

const RemotionIntro = React.lazy(() => import("./components/RemotionIntro"));
import { SacredJarIcon } from "./components/SacredJarIcon";
import { useFirebaseSync } from "./hooks/useFirebaseSync";
import { useNotifications } from "./hooks/useNotifications";

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
  useFirebaseSync();
  useNotifications();

  const isTermos = window.location.pathname === "/termos";

  const [hasSeenIntro, setHasSeenIntro] = React.useState(() => {
    return localStorage.getItem("pote_hasSeenIntro") === "true";
  });

  const handleIntroComplete = () => {
    setHasSeenIntro(true);
    localStorage.setItem("pote_hasSeenIntro", "true");
  };

  const tabDirection = useAppStore(s => s.tabDirection);
  const handleTabChange = useAppStore(s => s.setActiveTab);
  const toasts = useAppStore(s => s.toasts);
  const addToast = useAppStore(s => s.addToast);
  const removeToast = useAppStore(s => s.removeToast);
  const showOnboarding = useAppStore(s => s.showOnboarding);
  const handleCompleteOnboarding = useAppStore(s => s.completeOnboarding);

  const user = useAppStore(s => s.user);
  const casalId = useAppStore(s => s.casalId);
  const isAuthReady = useAppStore(s => s.isAuthReady);
  const isDataReady = useAppStore(s => s.isDataReady);
  const activeTab = useAppStore(s => s.activeTab);
  const tripConfig = useAppStore(s => s.tripConfig);
  const deposits = useAppStore(s => s.deposits);
  const achievements = useAppStore(s => s.achievements);
  const totalSaved = useAppStore(s => s.totalSaved);
  const bingoStats = useAppStore(s => s.bingoStats);
  const theme = useAppStore(s => s.theme);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme || "cookbook");
  }, [theme]);

  const mode = useAppStore(s => s.mode);
  const needsModeChoice = useAppStore(s => s.needsModeChoice);
  const lgpdConsent = useAppStore(s => s.lgpdConsent);

  // Each tab starts at the top
  React.useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [activeTab]);

  // A tab that doesn't exist in the current mode (or a stale saved tab) falls back to Home
  React.useEffect(() => {
    if (!MODE_TABS[mode].includes(activeTab)) handleTabChange("home");
  }, [mode, activeTab, handleTabChange]);

  const [showPremiumModal, setShowPremiumModal] = React.useState(false);

  const previousDepositsRef = React.useRef(deposits);

  React.useEffect(() => {
    const handleOpenPremium = () => setShowPremiumModal(true);
    window.addEventListener('open-premium', handleOpenPremium);
    return () => window.removeEventListener('open-premium', handleOpenPremium);
  }, []);


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

  if (isTermos) {
    return (
      <div className="min-h-[100dvh] bg-cookbook-bg p-6 text-cookbook-text font-serif">
        <h1 className="text-2xl font-bold mb-4">Termos de Uso e LGPD</h1>
        <div className="space-y-4 text-sm opacity-80 font-sans">
          <p>Bem-vindo ao Pote Sagrado. Ao utilizar este aplicativo, coletamos apenas dados mínimos necessários (e-mail, nome, e id do dispositivo) para manter o registro de contas do casal em sincronia e enviar notificações básicas de gastos.</p>
          <p>Garantimos os seguintes direitos amparados pela Lei Geral de Proteção de Dados (LGPD):</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Transparência:</strong> Seus dados não são vendidos e servem unicamente para uso do aplicativo.</li>
            <li><strong>Direito de Exclusão (Esquecimento):</strong> Você pode apagar todos os seus dados nas Configurações clicando em "Eliminar Minha Conta". Todos os registros serão removidos permanentemente.</li>
            <li><strong>Restrição de Acesso:</strong> Seus dados financeiros e fotos só são visíveis pelo seu perfil e o perfil emparelhado.</li>
          </ul>
          <p>Para dúvidas e solicitações de dados, entre em contato via <a href="mailto:suporte@potesagrado.com" className="text-cookbook-primary underline">suporte@potesagrado.com</a></p>
        </div>
        <button onClick={() => window.location.assign("/")} className="mt-8 px-6 py-2 bg-cookbook-primary text-white rounded-full font-bold uppercase tracking-widest text-xs">Voltar ao App</button>
      </div>
    );
  }

  if (!isAuthReady) {
    return (
      <div className="min-h-[100dvh] bg-cookbook-bg flex items-center justify-center">
        <div className="animate-pulse font-serif text-cookbook-text">
          Carregando...
        </div>
      </div>
    );
  }

  if (!user) return <LoginScreen />;

  return (
    <div className="min-h-[100dvh] bg-transparent relative flex flex-col md:flex-row">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <ColorBends
        color="var(--theme-border)"
        speed={0.1}
        intensity={0.5}
        className="opacity-30"
      />

      {/* Main Content Area - Expands on Desktop */}
      <main className="relative pb-[calc(7rem+env(safe-area-inset-bottom))] md:pb-0 w-full md:flex-1 md:ml-24 min-h-[100dvh]">
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
              <ErrorBoundary>
                <Suspense fallback={<TabSkeleton />}>
                  {activeTab === "home" && tripConfig && (
                  <HomeTab
                  currentUser={user}
                  goalType={tripConfig.goalType}
                  destination={tripConfig.destination}
                  origin={tripConfig.origin}
                  goalAmount={tripConfig.goalAmount}
                  totalSaved={totalSaved}
                  deposits={deposits}
                  achievements={achievements}
                  sharedAlbumUrl={tripConfig.sharedAlbumUrl}
                  relationshipStartDate={tripConfig.relationshipStartDate}
                  addToast={addToast}
                />
              )}
              {activeTab === "missoes" && tripConfig && (
                <MissoesTab
                  stats={bingoStats}
                  customChallenges={tripConfig.customChallenges}
                  battleChallenges={tripConfig.battleChallenges}
                  deposits={deposits}
                  currentUser={user}
                  addToast={addToast}
                />
              )}
              {activeTab === "mural" && <PinboardTab addToast={addToast} />}
              {activeTab === "disputa" && tripConfig && (
                <DisputaTab
                  deposits={deposits}
                  prize={tripConfig.monthlyPrize}
                  addToast={addToast}
                />
              )}
              {activeTab === "lovecards" && <LoveCardsTab />}
              {activeTab === "extrato" && (
                <div className="pb-32 md:pb-12 pt-6 px-4 w-full max-w-md md:max-w-3xl mx-auto">
                  <ExtratoTab deposits={deposits} addToast={addToast} casalId={casalId} />
                </div>
              )}
              {activeTab === "config" && tripConfig && (
                <ConfigTab
                  currentGoalType={tripConfig?.goalType || 'travel'}
                  currentDestination={tripConfig?.destination || ''}
                  currentOrigin={tripConfig?.origin || ''}
                  currentGoalAmount={tripConfig?.goalAmount || 0}
                  currentTheme={theme}
                  customChallenges={tripConfig?.customChallenges || []}
                  currentSharedAlbumUrl={tripConfig?.sharedAlbumUrl || ''}
                  currentPrize={tripConfig?.monthlyPrize || ''}
                  relationshipStartDate={tripConfig?.relationshipStartDate || ''}
                  addToast={addToast}
                />
              )}
              </Suspense>
              </ErrorBoundary>
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={handleTabChange} />

      <GuidedTutorial />
      {!hasSeenIntro && (
        <Suspense fallback={null}>
          <RemotionIntro onComplete={handleIntroComplete} />
        </Suspense>
      )}
      
      <SyncIssueBanner />

      {/* LGPD Consent Modal for logged-in users */}
      <LegalConsentPopup />

      {/* First choice: solo, couple or group */}
      {needsModeChoice && lgpdConsent && casalId && <ModePicker />}

      {/* Cookie Consent Banner */}
      {!localStorage.getItem("pote_cookies_accepted") && (
         <div className="fixed bottom-0 md:bottom-4 left-0 md:left-4 right-0 md:right-4 z-50 p-4 bg-cookbook-bg/95 backdrop-blur-xl border-t md:border border-cookbook-border md:rounded-2xl shadow-2xl flex flex-col md:flex-row gap-4 items-center justify-between mx-auto max-w-4xl max-h-[50vh] overflow-y-auto w-full animate-slide-up pb-8 md:pb-4 border-l-4 sm:border-l-0 border-l-cookbook-primary">
            <div className="flex-1 pr-0 md:pr-4">
              <h4 className="font-serif text-base text-cookbook-text font-bold mb-1">Nós respeitamos sua privacidade (LGPD)</h4>
              <p className="font-sans text-xs text-cookbook-text/70 leading-relaxed max-w-prose">
                Utilizamos cookies apenas para o funcionamento essencial do app (manter sua sessão ativa e salvar preferências locais). Não vendemos seus dados nem exibimos anúncios rastreados. Ao continuar navegando você concorda com nossos Termos de Uso.
              </p>
            </div>
            <div className="flex w-full md:w-auto items-center gap-3 shrink-0 flex-col sm:flex-row">
              <button 
                onClick={() => {
                   window.dispatchEvent(new CustomEvent('open-legal', { detail: 'termos' }));
                }}
                className="font-sans text-[11px] uppercase tracking-widest text-cookbook-text/50 hover:text-cookbook-primary font-bold transition-colors w-full sm:w-auto py-2"
              >
                 Ler Termos
              </button>
              <button 
                 onClick={() => {
                   localStorage.setItem("pote_cookies_accepted", "true");
                   // re-render trick or just let react handle it via state
                   window.location.reload();
                 }}
                 className="bg-cookbook-primary text-white font-sans text-xs uppercase tracking-widest py-3 px-6 rounded-full font-bold hover:bg-cookbook-primary-hover active:scale-[0.98] transition-all shadow-md w-full sm:w-auto"
              >
                 Ciente e Aceito
              </button>
            </div>
         </div>
      )}

      <AnimatePresence>
        {showPremiumModal && (
          <PremiumModal onClose={() => setShowPremiumModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ========================================
// Root App
// ========================================
import { LegalModal, LegalDocType } from './components/LegalModal';

export default function App() {
  const [legalDoc, setLegalDoc] = React.useState<LegalDocType>(null);
  
  React.useEffect(() => {
    const handleOpenLegal = (e: any) => {
       if (e.detail) setLegalDoc(e.detail as LegalDocType);
    };
    window.addEventListener('open-legal', handleOpenLegal);
    return () => window.removeEventListener('open-legal', handleOpenLegal);
  }, []);

  return (
    <ErrorBoundary>
      <AppContent />
      <LegalModal type={legalDoc} onClose={() => setLegalDoc(null)} />
    </ErrorBoundary>
  );
}
