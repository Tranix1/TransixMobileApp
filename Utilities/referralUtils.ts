import { fetchDocuments } from '@/db/operations';
import { addToWallet } from './walletUtils';
import { where } from 'firebase/firestore';

export interface ReferralCommission {
  referrerId: string;
  referredUserId: string;
  commissionAmount: number;
  originalPayment: number;
  paymentType: string;
  description: string;
}

/**
 * Get user's referrer information
 * @param userId - The user's ID
 * @returns Promise<string | null> - Referrer ID or null if no referrer
 */
export const getUserReferrer = async (userId: string): Promise<string | null> => {
  try {
    const filters = [where("userId", "==", userId)];
    const result = await fetchDocuments("Profile", 1, undefined, filters);

    if (result.data.length > 0) {
      return result.data[0].referrerId || null;
    }
    return null;
  } catch (error) {
    console.error('Error getting user referrer:', error);
    return null;
  }
};

/**
 * Process referral commission for a payment
 * @param userId - The user making the payment
 * @param paymentAmount - The total payment amount
 * @param paymentType - Type of payment (subscription, fuel, etc.)
 * @param description - Description of the payment
 * @returns Promise<boolean> - Success status
 */
export const processReferralCommission = async (
  userId: string,
  paymentAmount: number,
  paymentType: string,
  description: string
): Promise<boolean> => {
  try {
    // Get user's referrer
    const referrerId = await getUserReferrer(userId);
    if (!referrerId) {
      // No referrer, no commission to process
      return true;
    }

    // Calculate commission (20% of payment amount)
    const commissionAmount = paymentAmount * 0.2;
    const appRevenue = paymentAmount - commissionAmount;

    // Add commission to referrer's wallet
    const referrerSuccess = await addToWallet(
      referrerId,
      commissionAmount,
      `Referral commission from ${paymentType} payment`,
      'bonus'
    );

    if (!referrerSuccess) {
      console.error('Failed to add commission to referrer wallet');
      return false;
    }

    // Add app revenue to app wallet (assuming app has a special user ID)
    // For now, we'll log this - you might want to create a special app wallet
    console.log(`App revenue: $${appRevenue.toFixed(2)} from ${paymentType} payment`);

    // You could add app revenue to a special app wallet here
    // const appWalletSuccess = await addToWallet('APP_WALLET_ID', appRevenue, `Revenue from ${paymentType}`, 'deposit');

    // Log the commission for tracking
    console.log(`Referral commission processed: $${commissionAmount.toFixed(2)} to referrer ${referrerId} from user ${userId}`);

    return true;
  } catch (error) {
    console.error('Error processing referral commission:', error);
    return false;
  }
};

/**
 * Get referral statistics for a user
 * @param userId - The referrer's user ID
 * @returns Promise<{totalReferrals: number, totalCommission: number}>
 */
export const getReferralStats = async (userId: string): Promise<{totalReferrals: number, totalCommission: number}> => {
  try {
    // Get all users referred by this user
    const filters = [where("referrerId", "==", userId)];
    const result = await fetchDocuments("Profile", 50, undefined, filters);

    const totalReferrals = result.data.length;

    // Get commission transactions for this referrer
    const commissionFilters = [
      where("userId", "==", userId),
      where("type", "==", "bonus"),
      where("description", "in", ["Referral commission from subscription payment", "Referral commission from fuel payment", "Referral commission from truckstop payment"])
    ];

    const commissionResult = await fetchDocuments("WalletTransactions", 100, undefined, commissionFilters);

    let totalCommission = 0;
    commissionResult.data.forEach((transaction: any) => {
      if (transaction.status === 'completed') {
        totalCommission += transaction.amount;
      }
    });

    return { totalReferrals, totalCommission };
  } catch (error) {
    console.error('Error getting referral stats:', error);
    return { totalReferrals: 0, totalCommission: 0 };
  }
};