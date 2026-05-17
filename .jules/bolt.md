## 2026-05-21 - Centralized Intl.NumberFormat for Animation Performance
**Learning:** Instantiating `Intl.NumberFormat` repeatedly inside animation frames (e.g., in a `useTransform` hook) causes significant performance overhead and potential frame drops.
**Action:** Always use a singleton instance of `Intl.NumberFormat` for high-frequency operations like animations or long list rendering.

## 2026-05-21 - Unused Timer-driven Re-renders
**Learning:** `setInterval` hooks used to update state in large parent components cause the entire tree to re-render. If the state is not actually rendered in the UI, these re-renders are completely wasted.
**Action:** Audit large components for unused timer-driven state updates and prune them to keep the main thread lean.
