import React , {useEffect} from "react"

import { View , Text  , TouchableOpacity , StatusBar, BackHandler,Linking,Platform,ActivityIndicator,StyleSheet ,Image } from "react-native";
import { auth, db,  } from "../config/fireBase";
import { collection, startAfter , serverTimestamp ,addDoc, query , where , getDocs ,doc,deleteDoc , updateDoc, runTransaction , setDoc,orderBy,limit,onSnapshot } from 'firebase/firestore';

// These are icons to be used in the App 
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
// Insuarance icon
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

import FontAwesome from '@expo/vector-icons/FontAwesome';

import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

import Entypo from '@expo/vector-icons/Entypo';

function FirsHomePage({setDspFrstPage , checkAuth , addStoreLoc , navigation , username , blackLWarning , blockVerifiedU}){






const [contractLoc , setContraLoc]=React.useState(null)
const [getContracts , setGetContracts]=React.useState([])

  const [dspLoadMoreBtn , setLoadMoreBtn]=React.useState(true)
  const [LoadMoreData , setLoadMoreData]=React.useState(false)

async function loadedData(loadMore) {

  try{
      loadMore ? setLoadMoreData(true) : null;

    const orderByF = "timeStamp";
    const orderByField = orderBy(orderByF, 'desc'); // Order by timestamp in descending order

    const pagination = loadMore && loadsList.length > 0 ? [startAfter(loadsList[loadsList.length - 1][orderByF])] : [];
         let dataQuery =query(collection(db, "logiContracts"),  where("userId", "==", "yay") ,orderByField, ...pagination, limit(15) ,   );

      
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
    setGetContracts(loadMore ? [  ...getContracts , ...getContracts] : getContracts);

    loadMore ? setLoadMoreData(false) : null;
    }catch(err){
      console.error(err)
    }
}





const rendereIterms = getContracts.map((item)=>{ 
return (
      
                    <View  style={{  marginBottom : 8,  padding :7 ,borderWidth : 2 , borderColor:'#6a0c0c', borderRadius:8 ,  shadowColor: '#6a0c0c',
        shadowOffset: { width: 1, height: 2 },
        shadowOpacity: 0.7,
        shadowRadius: 5,   overflow: 'hidden', }}>
                    <View > 
                  <Text style={{ color:'#9c2828' , fontWeight:'bold',fontSize:21}} >9 months Contract Available</Text>
                  <Text>Commodiy : Tobbaco</Text>
                  <Text>Rate : 3.50/KM for distance above 100KM</Text>
                  <Text>Rate : 4.50/KM for distance below 100KM</Text>
                  </View>

                  <Text style={{ color:'#9c2828' , fontWeight:'bold',fontSize:19,marginTop:8}} >Routes</Text>
                  <Text> i) Karoi ii) Mvurwi   </Text>
                  <Text>iii)marondera iV) Rusape</Text>

                  <Text style={{ color:'#9c2828' , fontWeight:'bold',fontSize:19,marginTop:8}}>Requirements</Text>
                  <Text>Trialxes : (flatdecks or dropsides)</Text>
                  <Text>superlinks : (flatdecks or dropsides)</Text>
                  <Text>Rigids i.e 30MT , 34MT</Text>


                  <View style={{marginTop:5}} >


                  <TouchableOpacity onPress={()=>Linking.openURL(`whatsapp://send?phone=+263716325160  &text=${encodeURIComponent(`Transix
                    Is this contract still available
                      Tobbaco from  i) Karoi ii) Mvurwi   iii)marondera iV Rusape
                    Rate : 3.50/KM for distance above 100
                    Rate : 4.50/KM for distance below 100KM

                    From: transix.net`)} `)} style={{  width : 150 , height : 30 , alignItems :"center" , justifyContent :'center', backgroundColor:'#228B22' ,  borderRadius: 8, alignSelf:'center', margin:5 }} >

                    <Text style={{color:'white'}}> Book now due 1 March </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={()=>Linking.openURL(`whatsapp://send?phone=+263716325160  &text=${encodeURIComponent(`Good day`)} `)} style={{  width : 70 , height : 25 , alignItems :"center" , justifyContent :'center',  borderRadius: 8, alignSelf:'center', margin:5 , borderWidth:2 ,borderColor:'red'}} >
        
                    <Text style={{color:'red'}} >Help</Text>
                  </TouchableOpacity>

                  </View>


 </View>
)
})





    const [selectContractCountry, setSelectContractCountry] = React.useState(false)
    function toggleSelctCntrctCounrty(){
      setSelectContractCountry(prev=> !prev)
    }


