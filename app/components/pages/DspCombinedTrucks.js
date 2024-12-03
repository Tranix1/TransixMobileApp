import React, { useEffect, useState } from 'react';
import { collection, onSnapshot,doc,deleteDoc,query,limit,startAfter } from 'firebase/firestore';
import { db , auth} from '../config/fireBase';
import { View , Text , Image , ScrollView , TouchableOpacity , Linking} from 'react-native';
import defaultImage from '../images/TRANSIX.jpg'
import { Ionicons } from "@expo/vector-icons";

import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
// import {useNavigate} from '@react-navigation/native-stack'
import { useNavigation } from '@react-navigation/native';

function DspAllTrucks(){    

const navigation = useNavigation();

  const [allTrucks, setAllTrucks] = useState([]);

     


    const [dspLoadMoreBtn , setLoadMoreBtn]=React.useState(true)
  const [LoadMoreData , setLoadMoreData]=React.useState(false)
  function fetchData (loadMore){
    
    try {
      loadMore ? setLoadMoreData(true) : null;
          
          const orderByF = "fromLocation";
          const pagination = loadMore && allTrucks.length > 0 ? [startAfter(allTrucks[allTrucks.length - 1][orderByF])] : [];
          let dataQuery = query(collection(db, "Trucks"), orderByF, ...pagination, limit(12) );

            

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
      alert(err);
    }
    }


    useEffect(() => {
      fetchData()
  }, []); 





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
    }
    }

     const checkAndDeleteExpiredItems = () => {
       allTrucks.forEach((item) => {
        
  if (item.withDetails && !item.isVerified ) {
  if (!item.deletionTime) {
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

  const rendereIterms = allTrucks.map((item)=>{
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
      <View  key={item.id} style={{padding :7, borderWidth : 2 , borderColor:'black', borderRadius:8 ,  shadowColor: '#6a0c0c',
        shadowOffset: { width: 1, height: 2 },
        shadowOpacity: 0.7,
        shadowRadius: 5,backgroundColor:'rgba(235, 142, 81, 0.07)' , marginBottom : 15}}  >

      { item.isVerified&& <View style={{position : 'absolute' , top : 0 , right : 0 , backgroundColor : 'white' , zIndex : 66}} >
            <VerifiedIcon style={{color : 'green'}} />
      </View>}
      
         {item.imageUrl&& <Image source={{uri: item.imageUrl }} style={{ height : 250 , borderRadius: 10}} />}
          {!item.imageUrl && <Image source={defaultImage} style={{ height: 280, borderRadius: 10 , width : 368}} />}
        
      <Text style={{marginLeft : 60 , fontWeight : 'bold', fontSize : 20}} >{item.CompanyName} </Text>
      { item.fromLocation && <View style={{flexDirection :'row'}} >
        <Text style={{width :100}} >Route</Text>
        <Text>:  from  {item.fromLocation}  to  {item.toLocation} </Text>
      </View>}


       {!contactDisplay[item.id] && <View>

     <View style={{flexDirection :'row'}} >
        <Text style={{width :100}} >Contact</Text>
        <Text>:  {item.contact}</Text>
      </View>

          { item.truckType && <View style={{flexDirection :'row'}} >
              <Text style={{width :100}} >Trailer Type</Text>
              <Text>:  {item.truckType}</Text>
            </View>}

          {item.trailerType && <View style={{flexDirection :'row'}} >
              <Text style={{width :100}} >Trailer Config</Text>
              <Text>:  {item.trailerType}</Text>
            </View>}

    { dspMoreInfo && item.additionalInfo &&  <View style={{flexDirection :'row'}} >
        <Text style={{width :100}} > Additional Info</Text>
        <Text>:  {item.additionalInfo}</Text>
      </View>}
        </View>}

        {contactDisplay[item.id] && contactMe}


         <TouchableOpacity onPress={()=>toggleDspMoreInfo(item.id) } >
          <Text style={{color :'green'}} >{  dspMoreInfo[item.id]  ?"See Less": "See More"} </Text>
        </TouchableOpacity>

        <TouchableOpacity  onPress={()=>toggleContact(item.id) } style={{  width : 150 , height : 30 , alignItems :"center" , justifyContent :'center', backgroundColor:'#228B22' ,  borderRadius: 8, alignSelf:'center', margin:5 }} >
          <Text style={{color:"white"}} > Get In Touch Now</Text>
        </TouchableOpacity>


    </View>
        )
      })
 
return(
        <ScrollView style={{padding : 10 }}>
         {allTrucks.length > 0 ? rendereIterms   : <Text>All Trucks Loading...</Text>}
         <View style={{height : 550}} >
           </View>
            {dspLoadMoreBtn &&allTrucks.length > 0 && <Text style={{fontSize:19 ,fontWeight:'bold'}} >NO Trucks Available </Text> }
          {LoadMoreData && allTrucks.length>0 && <Text style={{alignSelf:'center'}} >Loading More Trucks....... </Text> } 
         {allTrucks.length >=12 && dspLoadMoreBtn&& <TouchableOpacity onPress={()=> fetchData(true) } style={{ height :45 , backgroundColor :'#228B22', margin :25 , justifyContent:'center',borderRadius:25}} >
        <Text style={{color :'white', fontSize :21 , textAlign :'center'}} >Load More......</Text>
      </TouchableOpacity>}
        </ScrollView>
)
}
export default DspAllTrucks 
