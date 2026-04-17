import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import type { Deposit, TripConfig, TabId, AddToastFn, ThemeId, AppUser, DEFAULT_TRIP_CONFIG } from '../types';
import { TAB_ORDER } from '../types';

// ========================================
// Toast Types
// ========================================

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'milestone';
}

// ========================================
// Context Shape
// ========================================

interface AppContextValue {
  // Auth
  user: AppUser | null;
  isAuthReady: boolean;

  // Navigation
  activeTab: TabId;
  tabDirection: number;
  handleTabChange: (tab: TabId) => void;

  // Data
  tripConfig: TripConfig;
  deposits: Deposit[];
  totalSaved: number;
  bingoStats: Record<string, number>;

  // Theme
  theme: ThemeId;

  // Toasts
  toasts: ToastMessage[];
  addToast: AddToastFn;
  removeToast: (id: string) => void;

  // Onboarding
  showOnboarding: boolean;
  handleCompleteOnboarding: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

// ========================================
// Hook
// ========================================

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}

// ========================================
// Provider
// ========================================

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [tabDirection, setTabDirection] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const [tripConfig, setTripConfig] = useState<TripConfig>(() => {
    const saved = localStorage.getItem('pote_tripConfig');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* fallback */ }
    }
    return { destination: '', origin: '', goalAmount: 0, lat: 0, lng: 0, customChallenges: [], battleChallenges: [], targetDate: '', monthlyPrize: '' };
  });

  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [totalSaved, setTotalSaved] = useState(() => {
    const saved = localStorage.getItem('pote_totalSaved');
    return saved ? Number(saved) : 0;
  });
  const [bingoStats, setBingoStats] = useState<Record<string, number>>({});
  const [theme, setTheme] = useState<ThemeId>(() => (localStorage.getItem('pote_theme') as ThemeId) || 'cookbook');

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const prevTotalRef = useRef<number>(0);
  const isInitialLoad = useRef<boolean>(true);

  // ---- Toasts ----
  const addToast: AddToastFn = useCallback((title, message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // ---- Navigation ----
  const handleTabChange = useCallback((newTab: TabId) => {
    const oldIndex = TAB_ORDER.indexOf(activeTab);
    const newIndex = TAB_ORDER.indexOf(newTab);
    setTabDirection(newIndex > oldIndex ? 1 : -1);
    setActiveTab(newTab);
  }, [activeTab]);

  // ---- Auth ----
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

  const handleCompleteOnboarding = useCallback(() => {
    if (user) {
      localStorage.setItem(`onboarding_${user.uid}`, 'true');
    }
    setShowOnboarding(false);
  }, [user]);

  // ---- Firestore Listeners ----
  useEffect(() => {
    if (!isAuthReady || !user) return;

    // Listen to user profile for theme
    const unsubUser = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists() && docSnap.data().theme) {
        const t = docSnap.data().theme as ThemeId;
        setTheme(t);
        localStorage.setItem('pote_theme', t);
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${user.uid}`));

    // Listen to trip config
    const unsubConfig = onSnapshot(doc(db, 'trip_config', 'main'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Partial<TripConfig>;
        setTripConfig(prev => {
          const newConfig = { ...prev, ...data };
          localStorage.setItem('pote_tripConfig', JSON.stringify(newConfig));
          return newConfig;
        });
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, 'trip_config/main'));

    // Listen to deposits
    const q = query(collection(db, 'deposits'), orderBy('createdAt', 'desc'));
    const unsubDeposits = onSnapshot(q, (querySnapshot) => {
      const deps: Deposit[] = [];
      let total = 0;
      const stats: Record<string, number> = {};

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        deps.push({ id: docSnap.id, ...data } as Deposit);

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
      localStorage.setItem('pote_totalSaved', total.toString());
      setBingoStats(stats);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'deposits'));

    return () => {
      unsubUser();
      unsubConfig();
      unsubDeposits();
    };
  }, [isAuthReady, user]);

  // ---- Milestone Notifications ----
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      prevTotalRef.current = totalSaved;
      return;
    }

    if (tripConfig.goalAmount > 0 && totalSaved > prevTotalRef.current) {
      const prevPercentage = (prevTotalRef.current / tripConfig.goalAmount) * 100;
      const currentPercentage = (totalSaved / tripConfig.goalAmount) * 100;

      const milestones = [25, 50, 75, 90, 100];
      for (const milestone of milestones) {
        if (prevPercentage < milestone && currentPercentage >= milestone) {
          const mTitle = milestone === 100 ? '🎉 META ATINGIDA! 🎉' : 'Marco Alcançado!';
          const mBody = milestone === 100
            ? 'Vocês conseguiram! O Pote Sagrado está cheio!'
            : `Vocês chegaram a ${milestone}% da meta! Continuem assim!`;
          addToast(mTitle, mBody, 'milestone');
          break;
        }
      }
    }

    prevTotalRef.current = totalSaved;
  }, [totalSaved, tripConfig.goalAmount, addToast]);

  // ---- Theme application ----
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const value: AppContextValue = {
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
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
