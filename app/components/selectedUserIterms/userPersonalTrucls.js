import React, { useEffect, useState } from 'react';
import defaultImage from '../images/TRANSIX.jpg'

import { View , Text , Image , ScrollView,StyleSheet,TouchableOpacity,Linking, } from 'react-native';
import { auth ,db} from "../config/fireBase";

import { Ionicons } from "@expo/vector-icons";
import { collection,  query , where,onSnapshot ,deleteDoc,doc,limit,startAfter,orderBy } from 'firebase/firestore';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

function SelectedUserTrucks ({route,navigation ,blockVerifiedU  , blackLWarning } ){ 

  const {userId , loadIsVerified ,CompanyName,itemKey }= route.params

  const [allTrucks, setAllTrucks] = useState([]);

  const [dspLoadMoreBtn , setLoadMoreBtn]=React.useState(true)
  const [LoadMoreData , setLoadMoreData]=React.useState(false)
  function fetchData (loadMore){
    
    try {
      loadMore ? setLoadMoreData(true) : null;

          const orderByF = "fromLocation";
          const pagination = loadMore && allTrucks.length > 0 ? [startAfter(allTrucks[allTrucks.length - 1][orderByF])] : [];
          let dataQuery
          if(loadIsVerified){
            dataQuery = query(collection(db, "Trucks"),where("userId" ,"==", userId) ,where("withDetails" ,"==", true) ,  orderBy(orderByF)  , ...pagination, limit(15) );

          }else{
            dataQuery = query(collection(db, "Trucks"),where("userId" ,"==", userId) ,  orderBy(orderByF)  , ...pagination, limit(12) );
            
          }

        const unsubscribe = onSnapshot(dataQuery, (snapshot) => {
          const loadedData = [];
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added' || change.type === 'modified') {
              const dataWithId = { id: change.doc.id, ...change.doc.data() };
              loadedData.push(dataWithId);
            }
          });
             if (loadedData.length === 0) {
                setLoadMoreBtn(false);
            }
          setAllTrucks(loadedData);
          loadMore ? setLoadMoreData(false) : null;
        });
        
        // Clean up function to unsubscribe from the listener when the component unmounts
        return () => unsubscribe();
    } catch (err) {
      console.error(err);
    }
    }

  const [getOneTruck, setgetOneTruck] = useState([]);

    function getOneItemF(){

        const dataQuery = query(collection(db, "Trucks"), where("timeStamp", "==", itemKey) , where("userId", "==", userId) );

        const unsubscribe = onSnapshot(dataQuery, (snapshot) => {
          let loadedData = [];
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added' || change.type === 'modified') {
              const dataWithId = { id: change.doc.id, ...change.doc.data() };
              loadedData.push(dataWithId);
            }
          });

          setgetOneTruck(loadedData);
        });
        
        // Clean up function to unsubscribe from the listener when the component unmounts
        return () => unsubscribe();


    }


    useEffect(() => {
      fetchData()
      if(itemKey){
          getOneItemF()
      }
  }, []); 
  
  
  const [dspMoreInfo , setDspMoreInfo] = React.useState(false)

  
  function toggleDspMoreInfo(){
    setDspMoreInfo(prev=>!prev)
  }

    const [contactDisplay, setContactDisplay] = React.useState({ ['']: false });
    const toggleContact = (itemId) => {
      setContactDisplay((prevState) => ({
        ...prevState,
        [itemId]: !prevState[itemId],
      }));
    };

  const [ truckDetails , setTruckDDsp]=React.useState(false)

  function togglrTruckDe(){
    setTruckDDsp(prev=>!prev) 
    setTruckBuzDDsp(false)
    setDriverDDsp(false)
  }



  const [ truckBuzDe , setTruckBuzDDsp]=React.useState(false)

  function togglrTruckBuzDe(){
    setTruckBuzDDsp(prev=>!prev)
    setDriverDDsp(false)
    setTruckDDsp(false)
  }

  const [driverDetails , setDriverDDsp]=React.useState(false)

  function togglrDriverDe(){
     setTruckBuzDDsp(false)
    setTruckDDsp(false)
    setDriverDDsp(prev=>!prev)
  }


    const deleteItem = async (id , imageUrl) => {

    try {
        const response = await fetch(imageUrl, {
            method: 'DELETE',
        });

        if (response.ok) {
            const loadsDocRef = doc(db, 'Trucks', id);
            deleteDoc(loadsDocRef);
            console.log('Document deleted successfully');
        } else {
            console.log('Error deleting image:', response.status);
            const loadsDocRef = doc(db, 'Trucks', id);
            deleteDoc(loadsDocRef);
        }
    } catch (error) {
        console.log('Error deleting image:', error);
    } finally {
            const loadsDocRef = doc(db, 'Trucks', id);
            deleteDoc(loadsDocRef);
        console.log("Delleeeeeeeee")
    }
    }

     const checkAndDeleteExpiredItems = () => {
       allTrucks.forEach((item) => {
        
  if (item.withDetails && !item.isVerified ) {
  if (item.deletionTime === undefined) {
    deleteItem(item.id, item.imageUrl);
  } else {
    const deletionTime = item.deletionTime;
    const timeRemaining = deletionTime - Date.now();
    
    if (timeRemaining <= 0) {
      deleteItem(item.id, item.imageUrl);
    } else {
      setTimeout(() => {
        deleteItem(item.id);
      }, timeRemaining); 
    }
  }
}

  });
};
setTimeout(() => {
  checkAndDeleteExpiredItems();
}, 1000);



