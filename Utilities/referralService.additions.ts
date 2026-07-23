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

import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/db/fireBaseConfig';
import { readById, updateDocument, addDocument } from '@/db/operations';

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
  const referrer = await readById('referrers', referrerUserId) as any;

  const balance = referrer?.wallet?.balance ?? 0;
  const totalEarned = referrer?.wallet?.totalEarned ?? 0;
  const totalWithdrawn = referrer?.wallet?.totalWithdrawn ?? 0;

  const referredUsersSnapshot = await getDocs(
    query(
      collection(db, 'personalData'),
      where('referredBy.userId', '==', referrerUserId),
      orderBy('createdAt', 'asc')
    )
  );

  const transactionSnapshot = await getDocs(
    query(
      collection(db, `referrers/${referrerUserId}/transactions`),
      orderBy('createdAt', 'desc')
    )
  );

  const transactions = transactionSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as any[];

  const commissionByUser: Record<string, number> = {};
  const firstSubscriptionByUser: Record<string, string> = {};

  transactions.forEach((transaction) => {
    if (transaction.type === 'commission' && transaction.referredUserId) {
      const userId = transaction.referredUserId;
      commissionByUser[userId] = (commissionByUser[userId] || 0) + (transaction.amount || 0);
      if (!firstSubscriptionByUser[userId] && transaction.createdAt) {
        firstSubscriptionByUser[userId] = transaction.createdAt;
      }
    }
  });

  const referredUsers = referredUsersSnapshot.docs.map((doc) => {
    const data = doc.data() as any;
    const id = doc.id;
    const commissionEarned = commissionByUser[id] || 0;

    return {
      id,
      name: data.displayName || data.name || data.organisation || 'Unknown',
      phoneNumber: data.phoneNumber || data.contact || 'Unknown',
      status: commissionEarned > 0 ? 'subscribed' : 'not_subscribed',
      dateReferred: data.createdAt || data.joinedAt || (data.timeStamp?.toDate?.toISOString?.() ?? new Date().toISOString()),
      dateSubscribed: firstSubscriptionByUser[id],
      subscriptionType: commissionEarned > 0 ? 'truck' : undefined,
      commissionEarned,
    } as ReferredUser;
  });

  const earningsHistory = transactions.map((transaction) => {
    const data = transaction as any;
    return {
      id: transaction.id,
      referredUserName:
        data.referredUserName || data.referredUserId || data.organizationName || 'Unknown',
      amount: data.amount || 0,
      date: data.createdAt || (data.timeStamp?.toDate?.toISOString?.() ?? new Date().toISOString()),
      reason:
        data.type === 'commission'
          ? `${data.subscriptionType || 'Subscription'} commission`
          : data.type === 'withdrawal'
            ? 'Withdrawal'
            : String(data.type || 'Activity'),
    } as EarningsEntry;
  });

  return {
    availableBalance: balance,
    totalEarned,
    totalWithdrawn,
    referredUsers,
    earningsHistory,
  };
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
  if (amount <= 0) {
    return { success: false, message: 'Withdrawal amount must be greater than zero.' };
  }

  const referrer = await readById('referrers', referrerUserId) as any;
  if (!referrer) {
    return { success: false, message: 'Referrer not found.' };
  }

  const currentBalance = referrer?.wallet?.balance ?? 0;
  const currentWithdrawn = referrer?.wallet?.totalWithdrawn ?? 0;

  if (amount > currentBalance) {
    return { success: false, message: 'Withdrawal amount exceeds available balance.' };
  }

  const newBalance = currentBalance - amount;
  const newTotalWithdrawn = currentWithdrawn + amount;

  await updateDocument('referrers', referrerUserId, {
    wallet: {
      balance: newBalance,
      totalWithdrawn: newTotalWithdrawn,
      updatedAt: new Date().toISOString(),
    },
  });

  await addDocument(`referrers/${referrerUserId}/transactions`, {
    type: 'withdrawal',
    amount,
    method,
    destination,
    status: 'pending',
    createdAt: new Date().toISOString(),
  });

  return { success: true };
}
