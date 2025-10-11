import React, { useState, useEffect } from "react";
import { View, Button, Alert, StyleSheet, FlatList, TouchableOpacity, ScrollView } from "react-native";
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
  const [vehicleCategory, setVehicleCategory] = useState<{ id: number, name: string } | null>(null);
  const [vehicleSubType, setVehicleSubType] = useState<{ id: number, name: string } | null>(null);
  const [paymentType, setPaymentType] = useState<{ id: number, name: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userTrucks, setUserTrucks] = useState<any[]>([]);
  const [selectedTruck, setSelectedTruck] = useState<any | null>(null);
  const [showUserTrucks, setShowUserTrucks] = useState(false);
  const { user: salesman } = useAuth();
  const accent = useThemeColor('accent');
  const backgroundLight = useThemeColor('backgroundLight');

  // Vehicle categories
  const vehicleCategories = [
    { id: 1, name: "Commercial" },
    { id: 2, name: "Personal" },
    { id: 3, name: "Car Dealer" }
  ];

  // Commercial vehicle sub-types
  const commercialSubTypes = [
    { id: 1, name: "Truck" },
    { id: 2, name: "Kombi" },
    { id: 3, name: "Van" },
    { id: 4, name: "eTaxi (Uber)" },
    { id: 5, name: "Old Model Taxi (General)" }
  ];

  // Payment types for Personal and Car Dealer
  const paymentTypes = [
    { id: 1, name: "Once-off Payment" },
    { id: 2, name: "Subscription" }
  ];

  // Fetch user's trucks when a user is selected
  // Fetch user's trucks when a user is selected
  const fetchUserTrucks = async (userId: string) => {
    try {
      const trucks = await fetchDocuments("Trucks", 50, undefined, [
        where("userId", "==", userId),
        where("isApproved", "==", true),
        where("hasTracker", "==", false) // fetch only trucks without tracker
      ]);
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

  // Reset sub-type when category changes
  useEffect(() => {
    setVehicleSubType(null);
    setPaymentType(null);
  }, [vehicleCategory]);

  const handleAddVehicle = async () => {
    if (!vehicleName || !imei || !selectedUser || !vehicleCategory) {
      Alert.alert("Error", "Please fill in all required fields and select a user.");
      return;
    }

    // Validate commercial vehicle sub-type
    if (vehicleCategory.name === "Commercial" && !vehicleSubType) {
      Alert.alert("Error", "Please select a vehicle sub-type for commercial vehicles.");
      return;
    }

    // Validate payment type for Personal and Car Dealer
    if ((vehicleCategory.name === "Personal" || vehicleCategory.name === "Car Dealer") && !paymentType) {
      Alert.alert("Error", "Please select a payment type.");
      return;
    }

    setLoading(true);

    try {
      const username = "Kelvinyaya8@gmail.com";
      const password = "1zuxl2jn";
      const basicAuth = "Basic " + btoa(`${username}:${password}`);

      const traccarResponse = await fetch(
        "https://server.traccar.org/api/devices",
        {
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
        }
      );

      if (!traccarResponse.ok) {
        const errorBody = await traccarResponse.text();
        console.error("Traccar API Error:", traccarResponse.status, errorBody);
        throw new Error("Failed to add device to Server.");
      }

      const traccarDevice = await traccarResponse.json();
      const deviceId = traccarDevice.id;
      if (!deviceId) throw new Error("Device ID not returned from Server.");

      // Determine subscription type based on category and payment type
      let subscriptionData;
      const isOnceOff = paymentType?.name === "Once-off Payment";
      const isCommercial = vehicleCategory.name === "Commercial";

      if (isCommercial) {
        // Commercial vehicles get standard trial
        const trialStartAt = new Date();
        const trialEndAt = new Date(trialStartAt);
        trialEndAt.setDate(trialEndAt.getDate() + 30);

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
        // Once-off payment: immediate access but with restrictions and auto-deletion
        const accessStartAt = new Date();
        const accessEndAt = new Date(accessStartAt);
        accessEndAt.setHours(accessEndAt.getHours() + 4); // 4 hours access time

        subscriptionData = {
          status: "once_off",
          accessStartAt: accessStartAt.toISOString(),
          accessEndAt: accessEndAt.toISOString(),
          isOnceOff: true,
          restrictToCurrentLocation: true, // No history access
        };
      }

      const vehicleData = {
        vehicleName,
        imei,
        category: vehicleCategory.name,
        subType: vehicleSubType?.name || null,
        paymentType: paymentType?.name || null,
        userId: selectedUser.uid,
        userEmail: selectedUser.email,
        userName: selectedUser.displayName || selectedUser.email,
        salesmanId: salesman?.uid,
        salesmanEmail: salesman?.email,
        createdAt: new Date().toISOString(),
        status: "active",
        deviceId: deviceId,
        // Link to truck if selected
        truckId: selectedTruck?.truckId || null,
        truckDetails: selectedTruck ? {
          truckType: selectedTruck.truckType,
          cargoArea: selectedTruck.cargoArea,
          truckCapacity: selectedTruck.truckCapacity,
          numberPlate: selectedTruck.truckNumberPlate
        } : null,
        // Referral system
        referrerId: selectedUser?.referrerId || null
      };

      const docRef = await addDocument("TrackedVehicles", vehicleData);

      // Update truck tracker status if linked
      if (selectedTruck) {
        await updateDocument("Trucks", selectedTruck.id, {
          hasTracker: true,
          trackerStatus: 'active',
          trackingDeviceId: deviceId,
          trackerImei: imei,
          trackerId: `TRK${Date.now()}`,
          trackerAddedAt: Date.now().toString()
        });
      }

      Alert.alert("Success", "Vehicle added successfully!");

      // Reset form
      setVehicleName("");
      setImei("");
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
          <Input
            placeholder="Vehicle Name"
            value={vehicleName}
            onChangeText={setVehicleName}
          />

          <Input
            placeholder="IMEI ID"
            value={imei}
            onChangeText={setImei}
            keyboardType="number-pad"
          />

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
              <ThemedText type="defaultSemiBold" style={styles.infoTitle}>
                Once-off Payment Info:
              </ThemedText>
              <ThemedText type="tiny" style={styles.infoText}>• Current location tracking only (no history)</ThemedText>
              <ThemedText type="tiny" style={styles.infoText}>• 4 hours access time</ThemedText>
              <ThemedText type="tiny" style={styles.infoText}>• Vehicle automatically removed from Server after access period</ThemedText>
              <ThemedText type="tiny" style={styles.infoText}>• Can be re-added later</ThemedText>
            </View>
          )}

          <Input
            placeholder="Search users by email"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {searchQuery && (
            <View style={styles.userList}>
              {filteredUsers.map((item) => (
                <TouchableOpacity
                  key={item.uid}
                  style={styles.userItem}
                  onPress={() => {
                    setSelectedUser(item);
                    setSearchQuery(item.email);
                    vehicleCategory?.name === "Commercial" &&
                      vehicleSubType?.name === "Truck" &&
                      fetchUserTrucks(item.uid);
                  }}
                >
                  <ThemedText>{item.email}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {selectedUser && (
            <View style={{ marginTop: wp(3) }}>
              <ThemedText style={{ fontWeight: 'bold', marginBottom: wp(2) }}>
                Selected User: {selectedUser.email}
              </ThemedText>

              {vehicleCategory?.name === "Commercial" && vehicleSubType?.name === "Truck" && (
                <View>
                  <TouchableOpacity
                    style={[styles.truckButton, { backgroundColor: backgroundLight }]}
                    onPress={() => setShowUserTrucks(!showUserTrucks)}
                  >
                    <ThemedText style={{ color: accent }}>
                      {showUserTrucks ? 'Hide' : 'Show'} User's Trucks ({userTrucks.length})
                    </ThemedText>
                  </TouchableOpacity>

                  {showUserTrucks && userTrucks.length > 0 && (
                    <View style={{ maxHeight: 200 }}>
                      <ThemedText style={{ marginBottom: wp(1), marginTop: wp(2) }}>
                        Select Truck:
                      </ThemedText>

                      {userTrucks.map((item) => (
                        <TouchableOpacity
                          key={item.id}
                          style={[
                            styles.truckItem,
                            selectedTruck?.id === item.id && { backgroundColor: `${accent}20` },
                          ]}
                          onPress={() => {
                            setSelectedTruck(selectedTruck?.id === item.id ? null : item);
                            setShowUserTrucks(false); // hide trucks list after selection
                          }}
                        >
                          <View>
                            <ThemedText style={{ fontWeight: 'bold' }}>
                              {item.truckType} - {item.cargoArea}
                            </ThemedText>
                            <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>
                              Capacity: {item.truckCapacity} | ID: {item.truckId}
                            </ThemedText>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: wp(1) }}>
                              <View
                                style={[
                                  styles.statusDot,
                                  { backgroundColor: item.hasTracker ? '#51cf66' : '#ff6b6b' },
                                ]}
                              />
                              <ThemedText style={{ fontSize: 11 }}>
                                {item.hasTracker ? 'Has Tracker' : 'No Tracker'}
                              </ThemedText>
                            </View>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {showUserTrucks && userTrucks.length === 0 && (
                    <ThemedText style={{ textAlign: 'center', opacity: 0.7, marginTop: wp(2) }}>
                      No approved trucks found for this user
                    </ThemedText>
                  )}
                </View>
              )}
            </View>
          )}

          <Button
            title={loading ? "Adding..." : "Add Vehicle"}
            onPress={handleAddVehicle}
            disabled={loading}
          />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );

}

const styles = StyleSheet.create({
  form: {
    marginTop: 20,
    gap: 15,
  },
  userItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  userList: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
  },
  truckButton: {
    padding: wp(2),
    borderRadius: 8,
    alignItems: 'center',
  },
  truckItem: {
    padding: wp(2),
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: wp(1),
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: wp(1),
  },
  infoBox: {
    backgroundColor: "#e3f2fd",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#2196f3",
  },
  infoTitle: {
    marginBottom: 4,
    color: "#1565c0", // deep blue for title (strong emphasis, readable)

  },
  infoText: {
    marginBottom: 2,
    color: "#37474f", // blue-gray for text (professional, softer than black)

  },
});