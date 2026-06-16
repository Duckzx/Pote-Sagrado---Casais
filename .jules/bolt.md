## 2026-05-20 - [Performance] Centralized Intl.NumberFormat
**Learning:** Creating `Intl.NumberFormat` instances is expensive as it requires looking up locale data. Reusing a singleton instance is significantly faster, especially when called frequently like in animation transforms (e.g., `useTransform` in Framer Motion).
**Action:** Always use the `BRL` singleton or `formatBRL` utility for currency formatting instead of creating new `Intl.NumberFormat` instances.
