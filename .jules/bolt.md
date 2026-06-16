## 2026-05-25 - Centralized Intl.NumberFormat for Animations
**Learning:** Frequent instantiation of `Intl.NumberFormat` inside `useTransform` or render loops causes measurable performance drops, especially during concurrent animations.
**Action:** Always use a singleton instance for `Intl.NumberFormat` in `maskUtils.ts` and export a helper like `formatBRL` for reuse across components.
