// =====================================================
// TIMING CENTRAL — Pote Sagrado Commercial
// 1080x1920 | 30fps | ~46 segundos = 1380 frames
// =====================================================

export const FPS = 30;
export const TOTAL_FRAMES = 1380; // 46s

export const SCENES = {
  OPENING:    { from: 0,    duration: 120 }, // 0s–4s
  LOGIN:      { from: 120,  duration: 120 }, // 4s–8s
  POT:        { from: 240,  duration: 210 }, // 8s–15s
  MISSIONS:   { from: 450,  duration: 180 }, // 15s–21s
  LOVECARDS:  { from: 630,  duration: 270 }, // 21s–30s
  SHARE:      { from: 900,  duration: 180 }, // 30s–36s
  MONTAGE:    { from: 1080, duration: 180 }, // 36s–42s
  CLOSING:    { from: 1260, duration: 120 }, // 42s–46s
} as const;

// Demo Data — Casal fictício Lia & Rafa
export const DEMO = {
  coupleNames: 'Lia & Rafa',
  destination: 'Fim de semana em Maragogi',
  goalAmount: 2500,
  totalSaved: 600,
  percentage: 24,
  daysTogether: 428,
  deposits: [
    { amount: 150, desc: 'Começamos nosso sonho' },
    { amount: 80,  desc: 'Cinema em casa hoje' },
    { amount: 250, desc: 'Extra do mês' },
    { amount: 120, desc: 'Sem delivery essa semana' },
  ],
  loveCardQuestion: 'Qual momento simples nosso você gostaria de viver de novo?',
  loveCardAnswer: 'Aquela noite com pizza, filme ruim e a gente rindo de tudo.',
  mission: 'Troquem um delivery por um date em casa',
};

// Colors
export const COLORS = {
  bg:      '#F9F8F6',
  text:    '#2C2A26',
  border:  '#E6E2D8',
  primary: '#8E7F6D',
  gold:    '#C5A059',
  dark:    '#1A1A1A',
  white:   '#FFFFFF',
  cream:   '#FDF6E3',
};

// Easing helpers
export function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}
export function clamp(v: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, v));
}
