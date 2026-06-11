## 2026-06-15 - Centralized Intl.NumberFormat for BRL
**Learning:** Instantiating `Intl.NumberFormat` is expensive. In this app, it was being created in high-frequency paths like `AnimatedNumber.tsx` (animations) and repeated in multiple tab components.
**Action:** Centralized BRL formatting in `src/lib/maskUtils.ts` using a singleton instance. This reduces CPU overhead and GC pressure during animations and re-renders.
