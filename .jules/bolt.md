## 2026-05-18 - Centralized Currency Formatting
**Learning:** Intl.NumberFormat instantiation is expensive in JavaScript. When used in high-frequency contexts like Framer Motion's `useTransform`, it can lead to frame drops and memory pressure.
**Action:** Use a singleton `Intl.NumberFormat` instance for common locales/currencies (e.g., BRL) and export it via a utility function (`formatBRL`).
