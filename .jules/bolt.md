## 2025-05-15 - [Optimization] Moving Toast State Down
**Learning:** Subscribing to global state (like toasts) in the root component causes the entire application to re-render on every state change, even if the change is transient or scoped to a small UI element.
**Action:** Always prefer creating "Connected" wrapper components for global UI elements like Toasts, Modals, or Loaders to isolate re-renders and keep the main app shell stable.
