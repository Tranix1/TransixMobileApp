// subscriptionConfig.ts
// Single source of truth for subscription pricing and referral commissions.
// Keep this in sync any time pricing changes — the modal, the payment handlers,
// and the referral service all read from here so nothing drifts out of sync.

export type SubscriptionType = 'truck' | 'brokerage' | 'tracking';

export interface SubscriptionPricing {
  amount: number;            // USD amount charged to the subscriber
  referralCommission: number; // USD credited to the referrer per eligible payment
  label: string;              // Human readable label shown in the modal
  icon: string;                // Ionicons name
}

export const SUBSCRIPTION_PRICING: Record<SubscriptionType, SubscriptionPricing> = {
  truck: {
    amount: 15,
    referralCommission: 3,
    label: 'Truck Subscription',
    icon: 'bus-outline',
  },
  brokerage: {
    amount: 10,
    referralCommission: 5,
    label: 'Brokerage Subscription',
    icon: 'briefcase-outline',
  },
  tracking: {
    amount: 10,
    referralCommission: 2,
    label: 'Tracking Subscription',
    icon: 'location-outline',
  },
};

// Number of a referred user's subscription payments that earn their referrer
// a commission. After this many qualifying payments, no further commission
// is credited for that particular referred user.
export const REFERRAL_ELIGIBLE_PAYMENTS = 6;

export type PaymentMethod = 'ecocash' | 'card';
