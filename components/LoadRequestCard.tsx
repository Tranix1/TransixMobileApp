import React, { useEffect, useState, ReactElement } from "react";
import { View, TouchableOpacity, ToastAndroid } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { wp } from "@/constants/common";
import Divider from "@/components/Divider";
import { router } from 'expo-router'
import { useThemeColor } from '@/hooks/useThemeColor'
import AlertComponent, { Alertbutton } from "@/components/AlertComponent";
import { addDocument, addDocumentWithId, deleteDocument, updateDocument, } from "@/db/operations";
import { Ionicons } from "@expo/vector-icons";
import AssignmentModal from "@/components/AssignmentModal";


import { LoadTracker } from "@/components/LoadTracker";
import { useAuth } from '@/context/AuthContext';
import { getRelativeTime } from "@/Utilities/getDateRelativeTime";
import { serverTimestamp, Timestamp } from "firebase/firestore";
import { trackAssignmentCreated, trackTruckAccepted } from '@/services/analytics/appAnalytics';
import { incrementAssignmentsCreated, } from '@/services/analytics/dashboardAnalytics';
// Function to get relative time (e.g., "1 hr ago", "4 seconds ago")
import { incrementRequestsAcceptedPblcCargo, incrementAcceptedRequestedPblcCargo } from "@/services/analytics/organizationAnalytics";

import { doc, writeBatch, getDoc, increment } from "firebase/firestore";
import { db } from "@/db/fireBaseConfig";
import { incrementOrgStats, respondToRequestAnalytics } from "@/Utilities/analyticsHelpers";
import { trackEventFirebase } from "@/services/analytics/firebaseAnalystics";

