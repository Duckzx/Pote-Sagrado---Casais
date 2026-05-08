import { create } from 'zustand';
import { AppUser, Deposit, TripConfig, TabId, ThemeId } from '../types';
import { vibrate, playSuccessSound } from '../lib/audio';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'milestone';
}

export type AddToastFn = (title: string, message: string, type?: 'info' | 'success' | 'milestone', duration?: number) => void;

interface AppState {
  // Auth
  user: AppUser | null;
  casalId: string | null;
  setUser: (user: AppUser | null) => void;
  setCasalId: (id: string | null) => void;

  // Data
  coupleMembers: any[];
  deposits: Deposit[];
  pinboardLinks: any[];
  achievements: any[];
  setCoupleMembers: (members: any[]) => void;
  setDeposits: (deps: Deposit[]) => void;
  setPinboardLinks: (links: any[]) => void;
  setAchievements: (achs: any[]) => void;

  // Derived / Calculated
  totalSaved: number;
  bingoStats: Record<string, number>;
  tripConfig: TripConfig | null;
  setTotalSaved: (total: number) => void;
  setBingoStats: (stats: Record<string, number>) => void;
  setTripConfig: (config: TripConfig | null | ((prev: TripConfig | null) => TripConfig | null)) => void;

  // UI
  isDataReady: boolean;
  isAuthReady: boolean;
  setIsDataReady: (ready: boolean) => void;
  setIsAuthReady: (ready: boolean) => void;

  activeTab: TabId;
  tabDirection: number;
  setActiveTab: (tab: TabId) => void;
  setTabDirection: (dir: number) => void;

  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;

  lgpdConsent: boolean | null;
  hasCheckedConsent: boolean;
  setLgpdConsent: (v: boolean | null) => void;
  setHasCheckedConsent: (v: boolean) => void;
  acceptLgpd: () => void;

  showOnboarding: boolean;
  setShowOnboarding: (v: boolean) => void;
  completeOnboarding: () => void;

  toasts: ToastMessage[];
  setToasts: (toasts: ToastMessage[] | ((prev: ToastMessage[]) => ToastMessage[])) => void;
  addToast: AddToastFn;
  removeToast: (id: string) => void;

  canInstall: boolean;
  installPrompt: any | null;
  setCanInstall: (v: boolean) => void;
  setInstallPrompt: (v: any) => void;
  clearInstallPrompt: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  casalId: null,
  setUser: (user) => set({ user }),
  setCasalId: (casalId) => set({ casalId }),

  coupleMembers: [],
  deposits: [],
  pinboardLinks: [],
  achievements: [],
  setCoupleMembers: (coupleMembers) => set({ coupleMembers }),
  setDeposits: (deposits) => set({ deposits }),
  setPinboardLinks: (pinboardLinks) => set({ pinboardLinks }),
  setAchievements: (achievements) => set({ achievements }),

  totalSaved: 0,
  bingoStats: {},
  tripConfig: null,
  setTotalSaved: (totalSaved) => set({ totalSaved }),
  setBingoStats: (bingoStats) => set({ bingoStats }),
  setTripConfig: (val) => set((state) => ({ 
    tripConfig: typeof val === 'function' ? val(state.tripConfig) : val 
  })),

  isDataReady: false,
  isAuthReady: false,
  setIsDataReady: (isDataReady) => set({ isDataReady }),
  setIsAuthReady: (isAuthReady) => set({ isAuthReady }),

  activeTab: 'home',
  tabDirection: 0,
  setActiveTab: (activeTab) => set({ activeTab }),
  setTabDirection: (tabDirection) => set({ tabDirection }),

  theme: 'cookbook',
  setTheme: (theme) => set({ theme }),

  lgpdConsent: null,
  hasCheckedConsent: false,
  setLgpdConsent: (lgpdConsent) => set({ lgpdConsent }),
  setHasCheckedConsent: (hasCheckedConsent) => set({ hasCheckedConsent }),
  acceptLgpd: () => {
    set((state) => {
      if (state.user) {
        setDoc(doc(db, 'users', state.user.uid), { lgpdConsent: true, lgpdConsentDate: new Date().toISOString() }, { merge: true })
          .catch(console.error);
      } else {
        localStorage.setItem('pote_lgpdConsent', 'true');
      }
      return { lgpdConsent: true };
    });
  },

  showOnboarding: false,
  setShowOnboarding: (showOnboarding) => set({ showOnboarding }),
  completeOnboarding: () => {
    set((state) => {
      if (state.user) {
        localStorage.setItem(`onboarding_${state.user.uid}`, 'true');
      }
      return { showOnboarding: false };
    });
  },

  toasts: [],
  setToasts: (val) => set((state) => ({
    toasts: typeof val === 'function' ? val(state.toasts) : val
  })),
  addToast: (title, message, type = 'info', duration = 5000) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({ toasts: [...state.toasts, { id, title, message, type }] }));
    
    if (type === 'success' || type === 'milestone') {
      vibrate([30, 50, 30]);
      playSuccessSound();
    }
    
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) }));
    }, duration);
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) })),

  canInstall: false,
  installPrompt: null,
  setCanInstall: (canInstall) => set({ canInstall }),
  setInstallPrompt: (installPrompt) => set({ installPrompt }),
  clearInstallPrompt: () => set({ installPrompt: null, canInstall: false }),
}));
