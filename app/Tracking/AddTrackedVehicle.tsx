import React, { useState, useEffect } from "react";
import { View, Button, Alert, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import ScreenWrapper from "@/components/ScreenWrapper";
import Heading from "@/components/Heading";
import Input from "@/components/Input";
import { addDocument, getUsers } from "@/db/operations";
import { DropDownItem } from "@/components/DropDown";
import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/context/AuthContext";

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
  const { user: salesman } = useAuth();

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
        accessEndAt.setHours(accessEndAt.getHours() + 6); // 6 hours access time
        
        subscriptionData = {
          status: "once_off",
          accessStartAt: accessStartAt.toISOString(),
          accessEndAt: accessEndAt.toISOString(),
          isOnceOff: true,
          restrictToCurrentLocation: true, // No history access
          autoDeleteFromTraccar: true,
        };
      } else {
        // Regular subscription for Personal/Car Dealer
        const trialStartAt = new Date();
        const trialEndAt = new Date(trialStartAt);
        trialEndAt.setDate(trialEndAt.getDate() + 7); // 7 days for non-commercial
        
        subscriptionData = {
          status: "trial",
          trialDays: 7,
          trialStartAt: trialStartAt.toISOString(),
          trialEndAt: trialEndAt.toISOString(),
          nextBillingAt: trialEndAt.toISOString(),
          isTrial: true,
          isOnceOff: false,
        };
      }

      await addDocument("TrackedVehicles", {
        vehicleName,
        imei,
        vehicleCategory: vehicleCategory.name,
        vehicleSubType: vehicleSubType?.name || null,
        paymentType: paymentType?.name || null,
        deviceId,
        customerId: selectedUser.id,
        customerName: selectedUser.displayName,
        customerEmail: selectedUser.email, 
        salesmanId: salesman?.uid,
        salesmanName: salesman?.displayName,
        createdAt: new Date().toISOString(),
        subscription: subscriptionData,
      });

      Alert.alert("Success", "Vehicle added successfully!");
      setVehicleName("");
      setImei("");
      setVehicleCategory(null);
      setVehicleSubType(null);
      setPaymentType(null);
      setSelectedUser(null);
      setSearchQuery("");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to add vehicle.");
      console.error(error);
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
            <ThemedText type="defaultSemiBold" style={styles.infoTitle}>Once-off Payment Info:</ThemedText>
            <ThemedText type="tiny" style={styles.infoText}>• Current location tracking only (no history)</ThemedText>
            <ThemedText type="tiny" style={styles.infoText}>• 6 hours access time</ThemedText>
            <ThemedText type="tiny" style={styles.infoText}>• Vehicle automatically removed from Server after access period</ThemedText>
            <ThemedText type="tiny" style={styles.infoText}>• Can be re-added later</ThemedText>
          </View>
        )}

        <Input
          placeholder="Search user by email..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {searchQuery.length > 0 && (
          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.userItem}
                onPress={() => {
                  setSelectedUser(item);
                  setSearchQuery(item.email);
                }}
              >
                <ThemedText>{item.email}</ThemedText>
              </TouchableOpacity>
            )}
          />
        )}

        {selectedUser && (
          <ThemedText type="italic">Selected User: {selectedUser.email}</ThemedText>
        )}

        <Button
          title={loading ? "Adding..." : "Add Vehicle"}
          onPress={handleAddVehicle}
          disabled={loading}
        />
      </View>
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
    borderBottomColor: "#eee",
  },
  infoBox: {
    backgroundColor: "#f0f8ff",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#007bff",
  },
  infoTitle: {
    marginBottom: 8,
    color: "#007bff",
  },
  infoText: {
    marginBottom: 2,
    color: "#555",
  },
});