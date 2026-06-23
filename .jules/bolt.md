## 2025-05-15 - Centralized Intl.NumberFormat for BRL
**Learning:** Initializing `Intl.NumberFormat` is expensive (~0.5ms-1.0ms). High-frequency paths like Framer Motion's `useTransform` or large list renders suffer from repeated instantiations.
**Action:** Always use a singleton instance of `Intl.NumberFormat` in a shared utility for currency/number formatting.
