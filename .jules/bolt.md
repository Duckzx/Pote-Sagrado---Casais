## 2025-05-14 - [Intl.NumberFormat Singleton Optimization]
**Learning:** Instantiating `Intl.NumberFormat` objects is computationally expensive. In high-frequency paths like frame-by-frame animations (e.g., `AnimatedNumber` using Framer Motion), creating a new instance every time can lead to significant overhead (~1.1s vs ~11ms for 10k calls in local benchmark).
**Action:** Always centralize and reuse `Intl` instances (formatters, collators) in a singleton utility when used in loops or rendering paths.
