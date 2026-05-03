import { create } from 'zustand';
import { Deposit, TripConfig, ThemeId, DEFAULT_TRIP_CONFIG, Achievement, PinboardLink } from '../types';

interface AppState {
  // Data
  deposits: Deposit[];
  tripConfig: TripConfig;
  totalSaved: number;
  bingoStats: Record<string, number>;
  theme: ThemeId;
  achievements: Achievement[];
  pinboardLinks: PinboardLink[];
  
  // Actions
  setDeposits: (deposits: Deposit[]) => void;
  setTripConfig: (config: TripConfig) => void;
  setTheme: (theme: ThemeId) => void;
  setAchievements: (achievements: Achievement[]) => void;
  setPinboardLinks: (links: PinboardLink[]) => void;
  
  // Helpers
  calculateStats: (deposits: Deposit[]) => { total: number; stats: Record<string, number> };
}

export const useAppStore = create<AppState>((set, get) => ({
  deposits: [],
  tripConfig: DEFAULT_TRIP_CONFIG,
  totalSaved: 0,
  bingoStats: {},
  theme: 'cookbook',
  achievements: [],
  pinboardLinks: [],

  setDeposits: (deposits) => {
    const { total, stats } = get().calculateStats(deposits);
    set({ deposits, totalSaved: total, bingoStats: stats });
  },

  setTripConfig: (tripConfig) => set({ tripConfig }),

  setTheme: (theme) => {
    set({ theme });
    document.documentElement.setAttribute('data-theme', theme);
  },

  setAchievements: (achievements) => set({ achievements }),
  setPinboardLinks: (pinboardLinks) => set({ pinboardLinks }),

  calculateStats: (deposits) => {
    let total = 0;
    const stats: Record<string, number> = {};

    deposits.forEach((d) => {
      if (d.type === 'expense') {
        total -= d.amount || 0;
      } else {
        total += d.amount || 0;
      }

      if (d.action && d.type !== 'expense') {
        stats[d.action] = (stats[d.action] || 0) + 1;
      }
    });

    return { total, stats };
  },
}));
