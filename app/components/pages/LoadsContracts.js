import React , {useEffect} from "react";

import { View , Text  , TouchableOpacity , StatusBar, BackHandler,Linking,Platform,ActivityIndicator,StyleSheet ,Image } from "react-native";
import { collection, startAfter , serverTimestamp ,addDoc, query , where , getDocs ,doc,deleteDoc , updateDoc, runTransaction , setDoc,orderBy,limit,onSnapshot } from 'firebase/firestore';

import { Ionicons } from "@expo/vector-icons";
import { db, auth } from "../config/fireBase";
function LoadsContracts({navigation}){


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
         let dataQuery =query(collection(db, "loadsContracts"),  );

      
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
    setGetContracts(loadMore ? [  ...getContracts , ...loadedData] : loadedData);

    loadMore ? setLoadMoreData(false) : null;
    }catch(err){
      console.error(err)
    }
}

  

useEffect(() => {
  loadedData();
  
}, []);



const rendereIterms = getContracts.map((item)=>{ 
return (
      
                    <View  style={{  marginBottom : 8,  padding :7 ,borderWidth : 2 , borderColor:'#6a0c0c', borderRadius:8 ,  shadowColor: '#6a0c0c',
        shadowOffset: { width: 1, height: 2 },
        shadowOpacity: 0.7,
        shadowRadius: 5,   overflow: 'hidden',   }}  key={item.id} >
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
        <View style={{paddingTop:89,padding:10}} >

          <View  style={{position:'absolute' , top : 0 , left: 0 , right : 0 , flexDirection : 'row' , height : 74  ,  paddingLeft : 6 , paddingRight: 15 , paddingTop:10 ,backgroundColor : '#6a0c0c' ,paddingTop : 15 , alignItems : 'center' , }} >
         <TouchableOpacity style={{marginRight: 10}} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="white"style={{ marginLeft: 10 }}  />
        </TouchableOpacity> 
        
        <Text style={{fontSize: 20 , color : 'white'}} > { contractLoc ? `Contracts in ${contractLoc} ` :"Choose contract location" } </Text>
       </View>

{!contractLoc && <View style={{alignSelf:'center'}} > 
            <TouchableOpacity  onPress={()=>setContraLoc('Zimbabwe')}  style={styles.buttonStyle}   >
          <Text style={{color:'#6a0c0c'}}>Zimbabwe </Text>
        </TouchableOpacity>
          <TouchableOpacity onPress={()=> setContraLoc('SouthAfrica') }  style={styles.buttonStyle} >
            <Text style={{color:'#6a0c0c'}}>South Africa</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=> setContraLoc('Namibia') } style={styles.buttonStyle} >
            <Text style={{color:'#6a0c0c'}}>Namibia </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=> setContraLoc('Tanzania') } style={styles.buttonStyle} >
            <Text style={{color:'#6a0c0c'}}> Tanzania</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=>setContraLoc('Mozambique') }  style={styles.buttonStyle} >
            <Text style={{color:'#6a0c0c'}}>Mozambique </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=> setContraLoc('Zambia') } style={styles.buttonStyle}  >
            <Text style={{color:'#6a0c0c'}}> Zambia</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=> setContraLoc('Botswana') }  style={styles.buttonStyle} >
            <Text style={{color:'#6a0c0c'}}>Botswana </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=> setContraLoc('Malawi') } style={styles.buttonStyle} >
            <Text style={{color:'#6a0c0c'}}>Malawi </Text>
        </TouchableOpacity>
</View> }

{contractLoc && rendereIterms }

        </View>
    )
}
export default React.memo(LoadsContracts)


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