import React, { useEffect, useState, ReactElement } from "react";
import { View, TouchableOpacity, ToastAndroid } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { wp } from "@/constants/common";
import Divider from "@/components/Divider";
import { router } from 'expo-router'
import { useThemeColor } from '@/hooks/useThemeColor'
import AlertComponent, { Alertbutton } from "@/components/AlertComponent";
import { addDocument, deleteDocument, } from "@/db/operations";
import { Ionicons } from "@expo/vector-icons";
import AssignmentModal from "@/components/AssignmentModal";


import { LoadTracker } from "@/components/LoadTracker";
import { useAuth } from '@/context/AuthContext';

// Function to get relative time (e.g., "1 hr ago", "4 seconds ago")
const getRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
  } else if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (hours < 24) {
    return `${hours} hr${hours !== 1 ? 's' : ''} ago`;
  } else if (days <= 2) {
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  } else {
    // More than 2 days - show the actual date
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  }
};

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
  const { user } = useAuth();

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
              await deleteDocument('loadRequests', item.id);

              ToastAndroid.show(
                "Request removed successfully",
                ToastAndroid.SHORT
              );
            } catch (error) {
              alertBox("Error", "Failed to process request", [], "error");
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
    const payload = {
      ...data,
      visibility: "PUBLIC",
      fleetName: item.fleetDetails?.fleetName || item.companyName,
      loadOwnerDetails: {
        id: item.loadOwnerId,
        name: item.companyName,
        email: item.loadOwnerEmail,
        phone: item.loadOwnerPhone,
      },

      fleetId: item.fleetId,
      fleetDetails: {
        id: item.fleetId,
        name: item.fleetDetails?.fleetName || item.companyName,
        email: item.fleetDetails?.fleetEmail || item.loadOwnerEmail,
        phone: item.fleetDetails?.fleetPhone || item.loadOwnerPhone,
      },
      loadDetails: item.loadDetails,
      truckDetails: item.truckDetails,
      driverDetails: item.driverDetails,

      driverId: item.driverDetails?.driverId || null,

      status: "ASSIGNED",
      createdAt: new Date(),
    };

    // Fleet Owner accepts the request and creates a booking in the "CargoBookings" collection
    await addDocument(`fleets/${item.fleetId}/assignments`, {
      ...payload,
      shipper: item.loadDetails.organizationDetails 
    });

    // Cargo Adder Owner can now see the booking in their Assigments section
    await addDocument(`${item.loadDetails.accType}/${item.loadDetails.organizationId}/assignments`, {
      ...payload,
      shipper: item.loadDetails.shipper
    })


    setShowModal(false);
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
        initialPickupLocation={item.loadDetails?.originFull || item.origin}
        initialDeliveryLocation={item.loadDetails?.destinationFull || item.destination}
        initialPickupDate={item.loadDetails?.pickupDate || null}
        initialDeliveryDate={item.loadDetails?.deliveryDate || null}
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
            ? (item.fleetDetails?.fleetName || item.companyName)
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
          <ThemedText style={{ flex: 1, flexWrap: 'wrap' }}>{item.productName} </ThemedText>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
          <ThemedText style={{ width: 100, color: accent, fontWeight: "bold" }}>Rate {item.model} </ThemedText>
          <ThemedText style={{ flex: 1, flexWrap: 'wrap' }}> {item.currency} {item.rate}  </ThemedText>
        </View>
        <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 10 }}>
          <ThemedText style={{ width: 100, color: accent, fontWeight: "bold" }}>Route</ThemedText>
          <ThemedText style={{ flex: 1, flexWrap: 'wrap' }}>From {item.origin} To {item.destination} </ThemedText>
        </View>


        {/* TRUCK DETAILS */}
        <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 10 }}>
          <ThemedText style={{ width: 100, color: accent, fontWeight: "bold" }}>
            Truck
          </ThemedText>

          <ThemedText style={{ flex: 1, flexWrap: 'wrap' }}>
            {item.truckCapacity} • {item.truckDetails?.cargoArea} • Plate: {item.truckDetails?.numberPlate || "N/A"}
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
            onPress={() =>
              router.push({
                pathname: "/Logistics/Trucks/TruckDetails",
              })
            }
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
            onPress={() =>
              router.push({
                pathname: "/Logistics/Loads/Index",
                params: { itemId: item.loadId },
              })
            }
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






