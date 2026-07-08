import { collection, doc, serverTimestamp, setDoc, Timestamp } from 'firebase/firestore';

import { db } from '@/db/fireBaseConfig';
import { addDocumentWithId } from '@/db/operations';
import { notifyTrucksByFilters } from '@/Utilities/notifyTruckByFilters';
import { Customer } from '@/components/CustomerPicker';

export type LoadVisibility = 'Private' | 'Public' | 'Both';

type SubmitLoadParams = {
  currentRole: any;
  user: any;
  loadVisibility: LoadVisibility;
  loadData: any;
  assignments: any[];
  selectedFleetTrucks: any[];
  fleetDrivers: any[];
  selectedBrokerTrucks: any[];
  selectedBrokers: string[];
  numberOfTrucks: string;
  deliveryDate: string;
  loadingDate: string;
  origin: any;
  destination: any;
  trucksNeeded: any[];
  typeofLoad: string;
  rate: string;
  selectedModelType: any;
  selectedCurrency: any;
  selectedCustomer: Customer | null;
};

const buildNotificationLoadItem = (params: SubmitLoadParams) => ({
  typeofLoad: params.typeofLoad,
  origin: params.origin?.description || '',
  destination: params.destination?.description || '',
  rate: params.rate,
  model: params.selectedModelType?.name || 'Solid',
  currency: params.selectedCurrency?.name || 'USD',
});

