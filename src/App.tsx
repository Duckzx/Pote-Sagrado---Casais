import React, { Suspense, lazy, ErrorInfo } from "react";
import { AnimatePresence, motion } from "motion/react";
import { loginWithGoogle, loginWithEmail } from "./firebase";
import { ColorBends } from "./components/ColorBends";
import { BottomNav } from "./components/BottomNav";
import { ConnectedToastContainer } from "./components/Toast";
import { GuidedTutorial } from "./components/GuidedTutorial";
import { LegalConsentPopup } from "./components/LegalConsentPopup";
import { PremiumModal } from "./components/PremiumModal";
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
  const addToast = useAppStore(s => s.addToast);
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

  const [loginError, setLoginError] = React.useState<string | null>(null);
  const [showPremiumModal, setShowPremiumModal] = React.useState(false);
  const [showAdminLogin, setShowAdminLogin] = React.useState(false);
  const [adminEmail, setAdminEmail] = React.useState("");
  const [adminPass, setAdminPass] = React.useState("");
  const [isLoggingInAdmin, setIsLoggingInAdmin] = React.useState(false);

  const previousDepositsRef = React.useRef(deposits);
  const prevShowOnboardingRef = React.useRef(showOnboarding);

  React.useEffect(() => {
    const handleOpenPremium = () => setShowPremiumModal(true);
    window.addEventListener('open-premium', handleOpenPremium);
    return () => window.removeEventListener('open-premium', handleOpenPremium);
  }, []);

  // Trigger Premium Modal after Onboarding
  React.useEffect(() => {
    if (prevShowOnboardingRef.current === true && showOnboarding === false) {
      // Just finished onboarding
      const timer = setTimeout(() => {
        setShowPremiumModal(true);
      }, 800);
      return () => clearTimeout(timer);
    }
    prevShowOnboardingRef.current = showOnboarding;
  }, [showOnboarding]);

  React.useEffect(() => {
    if (!user || deposits.length === 0) {
      previousDepositsRef.current = deposits;
      return;
    }

    const previous = previousDepositsRef.current;
    if (previous && previous.length > 0) {
      // ⚡ Bolt: Optimization - Use a Map for O(1) lookup of previous deposits instead of O(N) .find()
      const prevMap = new Map(previous.map(p => [p.id, p]));

      deposits.forEach((currentDep) => {
        const prevDep = prevMap.get(currentDep.id);
        if (prevDep) {
          if (
            currentDep.comments &&
            (!prevDep.comments || currentDep.comments.length > prevDep.comments.length)
          ) {
            // ⚡ Bolt: Optimization - Use a Set for O(1) lookup of previous comment IDs instead of O(M) .some()
            const prevCommentIds = new Set(prevDep.comments?.map((pc: any) => pc.id) || []);
            const newComments = currentDep.comments.filter(
              (c: any) => !prevCommentIds.has(c.id)
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
          20000, // give them more time to read
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

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail || !adminPass) {
      addToast("Atenção", "Preencha e-mail e senha", "info");
      return;
    }
    setIsLoggingInAdmin(true);
    try {
      await loginWithEmail(adminEmail, adminPass);
      // loginWithEmail will throw if it fails. If success, user state will update automatically via Firebase auth listener.
    } catch (e: any) {
      addToast("Erro", e.message || "Credenciais inválidas", "info");
    } finally {
      setIsLoggingInAdmin(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[100dvh] bg-transparent flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <ConnectedToastContainer />
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

        <div className="relative z-10 text-center space-y-10 max-w-[85%] md:max-w-md mx-auto w-full pt-12">
          <div className="space-y-6">
            <SacredJarIcon className="w-28 h-28 mx-auto animate-float drop-shadow-xl text-cookbook-primary" />
            <div className="space-y-4">
              <h1 className="font-serif text-[56px] leading-[0.9] text-cookbook-text font-medium tracking-tight">
                Pote<br/><span className="text-cookbook-primary italic">Sagrado</span>
              </h1>
              <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-cookbook-text/60 font-bold max-w-[200px] mx-auto leading-relaxed">
                O diário financeiro do casal
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-12">
            <button
              onClick={handleLoginClick}
              className="w-full bg-cookbook-text text-cookbook-bg font-sans text-[10px] uppercase tracking-[0.15em] py-5 rounded-2xl shadow-[0_12px_24px_rgba(0,0,0,0.12)] transition-transform active:scale-[0.98] flex items-center justify-center gap-3 font-bold"
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
          
          <div className="pt-6 border-t border-cookbook-border/30 max-w-[250px] mx-auto w-full">
            {!showAdminLogin ? (
              <button
                onClick={() => setShowAdminLogin(true)}
                className="w-full text-[10px] uppercase tracking-widest font-bold text-cookbook-text/40 hover:text-cookbook-text/60 transition-colors flex items-center justify-center gap-2"
              >
                Acesso Administrativo
              </button>
            ) : (
              <form onSubmit={handleAdminLogin} className="space-y-3 animate-fade-in text-left">
                <input
                  type="email"
                  placeholder="E-mail"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full bg-cookbook-bg/80 border border-cookbook-border px-3 py-2 rounded-xl text-sm font-sans focus:outline-none focus:border-cookbook-primary"
                />
                <input
                  type="password"
                  placeholder="Senha"
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  className="w-full bg-cookbook-bg/80 border border-cookbook-border px-3 py-2 rounded-xl text-sm font-sans focus:outline-none focus:border-cookbook-primary"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAdminLogin(false)}
                    className="flex-1 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-cookbook-text/50 bg-cookbook-bg border border-cookbook-border hover:bg-cookbook-border/30"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoggingInAdmin}
                    className="flex-1 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white bg-cookbook-primary shadow-sm hover:bg-cookbook-primary-hover disabled:opacity-50"
                  >
                    {isLoggingInAdmin ? "..." : "Entrar"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-transparent relative flex flex-col md:flex-row">
      <ConnectedToastContainer />
      <ColorBends
        color="var(--theme-border)"
        speed={0.1}
        intensity={0.5}
        className="opacity-30"
      />

      {/* Main Content Area - Expands on Desktop */}
      <div className="relative z-10 overflow-hidden pb-28 md:pb-0 w-full md:flex-1 md:ml-24 h-[100dvh] overflow-y-auto">
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
      </div>

      <BottomNav activeTab={activeTab} setActiveTab={handleTabChange} />

      <GuidedTutorial />
      {!hasSeenIntro && (
        <Suspense fallback={null}>
          <RemotionIntro onComplete={handleIntroComplete} />
        </Suspense>
      )}
      
      {/* LGPD Consent Modal for logged-in users */}
      <LegalConsentPopup />

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
