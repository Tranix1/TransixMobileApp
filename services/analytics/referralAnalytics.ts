import { collection, doc, getDocs, increment, query, serverTimestamp, setDoc, where, type QueryConstraint } from "firebase/firestore";
import { db } from "@/db/fireBaseConfig";

export type ReferralMetric = "signups" | "verifiedUsers" | "subscriptions" | "trackingSubscriptions" | "brokerageSubscriptions" | "truckSubscriptions" | "walletEarnings" | "walletPaid" | "walletPending" | "activeUsers" | "completedTrips" | "completedLoads" | "totalRevenueGenerated" | "lifetimeCommission" | "monthlyCommission" | "yearlyCommission";

/** Atomically changes one referrer's derived statistics document. */
export async function incrementReferralMetric(referrerId: string, metric: ReferralMetric, amount = 1): Promise<void> {
  if (!referrerId) throw new Error("referrerId is required for referral analytics");
  await setDoc(doc(db, "referralAnalytics", referrerId), { [metric]: increment(amount), updatedAt: serverTimestamp() }, { merge: true });
}
type MetricHelper = (referrerId: string, amount?: number) => Promise<void>;
const metric = (name: ReferralMetric): MetricHelper => (id, amount = 1) => incrementReferralMetric(id, name, amount);

/** Referral-summary increment helpers. Monetary fields should use one normalized minor currency unit. */
export const incrementSignups = metric("signups"); export const incrementVerifiedUsers = metric("verifiedUsers"); export const incrementSubscriptions = metric("subscriptions"); export const incrementTrackingSubscriptions = metric("trackingSubscriptions"); export const incrementBrokerageSubscriptions = metric("brokerageSubscriptions"); export const incrementTruckSubscriptions = metric("truckSubscriptions");
export const incrementWalletEarnings = metric("walletEarnings"); export const incrementWalletPaid = metric("walletPaid"); export const incrementWalletPending = metric("walletPending"); export const incrementActiveUsers = metric("activeUsers"); export const incrementCompletedTrips = metric("completedTrips"); export const incrementCompletedLoads = metric("completedLoads"); export const incrementTotalRevenueGenerated = metric("totalRevenueGenerated"); export const incrementLifetimeCommission = metric("lifetimeCommission"); export const incrementMonthlyCommission = metric("monthlyCommission"); export const incrementYearlyCommission = metric("yearlyCommission");

export interface FunnelStage { eventName: string; label: string; }
export interface FunnelResult extends FunnelStage { users: number; conversionFromPrevious: number | null; conversionFromSignup: number | null; }

/** Default event sequence for measuring referral conversion. */
export const referralFunnelStages: readonly FunnelStage[] = [
  { eventName: "account_created", label: "Accounts Created" }, { eventName: "verification_submitted", label: "Verification Submitted" }, { eventName: "account_verified", label: "Verified" },
  { eventName: "load_created", label: "First Load Posted" }, { eventName: "load_booked", label: "First Booking" }, { eventName: "trip_completed", label: "First Completed Trip" },
  { eventName: "subscription_paid", label: "Subscription Purchased" }, { eventName: "repeat_customer", label: "Repeat Customer" },
];

/** Reads immutable events and returns distinct-user counts plus conversion percentages for a referrer. */
export async function calculateReferralFunnel(referrerId: string, stages: readonly FunnelStage[] = referralFunnelStages): Promise<FunnelResult[]> {
  if (!referrerId) throw new Error("referrerId is required for funnel analytics");
  const results = await Promise.all(stages.map(async (stage) => {
    const constraints: QueryConstraint[] = [where("referrerId", "==", referrerId), where("eventName", "==", stage.eventName)];
    const snapshot = await getDocs(query(collection(db, "analyticsEvents"), ...constraints));
    return { ...stage, users: new Set(snapshot.docs.map((item) => item.data().userId).filter(Boolean)).size };
  }));
  const signups = results[0]?.users ?? 0;
  return results.map((stage, index) => {
    const previous = index ? results[index - 1].users : 0;
    return { ...stage, conversionFromPrevious: index ? (previous ? (stage.users / previous) * 100 : 0) : null, conversionFromSignup: signups ? (stage.users / signups) * 100 : 0 };
  });
}
