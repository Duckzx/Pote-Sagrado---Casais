## 2026-07-03 - Centralizing Intl.NumberFormat
**Learning:** Instantiating `Intl.NumberFormat` repeatedly in frequently re-rendered components (especially in animation hooks like `useTransform`) is a significant performance bottleneck.
**Action:** Always centralize `Intl.NumberFormat` and other expensive `Intl` objects as singletons in utility files to ensure reuse across the application.
