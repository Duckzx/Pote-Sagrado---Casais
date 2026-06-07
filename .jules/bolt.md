## 2026-06-15 - Toast De-coupling
**Learning:** In large React applications (like `App.tsx` here), subscribing to transient global state (like a list of toasts) causes the entire application shell to re-render every time a notification is added or expires. This is particularly expensive when the shell contains lazy-loaded components, complex animations (Framer Motion), and multiple context providers.

**Action:** Use a "Connected Component" pattern (e.g., `ConnectedToastContainer`) that subscribes directly to the store at a leaf level. This keeps the parent component "stable" and isolates re-renders to only the component that actually needs to update.