export const RequestedCargo = ({
  item, dspRoute, currentLocation
}: {
  item: any
  index: any
  separators: any
  dspRoute: string
  currentLocation?: { latitude: number, longitude: number } | null
}) => {


  const textColor = useThemeColor('text')
  const coolGray = "#e5e7eb";
  const backgroundLight = useThemeColor('backgroundLight')
  const accent = useThemeColor('accent')
  const { user, currentRole } = useAuth();

  const [showAlert, setshowAlert] = useState<ReactElement | null>(null);
  function alertBox(title: string, message: string, buttons?: Alertbutton[], type?: "default" | "error" | "success" | "laoding" | "destructive" | undefined) {
    setshowAlert(
      <AlertComponent
        visible
        title={title}
        message={message}
        buttons={buttons}
        type={type}
        onBackPress={() => setshowAlert(null)}
      />
    )
  }




  const handleDeny = () => {
    alertBox(
      dspRoute === "Requested Loads" ? "Remove Request" : "Deny Load",
      dspRoute === "Requested Loads"
        ? "Are you sure you want to remove this request?"
        : "Are you sure you want to deny this load?",
      [
        {
          title: "Yes, Deny",
          onPress: async () => {
            try {
              trackEventFirebase('deny_load_request', {
                loadId: item.loadItemDetails.loadId,
                truckId: item.truckDetails.truckId,
                driverId: item.driverDetails.driverId,
                fleetId: item.fleetDetails?.id || null,
                userId: user?.uid || null,
                loadOrigin: item.loadItemDetails.origin,
                loadDestination: item.loadItemDetails.destination,
                loadRate: item.loadItemDetails.rate,
                loadRatePerKm: item.loadItemDetails.ratePerKm,
                loadDistance: item.loadItemDetails.distance,
                loadCurrency: item.loadItemDetails.currency,
                loadCommodity: item.loadItemDetails.productName,
                truckCapacity: item.truckDetails.truckCapacity,
                truckCargoArea: item.truckDetails.cargoArea,
              });
              await deleteDocument('loadRequests', item.id);

              ToastAndroid.show(
                "Request removed successfully",
                ToastAndroid.SHORT
              );
            } catch (error) {
              alertBox("Error", "Failed to process request", [], "error");
              trackEventFirebase('deny_load_request_failed', {
                loadId: item.loadItemDetails.loadId,
                truckId: item.truckDetails.truckId,
                driverId: item.driverDetails.driverId,
                fleetId: item.fleetDetails?.id || null,
                userId: user?.uid || null,
                loadOrigin: item.loadItemDetails.origin,
                loadDestination: item.loadItemDetails.destination,
                loadRate: item.loadItemDetails.rate,
                loadRatePerKm: item.loadItemDetails.ratePerKm,
                loadDistance: item.loadItemDetails.distance,
                loadCurrency: item.loadItemDetails.currency,
                loadCommodity: item.loadItemDetails.productName,
                truckCapacity: item.truckDetails.truckCapacity,
                truckCargoArea: item.truckDetails.cargoArea,
              });
            }
          },
        },
      ],
      "destructive"
    );
  };



  const [showModal, setShowModal] = useState(false);

  const handleAccept = () => {
    setShowModal(true);
  };


  const handleConfirm = async (data: any) => {
    try{

  
    trackEventFirebase('accept_load_request_initiated', {
      loadId: item.loadItemDetails.loadId,
      truckId: item.truckDetails.truckId,
      driverId: item.driverDetails.driverId,
      fleetId: item.fleetDetails?.id || null,
      userId: user?.uid || null,
      loadOrigin: item.loadItemDetails.origin,
      loadDestination: item.loadItemDetails.destination,
      loadRate: item.loadItemDetails.rate,
      loadRatePerKm: item.loadItemDetails.ratePerKm,
      loadDistance: item.loadItemDetails.distance,
      loadCurrency: item.loadItemDetails.currency,
      loadCommodity: item.loadItemDetails.productName,
      truckCapacity: item.truckDetails.truckCapacity,
      truckCargoArea: item.truckDetails.cargoArea,
    });

    if (!item.loadItemDetails || !item.truckDetails || !item.driverDetails) {
      alertBox("Error", "Missing required details for assignment.", [], "error");
      return;
    }
    const payload = {
      ...data,
      visibility: "PUBLIC",
      fleetDetails: item?.organizationDetails ?? null,
      loadDetails: item.loadItemDetails,
      truckDetails: item.truckDetails,
      driverDetails: item.driverDetails,
      driverId: item.driverDetails?.driverId || null,
      externalLoad: true,
      status: "ASSIGNED",
      createdAt: new Date(),
    };

    const assigmentId = `${item.loadItemDetails.loadId}_${item.truckDetails.truckId}`;

    await addDocumentWithId(`fleets/${item.fleetDetails.id}/assignments`, assigmentId, {
      ...payload,
      shipper: item.loadItemDetails.organizationDetails || null,
      timeStamp: serverTimestamp(),
    });

    await addDocumentWithId(
      `${item.loadItemDetails.postedBy.accType}/${item.loadItemDetails.postedBy.organizationId}/assignments`,
      assigmentId,
      { ...payload, shipper: item.loadItemDetails.shipper || null, timeStamp: serverTimestamp() }
    );

    await updateDocument("cargoRequests", item.id, {
      requestStatus: "ACCEPTED",
      ownerDecision: "Accepted",
      acceptedAt: new Date(),
      assignedFleetId: item?.fleetDetails?.id ?? null,
      assignedTruckId: item.truckDetails.truckId,
      assignedDriverId: item.driverDetails.driverId,
      assignmentCreated: true,
    });

    const analyticsOrganizationId = currentRole?.organizationId || currentRole?.fleetId;
    const daySinceSignup = (Date.now() - user?.createdAt!) / (1000 * 60 * 60 * 24);
    const accountAge = daySinceSignup < 30 ? "new" : daySinceSignup < 90 ? "active" : "established";

    if (analyticsOrganizationId && (currentRole?.accType === 'fleet' || currentRole?.accType === 'brokerage')) {
      const context = {
        userId: user?.uid, accountAge, organizationId: analyticsOrganizationId,
        organizationProfileId: analyticsOrganizationId, organizationType: currentRole.accType,
        role: currentRole.userRole, accountType: currentRole.accType,
        metadata: {
          assignmentId: assigmentId, loadId: item.loadItemDetails.loadId,
          truckId: item.truckDetails.truckId, assigmentType: "PUBLIC_CARGO",
          loadDetails: item.loadItemDetails, trucksAssigned: item.truckDetails,
        },
      };

      void trackAssignmentCreated(context).catch(console.error);
      void trackTruckAccepted(context).catch(console.error);
      void incrementAssignmentsCreated(currentRole.accType, analyticsOrganizationId).catch(console.error);
      void incrementRequestsAcceptedPblcCargo(item?.fleetDetails?.id).catch(console.error);
      void incrementAcceptedRequestedPblcCargo(analyticsOrganizationId).catch(console.error);

      // Respond to the pending request + bump stats
      const assignmentTimeId = `${item.loadItemDetails.loadId}_${item.truckDetails.truckId}`
        .toLowerCase()
        .replace(/\s+/g, "_");

      const batch = writeBatch(db);

      // FIX: originally both "addingTimeTrackForFleet" and "addingTimeTrackForLoad" pointed
      // at organizationProfiles/{analyticsOrganizationId}/... — the same document twice.
      // The truck-owning org's requestAnalytics doc (item.fleetDetails.id) was never updated,
      // and since requestedAt was originally written under item.fleetDetails.id when the
      // truck owner created the request (see handleSubmitDetails), reading it from
      // analyticsOrganizationId would silently produce `undefined` / throw.
      const respondedTimeMs = await respondToRequestAnalytics(batch, {
        orgIdA: item?.fleetDetails?.id,   // truck owner org — where requestedAt lives
        orgIdB: analyticsOrganizationId,  // load owner org — the one responding now
        docId: assignmentTimeId,
        response: "ACCEPTED",
      });

      incrementOrgStats(batch, item?.fleetDetails?.id, {
        "publicCargo.acceptedRequests": 1,
      });
      incrementOrgStats(batch, analyticsOrganizationId, {
        "publicCargo.acceptedRequestsReceived": 1,
        "publicCargo.totalResponses": 1,
        "publicCargo.totalResponseTimesMs": respondedTimeMs,
      });

      await batch.commit();
    }

     trackEventFirebase('accept_load_request_accepted', {
      loadId: item.loadItemDetails.loadId,
      truckId: item.truckDetails.truckId,
      driverId: item.driverDetails.driverId,
      fleetId: item.fleetDetails?.id || null,
      userId: user?.uid || null,
      loadOrigin: item.loadItemDetails.origin,
      loadDestination: item.loadItemDetails.destination,
      loadRate: item.loadItemDetails.rate,
      loadRatePerKm: item.loadItemDetails.ratePerKm,
      loadDistance: item.loadItemDetails.distance,
      loadCurrency: item.loadItemDetails.currency,
      loadCommodity: item.loadItemDetails.productName,
      truckCapacity: item.truckDetails.truckCapacity,
      truckCargoArea: item.truckDetails.cargoArea,
    });

    ToastAndroid.show("Load accepted. It now appears under Assignments.", ToastAndroid.LONG);
    setShowModal(false);
      }catch(e){
        trackEventFirebase('accept_load_request_failed', {
      loadId: item.loadItemDetails.loadId,
      truckId: item.truckDetails.truckId,
      driverId: item.driverDetails.driverId,
      fleetId: item.fleetDetails?.id || null,
      userId: user?.uid || null,
      loadOrigin: item.loadItemDetails.origin,
      loadDestination: item.loadItemDetails.destination,
      loadRate: item.loadItemDetails.rate,
      loadRatePerKm: item.loadItemDetails.ratePerKm,
      loadDistance: item.loadItemDetails.distance,
      loadCurrency: item.loadItemDetails.currency,
      loadCommodity: item.loadItemDetails.productName,
      truckCapacity: item.truckDetails.truckCapacity,
      truckCargoArea: item.truckDetails.cargoArea,
    });
      console.error("Error in handleConfirm:", e);
      alertBox("Error", "Failed to accept the load request.", [], "error");
      return;
    }
  };





  //  async function accecptTruckRquest(decision: string) {
  //         // Update Booking State

  //         if (decision === "Approved") {
  //             await updateDocument("CargoBookings", `${updateReuestDoc}`, { ownerDecision: decision, })

  //             await sendPushNotification(
  //                 `${expoPushToken}`,
  //                 //   "Truck Accepted",
  //                 `Truck Accepted`,
  //                 `Truck "${truckData.truckName}" has been accepted for load "${productName}" ( ${origin} to ${destination}) rate ${currency} ${rate} ${model} . Tap to view details.`,
  //                 { pathname: '/BooksAndBids/ViewBidsAndBooks', params: { dbName: "bookings", dspRoute: "Booked Loads" } },
  //             );

  //         } else if (decision === "Denied") {
  //             if (!reasonForDenail) { alert("Enter Reason For Denial"); return }
  //             await updateDocument("CargoBookings", `${updateReuestDoc}`, { ownerDecision: decision, denialReason: reasonForDenail })
  //             await sendPushNotification(
  //                 `${expoPushToken}`,
  //                 `Truck  Denied`,
  //                 `Truck "${truckData.truckName}" was Denied for load "${productName}" ( ${origin} to ${destination}) rate ${currency} ${rate} ${model} . Reason: Details not clear.`,
  //                 { pathname: '/BooksAndBids/ViewBidsAndBooks', params: { dbName: "bookings", dspRoute: "Booked Loads" } },
  //             )
  //             setTruckDenialReason(false)
  //             setReasonForDenial("")
  //         }
  //         alert("Done Adding")
  //         // Update Truck

  //     }




  return (

    <View style={{ borderWidth: 1, borderColor: coolGray, padding: wp(2), borderRadius: wp(4), marginBottom: 5 }}>

      {showAlert}

      <AssignmentModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirm}
        truck={item.truckDetails}
        driver={item.driverDetails}
        load={item}
        initialPickupLocation={item.loadItemDetails?.originFull || item.origin}
        initialDeliveryLocation={item.loadItemDetails?.destinationFull || item.destination}
        initialPickupDate={item.loadItemDetails?.loadingDate || null}
        initialDeliveryDate={item.loadItemDetails?.deliveryDate || null}
      />


      <TouchableOpacity

        activeOpacity={0.7}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: wp(2),
          gap: wp(1.5),
        }}
      >
        {/* LEFT ICON */}
        <Ionicons name="business-outline" size={18} color={accent} />

        {/* TEXT */}
        <ThemedText
          type="subtitle"
          style={{
            color: textColor,
            textAlign: "center",
            fontWeight: "600",
            maxWidth: "80%",
          }}
          numberOfLines={1}
        >
          {dspRoute === "Requested Loads"
            ? (item.fleetDetails?.name || item.companyName)
            : item.companyName}
        </ThemedText>

        {/* RIGHT CHEVRON */}
        <Ionicons name="chevron-forward" size={18} color={accent} />
      </TouchableOpacity>

      <Divider />
      <View style={{ backgroundColor: backgroundLight, borderRadius: 10, padding: wp(2), marginBottom: wp(2) }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
          <ThemedText style={{ width: 100, color: accent, fontWeight: "bold" }}>Status</ThemedText>
          <ThemedText style={{ flex: 1, flexWrap: 'wrap' }}>{item.status} {item.created_at ? getRelativeTime(parseInt(item.created_at)) : 'N/A'}</ThemedText>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
          <ThemedText style={{ width: 100, color: accent, fontWeight: "bold" }}>Commodity</ThemedText>
          <ThemedText style={{ flex: 1, flexWrap: 'wrap' }}>{item.loadItemDetails.productName} </ThemedText>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
          <ThemedText style={{ width: 100, color: accent, fontWeight: "bold" }}>Rate {item.model} </ThemedText>
          <ThemedText style={{ flex: 1, flexWrap: 'wrap' }}> {item.currency} {item.loadItemDetails.rate}  </ThemedText>
        </View>
        <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 10 }}>
          <ThemedText style={{ width: 100, color: accent, fontWeight: "bold" }}>Route</ThemedText>
          <ThemedText style={{ flex: 1, flexWrap: 'wrap' }}>From {item.loadItemDetails.origin} To {item.loadItemDetails.destination} </ThemedText>
        </View>


        {/* TRUCK DETAILS */}
        <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 10 }}>
          <ThemedText style={{ width: 100, color: accent, fontWeight: "bold" }}>
            Truck
          </ThemedText>

          <ThemedText style={{ flex: 1, flexWrap: 'wrap' }}>
            {item.truckDetails?.truckCapacity} • {item.truckDetails?.cargoArea} • Plate: {item.truckDetails?.numberPlate || "N/A"}
          </ThemedText>
        </View>

        {/* DRIVER DETAILS */}
        <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 10 }}>
          <ThemedText style={{ width: 100, color: accent, fontWeight: "bold" }}>
            Driver
          </ThemedText>

          <ThemedText style={{ flex: 1, flexWrap: 'wrap' }}>
            {item.driverDetails?.driverName} • License: {item.driverDetails?.driverLicenseNumber || "N/A"}
          </ThemedText>
        </View>



        {dspRoute === "Requested Loads" && <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
          <ThemedText style={{ width: 100, color: accent, fontWeight: "bold" }}>Decision</ThemedText>
          <View style={{ padding: wp(2), paddingVertical: wp(1), borderRadius: wp(20), backgroundColor: "#737373" }}>
            <ThemedText type="defaultSemiBold" style={{ color: "#fff" }}>{item.ownerDecision} </ThemedText>
          </View>
        </View>}
        {(dspRoute === "Requested Loads") && item.denialReason && <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 10 }}>
          <ThemedText style={{ width: 100, color: accent, fontWeight: "bold" }}>Reason</ThemedText>
          <ThemedText style={{ color: "#222", fontStyle: "italic", flex: 1, flexWrap: 'wrap' }}> {item.denialReason} </ThemedText>
        </View>}
      </View>

      {/* Load Tracker Component - only show for booked loads */}
      {/* <LoadTracker
        loadRequest={item}
        isTruckOwner={dspRoute === "Requested Loads"}
        currentTruckLocation={currentLocation || undefined}
        onTrackerShared={() => {
          // Refresh the data or show success message
          ToastAndroid.show("Tracker shared successfully!", ToastAndroid.SHORT);
        }}
      /> */}


      {dspRoute !== "Requested Loads" && (
        <View
          style={{
            flexDirection: 'row',
            gap: wp(2),
            marginTop: wp(2),
          }}
        >

          {/* VIEW TRUCK */}
          <TouchableOpacity



            onPress={() => router.push({
              pathname: "/Logistics/Trucks/TruckDetails",
              params: { truckid: item.truckDetails.truckId, dspDetails: "false", fleetId: item.fleetDetails.id || undefined }
            })}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: wp(2.5),
              borderRadius: wp(4),
              borderWidth: 1,
              borderColor: accent,
              backgroundColor: 'transparent',
              gap: wp(1),
            }}
          >
            <Ionicons name="car-outline" size={16} color={accent} />
            <ThemedText style={{ color: accent, fontSize: wp(3) }}>
              Truck
            </ThemedText>
          </TouchableOpacity>

          {/* VIEW DRIVER */}
          <TouchableOpacity
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: wp(2.5),
              borderRadius: wp(4),
              borderWidth: 1,
              borderColor: accent,
              backgroundColor: 'transparent',
              gap: wp(1),
            }}
          >
            <Ionicons name="person-outline" size={16} color={accent} />
            <ThemedText style={{ color: accent, fontSize: wp(3) }}>
              Driver
            </ThemedText>
          </TouchableOpacity>

          {/* VIEW LOAD */}
          <TouchableOpacity

            onPress={() => {
              router.push({
                pathname: "/Logistics/Loads/Index",
                params: {
                  cargoId: item.loadItemDetails.cargoId || item.loadItemDetails.loadId,
                  cargoVisibilityG: 'PUBLIC'
                },
              });
            }}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: wp(2.5),
              borderRadius: wp(4),
              borderWidth: 1,
              borderColor: accent,
              backgroundColor: 'transparent',
              gap: wp(1),
            }}
          >
            <Ionicons name="cube-outline" size={16} color={accent} />
            <ThemedText style={{ color: accent, fontSize: wp(3) }}>
              Load
            </ThemedText>
          </TouchableOpacity>

        </View>
      )}

      {dspRoute === "Requested Loads" && <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: wp(2), gap: wp(2) }}>

        <TouchableOpacity style={{ alignItems: "center", justifyContent: 'center', backgroundColor: '#228B22', paddingVertical: wp(2.5), borderRadius: wp(4), flex: 1 }} onPress={() => router.push({ pathname: "/Logistics/Loads/Index", params: { itemId: item.loadId } })} >
          <ThemedText style={{ color: 'white' }}>View Load</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={{ alignItems: "center", justifyContent: 'center', backgroundColor: accent, paddingVertical: wp(2.5), borderRadius: wp(4), flex: 1 }} onPress={() => router.push({ pathname: "/Logistics/Trucks/TruckDetails", params: { truckid: item.truckId } })} >
          <ThemedText style={{ color: 'white' }}>View Truck</ThemedText>
        </TouchableOpacity>
      </View>}


      <View
        style={{
          flexDirection: 'row',
          gap: wp(2),
          marginTop: wp(2),
        }}
      >

        {/* DENY (secondary destructive) */}
        <TouchableOpacity
          onPress={handleDeny}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: wp(2.5),
            borderRadius: wp(4),
            borderWidth: 1,
            borderColor: '#dc3545',
            backgroundColor: 'transparent',
            gap: wp(1),
          }}
        >
          <Ionicons name="close-circle-outline" size={16} color="#dc3545" />
          <ThemedText style={{ color: '#dc3545', fontSize: wp(3), fontWeight: "500" }}>
            {dspRoute === "Requested Loads" ? "no longer interested" : "deny"}
          </ThemedText>
        </TouchableOpacity>

        {/* ACCEPT (PRIMARY ACTION) */}
        <TouchableOpacity
          onPress={handleAccept}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: wp(2.5),
            borderRadius: wp(4),
            backgroundColor: accent,
            gap: wp(1),
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <Ionicons name="checkmark-circle" size={16} color="#fff" />
          <ThemedText style={{ color: "#fff", fontSize: wp(3), fontWeight: "600" }}>
            accept
          </ThemedText>
        </TouchableOpacity>

      </View>


    </View>
  );
}






