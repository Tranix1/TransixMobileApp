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

import { readById, updateDocument, addDocument } from '@/db/operations';
import { SubscriptionType, SUBSCRIPTION_PRICING, REFERRAL_ELIGIBLE_PAYMENTS } from '@/constants/subscriptionConfig';
import { getDocs, where, query, collection } from 'firebase/firestore';
import { db } from '@/db/fireBaseConfig';

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







// Subscription happens
//         |
//         ↓
// verifiedUsers (organization)
//         |
//         ↓
// Get business owner userId
//         |
//         ↓
// personalData/{ownerId}
//         |
//         ↓
// referredBy.userId
//         |
//         ↓
// referralWallet/{referrerUserId}
//         |
//         ↓
// Add commission








export async function creditReferralIfEligible(
  payerOrganizationId: string,
  subscriptionType: SubscriptionType,
  subscriberId: string,
  commissionAmount: number,
): Promise<ReferralCreditResult> {

  try {

    // Get verified business account
    const verifiedUser = await readById(
      'verifiedUsers',
      payerOrganizationId
    );


    if (!verifiedUser?.userId) {
      return {
        credited: false,
        reason: 'owner_not_found'
      };
    }


    // Business owner
    const ownerId = verifiedUser.userId;


    // Get owner's referral information
    const personalData = await readById(
      'personalData',
      ownerId
    );


    const referredBy = personalData?.referredBy;


    if (!referredBy?.userId) {
      return {
        credited: false,
        reason: 'no_referrer'
      };
    }


    // The person who earns the commission
    const referrerId = referredBy.userId;


    // Get referral wallet
    const wallet = await readById(
      'referralWallet',
      referrerId
    );


    const currentBalance = wallet?.balance ?? 0;
    const currentEarned = wallet?.totalEarned ?? 0;


    const newBalance = currentBalance + commissionAmount;


    // Update referral wallet
    await updateDocument(
      'referralWallet',
      referrerId,
      {
        balance: newBalance,
        totalEarned: currentEarned + commissionAmount,
        updatedAt: new Date().toISOString(),
      }
    );


    // Store earning history
    await addDocument(
      'referralWalletTransactions',
      {
        referrerId,

        referredUserId: ownerId,

        referredOrganizationId: payerOrganizationId,

        subscriptionType,

        amount: commissionAmount,

        type: 'commission',

        createdAt: new Date().toISOString(),
      }
    );


    return {
      credited: true,
      referrerId,
      amount: commissionAmount,
    };


  } catch (error) {

    console.error(
      'Error crediting referral commission:',
      error
    );


    return {
      credited: false,
      reason: 'error'
    };
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
