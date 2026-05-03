import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { playSuccessSound, vibrate } from '../lib/audio';
import { collection, doc, onSnapshot, query, orderBy, limit, getDocs, getDoc, setDoc, deleteDoc, where } from 'firebase/firestore';
import { auth, db, handleRedirectResult } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { useAppStore } from '../store/useAppStore';
import type { Deposit, TripConfig, TabId, AddToastFn, ThemeId, AppUser, Partner } from '../types';
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
// Context Shape (Slimmed down)
// ========================================

interface AppContextValue {
  // Auth
  user: AppUser | null;
  casalId: string | null;
  partner: Partner | null;
  isAuthReady: boolean;
  isDataReady: boolean;

  // Navigation
  activeTab: TabId;
  tabDirection: number;
  handleTabChange: (tab: TabId) => void;

  // Toasts
  toasts: ToastMessage[];
  addToast: AddToastFn;
  removeToast: (id: string) => void;

  // Onboarding
  showOnboarding: boolean;
  handleCompleteOnboarding: () => void;
  
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
  const [partner, setPartner] = useState<Partner | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [tabDirection, setTabDirection] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Store actions
  const setDeposits = useAppStore(s => s.setDeposits);
  const setTripConfig = useAppStore(s => s.setTripConfig);
  const setTheme = useAppStore(s => s.setTheme);

  // Stats/Extra state
  const [totalSaved, setTotalSaved] = useState<number>(0);
  const [bingoStats, setBingoStats] = useState<Record<string, number>>({});
  const [achievements, setAchievements] = useState<any[]>([]);
  const [pinboardLinks, setPinboardLinks] = useState<any[]>([]);

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

  // ---- Auth & Profile Sync ----
  useEffect(() => {
    // Check invite param in URL
    const params = new URLSearchParams(window.location.search);
    const inviteCode = params.get('invite');
    if (inviteCode) {
      localStorage.setItem('pote_invite_code', inviteCode);
      params.delete('invite');
      const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : '');
      window.history.replaceState({}, '', newUrl);
    }

    handleRedirectResult();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Sync User Profile to get casalId/coupleId
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        let profileData: any;
        if (!userSnap.exists()) {
          // Create default profile with a new casalId (the user's own UID)
          profileData = {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            theme: 'cookbook',
            casalId: `casal_${currentUser.uid}`,
            createdAt: new Date().toISOString()
          };
          await setDoc(userRef, profileData);
        } else {
          profileData = userSnap.data();
        }
        
        const extendedUser: AppUser = Object.assign(currentUser, { coupleId: profileData.casalId || profileData.coupleId || `casal_${currentUser.uid}` });
        setUser(extendedUser);
        if (profileData.theme) setTheme(profileData.theme as ThemeId);

        const hasSeenOnboarding = localStorage.getItem(`onboarding_${currentUser.uid}`);
        if (!hasSeenOnboarding) setShowOnboarding(true);
      } else {
        setUser(null);
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, [setTheme]);

  const handleCompleteOnboarding = useCallback(() => {
    if (user) {
      localStorage.setItem(`onboarding_${user.uid}`, 'true');
    }
    setShowOnboarding(false);
  }, [user]);

