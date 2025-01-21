import React, { useEffect, useState } from 'react';
import { db , auth} from '../config/fireBase';
import { View , Text , Image , ScrollView , TouchableOpacity,Share,Linking,StyleSheet} from 'react-native';
import { collection, onSnapshot,doc,deleteDoc,query,limit,startAfter ,where,orderBy} from 'firebase/firestore';

import { Ionicons } from "@expo/vector-icons";
// import defaultImage from '../images/logo.jpg'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import defaultImage from '../images/TRANSIX.jpg'
function DspOneTruckType ({route,navigation} ){ 

  const {truckType ,blockVerifiedU , blackLWarning  } = route.params
  const [allTrucks, setAllTrucks] = useState([]);
  const [truckTonnage , setTruckTonnage]= useState("")
  const [location , setlocation] =   React.useState("")
  
   function specifyLocation(loc){
    setlocation(loc)
  }



    const [dspLoadMoreBtn , setLoadMoreBtn]=React.useState(true)
  const [LoadMoreData , setLoadMoreData]=React.useState(false)
  function fetchData (loadMore){
    
    try {
      loadMore ? setLoadMoreData(true) : null;
          
          const orderByF = "fromLocation" ;
          const pagination = loadMore && allTrucks.length > 0 ? [startAfter(allTrucks[allTrucks.length - 1][orderByF])] : [];

          let dataQuery
              if(truckTonnage && location){

          dataQuery = query(collection(db, "Trucks"), orderBy(orderByF), ...pagination, limit(12) , where("truckType" ,"==",truckType) , where("truckTonnage" ,"==",truckTonnage), where("location" ,"==",location) );
                  }else if(truckTonnage){

          dataQuery = query(collection(db, "Trucks"), orderBy(orderByF), ...pagination, limit(12) , where("truckType" ,"==",truckType) , where("truckTonnage" ,"==",truckTonnage));
          }else if(location){

          dataQuery = query(collection(db, "Trucks"), orderBy(orderByF), ...pagination, limit(12) , where("truckType" ,"==",truckType)  , where("location" ,"==",location) );
          }else{

            dataQuery = query(collection(db, "Trucks"), orderBy(orderByF), ...pagination, limit(12) , where("truckType" ,"==",truckType) );
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
            setAllTrucks(loadMore ? [  ...allTrucks , ...loadedData] : loadedData);
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
  }, [truckTonnage]); 





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

        From:  https://transix.net/selectedUserLoads/${item.userId}/${item.companyName}/${item.deletionTime}/whatsApp `  // Set your desired message here
  
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

     {!blockVerifiedU && !blackLWarning &&<View style={{flexDirection :'row'}} >
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

       {!blockVerifiedU && !blackLWarning && <TouchableOpacity  onPress={()=>toggleContact(item.id) } style={{  width : 150 , height : 30 , alignItems :"center" , justifyContent :'center', backgroundColor:'#228B22' ,  borderRadius: 8, alignSelf:'center', margin:5 }} >
          <Text style={{color:"white"}} > Get In Touch Now</Text>
        </TouchableOpacity>}


    </View>
        )
      })

          const handleShareApp = async (companyName) => {
              try {
                const message = `I invite you to Transix!

Transix is a tech-driven business enhancing transportation and logistics services, connecting suppliers with demand for truckloads, vehicles, trailers, spare parts etc.

Contact us at +263716325160 with the message "Application" to swiftly receive the application download link.

Explore website at : https://transix.net/

Experience the future of transportation and logistics!`;

                const result = await Share.share({
                  message: message,
                });

                if (result) {
                  if (result.action === Share.sharedAction) {
                    if (result.activityType) {
                      // Shared with activity type of result.activityType
                    } else {
                      // Shared
                    }
                  } else if (result.action === Share.dismissedAction) {
                    // Dismissed
                  }
                } else {
                  // Handle the case where result is undefined or null
                }
              } catch (error) {
                alert(error.message);
              }
            };


 
