import React,{useState,useEffect} from "react";
import { View , Text , ScrollView , TouchableOpacity,TextInput,Share} from "react-native";

import { collection, onSnapshot ,limit ,query} from 'firebase/firestore';

import { db } from "../config/fireBase";
// import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { Ionicons } from "@expo/vector-icons";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

function SearchIterms({navigation}){
      const [loadsList, setLoadsList] = useState([]);

  let [textTyped , setTextTyped] = React.useState("")

  useEffect(() => {
    try {
        const dataQuery = query(collection(db, "Loads"), );

        const unsubscribe = onSnapshot(dataQuery, (snapshot) => {
          let loadedData = [];
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added' || change.type === 'modified') {
              const dataWithId = { id: change.doc.id, ...change.doc.data() };
              loadedData.push(dataWithId);
            }
          });

          loadedData = loadedData.sort((a, b) => b.timeStamp - a.timeStamp);
          setLoadsList(loadedData);
        });
        
        // Clean up function to unsubscribe from the listener when the component unmounts
        return () => unsubscribe();
    } catch (err) {
      console.error(err);
    }
  }, []); 





  const [allTrucks, setAllTrucks] = useState([]);

  useEffect(() => {
    try {
        const dataQuery = query(collection(db, "Trucks"), );

        const unsubscribe = onSnapshot(dataQuery, (snapshot) => {
          let loadedData = [];
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added' || change.type === 'modified') {
              const dataWithId = { id: change.doc.id, ...change.doc.data() };
              loadedData.push(dataWithId);
            }
          });

          loadedData = loadedData.sort((a, b) => b.timeStamp - a.timeStamp);
          setAllTrucks(loadedData);
        });
        
        // Clean up function to unsubscribe from the listener when the component unmounts
        return () => unsubscribe();
    } catch (err) {
      console.error(err);
    }
  }, []);





        const [filteredData, setFilteredData] = React.useState([]);
        const [filteredDataTrucks , setFilteredDataTruks] = React.useState([]);
        const [wordEntered, setWordEntered] = React.useState("");
      
        const handleFilter = (text) => {
          const searchWord = text
          setTextTyped(text)
          const newFilter = loadsList.filter((value) => {
            return ( value.fromLocation || value.toLocation ).toLowerCase().includes(searchWord.toLowerCase());
          });
      
          const newFilterTrucks = allTrucks.filter((value) => {
            return ( value.fromLocation || value.toLocation ).toLowerCase().includes(searchWord.toLowerCase());
          });
          if (searchWord === "") {
            setFilteredData([]);
          } else {
            setFilteredData(newFilter);
            setFilteredDataTruks(newFilterTrucks)
          }
        };

        const clearInput = () => {
          setFilteredData([]); 
          setWordEntered("");
        };
        

          const displaySearchedTrucks =  filteredDataTrucks.slice(0, 15).map((value , key)=>{
            return(
              <TouchableOpacity  style={{flex : 1, marginBottom :6 , padding : 6}} key={value.id} onPress={()=> navigation.navigate('selectedUserTrucks',{userId : value.userId,itemKey :value.timeStamp ,CompanyName:value.CompanyName} ) }>

            {value.isVerified&& <View style={{position : 'absolute' , top : 0 , right : 0 , backgroundColor : 'white' , zIndex : 66 }} >
              <MaterialIcons name="verified" size={24} color="green" />
            </View>}
            <Text style={{color:'#6a0c0c' , fontSize:15,textAlign :'center' ,fontSize: 17}}>{value.CompanyName} </Text>
            <Text >from {value.fromLocation } to {value.toLocation} </Text>
            {value.truckTonnage &&<Text> Truck Ton : {value.truckTonnage}</Text>}
            <Text>Trailer Type : {value.truckType}</Text>
              </TouchableOpacity>
            )
          })
          

        const displaySearched =   filteredData.slice(0, 15).map((value , key)=>{
            return(
            <TouchableOpacity  style={{flex : 1, marginBottom :6 , padding : 6}} key={value.id} onPress={()=> navigation.navigate('selectedUserLoads',{userId : value.userId ,itemKey: value.timeStamp ,} ) }>

            {value.isVerified&& <View style={{position : 'absolute' , top : 0 , right : 0 , backgroundColor : 'white' , zIndex : 66 }} >
                  <MaterialIcons name="verified" size={24} color="green" />
            </View>}
            <Text style={{color:'#6a0c0c' , fontSize:15,textAlign :'center' ,fontSize: 17}}>{value.companyName} </Text>
            <Text style={{fontSize:17}} >Commodity {value.typeofLoad}  </Text>
            <Text style={{color:'green',fontWeight:'bold',fontSize:15}} >Rate {value.ratePerTonne} </Text>
            <Text >from {value.fromLocation } to {value.toLocation} </Text>
              </TouchableOpacity>
            )
          })
          
           const handleShareApp = async (companyName) => {

              try {
                const message = `I invite you to Transix!

Transix is a tech-driven business enhancing transportation and logistics services, connecting suppliers with demand for truckloads, vehicles, trailers, and spare parts etc.

Contact us at +263716325160 with the message "Application" to swiftly receive the application download link.

Explore Application at : https://play.google.com/store/apps/details?id=com.yayapana.Transix
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
            <View>
            <View  style={{ height : 84  ,   paddingTop:10  ,paddingTop : 15 , alignItems : 'center' , paddingTop : 10  , alignItems : 'center', justifyContent:'center',borderColor:'#6a0c0c', borderWidth:2}} >

               <View  style={{flexDirection : 'row' ,height : 40 , backgroundColor :'#6a0c0c' , alignItems : 'center'}}>
                <TouchableOpacity style={{marginRight: 10}} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={30} color="white"style={{ marginLeft: 10 }}  />
                </TouchableOpacity>
                <TextInput
                    placeholder="Search Route"
                    onChangeText={(text) => handleFilter(text)}  
                    style={{height:40, flex : 1 ,fontSize : 17 , backgroundColor: '#6a0c0c' , color:'white'}}      
                    placeholderTextColor="white"    
                    /> 
                    </View>


            </View> 
            { allTrucks.length <=0  && loadsList.length <= 0 &&<Text>Loading......</Text>}

            <View style={{flexDirection :'row' , }} >
             { filteredData.length > 0 && (
               <ScrollView style={{width:280}} >
                {<Text style={{fontSize : 20 , textDecorationLine:'underline '}} >
                  {loadsList.length >0  && filteredData.length <= 0  ?"Load Not Available":  "Available Loads"}  </Text>}
              {displaySearched}
             </ScrollView>

              )
              } 

                <View style={{ width: 2, backgroundColor: '#6a0c0c' }} >
                  </View>

            { filteredDataTrucks.length > 0 && <ScrollView >
                {<Text style={{fontSize : 20 , textDecorationLine:'underline '}} >
                  {allTrucks.length >0  && filteredDataTrucks.length <= 0  ?"Trucks Not Available":  "Available Trucks"}  </Text>}
              {displaySearchedTrucks}
             </ScrollView>}


             </View>

                {textTyped && allTrucks.length >0  && filteredDataTrucks.length <= 0 &&loadsList.length >0  && filteredData.length <= 0  &&<Text style={{fontSize : 20 , }} >  No Loads Or Truck Available </Text>}
                {textTyped && allTrucks.length >0  && filteredDataTrucks.length <= 0 &&loadsList.length >0  && filteredData.length <= 0  &&<TouchableOpacity onPress={handleShareApp} >
                  <Text style={{fontSize : 20 ,textDecorationLine:'underline' }} > Share or recommend our app for more services and  products!</Text>
                </TouchableOpacity>}

          </View>
           )
}
export default React.memo(SearchIterms)