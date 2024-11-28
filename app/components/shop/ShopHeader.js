import React from "react";
import {View , TouchableOpacity , Text , StyleSheet , ScrollView} from "react-native"
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Ionicons } from '@expo/vector-icons';
import { auth } from "../config/fireBase";
import {doc , onSnapshot} from "firebase/firestore"
import { db } from "../config/fireBase";
function ShopHeader({navigation ,route}){

  const {location , specproduct} = route.params
   const [sellOBuy , setSellOBuy] = React.useState('forSell')
  let userId

   if(auth.currentUser){
     userId = auth.currentUser.uid
   }

    function toggleSellOBuy(value){
        setSellOBuy(value)
        navigation.navigate(`DspShop`, {location: location , specproduct: specproduct , sellOBuy :sellOBuy  , sellOBuy : sellOBuy})
        setSmallMenu(false)
    }

    const [smallMenu , setSmallMenu] = React.useState(false)
    function toggleSmallMenu(){
        setSmallMenu(prev => !prev)
    }

  const [currentUser, setCurrentUser] = React.useState(null);

  React.useEffect(() => {
    // Check if user is already signed in
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });

    // Cleanup function
    return () => unsubscribe();
  }, []);


   const [ username , setUsername] = React.useState("");

  React.useEffect(() => {
  let unsubscribe;

  try {
    if (auth.currentUser) {
      // const userId = auth.currentUser.uid;
      const docRef = doc(db, 'personalData', userId);

      unsubscribe = onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
          setUsername(doc.data().username);
        }
      });
    }
  } catch (err) {
    console.error(err);
  }

  return () => {
    if (unsubscribe) {
      unsubscribe();
    }
  };
}, [currentUser]);

  function checkAuth(){
      if(!currentUser){
      navigation.navigate("createUser")
    }else if(currentUser &&!username){
      navigation.navigate("addPersnoalInfo")
    }else {
        toggleSmallMenu()
    }
  }

    return(
        <View>

             <View style={{flexDirection : 'row' , height : 54 ,justifyContent : 'space-between' ,  paddingLeft : 15 , paddingRight: 15 , paddingTop:10 ,backgroundColor : '#6a0c0c' ,paddingTop : 15 , }} >
                <Text style={{color : 'white' , fontSize : 19 , zIndex : 50}} >{location} Store  </Text>
                   <View style={{justifyContent:'space-evenly' , backgroundColor:'#6a0c0c'}} >
      

          </View>
                <View style={{flexDirection: 'row'}} > 
                    <TouchableOpacity onPress={()=> navigation.navigate('searchInShop') }>

                          <FontAwesome name="search" size={24} color="white" />

                    </TouchableOpacity>
                      <TouchableOpacity style={{marginLeft : 6}} onPress={checkAuth} >
                    <Ionicons name="ellipsis-vertical" size={24} color="white" />
                    </TouchableOpacity>
                </View>

            </View>

       {sellOBuy ===  "toBuy" || sellOBuy ==="forSell" ? <View style={{flexDirection:'row' , justifyContent : 'space-evenly' , paddingLeft : 20 , paddingRight: 20 , height : 40 , alignItems : 'center' , backgroundColor : '#6a0c0c' , paddingTop : 10 }}>

            <TouchableOpacity onPress={()=> navigation.navigate(`DspShop`, { location: location ,specproduct: "vehicles" , sellOBuy :sellOBuy}) }> 
                   {  specproduct === "vehicles" ?
                 <Text style={{color:'white' , textDecorationLine:'underline' , fontWeight:'600' , fontSize : 18  }} > Showroom</Text> :
                 <Text style={{color:'white', }} > Showroom</Text>
                }
            </TouchableOpacity>

            <TouchableOpacity onPress={()=> navigation.navigate(`DspShop`, {location: location ,specproduct: "trailers" , sellOBuy :sellOBuy}) } >
                  {specproduct === "trailers" ?
                 <Text style={{color:'white' , textDecorationLine :'underline',fontWeight:'600' , fontSize : 18}} > Trailers</Text> :
                 <Text style={{color:'white'}} > Trailers</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={()=> navigation.navigate(`DspShop`, {location: location , specproduct: "spares" , sellOBuy :sellOBuy }) }>
                  {specproduct === "spares" ?
               <Text style={{color:'white' , textDecorationLine :'underline' ,fontWeight:'600' , fontSize : 18 }} > Spares</Text> :
               <Text style={{color:'white'}} > Spares</Text>}
            </TouchableOpacity>

                <TouchableOpacity onPress={()=> navigation.navigate(`DspShop`, {location: location , specproduct: "Sprovider" , sellOBuy :sellOBuy }) }>
               {specproduct === "Sprovider" ?
               <Text style={{color:'white' , textDecorationLine :'underline' ,fontWeight:'600' , fontSize : 18 }} > SProvider</Text> :
               <Text style={{color:'white'}} > SProvider </Text>}

            </TouchableOpacity>

        </View>:null}
   {smallMenu && <TouchableOpacity style={{position : 'absolute' , right : 0 ,top: 15, height : 10000 , left : 0 ,zIndex : 400 }} onPress={checkAuth}> 
   <View style={{position : 'absolute' , right : 0  , borderBlockColor:"#6a0c0c",borderWidth:3 , backgroundColor :'white'  , width : 200 , borderRadius: 13}} >
                        <TouchableOpacity  onPress={()=>navigation.navigate(`oneFirmsShop` ,{ userId: userId ,sellOBuyG :sellOBuy ,location : location , specproductG : "vehicles" ,CompanyName : "Manage" }) } style={styles.buttonStyle} >
                        <Text  > Manage Stock</Text>
                        </TouchableOpacity>


            <TouchableOpacity onPress={()=>toggleSellOBuy("forSell")} style={styles.buttonStyle} >
               <Text  >BUY</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>toggleSellOBuy("toBuy")}  style={styles.buttonStyle} >
                <Text >SELL</Text>
            </TouchableOpacity>

                    </View>

      </TouchableOpacity>}

        </View>
    )
}
export default React.memo(ShopHeader)
const styles = StyleSheet.create({
  
  buttonIsFalse : {
     borderWidth : 1 ,
     borderColor : '#6a0c0c' ,
     paddingLeft :4 , 
     paddingRight:4 ,
    //  marginLeft : 6
   } , 
    bttonIsTrue:{
    backgroundColor : 'white' ,
     paddingLeft :4 ,
     paddingRight:4 ,
     color :'white' 

    },
        buttonStyle : {
        height : 47,
        justifyContent : 'center' , 
        alignItems : 'center',
    }
});