return(
  <View  >
       <View  style={{flexDirection : 'row' , height : 74  ,  paddingLeft : 6 , paddingRight: 15 , paddingTop:10 ,backgroundColor : '#6a0c0c' ,paddingTop : 15 , alignItems : 'center', marginBottom : 10}} >
         <TouchableOpacity style={{marginRight: 10}} onPress={() => navigation.goBack()}> 
            <Ionicons name="arrow-back" size={28} color="white"style={{ marginLeft: 10 }}  />
        </TouchableOpacity> 
        <Text style={{fontSize: 20 , color : 'white'}} > {truckType} </Text>
       </View>

           <ScrollView horizontal style={{marginLeft:10}}>
            <TouchableOpacity style={truckTonnage==="1-3 T"?styles.btnIsActive : styles.bynIsUnActive }  onPress={()=>setTruckTonnage("1-3 T" ) } >
                    <Text style={truckTonnage==="1-3 T"?{color : 'white'}: {color : 'black'} }>1-3 T</Text>
                </TouchableOpacity>

                <TouchableOpacity style={truckTonnage==="4 - 7 T"?styles.btnIsActive : styles.bynIsUnActive }  onPress={()=> setTruckTonnage("4 - 7 T") }>
                    <Text style={truckTonnage==="4 - 7 T"?{color : 'white'}: {color : 'black'} } >4 - 7 T</Text>
                </TouchableOpacity>

                    <TouchableOpacity style={truckTonnage==="8 - 14 T"?styles.btnIsActive : styles.bynIsUnActive }    onPress={()=> setTruckTonnage("8 - 14 T" ) }>
                        <Text  style={truckTonnage==="8 - 14 T"?{color : 'white'}: {color : 'black'} } >8 - 14 T</Text>
                    </TouchableOpacity>
                   

                    <TouchableOpacity style={truckTonnage==="15 - 25 T"?styles.btnIsActive : styles.bynIsUnActive }  onPress={()=> setTruckTonnage("15 - 25 T" ) } >
                        <Text style={truckTonnage==="15 - 25 T"?{color : 'white'}: {color : 'black'} } >15 - 25 T</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={truckTonnage==="26 T +++"?styles.btnIsActive : styles.bynIsUnActive }  onPress={()=> setTruckTonnage("26 T +++") }>
                        <Text style={truckTonnage==="26 T +++"?{color : 'white'}: {color : 'black'} } >26 T +++ </Text>
                    </TouchableOpacity>
                   
       </ScrollView>

              <ScrollView style={{margin:10,}} horizontal showsHorizontalScrollIndicator={false} >
                 <TouchableOpacity onPress={()=>specifyLocation('International')} style={location==="International"?styles.btnIsActive : styles.bynIsUnActive } > 
            <Text style={location==="International" ? {color : 'white'}: {color : 'black'} }>International</Text>
          </TouchableOpacity>
                <Text style={{ fontWeight:'bold'}} > local operators</Text>
          <TouchableOpacity onPress={()=>specifyLocation('Zimbabwe')} style={location==="Zimbabwe"?styles.btnIsActive : styles.bynIsUnActive } > 
            <Text style={location==="Zimbabwe" ? {color : 'white'}: {color : 'black'} }>Zimbabwe </Text>
          </TouchableOpacity>

            <TouchableOpacity onPress={()=> specifyLocation('SouthAfrica') } style={location==="SouthAfrica"?styles.btnIsActive : styles.bynIsUnActive } >
                  <Text style={location==="SouthAfrica" ? {color : 'white'}: {color : 'black'} } >  South Africa</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={()=> specifyLocation('Namibia') } style={location==="Namibia"?styles.btnIsActive : styles.bynIsUnActive }>
                  <Text style={location==="Namibia" ? {color : 'white'}: {color : 'black'} }>Namibia </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={()=> specifyLocation('Tanzania') } style={location==="Tanzania"?styles.btnIsActive : styles.bynIsUnActive }>
                  <Text style={location==="Tanzania" ? {color : 'white'}: {color : 'black'} }> Tanzania</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={()=>specifyLocation ('Mozambique') } style={location==="Mozambique"?styles.btnIsActive : styles.bynIsUnActive }>
                  <Text style={location==="Mozambique" ? {color : 'white'}: {color : 'black'} }>Mozambique </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={()=> specifyLocation('Zambia') } style={location==="Zambia"?styles.btnIsActive : styles.bynIsUnActive }>
                  <Text style={location==="Zambia" ? {color : 'white'}: {color : 'black'} }> Zambia</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={()=> specifyLocation('Botswana') } style={location==="Botswana"?styles.btnIsActive : styles.bynIsUnActive } >
                  <Text style={location==="Botswana" ? {color : 'white'}: {color : 'black'} }>Botswana </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={()=> specifyLocation('Malawi') }style={location==="Malawi"?styles.btnIsActive : styles.bynIsUnActive } >
                  <Text style={location==="Malawi" ? {color : 'white'}: {color : 'black'} }>Malawi </Text>
              </TouchableOpacity>
                </ScrollView>
               
        <ScrollView style={{padding : 10 }}>
         {allTrucks.length > 0 ? rendereIterms   : <Text>All {truckTonnage} {truckType} Loading...</Text>}

            {!dspLoadMoreBtn &&allTrucks.length <= 0 && !truckTonnage &&<Text style={{fontSize:17 ,fontWeight:'bold'}} >NO {truckType} available</Text> }
            {!dspLoadMoreBtn &&allTrucks.length <= 0 && truckTonnage &&<Text style={{fontSize:17 ,fontWeight:'bold'}} >NO {truckTonnage} {truckType} available</Text> }
            
            {!dspLoadMoreBtn &&allTrucks.length <= 0 &&<TouchableOpacity onPress={handleShareApp} >

              <Text style={{fontSize : 20 , textDecorationLine:'underline'}} >Please share or recommend our app for more services and  products!  </Text> 
            </TouchableOpacity>}
            
          {LoadMoreData && allTrucks.length>0 && <Text style={{alignSelf:'center'}} >Loading More {truckType}....... </Text> } 
         {allTrucks.length >=12 && dspLoadMoreBtn&& <TouchableOpacity onPress={()=> fetchData(true) } style={{ height :45 , backgroundColor :'#228B22', margin :25 , justifyContent:'center',borderRadius:25}} >
        <Text style={{color :'white', fontSize :21 , textAlign :'center'}} >Load More {truckType} ......</Text>
      </TouchableOpacity>}
         <View style={{height : 550}} >
           </View>
        </ScrollView>
        </View>
)
}
export default DspOneTruckType 


const styles = StyleSheet.create({
  bynIsUnActive : {
    // width : 50 ,
    paddingLeft : 6 ,
    paddingRight :4 ,
    color :'white'  , 
    borderWidth:1, 
    alignItems :'center' ,
    justifyContent :'center' ,
    marginRight : 7 ,
    borderRadius : 15
  },
  btnIsActive : {
    paddingLeft : 5 ,
    paddingRight :6 ,
    color :'white'  , 
    alignItems :'center' ,
    justifyContent :'center' ,
    marginRight : 7 ,
    borderRadius : 15 ,
    backgroundColor : 'rgb(129,201,149)'
  }

});