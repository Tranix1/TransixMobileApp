import React, { useState } from "react";
import { View, Button, Alert, StyleSheet } from "react-native";
import ScreenWrapper from "@/components/ScreenWrapper";
import Heading from "@/components/Heading";
import Input from "@/components/Input";
import { addDocument } from "@/db/operations";
import { Picker } from "@react-native-picker/picker";
import { DropDownItem } from "@/components/DropDown";
export default function AddTrackedVehicle() {
  const [vehicleName, setVehicleName] = useState("");
  const [imei, setImei] = useState("");
  const [deviceType, setDeviceType] = useState  <{ id: number, name: string } | null>  (null);
  const [loading, setLoading] = useState(false);

  const handleAddVehicle = async () => {
    if (!vehicleName || !imei) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Post to Traccar
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
            category: deviceType,
          }),
        }
      );

      if (!traccarResponse.ok) {
        throw new Error("Failed to add device to Traccar.");
      }

      const traccarDevice = await traccarResponse.json();
      const deviceId = traccarDevice.id;
      if (!deviceId) throw new Error("Device ID not returned from Traccar.");

      // 2️⃣ Save to Firebase
      await addDocument("TrackedVehicles", {
        vehicleName,
        imei,
        deviceType,
        deviceId, // Store the Traccar device ID
      });

      Alert.alert("Success", "Vehicle added successfully!");
      setVehicleName("");
      setImei("");
      setDeviceType(null);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to add vehicle.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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
  allData={[ {id :1 , name:"FMB 920"},{id :2 , name:"FMC 920"} ]}
  selectedItem={deviceType}
  setSelectedItem={setDeviceType}
  placeholder="Select Truck Type"
/>
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
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    overflow: "hidden",
  },
});