export const submitLoad = async (params: SubmitLoadParams) => {
  const {
    currentRole,
    user,
    loadVisibility,
    loadData,
    assignments,
    selectedFleetTrucks,
    fleetDrivers,
    selectedBrokerTrucks,
    selectedBrokers,
    numberOfTrucks,
    deliveryDate,
    loadingDate,
    origin,
    destination,
    trucksNeeded,
    selectedCustomer,
  } = params;

  const roleAny = currentRole as any;
  const cargoId = doc(collection(db, 'Cargo')).id;
  const fleetId = roleAny?.fleetId || null;
  const brokerId = roleAny?.brokerId || roleAny?.userId || user.uid;
  const coordinator = {
    id: roleAny?.userId || user.uid,
    fleetId,
    name: user.organisation || user.displayName || '',
    phoneNumber: user.phoneNumber || '',
  };

  // Visibility tag used inside each nested assignment doc.
  // (Your pasted snippet hardcoded "PUBLIC" — here it tracks the real loadVisibility instead,
  // since submitLoad can also write Private/Both loads.)
  const visibilityTag = loadVisibility === 'Public' ? 'PUBLIC' : 'PRIVATE';

  // ── Shared load-level details, nested the same way as `loadItemDetails` in your booking flow ──
  const baseLoadDetails = {
    loadId: cargoId,
    contact: loadData?.contact || null,
    companyName: loadData?.companyName || user.organisation || null,
    productName: loadData?.typeofLoad || null,
    origin: origin || null,
    originFull: loadData?.originFull || null,
    destination: destination || null,
    destinationFull: loadData?.destinationFull || null,
    originCoordinates: loadData?.originCoordinates || null,
    destinationCoordinates: loadData?.destinationCoordinates || null,
    rate: loadData?.rate || null,
    currency: loadData?.currency || null,
    model: loadData?.model || null,
    paymentTerms: loadData?.paymentTerms || null,
    loadingDate: loadingDate || null,
    deliveryDate: deliveryDate || null,
    shipper: selectedCustomer,
  };

  // ── One nested payload per truck/driver assignment ──────────────────
  // Mirrors your new shape: { truckDetails, driverDetails, loadDetails, fleetDetails, driverId, status }
  const assignmentDetails = assignments.map((assignment) => {
    const truck = selectedFleetTrucks.find((item) => item.id === assignment.truckId);
    const driver = fleetDrivers.find(
      (item) => item.driverId === assignment.driverId || item.id === assignment.driverId
    );

    const truckDetails = {
      truckId: assignment.truckId || truck?.id || null,
      truckName: truck?.truckName || null,
      registrationNumber: truck?.registrationNumber || truck?.numberPlate || null,
      numberPlate: truck?.numberPlate || null,
      truckType: truck?.truckType || null,
      truckCapacity: truck?.truckCapacity || null,
      cargoArea: truck?.cargoArea || null,
      locations: truck?.locations || [],
      trackingDeviceId: truck?.trackingDeviceId || null,
    };

    const driverDetails = {
      driverId: assignment.driverId || driver?.driverId || driver?.id || null,
      driverDocId: driver?.docId || driver?.id || assignment.driverId || null,
      driverName: assignment.driverName || driver?.fullName || null,
      driverPhone: assignment.driverPhone || driver?.phoneNumber || driver?.phone || null,
      profilePhoto: assignment.profilePhoto || driver?.profilePhoto || null,
      email: driver?.email || null,
      licenseNumber: driver?.licenseNumber || null,
      role: assignment.isDefault ? 'main' : assignment.role || 'assigned',
      isDefault: Boolean(assignment.isDefault),
    };

    const loadDetails = {
      ...baseLoadDetails,
      pickupDate: assignment.pickupDate || loadingDate || null,
      deliveryDate: assignment.deliveryDate || deliveryDate || null,
      pickupLocation: assignment.pickupLocation || origin || null,
      deliveryLocation: assignment.deliveryLocation || destination || null,
    };

    return {
      cargoId,
      loadId: cargoId,
      fleetId,
      truckId: assignment.truckId || null,
      driverId: driverDetails.driverId,
      visibility: visibilityTag,
      // The truck's own owning fleet/org (not necessarily the poster of the load — relevant
      // when a broker assigns a truck that belongs to a different fleet).
      fleetDetails: truck?.organizationDetails ?? truck?.fleetDetails ?? null,
      loadDetails,
      truckDetails,
      driverDetails,
      status: 'ASSIGNED',
      acceptedBy: null,
      coordinator,
      createdAt: new Date(),
    };
  });










  
  const fleetTruckSummary = selectedFleetTrucks.map((truck) => ({
    truckId: truck.id,
    truckName: truck.truckName || '',
    registrationNumber: truck.registrationNumber || '',
    truckType: truck.truckType || '',
    truckCapacity: truck.truckCapacity || '',
    truckStatus: 'pending',
    assignment: assignmentDetails.find((assignment) => assignment.truckId === truck.id) || null,
  }));

  // Flat summary kept for the load doc itself (cheap to query/list without reading nested objects)
  const assignmentSummary = assignmentDetails.map((assignment) => ({
    truckId: assignment.truckId,
    truckName: assignment.truckDetails.truckName,
    registrationNumber: assignment.truckDetails.registrationNumber,
    truckType: assignment.truckDetails.truckType,
    truckCapacity: assignment.truckDetails.truckCapacity,
    driverId: assignment.driverId,
    driverName: assignment.driverDetails.driverName,
    driverPhone: assignment.driverDetails.driverPhone,
    role: assignment.driverDetails.role,
    pickupDate: assignment.loadDetails.pickupDate,
    deliveryDate: assignment.loadDetails.deliveryDate,
    pickupLocation: assignment.loadDetails.pickupLocation,
    deliveryLocation: assignment.loadDetails.deliveryLocation,
    status: assignment.status,
  }));

  const commonLoadData = {
    ...loadData,
    cargoId,
    loadId: cargoId,
    cargoStatus: 'pending',
    deliveryDate,
    selectedBrokers,
    coordinator,
    assignmentCount: assignmentSummary.length,
    assignmentSummary,
    timeStamp: serverTimestamp(),
    createdAt: serverTimestamp(),
    availability: 'available',
    shipper: selectedCustomer,
  };

  const writeFleetPrivateLoad = async () => {
    if (!fleetId) return;

    const fleetCargoPath = `fleets/${fleetId}/Cargo`;
    await setDoc(doc(db, fleetCargoPath, cargoId), {
      ...commonLoadData,
      loadVisibility: 'Private',
      publicCargoId: loadVisibility === 'Both' ? cargoId : null,
      trucks: fleetTruckSummary,
    });

    for (const assignment of assignmentDetails) {
      const assignmentDocId = `${cargoId}_${assignment.truckId}_${assignment.driverId}`;
      await addDocumentWithId(`fleets/${fleetId}/assignments`, assignmentDocId, assignment);
    }

    for (const selectedBrokerId of selectedBrokers) {
      await addDocumentWithId(`brokerages/${selectedBrokerId}/cargo`, `${cargoId}_${selectedBrokerId}`, {
        loadId: cargoId,
        cargoId,
        loadStatus: 'pending',
        loadVisibility: 'Private',
        truckId: fleetTruckSummary[0]?.truckId || null,
        truckName: fleetTruckSummary[0]?.truckName || null,
        driverId: assignmentSummary[0]?.driverId || null,
        driverName: assignmentSummary[0]?.driverName || null,
        origin,
        destination,
        loadingDate,
        deliveryDate,
        assignmentSummary,
        createdAt: new Date(),
        coordinator,
      });
    }
  };

  const writePublicLoad = async () => {
    await setDoc(doc(db, 'Cargo', cargoId), {
      ...commonLoadData,
      loadVisibility: 'Public',
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)),
      trucksNeeded: numberOfTrucks,
      trucksRemaining: numberOfTrucks,
      privateFleetCargoId: currentRole?.accType === 'fleet' && loadVisibility === 'Both' ? cargoId : null,
      state: 'available',
    });
  };

  const writeBrokerPrivateLoad = async () => {
    await setDoc(doc(db, `brokerages/${brokerId}/Cargo`, cargoId), {
      ...commonLoadData,
      loadVisibility: 'Private',
      trucks: selectedBrokerTrucks.map((truck) => ({
        truckId: truck.truckId || '',
        truckName: truck.truckName || '',
        truckStatus: 'pending',
      })),
    });

    for (const truck of selectedBrokerTrucks) {
      await addDocumentWithId(
        `fleets/${truck.fleetId}/fleetManagers/FLTMGR${truck.fleetId}/brokerLoads`,
        `${cargoId}_${truck.truckId}`,
        {
          loadId: cargoId,
          cargoId,
          loadStatus: 'pending',
          loadVisibility: 'Private',
          truckId: truck.truckId,
          truckName: truck.truckName,
          brokerId,
          brokerName: user.organisation || user.displayName || 'Broker',
          origin,
          destination,
          loadingDate,
          deliveryDate,
          assignmentSummary,
          createdAt: new Date(),
          coordinator,
        }
      );
    }
  };

  if (currentRole?.accType === 'fleet') {
    // NOTE: fixed a bug from the previous version — "Both" used to call
    // writeFleetPrivateLoad() twice (once explicitly, once via the || check below it).
    if (loadVisibility === 'Private' || loadVisibility === 'Both') {
      await writeFleetPrivateLoad();
    }
    if (loadVisibility === 'Public' || loadVisibility === 'Both') {
      await writePublicLoad();
      // await notifyTrucksByFilters({ trucksNeeded, loadItem: buildNotificationLoadItem(params) });
    }
    return;
  }

  if (currentRole?.accType === 'brokerages') {
    if (loadVisibility === 'Private') {
      await writeBrokerPrivateLoad();
    }
    if (loadVisibility === 'Public' || loadVisibility === 'Both') {
      await writePublicLoad();
    }
    return;
  }

  await writePublicLoad();
  if (trucksNeeded.length > 0) {
    await notifyTrucksByFilters({
      trucksNeeded,
      loadItem: buildNotificationLoadItem(params),
    });
  }
};