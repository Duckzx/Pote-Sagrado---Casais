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
  comments?: { id: string; text: string; who: string; whoName: string; createdAt: number }[];
  reactions?: Record<string, string>;
  isXpBonus?: boolean;
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
  monthlyPrize: string;
  sharedAlbumUrl?: string;
  fcmTokens?: string[];
  relationshipStartDate?: string;
  activeModules?: {
    feed?: boolean;
    missoes?: boolean;
    extrato?: boolean;
    disputa?: boolean;
    akinator?: boolean;
    quiz?: boolean;
    [key: string]: boolean | undefined;
  };
}

export const DEFAULT_TRIP_CONFIG: TripConfig = {
  destination: '',
  origin: '',
  goalAmount: 0,
  lat: 0,
  lng: 0,
  customChallenges: [],
  battleChallenges: [],
  monthlyPrize: '',
  sharedAlbumUrl: '',
  fcmTokens: [],
  relationshipStartDate: '',
  activeModules: {
    feed: true,
    missoes: true,
    extrato: true,
    disputa: true,
    akinator: true,
    quiz: true,
  }
};

// ========================================
// Component Prop Types
// ========================================

export type ToastType = 'info' | 'success' | 'milestone';

export type AddToastFn = (title: string, message: string, type?: ToastType, duration?: number) => void;

export type TabId = 'home' | 'missoes' | 'extrato' | 'disputa' | 'mural' | 'config';

export const TAB_ORDER: TabId[] = ['home', 'missoes', 'extrato', 'disputa', 'mural', 'config'];

export type ThemeId = 'cookbook' | 'mediterranean' | 'nordic' | 'tropical' | 'midnight';

export interface ThemeOption {
  id: ThemeId;
  label: string;
  colors: [string, string];
}

// Re-export Firebase User for convenience
export type AppUser = User;
