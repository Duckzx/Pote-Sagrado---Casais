## 2026-05-18 - Optimized Currency Formatting Singleton
**Learning:** Initializing `Intl.NumberFormat` repeatedly in React render loops or Framer Motion's `useTransform` creates significant performance overhead.
**Action:** Always centralize expensive `Intl` formatters into singleton instances within a utility file and export a simple formatting function for components to reuse.
