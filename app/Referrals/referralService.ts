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
  reason?: | "no_referrer" | "limit_reached" | "owner_not_found" | "error";
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
  payerOrganizationName: string,
  subscriptionType: SubscriptionType,
  commissionAmount: number,
  totalTruckSubscriptions?: number,
): Promise<ReferralCreditResult> {

  try {

    // Get verified business account
    const verifiedUser = await readById(
      'verifiedUsers',
      payerOrganizationId
    ) as {
      id: string;
      userId: string;
    };


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
      "personalData",
      ownerId
    ) as {
      referredBy?: {
        userId: string;
        name: string;
        email: string;
        referralCode: string;
        joinedAt: string;
      };
    };


    const referredBy = personalData?.referredBy;


    if (!referredBy?.userId) {
      return {
        credited: false,
        reason: 'no_referrer'
      };
    }


    // The person who earns the commission
    const referrerId = referredBy.userId;





    // Check previous referral commission
    const transactionsRef = collection(
      db,
      `referrers/${referrerId}/transactions`
    );


    const q = query(
      transactionsRef,
      where("organizationId", "==", payerOrganizationId),
      where("subscriptionType", "==", subscriptionType)
    );


    const snapshot = await getDocs(q);


    const previousTransactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));


    const timesEarned =
      previousTransactions.length;


    const maxTimes = 6;


    // Stop after 6 payments
    if (timesEarned >= maxTimes) {
      return {
        credited: false,
        reason: "limit_reached"
      };
    }


    const newTimesEarned = timesEarned + 1;

    const timesLeft = maxTimes - newTimesEarned;


    // Get referrer
    const referrer = await readById(
      "referrers",
      referrerId
    ) as {
      id: string;

      wallet?: {
        balance?: number;
        totalEarned?: number;
        totalWithdrawn?: number;
        updatedAt?: string;
      };
    };


    const currentBalance = referrer?.wallet?.balance ?? 0;
    const currentEarned = referrer?.wallet?.totalEarned ?? 0;


    const newBalance = currentBalance + commissionAmount;


    // Update referrer wallet
    await updateDocument(
      "referrers",
      referrerId,
      {
        wallet: {
          balance: newBalance,

          totalEarned: currentEarned + commissionAmount,

          updatedAt: new Date().toISOString(),
        }
      }
    );


    // Store earning transaction history
    await addDocument(
      `referrers/${referrerId}/transactions`,
      {

        type: "commission",

        amount: commissionAmount,


        referredUserId: ownerId,


        organizationId: payerOrganizationId,

        organizationName: payerOrganizationName,


        subscriptionType,


        ...(subscriptionType === "truck" && {
          totalTruckSubscriptions: totalTruckSubscriptions || 0,
        }),


        timesEarned: newTimesEarned,

        timesLeft,


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



