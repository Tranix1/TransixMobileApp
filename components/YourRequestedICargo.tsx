import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, StyleSheet, ScrollView, Linking, } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Ionicons, Octicons } from "@expo/vector-icons";
import { wp } from "@/constants/common";
import Divider from "@/components/Divider";

import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { addDocument, checkDocumentExists, deleteDocument, fetchDocuments, runFirestoreTransaction, setDocuments } from '@/db/operations';


import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const accent = "#6a0c0c";

export const CargoRequested = ({
}: {
}) => {

const coolGray = "#e5e7eb";
  return (
           <ScrollView contentContainerStyle={{ paddingBottom: 40, gap: wp(4) }}>
            <View style={{ borderWidth: 1, borderColor: coolGray, padding: wp(2), borderRadius: wp(4) }}>
              <View style={{ position: 'absolute', top: wp(2.5), right: wp(2), zIndex: 66 }}>
                <MaterialIcons name="verified" size={wp(5)} color="green" />
              </View>

              <ThemedText type="subtitle" style={{ color: '#5a0c0c', textAlign: 'center', marginBottom: wp(2) }}>CHIHOKO LOGISTICS</ThemedText>

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
                  <ThemedText style={{ color: "#222" }}>USD 899 per Tonne</ThemedText>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                  <ThemedText style={{ width: 100, color: "#6a0c0c", fontWeight: "bold" }}>Route</ThemedText>
                  <ThemedText style={{ color: "#222" }}>from Lopansi to Chihoro</ThemedText>
                </View>
              </View>

          

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: wp(2), gap: wp(2) }}>
                <TouchableOpacity style={{ alignItems: "center", justifyContent: 'center', backgroundColor: accent, paddingVertical: wp(2.5), borderRadius: wp(4), flex: 1 }}>
                  <ThemedText style={{ color: 'white' }}>View Truck</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={{ alignItems: "center", justifyContent: 'center', backgroundColor: '', paddingVertical: wp(2.5), borderRadius: wp(4), flex: 1 }}>
                  <ThemedText style={{ color: 'white' }}>View Load</ThemedText>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={{ backgroundColor: 'red', paddingVertical: wp(2), borderRadius: wp(4), marginTop: wp(2), alignItems: 'center' }}>
                <ThemedText style={{ color: 'white' }}>Load Taken</ThemedText>
              </TouchableOpacity>
            </View>
          </ScrollView> );
}
 
 
 
 
 
const styles = StyleSheet.create(
 
{
  // ... (keep your existing styles)
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 6,
  },
  infoLabel: {
    width: 90,
    color: "#444",
    fontWeight: "bold",
    fontSize: 15,
  },
  infoValue: {
    color: "#222",
    fontSize: 15,
    flexShrink: 1,
  },
  actionButton: {
    backgroundColor: "#228B22",
    borderRadius: 8,
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    minWidth: 140,
    alignItems: "center",
  },
  acceptButton: {
    backgroundColor: "#228B22",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginRight: 10,
    alignItems: "center",
    minWidth: 90,
  },
  buttonIsFalse: {
    borderWidth: 1,
    borderColor: '#6a0c0c',
    padding: wp(2),
    borderRadius: wp(4),
    alignItems: 'center',
    flex: 1,
    backgroundColor: "white"
  },
  bttonIsTrue: {
    backgroundColor: 'green',
    padding: wp(2),
    borderRadius: wp(4),
    alignItems: 'center',
    flex: 1
  },
  secondaryButton: {
    backgroundColor: accent,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    alignItems: "center",
    minWidth: 120,
    marginRight: 10,
  },
  denyButton: {
    backgroundColor: "#e53935",
    borderRadius: 25,
    alignSelf: "flex-end",
    marginTop: 10,
    paddingVertical: 7,
    paddingHorizontal: 22,
    alignItems: "center",
    minWidth: 110,
  },
  loadMoreBtn: {
    height: 45,
    backgroundColor: accent,
    margin: 25,
    justifyContent: 'center',
    borderRadius: 25,
    alignItems: "center",
    shadowColor: accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  slctView: {
    height: 45,
    width: 200,
    borderColor: "#6a0c0c",
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },
} ) 