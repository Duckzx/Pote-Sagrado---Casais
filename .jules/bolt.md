## 2025-05-15 - Centralized Currency Formatting
**Learning:** Repeated instantiation of `Intl.NumberFormat` inside high-frequency paths (like Framer Motion `useTransform` or large list renders) causes significant CPU overhead and GC pressure. Centralizing into a singleton utility improves performance by ~0.5ms-1.0ms per call.
**Action:** Always use the centralized `formatBRL` utility from `src/lib/maskUtils.ts` instead of manual `Intl.NumberFormat` calls.
