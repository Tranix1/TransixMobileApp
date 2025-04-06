import React, { useEffect } from "react";

import { View, Text, TouchableOpacity, ScrollView ,StyleSheet, Image } from "react-native";
import { collection, startAfter, serverTimestamp, addDoc, query, where, getDocs, doc, deleteDoc, updateDoc, runTransaction, setDoc, orderBy, limit, onSnapshot } from 'firebase/firestore';

import { Ionicons } from "@expo/vector-icons";
import { db, auth } from "../config/fireBase";


function LoadsContracts({ navigation }) {


  const [contractLoc, setContraLoc] = React.useState(null)
  const [getContracts, setGetContracts] = React.useState([])

  const [dspLoadMoreBtn, setLoadMoreBtn] = React.useState(true)
  const [LoadMoreData, setLoadMoreData] = React.useState(false)

  async function loadedData(loadMore) {

    try {
      loadMore ? setLoadMoreData(true) : null;

      const orderByF = "timeStamp";
      const orderByField = orderBy(orderByF, 'desc'); // Order by timestamp in descending order

      const pagination = loadMore && loadsList.length > 0 ? [startAfter(loadsList[loadsList.length - 1][orderByF])] : [];
      let dataQuery = query(collection(db, "loadsContracts"),);


      const docsSnapshot = await getDocs(dataQuery);

      let userItemsMap = [];

      docsSnapshot.forEach(doc => {
        userItemsMap.push({ id: doc.id, ...doc.data() });
      });

      const verifiedUsers = userItemsMap.filter(user => user.isVerified);
      const nonVerifiedUsers = userItemsMap.filter(user => !user.isVerified);

      userItemsMap = verifiedUsers.concat(nonVerifiedUsers);
      let loadedData = userItemsMap;

      if (loadedData.length === 0) {
        setLoadMoreBtn(false);
      }

      // Update state with the new data
      setGetContracts(loadMore ? [...getContracts, ...loadedData] : loadedData);

      loadMore ? setLoadMoreData(false) : null;
    } catch (err) {
      console.error(err)
    }
  }



  useEffect(() => {
    loadedData();

  }, []);


  const [contrMoreInfo, setContractMoreInfo] = React.useState(false)
  function toggleDspMoreInfo() {
    setContractMoreInfo(prev => !prev)
  }

  const [dspRturnnLoads, setDspReturnLoads] = React.useState(false);

  function toggleDspReturnLoads(params) {
    setDspReturnLoads(true);
    setDspContractD(false);
    setDspLoadDe(false)
  }

  const [dspContractD, setDspContractD] = React.useState(false);

  function toggleDspContractD(params) {
    setDspContractD(true);
    setDspReturnLoads(false);
    setDspLoadDe(false)
  }

  // const [dspCommodity, setDspCommodity] = React.useState(false);

  // function toggleDspCommodity(params) {
  //   setDspCommodity(prev=> !prev);
  // }

  const [dsoLoadDe, setDspLoadDe] = React.useState(true)
  function dspLoadDet() {
    setDspLoadDe(true)
    setDspContractD(false);
    setDspReturnLoads(false);

  }

  // commodity  , contract Id , Contract Duration , Contract Rate ,  contract Route r R  outes ,  , Reuirements , Due Date , owner number , owner Id


  

  const rendereIterms = getContracts.map((item) => {
    return(
      <View
  key={item.id}
  style={{
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#6a0c0c',
    borderRadius: 12,
    shadowColor: '#6a0c0c',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5, // Android shadow
  }}
>
  <Text
    style={{
      color: '#6a0c0c',
      fontWeight: 'bold',
      fontSize: 22,
      textAlign: 'center',
      marginBottom: 5,
    }}
  >
    9 Months Contract Available
  </Text>

  <Text
    style={{
      fontStyle: 'italic',
      fontSize: 16,
      textAlign: 'center',
      fontWeight: 'bold',
      marginBottom: 8,
      color: '#444',
    }}
  >
    Trucks Left: 10
  </Text>

  <View style={{ marginBottom: 10 }}>
    <Text style={{ fontSize: 16, color: '#333', marginBottom: 2 }}>
      <Text style={{ fontWeight: 'bold' }}>Commodity:</Text> Maize
    </Text>
    <Text style={{ fontSize: 16, color: '#333', marginBottom: 2 }}>
      <Text style={{ fontWeight: 'bold' }}>Solid Rate:</Text> 12,000 per km
    </Text>
    <Text style={{ fontSize: 16, color: '#333', marginBottom: 2 }}>
      <Text style={{ fontWeight: 'bold' }}>Links:</Text> 12,000 per km
    </Text>
    <Text style={{ fontSize: 16, color: '#333', marginBottom: 2 }}>
      <Text style={{ fontWeight: 'bold' }}>Triaxle:</Text> 12,000 per km
    </Text>
    <Text style={{ fontSize: 16, color: '#333', marginBottom: 2 }}>
      <Text style={{ fontWeight: 'bold' }}>Superlink:</Text> 12,000 per km
    </Text>
  </View>

  <TouchableOpacity
    style={{
      backgroundColor: '#9c2828',
      width: '80%',
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
      alignSelf: 'center',
      marginTop: 8,
    }}
    onPress={() =>
      navigation.navigate('ViewContractMoreInfo', { item: item })
    }
  >
    <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
      View More Info
    </Text>
  </TouchableOpacity>
</View>
    )
  })





  const [selectContractCountry, setSelectContractCountry] = React.useState()
  function toggleSelctCntrctCounrty() {
    setSelectContractCountry(prev => !prev)
  }
  return (
    <View style={{ paddingTop: 89, padding: 10 }} >

      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', height: 74, paddingLeft: 6, paddingRight: 15, paddingTop: 10, backgroundColor: '#6a0c0c', paddingTop: 15, alignItems: 'center', }} >
        <TouchableOpacity style={{ marginRight: 10 }} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="white" style={{ marginLeft: 10 }} />
        </TouchableOpacity>

        <Text style={{ fontSize: 20, color: 'white' }} > {contractLoc ? `Contracts in ${contractLoc} ` : "Choose contract location"} </Text>
      </View>

      {!contractLoc && <View style={{ alignSelf: 'center' }} >
        <TouchableOpacity onPress={() => navigation.navigate("addContractsDb")} style={{ width: 150, height: 30, alignItems: "center", justifyContent: 'center', backgroundColor: '#228B22', borderRadius: 8, alignSelf: 'center', margin: 5 }} >

          <Text style={{ color: 'white' }}> Add Contract </Text>
        </TouchableOpacity>


          <TouchableOpacity>
            <Text>Do you offer contreacts and want to markert them here for $10</Text>
            <Text>Click here and email us now</Text>
            <Text>We also give access to already added trucks that are readily Available</Text>
          </TouchableOpacity>



        <TouchableOpacity onPress={() => setContraLoc('Zimbabwe')} style={styles.buttonStyle}   >
          <Text style={{ color: '#6a0c0c' }}>Zimbabwe </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setContraLoc('SouthAfrica')} style={styles.buttonStyle} >
          <Text style={{ color: '#6a0c0c' }}>South Africa</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setContraLoc('Namibia')} style={styles.buttonStyle} >
          <Text style={{ color: '#6a0c0c' }}>Namibia </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setContraLoc('Tanzania')} style={styles.buttonStyle} >
          <Text style={{ color: '#6a0c0c' }}> Tanzania</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setContraLoc('Mozambique')} style={styles.buttonStyle} >
          <Text style={{ color: '#6a0c0c' }}>Mozambique </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setContraLoc('Zambia')} style={styles.buttonStyle}  >
          <Text style={{ color: '#6a0c0c' }}> Zambia</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setContraLoc('Botswana')} style={styles.buttonStyle} >
          <Text style={{ color: '#6a0c0c' }}>Botswana </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setContraLoc('Malawi')} style={styles.buttonStyle} >
          <Text style={{ color: '#6a0c0c' }}>Malawi </Text>
        </TouchableOpacity>
      </View>}

      {contractLoc && rendereIterms}

    </View>
  )
}
export default React.memo(LoadsContracts)


const styles = StyleSheet.create({
  buttonStyle: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    width: 150,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "#6a0c0c",
    borderRadius: 3
  },
});