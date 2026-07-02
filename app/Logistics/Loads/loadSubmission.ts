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
    selectedCustomer ,
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

  const assignmentDetails = assignments.map((assignment) => {
    const truck = selectedFleetTrucks.find((item) => item.id === assignment.truckId);
    const driver = fleetDrivers.find((item) => item.driverId === assignment.driverId || item.id === assignment.driverId);

    return {
      cargoId,
      truckId: assignment.truckId || '',
      truckName: truck?.truckName || '',
      registrationNumber: truck?.registrationNumber || '',
      truckType: truck?.truckType || '',
      truckCapacity: truck?.truckCapacity || '',
      driverId: assignment.driverId || null,
      driverDocId: driver?.docId || driver?.id || assignment.driverId || null,
      driverName: assignment.driverName || driver?.fullName || null,
      driverPhone: driver?.phoneNumber || driver?.phone || null,
      role: driver?.role || assignment.role || (assignment.isDefault ? 'main' : 'assigned'),
      pickupDate: assignment.pickupDate || loadingDate || null,
      deliveryDate: assignment.deliveryDate || deliveryDate || null,
      pickupLocation: assignment.pickupLocation || origin || null,
      deliveryLocation: assignment.deliveryLocation || destination || null,
      isDefault: Boolean(assignment.isDefault),
      status: 'pending',
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

  const assignmentSummary = assignmentDetails.map((assignment) => ({
    truckId: assignment.truckId,
    truckName: assignment.truckName,
    registrationNumber: assignment.registrationNumber,
    truckType: assignment.truckType,
    truckCapacity: assignment.truckCapacity,
    driverId: assignment.driverId,
    driverName: assignment.driverName,
    driverPhone: assignment.driverPhone,
    role: assignment.role,
    pickupDate: assignment.pickupDate,
    deliveryDate: assignment.deliveryDate,
    pickupLocation: assignment.pickupLocation,
    deliveryLocation: assignment.deliveryLocation,
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

    // Truck centric approach 

    // for (const truck of selectedFleetTrucks) {
    //   const truckAssignments = assignmentDetails.filter((assignment) => assignment.truckId === truck.id);
    //   const assignmentDocId = `${cargoId}_${truck.id}`;
    //   const assignmentPayload = {
    //     cargoId,
    //     loadId: cargoId,
    //     fleetId,
    //     truckId: truck.id,
    //     truckName: truck.truckName || '',
    //     registrationNumber: truck.registrationNumber || '',
    //     assignedDrivers: truckAssignments.map((assignment) => ({
    //       driverId: assignment.driverId,
    //       driverDocId: assignment.driverDocId,
    //       role: assignment.role,
    //       fullName: assignment.driverName,
    //       phoneNumber: assignment.driverPhone,
    //       status: 'pending',
    //     })),
    //     driverIds: truckAssignments.map((assignment) => assignment.driverId),
    //     mainDriver: truckAssignments.find((assignment) => assignment.role === 'main')?.driverId || '',
    //     pickupDate: truckAssignments[0]?.pickupDate || loadingDate || null,
    //     deliveryDate: truckAssignments[0]?.deliveryDate || deliveryDate || null,
    //     pickupLocation: truckAssignments[0]?.pickupLocation || origin || null,
    //     deliveryLocation: truckAssignments[0]?.deliveryLocation || destination || null,
    //     status: 'pending',
    //     acceptedBy: null,
    //     createdAt: new Date(),
    //     coordinator,

    //   };

    //   // await addDocumentWithId(`${fleetCargoPath}/${cargoId}/assignments`, assignmentDocId, assignmentPayload);
    //   await addDocumentWithId(`fleets/${fleetId}/assignments`, assignmentDocId, assignmentPayload);
    // }

    for (const assignment of assignments) {

      const assignmentDocId =
        `${cargoId}_${assignment.truckId}_${assignment.driverId}`;


      const payload = {
        cargoId,
        loadId: cargoId,
        fleetId,

        status: "pending",
        createdAt: new Date(),


        acceptedBy: null,
        coordinator,
        ...assignment,
      };


      await addDocumentWithId(`fleets/${fleetId}/assignments`, assignmentDocId, payload);
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
      await addDocumentWithId(`fleets/${truck.fleetId}/fleetManagers/FLTMGR${truck.fleetId}/brokerLoads`, `${cargoId}_${truck.truckId}`, {
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
      });
    }
  };









  if (currentRole?.accType === 'fleet') {
    if (loadVisibility === 'Both') {
      await writeFleetPrivateLoad();

      await writePublicLoad();

    }
    if (loadVisibility === 'Private' || loadVisibility === 'Both') {
      await writeFleetPrivateLoad();
    } else if (loadVisibility === 'Public')
      if (loadVisibility === 'Public') {
        await writePublicLoad();
        // await notifyTrucksByFilters({
        //   trucksNeeded,
        //   loadItem: buildNotificationLoadItem(params),
        // });
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
