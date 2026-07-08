## 2026-07-28 - Centralized Currency Formatting
**Learning:** Re-instantiating `Intl.NumberFormat` objects frequently, especially within high-frequency animation loops (like `AnimatedNumber` using Framer Motion's `useTransform`), causes significant CPU overhead. Centralizing this into a singleton in a utility file avoids this cost.
**Action:** Always check for repeated `Intl.NumberFormat` or similar constructor calls in components that render frequently or animate. Centralize them in `lib/` utilities as singletons.
