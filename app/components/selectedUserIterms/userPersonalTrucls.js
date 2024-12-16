import React, { useEffect, useState } from 'react';
import { View , Text , Image , ScrollView,StyleSheet,TouchableOpacity } from 'react-native';
import { auth ,db} from "../config/fireBase";

import { Ionicons } from "@expo/vector-icons";
import { collection,  query , where,onSnapshot ,deleteDoc,doc,limit,startAfter,orderBy } from 'firebase/firestore';
function SelectedUserTrucks ({route,navigation} ){ 

  const {userId , loadIsVerified ,CompanyName }= route.params
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


    useEffect(() => {
      fetchData()
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
        setSpinnerItem(false);
    } finally {
            const loadsDocRef = doc(db, 'Trucks', id);
            deleteDoc(loadsDocRef);
        setSpinnerItem(false);
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




  const rendereIterms = allTrucks.map((item)=>{

    let contactMe = ( <View style={{ paddingLeft: 30 }}>

        {auth.currentUser &&   <TouchableOpacity  onPress={()=>navigate(`/message/${item.userId}/${item.CompanyName} `)}  >
            <Text>Message now</Text>
          </TouchableOpacity>}

          <TouchableOpacity onPress={() => Linking.openURL(`tel:${item.contact}`)}>
            <Text>Phone call</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => Linking.openURL(`whatsapp://send?phone=${item.contact}`)}>
            <Text>WhatsApp</Text>
          </TouchableOpacity>

          </View>)
    return(
         <View style={{marginBottom:18 , padding:10}} >

      { item.isVerified&& <View style={{position : 'absolute' , top : 0 , right : 0 , backgroundColor : 'white' , zIndex : 66}} >
            <VerifiedIcon style={{color : 'green'}} />
      </View>}

         {<Image source={{uri: item.imageUrl }} style={{ height : 250 , borderRadius: 10}} />}
          <Text>{item.CompanyName} </Text>
          <Text>From {item.fromLocation} To {item.toLocation} </Text>

          <View style={{flexDirection :'row'}} >
              <Text style={{width :100}} >Trailer Type</Text>
              <Text>:  {item.truckType}</Text>
            </View>
          <View style={{flexDirection :'row'}} >
              <Text style={{width :100}} >Trailer Config</Text>
              <Text>:  {item.trailerType}</Text>
            </View>

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
