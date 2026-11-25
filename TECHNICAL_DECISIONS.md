# TECHNICAL DECISIONS

## 1. Authentication Strategy
**Decision:** NextAuth v5 with JWT strategy (not database sessions)
**Reason:** Stateless, works well with Next.js App Router, no extra DB queries per request. Role stored in JWT token.

## 2. Financial Amounts — Integer Cents
**Decision:** Store all monetary amounts as integer cents (e.g., $10.50 = 1050)
**Reason:** Avoids floating-point arithmetic errors. All display formatting done via `formatCurrency()` utility.

## 3. Atomic Financial Operations — MongoDB Sessions
**Decision:** Use `mongoose.startSession()` + `session.withTransaction()` for transfers, loan disbursements, and repayments
**Reason:** Ensures atomicity — if any step fails, entire operation rolls back. Prevents money loss scenarios.

## 4. Idempotency Keys
**Decision:** Client generates a UUID idempotency key for transfers and loan repayments. Server checks for duplicate keys before processing.
**Reason:** Prevents duplicate transactions from network retries or double-clicks.

## 5. Server-Side Financial Validation
**Decision:** Never trust amount/balance values from frontend. Always re-fetch from DB before processing.
**Reason:** Prevents client-side manipulation of financial values.

## 6. PIN Security
**Decision:** Hash transaction PINs with Argon2. Lock account after 5 failed attempts for 30 minutes.
**Reason:** Prevents brute-force PIN attacks. `failedPinAttempts` and `pinLockedUntil` fields already in User model.

## 7. Suspicious Transaction Detection — Rule-Based
**Decision:** Flag transactions that match these rules:
- Single transfer > 80% of daily limit
- More than 3 transfers within 1 hour from same account
- 3+ consecutive failed PIN attempts
**Reason:** Simple, deterministic, no ML required. Flagged transactions go to admin review.

## 8. Deposit/Withdrawal Workflow
**Decision:** Customers submit requests → Admin/Staff reviews → Approve/Reject
**Reason:** Simulates real banking where cash deposits/withdrawals require teller verification.

## 9. Redux Toolkit + RTK Query
**Decision:** All API calls via RTK Query. UI state (sidebar, theme) via Redux slices.
**Reason:** Consistent caching, automatic loading/error states, cache invalidation on mutations.

## 10. Loan Interest Calculation
**Decision:** Standard amortization formula: M = P[r(1+r)^n]/[(1+r)^n-1]
Where P = principal, r = monthly rate, n = months
**Reason:** Industry standard. Interest rate configurable via BankingSettings.

## 11. Account Number Format
**Decision:** `ACC` + last 6 digits of timestamp + 4 random digits = 13 chars (e.g., ACC7234561234)
**Reason:** Unique, readable, not guessable.

## 12. Transaction Reference Format
**Decision:** `TXN` + 16 char UUID hex = 19 chars (e.g., TXNA1B2C3D4E5F6G7H8)
**Reason:** Globally unique, traceable.

## 13. Topbar Integration
**Decision:** Topbar rendered inside DashboardLayoutClient (client component) so it can access Redux sidebar state
**Reason:** Topbar needs to know sidebar open/close state for proper layout.

## 14. Public Pages
**Decision:** Separate `(public)` route group for landing, about, services, contact
**Reason:** Clean separation from auth and dashboard routes. No auth required.

## 15. Staff Permissions
**Decision:** Staff can view and add notes to loans but cannot approve/reject. Only Admin can approve/reject loans.
**Reason:** Follows principle of least privilege. Prevents staff from self-approving.
