## 2025-05-15 - [Optimization] Intl.NumberFormat and HomeTab Re-renders

**Learning:** Repeatedly instantiating `Intl.NumberFormat` in high-frequency paths (like `SacredPot.tsx` renders) adds measurable overhead (0.5ms-1.0ms per call). Centralizing it in a singleton utility (`maskUtils.ts`) provides a cleaner API and significant performance gains. Additionally, `setInterval` hooks that update state but aren't visibly rendered (like the quote interval in `HomeTab.tsx`) cause expensive full-component re-renders for no user-visible benefit.

**Action:** Always check for repeated `Intl` or expensive object instantiations in render loops. Audit `useEffect` intervals to ensure they are actually needed for visible UI updates. When optimizing `HomeTab.tsx`, be extremely careful not to remove "unused" looking variables that might be required by child components or specific props (like `goalType` affecting `SacredPot` via constants in `HomeTab`).
