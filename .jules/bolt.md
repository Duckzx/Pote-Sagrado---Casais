
## 2026-05-18 - Centralized Intl.NumberFormat
**Learning:** Instantiating `Intl.NumberFormat` repeatedly in React render loops or animation transforms (e.g., `useTransform`) is expensive due to locale resolution overhead.
**Action:** Always centralize `Intl` formatters as singleton instances in a utility file to minimize initialization costs and memory allocations.
