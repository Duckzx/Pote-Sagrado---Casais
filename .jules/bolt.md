## 2025-05-14 - Optimized Currency Formatting

**Learning:** `Intl.NumberFormat` instantiation is expensive, especially in high-frequency paths like animations (Framer Motion `useTransform`). Centralizing it as a singleton significantly reduces CPU overhead and memory churn.

**Action:** Always check for repeated `Intl.NumberFormat` or `Intl.DateTimeFormat` instantiations in render loops or frequent hooks and move them to singletons/utilities.
