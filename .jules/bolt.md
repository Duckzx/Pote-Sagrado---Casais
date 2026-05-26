## 2026-05-26 - [Optimized BRL Currency Formatting]
**Learning:** Initializing `Intl.NumberFormat` is computationally expensive. In high-frequency code paths like animations (e.g., `AnimatedNumber` using Framer Motion's `useTransform`), creating a new instance on every frame can lead to noticeable performance degradation and high CPU usage.
**Action:** Always centralize `Intl` formatters as singletons in a utility file and reuse them across the application to minimize overhead and ensure consistency.

## 2026-05-26 - [Eliminated Unused Re-render Loop]
**Learning:** Unused state updates triggered by `setInterval` (like the motivational quotes in `HomeTab`) are a "silent" performance killer, causing the entire component tree to re-render periodically even when the UI remains identical.
**Action:** Audit component effects for "dead" intervals or timeouts that update unused state and remove them to keep the application idle-efficient.
