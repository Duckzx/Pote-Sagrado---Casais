## 2025-05-15 - [Unused State causing Redundant Re-renders]
**Learning:** Found a component (`HomeTab.tsx`) using `setInterval` to update state variables (`quote`, `relationshipQuote`) every 10 seconds, but these variables were not used anywhere in the JSX. This caused the entire component to re-render unnecessarily every 10 seconds.
**Action:** Always verify if state variables are actually rendered or used in logic before assuming they are necessary. Use `grep` or IDE search to trace variable usage across the file.
