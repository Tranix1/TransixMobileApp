import { doc, increment, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/db/fireBaseConfig";

export type DashboardType = "fleet" | "brokerage";
export type DashboardMetric =
  | "accountsCreated" | "verifiedAccounts" | "totalLoads" | "activeLoads" | "completedLoads" | "cancelledLoads" | "publicLoads" | "privateFleetLoads" | "privateBrokerageLoads"
  | "recommendedTrucks" | "acceptedRecommendations" | "bookings" | "acceptedBookings" | "cancelledBookings" | "assignmentsCreated" | "assignmentsStarted" | "assignmentsCompleted"
  | "activeTrips" | "completedTrips" | "cancelledTrips" | "totalTrucks" | "busyTrucks" | "availableTrucks" | "offlineTrucks" | "trackersLinked" | "onlineTrackers" | "offlineTrackers"
  | "revenue" | "expenses" | "profit" | "walletBalance" | "walletDeposits" | "withdrawalsRequested" | "withdrawalsCompleted" | "trackingRevenue" | "brokerageRevenue" | "subscriptionRevenue" | "referralCommissionPaid"
  | "referredUsers" | "verifiedReferrals" | "activeReferrals";

/** Atomically changes one live fleet or brokerage dashboard value. */
export async function incrementDashboardMetric(type: DashboardType, organizationId: string, metric: DashboardMetric, amount = 1): Promise<void> {
  if (!organizationId) throw new Error("organizationId is required for dashboard analytics");
  await setDoc(doc(db, "dashboardAnalytics", type, "organizations", organizationId), { [metric]: increment(amount), updatedAt: serverTimestamp() }, { merge: true });
}
type MetricHelper = (type: DashboardType, organizationId: string, amount?: number) => Promise<void>;
const metric = (name: DashboardMetric): MetricHelper => (type, organizationId, amount = 1) => incrementDashboardMetric(type, organizationId, name, amount);

/** Dashboard increment helpers. Amount defaults to one; use a signed amount for state transitions. */
export const incrementAccountsCreated = metric("accountsCreated"); export const incrementVerifiedAccounts = metric("verifiedAccounts");
export const incrementTotalLoads = metric("totalLoads"); export const incrementActiveLoads = metric("activeLoads"); export const incrementCompletedLoads = metric("completedLoads"); export const incrementCancelledLoads = metric("cancelledLoads"); export const incrementPublicLoads = metric("publicLoads"); export const incrementPrivateFleetLoads = metric("privateFleetLoads"); export const incrementPrivateBrokerageLoads = metric("privateBrokerageLoads");
export const incrementRecommendedTrucks = metric("recommendedTrucks"); export const incrementAcceptedRecommendations = metric("acceptedRecommendations");
export const incrementBookings = metric("bookings"); export const incrementAcceptedBookings = metric("acceptedBookings"); export const incrementCancelledBookings = metric("cancelledBookings");
export const incrementAssignmentsCreated = metric("assignmentsCreated"); export const incrementAssignmentsStarted = metric("assignmentsStarted"); export const incrementAssignmentsCompleted = metric("assignmentsCompleted");
export const incrementActiveTrips = metric("activeTrips"); export const incrementCompletedTrips = metric("completedTrips"); export const incrementCancelledTrips = metric("cancelledTrips");
export const incrementTotalTrucks = metric("totalTrucks"); export const incrementBusyTrucks = metric("busyTrucks"); export const incrementAvailableTrucks = metric("availableTrucks"); export const incrementOfflineTrucks = metric("offlineTrucks");
export const incrementTrackersLinked = metric("trackersLinked"); export const incrementOnlineTrackers = metric("onlineTrackers"); export const incrementOfflineTrackers = metric("offlineTrackers");
export const incrementRevenue = metric("revenue"); export const incrementExpenses = metric("expenses"); export const incrementProfit = metric("profit"); export const incrementWalletBalance = metric("walletBalance"); export const incrementWalletDeposits = metric("walletDeposits"); export const incrementWithdrawalsRequested = metric("withdrawalsRequested"); export const incrementWithdrawalsCompleted = metric("withdrawalsCompleted"); export const incrementTrackingRevenue = metric("trackingRevenue"); export const incrementBrokerageRevenue = metric("brokerageRevenue"); export const incrementSubscriptionRevenue = metric("subscriptionRevenue"); export const incrementReferralCommissionPaid = metric("referralCommissionPaid");
export const incrementReferredUsers = metric("referredUsers"); export const incrementVerifiedReferrals = metric("verifiedReferrals"); export const incrementActiveReferrals = metric("activeReferrals");
