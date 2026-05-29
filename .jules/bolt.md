## 2026-05-29 - Centralized Formatting & Interval Cleanup
**Learning:** Instantiating `Intl.NumberFormat` is computationally expensive and was being done on every frame of currency animations via `useTransform`. Additionally, `HomeTab.tsx` had a legacy `setInterval` re-rendering the component every 10 seconds for unused state.
**Action:** Centralize expensive `Intl` objects as constants and audit components for orphaned interval/state logic that triggers unnecessary re-renders.