let mapThis = [...getOneTruck , ...allTrucks]
  const rendereIterms = mapThis.map((item)=>{

      const message =  `${item.companyName}
        Is this truck available
        ${item.truckType} from ${item.fromLocation} to ${item.toLocation}
        Trailer config ${item.trailerType}
        ${item.withDetails ? "It have detais":"It does not have details"}

        From: https://transix.net`  
    let contactMe = ( <View style={{ paddingLeft: 30 }}>

           {auth.currentUser&& <TouchableOpacity   style={{height : 30 ,  flexDirection:'row', alignItems :'center',color : "#008080" , borderWidth:1 , borderColor :'#008080', justifyContent:'center', marginBottom : 5 , marginTop:6}} >
            <Text style={{color:"#008080"}} >Message now</Text>
            <MaterialIcons name="chat" size={24} color="#008080" />

          </TouchableOpacity>}

            <TouchableOpacity onPress={() => Linking.openURL(`whatsapp://send?phone=${item.contact}&text=${encodeURIComponent(message)}`)} style={{height : 30 ,  flexDirection:'row', alignItems :'center',color : "#25D366" , borderWidth:1 , borderColor :'#25D366', justifyContent:'center', marginBottom:6}} >
            <Text style={{color : "#25D366"}} >WhatsApp </Text> 
            <FontAwesome6 name="whatsapp" size={24} color="#25D366" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => Linking.openURL(`tel:${item.contact}`)} style={{height : 30 ,  flexDirection:'row', alignItems :'center',color : "#0074D9" , borderWidth:1 , borderColor :'#0074D9', justifyContent:'center', marginBottom:4}} >
            <Text style={{color:'#0074D9'}} >Phone call</Text>
                <MaterialIcons name="call" size={24} color="#0074D9" />
          </TouchableOpacity>

          </View>)
    return(
         <View style={{padding :7, borderWidth : 2 , borderColor:'black', borderRadius:8 ,  shadowColor: '#6a0c0c',
        shadowOffset: { width: 1, height: 2 },
        shadowOpacity: 0.7,
        shadowRadius: 5,backgroundColor:'rgba(235, 142, 81, 0.07)' , marginBottom : 15}} >

      { item.isVerified&& <View style={{position : 'absolute' , top : 0 , right : 0 , backgroundColor : 'white' , zIndex : 66}} >
         <MaterialIcons name="verified" size={26} color="green" />
      </View>}

         {item.imageUrl&& <Image source={{uri: item.imageUrl }} style={{ height : 250 , borderRadius: 10}} />}
          {!item.imageUrl && <Image source={defaultImage} style={{ height: 280, borderRadius: 10 , width : 368}} />}
         
      <Text style={{marginLeft : 60 , fontWeight : 'bold', fontSize : 20}} >{item.CompanyName} </Text>
      { item.fromLocation && <View style={{flexDirection :'row',width:245}} >
        <Text style={{width :100}} >Route</Text>
        <Text style={{textOverflow:'ellipsis' }} >:  from  {item.fromLocation}  to  {item.toLocation} </Text>
      </View>}


       {!contactDisplay[item.id] && <View>

     {!blockVerifiedU &&!blackLWarning &&<View style={{flexDirection :'row'}} >
        <Text style={{width :100}} >Contact</Text>
        <Text>:  {item.contact}</Text>
      </View>}

          {item.truckTonnage && <View style={{flexDirection :'row'}} >
              <Text style={{width :100}} >Truck Ton</Text>
              <Text>:  {item.truckTonnage}</Text>
            </View>}
          { item.truckType && <View style={{flexDirection :'row'}} >
              <Text style={{width :100}} >Trailer Type</Text>
              <Text>:  {item.truckType}</Text>
            </View>}


          {item.trailerType && <View style={{flexDirection :'row'}} >
              <Text style={{width :100}} >Trailer Config</Text>
              <Text>:  {item.trailerType}</Text>
            </View>}
    { dspMoreInfo && item.additionalInfo &&  <View style={{flexDirection :'row',width:245}} >
        <Text style={{width :100}} > Additional Info</Text>
        <Text style={{textOverflow:'ellipsis' }} >:  {item.additionalInfo}</Text>
      </View>}
        </View>}

        {contactDisplay[item.id] && contactMe}


         <TouchableOpacity onPress={()=>toggleDspMoreInfo(item.id) } >
          <Text style={{color :'green'}} >{  dspMoreInfo[item.id]  ?"See Less": "See More"} </Text>
        </TouchableOpacity>


         {loadIsVerified && <TouchableOpacity onPress={togglrTruckDe} style={styles.buttonSelectStyle} >
            <Text style={{color:'white'}} >Truck Details </Text>
          </TouchableOpacity>}
          {truckDetails &&<View> 

          <View style={{flexDirection :'row'}} >
              <Text style={{width :60}} >Horse Reg </Text>
              <Text>:  {item.horseReg}</Text>

            </View>


          <View style={{flexDirection :'row'}} >
              <Text style={{width :60}} >Trailer Reg 1</Text>
              <Text>:  {item.trailerReg}</Text>
            </View>

          <View style={{flexDirection :'row'}} >
              <Text style={{width :60}} >Trailer Reg 2</Text>
              <Text>:  {item.scndTrailerReg}</Text>
            </View>
            </View>}

           {loadIsVerified && <TouchableOpacity onPress={togglrDriverDe} style={styles.buttonStyle} >
              <Text>Driver Details</Text>
            </TouchableOpacity>}
          {driverDetails &&<View>


     <View style={{flexDirection :'row'}} >
        <Text style={{width :60}} >Driver Name</Text>
        <Text>:  {item.driverName}</Text>
      </View>

     <View style={{flexDirection :'row'}} >
        <Text style={{width :60}} >Driver License</Text>
        <Text>:  {item.driverLicense} </Text>
      </View>


     <View style={{flexDirection :'row'}} >
        <Text style={{width :60}} >Driver pasport</Text>
        <Text>: {item.driverPassport}</Text>
      </View>
     <View style={{flexDirection :'row'}} >
        <Text style={{width :60}} >Driver Phone</Text>
        <Text>:  {item.driverPhone}</Text>
      </View>
        </View>}

           {loadIsVerified && <TouchableOpacity onPress={togglrTruckBuzDe} style ={styles.buttonSelectStyle} >
              <Text style={{color:'white',fontSize :17}} >business Details</Text>
            </TouchableOpacity>}
           {truckBuzDe && <View>
              
     <View style={{flexDirection :'row'}} >
        <Text style={{width :60}} >Owner Phone Number</Text>
        <Text>:  {item.truckOwnerPhone}</Text>
      </View>
     <View style={{flexDirection :'row'}} >
        <Text style={{width :60}} >Owner WhatsApp</Text>
        <Text>:  {item.truckOwnerWhatsApp}</Text>
      </View>
     <View style={{flexDirection :'row'}} >
        <Text style={{width :60}} >Business Location</Text>
        <Text>:  {item.businessLoction}</Text>
      </View>
         </View>}
         
{ !blockVerifiedU &&!blackLWarning &&<TouchableOpacity  onPress={()=>toggleContact(item.id) } style={{  width : 150 , height : 30 , alignItems :"center" , justifyContent :'center', backgroundColor:'#228B22' ,  borderRadius: 8, alignSelf:'center', margin:5 }} >
   <Text style={{color:"white"}} > Get In Touch Now</Text>
 </TouchableOpacity>}

        </View>       )
      })
      
