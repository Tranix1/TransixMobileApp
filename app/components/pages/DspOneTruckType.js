import React, { useEffect, useState } from 'react';
import { db , auth} from '../config/fireBase';
import { View , Text , Image , ScrollView , TouchableOpacity} from 'react-native';
import {onSnapshot ,  query ,collection,where } from "firebase/firestore"

import { Ionicons } from "@expo/vector-icons";
// import defaultImage from '../images/logo.jpg'

import defaultImage from '../images/TRANSIX.jpg'
function DspOneTruckType ({route,navigation} ){ 

  const {truckType  } = route.params
  const [allTrucks, setAllTrucks] = useState([]);


  useEffect(() => {
    try {
        const dataQuery = query(collection(db, "Trucks"), where("truckType" ,"==", truckType));

        const unsubscribe = onSnapshot(dataQuery, (snapshot) => {
          const loadedData = [];
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added' || change.type === 'modified') {
              const dataWithId = { id: change.doc.id, ...change.doc.data() };
              loadedData.push(dataWithId);
            }
          });
                const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
      };
      const shuffledData = shuffleArray(loadedData);

      setAllTrucks(shuffledData);

        });
        
        // Clean up function to unsubscribe from the listener when the component unmounts
        return () => unsubscribe();
    } catch (err) {
      console.error(err);
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
      <View  key={item.id}>

      { item.isVerified&& <View style={{position : 'absolute' , top : 0 , right : 0 , backgroundColor : 'white' , zIndex : 66}} >
            <VerifiedIcon style={{color : 'green'}} />
      </View>}
      
         {item.imageUrl&& <Image source={{uri: item.imageUrl }} style={{ height : 250 , borderRadius: 10}} />}
          {!item.imageUrl && <Image source={defaultImage} style={{ height: 200, borderRadius: 10 , width : 368}} />}
        
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

    {item.trailerType &&  <View style={{flexDirection :'row'}} >
        <Text style={{width :100}} >Trailer Type </Text>
        <Text>:  {item.trailerType}</Text>
      </View>}

    { dspMoreInfo && item.additionalInfo &&  <View style={{flexDirection :'row'}} >
        <Text style={{width :100}} > Additional Info</Text>
        <Text>:  {item.additionalInfo}</Text>
      </View>}
        </View>}

        {contactDisplay[item.id] && contactMe}

          <View>
          <TouchableOpacity onPress={toggleDspMoreInfo} >
            <Text>See more </Text>
          </TouchableOpacity>
          <TouchableOpacity  onPress={()=>toggleContact(item.id) } style={{marginTop : 7 , marginBottom :10}} >
            <Text style={{textDecorationLine:'underline'}} > get In Touch now</Text>
          </TouchableOpacity>
        </View>

    </View>
        )
      })
  
 
return(
  <View  >
       <View  style={{flexDirection : 'row' , height : 74  ,  paddingLeft : 6 , paddingRight: 15 , paddingTop:10 ,backgroundColor : '#6a0c0c' ,paddingTop : 15 , alignItems : 'center', marginBottom : 10}} >
         <TouchableOpacity style={{marginRight: 10}} onPress={() => navigation.goBack()}> 
            <Ionicons name="arrow-back" size={28} color="white"style={{ marginLeft: 10 }}  />
        </TouchableOpacity> 
        <Text style={{fontSize: 20 , color : 'white'}} > {truckType} </Text>
       </View>
        <ScrollView>
         {allTrucks.length > 0 ? rendereIterms   : <Text>Loading...</Text>}
         <View style={{height : 550}} >
           </View>
        </ScrollView> 
        
        </View>
)
}
export default React.memo(DspOneTruckType) 

