/**
 * Reference signatures for the two functions ReferralDashboardScreen.tsx and
 * WithdrawModal.tsx expect from referralService.ts. Wire these up to your
 * actual DB (mirrors the `updateDocument` pattern used in finalizeSuccess()
 * inside SubscriptionPaymentModal.tsx). Delete this file once implemented —
 * it's just here so the two component files aren't referencing functions
 * that don't exist yet.
 */

interface ReferredUser {
  id: string;
  name: string;
  phoneNumber: string;
  status: 'subscribed' | 'not_subscribed';
  dateReferred: string;
  dateSubscribed?: string;
  subscriptionType?: 'truck' | 'broker' | 'tracking';
  commissionEarned: number;
}

interface EarningsEntry {
  id: string;
  referredUserName: string;
  amount: number;
  date: string;
  reason: string;
}

interface ReferralDashboardData {
  availableBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  referredUsers: ReferredUser[];
  earningsHistory: EarningsEntry[];
}

/**
 * Pull together everything the dashboard needs in one call:
 * 1. Look up all users this referrer brought in (e.g. a `referredBy` field
 *    on the Users collection, or a dedicated Referrals collection).
 * 2. For each, check whether they have an active subscription
 *    (TrackedVehicles.subscription.status === 'active').
 * 3. Look up the referrer's balance record (availableBalance, totalEarned,
 *    totalWithdrawn — these should already be maintained by
 *    creditReferralIfEligible whenever a commission is credited).
 * 4. Look up the commission ledger/history for the "how it's added" list.
 */
export async function getReferralDashboardData(
  referrerUserId: string
): Promise<ReferralDashboardData> {
  // TODO: replace with real DB calls, e.g.:
  // const { getDocuments } = await import('@/db/operations');
  // const referredUsers = await getDocuments('Users', where('referredBy', '==', referrerUserId));
  // const balanceDoc = await getDocument('ReferralBalances', referrerUserId);
  // const history = await getDocuments('ReferralEarnings', where('referrerId', '==', referrerUserId));
  throw new Error('getReferralDashboardData not implemented');
}

/**
 * Create a withdrawal request. Typically you'd:
 * 1. Re-check the referrer's current balance server-side (never trust the
 *    client-passed amount alone) to avoid race conditions / double-spends.
 * 2. Deduct from availableBalance and add to totalWithdrawn (or mark the
 *    request 'pending' if withdrawals are manually approved).
 * 3. Kick off the actual payout (Ecocash disbursement API / bank transfer)
 *    — this can reuse patterns from paymentHandlers.ts if you have a payout
 *    equivalent, or route to a manual review queue.
 */
export async function requestWithdrawal(
  referrerUserId: string,
  amount: number,
  method: 'ecocash' | 'bank',
  destination: string
): Promise<{ success: boolean; message?: string }> {
  // TODO: replace with real implementation.
  throw new Error('requestWithdrawal not implemented');
}
