import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet } from "react-native";
import { auth, db } from "../../components/config/fireBase";

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Ionicons } from "@expo/vector-icons";

import { collection, serverTimestamp, addDoc, query, where, onSnapshot, getDocs } from 'firebase/firestore';

import { Truck } from "@/types/types";

import { toggleItemById } from "@/Utilities/utils";
import { updateDocument } from "@/db/operations";

import { useLocalSearchParams } from "expo-router";

function BookLContract({ }) {

 const  ContractItemG  = useLocalSearchParams();
 const Contractitem = typeof ContractItemG === 'string' ? JSON.parse(decodeURIComponent(ContractItemG)) : null;


  const [bbVerifiedLoadD, setbbVerifiedLoadD] = React.useState<Truck[] | []>([])


  useEffect(() => {
    try {
      if (auth.currentUser) {

        const userId = auth.currentUser.uid
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

        // Clean up function to unsubscribe from the listener when the component unmounts
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
    // Clean up the subscription on unmount
    return () => unsubscribe();
  }, [setTrucksInContract]);

  const checkExistixtBBDoc = async (trckContractId: string) => {
    console.log("Checking truck is booked")
    const chatsRef = collection(db, 'ContractRequests'); // Reference to the 'ppleInTouch' collection
    const chatQuery = query(chatsRef, where('trckContractId', '==', trckContractId), where('alreadyInContract', '==', true)); // Query for matching chat ID

    const querySnapshot = await getDocs(chatQuery);
    // Check if any documents exist with the chat ID
    console.log("Truck Booked")
    return !querySnapshot.empty; // Returns true if a document exists, false otherwise
  };

  let renderElements = bbVerifiedLoadD.map((item) => {

    async function handleSubmitDetails() {
      if (auth.currentUser) {

        const userId = auth.currentUser.uid
        //   const existingBBDoc = await checkExistixtBBDoc(`${userId}contractId ${item.timeStamp}`);
        const existingBBDoc = await checkExistixtBBDoc(`${userId}${Contractitem.contractId}${item.timeStamp}`);
        if (!existingBBDoc) {

          console.log('start adding')

          const theCollection = collection(db, "ContractRequests");
          const docRef = await addDoc(theCollection, {


            truckInfo: item,

            trckContractId: `${userId}contractId ${item.timeStamp}`,
            truckContrSt: true,
            contractId: Contractitem.contractId ,
            contractOnwerId: Contractitem.userId,
            contractName: Contractitem.contractName,
            approvedTrck: false,
            alreadyInContract: true,
            timeStamp : serverTimestamp()
          })

          alert('doneee adding')

        } else {
          alert("Truck alreadyy Booked")
        }

      }
    }

    return (
      <View
        // onPress={handleSubmitDetails}
        style={{ marginBottom: 70, padding: 10, borderWidth: 2, borderColor: 'red' }} key={item.id} >

        {<Image source={{ uri: item.imageUrl }} style={{ height: 250, borderRadius: 10 }} />}


        {trucksInContract.map((scndItem) => {

          function removeFrmContract() {
            console.log("removing truc from contract")

            updateDocument("ContractRequests", scndItem.id,
              {
                alreadyInContract: false,
                reasonForLeaving: "hahahah",
                contractId: Contractitem.contractId ,
                truckInfo: {
                  timestamp: serverTimestamp()
                }
              })
          }
          return (
            <View key={scndItem.id}>






              {(Number(item.timeStamp) === Number(scndItem.truckInfo.timeStamp)) && (
                <View>
                  <Text>Truck Is Booked</Text>

                  <View style={{ flexDirection: "row" }}>
                    <TouchableOpacity onPress={removeFrmContract} style={{ width: 200, backgroundColor: "red" }} >
                      <Text>Remove from exisiting conrtract</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}


            </View>
          )
        }


        )}

        <TouchableOpacity onPress={handleSubmitDetails} style={{ width: 200, backgroundColor: "blue" }} >
          <Text style={{ color: "white" }}>Select to contract</Text>
        </TouchableOpacity>

        <Text>{item.CompanyName} </Text>

        <TouchableOpacity
          onPress={() => togglrTruckDe(item.id)} style={styles.buttonSelectStyle} >
          <Text style={{ color: 'white' }} >Truck Details </Text>
        </TouchableOpacity>
        {truckDetails[item.id] && <View>

          <View style={{ flexDirection: 'row' }} >
            <Text style={{ width: 60 }} >Trailer Type</Text>
            <Text>:  {item.cargoArea}</Text>
          </View>

          <ScrollView horizontal style={{ margin: 10 }} >
            {item.truckBookImage && <View>
              <Text style={{ textAlign: 'center' }} >Truck Image</Text>
              <Image source={{ uri: item.truckBookImage }} style={{ height: 250, borderRadius: 10, width: 300, marginLeft: 5 }} />
            </View>}

            {item.trailerBookF && <View>
              <Text style={{ textAlign: 'center' }}>Trailer Book</Text>
              <Image source={{ uri: item.trailerBookF }} style={{ height: 250, borderRadius: 10, width: 300, marginLeft: 5 }} />
            </View>}

            {item.trailerBookSc && <View>
              <Text style={{ textAlign: 'center' }} >Second Trailer Book</Text>
              <Image source={{ uri: item.trailerBookSc }} style={{ height: 250, borderRadius: 10, width: 300, marginLeft: 5 }} />
            </View>}

          </ScrollView>

        </View>}

        <TouchableOpacity onPress={() => togglrDriverDe(item.id)} style={styles.buttonStyle} >
          <Text>Driver Details</Text>
        </TouchableOpacity>
        {driverDetails[item.id] && <View>



          <View style={{ flexDirection: 'row' }} >
            <Text style={{ width: 60 }} >Driver Phone</Text>
            <Text>:  {item.driverPhone}</Text>
          </View>

          <ScrollView horizontal>
            {item.driverPassport && <View>
              <Text style={{ textAlign: 'center' }} >Second Trailer Book</Text>

              {item.driverLicense && <Image source={{ uri: item.driverLicense }} style={{ height: 250, borderRadius: 10, width: 300, marginLeft: 5 }} />}
            </View>}
            {item.driverPassport && <View>

              <Text style={{ textAlign: 'center' }} >Second Trailer Book</Text>
              {<Image source={{ uri: item.driverPassport }} style={{ height: 250, borderRadius: 10, width: 300, marginLeft: 5 }} />}
            </View>}
          </ScrollView>


        </View>}

        <TouchableOpacity onPress={() => togglrTruckBuzDe(item.id)} style={styles.buttonSelectStyle} >
          <Text style={{ color: 'white', fontSize: 17 }} >business Details</Text>
        </TouchableOpacity>
        {truckBuzDe[item.id] && <View>

          <View style={{ flexDirection: 'row' }} >
            <Text style={{ width: 60 }} >Owner Phone Number</Text>
            <Text>:  {item.ownerPhoneNum}</Text>
          </View>
          <View style={{ flexDirection: 'row' }} >
            <Text style={{ width: 60 }} >Owner Email</Text>
            <Text>:  {item.onwerEmail}</Text>
          </View>

        </View>}

      </View>
    )
  })

  return (
    <View>
      <View style={{ flexDirection: 'row', height: 74, paddingLeft: 6, paddingRight: 15, backgroundColor: '#6a0c0c', paddingTop: 15, alignItems: 'center' }} >

        <TouchableOpacity style={{ marginRight: 12 }}  >
          <Ionicons name="arrow-back" size={28} color="white" style={{ marginLeft: 10 }} />
        </TouchableOpacity>

        <Text style={{ fontSize: 20, color: 'white' }} >Pick the truck for the job </Text>
      </View>

      <TouchableOpacity style={{ position: 'absolute', top: 440, right: 10, width: 77, height: 35, backgroundColor: 'white', zIndex: 200, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }} >

        <Text style={{ fontSize: 17 }} >Add</Text>
        <MaterialIcons name="verified" size={30} color="green" />
      </TouchableOpacity>


      <View style={{ borderWidth: 2, borderColor: "rgb(129,201,149)", margin: 16, padding: 5 }} >

        <View style={{ position: 'absolute', top: 0, right: 0, backgroundColor: 'white', zIndex: 66 }} >
          <MaterialIcons name="verified" size={26} color="green" />
        </View>


        <View style={{ backgroundColor: '#228B22', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }} >

          <Text style={{ color: 'white', textAlign: 'center', fontSize: 18, alignSelf: 'center' }} >NB Investments</Text>
        </View>
        <Text>9months contract</Text>

        <View style={{ flexDirection: 'row' }} >
          <Text style={{ width: 99 }} >Nmae</Text>
          <Text  >:  Tobbacoo </Text>
        </View>


        <View style={{ flexDirection: 'row' }} >
          <Text style={{ width: 60 }} >Country</Text>
          <Text>IN Zimbabwe </Text>
        </View>


        <Text>:  Rate : 3.50/KM for distance above 100KM </Text>
        <Text>Rate : 4.50/KM for distance below 100KM</Text>





      </View>

      <ScrollView>

        {renderElements}
        <View style={{ height: 500 }} >

        </View>
      </ScrollView>
    </View>
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
