import { Platform } from "react-native";
import { collection, doc, serverTimestamp, setDoc, type DocumentData } from "firebase/firestore";
import { db } from "@/db/fireBaseConfig";

/** Additional, event-specific values stored with an analytics event. */
export type AnalyticsMetadata = Record<string, unknown>;

/** Identity and attribution values attached to every analytics event. */
export interface AnalyticsContext {
  userId?: string | null;
  organizationId?: string | null;
  organizationType?: string | null;
  role?: string | null;
  accountType?: string | null;
  country?: string | null;
  city?: string | null;
  platform?: string | null;
  campaign?: string | null;
  referralCodeUsed?: string | null;
  referrerId?: string | null;
  organizationProfileId?: string | null;
  appVersion?: string | null;
}

export interface TrackEventInput extends AnalyticsContext {
  eventName: string;
  metadata?: AnalyticsMetadata;
}

/** Writes one append-only event to `analyticsEvents`. Do not update or delete these documents. */
export async function trackEvent(input: TrackEventInput): Promise<string> {
  const eventRef = doc(collection(db, "analyticsEvents"));
  const event: DocumentData = {
    eventId: eventRef.id,
    eventName: input.eventName,
    timestamp: serverTimestamp(),
    userId: input.userId ?? null,
    organizationId: input.organizationId ?? null,
    organizationType: input.organizationType ?? null,
    role: input.role ?? null,
    accountType: input.accountType ?? null,
    country: input.country ?? null,
    city: input.city ?? null,
    platform: input.platform ?? Platform.OS,
    campaign: input.campaign ?? null,
    referralCodeUsed: input.referralCodeUsed ?? null,
    referrerId: input.referrerId ?? null,
    organizationProfileId: input.organizationProfileId ?? null,
    appVersion: input.appVersion ?? null,
    devicePlatform: Platform.OS,
    metadata: input.metadata ?? {},
  };
  await setDoc(eventRef, event);
  return eventRef.id;
}

type EventHelper = (context: AnalyticsContext, metadata?: AnalyticsMetadata) => Promise<string>;
/** Creates a consistently typed helper backed by the immutable event writer. */
const event = (eventName: string): EventHelper => (context, metadata) => trackEvent({ ...context, eventName, metadata });

/** Authentication events. */
export const trackAccountCreated = event("account_created");
export const trackLogin = event("login");
export const trackLogout = event("logout");
export const trackVerificationSubmitted = event("verification_submitted");
export const trackAccountVerified = event("account_verified");
/** Load lifecycle events. */
export const trackLoadCreated = event("load_created"); export const trackLoadEdited = event("load_edited"); export const trackLoadDeleted = event("load_deleted"); export const trackLoadExpired = event("load_expired");
export const trackPublicLoadCreated = event("public_load_created"); export const trackPrivateFleetLoadCreated = event("private_fleet_load_created"); export const trackPrivateBrokerageLoadCreated = event("private_brokerage_load_created");
export const trackLoadBooked = event("load_booked"); export const trackLoadCancelled = event("load_cancelled"); export const trackLoadCompleted = event("load_completed");
/** Truck and recommendation events. */
export const trackTruckAdded = event("truck_added"); export const trackTruckUpdated = event("truck_updated"); export const trackTruckRemoved = event("truck_removed");
export const trackTruckRecommended = event("truck_recommended"); export const trackTruckAccepted = event("truck_accepted"); export const trackTruckDeclined = event("truck_declined");
/** Private-operation and trip events. */
export const trackAssignmentCreated = event("assignment_created"); export const trackAssignmentStarted = event("assignment_started"); export const trackAssignmentCompleted = event("assignment_completed");
export const trackTripStarted = event("trip_started"); export const trackTripPaused = event("trip_paused"); export const trackTripCompleted = event("trip_completed"); export const trackTripCancelled = event("trip_cancelled");
/** GPS tracking events. */
export const trackTrackerLinked = event("tracker_linked"); export const trackTrackerRemoved = event("tracker_removed"); export const trackGPSOnline = event("gps_online"); export const trackGPSOffline = event("gps_offline");
/** Brokerage-network events. */
export const trackBrokerJoined = event("broker_joined"); export const trackFleetJoined = event("fleet_joined"); export const trackInvitationAccepted = event("invitation_accepted"); export const trackNetworkCreated = event("network_created");
/** Finance events. Store amounts/currency in metadata. */
export const trackSubscriptionPaid = event("subscription_paid"); export const trackTrackingSubscriptionPaid = event("tracking_subscription_paid"); export const trackBrokerageSubscriptionPaid = event("brokerage_subscription_paid");
export const trackWalletDeposit = event("wallet_deposit"); export const trackWalletWithdrawalRequested = event("wallet_withdrawal_requested"); export const trackWalletWithdrawalCompleted = event("wallet_withdrawal_completed");
export const trackPayoutCompleted = event("payout_completed"); export const trackCommissionEarned = event("commission_earned");
/** Referral events. */
export const trackReferralSignup = event("referral_signup"); export const trackReferralVerified = event("referral_verified"); export const trackReferralReward = event("referral_reward"); export const trackReferralCommission = event("referral_commission");
/** Public-profile and discovery events. */
export const trackOrganizationViewed = event("organization_viewed"); export const trackOrganizationFollowed = event("organization_followed"); export const trackProfileShared = event("profile_shared");
export const trackSearchPerformed = event("search_performed"); export const trackRecommendationViewed = event("recommendation_viewed");
