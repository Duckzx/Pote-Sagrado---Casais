import React, { Suspense, lazy } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { loginWithGoogle } from './firebase';
import { ColorBends } from './components/ColorBends';
import { BottomNav } from './components/BottomNav';
import { ToastContainer } from './components/Toast';
import { OnboardingModal } from './components/OnboardingModal';
import { AppProvider, useAppContext } from './context/AppContext';

// ========================================
// Code Splitting — Lazy loaded tabs (T3)
// ========================================
const HomeTab = lazy(() => import('./components/HomeTab').then(m => ({ default: m.HomeTab })));
const MissoesTab = lazy(() => import('./components/MissoesTab').then(m => ({ default: m.MissoesTab })));
const ExtratoTab = lazy(() => import('./components/ExtratoTab').then(m => ({ default: m.ExtratoTab })));
const DisputaTab = lazy(() => import('./components/DisputaTab').then(m => ({ default: m.DisputaTab })));
const ConfigTab = lazy(() => import('./components/ConfigTab').then(m => ({ default: m.ConfigTab })));

// ========================================
// Error Boundary
// ========================================
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
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
      try {
        const errInfo = JSON.parse(this.state.error?.message || '');
        if (errInfo.error.includes('Missing or insufficient permissions')) {
          message = "Você não tem permissão para realizar esta ação ou acessar estes dados.";
        }
      } catch { /* fallback message */ }
      return (
        <div className="min-h-[100dvh] bg-cookbook-bg flex flex-col items-center justify-center p-6 text-center">
          <h2 className="font-serif text-2xl text-cookbook-text mb-4">Ops! Algo deu errado.</h2>
          <p className="font-sans text-sm text-cookbook-text/60 mb-8">{message}</p>
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
  const {
    user,
    isAuthReady,
    activeTab,
    tabDirection,
    handleTabChange,
    tripConfig,
    deposits,
    totalSaved,
    bingoStats,
    theme,
    toasts,
    addToast,
    removeToast,
    showOnboarding,
    handleCompleteOnboarding,
  } = useAppContext();

  if (!isAuthReady) {
    return (
      <div className="min-h-[100dvh] bg-cookbook-bg flex items-center justify-center">
        <div className="animate-pulse font-serif text-cookbook-text">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[100dvh] bg-cookbook-bg flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <ColorBends color="#8E7F6D" speed={0.2} frequency={1.0} noise={0.15} bandWidth={0.14} rotation={90} fadeTop={0.75} iterations={1} intensity={1.3} />
        
        <div className="relative z-10 text-center space-y-8 max-w-sm">
          <div className="space-y-2">
            <h1 className="font-serif text-4xl text-cookbook-text">Pote Sagrado</h1>
            <p className="font-sans text-xs uppercase tracking-widest text-cookbook-text/60">
              O diário financeiro do casal
            </p>
          </div>
          
          <button
            onClick={loginWithGoogle}
            className="w-full bg-cookbook-text text-white font-sans text-xs uppercase tracking-widest py-4 rounded-xl shadow-lg transition-transform active:scale-95"
          >
            Entrar com Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-cookbook-bg relative">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <ColorBends color="var(--theme-border)" speed={0.1} intensity={0.5} className="opacity-30" />
      
      <div className="relative z-10 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: tabDirection * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: tabDirection * -40 }}
            transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <Suspense fallback={<TabSkeleton />}>
              {activeTab === 'home' && (
                <HomeTab 
                  currentUser={user}
                  destination={tripConfig.destination} 
                  origin={tripConfig.origin}
                  goalAmount={tripConfig.goalAmount} 
                  totalSaved={totalSaved}
                  deposits={deposits}
                  targetDate={tripConfig.targetDate}
                  addToast={addToast}
                />
              )}
              {activeTab === 'missoes' && (
                <MissoesTab 
                  stats={bingoStats} 
                  customChallenges={tripConfig.customChallenges}
                  battleChallenges={tripConfig.battleChallenges}
                  deposits={deposits}
                  currentUser={user}
                  addToast={addToast}
                />
              )}
              {activeTab === 'extrato' && <ExtratoTab deposits={deposits} addToast={addToast} />}
              {activeTab === 'disputa' && <DisputaTab deposits={deposits} prize={tripConfig.monthlyPrize} />}
              {activeTab === 'config' && (
                <ConfigTab 
                  currentDestination={tripConfig.destination} 
                  currentOrigin={tripConfig.origin}
                  currentGoalAmount={tripConfig.goalAmount} 
                  currentTheme={theme}
                  customChallenges={tripConfig.customChallenges}
                  currentTargetDate={tripConfig.targetDate}
                  currentPrize={tripConfig.monthlyPrize}
                  addToast={addToast}
                />
              )}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </div>

      <BottomNav activeTab={activeTab} setActiveTab={handleTabChange} />
      
      {showOnboarding && <OnboardingModal onComplete={handleCompleteOnboarding} />}
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
