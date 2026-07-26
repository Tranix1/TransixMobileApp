import { doc, increment, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/db/fireBaseConfig";

/** User-visible organization statistics only. Private financial or member data belongs elsewhere. */
export type OrganizationMetric = "loadsPosted" | "loadsCompleted" | "truckCount" | "requestsPblcCargo" | "requestedPblcCargo" | "acceptanceRate" | "completedTrips" | "activeTrips" | "followers" | "profileViews" | "averageRating" | "verifiedBadge" | "responseRate" | "responseTime" | "memberCount" | "joinedNetworks";

/** Atomically changes a field on the public `organizationProfiles/{id}` document. */
export async function incrementOrganizationMetric(organizationProfileId: string, metric: OrganizationMetric, amount = 1): Promise<void> {
  if (!organizationProfileId) throw new Error("organizationProfileId is required");
  await setDoc(doc(db, "organizationProfiles", organizationProfileId), { [metric]: increment(amount), updatedAt: serverTimestamp() }, { merge: true });
}
type MetricHelper = (organizationProfileId: string, amount?: number) => Promise<void>;
const metric = (name: OrganizationMetric): MetricHelper => (id, amount = 1) => incrementOrganizationMetric(id, name, amount);

/** Public-profile metric helpers. Set percentage/rating fields with signed deltas only when that is your chosen aggregation model. */
export const incrementLoadsPosted = metric("loadsPosted"); export const incrementLoadsCompleted = metric("loadsCompleted"); export const incrementTruckCount = metric("truckCount");

// truck Owner
export const incrementRequestsSuccessfulPblcCargo = metric("requestsPblcCargo");

export const incrementSuccessfullyRequestedPblcCargo = metric("requestedPblcCargo");

// truck Owner

export const incrementRequestsAcceptedPblcCargo = metric("requestsPblcCargo"); export
  // Load Owner

  const incrementAcceptedRequestedPblcCargo = metric("requestedPblcCargo");



export const incrementAcceptanceRate = metric("acceptanceRate"); export const incrementCompletedTrips = metric("completedTrips"); export const incrementActiveTrips = metric("activeTrips"); export const incrementFollowers = metric("followers");
export const incrementProfileViews = metric("profileViews"); export const incrementAverageRating = metric("averageRating"); export const incrementVerifiedBadge = metric("verifiedBadge"); export const incrementResponseRate = metric("responseRate");
export const incrementResponseTime = metric("responseTime"); export const incrementMemberCount = metric("memberCount"); export const incrementJoinedNetworks = metric("joinedNetworks");
