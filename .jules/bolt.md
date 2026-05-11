## 2026-05-11 - Optimized Currency Formatting Singleton
**Learning:** Instantiating `Intl.NumberFormat` is expensive, especially when used in high-frequency paths like Framer Motion's `useTransform` (which can run at 60fps).
**Action:** Always use a centralized singleton for standard locale formatters to avoid re-initialization overhead across the application.
