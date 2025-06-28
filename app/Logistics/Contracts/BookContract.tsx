import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet } from "react-native";
import { auth, db } from "../../components/config/fireBase";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Feather, Ionicons } from "@expo/vector-icons";
import { collection, serverTimestamp, addDoc, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { Truck } from "@/types/types";
import { toggleItemById } from "@/Utilities/utils";
import { updateDocument } from "@/db/operations";
import { useLocalSearchParams, router } from "expo-router";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ThemedText } from "@/components/ThemedText";
import { wp, hp } from "@/constants/common";
import Heading from "@/components/Heading";
import ScreenWrapper from "@/components/ScreenWrapper";

function BookLContract({ }) {
  const accent = useThemeColor("accent");
  const coolGray = useThemeColor("coolGray");
  const icon = useThemeColor("icon");
  const background = useThemeColor("background");
  const backgroundColor = useThemeColor("backgroundLight");

  const [bbVerifiedLoadD, setbbVerifiedLoadD] = React.useState<Truck[] | []>([]);
  const { contract } = useLocalSearchParams();
  const Contractitem = JSON.parse(contract as any);

  useEffect(() => {
    try {
      if (auth.currentUser) {
        const userId = auth.currentUser.uid;
        const dataQuery = query(collection(db, "Trucks"), where("userId", "==", userId));
        const unsubscribe = onSnapshot(dataQuery, (snapshot) => {
          const loadedData: Truck[] = [];
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added' || change.type === 'modified') {
              const dataWithId = { id: change.doc.id, ...change.doc.data() } as Truck;
              loadedData.push(dataWithId);
            }
          });
          setbbVerifiedLoadD(loadedData);
        });
        return () => unsubscribe();
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const [truckDetails, setTruckDDsp] = React.useState<{ [key: string]: boolean }>({ ['']: false });
  function togglrTruckDe(itemId: string) {
    toggleItemById(itemId, setTruckDDsp)
    setTruckBuzDDsp({ ['']: false })
    setDriverDDsp({ ['']: false })
  }

  const [truckBuzDe, setTruckBuzDDsp] = React.useState<{ [key: string]: boolean }>({ ['']: false });
  function togglrTruckBuzDe(itemId: string) {
    toggleItemById(itemId, setTruckBuzDDsp)
    setDriverDDsp({ ['']: false })
    setTruckDDsp({ ['']: false })
  }

  const [driverDetails, setDriverDDsp] = React.useState<{ [key: string]: boolean }>({ ['']: false });
  function togglrDriverDe(itemId: string) {
    toggleItemById(itemId, setDriverDDsp)
    setTruckBuzDDsp({ ['']: false })
    setTruckDDsp({ ['']: false })
  }

  type BookJob = {
    id: string;
    truckInfo: Truck;
    trckContractId: string;
    truckContrSt: boolean
    contractId: string
    contractOnwerId: string
    contractName: string
    approvedTrck: boolean
  }

  const [trucksInContract, setTrucksInContract] = React.useState<BookJob[] | []>([])
  useEffect(() => {
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    const dataQuery = query(collection(db, "ContractRequests"));
    const unsubscribe = onSnapshot(dataQuery, (snapshot) => {
      const loadedData: BookJob[] = [];
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added" || change.type === "modified") {
          const dataWithId = {
            id: change.doc.id,
            ...change.doc.data(),
          } as BookJob;
          loadedData.push(dataWithId);
        }
      });
      setTrucksInContract(loadedData);
    });
    return () => unsubscribe();
  }, [setTrucksInContract]);

  const checkExistixtBBDoc = async (trckContractId: string) => {
    const chatsRef = collection(db, 'ContractRequests');
    const chatQuery = query(chatsRef, where('trckContractId', '==', trckContractId), where('alreadyInContract', '==', true));
    const querySnapshot = await getDocs(chatQuery);
    return !querySnapshot.empty;
  };

  let renderElements = bbVerifiedLoadD.map((item) => {
    async function handleSubmitDetails() {
      try {
        if (auth.currentUser) {
          const userId = auth.currentUser.uid
          const existingBBDoc = await checkExistixtBBDoc(`${userId}${Contractitem.contractId}${item.timeStamp}`);
          if (!existingBBDoc) {
            const theCollection = collection(db, "ContractRequests");
            await addDoc(theCollection, {
              truckInfo: item,
              trckContractId: `${userId}contractId ${item.timeStamp}`,
              truckContrSt: true,
              contractId: Contractitem.contractId,
              contractOnwerId: Contractitem.userId,
              contractName: Contractitem.contractName,
              approvedTrck: false,
              alreadyInContract: true,
              timeStamp: serverTimestamp()
            })
            alert('doneee adding')
          } else {
            alert("Truck alreadyy Booked")
          }
        }
      } catch (err) {
        console.error(err)
      }
    }

    return (
      <View
        style={{
          marginBottom: wp(6),
          padding: wp(4),
          backgroundColor: background,
          borderRadius: wp(4),
          borderWidth: 1,
          borderColor: coolGray + "40",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 3,
        }}
        key={item.id}
      >
        {item.imageUrl && (
          <Image source={{ uri: item.imageUrl }} style={{ height: 180, borderRadius: wp(2), marginBottom: wp(2), width: "100%" }} />
        )}

        {trucksInContract.map((scndItem) => {
          function removeFrmContract() {
            updateDocument("ContractRequests", scndItem.id, {
              alreadyInContract: false,
              reasonForLeaving: "hahahah",
              contractId: Contractitem.contractId,
              truckInfo: {
                timestamp: serverTimestamp()
              }
            })
          }
          return (
            <View key={scndItem.id}>
              {(Number(item.timeStamp) === Number(scndItem.truckInfo.timeStamp)) && (
                <View style={{ marginBottom: wp(2) }}>
                  <ThemedText type="defaultSemiBold" style={{ color: accent }}>Truck Is Booked</ThemedText>
                  <TouchableOpacity onPress={removeFrmContract} style={{
                    backgroundColor: "#e53935",
                    borderRadius: wp(2),
                    paddingVertical: wp(2),
                    marginTop: wp(1),
                    alignItems: "center"
                  }}>
                    <ThemedText style={{ color: "#fff" }}>Remove from existing contract</ThemedText>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )
        })}

        <TouchableOpacity onPress={handleSubmitDetails} style={{
          backgroundColor: accent,
          borderRadius: wp(2),
          paddingVertical: wp(2),
          alignItems: "center",
          marginBottom: wp(2)
        }}>
          <ThemedText style={{ color: "#fff", fontWeight: "bold" }}>Select to contract</ThemedText>
        </TouchableOpacity>

        <ThemedText type="subtitle" style={{ color: accent, fontWeight: "bold", fontSize: wp(4.5), marginBottom: wp(1) }}>
          {item.CompanyName}
        </ThemedText>

        <TouchableOpacity
          onPress={() => togglrTruckDe(item.id)}
          style={styles.buttonSelectStyle}
        >
          <ThemedText style={{ color: 'white' }}>Truck Details</ThemedText>
        </TouchableOpacity>
        {truckDetails[item.id] && (
          <View style={{ marginTop: wp(2) }}>
            <View style={{ flexDirection: 'row', marginBottom: wp(1) }}>
              <ThemedText style={{ width: 100, color: icon }}>Trailer Type</ThemedText>
              <ThemedText>: {item.cargoArea}</ThemedText>
            </View>
            <ScrollView horizontal style={{ marginVertical: wp(2) }}>
              {item.truckBookImage && (
                <View style={{ marginRight: wp(2) }}>
                  <ThemedText style={{ textAlign: 'center' }}>Truck Image</ThemedText>
                  <Image source={{ uri: item.truckBookImage }} style={{ height: 120, borderRadius: wp(2), width: 180 }} />
                </View>
              )}
              {item.trailerBookF && (
                <View style={{ marginRight: wp(2) }}>
                  <ThemedText style={{ textAlign: 'center' }}>Trailer Book</ThemedText>
                  <Image source={{ uri: item.trailerBookF }} style={{ height: 120, borderRadius: wp(2), width: 180 }} />
                </View>
              )}
              {item.trailerBookSc && (
                <View style={{ marginRight: wp(2) }}>
                  <ThemedText style={{ textAlign: 'center' }}>Second Trailer Book</ThemedText>
                  <Image source={{ uri: item.trailerBookSc }} style={{ height: 120, borderRadius: wp(2), width: 180 }} />
                </View>
              )}
            </ScrollView>
          </View>
        )}

        <TouchableOpacity onPress={() => togglrDriverDe(item.id)} style={styles.buttonStyle}>
          <ThemedText>Driver Details</ThemedText>
        </TouchableOpacity>
        {driverDetails[item.id] && (
          <View style={{ marginTop: wp(2) }}>
            <View style={{ flexDirection: 'row', marginBottom: wp(1) }}>
              <ThemedText style={{ width: 100, color: icon }}>Driver Phone</ThemedText>
              <ThemedText>: {item.driverPhone}</ThemedText>
            </View>
            <ScrollView horizontal>
              {item.driverLicense && (
                <View style={{ marginRight: wp(2) }}>
                  <ThemedText style={{ textAlign: 'center' }}>Driver License</ThemedText>
                  <Image source={{ uri: item.driverLicense }} style={{ height: 120, borderRadius: wp(2), width: 180 }} />
                </View>
              )}
              {item.driverPassport && (
                <View style={{ marginRight: wp(2) }}>
                  <ThemedText style={{ textAlign: 'center' }}>Driver Passport</ThemedText>
                  <Image source={{ uri: item.driverPassport }} style={{ height: 120, borderRadius: wp(2), width: 180 }} />
                </View>
              )}
            </ScrollView>
          </View>
        )}

        <TouchableOpacity onPress={() => togglrTruckBuzDe(item.id)} style={styles.buttonSelectStyle}>
          <ThemedText style={{ color: 'white', fontSize: 17 }}>Business Details</ThemedText>
        </TouchableOpacity>
        {truckBuzDe[item.id] && (
          <View style={{ marginTop: wp(2) }}>
            <View style={{ flexDirection: 'row', marginBottom: wp(1) }}>
              <ThemedText style={{ width: 120, color: icon }}>Owner Phone Number</ThemedText>
              <ThemedText>: {item.ownerPhoneNum}</ThemedText>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: wp(1) }}>
              <ThemedText style={{ width: 120, color: icon }}>Owner Email</ThemedText>
              <ThemedText>: {item.onwerEmail}</ThemedText>
            </View>
          </View>
        )}
      </View>
    )
  })

  return (
    <ScreenWrapper>
      <Heading page={`Book Contract: ${Contractitem.contractName}`} />

      {/* Contract Card */}
      <View style={{
        borderWidth: 1.5,
        borderColor: accent,
        margin: wp(4),
        padding: wp(2),
        borderRadius: wp(4),
        backgroundColor: background,
        shadowColor: accent,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
        marginBottom: wp(2)
      }}>

        <View style={{
          backgroundColor: accent + "20",
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: wp(2),
          marginBottom: wp(2),
          paddingVertical: wp(2)
        }}>
          <ThemedText style={{ color: accent, textAlign: 'center', fontSize: wp(4.5), fontWeight: "bold" }}>
            {Contractitem.companyName || ""}
            {'  '}
            <MaterialIcons name="verified" size={wp(4)} color="green" />
          </ThemedText>
        </View>
        <ThemedText style={{ marginBottom: wp(1), color: icon }}>
          {Contractitem.contractDuration || "9 months contract"}
        </ThemedText>
        <View style={{ marginBottom: wp(0), borderWidth: 1, borderColor: coolGray + "30", borderRadius: wp(2), overflow: 'hidden', padding: wp(2), backgroundColor: backgroundColor }}>
          {/* Vertical Info List */}
          <View style={{ flexDirection: 'column', gap: wp(1) }}>
            <View style={{ flexDirection: 'row', marginBottom: wp(1) }}>
              <ThemedText style={{ width: wp(38), color: icon, fontWeight: 'bold' }}>Name</ThemedText>
              <ThemedText style={{ color: icon }}>{Contractitem.commodity || "Tobacco"}</ThemedText>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: wp(1) }}>
              <ThemedText style={{ width: wp(38), color: icon, fontWeight: 'bold' }}>Country</ThemedText>
              <ThemedText style={{ color: icon }}>{Contractitem.country || "IN Zimbabwe"}</ThemedText>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: wp(1) }}>
              <ThemedText style={{ width: wp(38), color: icon, fontWeight: 'bold' }}>Rate (Above 100KM)</ThemedText>
              <ThemedText style={{ color: icon }}>{Contractitem.rateAbove100 || "--"}</ThemedText>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <ThemedText style={{ width: wp(38), color: icon, fontWeight: 'bold' }}>Rate (Below 100KM)</ThemedText>
              <ThemedText style={{ color: icon }}>{Contractitem.rateBelow100 || "--"}</ThemedText>
            </View>
          </View>
        </View>
      </View>

      {/* Add Button */}
      <TouchableOpacity style={{
        position: 'absolute',
        bottom: hp(6),
        right: wp(4),
        height: wp(10),
        paddingHorizontal: wp(4),
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        zIndex: 200,
        borderRadius: wp(900),
        flexDirection: 'row',
        justifyContent: 'center',
        gap: wp(2),
        alignItems: 'center',
        shadowColor: accent,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
        elevation: 2,
      }}>
        <ThemedText type="defaultSemiBold" style={{ fontSize: wp(5), paddingTop: 3, color: 'green' }}>Add</ThemedText>
        <Feather name="plus" size={wp(7)} color="green" />
      </TouchableOpacity>

      {/* Truck List */}
      <ScrollView contentContainerStyle={{ paddingBottom: wp(10) }}>
        {renderElements}
        <View style={{ height: wp(10) }} />
      </ScrollView>
    </ScreenWrapper>
  )
}
export default React.memo(BookLContract)

const styles = StyleSheet.create({
  buttonStyle: {
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    width: 150,
    marginTop: 10,
    borderWidth: 2,
    borderColor: "#6a0c0c",
    borderRadius: 10
  },
  buttonSelectStyle: {
    backgroundColor: "#6a0c0c",
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    width: 150,
    marginTop: 10,
    borderRadius: 10

  }
});
