import React,{useState,useEffect} from "react";
import { View , Text , ScrollView , TouchableOpacity,TextInput} from "react-native";

import { collection, onSnapshot ,doc ,where,query} from 'firebase/firestore';
import { db } from "../config/fireBase";

import { Ionicons } from "@expo/vector-icons";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

function SearchInShop({navigation}){

  const loadsCollection = collection(db, "Shop");
      const [loadsList, setLoadsList] = useState([]);

  let [textTyped , setTextTyped] = React.useState("")
  
     useEffect(() => {
    try {
        const dataQuery = query(collection(db, "Shop"), where("sellOBuy" ,"==", "forSell" ) );

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


  const [lookingFor , setLookingFor]=React.useState([])
  useEffect(() => {
    try {
        const dataQuery = query(collection(db, "Shop"), where("sellOBuy","==","toBuy" ) );

        const unsubscribe = onSnapshot(dataQuery, (snapshot) => {
          let loadedData = [];
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added' || change.type === 'modified') {
              const dataWithId = { id: change.doc.id, ...change.doc.data() };
              loadedData.push(dataWithId);
            }
          });

          loadedData = loadedData.sort((a, b) => b.timeStamp - a.timeStamp);
          setLookingFor(loadedData);
        });
        
        // Clean up function to unsubscribe from the listener when the component unmounts
        return () => unsubscribe();
    } catch (err) {
      console.error(err);
    }
  }, []);


        const [filteredData, setFilteredData] = React.useState([]);
        const [newFilterLookingFor , setnewFilterLookingFor]=React.useState([])
        const [wordEntered, setWordEntered] = React.useState("");
          const handleFilter = (text) => {
        const searchWord = text;
        setTextTyped(text)
        const newFilter = loadsList.filter((value) => {
          const productName = value.productName ? value.productName.toLowerCase() : '';
          return ( productName.includes(searchWord.toLowerCase()));
        });

          const newFilterLoookingFor = lookingFor.filter((value) => {
          const productName = value.productName ? value.productName.toLowerCase() : '';
          return ( productName.includes(searchWord.toLowerCase()));
          });

        if (searchWord === "") {
          setFilteredData([]);
        } else {
          setFilteredData(newFilter);
          setnewFilterLookingFor(newFilterLoookingFor)
        }
      };
       



        const clearInput = () => {
          setFilteredData([]); 
          setWordEntered("");
        };
        


        const displaySearchedScnd =  newFilterLookingFor.slice(0, 15).map((value , key)=>{
            return(
      <TouchableOpacity  key={value.id}  onPress={()=>navigation.navigate(`oneFirmsShop` ,{ userId: value.userId ,itemKey : value.id , sellOBuyG :value.sellOBuy,location : value.location , specproductG : value.specproduct ,CompanyName : value.CompanyName,itemKey :value.timeStamp   })} style={{  marginBottom : 4,  padding :7 ,borderWidth : 3 , borderColor:'#6a0c0c', borderRadius:8 ,  }}>

            {value.isVerified&& <View style={{position : 'absolute' , top : 0 , right : 0 , backgroundColor : 'white' , zIndex : 66 }} >
                  <MaterialIcons name="verified" size={24} color="green" />
            </View>}
            <Text style={{color:'#6a0c0c' , fontSize:15,textAlign :'center' ,fontSize: 17}}>{value.CompanyName} </Text>
            <Text >{value.specproduct} : {value.productName}</Text>
              { value.price &&<View style={{flexDirection :'row'}} >
                <Text style={{width :40}} >{value.sellOBuy==='forSell' ?'Price':'Budget' } </Text>
              {<Text style={{color:'green'}} >:  {value.currency?"USD" : "Rand" }  {value.price}</Text>} 
              </View>}
                {value.productLoc &&<View style={{flexDirection :'row'}} >
                <Text style={{width :100}} >Product Loc</Text>
               {<Text>:  {value.productLoc}  </Text>} 
               </View>}
      
            <Text > {value.location} store at {value.shopLocation} </Text>
              </TouchableOpacity>
            )
          })



        const displaySearched =  filteredData.slice(0, 15).map((value , key)=>{
            return(
      <TouchableOpacity  key={value.id}  onPress={()=>navigation.navigate(`oneFirmsShop` ,{ userId: value.userId ,itemKey : value.id , sellOBuyG :value.sellOBuy,location : value.location , specproductG : value.specproduct ,CompanyName : value.CompanyName ,itemKey :value.timeStamp })} style={{  marginBottom : 4,  padding :7 ,borderWidth : 3 , borderColor:'#6a0c0c', borderRadius:8 ,  }}>

            {value.isVerified&& <View style={{position : 'absolute' , top : 0 , right : 0 , backgroundColor : 'white' , zIndex : 66 }} >
                  <MaterialIcons name="verified" size={24} color="green" />
            </View>}
            <Text style={{color:'#6a0c0c' , fontSize:15,textAlign :'center' ,fontSize: 17}}>{value.CompanyName} </Text>
            <Text >{value.specproduct} : {value.productName}</Text>
              { value.price &&<View style={{flexDirection :'row'}} >
                <Text style={{width :40}} >{value.sellOBuy==='forSell' ?'Price':'Budget' } </Text>
              {<Text style={{color:'green'}} >:  {value.currency?"USD" : "Rand" }  {value.price}</Text>} 
              </View>}
                {value.productLoc &&<View style={{flexDirection :'row'}} >
                <Text style={{width :100}} >Product Loc</Text>
               {<Text>:  {value.productLoc}  </Text>} 
               </View>}
      
            <Text > {value.location} store at {value.shopLocation} </Text>
              </TouchableOpacity>
            )
          })
          
           return(
            <View>
            <View  style={{ height : 84  ,   paddingTop:10  ,paddingTop : 15 , alignItems : 'center' , paddingTop : 10  , alignItems : 'center', justifyContent:'center',borderColor:'#6a0c0c', borderWidth:2}} >

              <View  style={{flexDirection : 'row' ,height : 40 , backgroundColor :'#6a0c0c' , alignItems : 'center'}}>
                <TouchableOpacity style={{marginRight: 10}} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={28} color="white"style={{ marginLeft: 10 }}  />
                </TouchableOpacity>
                <TextInput
                    placeholder="Search  Product"
                    onChangeText={(text) => handleFilter(text)}  
                    style={{height:40, flex : 1 ,fontSize : 17 , backgroundColor: '#6a0c0c' , color:'white'}}      
                    placeholderTextColor="white"    
                    /> 
                    </View>
            </View> 
          
            { lookingFor.length <=0  && loadsList.length <= 0 &&<Text>Loading......</Text>}
                   <View style={{flexDirection :'row' , }} >
             { filteredData.length > 0 && (
              <ScrollView style={{width:320}} >
              <Text style={{fontSize : 20 , textDecorationLine:'underline '}}> For Sale</Text>
              {displaySearched}
              <View style={{height:300}} ></View>
             </ScrollView>

              )
              } 

                <View style={{ width: 2, backgroundColor: '#6a0c0c' }} >
                  </View>

            { displaySearchedScnd.length > 0 && <ScrollView >
              <Text style={{fontSize : 20 , textDecorationLine:'underline '}}> Looking For </Text>
              {displaySearchedScnd}
              <View style={{height:300}} ></View>
             </ScrollView>}

             </View>

                {textTyped && lookingFor.length >0  && displaySearchedScnd.length <= 0 &&loadsList.length >0  && filteredData.length <= 0  &&<Text style={{fontSize : 20 , textDecorationLine:'underline'}} > Share or recommend our app for more services or products!</Text>}

                  {textTyped && lookingFor.length >0  && displaySearchedScnd.length <= 0 &&loadsList.length >0  && filteredData.length <= 0  &&<Text style={{fontSize : 20 ,textDecorationLine:'underline'  }} >You can also add what you are looking For or selling</Text>}



          </View>
           )
}
export default React.memo(SearchInShop)