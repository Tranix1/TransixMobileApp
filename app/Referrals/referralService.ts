// referrals/referralService.ts
// All referral-commission logic lives here, isolated from payment and UI
// code so pricing/eligibility rules can change without touching the modal.
//
// Assumed data shape (adjust field/collection names to match your actual
// db/operations helpers — I don't have visibility into your schema):
//
//   Users/{userId} {
//     referredBy: string | null   // uid of the person who invited this user
//     referralCreditsGiven: number // how many of THIS user's payments have
//                                   // already earned their referrer a commission
//     walletBalance: number        // used for the referrer's earned credit
//   }
//
//   ReferralEarnings/{autoId} {   // audit trail, one doc per commission event
//     referrerId: string
//     fromUserId: string
//     subscriptionType: SubscriptionType
//     amount: number
//     createdAt: string
//   }

import {  readById, updateDocument, addDocument } from '@/db/operations';
import { SubscriptionType, SUBSCRIPTION_PRICING, REFERRAL_ELIGIBLE_PAYMENTS } from '@/constants/subscriptionConfig';

interface ReferralCreditResult {
  credited: boolean;
  reason?: 'no_referrer' | 'limit_reached' | 'error';
  referrerId?: string;
  amount?: number;
}

/**
 * Call this after a subscription payment succeeds. It looks up who
 * referred the paying user, and — if they haven't already used up their
 * REFERRAL_ELIGIBLE_PAYMENTS quota — credits the referrer's wallet with
 * the commission for that subscription type.
 */
export async function creditReferralIfEligible(
  payerUserId: string,
  subscriptionType: SubscriptionType
): Promise<ReferralCreditResult> {
  try {
    const payer = await readById('Users', payerUserId);
    const referrerId: string | null = payer?.referredBy ?? null;

    if (!referrerId) {
      return { credited: false, reason: 'no_referrer' };
    }

    const creditsGiven: number = payer?.referralCreditsGiven ?? 0;
    if (creditsGiven >= REFERRAL_ELIGIBLE_PAYMENTS) {
      return { credited: false, reason: 'limit_reached' };
    }

    const commission = SUBSCRIPTION_PRICING[subscriptionType].referralCommission;

    const referrer = await readById('Users', referrerId);
    const currentBalance: number = referrer?.walletBalance ?? 0;

    await updateDocument('Users', referrerId, {
      walletBalance: currentBalance + commission,
    });

    await updateDocument('Users', payerUserId, {
      referralCreditsGiven: creditsGiven + 1,
    });

    await addDocument('ReferralEarnings', {
      referrerId,
      fromUserId: payerUserId,
      subscriptionType,
      amount: commission,
      createdAt: new Date().toISOString(),
    });

    return { credited: true, referrerId, amount: commission };
  } catch (error) {
    console.error('Error crediting referral commission:', error);
    return { credited: false, reason: 'error' };
  }
}

/**
 * Utility for a "your referral code" screen — resolves a user's own
 * referral code so they can share it (assumes it's just their uid;
 * swap for a shorter generated code if you have one).
 */
export async function getMyReferralCode(userId: string): Promise<string> {
  return userId;
}

/**
 * Look up how many of a user's referrals are still earning them
 * commissions vs. exhausted, useful for a referral dashboard.
 */
export async function getReferralStatusForInvitee(inviteeUserId: string) {
  const invitee = await readById('Users', inviteeUserId);
  const creditsGiven: number = invitee?.referralCreditsGiven ?? 0;
  return {
    creditsGiven,
    remaining: Math.max(0, REFERRAL_ELIGIBLE_PAYMENTS - creditsGiven),
    exhausted: creditsGiven >= REFERRAL_ELIGIBLE_PAYMENTS,
  };
}
