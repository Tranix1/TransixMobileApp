import React, { useEffect, useState,ReactElement } from "react";
import { View, TouchableOpacity, StyleSheet, ScrollView, Linking,ToastAndroid } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Ionicons, Octicons } from "@expo/vector-icons";
import { wp } from "@/constants/common";
import Divider from "@/components/Divider";
import { router } from 'expo-router'

import { useThemeColor } from '@/hooks/useThemeColor'
import AlertComponent, { Alertbutton } from "@/components/AlertComponent";
export const RequestedCargo = ({
    item  ,dspRoute
}: {

    item : any
    index : any
separators : any
dspRoute : string

}) => {

    function actuallyRemoveBooking (){

    }

  const textColor = useThemeColor('text')
const coolGray = "#e5e7eb";

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
   
 <View style={{ borderWidth: 1, borderColor: coolGray, padding: wp(2), borderRadius: wp(4) , marginBottom:5 }}>


            {showAlert}
            

                  <ThemedText type="subtitle" style={{ color: textColor, textAlign: 'center', marginBottom: wp(2) }}>{item.companyName}</ThemedText>

              <Divider />
              <View style={{ backgroundColor: "#f4f4f4", borderRadius: 10, padding: wp(2), marginBottom: wp(2) }}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                  <ThemedText style={{ width: 100, color: "#6a0c0c", fontWeight: "bold" }}>Status</ThemedText>
                  <ThemedText style={{ color: "#222" }}>Booked</ThemedText>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                  <ThemedText style={{ width: 100, color: "#6a0c0c", fontWeight: "bold" }}>Commodity</ThemedText>
                  <ThemedText style={{ color: "#222" }}>{item.productName} </ThemedText>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                  <ThemedText style={{ width: 100, color: "#6a0c0c", fontWeight: "bold" }}>Rate {item.model} </ThemedText>
                  <ThemedText style={{ color: "#222" }}> {item.currency} {item.rate}  </ThemedText>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                  <ThemedText style={{ width: 100, color: "#6a0c0c", fontWeight: "bold" }}>Route</ThemedText>
                  <ThemedText style={{ color: "#222" }}>From {item.origin} To {item.destination} </ThemedText>
                </View>

              { (dspRoute === "Bidded Loads"||dspRoute === "Booked Loads") && <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <ThemedText style={{ width: 100, color: "#6a0c0c", fontWeight: "bold" }}>Decision</ThemedText>
                  <View style={{ padding: wp(2), paddingVertical: wp(1), borderRadius: wp(20), backgroundColor: "#737373" }}>
                    <ThemedText type="defaultSemiBold" style={{ color: "#fff" }}>{item.ownerDecision} </ThemedText>
                  </View>
                </View>}
              </View>

              {(dspRoute !== "Bidded Loads"&&dspRoute !== "Booked Loads") &&   <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: wp(2), gap: wp(2) }}>
                <TouchableOpacity style={{ alignItems: "center", justifyContent: 'center', backgroundColor: "#6a0c0c", paddingVertical: wp(2.5), borderRadius: wp(4), flex: 1 }}>
                  <ThemedText style={{ color: 'white' }}>View Truck</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={{ alignItems: "center", justifyContent: 'center', backgroundColor: '#228B22', paddingVertical: wp(2.5), borderRadius: wp(4), flex: 1 }}>
                  <ThemedText style={{ color: 'white' }}>View Load</ThemedText>
                </TouchableOpacity>
              </View>}

              {(dspRoute === "Bidded Loads"||dspRoute === "Booked Loads") && <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: wp(2), gap: wp(2) }}>

                <TouchableOpacity style={{ alignItems: "center", justifyContent: 'center', backgroundColor: '#228B22', paddingVertical: wp(2.5), borderRadius: wp(4), flex: 1 }} onPress={() => router.push({ pathname: "/Logistics/Trucks/TruckDetails", params: { truckid: item.truckId, dspDetails: "true", truckFrContract: 'true' } })}>
                  <ThemedText style={{ color: 'white' }}>View Load</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={{ alignItems: "center", justifyContent: 'center', backgroundColor: "#6a0c0c", paddingVertical: wp(2.5), borderRadius: wp(4), flex: 1 }} onPress={() => router.push({ pathname: "/Logistics/Trucks/TruckDetails", params: { truckid: item.truckId, updateReuestDoc:item.id , expoPushToken : item.expoPushToken ,dspDetails: "true", truckBeingReuested: 'true' } })} >
                  <ThemedText style={{ color: 'white' }}>View Truck</ThemedText>
                </TouchableOpacity>
              </View>}

                  <TouchableOpacity onPress={()=> { 
                    alertBox(
                                            "Delete Truck",
                                            "Are you sure you want to delete this truck?",
                                            [
                                                {
                                                    title: "Delete",
                                                    onPress: async () => {
                                                        try {
                                                            // Add delete logic here
                                                            // deleteDocument('Trucks', truckData.id)
                                                            ToastAndroid.show("Success Truck deleted successfully", ToastAndroid.SHORT);
                                                        } catch (error) {
                                                            alertBox("Error", "Failed to delete truck", [], "error");
                                                        }
                                                    },
                                                },
                                            ],
                                            "destructive"
                                        )}}
                                        
                                        style={{ backgroundColor: '#dc3545', paddingVertical: wp(2), borderRadius: wp(4), marginTop: wp(2), alignItems: 'center' }}>
                {(dspRoute !== "Bidded Loads"&&dspRoute !== "Booked Loads") &&<ThemedText style={{ color: 'white' }}>Load Taken</ThemedText>}
                {(dspRoute === "Bidded Loads"||dspRoute === "Booked Loads") &&<ThemedText style={{ color: 'white' }}>No longer Intrested</ThemedText>}
              </TouchableOpacity>
            </View>
  );
}
 
 
 
 
 
 
