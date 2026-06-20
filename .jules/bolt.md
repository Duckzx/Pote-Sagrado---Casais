# Bolt's Performance Journal

## 2024-05-24 - Intl.NumberFormat Optimization
**Learning:** Instantiating `Intl.NumberFormat` inside render loops or animation frames (like `useTransform`) is extremely expensive (up to 1ms per call). In a 60fps animation with multiple numbers, this can consume a significant portion of the frame budget.
**Action:** Always use a singleton instance for `Intl.NumberFormat` or other expensive constructors when used in high-frequency paths. Centralized `formatBRL` utility was implemented to achieve this.
