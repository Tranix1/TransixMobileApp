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
  const [deviceType, setDeviceType] = useState<{ id: number, name: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const { user: salesman } = useAuth();

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

  const handleAddVehicle = async () => {
    if (!vehicleName || !imei || !selectedUser) {
      Alert.alert("Error", "Please fill in all fields and select a user.");
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
            category: deviceType?.name,
          }),
        }
      );

      if (!traccarResponse.ok) {
        const errorBody = await traccarResponse.text();
        console.error("Traccar API Error:", traccarResponse.status, errorBody);
        throw new Error("Failed to add device to Traccar.");
      }

      const traccarDevice = await traccarResponse.json();
      const deviceId = traccarDevice.id;
      if (!deviceId) throw new Error("Device ID not returned from Traccar.");

      await addDocument("TrackedVehicles", {
        vehicleName,
        imei,
        deviceType: deviceType?.name,
        deviceId, // Store the Traccar device ID
        customerId: selectedUser.id,
        customerName: selectedUser.email,
        salesmanId: salesman?.uid,
        salesmanName: salesman?.displayName,
      });

      Alert.alert("Success", "Vehicle added successfully!");
      setVehicleName("");
      setImei("");
      setDeviceType(null);
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
          allData={[{ id: 1, name: "FMB 920" }, { id: 2, name: "FMC 920" }]}
          selectedItem={deviceType}
          setSelectedItem={setDeviceType}
          placeholder="Select Truck Type"
        />

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
});