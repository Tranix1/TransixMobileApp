import React, { useState, useEffect } from "react";
import { View, Button, Alert, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import ScreenWrapper from "@/components/ScreenWrapper";
import Heading from "@/components/Heading";
import Input from "@/components/Input";
import { addDocument, getUsers, fetchDocuments, updateDocument } from "@/db/operations";
import { DropDownItem } from "@/components/DropDown";
import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/context/AuthContext";
import { where } from "firebase/firestore";
import { wp } from "@/constants/common";
import { useThemeColor } from "@/hooks/useThemeColor";

export default function AddTrackedVehicle() {
  const [vehicleName, setVehicleName] = useState("");
  const [imei, setImei] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [vehicleType, setVehiType] = useState("");
  const [vehicleCategory, setVehicleCategory] = useState<{ id: number; name: string } | null>(null);
  const [vehicleSubType, setVehicleSubType] = useState<{ id: number; name: string } | null>(null);
  const [paymentType, setPaymentType] = useState<{ id: number; name: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userTrucks, setUserTrucks] = useState<any[]>([]);
  const [selectedTruck, setSelectedTruck] = useState<any | null>(null);
  const [showUserTrucks, setShowUserTrucks] = useState(false);
  
  

  const { user: salesman , currentRole } = useAuth();
  const accent = useThemeColor('accent');
  const backgroundLight = useThemeColor('backgroundLight');

  const vehicleCategories = [
    { id: 1, name: "Commercial" },
    { id: 2, name: "Personal" },
    { id: 3, name: "Car Dealer" }
  ];

  const commercialSubTypes = [
    { id: 1, name: "Truck" },
    { id: 2, name: "Kombi" },
    { id: 3, name: "Van" },
    { id: 4, name: "eTaxi (Uber)" },
    { id: 5, name: "Old Model Taxi (General)" }
  ];

  const paymentTypes = [
    { id: 1, name: "Once-off Payment" },
    { id: 2, name: "Subscription" }
  ];

  const fetchUserTrucks = async () => {
    try {
      const trucks = await fetchDocuments(`fleets/${currentRole.fleetId}/Trucks`, 50, undefined, );
      setUserTrucks(trucks.data || []);
      setShowUserTrucks(true);
    } catch (error) {
      console.error("Error fetching user trucks:", error);
      Alert.alert("Error", "Failed to fetch user trucks");
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await getUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    setVehicleSubType(null);
    setPaymentType(null);
  }, [vehicleCategory]);

  const handleAddVehicle = async () => {
    if (!vehicleName || !imei || !selectedUser || !vehicleCategory || !phoneNumber || !vehicleType) {
      Alert.alert("Error", "Please fill in all required fields and select a user.");
      return;
    }

    if (vehicleCategory.name === "Commercial" && !vehicleSubType) {
      Alert.alert("Error", "Please select a vehicle sub-type for commercial vehicles.");
      return;
    }

    if ((vehicleCategory.name === "Personal" || vehicleCategory.name === "Car Dealer") && !paymentType) {
      Alert.alert("Error", "Please select a payment type.");
      return;
    }

    setLoading(true);

    try {
      // Traccar API logic
      const username = "Kelvinyaya8@gmail.com";
      const password = "a050hw9d";
      const basicAuth = "Basic " + btoa(`${username}:${password}`);

      const traccarResponse = await fetch("https://server.traccar.org/api/devices", {
        method: "POST",
        headers: {
          Authorization: basicAuth,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: vehicleName,
          uniqueId: imei,
          category: vehicleCategory.name + (vehicleSubType ? ` - ${vehicleSubType.name}` : ""),
        }),
      });

      if (!traccarResponse.ok) {
        throw new Error("Failed to add device to Server.");
      }

      const traccarDevice = await traccarResponse.json();
      const deviceId = traccarDevice.id;

      // --- SUBSCRIPTION LOGIC FIX ---
      let subscriptionData = null;
      const isSubscription = paymentType?.name === "Subscription";
      const isOnceOff = paymentType?.name === "Once-off Payment";
      const isCommercial = vehicleCategory.name === "Commercial";

      if (isCommercial || isSubscription) {
        const trialStartAt = new Date();
        const trialEndAt = new Date(trialStartAt);
        trialEndAt.setDate(trialEndAt.getDate() + 30); // Assign 30 days trial

        subscriptionData = {
          status: "trial",
          trialDays: 30,
          trialStartAt: trialStartAt.toISOString(),
          trialEndAt: trialEndAt.toISOString(),
          nextBillingAt: trialEndAt.toISOString(),
          isTrial: true,
          isOnceOff: false,
        };
      } else if (isOnceOff) {
        const accessStartAt = new Date();
        const accessEndAt = new Date(accessStartAt);
        accessEndAt.setHours(accessEndAt.getHours() + 4);

        subscriptionData = {
          status: "once_off",
          accessStartAt: accessStartAt.toISOString(),
          accessEndAt: accessEndAt.toISOString(),
          isOnceOff: true,
          restrictToCurrentLocation: true,
        };
      }

      const vehicleData = {
        vehicleName,
        imei,
        phoneNumber,
        vehicleType,
        category: vehicleCategory.name,
        subType: vehicleSubType?.name || null,
        paymentType: paymentType?.name || null,
        userId: selectedUser.uid || selectedUser.userId,
        userEmail: selectedUser.email,
        userName: selectedUser.displayName || selectedUser.email,
        salesmanId: salesman?.uid,
        salesmanEmail: salesman?.email,
        createdAt: new Date().toISOString(),
        status: "active",
        deviceId: deviceId,
        subscription: subscriptionData, // Saved to DB
        truckId: selectedTruck?.truckId || null,
        truckDetails: selectedTruck ? {
          truckType: selectedTruck.truckType,
          cargoArea: selectedTruck.cargoArea,
          truckCapacity: selectedTruck.truckCapacity,
          numberPlate: selectedTruck.truckNumberPlate
        } : null,
        referrerId: selectedUser?.referrerId || null
      };

      await addDocument("TrackedVehicles", vehicleData);

      if (selectedTruck) {
        await updateDocument(`fleets/${currentRole?.fleetId}/Trucks`, selectedTruck.id, {
          hasTracker: true,
          trackerStatus: 'active',
          trackingDeviceId: deviceId,
          trackerImei: imei,
          phoneNumber,
          vehicleName,
          trackerId: `TRK${Date.now()}`,
          trackerAddedAt: Date.now().toString()
        });
      }

      Alert.alert("Success", "Vehicle added successfully!");

      // Reset Form
      setVehicleName("");
      setImei("");
      setPhoneNumber("");
      setVehiType("");
      setVehicleCategory(null);
      setVehicleSubType(null);
      setPaymentType(null);
      setSelectedUser(null);
      setSelectedTruck(null);
      setSearchQuery("");
      setShowUserTrucks(false);

    } catch (error) {
      console.error("Error adding vehicle:", error);
      Alert.alert("Error", "Failed to add vehicle. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.email && typeof user.email === 'string' && user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScreenWrapper>
      <Heading page="Add Tracked Vehicle" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 350 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <Input placeholder="Vehicle Name" value={vehicleName} onChangeText={setVehicleName} />
          <Input placeholder="IMEI ID" value={imei} onChangeText={setImei} keyboardType="number-pad" />
          <Input placeholder="Phone number" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="number-pad" />
          <Input placeholder="Vehicle Type (e.g. Toyota)" value={vehicleType} onChangeText={setVehiType} />

          <DropDownItem
            allData={vehicleCategories}
            selectedItem={vehicleCategory}
            setSelectedItem={setVehicleCategory}
            placeholder="Select Vehicle Category"
          />

          {vehicleCategory?.name === "Commercial" && (
            <DropDownItem
              allData={commercialSubTypes}
              selectedItem={vehicleSubType}
              setSelectedItem={setVehicleSubType}
              placeholder="Select Vehicle Type"
            />
          )}

          {(vehicleCategory?.name === "Personal" || vehicleCategory?.name === "Car Dealer") && (
            <DropDownItem
              allData={paymentTypes}
              selectedItem={paymentType}
              setSelectedItem={setPaymentType}
              placeholder="Select Payment Type"
            />
          )}

          {paymentType?.name === "Once-off Payment" && (
            <View style={styles.infoBox}>
              <ThemedText type="defaultSemiBold" style={styles.infoTitle}>Once-off Payment Info:</ThemedText>
              <ThemedText type="tiny" style={styles.infoText}>• Current location tracking only (no history)</ThemedText>
              <ThemedText type="tiny" style={styles.infoText}>• 4 hours access time</ThemedText>
            </View>
          )}

          <Input placeholder="Search users by email" value={searchQuery} onChangeText={setSearchQuery} />

          {searchQuery && (
            <View style={styles.userList}>
              {filteredUsers.map((item) => (
                <TouchableOpacity
                  key={item.uid}
                  style={styles.userItem}
                  onPress={() => {
                    setSelectedUser(item);
                    setSearchQuery(item.email);
                    if (vehicleCategory?.name === "Commercial" && vehicleSubType?.name === "Truck") {
                      fetchUserTrucks();
                    }
                  }}
                >
                  <ThemedText>{item.email}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {selectedUser && (
            <View style={{ marginTop: wp(3) }}>
              <ThemedText style={{ fontWeight: 'bold' }}>Selected: {selectedUser.email}</ThemedText>
              {vehicleCategory?.name === "Commercial" && vehicleSubType?.name === "Truck" && (
                <View>
                  <TouchableOpacity
                    style={[styles.truckButton, { backgroundColor: backgroundLight }]}
                    onPress={() => setShowUserTrucks(!showUserTrucks)}
                  >
                    <ThemedText style={{ color: accent }}>
                      {showUserTrucks ? 'Hide' : 'Show'} Trucks ({userTrucks.length})
                    </ThemedText>
                  </TouchableOpacity>

                  {showUserTrucks && userTrucks.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.truckItem, selectedTruck?.id === item.id && { backgroundColor: `${accent}20` }]}
                      onPress={() => {
                        setSelectedTruck(item);
                        setShowUserTrucks(false);
                      }}
                    >
                      <ThemedText style={{ fontWeight: 'bold' }}>{item.truckType} - {item.truckName}</ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          <View style={{ marginTop: 20 }}>
             <Button title={loading ? "Adding..." : "Add Vehicle"} onPress={handleAddVehicle} disabled={loading} />
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  form: { marginTop: 20, gap: 15 },
  userItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#ccc" },
  userList: { maxHeight: 150, borderWidth: 1, borderColor: "#ccc", borderRadius: 8 },
  truckButton: { padding: wp(2), borderRadius: 8, alignItems: 'center', marginTop: 10 },
  truckItem: { padding: wp(2), borderWidth: 1, borderColor: "#ddd", borderRadius: 8, marginTop: 5 },
  infoBox: { backgroundColor: "#e3f2fd", padding: 12, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: "#2196f3" },
  infoTitle: { marginBottom: 4, color: "#1565c0" },
  infoText: { marginBottom: 2, color: "#37474f" },
});