/* 

so whats besy 

ok   one is booking or bidding here so its a request aand am tracking the time here this is how 
            const batch = writeBatch(db);

            // Update Truckorganization stats
            batch.update(
                doc(db, "organizationProfiles", analyticsOrganizationId),
                {
                      requestsPblcCargo: increment(1) ,

                } ,
               

            );
            // Update Load organization stats

              batch.update(
                doc(db, "organizationProfiles", loadItem.organizationId),
                {
                      requestedPblcCargo: increment(1) ,

                } ,
               

            );



            // Add Time with Id

            const assignmentTimeId = `${loadItem.id}_${item.id}`
                .toLowerCase()
                .replace(/\s+/g, "_");


                //eeting the time for fleet 
            const addingTimeTrackForFleet = doc(
                db,
                "organizationProfiles",
                analyticsOrganizationId,
                "provenRoutes",
                assignmentTimeId
            );

                batch.set(addingTimeTrackForFleet, {
                   
                    requestedAt: serverTimestamp(),
                    respondedAt :null ,
                    respondedTimeMs :null ,
                    status :"PENDING"

                });

                     //eeting the time for fleet 
            const addingTimeTrackForLoad = doc(
                db,
                "organizationProfiles",
                analyticsOrganizationId,
                " ",
                assignmentTimeId
            );

                  batch.set(addingTimeTrackForLoad, {
                    
                      requestedAt: serverTimestamp(),
                      respondedAt :null ,
                      respondedTimeMs :null ,
                      status :"PENDING"

                  });


              await batch.commit();
       so when booked the fleet or truck owner is the analaysticsId    then the load owner accepnt here    but l have an error on requetedAt and servertimsapt to milils how can l make this better and almost perfect 
      const batch = writeBatch(db);

      const assignmentTimeId = `${item.loadItemDetails.loadId}_${item.truckDetails.truckId}`
        .toLowerCase()
        .replace(/\s+/g, "_");

      //eeting the time for fleet 
      const addingTimeTrackForFleet = doc(
        db,
        "organizationProfiles",
        analyticsOrganizationId,
        "provenRoutes",
        assignmentTimeId
      );

      const getrRquestedAt = await getDoc(addingTimeTrackForFleet);

      const theRequestedAt = getrRquestedAt.data.requestedAt
      const setRespondedAt = serverTimestamp()
       const respondedTimeMs= theRequestedAt.toMillis() - setRespondedAt.toMillis() ;

      batch.set(addingTimeTrackForFleet, {

        respondedAt: theRequestedAt,
        respondedTimeMs: respondedTimeMs,
        status: "responded"

      });

      //eeting the time for fleet 
      const addingTimeTrackForLoad = doc(
        db,
        "organizationProfiles",
        analyticsOrganizationId,
        "provenRoutes",
        assignmentTimeId
      );

      batch.set(addingTimeTrackForLoad, {

         respondedAt: theRequestedAt,
        respondedTimeMs: respondedTimeMs,
        status: "responded"

      });


       // Update Truck organization stats
      batch.update(
        doc(db, "organizationProfiles", item?.fleetDetails?.id),
        {
          requestsAcceptedPblcCargo: increment(1),

        },


      );
      // Update Load organization stats

      batch.update(
        doc(db, "organizationProfiles", analyticsOrganizationId),
        {
          acceptedRequestedPblcCargo: increment(1),
          totalResponses : increment(1) ,
          totalResponseTimesMs : increment(respondedTimeMs)

        },

      );


      await batch.commit();

`


*/




