## 2025-05-15 - Redundant Intl.NumberFormat instantiation in animations
**Learning:** `Intl.NumberFormat` is an expensive object to instantiate. In this codebase, it was being created inside a `useTransform` hook within `AnimatedNumber.tsx`, which runs on every frame during value transitions. This leads to unnecessary CPU spikes and garbage collection during animations.
**Action:** Always centralize `Intl` formatters as singleton instances (outside the component or in a utility file) to ensure they are only initialized once.
