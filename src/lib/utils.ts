import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import confetti from "canvas-confetti";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const triggerConnectionCelebration = () => {
  const duration = 3 * 1000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ["#c5a059", "#ffb703", "#fb8500", "#8ecae6"],
      zIndex: 9999,
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ["#c5a059", "#ffb703", "#fb8500", "#8ecae6"],
      zIndex: 9999,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };
  frame();
};
