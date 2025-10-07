import React, { useEffect, useState, ReactElement } from "react";
import { View, TouchableOpacity, ToastAndroid } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { wp } from "@/constants/common";
import Divider from "@/components/Divider";
import { router } from 'expo-router'
import { useThemeColor } from '@/hooks/useThemeColor'
import AlertComponent, { Alertbutton } from "@/components/AlertComponent";
import { deleteDocument, } from "@/db/operations";

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

  return (

    <View style={{ borderWidth: 1, borderColor: coolGray, padding: wp(2), borderRadius: wp(4), marginBottom: 5 }}>

      {showAlert}

      <ThemedText type="subtitle" style={{ color: textColor, textAlign: 'center', marginBottom: wp(2) }}>
        {dspRoute === "Requested Loads" ? (item.truckOwnerName || item.companyName) : item.companyName}
      </ThemedText>

      <Divider />
      <View style={{ backgroundColor: "#f4f4f4", borderRadius: 10, padding: wp(2), marginBottom: wp(2) }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
          <ThemedText style={{ width: 100, color: "#6a0c0c", fontWeight: "bold" }}>Status</ThemedText>
          <ThemedText style={{ color: "#222", flex: 1, flexWrap: 'wrap' }}>{item.status} {item.created_at ? getRelativeTime(parseInt(item.created_at)) : 'N/A'}</ThemedText>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
          <ThemedText style={{ width: 100, color: "#6a0c0c", fontWeight: "bold" }}>Commodity</ThemedText>
          <ThemedText style={{ color: "#222", flex: 1, flexWrap: 'wrap' }}>{item.productName} </ThemedText>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
          <ThemedText style={{ width: 100, color: "#6a0c0c", fontWeight: "bold" }}>Rate {item.model} </ThemedText>
          <ThemedText style={{ color: "#222", flex: 1, flexWrap: 'wrap' }}> {item.currency} {item.rate}  </ThemedText>
        </View>
        <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 10 }}>
          <ThemedText style={{ width: 100, color: "#6a0c0c", fontWeight: "bold" }}>Route</ThemedText>
          <ThemedText style={{ color: "#222", flex: 1, flexWrap: 'wrap' }}>From {item.origin} To {item.destination} </ThemedText>
        </View>

        {dspRoute === "Requested Loads" && <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
          <ThemedText style={{ width: 100, color: "#6a0c0c", fontWeight: "bold" }}>Decision</ThemedText>
          <View style={{ padding: wp(2), paddingVertical: wp(1), borderRadius: wp(20), backgroundColor: "#737373" }}>
            <ThemedText type="defaultSemiBold" style={{ color: "#fff" }}>{item.ownerDecision} </ThemedText>
          </View>
        </View>}
        {(dspRoute === "Requested Loads") && item.denialReason && <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 10 }}>
          <ThemedText style={{ width: 100, color: "#6a0c0c", fontWeight: "bold" }}>Reason</ThemedText>
          <ThemedText style={{ color: "#222", fontStyle: "italic", flex: 1, flexWrap: 'wrap' }}> {item.denialReason} </ThemedText>
        </View>}
      </View>

      {/* Load Tracker Component - only show for booked loads */}
      <LoadTracker
        loadRequest={item}
        isTruckOwner={dspRoute === "Requested Loads"}
        currentTruckLocation={currentLocation || undefined}
        onTrackerShared={() => {
          // Refresh the data or show success message
          ToastAndroid.show("Tracker shared successfully!", ToastAndroid.SHORT);
        }}
      />

      {dspRoute !== "Requested Loads" && <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: wp(2), gap: wp(2) }}>
        <TouchableOpacity style={{ alignItems: "center", justifyContent: 'center', backgroundColor: "#6a0c0c", paddingVertical: wp(2.5), borderRadius: wp(4), flex: 1 }} onPress={() => router.push({ pathname: "/Logistics/Trucks/TruckDetails", params: { truckid: item.truckId, updateReuestDoc: item.id, expoPushToken: item.expoPushToken, productName: item.productName, origin: item.origin, destination: item.destination, model: item.model, rate: item.rate, currency: item.currency, dspDetails: "true", truckBeingReuested: 'true' } })} >
          <ThemedText style={{ color: 'white' }} >View Truck</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={{ alignItems: "center", justifyContent: 'center', backgroundColor: '#228B22', paddingVertical: wp(2.5), borderRadius: wp(4), flex: 1 }} onPress={() => router.push({ pathname: "/Logistics/Loads/Index", params: { itemId: item.loadId, } })} >
          <ThemedText style={{ color: 'white' }}>View Load</ThemedText>
        </TouchableOpacity>
      </View>}

      {dspRoute === "Requested Loads" && <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: wp(2), gap: wp(2) }}>

        <TouchableOpacity style={{ alignItems: "center", justifyContent: 'center', backgroundColor: '#228B22', paddingVertical: wp(2.5), borderRadius: wp(4), flex: 1 }} onPress={() => router.push({ pathname: "/Logistics/Loads/Index", params: { itemId: item.loadId } })} >
          <ThemedText style={{ color: 'white' }}>View Load</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={{ alignItems: "center", justifyContent: 'center', backgroundColor: "#6a0c0c", paddingVertical: wp(2.5), borderRadius: wp(4), flex: 1 }} onPress={() => router.push({ pathname: "/Logistics/Trucks/TruckDetails", params: { truckid: item.truckId } })} >
          <ThemedText style={{ color: 'white' }}>View Truck</ThemedText>
        </TouchableOpacity>
      </View>}

      <TouchableOpacity onPress={() => {
        alertBox(
          dspRoute === "Requested Loads" ? "Remove Request" : "Delete Load",
          (dspRoute === "Requested Loads") ? "Are you sure you want to delete this request?" : "Are you sure you want to delete the load?",
          [
            {
              title: "Delete",
              onPress: async () => {
                try {
                  // Add delete logic here
                  if (dspRoute === "Requested Loads") {
                    await deleteDocument('loadRequests', item.id)
                  } else if (dspRoute !== "Requested Loads") {
                    await deleteDocument('loadRequests', item.id)
                  }
                  ToastAndroid.show("Success : Request deleted successfully", ToastAndroid.SHORT);
                } catch (error) {
                  alertBox("Error", "Failed to delete truck", [], "error");
                }
              },
            },
          ],
          "destructive"
        )
      }}
        style={{ backgroundColor: '#dc3545', paddingVertical: wp(2), borderRadius: wp(4), marginTop: wp(2), alignItems: 'center' }}>
        {dspRoute !== "Requested Loads" && <ThemedText style={{ color: 'white' }}>Load Taken</ThemedText>}
        {dspRoute === "Requested Loads" && <ThemedText style={{ color: 'white' }}>No longer Intrested</ThemedText>}
      </TouchableOpacity>
    </View>
  );
}