return(
<View style={{position:'absolute' , top : 0 , left :0 , right:0 , bottom: 0 , backgroundColor: 'white', zIndex:210,padding:10,paddingTop:0}} >

               { <View style={{}} >
                <View style={{justifyContent:'space-between',padding:5,flexDirection:'row',alignItems:'center'}} >
              <Text style={{fontSize : 30 , zIndex : 50,}} >Transix</Text>
              <Entypo name="menu" size={40} color="black" />
                </View>
                <Text style={{alignSelf:'center',margin:3,fontStyle:'italic',marginBottom:10}} >The future of transport and logistics</Text>


                {addStoreLoc&& <View style={{position:'absolute',top:20 , left:0 , right:0 , bottom: 0,zIndex:220,backgroundColor:'white'}} >
                   <TouchableOpacity onPress={()=> navigation.navigate('slctAddShop', {location:"Zimbabwe" }) } style={styles.buttonStyle} >
            <Text style={{color:'#008000'}}> Zimbabwe</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=> navigation.navigate('slctAddShop',{ location :"SouthAfrica" }) } style={styles.buttonStyle}>
            <Text style={{color:'#F7DC6F'}}>  South Africa</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=> navigation.navigate('slctAddShop', {location:"Namibia" }) } style={styles.buttonStyle}>
            <Text style={{color:'#032B44'}}>Namibia </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=> navigation.navigate('slctAddShop', { location :"Tanzania" }) } style={styles.buttonStyle}>
            <Text style={{color:'#34C759'}}> Tanzania</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=> navigation.navigate('slctAddShop',{location: "Mozambique" }) } style={styles.buttonStyle}>
            <Text style={{color:'#008000'}}>Mozambique </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=> navigation.navigate('slctAddShop', {location: "Zambia" }) } style={styles.buttonStyle}>
            <Text style={{color:'#FFA07A'}}> Zambia</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=> navigation.navigate('slctAddShop', {location: "Botswana" }) } style={styles.buttonStyle} >
            <Text style={{color:'#468M2B4'}}>Botswana </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=> navigation.navigate('slctAddShop', {location: "Malawi" }) }style={styles.buttonStyle} >
            <Text style={{color:'#FFC080'}}>Malawi </Text>
        </TouchableOpacity>
                </View>}





                <View style={{flexDirection:'row', justifyContent: 'space-around',marginBottom:10}} >

                  <TouchableOpacity style={{height: 30 , width: 130 , borderRadius:60, backgroundColor:'#228B22',justifyContent:'center',marginTop:2 }} onPress={()=> navigation.navigate('shopHome') }>
                  <Text style={{color:'white', textAlign:'center'}}>Go To store</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={{height: 30 , width: 130 , borderRadius:60, backgroundColor:'red',justifyContent:'center',marginTop:2 }} onPress={()=>setDspFrstPage(false)} >
                  <Text style={{color:'white', textAlign:'center'}}>Visit App</Text>

                  </TouchableOpacity>
                </View>


                <View  >
                  
                
                  <View style={{width:290,}} >




<View style={{flexDirection:'row'}} >


{!selectContractCountry &&!contractLoc&&<TouchableOpacity onPress={toggleSelctCntrctCounrty} style={{  marginBottom : 8,  padding :7 ,borderWidth : 2 , borderColor:'#6a0c0c', borderRadius:8 ,  shadowColor: '#6a0c0c',
        shadowOffset: { width: 1, height: 2 },
        shadowOpacity: 0.7,
        shadowRadius: 5,   overflow: 'hidden', }} > 
         <Text style={{ color: "#8B0000", fontWeight: "bold", fontSize: 24, marginBottom: 12 }}>
        Long-Term Contracts
      </Text>

      {/* Clickable Text for Long-term Contracts */}
        <Text style={{ color: "#C62828", fontWeight: "600", fontSize: 16, textDecorationLine: "underline", marginBottom: 10 }}>
          Click Here for Long-Term Contracts
        </Text>

      {/* Additional Information */}
      <Text style={{ color: "black", fontWeight: "500", fontSize: 14, textAlign: "center", maxWidth: 300 }}>
        Click "Visit App" for immediate loads and trucks.
      </Text>

</TouchableOpacity>}


