import React , {useEffect} from "react"

import { View , Text  , TouchableOpacity , StatusBar, BackHandler,Linking,Platform,ActivityIndicator,StyleSheet ,Image } from "react-native";
import { auth, db,  } from "../config/fireBase";
import { collection, startAfter , serverTimestamp ,addDoc, query , where , getDocs ,doc,deleteDoc , updateDoc, runTransaction , setDoc,orderBy,limit,onSnapshot } from 'firebase/firestore';

// These are icons to be used in the App 
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
// Insuarance icon
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

import QRCode from 'react-native-qrcode-svg';

import zimFlag from "../images/zimFlag.png"

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
<View style={{position:'absolute' , top : 70 , left :0 , right:0 , bottom: 0 , backgroundColor: 'white', zIndex:210,padding:10,paddingTop:0}} >

               { <View style={{}} >

                <Text style={{alignSelf:'center',margin:3,fontStyle:'italic',marginBottom:10}} >The future of transport and logistics</Text>


                {addStoreLoc&& <View style={{position:'absolute',top:20 , left:0 , right:0 , bottom: 0,zIndex:220,backgroundColor:'white'}} >
                   <TouchableOpacity onPress={()=> navigation.navigate('slctAddShop', {location:"Zimbabwe" }) } style={styles.buttonStyle} >
            <Text style={{color:'#6a0c0c'}}> Zimbabwe</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=> navigation.navigate('slctAddShop',{ location :"SouthAfrica" }) } style={styles.buttonStyle}>
            <Text style={{color:'#6a0c0c'}}>  South Africa</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=> navigation.navigate('slctAddShop', {location:"Namibia" }) } style={styles.buttonStyle}>
            <Text style={{color:'#6a0c0c'}}>Namibia </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=> navigation.navigate('slctAddShop', { location :"Tanzania" }) } style={styles.buttonStyle}>
            <Text style={{color:'#6a0c0c'}}> Tanzania</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=> navigation.navigate('slctAddShop',{location: "Mozambique" }) } style={styles.buttonStyle}>
            <Text style={{color:'#6a0c0c'}}>Mozambique </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=> navigation.navigate('slctAddShop', {location: "Zambia" }) } style={styles.buttonStyle}>
            <Text style={{color:'#6a0c0c'}}> Zambia</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=> navigation.navigate('slctAddShop', {location: "Botswana" }) } style={styles.buttonStyle} >
            <Text style={{color:'#6a0c0c'}}>Botswana </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=> navigation.navigate('slctAddShop', {location: "Malawi" }) }style={styles.buttonStyle} >
            <Text style={{color:'#6a0c0c'}}>Malawi </Text>
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


                <View style={{flexDirection:'row' ,}} >
                  
                
                  <View style={{width:290,}} >



  {/* <QRCode value="Your data here" /> */}



{!selectContractCountry &&!contractLoc&&<TouchableOpacity onPress={toggleSelctCntrctCounrty} style={{  marginBottom : 8,  padding :7 ,borderWidth : 2 , borderColor:'#6a0c0c', borderRadius:8 ,  shadowColor: '#6a0c0c',
        shadowOffset: { width: 1, height: 2 },
        shadowOpacity: 0.7,
        shadowRadius: 5,   overflow: 'hidden', }} > 
        <Text style={{ color:'#9c2828' , fontWeight:'bold',fontSize:21}} >Long Term Contracts</Text>
        <Text style={{ color:'#9c2828' , fontWeight:'bold',fontSize:18}}>Click Here For Long term contracts </Text>
        <Text>Click Visit app for immediately loads and trucks </Text>

</TouchableOpacity>}

{selectContractCountry && !contractLoc &&<View style={{alignSelf:'center'}} > 
            <TouchableOpacity  onPress={()=>setContraLoc('Zimbabwe')}  style={{    justifyContent : 'center' , 
        alignItems : 'center' ,
        height : 80 ,
        width : 200 , 
        // borderWidth : 1 , 
        // borderColor : 'black',
        padding : 5 ,
        margin : 10,}}  >
              <Image source={zimFlag} style={{height:'100%' ,width:'100%',resizeMode:'contain' }} />
          <Text style={{position:'absolute',alignSelf:'center',fontWeight:'bold',fontSize:16,zIndex:14,backgroundColor:'white'}}>Zimbabwe </Text>
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



            { !selectContractCountry &&<TouchableOpacity style={{marginTop:9 , borderWidth:2 , borderColor:'green', padding:5 ,  shadowColor: 'rgba(34, 139, 34, 1)',shadowOffset: { width: 1, height: 2 },shadowOpacity: 0.7,shadowRadius: 5,   overflow: 'hidden',borderRadius:8}} onPress={()=> navigation.navigate('applyVerification') } >

                  <MaterialIcons name="verified" size={70} color="rgba(34, 139, 34, 0.2)" style={{alignSelf:'center'}} />

                  <View style={{position:'absolute',alignSelf:'center',zIndex:14,}}>
                    <Text style={{ color:'#228B22' , fontWeight:'bold',fontSize:22,marginTop:8}}>first level verification</Text>
                    <Text style={{fontSize:17,}}>We encourage all legit business to be verified</Text>
                    </View>
                   </TouchableOpacity>}

                  { !selectContractCountry&&<TouchableOpacity style={{marginTop:7,borderWidth:2 , borderColor:'#0074D9',padding:5,  shadowColor: 'rgba(0, 116, 217, 0.2)',shadowOffset: { width: 1, height: 2 },shadowOpacity: 0.7,shadowRadius: 5,   overflow: 'hidden',borderRadius:8}} onPress={()=> navigation.navigate('applyGit') } >
                      <FontAwesome6 name="shield" size={70} color="rgba(0, 116, 217, 0.2)" style={{alignSelf:'center'}} />
                      <View  style={{position:'absolute',alignSelf:'center',zIndex:14,}}>
                    <Text style={{ color:'#0074D9' , fontWeight:'bold',fontSize:19,marginTop:8}} >GIT (Goods in transit Insuarance) </Text>
                    <Text style={{fontSize:17}}>Click here to get GIT now</Text>
                    </View>
                   </TouchableOpacity>}

                   </View>

                 { <View style={{margin:7 , }} >

                  <Text style={{color:'#1E90FF'}}>Add its</Text>
                  <Text style={{color:'#1E90FF'}}>Free &</Text>
                  <Text style={{color:'#1E90FF'}}>Unlimited</Text>

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

                  </View>}


                </View>
                   

                </View>}
</View>
)
}
export default React.memo(FirsHomePage)