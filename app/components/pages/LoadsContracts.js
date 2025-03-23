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


const [contrMoreInfo, setContractMoreInfo] = React.useState(false)
     function toggleDspMoreInfo(){
       setContractMoreInfo(prev=> !prev)
     }

  const [dspRturnnLoads, setDspReturnLoads] = React.useState(false);

  function toggleDspReturnLoads(params) {
    setDspReturnLoads(true);
    setDspContractD(false);
    setDspLoadDe(false)
  }

  const [dspContractD, setDspContractD] = React.useState(false);

  function toggleDspContractD(params) {
    setDspContractD(true);
    setDspReturnLoads(false);
    setDspLoadDe(false)
  }

  // const [dspCommodity, setDspCommodity] = React.useState(false);

  // function toggleDspCommodity(params) {
  //   setDspCommodity(prev=> !prev);
  // }

  const [dsoLoadDe, setDspLoadDe] = React.useState(true)
  function dspLoadDet() {
    setDspLoadDe(true)
    setDspContractD(false);
    setDspReturnLoads(false);

  }

// commodity  , contract Id , Contract Duration , Contract Rate ,  contract Route r R  outes ,  , Reuirements , Due Date , owner number , owner Id

const rendereIterms = getContracts.map((item)=>{ 
return (
                      <View  style={{  marginBottom : 8,  padding :7 ,borderWidth : 2 , borderColor:'#6a0c0c', borderRadius:8 ,  shadowColor: '#6a0c0c',
         shadowOffset: { width: 1, height: 2 },
         shadowOpacity: 0.7,
         shadowRadius: 5,   overflow: 'hidden', paddingTop:45  }}  key={item.id} >

            <View style={{ height: 40, position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: "#6a0c0c", paddingBottom: 7, justifyContent: 'space-evenly' }} >
        <TouchableOpacity style={dsoLoadDe ? styles.bttonIsTrue : styles.buttonIsFalse} onPress={dspLoadDet} >
          <Text style={dsoLoadDe ? { color: 'white' } : null} >Load Details</Text>
        </TouchableOpacity>

        <TouchableOpacity style={dspRturnnLoads ? styles.bttonIsTrue : styles.buttonIsFalse} onPress={toggleDspReturnLoads}>
          <Text style={dspRturnnLoads ? { color: 'white' } : null}>Return Load</Text>
        </TouchableOpacity>


        <TouchableOpacity onPress={toggleDspContractD} style={dspContractD ? styles.bttonIsTrue : styles.buttonIsFalse}>
          <Text style={dspContractD ? { color: 'white' } : null}>Contract Details</Text>
        </TouchableOpacity>

      </View>
                     
                   <Text style={{ color:'#9c2828' , fontWeight:'bold',fontSize:21}} >9 months Contract Available</Text>
             { dsoLoadDe && <View>

                    <Text style={{ color:'#9c2828' , fontWeight:'bold',fontSize:19,marginTop:8}}> Commodiy </Text>
                    <View style={styles.textRow} >
                   <Text>i) {item.formData.commodity.frst} </Text>
                   <Text>ii) {item.formData.commodity.scnd} </Text>
                   <Text>iii) {item.formData.commodity.third} </Text>
                   <Text>iV) {item.formData.commodity.forth} </Text>
                  </View>


                  <Text style={{ color:'#9c2828' , fontWeight:'bold',fontSize:19,marginTop:8}}>Rate</Text>
                    <View >
                      <View> 
                  <Text>Solid Rate</Text>
                  <Text>i)  {item.formData.rate.solidFrst} </Text>
                  <Text>ii) {item.formData.rate.solidScnd} </Text>
                      </View>

                      <View> 
                  <Text>Triaxle</Text>
                  <Text>1)  {item.formData.rate.triaxleFrst} </Text>
                  <Text>ii){item.formData.rate.triaxlesScnd} </Text>
                      </View>

                      <View>
                    <Text>Link Rate</Text>
                  <Text>i)  {item.formData.rate.linksFrst} </Text>
                  <Text>ii)  {item.formData.rate.linksScnd} </Text>
                      </View>
                </View>



                <Text style={{ color:'#9c2828' , fontWeight:'bold',fontSize:19,marginTop:8}}>Routes</Text>
                <View style={styles.textRow}>
                <Text> i) {item.formData.location.frst} </Text>
                <Text>ii) {item.formData.location.scnd} </Text>
                <Text>iii) {item.formData.location.thrd} </Text>
                <Text>iv) {item.formData.location.forth} </Text>
                <Text>v) {item.formData.location.fifth} </Text>
                <Text>vi) {item.formData.location.sixth} </Text>
                </View>


              <Text style={{ color:'#9c2828' , fontWeight:'bold',fontSize:19,marginTop:8}}> Trucks Required </Text>
            <View style={styles.textRow}>
              <Text>i) {item.formData.trckRequired.frst}</Text>
              <Text>ii) {item.formData.trckRequired.scnd}</Text>
              <Text>iii) {item.formData.trckRequired.third}</Text>
              <Text>iv) {item.formData.trckRequired.forth}</Text>
              <Text>v) {item.formData.trckRequired.fifth}</Text>
            </View>
                   
                   
            <Text style={{ color:'#9c2828' , fontWeight:'bold',fontSize:19,marginTop:8}} >Other Requirements </Text>
          <View style={styles.textRow}>
            <Text>i) {item.formData.otherRequirements.frst} </Text>
            <Text>ii) {item.formData.otherRequirements.scnd} </Text>
            <Text>iii) {item.formData.otherRequirements.third} </Text>
            <Text>iv) {item.formData.otherRequirements.forth} </Text>
          </View>
                
 
              </View>}
 
 
                   <View style={{marginTop:5}} >
 
 
                   <TouchableOpacity  style={{  width : 150 , height : 30 , alignItems :"center" , justifyContent :'center', backgroundColor:'#228B22' ,  borderRadius: 8, alignSelf:'center', margin:5 }} >
 
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

  <TouchableOpacity onPress={()=>navigation.navigate("addContractsDb")} style={{  width : 150 , height : 30 , alignItems :"center" , justifyContent :'center', backgroundColor:'#228B22' ,  borderRadius: 8, alignSelf:'center', margin:5 }} >

                    <Text style={{color:'white'}}> Add Contract </Text>
                  </TouchableOpacity>
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
  buttonIsFalse: {
    borderWidth: 1,
    borderColor: '#6a0c0c',
    paddingLeft: 6,
    paddingRight: 6,
    alignSelf: 'center',

    marginLeft: 6
  },
  bttonIsTrue: {
    backgroundColor: '#6a0c0c',
    paddingLeft: 4,
    paddingRight: 4,
    color: 'white',
    alignSelf: 'center'

  }, 
    textRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 5,
    flexWrap: 'wrap',
  },
});