<View style={{margin:7}} >

                  <Text style={{color:'#1E90FF'}}>Add its</Text>

                    {!blockVerifiedU && !blackLWarning && username !== false   && <TouchableOpacity onPress={()=>checkAuth("selectAddIterms")  }  style={{  borderWidth:1 , borderColor:'red' , zIndex :200 , borderRadius: 8,marginBottom:7,marginTop:7}} >
                      <Text style={{color : 'red',fontSize:12,fontWeight:'bold',alignSelf:'center'}}>Logistics</Text>
                      <View style={{flexDirection:'row',alignItems :"center" , justifyContent :"space-around", }} >
                <Text style={{color : 'red',fontSize:12,fontWeight:'bold'}} >Add</Text>
                <MaterialIcons name="add-box" size={18} color="red" />
                    </View>
             </TouchableOpacity>}
                    {!blockVerifiedU && !blackLWarning && username !== false   && <TouchableOpacity onPress={()=>checkAuth("selectAddToShop")  }  style={{ width : 70 , height : 35 ,  zIndex :200 , borderRadius: 8, borderWidth:1 , borderColor:'green'}} >
                      <Text style={{color : 'green',fontSize:12,fontWeight:'bold',alignSelf:'center'}}>Store</Text>
                <View  style={{flexDirection:'row',alignItems :"center" , justifyContent :"space-around", }}>

                <Text style={{color : 'green',fontSize:12,fontWeight:'bold'}} >Add</Text>
                <MaterialIcons name="add-shopping-cart" size={18} color="green" />
                </View>
             </TouchableOpacity>}
</View>

</View>




{selectContractCountry && !contractLoc &&<View style={{alignSelf:'center'}} > 
            <TouchableOpacity  onPress={()=>setContraLoc('Zimbabwe')}  style={{}}  >
          <Text style={{}}>Zimbabwe </Text>
        </TouchableOpacity>
          <TouchableOpacity onPress={()=> setContraLoc('SouthAfrica') }  >
            <Text style={{color:'#6a0c0c'}}>South Africa</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=> setContraLoc('Namibia') } >
            <Text style={{color:'#6a0c0c'}}>Namibia </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=> setContraLoc('Tanzania') } >
            <Text style={{color:'#6a0c0c'}}> Tanzania</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=>setContraLoc('Mozambique') }  >
            <Text style={{color:'#6a0c0c'}}>Mozambique </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=> setContraLoc('Zambia') }  >
            <Text style={{color:'#6a0c0c'}}> Zambia</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=> setContraLoc('Botswana') }  >
            <Text style={{color:'#6a0c0c'}}>Botswana </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=> setContraLoc('Malawi') } >
            <Text style={{color:'#6a0c0c'}}>Malawi </Text>
        </TouchableOpacity>
</View> }




            {contractLoc && rendereIterms}


  <View style={{flexDirection:'row'}} > 

            { !selectContractCountry &&<TouchableOpacity style={{  marginBottom : 8,  padding :7 ,borderWidth : 2 , borderColor:'#6a0c0c', borderRadius:8 ,  shadowColor: '#6a0c0c',
        shadowOffset: { width: 1, height: 2 },
        shadowOpacity: 0.7,
        shadowRadius: 5,   overflow: 'hidden',width:283}} onPress={()=> navigation.navigate('applyVerification') } >

                  <MaterialIcons name="verified" size={120} color="rgba(34, 139, 34, 0.1)" style={{alignSelf:'center'}} />

                  <View style={{position:'absolute',alignSelf:'center',zIndex:14,}}>
                    <Text style={{  color: "#0B6623", fontWeight: "bold", fontSize: 24, marginBottom: 8 }}>first level verification</Text>
                    <Text style={{ color: "#1E8449", fontWeight: "600", fontSize: 16, textDecorationLine: "underline", marginBottom: 6 }}>We encourage all legit business to be verified</Text>
                   <Text style={{ color: "black", fontWeight: "500", fontSize: 14, textAlign: "center", maxWidth: 300 }}>
                            Increase business trust and credibility by verifying your company.

                    </Text>
                    </View>
                   </TouchableOpacity>}
                   
                <View style={{margin:7}} >
              
                    <TouchableOpacity onPress={()=>checkAuth("selectAddIterms")  }  style={{  borderWidth:1 , borderColor:'red' , zIndex :200 , borderRadius: 8,marginBottom:7,marginTop:7}} >
                      <View style={{flexDirection:'row',alignItems :"center" , justifyContent :"space-around", }} >
                      <Text style={{color : 'red',fontSize:12,fontWeight:'bold'}} >Search</Text>
                        <FontAwesome name="search" size={18} color="red" />
                      </View>
                    <Text style={{color : 'red',fontSize:12,fontWeight:'bold',alignSelf:'center'}}>Logistics</Text>
                    </TouchableOpacity>

                   <TouchableOpacity onPress={()=>checkAuth("selectAddToShop")  }  style={{ width : 70 , height : 35 ,  zIndex :200 , borderRadius: 8, borderWidth:1 , borderColor:'green'}} >
                <View  style={{flexDirection:'row',alignItems :"center" , justifyContent :"space-around", }}>

                <Text style={{color : 'green',fontSize:12,fontWeight:'bold'}} >Search</Text>
                    <FontAwesome name="search" size={18} color="green" />
                </View>
                      <Text style={{color : 'green',fontSize:12,fontWeight:'bold',alignSelf:'center'}}>Transport</Text>
             </TouchableOpacity>


                </View>

