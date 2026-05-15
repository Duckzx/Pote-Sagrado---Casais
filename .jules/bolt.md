## 2026-05-15 - Centralized Intl Formatter
**Learning:** Instantiating `Intl.NumberFormat` objects is computationally expensive, especially inside high-frequency execution paths like animation loops (`useTransform` in Framer Motion).
**Action:** Always use a singleton instance for standard formatting (currency, dates) when used in performance-critical paths.
