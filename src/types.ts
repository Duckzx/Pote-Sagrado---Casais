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
  coupleId: string;
  createdAt: Timestamp | null;
  comments?: { id: string; text: string; who: string; whoName: string; createdAt: number }[];
  reactions?: Record<string, string>;
}

export interface Challenge {
  id: string;
  title: string;
  label?: string; // For backward compatibility
  icon: string;
  desc?: string;
  reward?: number;
  recurrence?: "semanal" | "livre" | "diaria" | "mensal";
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
}

export interface Achievement {
  id: string;
  imageUrl: string;
  destination: string;
  amount: number;
  goalAmount: number;
  coupleId: string;
  createdAt: Timestamp | null;
}

export interface PinboardLink {
  id: string;
  url: string;
  title: string;
  imageUrl: string;
  addedBy: string;
  coupleId: string;
  createdAt: Timestamp | null;
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

// Re-export Firebase User with extensions
export type AppUser = User & {
  coupleId?: string;
};

export interface UserProfile {
  uid: string;
  displayName?: string;
  photoURL?: string;
  email?: string;
  casalId: string;
  theme?: ThemeId;
}

export interface Partner {
  uid: string;
  displayName: string;
  photoURL: string;
}