return(
  <View>
          
        <View  style={{flexDirection : 'row' , height : 84  ,  paddingLeft : 6 , paddingRight: 15 , paddingTop:10 ,backgroundColor : '#6a0c0c' ,paddingTop : 15 , alignItems : 'center'}} >
        <TouchableOpacity style={{marginRight: 10}} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="white"style={{ marginLeft: 10 }}  />
        {!dspLoadMoreBtn &&allTrucks.length <= 0 && <Text style={{fontSize:19 ,fontWeight:'bold'}} >NO Trucks Available </Text> }
        </TouchableOpacity>
      <Text style={{fontSize: 20 , color : 'white'}} > {CompanyName} Trucks </Text>
       </View> 
        <ScrollView>
         {allTrucks.length > 0 ? rendereIterms   : <Text>Trucks Loading...</Text>}

         {allTrucks.length>=12 && dspLoadMoreBtn&& <TouchableOpacity onPress={()=> fetchData(true) } style={{ height :45 , backgroundColor :'#228B22', margin :25 , justifyContent:'center',borderRadius:25}} >
            {LoadMoreData && allTrucks.length>0 && <Text style={{alignSelf:'center'}} >Loading More Loads....... </Text> } 
        <Text style={{color :'white', fontSize :21 , textAlign :'center'}} >Load More......</Text>
      </TouchableOpacity>}

         <View style={{height : 550}} >
           </View>
        </ScrollView> 
        </View>
)
}
export default React.memo(SelectedUserTrucks) 

const styles = StyleSheet.create({
    buttonStyle : {
        height : 35,
        justifyContent : 'center' , 
        alignItems : 'center' ,
        width : 150 ,
        marginTop: 10 ,
        borderWidth: 2 ,
        borderColor:"#6a0c0c" ,
        borderRadius: 10
    } ,
    buttonSelectStyle :{
        backgroundColor :"#6a0c0c",
        height : 35,
        justifyContent : 'center' , 
        alignItems : 'center' ,
        width : 150 ,
        marginTop: 10 ,
        borderRadius: 10

    }
});
