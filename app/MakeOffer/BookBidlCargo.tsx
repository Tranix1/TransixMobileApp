import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ToastAndroid, Alert, TextInput } from "react-native";
import { Image } from 'expo-image'

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { auth, db } from "@/db/fireBaseConfig";
import { addDocument, runFirestoreTransaction, checkDocumentExists, setDocuments, readById } from "@/db/operations";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Feather, Ionicons } from "@expo/vector-icons";
import { collection, serverTimestamp, query, where, onSnapshot, getDocs } from 'firebase/firestore';
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
import { usePushNotifications, sendPushNotification, sendBookingWithTrackerNotification } from "@/Utilities/pushNotification";
import { useAuth } from "@/context/AuthContext";

function BookLCargo({ }) {
  const { bottom } = useSafeAreaInsets();
  const accent = useThemeColor("accent");
  const coolGray = useThemeColor("coolGray");
  const icon = useThemeColor("icon");
  const textColor = useThemeColor('text')
  const background = useThemeColor("background");
  const backgroundColor = useThemeColor("backgroundLight");
  const { expoPushToken } = usePushNotifications();
  const [bbVerifiedLoadD, setbbVerifiedLoadD] = React.useState<any[] | []>([]);
  const { cargo, contract, bidRate, OperationType } = useLocalSearchParams();
  const loadItem = JSON.parse((cargo || contract) as any);


  const { currentRole, user } = useAuth();
  // where("approvalStatus", "==", "approved"), where("state", "==", "available"),

  useEffect(() => {
    try {
      if (auth.currentUser) {
        const userId = auth.currentUser.uid;
        const dataQuery = query(collection(db, `fleets/${currentRole.fleetId}/Trucks`),);
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

  // ---- Drivers, fetched the same way as Trucks. Typed any for now, tighten later. ----
  const [allDrivers, setAllDrivers] = React.useState<any[]>([]);
  useEffect(() => {
    try {
      if (auth.currentUser) {
        const dataQuery = query(collection(db, `fleets/${currentRole.fleetId}/Drivers`));
        const unsubscribe = onSnapshot(dataQuery, (snapshot) => {
          setAllDrivers((prev) => {
            const map = new Map(prev.map((d) => [d.id, d]));
            snapshot.docChanges().forEach((change) => {
              if (change.type === 'added' || change.type === 'modified') {
                map.set(change.doc.id, { id: change.doc.id, ...change.doc.data() });
              }
              if (change.type === 'removed') {
                map.delete(change.doc.id);
              }
            });
            return Array.from(map.values());
          });
        });
        return () => unsubscribe();
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Per-truck driver search text and the driver currently selected for that truck.
  const [driverSearchText, setDriverSearchText] = React.useState<{ [truckId: string]: string }>({});
  const [selectedDrivers, setSelectedDrivers] = React.useState<{ [truckId: string]: any }>({});

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

  const [bidAmount, setBidAmount] = React.useState<string>(
    loadItem.rate ? String(loadItem.rate) : ''
  );
  const [isEditingBid, setIsEditingBid] = React.useState(true);

  type BookJob = {
    id: string;
    truckInfo: Truck;
    trckCargoId: string;
    truckContrSt: boolean
    cargoId: string
    cargoOwnerId: string
    cargoName: string
    approvedTrck: boolean
  }

  const [trucksRequested, setTrucksRequested] = React.useState<BookJob[] | []>([])
  useEffect(() => {
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    const dataQuery = query(collection(db, "CargoRequests"));
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
      setTrucksRequested(loadedData);
    });
    return () => unsubscribe();
  }, [setTrucksRequested]);

  const checkExistixtBBDoc = async (trckCargoId: string) => {
    const chatsRef = collection(db, "cargoRequests");
    const chatQuery = query(chatsRef, where('requestId', '==', trckCargoId), where('alreadyInRequested', '==', true));
    const querySnapshot = await getDocs(chatQuery);
    return !querySnapshot.empty;
  };



  let renderElements = bbVerifiedLoadD.map((item) => {


    console.log(item.organizationDetails)





    async function handleSubmitDetails() {
      try {
        if (auth.currentUser) {
          const userId = auth.currentUser.uid

          const selectedDriver = selectedDrivers[item.id];
          if (!selectedDriver) {
            ToastAndroid.show("Select a driver for this truck first", ToastAndroid.SHORT);
            return;
          }

          // NEW: require a valid bid amount when bidding
          if (OperationType === "Bid" && (!bidAmount || isNaN(Number(bidAmount)) || Number(bidAmount) <= 0)) {
            ToastAndroid.show("Enter a valid bid rate first", ToastAndroid.SHORT);
            return;
          }

          const existingBBDoc = await checkExistixtBBDoc(`${userId}${loadItem.id}${item.timeStamp}`);

          const truckData = await readById(`fleets/${currentRole.fleetId}/Trucks`, item.id) as any;
          const hasTracker = truckData?.hasTracker;
          const trackerStatus = truckData?.trackerStatus;
          const trackingDeviceId = truckData?.trackingDeviceId;

          if (!existingBBDoc) {
            const theData = {
              requestStatus: "PENDING",
              created_at: Date.now().toString(),
              requestId: `${userId}${loadItem.id}${item.timeStamp}`,
              cargoId: loadItem.id,
              companyName: loadItem.companyName,
              onwerId: loadItem.userId,
              productName: loadItem.typeofLoad,
              // CHANGED: use the typed bid amount when bidding, otherwise the posted rate
              ownerDecision: "Pending",
              // CHANGED: status now driven by OperationType, not a bidRate param
              status: OperationType === "Bid" ? "Bidded" : "Booked",
              loadId: loadItem.id,
              approvedTrck: false,
              alreadyInRequested: true,
              expoPushToken: expoPushToken || null,
              trackerShared: false,
              trackerSharingRequested: false,
              loadOwnerId: loadItem.userId,


              bookedBy: {
                userId: user?.uid || "unknown",
                name: user?.displayName || "unknown",
                role: currentRole?.userRole || "unknown",
                phone: user?.phoneNumber || "unknown",
                email: user?.email || "unknown",
                addedAt: Date.now().toString(),
              },
              driverDetails: {
                driverId: selectedDriver.id,
                driverName: selectedDriver.fullName || null,
                driverPhoneNumber: selectedDriver.phoneNumber || null,
                driverEmail: selectedDriver.email || null,
                driverLicenseNumber: selectedDriver.licenseNumber || null

              },

              fleetDetails: item.organizationDetails ?? null,
              truckDetails: {
                truckId: item.id,
                truckType: item.truckType || null,
                truckCapacity: item.truckCapacity || null,
                cargoArea: item.cargoArea || null,
                locations: item.locations || [],
                trackingDeviceId: (item as any).trackingDeviceId || null,
                trackerStatus: trackerStatus,
                truckHasTracker: hasTracker,

                numberPlate: item.numberPlate || null,
                truckName: item.truckName,

              },

              loadItemDetails: {
                loadId: loadItem.id,
                contact: loadItem.contact || null,
                companyName: loadItem.companyName || null,
                productName: loadItem.typeofLoad || null,
                origin: loadItem.origin || null,
                originFull: loadItem.originFull || null,
                destination: loadItem.destination || null,
                destinationFull: loadItem.destinationFull || null,
                originCoordinates: loadItem.originCoordinates || null,
                destinationCoordinates: loadItem.destinationCoordinates || null,
                rate: OperationType === "Bid" ? Number(bidAmount) : loadItem.rate,
                currency: loadItem.currency || null,
                model: loadItem.model || null,
                paymentTerms: loadItem.paymentTerms || null,
                loadingDate: loadItem.loadingDate || null,
                deliveryDate: loadItem.deliveryDate || null,
                accType: loadItem.accType,
                userRole: loadItem.userRole,
                organizationId: loadItem.organizationId,
                shipper: loadItem.shipper,
                organizationDetails: loadItem.organizationDetails,
                postedBy: loadItem.postedBy ?? null,
                routePolyline: loadItem.routePolyline || null,
                bounds: loadItem.bounds || null,
                distance: loadItem.distance || null,
                duration: loadItem.duration || null,
              },


              timeStamp: serverTimestamp(),

            }
            addDocument("cargoRequests", theData)

            if (loadItem.expoPushToken) {
              await sendBookingWithTrackerNotification(
                loadItem.expoPushToken,
                truckData?.ownerName || "Truck Owner",
                `${loadItem.origin} to ${loadItem.destination}`,
                hasTracker && trackerStatus === 'active' && trackingDeviceId,
                theData.requestId
              );
            } else {
              console.warn('⚠️ No expoPushToken found in loadItem, skipping notification');
            }

            const existingBBDoc2 = await checkDocumentExists("newIterms", [where('receriverId', '==', userId)]);
            let newBiddedDoc = 0
            let newBOOKEDDoc = 0

            if (!existingBBDoc2) {
              setDocuments("bidBookingStats", {
                bookingdocs: newBOOKEDDoc,
                biddingdocs: newBiddedDoc,
                timestamp: serverTimestamp(),
                receriverId: item.userId,
              })
            } else {
              await runFirestoreTransaction(`bidBookingStats/${userId}`, (data) => {
                const currentBiddingDocs = data?.biddingdocs || 0;
                const currentBookingsDocs = data?.bookingdocs || 0;
                return {};
              });
            }

            // CHANGED: message now driven by OperationType
            ToastAndroid.show(`Load ${OperationType === "Bid" ? "BIDDING" : "BOOKING"} completed successfully.`, ToastAndroid.SHORT);

          } else {
            alert("Truck alreadyy Booked")
          }
        }
      } catch (err) {
        console.error(err)
      }
    }

    // Drivers filtered for this specific truck's search box
    const filteredDriversForTruck = allDrivers.filter((driver) => {
      const term = (driverSearchText[item.id] || '').trim().toLowerCase();
      if (!term) return true;
      return (driver.fullName || '').toLowerCase().includes(term);
    });
    const selectedDriverForTruck = selectedDrivers[item.id];

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



        {trucksRequested.map((scndItem) => {
          function removeFrmRequest() {
            updateDocument("cargoRequests", scndItem.id, {
              alreadyInRequested: false,
              reasonForLeaving: "hahahah",
              cargoId: loadItem.id,
              truckInfo: {
                timestamp: serverTimestamp()
              }
            })
          }
          return (
            <View key={scndItem.id}>
              {(Number(item.timeStamp) === Number(scndItem.truckInfo.timeStamp)) && (
                <View style={styles.cargoStatusContainer}>
                  <ThemedText type="defaultSemiBold" style={[styles.cargoStatusText, { color: accent }]}>
                    Truck Is Booked
                  </ThemedText>
                  <TouchableOpacity
                    onPress={removeFrmRequest}
                    style={styles.removeRequestButton}
                  >
                    <ThemedText style={styles.buttonTextWhite}>
                      Remove from existing Requested cargo
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )
        })}

        {/* Company Name */}
        <ThemedText type="subtitle" style={[styles.companyName, { color: accent }]}>
          {item.CompanyName}
        </ThemedText>

        {/* Truck Details Section */}
        <View style={styles.detailsSection}>


          <View style={styles.detailsContent}>
            <View style={{ flexDirection: 'row', gap: wp(2), alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <ThemedText type="tiny" style={{}}>
                  Truck Type
                </ThemedText>
                <ThemedText type="subtitle" style={{}}>
                  {item.truckType || '--'}
                </ThemedText>
              </View>
              <ThemedText type="subtitle" color="#1E90FF" >|</ThemedText>
              <View style={{ flex: 1 }}>
                <ThemedText type="tiny" style={{}}>
                  Cargo Area:
                </ThemedText>
                <ThemedText type="subtitle" style={{}}>
                  {item.cargoArea !== "Other" ? item.cargoArea : item.otherCargoArea}
                </ThemedText>
              </View>

            </View>


            <View style={{ flexDirection: 'row', gap: wp(2), alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <ThemedText type="tiny" style={{}}>
                  Maximum Load Capacity
                </ThemedText>
                <ThemedText type="subtitle" style={{}}>
                  {item.maxloadCapacity || '--'}t
                </ThemedText>
              </View>
              <ThemedText type="subtitle" color="#1E90FF" >|</ThemedText>
              <View style={{ flex: 1 }}>
                <ThemedText type="tiny" style={{}}>
                  Capacity:
                </ThemedText>
                <ThemedText type="subtitle" style={{}}>
                  {item.truckCapacity || '--'}t
                </ThemedText>
              </View>

            </View>


            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1 }}>
                <ThemedText type="tiny" style={{}}>
                  Operation Country{item.locations?.length > 1 ? 's' : ''}
                </ThemedText>
                <ThemedText type="subtitle" style={{ marginBottom: wp(4) }}>
                  {item.locations?.join(', ') || '--'}
                </ThemedText>
              </View>

            </View>

            {/* ---- Driver search + select, nested under this truck ---- */}
            <View style={{ marginTop: wp(2) }}>
              <ThemedText type="tiny" style={{ marginBottom: wp(1) }}>
                Assign Driver
              </ThemedText>
              <TextInput
                value={driverSearchText[item.id] || ''}
                onChangeText={(text) => setDriverSearchText((prev) => ({ ...prev, [item.id]: text }))}
                placeholder="Search driver by name"
                placeholderTextColor={coolGray}
                style={[styles.driverSearchInput, { borderColor: coolGray, color: icon }]}
              />

              {selectedDriverForTruck && (
                <ThemedText style={{ color: accent, marginTop: wp(1), fontWeight: '600' }}>
                  Selected: {selectedDriverForTruck.fullName || '--'}
                </ThemedText>
              )}

              <View style={{ maxHeight: hp(22), marginTop: wp(1) }}>
                <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="always">
                  {filteredDriversForTruck.map((driver) => {
                    const isSelected = selectedDriverForTruck?.id === driver.id;
                    return (
                      <TouchableOpacity
                        key={driver.id}
                        onPress={() =>
                          setSelectedDrivers((prev) => ({
                            ...prev,
                            [item.id]: isSelected ? null : driver,
                          }))
                        }
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          padding: wp(2),
                          marginVertical: wp(1),
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: isSelected ? accent : '#E0E0E0',
                          backgroundColor: backgroundColor,
                        }}
                      >
                        <Ionicons
                          name={isSelected ? "checkbox" : "square-outline"}
                          size={18}
                          color={isSelected ? accent : '#666'}
                          style={{ marginRight: wp(2) }}
                        />
                        <View style={{ flex: 1 }}>
                          <ThemedText style={{ fontWeight: '600' }}>{driver.fullName || '--'}</ThemedText>
                          {!!driver.phoneNumber && (
                            <ThemedText style={{ fontSize: 12, color: '#666' }}>{driver.phoneNumber}</ThemedText>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>

          </View>


        </View>

        {/* Select Button — now submits truck + driver as one request */}
        <TouchableOpacity
          onPress={handleSubmitDetails}
          style={[styles.primaryButton, { backgroundColor: accent }]}
        >
          <ThemedText style={styles.buttonTextWhiteBold}>
            Assign to Load
          </ThemedText>
        </TouchableOpacity>



        {/* Business Details Section */}
        {currentRole.accType === "brokerage" && <View style={styles.detailsSection}>
          <TouchableOpacity
            onPress={() => togglrTruckBuzDe(item.id)}
            style={[styles.secondaryButton, { borderColor: accent }]}
          >
            <ThemedText color={accent}>Business Details</ThemedText>
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
        </View>}


      </View>



    )
  })


  return (
    <ScreenWrapper>
      <Heading page={`${OperationType} Cargo: ${loadItem.typeofLoad}`} />

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
            {loadItem.companyName || ""}
            {'  '}
            <MaterialIcons name="verified" size={wp(4)} color="green" />
          </ThemedText>
        </View>


        <View style={{ marginBottom: wp(0), borderWidth: 1, borderColor: coolGray + "30", borderRadius: wp(2), overflow: 'hidden', padding: wp(2), backgroundColor: backgroundColor }}>
          {/* Vertical Info List */}
          <View style={{ flexDirection: 'column', gap: wp(1) }}>
            <View style={{ flexDirection: 'row', marginBottom: wp(1) }}>
              <ThemedText style={{ width: wp(38), color: icon, fontWeight: 'bold' }}>Product</ThemedText>
              <ThemedText >{loadItem.typeofLoad || "Tobacco"}</ThemedText>
            </View>





            <View style={{ flexDirection: 'row', marginBottom: wp(1), alignItems: 'center' }}>
              <ThemedText style={{ width: wp(38), color: icon, fontWeight: 'bold' }}>Rate {loadItem.model} </ThemedText>

              {OperationType === "Bid" ? (
                isEditingBid ? (
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: wp(1) }}>
                    <ThemedText>{loadItem.currency}</ThemedText>
                    <TextInput
                      value={bidAmount}
                      onChangeText={setBidAmount}
                      keyboardType="numeric"
                      placeholder="Enter your rate"
                      placeholderTextColor={coolGray}
                      autoFocus
                      onBlur={() => setIsEditingBid(false)}
                      onSubmitEditing={() => setIsEditingBid(false)}
                      style={{
                        flex: 1,
                        borderBottomWidth: 1,
                        borderColor: accent,
                        color: textColor,
                        paddingVertical: 2,
                        fontSize: wp(4),
                      }}
                    />
                    <MaterialIcons name="check" size={wp(5)} color={accent} onPress={() => setIsEditingBid(false)} />
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => setIsEditingBid(true)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: wp(1) }}
                  >
                    <ThemedText style={{ color: bidAmount ? textColor : coolGray }}>
                      {loadItem.currency} {bidAmount ? formatCurrency(Number(bidAmount)) : "Tap to enter rate"}
                    </ThemedText>
                    <Feather name="chevron-right" size={wp(4)} color={accent} />
                  </TouchableOpacity>
                )
              ) : (
                <ThemedText>{loadItem.currency} {formatCurrency(loadItem.rate)}</ThemedText>
              )}
            </View>



            <View style={{ flexDirection: 'row', marginBottom: wp(1) }}>

              <ThemedText style={{ width: wp(38), color: icon, fontWeight: 'bold' }}>Origin</ThemedText>
              <ThemedText   >{loadItem.origin}</ThemedText>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: wp(1) }}>

              <ThemedText style={{ width: wp(38), color: icon, fontWeight: 'bold' }}>Destination</ThemedText>
              <ThemedText   >{loadItem.destination}</ThemedText>
            </View>


          </View>
        </View>
      </View>



      x


      {/* Add Button */}
      <TouchableOpacity style={{
        position: 'absolute',
        bottom: hp(4) + bottom,
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
export default React.memo(BookLCargo)

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
  cargoStatusContainer: {
    marginBottom: wp(2),
  },
  cargoStatusText: {
    fontSize: wp(4),
  },
  removeRequestButton: {
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
    marginBottom: wp(2),
    marginTop: wp(2)
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
  },
  driverSearchInput: {
    borderWidth: 1,
    borderRadius: wp(3),
    paddingHorizontal: wp(5),
    paddingVertical: wp(2),
  }
});
