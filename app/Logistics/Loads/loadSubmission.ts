import { collection, doc, serverTimestamp, setDoc, Timestamp, writeBatch } from 'firebase/firestore';
import { ToastAndroid, Alert, Platform } from "react-native";

import { db } from '@/db/fireBaseConfig';
import { addDocumentWithId } from '@/db/operations';
import { notifyTrucksByFilters } from '@/Utilities/notifyTruckByFilters';
import { Customer } from '@/components/CustomerPicker';
import { sendPushNotification } from '@/Utilities/pushNotification';


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
  ratePerKm: number
  selectedModelType: any;
  selectedCurrency: any;
  selectedCustomer: Customer | null;
  isTrackingEnabled: boolean
};

const buildNotificationLoadItem = (params: any) => ({
  typeofLoad: params.typeofLoad,
  origin: params.origin?.description || '',
  destination: params.destination?.description || '',
  rate: params.rate,
  ratePerKm: params.ratePerKm,
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
    ratePerKm,
    selectedCustomer,
    isTrackingEnabled,
  } = params;

  const roleAny = currentRole as any;
  const cargoId = doc(collection(db, 'Cargo')).id;
  const fleetId = roleAny?.fleetId || null;
  const brokerId = roleAny?.organizationId || roleAny?.userId || user.uid;
  const coordinator = {
    id: roleAny?.userId || user.uid,
    organizationId: roleAny?.organizationId,
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
    ratePerKm: ratePerKm || null,
    currency: loadData?.currency || null,
    model: loadData?.model || null,
    paymentTerms: loadData?.paymentTerms || null,
    loadingDate: loadingDate || null,
    deliveryDate: deliveryDate || null,
    shipper: selectedCustomer,
    isTrackingEnabled: isTrackingEnabled,
  };


  // ── One nested payload per truck/driver assignment ──────────────────
  // Mirrors your new shape: { truckDetails, driverDetails, loadDetails, fleetDetails, driverId, status }
  const assignmentDetails = assignments.map((assignment) => {
    const truck = selectedFleetTrucks.find((item) => item.id === assignment.truckId);
    const driver = fleetDrivers.find(
      (item) => item.driverId === assignment.driverId || item.id === assignment.driverId
    );

    const isDefaultDriver = truck?.defaultDriver?.driverId === (assignment.driverId || driver?.driverId || driver?.id);

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
      role: isDefaultDriver ? 'main' : assignment.role || 'assigned',
      isDefault: isDefaultDriver,
      expoPushToken: driver?.expoPushToken || null,
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
      status: 'PENDING',
      acceptedBy: null,
      coordinator,
      createdAt: Date.now().toString(),
      shipper: selectedCustomer,
      timeStamp: serverTimestamp(),
    };
  });





  const createTruckSummary = (
    trucks: any[],
    assignmentDetails: any[]
  ) => {
    return trucks.map((truck) => ({
      truckId: truck.id,
      truckName: truck.truckName || '',
      registrationNumber: truck.registrationNumber || '',
      truckType: truck.truckType || '',
      truckCapacity: truck.truckCapacity || '',
      cargoArea: truck.cargoArea || null,
      operationCountries: truck.operationCountries || [],
      truckStatus: 'pending',
      assignment:
        assignmentDetails.find(
          (assignment) => assignment.truckId === truck.id
        ) || null,
    }));
  };


  const fleetTruckSummary = createTruckSummary(
    selectedFleetTrucks,
    assignmentDetails
  );

  const brokerTruckSummary = createTruckSummary(
    selectedBrokerTrucks,
    assignmentDetails,
  );



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
    isTrackingEnabled: isTrackingEnabled,
    ratePerKm: ratePerKm || null,
    postedBy: {
      accType: currentRole.accType,
      userRole: currentRole.userRole,
      usserId: user.uid,
      userName: user.displayName,

      organizationId: currentRole.organizationId
    }
  };

  const writeFleetPrivateLoad = async () => {
    if (!fleetId) return;

    const fleetCargoPath = `fleets/${fleetId}/Cargo`;
    await setDoc(doc(db, fleetCargoPath, cargoId), {
      ...commonLoadData,

      loadVisibility: 'Private',
      publicCargoId: loadVisibility === 'Both' ? cargoId : null,
      privateTrucks: fleetTruckSummary,
      publicTrucks: trucksNeeded ?? null,




    });


    if (assignmentDetails.length > 0) {

    for (const assignment of assignmentDetails) {
      const assignmentDocId = `${cargoId}_${assignment.truckId}_${assignment.driverId}`;
      await addDocumentWithId(`fleets/${fleetId}/assignments`, assignmentDocId, assignment);
    }
    
    for (const assignment of assignmentDetails) {

      if (assignment.driverDetails?.expoPushToken) {

        try {
          await sendPushNotification(
            assignment.driverDetails.expoPushToken,
            "New Load Assignment 🚛",
            `You have been assigned a load from ${assignment.loadDetails.origin.description} to ${assignment.loadDetails.destination.description}`,
            {
              pathname: "/Driver/AssignmentDetails",
              params: {
                cargoId,
                assignmentId: `${cargoId}_${assignment.truckId}_${assignment.driverId}`,
              }
            }
          );






        } catch (error) {
          Alert.alert(
            "Notification Failed",
            `Load was assigned to ${assignment.driverDetails.driverName}, but notification failed.`
          );

          console.log(
            "Driver notification error:",
            error
          );
        }

      }
    }

    if (Platform.OS === "android") {
      ToastAndroid.show(
        "Private load assigned successfully 🚛",
        ToastAndroid.SHORT
      );
    }

  }else {


    const assignmentDocId = `${cargoId}_UNASSIGNED`;
       const loadDetails = {
        ...baseLoadDetails,
        pickupDate: loadingDate || null,
        deliveryDate: deliveryDate || null,
        pickupLocation: origin || null,
        deliveryLocation: destination || null,

      };

  await addDocumentWithId(
    `fleets/${fleetId}/assignments`,
    assignmentDocId,
    {
      cargoId,
      loadId: cargoId,
      fleetId,

      truckId: null,
      driverId: null,

      status: "UNASSIGNED",

      loadDetails: loadDetails,
        externalLoad: false,   

      truckDetails: null,
      driverDetails: null,
      shipper:selectedCustomer ,

      coordinator,

      createdAt: Date.now().toString(),
      timeStamp: serverTimestamp(),
    }
  );

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
      trucksNeededNum: numberOfTrucks,
      trucksRemainingNum: numberOfTrucks,
      privateFleetCargoId: currentRole?.accType === 'fleet' && loadVisibility === 'Both' ? cargoId : null,
      state: 'available',
      publicTrucks: trucksNeeded ?? null,
    });
  };






  const writeBrokerPrivateLoad = async () => {
    await setDoc(doc(db, `brokerages/${brokerId}/Cargo`, cargoId), {
      ...commonLoadData,
      loadVisibility: 'Private',

      privateTrucks: brokerTruckSummary,
      publicTrucks: trucksNeeded ?? null,
    });

    for (const truck of selectedBrokerTrucks) {

      // const assignmentDocId = `${cargoId}_${assignment.truckId}_${assignment.driverId}`;
      // await addDocumentWithId(`fleets/${fleetId}/assignments`, assignmentDocId, assignment);
      const truckDetails = {
        truckId: truck?.id || null,
        truckName: truck?.truckName || null,
        registrationNumber: truck?.registrationNumber || truck?.numberPlate || null,
        numberPlate: truck?.numberPlate || null,
        truckType: truck?.truckType || null,
        truckCapacity: truck?.truckCapacity || null,
        cargoArea: truck?.cargoArea || null,
        locations: truck?.locations || [],
        trackingDeviceId: truck?.trackingDeviceId || null,
        brokerTruckSummary,
      };

      const loadDetails = {
        ...baseLoadDetails,
        pickupDate: loadingDate || null,
        deliveryDate: deliveryDate || null,
        pickupLocation: origin || null,
        deliveryLocation: destination || null,

      };




      const assignment = {
        cargoId,
        loadId: cargoId,
        fleetId: truck.fleetId,
        truckId: truck.id || null,
        driverId: null,
        visibility: visibilityTag,
        loadDetails: loadDetails,
        externalLoad: true,   
        // The truck's own owning fleet/org (not necessarily the poster of the load — relevant
        // when a broker assigns a truck that belongs to a different fleet).
        fleetDetails: truck?.organizationDetails ?? truck?.fleetDetails ?? null,
        shipper : {
          id: currentRole.organizationId || currentRole.fleetId || null,
          name: currentRole.companyName || user?.organisation,
          phone: currentRole.phone || null,
          location: currentRole.billingAddress || currentRole.location || null,
          accType: currentRole.accType || null ,
        },
        truckDetails,
        driverDetails: null,
        status: 'ASSIGNED',
        acceptedBy: null,
        fleeCoordinator: truck.assignments?.dispatcher
          ? {
            id: truck.assignments.dispatcher.id || null,
            organizationId: truck.fleetId || null,
            name: truck.assignments.dispatcher.name || '',
            phoneNumber: truck.assignments.dispatcher.phoneNumber || '',
            expoPushToken: truck.assignments.dispatcher.expoPushToken || null,
          }
          : null,
        brokerageCoordinator: coordinator,
        createdAt: Date.now().toString(),
      }

      const docId = `${cargoId}_${truck.truckId}`;

      const batch = writeBatch(db);

      const brokerageAssignmentRef = doc(
        db,
        `brokerages/${brokerId}/assignments/${docId}`
      );

      batch.set(brokerageAssignmentRef, {
        ...assignment,
        shipper: selectedCustomer,
        timeStamp: serverTimestamp(),

      });

      const fleetAssignmentRef = doc(
        db,
        `fleets/${truck.fleetId}/assignments/${docId}`
      );

      batch.set(fleetAssignmentRef, {
        ...assignment,
        shipper: {
          id: brokerId,
          organizationId: brokerId,
          name: currentRole.companyName || user?.organisation,
          phone: currentRole.phone,
          billingAddress: currentRole.location.description,
          createdBy: user?.uid,
        },
        timeStamp: serverTimestamp(),

      });

      await batch.commit();



const dispatcherToken =
  truck.assignments?.dispatcher?.expoPushToken;


if (dispatcherToken) {
  try {
    await sendPushNotification(
      dispatcherToken,
      "New Load Assigned 🚛",
      `${truck.truckName} has been assigned a new load from ${origin.description} to ${destination.description}`,
      {
        pathname: "/Dispatcher/AssignmentDetails",
        params: {
          cargoId,
          truckId: truck.id,
        },
      },
      {
        type: "private_load_assigned",
        cargoId,
        truckId: truck.id,
      }
    );

  } catch (error) {
    Alert.alert(
      "Notification Failed",
      "Load assigned but dispatcher notification failed."
    );

    console.log(
      "Dispatcher notification error:",
      error
    );
  }
}

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

  if (currentRole?.accType === 'brokerage') {
    if (loadVisibility === 'Private') {
      await writeBrokerPrivateLoad();
    }
    if (loadVisibility === 'Public' || loadVisibility === 'Both') {
      await writePublicLoad();
    }
    return;
  }

  await writePublicLoad();
  if (
    loadVisibility === "Public" ||
    loadVisibility === "Both"
  ) {
    await notifyTrucksByFilters({
      trucksNeeded,
      loadItem: buildNotificationLoadItem(params) as any,
      contractId: cargoId,
    });
  }
};  