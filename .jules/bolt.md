## 2026-06-25 - Performance Bottleneck: Repeated Intl.NumberFormat Instantiation
**Learning:** Instantiating `Intl.NumberFormat` is an expensive operation. When called within a Framer Motion `useTransform` hook or high-frequency render loops (like currency formatting in an animated counter), it creates significant CPU overhead and garbage collection pressure, leading to frame drops.
**Action:** Centralize `Intl.NumberFormat` instances as singletons in utility files (e.g., `src/lib/maskUtils.ts`) and reuse them across the application.

## 2026-06-25 - False Positive on "Unused" Code in HomeTab.tsx
**Learning:** A simple `grep` search for variable usage in JSX can fail if elements are rendered dynamically or passed as props in a way that doesn't use standard `{varName}` syntax. Attempting to remove "unused" state (`quote`, `Icon`) in `HomeTab.tsx` resulted in broken core functionality.
**Action:** Always perform manual JSX inspection and component trace before removing state or constants that appear unused by automated tools in complex components.
