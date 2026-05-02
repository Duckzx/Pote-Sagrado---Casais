# Security Spec

## 1. Data Invariants
- A deposit cannot exist without a valid `casalId` linking to a valid `casais` path.
- A user can only access deposits and configs of their own `casalId` which is either explicit or implicit in `/users/{userId}`.
- Immutable fields like `createdAt` must match server time.

## 2. The Dirty Dozen Payloads
1. Null amount
2. Missing action on deposit
3. Incorrect who ID (identity spoofing)
4. Missing who ID
5. Invalid date (e.g. from future)
6. Updating createdAt constraint
7. Unauthorized user
8. String as number
9. Exceeding max character limit
10. Malicious HTML script injection via display name
11. Reading different user's deposits
12. Attempt to update unrelated user's comments

## 3. The Test Runner
A `firestore.rules.test.ts` script should be executed against the emulator to ensure all these return `PERMISSION_DENIED`.
