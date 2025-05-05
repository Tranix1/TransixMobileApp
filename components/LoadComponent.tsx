import React, { useEffect, useState } from 'react';
import { View,  TouchableOpacity, ActivityIndicator, StyleSheet, Linking, } from 'react-native';
import { auth, db } from '../app/components/config/fireBase';
import {
  serverTimestamp,
  where,
  doc,
  deleteDoc,
} from 'firebase/firestore';


import { addDocument,checkDocumentExists, runFirestoreTransaction,setDocuments } from '@/db/operations';

import Input from './Input';
import { ThemedText } from './ThemedText';

import { router } from 'expo-router';


import { toggleItemById } from '@/Utilities/utils';

// import { useNavigation, useRoute, ParamListBase } from '@react-navigation/native';
// import { Ionicons } from '@expo/vector-icons';

import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
// import {useNavigate,useParams} from 'react-router-dom';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';


import { Load } from '@/types/types';


function DspAllLoads  ({ item = {} as Load }) {


  
  const [loadsList, setLoadsList] = useState<Load[]>([]);
  const deleteLoad = async (id: string) => {
    try {
      const loadsDocRef = doc(db, 'Loads', id);
      await deleteDoc(loadsDocRef);
      // Remove the deleted item from loadsList
      setLoadsList((prevLoadsList) => prevLoadsList.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const checkAndDeleteExpiredItems = () => {
      const deletionTime = item.deletionTime;
      const timeRemaining = deletionTime - Date.now();
      if (timeRemaining <= 0) {
        deleteLoad(item.id);
      } else {
        setTimeout(() => {
          deleteLoad(item.id);
        }, timeRemaining); // This might not work as expected
      }
  };
  setTimeout(() => {
    checkAndDeleteExpiredItems();
  }, 1000);

  const [contactDisplay, setContactDisplay] = React.useState<{ [key: string]: boolean }>({ ['']: false });
 
  const [bidDisplay, setBidDisplay] = React.useState<{ [key: string]: boolean }>({ ['']: false });
 
  const [dspMoreInfo, setDspMoreInfo] = React.useState<{ [key: string]: boolean }>({ ['']: false });
  const [spinnerItem, setSpinnerItem] = React.useState<Load | null>(null);

  const checkExistiDoc = async (docId: string): Promise<boolean> => {
    return await checkDocumentExists('bookings',[where('docId', '==', docId) ] )
  };

  const checkExistixtBBDoc = async (receriverId: string): Promise<boolean> => {
      return await checkDocumentExists('bidBookingStats', [where('receriverId', '==', receriverId ) ]  )
   };

  const [currencyBid, setCurrencyBid] = React.useState(true);
  function toggleCurrencyBid() {
    setCurrencyBid((prev) => !prev);
  }

  const [perTonneBid, setPerTonneBid] = React.useState(false);
  function togglePerTonneBid() {
    setPerTonneBid((prev) => !prev);
  }

  const [bidRate, setBidRate] = React.useState('');
  const [bidLinks, setBidLinks] = React.useState('');
  const [bidTriaxle, setBdTriaxle] = React.useState('');


  function replaceSpacesWithPercent(url: string): string {
    return url.replace(/ /g, '%20');
  }

const [addingUpdate , setAddingUpdate]= React.useState("")


    const handleSubmit = async (clickedItem: Load, dbName: 'bookings' | 'biddings') => {
      setSpinnerItem(clickedItem);


      const userId = auth.currentUser?.uid;
      if (!userId) {
        alert('User not authenticated');
        setSpinnerItem(null);
        return;
      }
      try {

        let theRate =  bidRate&&bidDisplay[item.id]?        bidRate : item.ratePerTonne;
        let thelinksRate= bidLinks&&bidDisplay[item.id]?     bidLinks :item.links
        let thetriaxleRate= bidTriaxle&&bidDisplay[item.id]? bidTriaxle : item.triaxle
        let currencyB = currencyBid&&bidDisplay[item.id]?    currencyBid : item.currency ;
        let perTonneB = perTonneBid&&bidDisplay[item.id]?    perTonneBid : item.perTonne

        

        let docId = `${userId}${item.typeofLoad}${theRate }${item.userId}`;

        let existingChat;
        if (dbName === 'bookings') {
          existingChat = await checkExistiDoc(docId);
        }



       
        let submitexpoPushToken = item.expoPushToken ? item.expoPushToken : null;

        if (!existingChat) {
          if (item.isVerified) {
            setBidDisplay({ ['']: false });
            setBidRate('');
            setBidLinks('');
            setBdTriaxle('');
            setSpinnerItem(null);
          router.push({
  pathname: '/Logistics/Contracts/ViewContractDetails',
    params: {
        data: JSON.stringify({
        itemName: item.typeofLoad,
        fromLocation: item.fromLocation,
        toLocation: item.toLocation,
        bookerId: userId,
        ownerName: item.companyName,
        ownerId: item.userId,
        Accept: null,
        isVerified: item.isVerified,
        msgReceiverId: userId,
        docId: docId,
        rate: theRate,
        linksRate: thelinksRate,
        triaxleRate: thetriaxleRate,
        currencyB: currencyB,
        perTonneB: perTonneB,
        loadId: item.id,
        deletionTime: Date.now() + 4 * 24 * 60 * 60 * 1000,
        dbName: dbName,
        expoPushToken: submitexpoPushToken,
        }),
    },
    });
            return;
          } else {

            //  Sedning a notification
            let theRateD: string | undefined;

            if (theRate) {
              theRateD = `Rate ${theRate} ${perTonneB ? 'per tonne' : ''} `;
            } else if (thelinksRate && thetriaxleRate) {
              theRateD = `Links ${thelinksRate} Triaxle ${thetriaxleRate} ${perTonneB ? 'per tonne' : ''} `;
            } else if (thetriaxleRate) {
              theRateD = `Triaxle ${thetriaxleRate} ${perTonneB ? 'per tonne' : ''} `;
            } else if (thelinksRate) {
              theRateD = `Links ${thelinksRate} ${perTonneB? 'per tonne' : ''} `;
            }

            let message = `${item.typeofLoad} ${dbName === 'bookings' ? 'Booked' : 'Bidded'} Rate ${theRateD} `;
            let tittle = `From ${item.fromLocation} to ${item.toLocation} `;
            if (item.expoPushToken) {
            //   await sendPushNotification(item.expoPushToken, message, tittle, dbName);
            }
            //  Sending a notification end here
            
                
               addDocument(dbName , {
              itemName: item.typeofLoad,
              fromLocation: item.fromLocation,
              toLocation: item.toLocation,
              bookerId: userId,
            //   bookerName: username,
              ownerName: item.companyName,
              ownerId: item.userId,
            //   contact: contactG,
              Accept: null,
              isVerified: item.isVerified,
              msgReceiverId: userId,
            //   docId: docId,
              rate: theRate,
              linksRate: thelinksRate,
              triaxleRate: thetriaxleRate,
              currencyB: currencyB,
              perTonneB: perTonneB,
              loadId: item.id,
              deletionTime: Date.now() + 5 * 24 * 60 * 60 * 1000,
              timestamp: serverTimestamp(),
               },  setAddingUpdate )            
          }


          setBidRate('');
          setBidLinks('');
          setBdTriaxle('');
          setBidDisplay({ ['']: false });
          alert(`${!bidDisplay[item.id] ? 'booking' : 'bidding'} was successfull`);
        } else {
          alert(`Already ${!bidDisplay[item.id] ? 'booked' : 'bidded'} this Item!`);
        }


        const existingBBDoc = await checkExistixtBBDoc(item.userId);
        let newBiddedDoc = 0;
        let newBOOKEDDoc = 0;

        dbName === 'bookings' ? (newBOOKEDDoc = 1) : (newBiddedDoc = 1);
        // Chat doesn't exist, add it to 'ppleInTouch'
        if (!existingBBDoc) {
          await setDocuments( 'bidBookingStats' ,{
            bookingdocs: newBOOKEDDoc,
            biddingdocs: newBiddedDoc,
            timestamp: serverTimestamp(),
            receriverId: item.userId
          })
          
        }
        else {

            await runFirestoreTransaction(`bidBookingStats/${item.userId}`, (data) => {
                const currentBiddingDocs = data.biddingdocs || 0;
                const currentBookingsDocs = data.bookingdocs || 0;

                return dbName !== "bookings"
                    ? { biddingdocs: currentBiddingDocs + 1 }
                    : { bookingdocs: currentBookingsDocs + 1 };
                });
        }

        setSpinnerItem(null);

      } catch (err: any) {
        alert(err.toString());
        setSpinnerItem(null);
      }
    };





    let theRateM: string | undefined;

    if (item.ratePerTonne) {
      theRateM = `Rate ${item.ratePerTonne} ${item.perTonne ? 'per tonne' : ''} `;
    } else if (item.links && item.triaxle) {
      theRateM = `Links ${item.links} Triaxle ${item.triaxle} ${item.ratePerTonne ? 'per tonne' : ''} `;
    }
    else if (item.triaxle) {
      theRateM = `Triaxle ${item.triaxle} ${item.ratePerTonne ? 'per tonne' : ''} `;
    } else if (item.links) {
      theRateM = `Links ${item.links} ${item.ratePerTonne ? 'per tonne' : ''} `;
    }

    const url = `https://transix.net/selectedUserLoads/${item.userId}/${item.companyName}/${item.deletionTime}`;
    const updatedUrl = replaceSpacesWithPercent(url);

       const message =  `${item.companyName}
        Is this Load still available
        ${item.typeofLoad} from ${item.fromLocation} to ${item.toLocation}
        ${theRateM}

        From: ${updatedUrl} `  // Set your desired message here

    let contactMe = (
      <View style={{ paddingLeft: 30 }}>

        {auth.currentUser && <TouchableOpacity style={{ height: 30, flexDirection: 'row', alignItems: 'center',  borderWidth: 1, borderColor: '#008080', justifyContent: 'center', marginBottom: 5, marginTop: 6 }} >
          <ThemedText style={{ color: "#008080" }} >Message now</ThemedText>
          <MaterialIcons name="chat" size={24} color="#008080" />

        </TouchableOpacity>}

        <TouchableOpacity onPress={() => Linking.openURL(`whatsapp://send?phone=${item.contact}&text=${encodeURIComponent(message)}`)} style={{ height: 30, flexDirection: 'row', alignItems: 'center',  borderWidth: 1, borderColor: '#25D366', justifyContent: 'center', marginBottom: 6 }} >
          <ThemedText style={{ color: "#25D366" }} >WhatsApp </ThemedText>
          <FontAwesome6 name="whatsapp" size={24} color="#25D366" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => Linking.openURL(`tel:${item.contact}`)} style={{ height: 30, flexDirection: 'row', alignItems: 'center',  borderWidth: 1, borderColor: '#0074D9', justifyContent: 'center', marginBottom: 4 }} >
          <ThemedText style={{ color: '#0074D9' }} >Phone call</ThemedText>
          <MaterialIcons name="call" size={24} color="#0074D9" />
        </TouchableOpacity>

      </View>)

    let bidNow = (
      <View style={{ position: 'absolute', bottom: 0, backgroundColor: 'white', flex: 1, padding: 7, width: 360, alignItems: 'center' }}>

        {spinnerItem === item ? (
          <ActivityIndicator size={34} />
        ) : <View >

          {item.ratePerTonne && <View style={{ flexDirection: 'row', alignItems: 'center', }} >

            <TouchableOpacity onPress={toggleCurrencyBid}>
              {currencyBid ? <ThemedText style={styles.buttonIsFalse} >USD</ThemedText> :
                <ThemedText style={styles.bttonIsTrue}>Rand </ThemedText>}
            </TouchableOpacity>

            <Input
              onChangeText={(text) => setBidRate(text)}
            //   name="ratePerTonne"
              value={bidRate}
              keyboardType="numeric"
              placeholderTextColor="#6a0c0c"
              style={{ height: 30, borderBottomWidth: 2, borderBottomColor: "#6a0c0c", marginBottom: 10, padding: 0, paddingLeft: 20, width: 180 }}
              placeholder="Bid rate here"
            />
            <TouchableOpacity onPress={togglePerTonneBid} >
              {perTonneBid ? <ThemedText style={styles.bttonIsTrue} >Per tonne</ThemedText> :
                <ThemedText style={styles.buttonIsFalse}>Per tonne</ThemedText>}
            </TouchableOpacity>
          </View>}


          {item.links || item.triaxle ? <View>
            {item.links && <View style={{ flexDirection: 'row', alignItems: 'center', }} >

              <TouchableOpacity onPress={toggleCurrencyBid}>
                {currencyBid ? <ThemedText style={styles.buttonIsFalse} >USD</ThemedText> :
                  <ThemedText style={styles.bttonIsTrue}>Rand </ThemedText>}
              </TouchableOpacity>

              <Input
                onChangeText={(text) => setBidLinks(text)}
                // name="ratePerTonne"
                value={bidLinks}
                keyboardType="numeric"
                placeholderTextColor="#6a0c0c"
                style={{ height: 30, borderBottomWidth: 2, borderBottomColor: "#6a0c0c", marginBottom: 10, padding: 0, paddingLeft: 20, width: 180 }}
                placeholder="Bid Links rate"
              />
              <TouchableOpacity onPress={togglePerTonneBid} >
                {perTonneBid ? <ThemedText style={styles.bttonIsTrue} >Per tonne</ThemedText> :
                  <ThemedText style={styles.buttonIsFalse}>Per tonne</ThemedText>}
              </TouchableOpacity>
            </View>}



            {item.triaxle && <View style={{ flexDirection: 'row', alignItems: 'center', }} >

              <TouchableOpacity onPress={toggleCurrencyBid}>
                {currencyBid ? <ThemedText style={styles.buttonIsFalse} >USD</ThemedText> :
                  <ThemedText style={styles.bttonIsTrue}>Rand </ThemedText>}
              </TouchableOpacity>

              <Input
                onChangeText={(text) => setBdTriaxle(text)}
                // name="ratePerTonne"
                value={bidTriaxle}
                keyboardType="numeric"
                placeholderTextColor="#6a0c0c"
                style={{ height: 30, borderBottomWidth: 2, borderBottomColor: "#6a0c0c", marginBottom: 10, padding: 0, paddingLeft: 20, width: 180, marginTop: 5 }}
                placeholder="Bid triaxle rate"
              />
              <TouchableOpacity onPress={togglePerTonneBid} >
                {perTonneBid ? <ThemedText style={styles.bttonIsTrue} >Per tonne</ThemedText> :
                  <ThemedText style={styles.buttonIsFalse}>Per tonne</ThemedText>}
              </TouchableOpacity>
            </View>}


          </View> : null}


        </View>}


        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>

          <TouchableOpacity onPress={() => toggleItemById(item.id,setBidDisplay)} style={{ backgroundColor: '#6a0c0c', padding: 1, paddingLeft: 7, paddingRight: 7, borderRadius: 3, marginRight: 12 }} >
            <ThemedText style={{ color: 'white' }}>Cancel </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleSubmit(item, "biddings" as 'biddings')} style={{ backgroundColor: '#228B22', padding: 1, paddingLeft: 7, paddingRight: 7, borderRadius: 3 }} >
            <ThemedText style={{ color: 'white' }}> Send</ThemedText>
          </TouchableOpacity>

        </View>

      </View>
    )


    const getFirstThreeLetters = (str: string | undefined): string => {
    return str ? str.slice(0, 3) : '';
    };

    // Example usage
    const myString = item.companyName;
    const firstLetter = getFirstThreeLetters(myString);



    return (
      <View key={item.id} style={{ marginBottom: 8, padding: 7, borderWidth: 2, borderColor: 'black', borderRadius: 8, shadowColor: '#6a0c0c', shadowOffset: { width: 1, height: 2 }, shadowOpacity: 0.7, shadowRadius: 5, overflow: 'hidden', }} >

        {item.isVerified && <View style={{ position: 'absolute', top: 0, right: 0, backgroundColor: 'white', zIndex: 66 }} >
          <MaterialIcons name="verified" size={26} color="green" />
        </View>}
        <ThemedText style={{ color: '#6a0c0c',  textAlign: 'center', fontSize: 21, fontWeight: '600' }}  >{item.companyName} </ThemedText>

        {<View style={{ flexDirection: 'row', margin: 4 }} >

          {item.returnLoad && <View style={{ backgroundColor: '#6a0c0c', paddingLeft: 4, paddingRight: 4, marginLeft: 7 }} >
            <ThemedText style={{ color: 'white' }} >Return Load</ThemedText>
          </View>}

          {item.roundTrip && <View style={{ backgroundColor: '#6a0c0c', paddingLeft: 4, paddingRight: 4, marginLeft: 7 }} >
            <ThemedText style={{ color: 'white' }} >Round Trip</ThemedText>
          </View>}

          {item.fuelAvai && <View style={{ backgroundColor: '#6a0c0c', paddingLeft: 4, paddingRight: 4, marginLeft: 7 }} >
            <ThemedText style={{ color: 'white' }} >Fuel</ThemedText>
          </View>}

        </View>}
        <View style={{ flexDirection: 'row', width: 245 }} >
          <ThemedText style={{ width: 100 }} >Commodity</ThemedText>
          <ThemedText style={{ textOverflow: 'ellipsis' }} >:  {item.typeofLoad} </ThemedText>
        </View>

        <View style={{ flexDirection: 'row', width: 245 }} >
          <ThemedText style={{ width: 100 }} >Route</ThemedText>
          <ThemedText style={{ textOverflow: 'ellipsis' }} >:  from  {item.fromLocation}  to  {item.toLocation} </ThemedText>
        </View>

        {!item.links && !item.triaxle && <View style={{ flexDirection: 'row', width: 245 }} >
          <ThemedText style={{ width: 100, color: 'green', fontWeight: 'bold', fontSize: 16 }} >Rate</ThemedText>
          <ThemedText style={{ color: 'green', fontWeight: 'bold', fontSize: 16 }} >:  {item.currency ? "USD" : "RAND"} {item.ratePerTonne} {item.perTonne ? "Per tonne" : null} </ThemedText>
        </View>}

        {item.links && <View style={{ flexDirection: 'row', width: 245 }} >
          <ThemedText style={{ width: 100, color: 'green', fontWeight: 'bold', fontSize: 16 }} >Links</ThemedText>
          <ThemedText style={{ color: 'green', fontWeight: 'bold', fontSize: 16 }} >:  {item.currency ? "USD" : "RAND"} {item.links} {item.perTonne ? "Per tonne" : null} </ThemedText>
        </View>}

        {item.triaxle && <View style={{ flexDirection: 'row', width: 245 }} >
          <ThemedText style={{ width: 100, color: 'green', fontWeight: 'bold', fontSize: 16 }} >Triaxle</ThemedText>
          <ThemedText style={{ color: 'green', fontWeight: 'bold', fontSize: 16 }} >:  {item.currency ? "USD" : "RAND"} {item.triaxle} {item.perTonne ? "Per tonne" : null} </ThemedText>
        </View>}

        {!contactDisplay[item.id] && <View>

          {!<View style={{ flexDirection: 'row', width: 245 }} >
            <ThemedText style={{ width: 100 }} >Contact</ThemedText>
            {!item.isVerified && <ThemedText style={{ textOverflow: 'ellipsis' }} >:  {item.contact}</ThemedText>}
          </View>}

          <View style={{ flexDirection: 'row', width: 245 }} >
            <ThemedText style={{ width: 100 }} >Payment Terms</ThemedText>
            <ThemedText style={{ textOverflow: 'ellipsis' }} >: {item.paymentTerms}</ThemedText>
          </View>

          {item.requirements && <View style={{ flexDirection: 'row', width: 245 }} >
            <ThemedText style={{ width: 100 }} >Requirements</ThemedText>
            <ThemedText style={{ textOverflow: 'ellipsis' }} >: {item.requirements}</ThemedText>
          </View>}
          {item.activeLoading && <ThemedText style={{ fontSize: 17, color: "#FF8C00" }} >Active Loading.... </ThemedText>}
          {dspMoreInfo[item.id] && <View>
            {item.fuelAvai && <View style={{ flexDirection: 'row', marginTop: 5, width: 245 }} >
              <ThemedText style={{ width: 100 }} >Fuel </ThemedText>
              <ThemedText style={{ textOverflow: 'ellipsis' }}  >:  {item.fuelAvai} </ThemedText>
            </View>}
            {item.additionalInfo && <View style={{ flexDirection: 'row', width: 245 }} >
              <ThemedText style={{ width: 100 }} >Additional info </ThemedText>
              {<ThemedText style={{ textOverflow: 'ellipsis' }} >:  {item.additionalInfo} </ThemedText>}
            </View>}


            {item.alertMsg && <View style={{ flexDirection: 'row', marginTop: 5, width: 245 }} >
              <ThemedText style={{ width: 100, backgroundColor: 'rgba(220, 20, 60, 0.8)', color: 'white', textAlign: 'center', fontSize: 15 }} >Alert</ThemedText>
              <ThemedText style={{ paddingRight: 7, backgroundColor: 'rgba(220, 20, 60, 0.8)', color: 'white', fontSize: 15, textOverflow: 'ellipsis' }} >:  {item.alertMsg} </ThemedText>
            </View>}

            {item.returnLoad && <View style={{ marginTop: 5, width: 245 }} >
              <ThemedText style={{ alignSelf: 'center', color: "rgba(220, 20, 60, 0.8)", fontSize: 16, margin: 3 }} >Return Load</ThemedText>
              {item.returnLoad && <View style={{ flexDirection: 'row' }} >
                <ThemedText style={{ width: 100 }} >R Cargo</ThemedText>
                {<ThemedText style={{ textOverflow: 'ellipsis' }} >:  {item.returnLoad} </ThemedText>}
              </View>}
              {item.returnRate && <View style={{ flexDirection: 'row', width: 245 }} >
                <ThemedText style={{ width: 100 }} >R Rate</ThemedText>
                {<ThemedText style={{ textOverflow: 'ellipsis' }} >:  {item.returnRate} </ThemedText>}
              </View>}
              {item.returnTerms && <View style={{ flexDirection: 'row', width: 245 }} >
                <ThemedText style={{ width: 100 }} >R Terms</ThemedText>
                {<ThemedText style={{ textOverflow: 'ellipsis' }} >:  {item.returnTerms} </ThemedText>}
              </View>}
            </View>}
          </View>}


          {!contactDisplay[item.id] && <TouchableOpacity onPress={() => toggleItemById(item.id,setDspMoreInfo)} >
            <ThemedText style={{ color: 'green', fontWeight: 'bold', fontSize: 16 }} >{dspMoreInfo[item.id] ? "See Less" : "See more"} </ThemedText>
          </TouchableOpacity>}
        </View>}

        {contactDisplay[item.id] && contactMe}

        {bidDisplay[item.id] && bidNow}

        {!bidDisplay[item.id] && <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>

          { <TouchableOpacity onPress={() => toggleItemById(item.id,setContactDisplay)} style={{ width: 120, height: 30, alignItems: "center", justifyContent: 'center', backgroundColor: '#228B22', borderRadius: 8, margin: 5 }} >
            <ThemedText style={{ color: 'white' }} > Get In Touch Now</ThemedText>
          </TouchableOpacity>}
          <TouchableOpacity 
        //   onPress={() => navigation.navigate('selectedUserLoads', { userId: item.userId, companyNameG: item.companyName })} 
          style={{ width: 120, height: 30, alignItems: "center", justifyContent: 'center', backgroundColor: '#228B22', borderRadius: 8, margin: 5 }} >
            <ThemedText style={{ color: 'white' }}>All {firstLetter}  Loads </ThemedText>
          </TouchableOpacity>

        </View>}



        {auth.currentUser ? !bidDisplay[item.id] && !contactDisplay[item.id] &&  <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }} >
          {spinnerItem === item ? (
            <ActivityIndicator size={34} />
          ) : (
            <TouchableOpacity style={{ width: 90, height: 30, alignItems: "center", justifyContent: 'center', backgroundColor: '#6a0c0c', borderRadius: 8, alignSelf: 'center', margin: 5 }} onPress={() => handleSubmit(item, "bookings" as 'bookings')}>
              <ThemedText style={{ color: 'white' }} >Book</ThemedText>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={() => toggleItemById(item.id,setBidDisplay)} style={{ width: 90, height: 30, alignItems: "center", justifyContent: 'center', backgroundColor: '#6a0c0c', borderRadius: 8, alignSelf: 'center', margin: 5 }} >
            <ThemedText style={{ color: 'white' }} >Bid</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={{ width: 90, height: 30, alignItems: "center", justifyContent: 'center', backgroundColor: '#6a0c0c', borderRadius: 8, alignSelf: 'center', margin: 5 }} >
            <ThemedText style={{ color: 'white' }} >Message</ThemedText>
          </TouchableOpacity>
        </View> :
          <ThemedText style={{ color: 'red' }}> Sign In to Book Bid and Message </ThemedText>
        }

      </View>
    )


}


export default DspAllLoads

const styles = StyleSheet.create({
    buttonIsFalse : {
     borderWidth : 1 ,
     borderColor : '#6a0c0c' ,
     paddingLeft :4 , 
     paddingRight:4 ,
     color:"black"
    //  marginLeft : 6
   } , 
    bttonIsTrue:{
    backgroundColor : '#6a0c0c' ,
     paddingLeft :4 ,
     paddingRight:4 ,
     color :'white' 

    }
});