// import {View,Text ,TouchableOpacity }from "react-native"

// export const ErrorOverlay = ({
//   visible,
//   title,
//   errors,
//   onClose,
// }: {
//   visible: boolean;
//   title: string;
//   errors: string[];
//   onClose: () => void;
// }) => {
//   if (!visible) return null;

//   return (
//     <View
//       style={{
//         position: 'absolute',
//         left: 50,
//         right: 50,
//         height: 500,
//         top: 100,
//         backgroundColor: 'white',
//         zIndex: 300,
//         padding: 20,
//       }}
//     >
//       <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>{title}</Text>
//       {errors.map((err, idx) => (
//         <Text key={idx} style={{ color: 'red' }}>
//           {err}
//         </Text>
//       ))}

//       <TouchableOpacity
//         onPress={onClose}
//         style={{
//           marginTop: 15,
//           alignSelf: 'center',
//           backgroundColor: 'green',
//           padding: 5,
//           borderRadius: 5,
//         }}
//       >
//         <Text style={{ color: 'white' }}>Understood</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }
import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, StyleSheet, ScrollView, Linking, } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Ionicons, Octicons } from "@expo/vector-icons";
import { wp } from "@/constants/common";
import Divider from "@/components/Divider";

import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { addDocument, checkDocumentExists, deleteDocument, fetchDocuments, runFirestoreTransaction, setDocuments } from '@/db/operations';



export const RequestedCargo = ({
}: {
}) => {

const coolGray = "#e5e7eb";
  return (
   
 <View style={{ borderWidth: 1, borderColor: coolGray, padding: wp(2), borderRadius: wp(4) , marginBottom:5 }}>
              <View style={{ position: 'absolute', top: wp(2.5), right: wp(2), zIndex: 66 }}>
                <Octicons name="verified" size={wp(5)} color="green" />
              </View>

              <ThemedText type="subtitle" style={{ color: '#5a0c0c', textAlign: 'center', marginBottom: wp(2) }}>Chibuku logistics</ThemedText>

              <Divider />
              <View style={{ backgroundColor: "#f4f4f4", borderRadius: 10, padding: wp(2), marginBottom: wp(2) }}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                  <ThemedText style={{ width: 100, color: "#6a0c0c", fontWeight: "bold" }}>Status</ThemedText>
                  <ThemedText style={{ color: "#222" }}>Booked</ThemedText>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                  <ThemedText style={{ width: 100, color: "#6a0c0c", fontWeight: "bold" }}>Commodity</ThemedText>
                  <ThemedText style={{ color: "#222" }}>Weed</ThemedText>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                  <ThemedText style={{ width: 100, color: "#6a0c0c", fontWeight: "bold" }}>Rate</ThemedText>
                  <ThemedText style={{ color: "#222" }}>USD 300 per Tonne</ThemedText>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                  <ThemedText style={{ width: 100, color: "#6a0c0c", fontWeight: "bold" }}>Route</ThemedText>
                  <ThemedText style={{ color: "#222" }}>from Harare to Kadoma</ThemedText>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <ThemedText style={{ width: 100, color: "#6a0c0c", fontWeight: "bold" }}>Decision</ThemedText>
                  <View style={{ padding: wp(2), paddingVertical: wp(1), borderRadius: wp(20), backgroundColor: "#737373" }}>
                    <ThemedText type="defaultSemiBold" style={{ color: "#fff" }}>Pending</ThemedText>
                  </View>
                </View>
              </View>


             <TouchableOpacity style={{ backgroundColor: 'red', paddingVertical: wp(2), borderRadius: wp(4), marginTop: wp(2), alignItems: 'center' }}>
                  <ThemedText style={{ color: 'white' }}>View Load</ThemedText>
                </TouchableOpacity>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: wp(2), gap: wp(2) }}>
                <TouchableOpacity style={{ alignItems: "center", justifyContent: 'center', backgroundColor: '#228B22', paddingVertical: wp(2.5), borderRadius: wp(4), flex: 1 }}>
                  <ThemedText style={{ color: 'white' }}>Check More Loads </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={{ backgroundColor: '#f25022', alignItems: 'center', paddingVertical: wp(2.5), borderRadius: wp(4), flex: 1 }}>
                  <ThemedText style={{ color: 'white' }}>No longer interested</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
  );
}
 
 
 
 
 
 
