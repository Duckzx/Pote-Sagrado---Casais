## 2025-05-14 - [O(N*M) Loop in App.tsx]
**Learning:** The main deposit monitoring effect in AppContent was using nested loops (find/some) to detect new comments and reactions, leading to O(N*M) complexity. While fast for small lists, it scales poorly as couples accumulate history.
**Action:** Always prefer Map for ID-based lookups and Set for existence checks when comparing current vs previous state in sync effects to maintain O(N+M) complexity.
