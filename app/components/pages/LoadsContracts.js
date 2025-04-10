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
        {/* <TouchableOpacity onPress={() => navigation.navigate("addContractsDb")} style={{ width: 150, height: 30, alignItems: "center", justifyContent: 'center', backgroundColor: '#228B22', borderRadius: 8, alignSelf: 'center', margin: 5 }} >

          <Text style={{ color: 'white' }}> Add Contract </Text>
        </TouchableOpacity> */}


        <TouchableOpacity style={styles.infoBox} onPress={() => Linking.openURL('mailto:youremail@example.com')}>
          <Text style={styles.headingText}>Have Contracts to Offer?</Text>
          <Text style={styles.bodyText}>
            Promote your contracts here for just <Text style={styles.priceText}>$10</Text>.
          </Text>
          <Text style={styles.bodyText}>
            Tap here to email us now and get started.
          </Text>
          <Text style={styles.highlightText}>
            Bonus: Get access to a fleet of trucks already available!
          </Text>
        </TouchableOpacity>

    <Text style={styles.sectionTitle}>
  Looking for contracts? Choose Location
</Text>
   <View style={styles.countryGrid}>
  {[
    'Zimbabwe',
    'South Africa',
    'Namibia',
    'Tanzania',
    'Mozambique',
    'Zambia',
    'Botswana',
    'Malawi'
  ].map((country) => (
    <TouchableOpacity
      key={country}
      onPress={() => setContraLoc(country)}
      style={styles.buttonStyle}
    >
      <Text style={styles.buttonText}>{country}</Text>
    </TouchableOpacity>
  ))}
</View>
      </View>}

      {contractLoc && rendereIterms}

    </View>
  )
}
export default React.memo(LoadsContracts)


const styles = StyleSheet.create({
  infoBox: {
    padding: 16,
    backgroundColor: '#fff8f5',
    borderWidth: 2,
    borderColor: '#6a0c0c',
    borderRadius: 8,
    marginBottom: 20,
  },
  headingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6a0c0c',
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 15,
    color: '#333',
    marginBottom: 6,
  },
  priceText: {
    fontWeight: 'bold',
    color: '#6a0c0c',
  },
  highlightText: {
    fontSize: 14,
    color: '#1a7300',
    marginTop: 10,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  buttonStyle: {
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: '#6a0c0c',
    borderRadius: 6,
    backgroundColor: '#fff4f0',
  },
  buttonText: {
    color: '#6a0c0c',
    fontSize: 15,
    fontWeight: '600',
  },
     sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    marginTop: 20,
    paddingHorizontal: 10,
  },
  countryGridContainer: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#6a0c0c',
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 10,
    marginBottom: 20,
  },
  countryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  buttonStyle: {
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    margin: 6,
    borderWidth: 2,
    borderColor: '#6a0c0c',
    borderRadius: 6,
    backgroundColor: '#fff4f0',
  },
  buttonText: {
    color: '#6a0c0c',
    fontSize: 15,
    fontWeight: '600',
  },

});