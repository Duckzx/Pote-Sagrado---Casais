import { Deposit } from '../types';

const DAY_MS = 24 * 60 * 60 * 1000;

export const toDate = (value: any): Date | null => {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof value.seconds === 'number') return new Date(value.seconds * 1000);
  return null;
};

export const localDayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const startOfDay = (d: Date) => {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
};

/** Days with at least one real deposit (income, not XP bonus). */
export function savingDays(deposits: Deposit[]): Set<string> {
  const days = new Set<string>();
  deposits.forEach((d) => {
    if (d.type === 'expense' || d.isXpBonus || !(Number(d.amount) > 0)) return;
    const date = toDate(d.createdAt);
    if (date) days.add(localDayKey(date));
  });
  return days;
}

export interface StreakInfo {
  current: number;
  best: number;
  savedToday: boolean;
  /** Last 7 days, oldest first */
  week: { key: string; label: string; done: boolean; isToday: boolean }[];
}

/**
 * Consecutive days saving. The streak stays alive until the end of today:
 * if nothing was saved today yet, it counts up to yesterday.
 */
export function computeStreak(deposits: Deposit[], now = new Date()): StreakInfo {
  const days = savingDays(deposits);
  const today = startOfDay(now);
  const savedToday = days.has(localDayKey(today));

  let current = 0;
  const cursor = new Date(today);
  if (!savedToday) cursor.setDate(cursor.getDate() - 1);
  while (days.has(localDayKey(cursor))) {
    current++;
    cursor.setDate(cursor.getDate() - 1);
  }

  // Best streak over the loaded history
  const sorted = [...days].sort();
  let best = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const key of sorted) {
    const d = new Date(`${key}T00:00:00`);
    run = prev && Math.round((d.getTime() - prev.getTime()) / DAY_MS) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }

  const labels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const key = localDayKey(d);
    return { key, label: labels[d.getDay()], done: days.has(key), isToday: i === 6 };
  });

  return { current, best: Math.max(best, current), savedToday, week };
}

export interface PlanInfo {
  remaining: number;
  daysLeft: number;
  perWeek: number;
  perDay: number;
  /** Average saved per week over the last 30 days */
  currentWeeklyPace: number;
  /** When the goal is reached at the current pace (null if no pace) */
  etaAtCurrentPace: Date | null;
  onTrack: boolean;
}

export function computePlan(deposits: Deposit[], totalSaved: number, goalAmount: number, targetDate: string, now = new Date()): PlanInfo | null {
  if (!(goalAmount > 0) || !targetDate) return null;
  const target = new Date(`${targetDate}T23:59:59`);
  if (isNaN(target.getTime())) return null;
  const remaining = Math.max(0, goalAmount - totalSaved);
  const daysLeft = Math.max(0, Math.ceil((target.getTime() - now.getTime()) / DAY_MS));
  const weeksLeft = Math.max(1 / 7, daysLeft / 7);

  const since = now.getTime() - 30 * DAY_MS;
  let last30 = 0;
  deposits.forEach((d) => {
    const date = toDate(d.createdAt);
    if (!date || date.getTime() < since || d.isXpBonus) return;
    const amount = Number(d.amount) || 0;
    last30 += d.type === 'expense' ? -amount : amount;
  });
  const currentWeeklyPace = Math.max(0, (last30 / 30) * 7);
  const etaAtCurrentPace =
    remaining === 0 ? now : currentWeeklyPace > 0 ? new Date(now.getTime() + (remaining / currentWeeklyPace) * 7 * DAY_MS) : null;

  return {
    remaining,
    daysLeft,
    perWeek: remaining / weeksLeft,
    perDay: daysLeft > 0 ? remaining / daysLeft : remaining,
    currentWeeklyPace,
    etaAtCurrentPace,
    onTrack: remaining === 0 || (etaAtCurrentPace !== null && etaAtCurrentPace.getTime() <= target.getTime()),
  };
}
