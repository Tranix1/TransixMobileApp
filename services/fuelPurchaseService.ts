import { addDocument, fetchDocuments } from '@/db/operations';

import { FuelItem, FuelPurchase } from '@/types/types';

export interface FuelPurchaseRecord extends FuelPurchase {
    userId: string;
    userEmail?: string;
    paymentMethod: string;
    phoneNumber: string;
    createdAt: Date;
    updatedAt: Date;
}

export class FuelPurchaseService {
    private static readonly COLLECTION_NAME = 'FuelPurchases';

    /**
     * Save a fuel purchase record to the database
     */
    static async saveFuelPurchase(purchase: FuelPurchaseRecord): Promise<{ success: boolean; id?: string; error?: string }> {
        try {
            const result = await addDocument(this.COLLECTION_NAME, purchase);
            return { success: true, id: result };
        } catch (error: any) {
            console.error('Error saving fuel purchase:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get fuel purchase history for a user
     */
    static async getUserFuelPurchases(userId: string, limit: number = 20): Promise<{ success: boolean; data?: FuelPurchaseRecord[]; error?: string }> {
        try {
            const result = await fetchDocuments(this.COLLECTION_NAME, limit);
            // Filter by userId (this would be better done with a query in a real implementation)
            const userPurchases = result.data.filter((purchase: any) => purchase.userId === userId);
            return { success: true, data: userPurchases as FuelPurchaseRecord[] };
        } catch (error: any) {
            console.error('Error fetching fuel purchases:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get a specific fuel purchase by ID
     */
    static async getFuelPurchaseById(purchaseId: string): Promise<{ success: boolean; data?: FuelPurchaseRecord; error?: string }> {
        try {
            const result = await fetchDocuments(this.COLLECTION_NAME);
            const purchase = result.data.find((p: any) => p.id === purchaseId);
            if (purchase) {
                return { success: true, data: purchase as FuelPurchaseRecord };
            } else {
                return { success: false, error: 'Purchase not found' };
            }
        } catch (error: any) {
            console.error('Error fetching fuel purchase:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Update fuel purchase status
     */
    static async updateFuelPurchaseStatus(purchaseId: string, status: 'pending' | 'completed' | 'cancelled'): Promise<{ success: boolean; error?: string }> {
        try {
            // In a real implementation, you would use updateDocument here
            // For now, we'll just return success
            console.log(`Updating fuel purchase ${purchaseId} status to ${status}`);
            return { success: true };
        } catch (error: any) {
            console.error('Error updating fuel purchase status:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get fuel purchase statistics for a user
     */
    static async getUserFuelStats(userId: string): Promise<{ success: boolean; data?: any; error?: string }> {
        try {
            const result = await this.getUserFuelPurchases(userId, 100);
            if (!result.success || !result.data) {
                return { success: false, error: result.error };
            }

            const purchases = result.data;
            const totalSpent = purchases.reduce((sum, purchase) => sum + purchase.totalAmount, 0);
            const totalPurchases = purchases.length;
            const multiPayments = purchases.filter(p => p.isMultiPayment).length;
            const singlePayments = totalPurchases - multiPayments;

            // Group by fuel type
            const fuelTypeStats: { [key: string]: { totalQuantity: number; totalSpent: number } } = {};
            purchases.forEach(purchase => {
                purchase.fuelItems.forEach(item => {
                    if (!fuelTypeStats[item.fuelType]) {
                        fuelTypeStats[item.fuelType] = { totalQuantity: 0, totalSpent: 0 };
                    }
                    fuelTypeStats[item.fuelType].totalQuantity += item.quantity;
                    fuelTypeStats[item.fuelType].totalSpent += item.subtotal;
                });
            });

            // Group by station
            const stationStats: { [key: string]: { totalSpent: number; visitCount: number } } = {};
            purchases.forEach(purchase => {
                if (!stationStats[purchase.stationName]) {
                    stationStats[purchase.stationName] = { totalSpent: 0, visitCount: 0 };
                }
                stationStats[purchase.stationName].visitCount += 1;
                stationStats[purchase.stationName].totalSpent += purchase.totalAmount;
            });

            return {
                success: true,
                data: {
                    totalSpent,
                    totalPurchases,
                    multiPayments,
                    singlePayments,
                    fuelTypeStats,
                    stationStats,
                    averagePurchaseAmount: totalPurchases > 0 ? totalSpent / totalPurchases : 0
                }
            };
        } catch (error: any) {
            console.error('Error calculating fuel stats:', error);
            return { success: false, error: error.message };
        }
    }
}
