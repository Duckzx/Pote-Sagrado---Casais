import React, { useEffect, useState, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { auth, db, loginWithGoogle } from './firebase';
import { ColorBends } from './components/ColorBends';
import { BottomNav } from './components/BottomNav';
import { HomeTab } from './components/HomeTab';
import { MissoesTab } from './components/MissoesTab';
import { ExtratoTab } from './components/ExtratoTab';
import { DisputaTab } from './components/DisputaTab';
import { ConfigTab } from './components/ConfigTab';
import { ToastContainer, ToastMessage } from './components/Toast';

import { handleFirestoreError, OperationType } from './lib/firestore-errors';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      let message = "Ocorreu um erro inesperado.";
      try {
        const errInfo = JSON.parse(this.state.error.message);
        if (errInfo.error.includes('Missing or insufficient permissions')) {
          message = "Você não tem permissão para realizar esta ação ou acessar estes dados.";
        }
      } catch (e) {}
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

import { OnboardingModal } from './components/OnboardingModal';

import { ExpensesTab } from './components/ExpensesTab';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  const [tripConfig, setTripConfig] = useState({ destination: '', origin: '', goalAmount: 0, lat: 0, lng: 0, customChallenges: [] as any[], targetDate: '', monthlyPrize: '', battleChallenges: [] as any[] });
  const [deposits, setDeposits] = useState<any[]>([]);
  const [totalSaved, setTotalSaved] = useState(0);
  const [bingoStats, setBingoStats] = useState<Record<string, number>>({});
  const [theme, setTheme] = useState('cookbook');
  
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const prevTotalRef = useRef<number>(0);
  const isInitialLoad = useRef<boolean>(true);

  const addToast = (title: string, message: string, type: 'info' | 'success' | 'milestone' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
      
      if (currentUser) {
        const hasSeenOnboarding = localStorage.getItem(`onboarding_${currentUser.uid}`);
        if (!hasSeenOnboarding) {
          setShowOnboarding(true);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleCompleteOnboarding = () => {
    if (user) {
      localStorage.setItem(`onboarding_${user.uid}`, 'true');
    }
    setShowOnboarding(false);
  };

  useEffect(() => {
    if (!isAuthReady || !user) return;

    // Listen to user profile for theme
    const unsubUser = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists() && docSnap.data().theme) {
        setTheme(docSnap.data().theme);
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${user.uid}`));

    // Listen to trip config
    const unsubConfig = onSnapshot(doc(db, 'trip_config', 'main'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as any;
        setTripConfig(prev => ({ ...prev, ...data }));
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, 'trip_config/main'));

    // Listen to deposits
    const q = query(collection(db, 'deposits'), orderBy('createdAt', 'desc'));
    const unsubDeposits = onSnapshot(q, (querySnapshot) => {
      const deps: any[] = [];
      let total = 0;
      const stats: Record<string, number> = {};

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        deps.push({ id: docSnap.id, ...data });
        
        if (data.type === 'expense') {
          total -= data.amount || 0;
        } else {
          total += data.amount || 0;
        }
        
        if (data.action && data.type !== 'expense') {
          stats[data.action] = (stats[data.action] || 0) + 1;
        }
      });

      setDeposits(deps);
      setTotalSaved(total);
      setBingoStats(stats);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'deposits'));

    return () => {
      unsubUser();
      unsubConfig();
      unsubDeposits();
    };
  }, [isAuthReady, user]);

  // Milestone and Notification Logic
  useEffect(() => {
    // Request Notification permission

    if (isInitialLoad.current) {
      // Don't trigger notifications on initial data load
      if (totalSaved > 0 || tripConfig.goalAmount > 0) {
        isInitialLoad.current = false;
        prevTotalRef.current = totalSaved;
      }
      return;
    }

    const prevTotal = prevTotalRef.current;
    const goal = tripConfig.goalAmount;

    if (totalSaved > prevTotal) {
      const diff = totalSaved - prevTotal;
      const msg = `Mais ${Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(diff)} para a viagem!`;
      addToast('Novo Depósito!', msg, 'success');
      
      if (goal > 0) {
        const prevPercentage = (prevTotal / goal) * 100;
        const currentPercentage = (totalSaved / goal) * 100;

        const milestones = [25, 50, 75, 90, 100];
        for (const milestone of milestones) {
          if (prevPercentage < milestone && currentPercentage >= milestone) {
            let mTitle = 'Marco Alcançado!';
            let mBody = `Vocês chegaram a ${milestone}% da meta! Continuem assim!`;
            
            if (milestone === 100) {
              mTitle = '🎉 META ATINGIDA! 🎉';
              mBody = 'Vocês conseguiram! O Pote Sagrado está cheio!';
              addToast(mTitle, mBody, 'milestone');
            } else {
              addToast(mTitle, mBody, 'milestone');
            }
            break; // Only trigger the highest crossed milestone
          }
        }
      }
    }

    prevTotalRef.current = totalSaved;
  }, [totalSaved, tripConfig.goalAmount]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

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
    <ErrorBoundary>
      <div className="min-h-[100dvh] bg-cookbook-bg relative">
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        <ColorBends color="var(--theme-border)" speed={0.1} intensity={0.5} className="opacity-30" />
        
        <div className="relative z-10">
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
        </div>

        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {showOnboarding && <OnboardingModal onComplete={handleCompleteOnboarding} />}
      </div>
    </ErrorBoundary>
  );
}
