## 2025-05-14 - Optimized Currency Formatting Singleton
**Learning:** Instantiating `Intl.NumberFormat` is a heavy operation in JavaScript. In this codebase, it was being called inside `useTransform` (Framer Motion) in `AnimatedNumber.tsx`, causing repeated object creation on every frame of an animation. This also occurred frequently in list renders (`ExtratoTab.tsx`, `DisputaTab.tsx`).

**Action:** Centralized currency formatting into a `BRL` singleton in `src/lib/maskUtils.ts`. All components must import and use this singleton for currency formatting to maintain peak performance and consistency.
