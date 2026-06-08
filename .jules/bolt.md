## 2026-06-08 - Centralization of Intl.NumberFormat
**Learning:** Instantiating `Intl.NumberFormat` repeatedly is a significant performance bottleneck, especially in high-frequency execution paths like Framer Motion's `useTransform` or large list renderings.
**Action:** Always centralize `Intl.NumberFormat` instances as singletons in a utility file and export a helper function for reuse throughout the application.
