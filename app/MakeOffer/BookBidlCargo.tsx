import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet } from "react-native";
import { auth, db } from "../components/config/fireBase";
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
import { formatCurrency } from '@/services/services'

function BookLContract({ }) {
  const accent = useThemeColor("accent");
  const coolGray = useThemeColor("coolGray");
  const icon = useThemeColor("icon");
  const textColor = useThemeColor('text')
  const background = useThemeColor("background");
  const backgroundColor = useThemeColor("backgroundLight");

  const [bbVerifiedLoadD, setbbVerifiedLoadD] = React.useState<Truck[] | []>([]);
  const { contract } = useLocalSearchParams();
  const Contractitem = JSON.parse(contract as any);

  console.log(Contractitem)

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
    const chatsRef = collection(db, 'LoadsBookings');
    const chatQuery = query(chatsRef, where('requestId', '==', trckContractId), where('alreadyInContract', '==', true));
    const querySnapshot = await getDocs(chatQuery);
    return !querySnapshot.empty;
  };






















  let renderElements = bbVerifiedLoadD.map((item) => {

    async function handleSubmitDetails() {
      try {
        if (auth.currentUser) {
          const userId = auth.currentUser.uid
          const existingBBDoc = await checkExistixtBBDoc(`${userId}${Contractitem.loadId}${item.timeStamp}`);
          if (!existingBBDoc) {
            const theCollection = collection(db, "CargoBookings");
            await addDoc(theCollection, {
              truckInfo: item,
              created_at: Date.now().toString() ,
              requestId: `${userId}${Contractitem.loadId}${item.timeStamp}`,
              cargoId: Contractitem.loadId,
              onwerId: Contractitem.userId,
              productName: Contractitem.typeofLoad,
              origin: Contractitem.origin,
              destination: Contractitem.destination,
              rate: Contractitem.rate,
              currency: Contractitem.currency,
              model: Contractitem.model,
              ownerDecision: null,
              status : "Booked" ,
              // contractName: Contractitem.contractName,

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
        style={styles.cardContainer}
        key={item.id}
      >
        {/* Main Image */}
        {item.imageUrl && (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.mainImage}
          />
        )}

        {/* Contract Status */}
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
                <View style={styles.contractStatusContainer}>
                  <ThemedText type="defaultSemiBold" style={[styles.contractStatusText, { color: accent }]}>
                    Truck Is Booked
                  </ThemedText>
                  <TouchableOpacity
                    onPress={removeFrmContract}
                    style={styles.removeContractButton}
                  >
                    <ThemedText style={styles.buttonTextWhite}>
                      Remove from existing contract
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )
        })}

        {/* Select Button */}
        <TouchableOpacity
          onPress={handleSubmitDetails}
          style={[styles.primaryButton, { backgroundColor: accent }]}
        >
          <ThemedText style={styles.buttonTextWhiteBold}>
            Assign to Load
          </ThemedText>
        </TouchableOpacity>

        {/* Company Name */}
        <ThemedText type="subtitle" style={[styles.companyName, { color: accent }]}>
          {item.CompanyName}
        </ThemedText>

        {/* Truck Details Section */}
        <View style={styles.detailsSection}>
          <TouchableOpacity
            onPress={() => togglrTruckDe(item.id)}
            style={[styles.secondaryButton, { backgroundColor: accent }]}
          >
            <ThemedText style={styles.buttonTextWhite}>Truck Details</ThemedText>
          </TouchableOpacity>

          {truckDetails[item.id] && (
            <View style={styles.detailsContent}>
              <View style={styles.detailRow}>
                <ThemedText style={[styles.detailLabel, { color: icon }]}>Trailer Type</ThemedText>
                <ThemedText style={styles.detailValue}>: {item.cargoArea}</ThemedText>
              </View>

              <ScrollView
                horizontal
                style={styles.horizontalScroll}
                showsHorizontalScrollIndicator={false}
              >
                {item.truckBookImage && (
                  <View style={styles.imageContainer}>
                    <ThemedText style={styles.imageLabel}>Truck Image</ThemedText>
                    <Image
                      source={{ uri: item.truckBookImage }}
                      style={styles.detailImage}
                    />
                  </View>
                )}
                {item.trailerBookF && (
                  <View style={styles.imageContainer}>
                    <ThemedText style={styles.imageLabel}>Trailer Book</ThemedText>
                    <Image
                      source={{ uri: item.trailerBookF }}
                      style={styles.detailImage}
                    />
                  </View>
                )}
                {item.trailerBookSc && (
                  <View style={styles.imageContainer}>
                    <ThemedText style={styles.imageLabel}>Second Trailer Book</ThemedText>
                    <Image
                      source={{ uri: item.trailerBookSc }}
                      style={styles.detailImage}
                    />
                  </View>
                )}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Driver Details Section */}
        <View style={styles.detailsSection}>
          <TouchableOpacity
            onPress={() => togglrDriverDe(item.id)}
            style={[styles.outlineButton, { borderColor: accent }]}
          >
            <ThemedText style={[styles.buttonTextDark, { color: accent }]}>Driver Details</ThemedText>
          </TouchableOpacity>

          {driverDetails[item.id] && (
            <View style={styles.detailsContent}>
              <View style={styles.detailRow}>
                <ThemedText style={[styles.detailLabel, { color: icon }]}>Driver Phone</ThemedText>
                <ThemedText style={styles.detailValue}>: {item.driverPhone}</ThemedText>
              </View>

              <ScrollView
                horizontal
                style={styles.horizontalScroll}
                showsHorizontalScrollIndicator={false}
              >
                {item.driverLicense && (
                  <View style={styles.imageContainer}>
                    <ThemedText style={styles.imageLabel}>Driver License</ThemedText>
                    <Image
                      source={{ uri: item.driverLicense }}
                      style={styles.detailImage}
                    />
                  </View>
                )}
                {item.driverPassport && (
                  <View style={styles.imageContainer}>
                    <ThemedText style={styles.imageLabel}>Driver Passport</ThemedText>
                    <Image
                      source={{ uri: item.driverPassport }}
                      style={styles.detailImage}
                    />
                  </View>
                )}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Business Details Section */}
        <View style={styles.detailsSection}>
          <TouchableOpacity
            onPress={() => togglrTruckBuzDe(item.id)}
            style={[styles.secondaryButton, { backgroundColor: accent }]}
          >
            <ThemedText style={styles.buttonTextWhite}>Business Details</ThemedText>
          </TouchableOpacity>

          {truckBuzDe[item.id] && (
            <View style={styles.detailsContent}>
              <View style={styles.detailRow}>
                <ThemedText style={[styles.detailLabel, { color: icon }]}>Owner Phone Number</ThemedText>
                <ThemedText style={styles.detailValue}>: {item.ownerPhoneNum}</ThemedText>
              </View>
              <View style={styles.detailRow}>
                <ThemedText style={[styles.detailLabel, { color: icon }]}>Owner Email</ThemedText>
                <ThemedText style={styles.detailValue}>: {item.onwerEmail}</ThemedText>
              </View>
            </View>
          )}
        </View>
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


        <View style={{ marginBottom: wp(0), borderWidth: 1, borderColor: coolGray + "30", borderRadius: wp(2), overflow: 'hidden', padding: wp(2), backgroundColor: backgroundColor }}>
          {/* Vertical Info List */}
          <View style={{ flexDirection: 'column', gap: wp(1) }}>
            <View style={{ flexDirection: 'row', marginBottom: wp(1) }}>
              <ThemedText style={{ width: wp(38), color: icon, fontWeight: 'bold' }}>Product</ThemedText>
              <ThemedText >{Contractitem.typeofLoad || "Tobacco"}</ThemedText>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: wp(1) }}>

              <ThemedText style={{ width: wp(38), color: icon, fontWeight: 'bold' }}>Rate {Contractitem.model} </ThemedText>
              <ThemedText   >{Contractitem.currency} {formatCurrency(Contractitem.rate)}</ThemedText>
            </View>

            <View style={{ flexDirection: 'row', marginBottom: wp(1) }}>

              <ThemedText style={{ width: wp(38), color: icon, fontWeight: 'bold' }}>Origin</ThemedText>
              <ThemedText   >{Contractitem.location}</ThemedText>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: wp(1) }}>

              <ThemedText style={{ width: wp(38), color: icon, fontWeight: 'bold' }}>Destination</ThemedText>
              <ThemedText   >{Contractitem.destination}</ThemedText>
            </View>


          </View>
        </View>
      </View>

      {/* Add Button */}
      <TouchableOpacity style={{
        position: 'absolute',
        bottom: hp(4),
        right: wp(4),
        padding: wp(2),
        backgroundColor: accent,
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
      }}
        onPress={() => router.push("/Logistics/Trucks/AddTrucks")}
      >
        <Feather name="plus" size={wp(7)} color="#fff" />
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

  },
  cardContainer: {
    marginBottom: wp(6),
    padding: wp(4),
    borderRadius: wp(4),
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  mainImage: {
    height: 180,
    borderRadius: wp(2),
    marginBottom: wp(2),
    width: "100%",
  },
  contractStatusContainer: {
    marginBottom: wp(2),
  },
  contractStatusText: {
    fontSize: wp(4),
  },
  removeContractButton: {
    backgroundColor: "#e53935",
    borderRadius: wp(2),
    paddingVertical: wp(2),
    marginTop: wp(1),
    alignItems: "center"
  },
  primaryButton: {
    borderRadius: wp(2),
    paddingVertical: wp(2),
    alignItems: "center",
    marginBottom: wp(2)
  },
  secondaryButton: {
    borderRadius: wp(2),
    paddingVertical: wp(2),
    alignItems: "center",
    marginBottom: wp(1)
  },
  outlineButton: {
    borderWidth: 1,
    borderRadius: wp(2),
    paddingVertical: wp(2),
    alignItems: "center",
    marginBottom: wp(1),
    backgroundColor: 'transparent'
  },
  companyName: {
    fontWeight: "bold",
    fontSize: wp(4.5),
    marginBottom: wp(1)
  },
  detailsSection: {
    marginTop: wp(2),
  },
  detailsContent: {
    marginTop: wp(2),
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: wp(1),
    alignItems: 'center'
  },
  detailLabel: {
    width: wp(25),
    fontWeight: '600'
  },
  detailValue: {
    flex: 1,
    color: '#333'
  },
  horizontalScroll: {
    marginVertical: wp(2),
  },
  imageContainer: {
    marginRight: wp(2),
    alignItems: 'center'
  },
  imageLabel: {
    textAlign: 'center',
    marginBottom: wp(1),
    fontSize: wp(3.5)
  },
  detailImage: {
    height: 120,
    borderRadius: wp(2),
    width: 180,
    resizeMode: 'cover'
  },
  buttonTextWhite: {
    color: '#fff',
    fontSize: wp(4)
  },
  buttonTextWhiteBold: {
    color: '#fff',
    fontWeight: "bold",
    fontSize: wp(4)
  },
  buttonTextDark: {
    fontSize: wp(4)
  }
});