  // ---- Firestore Listeners (Isolated by casalId) ----
  useEffect(() => {
    if (!isAuthReady || !user) return;

    let activeCasalId: string | null = null;
    let unsubConfig: (() => void) | null = null;
    let unsubDeposits: (() => void) | null = null;
    let unsubAchievements: (() => void) | null = null;
    let unsubLinks: (() => void) | null = null;
    let unsubPartner: (() => void) | null = null;

    const stopNestedListeners = () => {
      unsubConfig?.();
      unsubDeposits?.();
      unsubAchievements?.();
      unsubLinks?.();
      unsubPartner?.();
    };

    // Apply pending invite
    const pendingInvite = localStorage.getItem('pote_invite_code');
    if (pendingInvite && pendingInvite !== `casal_${user.uid}`) {
       setDoc(doc(db, 'users', user.uid), { casalId: pendingInvite }, { merge: true })
         .then(() => {
           localStorage.removeItem('pote_invite_code');
           addToast("Casal Conectado!", "Seus perfis foram vinculados.", "success");
         })
         .catch((e) => console.error("Error setting pending invite", e));
    }

    // Listen to user profile for theme and casalId
    const unsubUser = onSnapshot(doc(db, 'users', user.uid), async (docSnap) => {
      let newCasalId = `casal_${user.uid}`;
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.theme) {
          const t = data.theme as ThemeId;
          setTheme(t);
          localStorage.setItem('pote_theme', t);
        }
        if (data.casalId) {
          newCasalId = data.casalId;
        }
      }
      
      setCasalId(newCasalId);

      // If casalId changed, restart nested listeners
      if (newCasalId !== activeCasalId) {
        stopNestedListeners();
        activeCasalId = newCasalId;

        // 1. Partner Listener
        const partnerQuery = query(collection(db, 'users'), where('casalId', '==', newCasalId));
        unsubPartner = onSnapshot(partnerQuery, (snap) => {
          const other = snap.docs.find(d => d.id !== user.uid);
          if (other) {
            const d = other.data();
            setPartner({
              uid: other.id,
              displayName: d.displayName || d.email?.split('@')[0] || 'Parceiro',
              photoURL: d.photoURL || ''
            });
          } else {
            setPartner(null);
          }
        });

        // 2. Trip Config Listener
        unsubConfig = onSnapshot(doc(db, `casais/${newCasalId}/trip_config`, 'main'), (configSnap) => {
          if (configSnap.exists()) {
            const data = configSnap.data() as Partial<TripConfig>;
            setTripConfig(data as TripConfig);
            localStorage.setItem('pote_tripConfig', JSON.stringify(data));
          }
        }, (error) => handleFirestoreError(error, OperationType.GET, `casais/${newCasalId}/trip_config/main`));

        // 3. Deposits Listener
        const qDep = query(
          collection(db, `casais/${newCasalId}/deposits`), 
          orderBy('createdAt', 'desc'),
          limit(200)
        );
        unsubDeposits = onSnapshot(qDep, (querySnapshot) => {
          const deps: Deposit[] = [];
          let total = 0;
          const stats: Record<string, number> = {};

          querySnapshot.forEach((depositSnap) => {
            const data = depositSnap.data();
            deps.push({ id: depositSnap.id, ...data } as Deposit);
            const amount = Number(data.amount) || 0;
            if (data.type === 'expense') {
              total -= amount;
            } else {
              total += amount;
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
        }, (error) => handleFirestoreError(error, OperationType.LIST, `casais/${newCasalId}/deposits`));

        // 4. Achievements Listener
        const qArch = query(collection(db, `casais/${newCasalId}/achievements`), orderBy('createdAt', 'desc'));
        unsubAchievements = onSnapshot(qArch, (querySnapshot) => {
          const arch: any[] = [];
          querySnapshot.forEach(docSnap => arch.push({ id: docSnap.id, ...docSnap.data() }));
          setAchievements(arch);
        });

        // 5. Pinboard Listener
        const qLinks = query(collection(db, `casais/${newCasalId}/pinboard_links`), orderBy('createdAt', 'desc'));
        unsubLinks = onSnapshot(qLinks, (querySnapshot) => {
          const linksData: any[] = [];
          querySnapshot.forEach(docSnap => linksData.push({ id: docSnap.id, ...docSnap.data() }));
          setPinboardLinks(linksData);
        });

        // ----------------------------------------------------
        // AUTOMATIC MIGRATION (Unified Logic)
        // ----------------------------------------------------
        if (!(window as any)._hasRunMigration && auth.currentUser) {
          (window as any)._hasRunMigration = true;
          const runMigration = async () => {
            try {
              const soloPotId = `casal_${auth.currentUser!.uid}`;
              if (newCasalId !== soloPotId) {
                // Migrate Deposits
                const oldDeps = await getDocs(collection(db, `casais/${soloPotId}/deposits`));
                for (const d of oldDeps.docs) {
                  await setDoc(doc(db, `casais/${newCasalId}/deposits`, d.id), d.data());
                  await deleteDoc(doc(db, `casais/${soloPotId}/deposits`, d.id));
                }
                
                // Migrate Achievements
                const oldArch = await getDocs(collection(db, `casais/${soloPotId}/achievements`));
                for (const d of oldArch.docs) {
                  await setDoc(doc(db, `casais/${newCasalId}/achievements`, d.id), d.data());
                  await deleteDoc(doc(db, `casais/${soloPotId}/achievements`, d.id));
                }

                // Migrate Pinboard Links
                const oldLinks = await getDocs(collection(db, `casais/${soloPotId}/pinboard_links`));
                for (const d of oldLinks.docs) {
                  await setDoc(doc(db, `casais/${newCasalId}/pinboard_links`, d.id), d.data());
                  await deleteDoc(doc(db, `casais/${soloPotId}/pinboard_links`, d.id));
                }

                if (oldDeps.size > 0) addToast("Pote Unificado", `Seus dados foram movidos para o novo Pote compartilhado!`, "success");
              }
              
              // Legacy migration (v1)
              const legacyDeps = await getDocs(query(collection(db, 'deposits'), where('who', '==', auth.currentUser!.uid)));
              for (const d of legacyDeps.docs) {
                await setDoc(doc(db, `casais/${newCasalId}/deposits`, d.id), d.data());
                await deleteDoc(doc(db, 'deposits', d.id));
              }
            } catch (e) {
              console.error("Migration error:", e);
            }
          };
          runMigration();
        }
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${user.uid}`));

    return () => {
      unsubUser();
      stopNestedListeners();
    };
  }, [isAuthReady, user, setDeposits, setTripConfig, setTheme, setAchievements, setPinboardLinks, setTotalSaved, setBingoStats, setIsDataReady, addToast]);

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
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const clearInstallPrompt = useCallback(() => {
    setInstallPrompt(null);
    setCanInstall(false);
  }, []);

  const value: AppContextValue = {
    user,
    casalId,
    partner,
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
    canInstall,
    installPrompt,
    clearInstallPrompt,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
