## 2026-07-20 - Functional Regression vs. Performance
**Learning:** Removing the 10-second `setInterval` in `HomeTab.tsx` to reduce re-renders was rejected as it removed a user-facing feature (cycling motivational quotes).
**Action:** Prioritize algorithmic optimizations (like Map/Set lookups for (1)$ complexity) over micro-optimizations that sacrifice existing functionality. Always verify if a periodic update is a feature before removing it.
