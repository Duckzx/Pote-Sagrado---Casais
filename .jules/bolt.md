## 2026-07-01 - [Currency Formatting & Re-render Optimization]
**Learning:** Re-instantiating `Intl.NumberFormat` in hot paths (like animations) is extremely expensive (~100x slower than singleton reuse). Additionally, large component re-renders triggered by `setInterval` for non-critical features (like quote rotation) degrade performance noticeably without adding proportional value.
**Action:** Always centralize `Intl` formatters as singletons. Prefer `useEffect` synchronization over `setInterval` for UI state that depends on specific data changes.
