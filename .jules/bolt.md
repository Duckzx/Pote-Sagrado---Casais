## 2026-05-24 - [Centralized Currency Formatting]
**Learning:** Re-instantiating `Intl.NumberFormat` is expensive, especially when called inside `useTransform` (Framer Motion) or other high-frequency animation loops.
**Action:** Use a singleton instance of `Intl.NumberFormat` and export a utility function (`formatBRL`) for consistent, high-performance formatting across the app.

## 2026-05-24 - [Unused State Interval Anti-pattern]
**Learning:** Found a pattern where `setInterval` was used to update state that was no longer rendered in the JSX, causing full component re-renders every 10 seconds for no visual benefit.
**Action:** Audit component state and effects to ensure periodic updates are actually reflected in the UI; remove redundant re-render triggers.
