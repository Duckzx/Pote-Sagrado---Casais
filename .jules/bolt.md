## 2026-05-12 - Centralized Currency Formatting
**Learning:** `Intl.NumberFormat` instantiation is an expensive operation. In high-frequency render paths like Framer Motion's `useTransform`, creating a new instance on every frame can cause measurable main-thread jank and CPU spikes.
**Action:** Always use a singleton instance of `Intl.NumberFormat` for repeated formatting tasks, especially in hooks that run on every animation frame.
