## 2025-05-15 - Intl.NumberFormat Instantiation Bottleneck
**Learning:** Re-instantiating `Intl.NumberFormat` inside animations (e.g., `useTransform`) or large list renders is a common performance anti-pattern. While modern engines are fast, `Intl` object creation is relatively heavy compared to simple number formatting.
**Action:** Always prefer a singleton `Intl.NumberFormat` instance for fixed locales/styles, especially in performance-critical paths like Framer Motion transforms or large extrato/ledger lists.
