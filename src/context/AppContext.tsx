import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { playSuccessSound, vibrate } from '../lib/audio';
import { collection, doc, onSnapshot, query, orderBy, limit, getDocs, getDoc, setDoc, deleteDoc, where } from 'firebase/firestore';
import { auth, db, handleRedirectResult } from '../firebase';
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
  casalId: string | null;
  isAuthReady: boolean;
  isDataReady: boolean;

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
  
  // Achievements (completed pots)
  achievements: any[];

  // Pinboard Links
  pinboardLinks: any[];

  // PWA Install
  canInstall: boolean;
  installPrompt: any | null;
  clearInstallPrompt: () => void;
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
  const [casalId, setCasalId] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [tabDirection, setTabDirection] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const [tripConfig, setTripConfig] = useState<TripConfig>(() => {
    const saved = localStorage.getItem('pote_tripConfig');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* fallback */ }
    }
    return { destination: '', origin: '', goalAmount: 0, lat: 0, lng: 0, customChallenges: [], battleChallenges: [], sharedAlbumUrl: '', monthlyPrize: '' };
  });

  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [pinboardLinks, setPinboardLinks] = useState<any[]>([]);
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
  const addToast: AddToastFn = useCallback((title, message, type = 'info', duration = 5000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, title, message, type }]);
    
    if (type === 'success' || type === 'milestone') {
      vibrate([30, 50, 30]);
      playSuccessSound();
    }
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
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
    // Check if the user is logging in from a redirect (e.g. from mobile Instagram browser bypassing popup)
    handleRedirectResult();

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

    // Listen to user profile for theme and casalId
    const unsubUser = onSnapshot(doc(db, 'users', user.uid), async (docSnap) => {
      let currentCasalId = `casal_${user.uid}`; // default
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.theme) {
          const t = data.theme as ThemeId;
          setTheme(t);
          localStorage.setItem('pote_theme', t);
        }
        if (data.casalId) {
          currentCasalId = data.casalId;
        }
      }
      setCasalId(currentCasalId);
      
      // Now that we have the casalId, listen to the specific couple's config
      const unsubConfig = onSnapshot(doc(db, `casais/${currentCasalId}/trip_config`, 'main'), (configSnap) => {
        if (configSnap.exists()) {
          const data = configSnap.data() as Partial<TripConfig>;
          setTripConfig(prev => {
            const newConfig = { ...prev, ...data };
            localStorage.setItem('pote_tripConfig', JSON.stringify(newConfig));
            return newConfig;
          });
        }
      }, (error) => handleFirestoreError(error, OperationType.GET, `casais/${currentCasalId}/trip_config/main`));

      // ----------------------------------------------------
      // AUTOMATIC MIGRATION: copy old data to current casal (runs once per session)
      // ----------------------------------------------------
      if (!(window as any)._hasRunMigration && auth.currentUser) {
        (window as any)._hasRunMigration = true;
        const runMigration = async () => {
          try {
            // Migrate deposits
            const oldDeps = await getDocs(query(collection(db, 'deposits'), where('who', '==', auth.currentUser!.uid)));
            oldDeps.docs.forEach(async (d) => {
              await setDoc(doc(db, `casais/${currentCasalId}/deposits`, d.id), d.data());
              await deleteDoc(doc(db, 'deposits', d.id));
            });

            // Migrate trip_config/main if it exists and current is empty
            const oldConfig = await getDoc(doc(db, 'trip_config', 'main'));
            if (oldConfig.exists()) {
              const currentConfig = await getDoc(doc(db, `casais/${currentCasalId}/trip_config`, 'main'));
              if (!currentConfig.exists()) {
                await setDoc(doc(db, `casais/${currentCasalId}/trip_config`, 'main'), oldConfig.data());
              }
            }
          } catch (e) {
            console.error("Migration error:", e);
          }
        };
        runMigration();
      }
      // ----------------------------------------------------

      // Listen to deposits for this specific casal
      const q = query(
        collection(db, `casais/${currentCasalId}/deposits`), 
        orderBy('createdAt', 'desc'),
        limit(200)
      );
      const unsubDeposits = onSnapshot(q, (querySnapshot) => {
        const deps: Deposit[] = [];
        let total = 0;
        const stats: Record<string, number> = {};

        querySnapshot.forEach((depositSnap) => {
          const data = depositSnap.data();
          deps.push({ id: depositSnap.id, ...data } as Deposit);

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
        
        setTimeout(() => setIsDataReady(true), 200);
      }, (error) => handleFirestoreError(error, OperationType.LIST, `casais/${currentCasalId}/deposits`));

      // Listen to achievements
      const qArchived = query(collection(db, `casais/${currentCasalId}/achievements`), orderBy('createdAt', 'desc'));
      const unsubAchievements = onSnapshot(qArchived, (querySnapshot) => {
        const arch: any[] = [];
        querySnapshot.forEach(docSnap => arch.push({ id: docSnap.id, ...docSnap.data() }));
        setAchievements(arch);
      }, (error) => handleFirestoreError(error, OperationType.LIST, `casais/${currentCasalId}/achievements`));

      // Listen to pinboard links
      const qLinks = query(collection(db, `casais/${currentCasalId}/pinboard_links`), orderBy('createdAt', 'desc'));
      const unsubLinks = onSnapshot(qLinks, (querySnapshot) => {
        const linksData: any[] = [];
        querySnapshot.forEach(docSnap => linksData.push({ id: docSnap.id, ...docSnap.data() }));
        setPinboardLinks(linksData);
      }, (error) => handleFirestoreError(error, OperationType.LIST, `casais/${currentCasalId}/pinboard_links`));

      // Store unsubs so we can clear them when the user changes
      (window as any)._unsubCasalConfig = unsubConfig;
      (window as any)._unsubCasalDeposits = unsubDeposits;
      (window as any)._unsubCasalAchievements = unsubAchievements;
      (window as any)._unsubCasalLinks = unsubLinks;

    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${user.uid}`));

    return () => {
      unsubUser();
      if ((window as any)._unsubCasalConfig) (window as any)._unsubCasalConfig();
      if ((window as any)._unsubCasalDeposits) (window as any)._unsubCasalDeposits();
      if ((window as any)._unsubCasalAchievements) (window as any)._unsubCasalAchievements();
      if ((window as any)._unsubCasalLinks) (window as any)._unsubCasalLinks();
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
          const mTitle = milestone === 100 ? '🎉 META ATINGIDA! 🎉' : 'Uhuuul! Um passo mais perto!';
          const mBody = milestone === 100
            ? 'Aêê! O pote tá cheio! Bora quebrar e fazer as malas?'
            : `Vocês bateram ${milestone}% da meta! Orgulho define.`;
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

  // ---- PWA Install ----
  const [installPrompt, setInstallPrompt] = useState<any | null>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const clearInstallPrompt = useCallback(() => {
    setInstallPrompt(null);
    setCanInstall(false);
  }, []);

  const value: AppContextValue = {
    user,
    casalId,
    isAuthReady,
    isDataReady,
    activeTab,
    tabDirection,
    handleTabChange,
    tripConfig,
    deposits,
    achievements,
    pinboardLinks,
    totalSaved,
    bingoStats,
    theme,
    toasts,
    addToast,
    removeToast,
    showOnboarding,
    handleCompleteOnboarding,
    canInstall,
    installPrompt,
    clearInstallPrompt,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
