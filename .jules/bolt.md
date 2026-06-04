## 2026-06-04 - [Pattern] O(N*M) search in useEffect monitoring collection state
**Learning:** React effects that compare a current collection against a previous ref-stored collection can easily become O(N^2) or O(N*M) bottlenecks as the list grows (e.g., the 200-item deposit limit in this app).
**Action:** Use `Map` and `Set` to index the previous collection for O(1) lookups inside the iteration of the current collection, reducing complexity to O(N+M).

## 2026-06-04 - [Rejected] Removal of "unused" code based on grep
**Learning:** Variables that appear unused by `grep` (e.g., `quote`, `Icon`) may still be referenced in the same file or in a way that `grep` misses if not careful (though in this case, I just failed to see they were in the JSX or actually were used). Actually, a code review revealed that removing them broke the UI.
**Action:** Always perform a deeper manual verification of JSX and component logic before removing variables, even if they seem like "dead code". Re-check if they are used as component names (PascalCase) or inside template literals.
