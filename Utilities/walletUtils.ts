import { fetchDocuments } from '@/db/operations';
import { where } from 'firebase/firestore';

export interface WalletBalance {
  balance: number;
  transactions: any[];
}

/**
 * Get the current wallet balance for a user
 * @param userId - The user's ID
 * @returns Promise<WalletBalance>
 */
export const getWalletBalance = async (userId: string): Promise<WalletBalance> => {
  try {
    const filters = [where("userId", "==", userId)];
    const result = await fetchDocuments("WalletTransactions", 50, undefined, filters);

    let totalBalance = 0;
    const transactions = result.data || [];

    transactions.forEach((transaction: any) => {
      if (transaction.status === 'completed') {
        if (transaction.type === 'deposit' || transaction.type === 'reward' || transaction.type === 'bonus') {
          totalBalance += transaction.amount;
        } else if (transaction.type === 'withdrawal') {
          totalBalance -= transaction.amount;
        }
      }
    });

    return {
      balance: totalBalance,
      transactions: transactions
    };
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    throw error;
  }
};

/**
 * Check if user has sufficient balance for a transaction
 * @param userId - The user's ID
 * @param amount - The amount required
 * @returns Promise<boolean>
 */
export const hasSufficientBalance = async (userId: string, amount: number): Promise<boolean> => {
  try {
    const { balance } = await getWalletBalance(userId);
    return balance >= amount;
  } catch (error) {
    console.error('Error checking balance:', error);
    return false;
  }
};

/**
 * Deduct amount from wallet balance
 * @param userId - The user's ID
 * @param amount - The amount to deduct
 * @param description - Description of the transaction
 * @param paymentMethod - Payment method used
 * @returns Promise<boolean> - Success status
 */
export const deductFromWallet = async (
  userId: string,
  amount: number,
  description: string,
  paymentMethod: string = 'wallet'
): Promise<boolean> => {
  try {
    const { addDocument } = await import('@/db/operations');

    const transactionData = {
      userId: userId,
      type: 'withdrawal',
      amount: amount,
      paymentMethod: paymentMethod,
      status: 'completed',
      description: description,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await addDocument('WalletTransactions', transactionData);
    return true;
  } catch (error) {
    console.error('Error deducting from wallet:', error);
    return false;
  }
};

/**
 * Add amount to wallet balance
 * @param userId - The user's ID
 * @param amount - The amount to add
 * @param description - Description of the transaction
 * @param type - Type of transaction ('deposit', 'reward', 'bonus')
 * @returns Promise<boolean> - Success status
 */
export const addToWallet = async (
  userId: string,
  amount: number,
  description: string,
  type: 'deposit' | 'reward' | 'bonus' = 'deposit'
): Promise<boolean> => {
  try {
    const { addDocument } = await import('@/db/operations');

    const transactionData = {
      userId: userId,
      type: type,
      amount: amount,
      status: 'completed',
      description: description,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await addDocument('WalletTransactions', transactionData);
    return true;
  } catch (error) {
    console.error('Error adding to wallet:', error);
    return false;
  }
};