</View>








                <View style={{flexDirection:'row'}} >

                  { !selectContractCountry&&<TouchableOpacity style={{marginTop:7,borderWidth:2 , borderColor:'#0074D9',padding:5,  shadowColor: 'rgba(0, 116, 217, 0.2)',shadowOffset: { width: 1, height: 2 },shadowOpacity: 0.7,shadowRadius: 5,   overflow: 'hidden',borderRadius:8,width:283}} onPress={()=> navigation.navigate('applyGit') } >
                      <FontAwesome6 name="shield" size={120} color="rgba(0, 116, 217, 0.1)" style={{alignSelf:'center'}} />
                      <View  style={{position:'absolute',alignSelf:'center',zIndex:14,}}>
                    <Text style={{ color:'#00509E' , fontWeight: "bold", fontSize: 24, marginBottom: 8 }} >GIT (Goods in transit Insuarance) </Text>
                    <Text style={{ color: "#0074D9", fontWeight: "600", fontSize: 16, textDecorationLine: "underline", marginBottom: 6 }}>Click here to get GIT now</Text>
                    <Text style={{ color: "black", fontWeight: "500", fontSize: 14, textAlign: "center", maxWidth: 300 }} > Ensures financial protection for trucks and cargo, keeping your business secure.</Text>
                    </View>
                   </TouchableOpacity>}



                  <View style={{margin:7}} >
                    <Text>Logistics </Text>

                  <TouchableOpacity>
                  <MaterialIcons name="forklift" size={24} color="black" />
                  <Text>Loads</Text>
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <FontAwesome5 name="truck" size={24} color="black" />
                    <Text>Trucks</Text>
                  </TouchableOpacity>
                  </View>
               </View>







             { !selectContractCountry&&<TouchableOpacity style={{marginTop:7,borderWidth:2 , borderColor:'rgba(220, 20, 60)',padding:5,  shadowColor: 'rgba(0, 116, 217, 0.2)',shadowOffset: { width: 1, height: 2 },shadowOpacity: 0.7,shadowRadius: 5,   overflow: 'hidden',borderRadius:8}} onPress={()=> navigation.navigate('Events') } >
              <MaterialIcons name="event" size={129} color="rgba(220, 20, 60, 0.1)" style={{alignSelf:'center'}} />
                      <View  style={{position:'absolute',zIndex:14,paddingLeft:5}}>
                    <Text style={{ color:'#B22222' , fontWeight: "bold", fontSize: 24, marginBottom: 8 }} >T & L Events </Text>
                    <Text style={{ color: "#C71F37", fontWeight: "600", fontSize: 16, textDecorationLine: "underline", marginBottom: 6 }} >Get your tickets now for upcoming transport & logistics events! </Text>
                    <Text style={{ color: "black", fontWeight: "500", fontSize: 14, textAlign: "center", maxWidth: 300 }} > Featuring : burnouts, car shows, expos, conferences, and racing tournaments! </Text>
                    </View>
                   </TouchableOpacity>}

                   </View>

                 { <View style={{margin:7 , }} >


                  <View>
                    <TouchableOpacity>
                      <Text>click to sell</Text>
                    </TouchableOpacity>

                    <TouchableOpacity>
                      <Text>click to buy</Text>
                    </TouchableOpacity>
                  </View>

                  </View>}


                </View>
                   

                </View>}
</View>
)
}
export default React.memo(FirsHomePage)

const styles = StyleSheet.create({
    buttonStyle : {
        height : 40,
        justifyContent : 'center' , 
        alignItems : 'center' ,
        width : 150 ,
        marginBottom: 15 ,
        borderWidth: 2 ,
        borderColor:"#6a0c0c" ,
        borderRadius: 3
    } ,
  
});