## 2026-07-20 - Centralize BRL currency formatting
**Learning:** `Intl.NumberFormat` is expensive to instantiate because it requires looking up locale data and formatting rules. In components like `AnimatedNumber.tsx` that re-render many times per second during animations, or in `Remotion` video rendering, repeated instantiation creates significant CPU overhead and garbage collection pressure.
**Action:** Always centralize `Intl.NumberFormat` instances for frequently used locales as singletons in a utility file.
