import { Timestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';

// ========================================
// Core Domain Types
// ========================================

export interface Deposit {
  id: string;
  amount: number;
  action?: string;
  type?: 'expense' | 'income';
  who: string;
  whoName: string;
  createdAt: Timestamp | null;
}

export interface Challenge {
  id: string;
  label: string;
  icon: string;
}

export interface TripConfig {
  destination: string;
  origin: string;
  goalAmount: number;
  lat: number;
  lng: number;
  customChallenges: Challenge[];
  battleChallenges: Challenge[];
  targetDate: string;
  monthlyPrize: string;
  wppPhone?: string;
  wppApiKey?: string;
}

export const DEFAULT_TRIP_CONFIG: TripConfig = {
  destination: '',
  origin: '',
  goalAmount: 0,
  lat: 0,
  lng: 0,
  customChallenges: [],
  battleChallenges: [],
  targetDate: '',
  monthlyPrize: '',
  wppPhone: '',
  wppApiKey: '',
};

// ========================================
// Component Prop Types
// ========================================

export type ToastType = 'info' | 'success' | 'milestone';

export type AddToastFn = (title: string, message: string, type: ToastType) => void;

export type TabId = 'home' | 'missoes' | 'extrato' | 'disputa' | 'config';

export const TAB_ORDER: TabId[] = ['home', 'missoes', 'extrato', 'disputa', 'config'];

export type ThemeId = 'cookbook' | 'mediterranean' | 'nordic' | 'tropical' | 'midnight';

export interface ThemeOption {
  id: ThemeId;
  label: string;
  colors: [string, string];
}

// Re-export Firebase User for convenience
export type AppUser = User;
