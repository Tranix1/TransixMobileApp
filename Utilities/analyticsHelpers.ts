import { doc, writeBatch, getDoc, increment, serverTimestamp, Timestamp, WriteBatch } from "firebase/firestore";
import { db } from "@/db/fireBaseConfig";

/**
 * Increments one or more org stat fields safely using dot-notation,
 * so it never clobbers sibling fields in a nested map (the old
 * `{ publicCargo: { x: increment(1) } }` pattern overwrites the whole
 * publicCargo object).
 *
 * Usage: incrementOrgStats(batch, orgId, { "publicCargo.totalRequestsInitiated": 1 })
 */
export function incrementOrgStats(
    batch: WriteBatch,
    orgId: string,
    stats: Record<string, number>
) {
    const orgRef = doc(db, "organizationProfiles", orgId);
    const updates: Record<string, any> = {};
    for (const [path, amount] of Object.entries(stats)) {
        updates[path] = increment(amount);
    }
    batch.update(orgRef, updates);
}

/**
 * Creates the mirrored "requestAnalytics" pair of docs that track a
 * request from initiation (PENDING) between two orgs.
 */
export function createRequestAnalyticsPair(
    batch: WriteBatch,
    params: {
        orgIdA: string;
        orgIdB: string;
        docId: string;
        loadId: string;
        truckId?: string | null;
        cargoType: "PUBLIC" | "PRIVATE";
        cargoOwnerAcc?: string;
        extraA?: Record<string, any>;
        extraB?: Record<string, any>;
    }
) {
    const nowTime = Timestamp.now();
    const base = {
        requestedAt: nowTime,
        respondedAt: null,
        respondedTimeMs: null,
        status: "PENDING",
        response: "PENDING",
        loadId: params.loadId,
        truckId: params.truckId ?? null,
        cargoType: params.cargoType,
        cargoOwnerAcc: params.cargoOwnerAcc,
        createdAt: serverTimestamp(),
    };

    const refA = doc(db, "organizationProfiles", params.orgIdA, "requestAnalytics", params.docId);
    batch.set(refA, { ...base, partnerId: params.orgIdB, ...params.extraA });

    const refB = doc(db, "organizationProfiles", params.orgIdB, "requestAnalytics", params.docId);
    batch.set(refB, { ...base, partnerId: params.orgIdA, ...params.extraB });
}

/**
 * Marks a pending requestAnalytics pair as RESPONDED and computes the
 * response latency (respondedTimeMs). Reads orgIdA's doc for requestedAt,
 * so orgIdA must be the side that was written first by createRequestAnalyticsPair.
 * Returns respondedTimeMs so callers can roll it into other stat increments.
 */
export async function respondToRequestAnalytics(
    batch: WriteBatch,
    params: {
        orgIdA: string;
        orgIdB: string;
        docId: string;
        response: "ACCEPTED" | "DECLINED";
        extra?: Record<string, any>;
    }
): Promise<number> {
    const refA = doc(db, "organizationProfiles", params.orgIdA, "requestAnalytics", params.docId);
    const snap = await getDoc(refA);
    const requestedAt = snap.data()?.requestedAt;
    if (!requestedAt) throw new Error(`Missing requestedAt for requestAnalytics/${params.docId}`);

    const now = Timestamp.now();
    const respondedTimeMs = now.toMillis() - requestedAt.toMillis();

    const update = {
        respondedAt: now,
        respondedTimeMs,
        status: "RESPONDED",
        response: params.response,
        ...params.extra,
    };

    batch.set(refA, update, { merge: true });
    const refB = doc(db, "organizationProfiles", params.orgIdB, "requestAnalytics", params.docId);
    batch.set(refB, update, { merge: true });

    return respondedTimeMs;
}

/**
 * Upserts a "provenRoutes" doc for an org — increments tripsCompleted
 * if the route already exists, otherwise creates it.
 */
export async function upsertProvenRoute(
    batch: WriteBatch,
    orgId: string,
    assignmentId: string,
    from: { city: string; country: string },
    to: { city: string; country: string }
) {
    const routeId = `${from.city}_${from.country}_${to.city}_${to.country}`
        .toLowerCase()
        .replace(/\s+/g, "_");

    const routeRef = doc(db, "organizationProfiles", orgId, "provenRoutes", routeId);
    const routeSnap = await getDoc(routeRef);

    if (routeSnap.exists()) {
        batch.update(routeRef, {
            tripsCompleted: increment(1),
            lastUsed: serverTimestamp(),
        });
    } else {
        batch.set(routeRef, {
            from,
            to,
            tripsCompleted: 1,
            assignmentId,
            createdAt: serverTimestamp(),
        });
    }
}

/**
 * Records a "trip started" event: sets the tripsStarted marker docs
 * (when there's a separate load-owning org) and increments accepted/
 * started stats for both sides under a given stats category
 * (privateBrokerCargo / publicCargo / privateCargo).
 */
export function recordTripStarted(
    batch: WriteBatch,
    params: {
        truckOrgId: string;
        loadOrgId?: string | null;
        docId: string;
        assignmentId: string;
        statsCategory: "privateBrokerCargo" | "publicCargo" | "privateCargo";
    }
) {
    const { truckOrgId, loadOrgId, docId, assignmentId, statsCategory } = params;

    if (loadOrgId) {
        batch.set(doc(db, "organizationProfiles", loadOrgId, "requestAnalytics", docId), {
            assignmentId,
            tripsStarted: true,
        });
        batch.set(doc(db, "organizationProfiles", truckOrgId, "requestAnalytics", docId), {
            assignmentId,
            tripsStarted: true,
        });

        incrementOrgStats(batch, truckOrgId, { [`${statsCategory}.acceptedRequests`]: 1 });
        incrementOrgStats(batch, loadOrgId, { [`${statsCategory}.tripsStarted`]: 1 });
    } else {
        incrementOrgStats(batch, truckOrgId, { [`${statsCategory}.acceptedRequests`]: 1 });
    }
}