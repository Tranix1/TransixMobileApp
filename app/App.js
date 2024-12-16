// billie illish oxean eyes lovely birds of a feathure wild flower 
import React,{useState , useEffect,useRef} from "react";
import { View , Text , Button , TouchableOpacity , StatusBar, BackHandler,Linking,Platform,ActivityIndicator  } from "react-native";
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import * as Updates from 'expo-updates';

//Check if user is online or offline 
import NetInfo from '@react-native-community/netinfo';

import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';


import  { auth , db,  } from "./components/config/fireBase"
import { signOut,sendEmailVerification} from  'firebase/auth'
import {doc , getDoc ,query ,collection , where,onSnapshot, loadBundle,updateDoc} from "firebase/firestore"

import Header from "./components/Header"
import SearchIterms from "./components/pages/SearchElement"

import CreateUser from "./components/Auth/LogIn"
import SignIn from "./components/Auth/SignIn"
import PersonalAccInfo from "./components/Auth/Personalnfo"

import MiniLoad from  "./components/pages/MiniLoads"
import DspAllTrucks from  "./components/pages/DspCombinedTrucks"
import DspAllLoads from  "./components/pages/DspAllLoads"
import SelectOneTruckType from  "./components/pages/selectOnteTruckType"
import DspOneTruckType from  "./components/pages/DspOneTruckType"

import AddIterms from "./components/DataBase/AddIterms"
import DBTrucksAdd from "./components/DataBase/DBTrucksAdd"
import AddLoadDB from "./components/DataBase/addloadDB";

import SelectPersnalAcc from "./components/PersonalData/SelectPersnalAcc"
import PersnalAccLoads from "./components/PersonalData/PersnalAccLoads"
import PersnonalAccInfoEdit from "./components/PersonalData/PersnonalAccInfoEdit"
import PersonalAccTrucks from "./components/PersonalData/PersonalAccTrucks"

import SelectChat from "./components/communcication/selectChat"
import Messaging from "./components/communcication/Messaging"
import MainGroup from "./components/communcication/MainGroup"
import BookingsAndBiddings from "./components/communcication/DspBookingsAndBiidinga"
import SlctBookingAndBidding from "./components/communcication/selectBookingAndBiddding"

import SelectedUserLoads from "./components/selectedUserIterms/userPersonalLoads"

import SelectedUserTrucks from "./components/selectedUserIterms/userPersonalTrucls"
// 'rgb(129,201,149) 
// '#6a0c0c'
// '#6a0c0c'

import ShopLocation from "./components/shop/shopHome"
import DspShopIterms from "./components/shop/DspShopIterms"
import SelectAddToShop from "./components/shop/SelectAddToShop"
import AddToShop from "./components/shop/AddToShop"

import OneFirmsShop from "./components/shop/OneFirmsShop";
import SearchInshop from "./components/shop/SearchInshop";

import HelpHome from "./components/HelpCentre/HelpHome"
import VerifyInfo from './components/verify/verifyInfo'
import MobileAppSD from "./components/MobileAppSD"
import AppUpdates from "./components/pages/Updates"

import BBVerifiedLoad from "./components/verify/BBVerifiedLoad"

import MaterialIcons from '@expo/vector-icons/MaterialIcons';


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function sendPushNotification(expoPushToken, title, message,dbName ) {
  const notification = {
    to: expoPushToken,
    sound: 'default',
    title: title,
    body: message,
    data: {
      message: "helpHome",
      dbName : dbName, 
    }
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(notification),
  });
}

function handleRegistrationError(errorMessage) {
  throw new Error(errorMessage);
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      handleRegistrationError('Permission not granted to get push token for push notification!');
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError('Project ID not found');
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      return pushTokenString;
    } catch (e) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError('Must use physical device for push notifications');
  }
}








function HomeScreen({ navigation ,route, }) {


  // const {isVerified}= route.paramas
      // if(isBlackListed ){
      //   alert("You Are Blocked")
      //   return
      // }else if(blackLWarning ){
      //   alert("Your account is currently under investigation.\n Please contact us for resolution")
      //   Linking.openURL(`whatsapp://send?phone=+263716326160  &text=${encodeURIComponent(`Good day \nMy Transix account is being investigated whats the issue and how can we resolve it \nMy username is ${username} \n`)} `)
      //   return
      // }else if(blockVerifiedU){
      //   alert("Important: You are a blocked verified user.\n Legal action may be taken if necessary. \nContact us immediately.")
      //   Linking.openURL(`whatsapp://send?phone=+263716326160  &text=${encodeURIComponent(`Good day \n I am a blocked Transix verified User \nMy username is ${username} \n How can we speed up the resolving process l am legit`)} `)
      //   return
      // }
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(Notifications.Notification )

  const notificationListener = useRef(Notifications.Subscription);
  const responseListener = useRef(Notifications.Subscription);

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then(token => setExpoPushToken(token ?? ''))
      .catch((error) => setExpoPushToken(`${error}`));

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(notificationListener.current);
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, [notification]);


  
  if(notification){
    let dbName = notification.request.content.data.dbName 
    let wereToG0 
    if(dbName ==="bookings" ){
      wereToG0 = "yourBookedItems"
    }else if(dbName=== "biddings"){
      wereToG0="yourBiddedItems"
    }
    navigation.navigate(`DspBookingsAndBiddings` , {dbName: dbName , dspRoute :wereToG0})
    setNotification(null)
  }



  const [trackLoading , setTrackLoading]=React.useState(false)
  const [trackLoadingScnd , setTrackLoadingScnd]=React.useState(false)

  const [currentUser, setCurrentUser] = React.useState("");
   const [ username , setUsername] = React.useState(false);
   const [ contact , setContact] = React.useState('');

    // Check if user is already signed in
    function checkAuthSta (){
      setemailVerifiedN(false)
      const unsubscribe = auth.onAuthStateChanged((user) => {
        setCurrentUser(user);
      });
      
    // Cleanup function
    return () => unsubscribe();
    }
    React.useEffect(() => {
      checkAuthSta()
  }, [currentUser]);

          function reloadApp(){

          Updates.reloadAsync();
          }

       React.useEffect(() => {
  let unsubscribe;

  try {
    if (auth.currentUser) {
      const userId = auth.currentUser.uid;
      const docRef = doc(db, 'personalData', userId);

      unsubscribe = onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
          setUsername(doc.data().username);
          setContact(doc.data().contact);
        }
      });
    }else if(!auth.currentUser && trackLoading ) {
      setUsername("")
    }
setTrackLoading(true)
if(trackLoading){
setTrackLoadingScnd(true)
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


const [isConnectedInternet, setIsConnectedInternet] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnectedInternet(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  },[]);


    if(!isConnectedInternet){

      alert("You are offline. Please check your internet connection.")
    }
  const logout = async ()=>{
    
    try{
      setemailVerifiedN(false)
      setCurrentUser(null)
    await signOut(auth)

    }catch (err){
      console.error(err)
    }
  }
const newCodeEmVeri = async () => {
  try {
    const user = auth.currentUser  ;

    if (user && user.email) {
      await sendEmailVerification(user);
      alert("New code sent");
      setemailVerifiedN(false)
    } else {
      console.error("Current user or user email is null");
    }

  } catch (err) {
    console.error(err);
  }
};

const [whenemailVerifiedN , setemailVerifiedN] = React.useState(false)


    const [smallMenu , setSmallMenu] = React.useState(false)

    function toggleSmallMenu(){
        setSmallMenu(prev => !prev)
    }

  function checkAuth(routeToGo){

    if(username !== false|| trackLoadingScnd){

     if(!currentUser){
      navigation.navigate("createUser")
    }else if(!currentUser.emailVerified ){
      setemailVerifiedN(true)
      return
    }else if(currentUser && !username){
      navigation.navigate("addPersnoalInfo")
    }else {
      if(routeToGo ==="selectAddIterms" ){

        navigation.navigate('selectAddIterms',{verifiedLoad : false } ) 
      }else{
        toggleSmallMenu()
      }
    }

    }
  }

  const [dspLoads , setDspLoads] =React.useState(false)
  function toggleDspLoads(){
    setDspLoads(prev => !prev)
    setDspTrckType(prev => false)
  }


  const [dspTruckType , setDspTrckType] =React.useState(false)
  function toggleDspTrckType(){
    setDspTrckType(prev => !prev)
    setDspLoads(prev => false)
  }
  function toggleGoHome(){
    setDspTrckType(prev => false)
    setDspLoads(prev => false)
  }



 
  useEffect(() => {
    const backAction = () => {
      if (dspLoads) {
       toggleDspLoads()
        return true; // Prevent default back button action
      } else if(dspTruckType) {
        setDspTrckType(false)
        return true;
      }else {
        
        return false
      }
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [dspLoads , dspTruckType]);



      const [userIsVerified, setIsVerified] = React.useState(false);
      const [reverifyUserV , setReverifyUser] = React.useState(false)

      const [isBlackListed, setIsBlacListed] = React.useState(false);

      const [blackLWarning, setIsblacklWarning] = React.useState(false);
      const [blackLWarningDSP, setIsblacklWarningDSP] = React.useState(false);

      const [blockVerifiedU , setBlockVerifiedU] = React.useState(false)

       async function changeStatuses(userId,elemUpdate) {
          const docRef = doc(db, 'userStatuses', userId);
          try {
              if(elemUpdate==="verifcation"){

              await updateDoc(docRef, {
                 isVerified: false, veriExpTime: 0,reverifyUser:true , reverfyTime :Date.now() + 14 * 24 * 60 * 60 * 1000   });
              alert("Verification Expired! \nRe-verify to unlock features.")
            }else if(elemUpdate === "blockWarn"){

             await updateDoc(docRef, { isBlackListed:true , blackLWarning : false,usernameBL :username , contactBL : contact});
             alert("You have been blocked")
            }else if(elemUpdate === "reverfyOff"){

            await updateDoc(docRef, {
             veriExpTime: 0,reverifyUser:false , reverfyTime :0, leftVeri : true , usernameLV : username,contactLV:contact});
         }

          } catch (error) {
              console.error('Error updating document:', error);
         }
      }
        

   React.useEffect(() => {
        try {

         
          if (auth.currentUser) {
            const userId = auth.currentUser.uid;
            const statusQuery = query(collection(db, "userStatuses"), where("userId", "==", userId));

            const unsubscribe = onSnapshot(statusQuery, (querySnapshot) => {
              querySnapshot.forEach((doc) => {
                const data = doc.data();
                const isVerifiedValue = data.isVerified || false; // Assuming isVerified is a boolean field
                const reverifyUserValue = data.reverifyUser || false; // Assuming isVerified is a boolean field

                const blackListedValue = data.isBlackListed || false; // Assuming isVerified is a boolean field
                const blackLWrningValue = data.blackLWarning || false; // Assuming isVerified is a boolean field
                const blockVerifiedUValue = data.blockVerifiedU || false; // Assuming isVerified is a boolean field

                const  veriExpTime = data.veriExpTime || false; // Assuming isVerified is a boolean field
                const  blockBlackWarn  = data.blockBlackWarn || false; // Aswsuming isVerified is a boolean field
                const  reverfyTime  = data.reverfyTime || false; // Aswsuming isVerified is a boolean field


              const timeRemainingVer = veriExpTime - Date.now();
              
              if(isVerifiedValue ){
                if(timeRemainingVer <= 0){
                    changeStatuses(userId,"verifcation")
                  }else if(timeRemainingVer > 0){
                    setIsVerified(isVerifiedValue)
                  }
                 
                }

                const timeRemainingReVer = reverfyTime - Date.now();
                  if(reverifyUserValue <= 0 ){
                    if(timeRemainingReVer){
                      changeStatuses(userId,"reverfyOff")

                    }else{
                      setReverifyUser(true)
                    }
                  }

              const blockBlackWarnTim = blockBlackWarn - Date.now();
              
                if(blackLWrningValue){
                  if(blockBlackWarnTim <= 0 ){

                    changeStatuses(userId,"blockWarn")
                  }else if(blockBlackWarnTim >0){

                    setIsblacklWarning(blackLWrningValue);
                    setIsblacklWarningDSP(true)
                  }
                }

                

                setBlockVerifiedU(blockVerifiedUValue)
                setIsBlacListed(blackListedValue);
              });
            });

            return () => unsubscribe(); // Cleanup the listener when the component unmounts
          }
        } catch (error) {
          console.error(error);
        }
      }, [currentUser,username]);


      const [newAppUpdate , setNewAppUpdate]=React.useState(false)
      const [newAppUpdateTU , setNewAppUpdateTU]=React.useState(false)
      const [updateApp , setUpdateApp]=React.useState(false)
      
          React.useEffect(() => {
        try {
            const loadsQuery = query(collection(db, "updateEveryone"));
            const unsubscribe = onSnapshot(loadsQuery, (querySnapshot) => {
              querySnapshot.forEach((doc) => {
                const data = doc.data();
                const newAppUpdate = data.newAppUpdate ; // Assuming isVerified is a boolean field
                const newAppUpdateFTime = data.newAppUpdateFTime ; // Assuming isVerified is a boolean field
              const appUpdateFTim = newAppUpdateFTime - Date.now();
                if(newAppUpdate  ){
                  if(appUpdateFTim  <= 0){
                    setNewAppUpdateTU(true)
                  }else{
                    setNewAppUpdate(newAppUpdate)

                  }
                }
              });
            });

            return () => unsubscribe(); // Cleanup the listener when the component unmounts
        } catch (error) {
          console.error(error);
        }
      }, [currentUser,username]);



  const packageJson = require('../package.json');
  const appVersion = packageJson.version;


  React.useEffect(() => {

if(username !== false ||trackLoadingScnd ){
  
  if(appVersion !==  newAppUpdate){
    setUpdateApp(true)
  }
}
}, [newAppUpdate]);


  return (
    <View>

    {!isBlackListed ?<View >  
        <Header navigation={navigation} checkAuth={checkAuth} smallMenu={smallMenu} />

             <View  style={{flexDirection:'row' , justifyContent : "space-evenly" , paddingLeft : 20 , paddingRight: 20 , height : 40 , alignItems : 'center' , backgroundColor : '#6a0c0c' , paddingTop : 10 }}>

               <TouchableOpacity onPress={toggleGoHome}
               > 
                   {  !dspTruckType&& !dspLoads?
                 <Text style={{color:'white' , textDecorationLine:'underline' , fontWeight:'600' , fontSize : 18  }} > Home</Text> :
                 <Text style={{color:'white', }} > Home</Text>
                }
                </TouchableOpacity>

             <TouchableOpacity onPress={ toggleDspLoads  }>

                   {  dspLoads?
                 <Text style={{color:'white' , textDecorationLine:'underline' , fontWeight:'600' , fontSize : 18  }} > Loads</Text> :
                 <Text style={{color:'white', }} > Loads</Text>
                }
                </TouchableOpacity>
                <TouchableOpacity onPress={toggleDspTrckType} >

                   {  dspTruckType?
                 <Text style={{color:'white' , textDecorationLine:'underline' , fontWeight:'600' , fontSize : 18  }} > Trucks</Text> :
                 <Text style={{color:'white', }} > Trucks</Text>
                }

                </TouchableOpacity>

                <TouchableOpacity   onPress={()=> navigation.navigate('shopHome') }  >
                 <Text style={{color:'white'}} >Shop</Text>
                </TouchableOpacity>
             </View>


    {blackLWarningDSP && <View style={{alignSelf:'center', backgroundColor :'white', zIndex:100, position:'absolute', top : 130 , width:300, padding:7, height:150, justifyContent:'center',alignItems :'center', borderRadius:7}} >
      <Text>Your account is currently under investigation.</Text>
      <Text>
        Please contact us for resolution If Not In 4days Your Account Will Be Blocked
      </Text>

      <View style={{flexDirection:'row'}} > 
    
       <TouchableOpacity style={{height:27 , backgroundColor:'red', width:65,borderRadius:5, alignItems:'center',margin:7}} onPress={()=>setIsblacklWarningDSP(false)} >
                <Text style={{color:'white'}}>Cancel</Text>
               </TouchableOpacity>

              

               <TouchableOpacity onPress={()=>Linking.openURL(`whatsapp://send?phone=+263716325160  &text=${encodeURIComponent(`Good day \nMy Transix account is being investigated whats the issue and how can we resolve it \nMy username is ${username}`)} `)} style={{height:27 , backgroundColor:'green', width:65,borderRadius:5, alignItems:'center',margin:7}}>

                <Text style={{color:'white'}} >OK</Text>
               </TouchableOpacity>

      </View>
    </View>}


    {blockVerifiedU && <View style={{alignSelf:'center', backgroundColor :'white', zIndex:100, position:'absolute', top : 130 , width:300, padding:7, height:150, justifyContent:'center',alignItems :'center', borderRadius:7}} >
      <Text>Important: You are an investigated  verified user.</Text>
      <Text> Legal action may be taken if necessary. Contact us immediately..</Text>

      <Text>
        Please contact us for resolution If Not In 4days Your Account Will Be Blocked
      </Text>

      <View style={{flexDirection:'row'}} > 
    
       <TouchableOpacity style={{height:27 , backgroundColor:'red', width:65,borderRadius:5, alignItems:'center',margin:7}} onPress={()=>setIsblacklWarning(false)} >
                <Text style={{color:'white'}}>Cancel</Text>
               </TouchableOpacity>
       
              

               <TouchableOpacity onPress={()=>Linking.openURL(`whatsapp://send?phone=+263716325160  &text=${encodeURIComponent(`Good day \n I am a  investiged Transix verified User \nMy username is ${username} \n How can we speed up the resolving process l am legit`)} `)} style={{height:27 , backgroundColor:'green', width:65,borderRadius:5, alignItems:'center',margin:7}}>

                <Text style={{color:'white'}} >OK</Text>
               </TouchableOpacity>

      </View>
    </View>}

          
              {reverifyUserV && <View style={{alignSelf:'center', backgroundColor :'white', zIndex:100, position:'absolute', top : 130 , width:300, padding:7, height:150, justifyContent:'center',alignItems :'center', borderRadius:7}} >
      <Text>You were a trusted industry member.</Text>

      <Text>
        Renew your verification now.
      </Text>

      <View style={{flexDirection:'row'}} > 
    
       <TouchableOpacity style={{height:27 , backgroundColor:'red', width:65,borderRadius:5, alignItems:'center',margin:7}} onPress={()=>setReverifyUser(false)} >
                <Text style={{color:'white'}}>Cancel</Text>
               </TouchableOpacity>
       
              

               <TouchableOpacity onPress={()=>Linking.openURL(`whatsapp://send?phone=+263716325160  &text=${encodeURIComponent(`Good day \n I want to be reverified on Transix \nMy username is ${username} `)} `)} style={{height:27 , backgroundColor:'green', width:65,borderRadius:5, alignItems:'center',margin:7}}>

                <Text style={{color:'white'}} >OK</Text>
               </TouchableOpacity>

      </View>
    </View>}

             

                   {updateApp && <View style={{alignSelf:'center', backgroundColor :'white', zIndex:100, position:'absolute', top : 130 , width:300, padding:7, height:100, justifyContent:'center',alignItems :'center', borderRadius:7}} >
              <Text>Update App</Text>
              <Text>To latest better version</Text>
                  <View style={{flexDirection:'row', justifyContent:"space-evenly",marginTop:7}} >

              {!newAppUpdateTU && <TouchableOpacity style={{height:27 , backgroundColor:'red', width:65,borderRadius:5, alignItems:'center',margin:7}} onPress={()=>setUpdateApp(false) } >
                <Text style={{color:'white'}}>Cancel</Text>
               </TouchableOpacity>}

             
               {!newAppUpdateTU &&<TouchableOpacity onPress={()=>Linking.openURL("https://play.google.com/store/apps/details?id=com.yayapana.Transix")} style={{height:27 , backgroundColor:'green', width:65,borderRadius:5, alignItems:'center',margin:7}}>
        
                <Text style={{color:'white'}} >OK</Text>
               </TouchableOpacity>}

             
               {newAppUpdateTU &&<TouchableOpacity onPress={()=>Linking.openURL("https://play.google.com/store/apps/details?id=com.yayapana.Transix")} style={{height:35 , backgroundColor:'green', width:120,borderRadius:5, alignItems:'center',margin:7, alignSelf:'center'}}>
        
                <Text style={{color:'white'}} >OK</Text>
               </TouchableOpacity>}


              </View>
             </View>}


             {whenemailVerifiedN && <View style={{alignSelf:'center', backgroundColor :'white', zIndex:100, position:'absolute', top : 130 , width:300, padding:7, height:150, justifyContent:'center',alignItems :'center', borderRadius:7}} >
               <Text style={{fontSize:17 , fontWeight:'600'}} >Verify Your Email</Text> 
               <Text style={{fontSize:17 , fontWeight:'600',color:'green'}} >{currentUser.email}</Text> 
               <Text>To Proceed........</Text>
              <View style={{flexDirection:'row', justifyContent:"space-evenly",marginTop:7}} >

               <TouchableOpacity style={{height:27 , backgroundColor:'red', width:65,borderRadius:5, alignItems:'center',margin:7}} onPress={logout} >
                <Text style={{color:'white'}}>Sign Out</Text>
               </TouchableOpacity>

               <TouchableOpacity onPress={newCodeEmVeri} style={{borderWidth:2 , marginLeft:6 , marginRight:5 ,width:80,height:27,alignItems:'center',marginTop:7}} >
                <Text>new code</Text>
               </TouchableOpacity>

               <TouchableOpacity onPress={reloadApp} style={{height:27 , backgroundColor:'green', width:65,borderRadius:5, alignItems:'center',margin:7}}>
                <Text style={{color:'white'}} >Refresh</Text>
               </TouchableOpacity>

              </View>
             </View>}

           {!blockVerifiedU && !blackLWarning && username !== false   && <TouchableOpacity onPress={()=>checkAuth("selectAddIterms")  }  style={{position :'absolute',top: 440 ,right:10 , width : 80 , height : 35 , alignItems :"center" , justifyContent :"space-around", backgroundColor:'#228B22' , zIndex :200 , borderRadius: 8, flexDirection:'row'}} >
                <Text style={{color : 'white',fontSize:17,fontWeight:'bold'}} >Add</Text>
                <MaterialIcons name="add-box" size={26} color="white" />
             </TouchableOpacity>}
   {!dspLoads && !dspTruckType && <View  >

     <MiniLoad blockVerifiedU ={blockVerifiedU} blackLWarning={blackLWarning} />
     {username === false   && <ActivityIndicator size="large" /> }
     <DspAllTrucks blockVerifiedU={blockVerifiedU} blackLWarning={blackLWarning}  />
    </View>}

    {dspLoads && !dspTruckType&& <DspAllLoads  username = {username } contactG={contact} route={route}  sendPushNotification={sendPushNotification} expoPushToken={expoPushToken} userIsVerified={userIsVerified} blockVerifiedU ={blockVerifiedU} blackLWarning={blackLWarning}  />}
    {dspTruckType &&  <SelectOneTruckType navigation={navigation} />}
    </View>:
    <View>
      <Text>You Have been blocked</Text>
    </View>
    
    }

 </View>
  );
}



function App(){


  
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(Notifications.Notification )

  const notificationListener = useRef(Notifications.Subscription);
  const responseListener = useRef(Notifications.Subscription);

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then(token => setExpoPushToken(token ?? ''))
      .catch((error) => setExpoPushToken(`${error}`));

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(notificationListener.current);
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, [currentUser]);


  
  const [currentUser, setCurrentUser] = React.useState("");

  React.useEffect(() => {
    // Check if user is already signed in
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });

    // Cleanup function
    return () => unsubscribe();
  }, [currentUser]);

  React.useEffect(() => {
    // Set the status bar color and style
    StatusBar.setBackgroundColor('#6a0c0c'); // Set the background color of the status bar
    StatusBar.setBarStyle('light-content'); // Set the style of the status bar text (light or dark)
  }, [currentUser , username]);

   const [ username , setUsername] = React.useState("");
   const [ contact , setContact] = React.useState('');
   const [ spechopLoc , setShopLoc] = React.useState('');
  const [ deliveryR , setDeliveryR] = React.useState('');

       React.useEffect(() => {
  let unsubscribe;

  try {
    if (auth.currentUser) {
      const userId = auth.currentUser.uid;
      const docRef = doc(db, 'personalData', userId);

      unsubscribe = onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
          setUsername(doc.data().username);
          setContact(doc.data().contact);
          setShopLoc(doc.data().shopLocation);
          setDeliveryR(doc.data().deliveryRange);
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
            

      const [verifyOngoing , setverifyOngoing]=React.useState(false)
      const [newAppUpdate , setNewAppUpdate]=React.useState(false)
      
          React.useEffect(() => {
        try {
          if (auth.currentUser) {
            const loadsQuery = query(collection(db, "updateEveryone"));

            const unsubscribe = onSnapshot(loadsQuery, (querySnapshot) => {
              querySnapshot.forEach((doc) => {
                const data = doc.data();
                const isVerifyOngoing = data.verifyOngoing || false; // Assuming isVerified is a boolean field
                const newAppUpdate = data.newAppUpdate || false; // Assuming isVerified is a boolean field

                setverifyOngoing(isVerifyOngoing)
                setNewAppUpdate(newAppUpdate)
              });
            });

            return () => unsubscribe(); // Cleanup the listener when the component unmounts
          }
        } catch (error) {
          console.error(error);
        }
      }, [currentUser,username]);



      const [isVerified, setIsVerified] = React.useState(false);
      const [isBlackListed, setIsBlacListed] = React.useState(false);
      const [blackLWarning, setIsblacklWarning] = React.useState(false);
      const [blockVerifiedU , setBlockVerifiedU] = React.useState(false)


  if(username ){

      if(isBlackListed){
        alert("You Are Blacklisted")
        return
      } if(blockVerifiedU){
        alert("Important: You are a blocked verified user.\n Legal action may be taken if necessary. \nContact us immediately.")
       Linking.openURL(`whatsapp://send?phone=+263716325160  &text=${encodeURIComponent(`Good day \n I am a blocked Transix verified User \nMy username is ${username} \n How can we speed up the resolving process l am legit`)} `)
      }

  }

     async function changeStatuses(userId,elemUpdate) {
          const docRef = doc(db, 'userStatuses', userId);
          try {
              if(elemUpdate==="verifcation"){

              await updateDoc(docRef, { isVerified: false, veriExpTime: 0 });
              alert("Verification Expired! \nRe-verify to unlock features.")
            }else if(elemUpdate === "blockWarn"){

             await updateDoc(docRef, { isBlackListed:true , blackLWarning : false });
             alert("You have been blocked")
            }

          } catch (error) {
              console.error('Error updating document:', error);
          }
      }

      React.useEffect(() => {
        try {

          if (auth.currentUser) {
            const userId = auth.currentUser.uid;
            const statusQuery = query(collection(db, "userStatuses"), where("userId", "==", userId));

            const unsubscribe = onSnapshot(statusQuery, (querySnapshot) => {
              querySnapshot.forEach((doc) => {
                const data = doc.data();
                const isVerifiedValue = data.isVerified || false; // Assuming isVerified is a boolean field
                const blackListedValue = data.isBlackListed || false; // Assuming isVerified is a boolean field
                const blackLWrningValue = data.blackLWarning || false; // Assuming isVerified is a boolean field
                const blockVerifiedUValue = data.blockVerifiedU || false; // Assuming isVerified is a boolean field

                const  veriExpTime = data.veriExpTime || false; // Assuming isVerified is a boolean field
                const  blockBlackWarn  = data.blockBlackWarn || false; // Aswsuming isVerified is a boolean field

              const timeRemainingVer = veriExpTime - Date.now();
              
              if(isVerifiedValue ){
                if(timeRemainingVer <= 0){
                    changeStatuses(userId,"verifcation")
                  }else if(timeRemainingVer > 0){
                    setIsVerified(isVerifiedValue)
                  }
                 
                }

              const blockBlackWarnTim = blockBlackWarn - Date.now();
              
                if(blackLWrningValue){
                  if(blockBlackWarnTim <= 0 ){

                    changeStatuses(userId,"blockWarn")
                  }else if(blockBlackWarnTim >0){

                    setIsblacklWarning(blackLWrningValue);
                  }
                }

                

                setBlockVerifiedU(blockVerifiedUValue)
                setIsBlacListed(blackListedValue);
              });
            });

            return () => unsubscribe(); // Cleanup the listener when the component unmounts
          }
        } catch (error) {
          console.error(error);
        }
      }, [currentUser , username]);

            
const Stack = createNativeStackNavigator();


    return(
      <Stack.Navigator>
        
        {/* <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} /> */}
        <Stack.Screen name="Truckerz" 
        options={{headerShown:false}}
        component={HomeScreen}
      
      notification = {notification}
        initialParams={{isBlackListed : isBlackListed , blockVerifiedU: blockVerifiedU , blackLWarning : blackLWarning,isVerified: isVerified}}
          />

      <Stack.Screen name="searchElement" component={SearchIterms} options={{headerShown: false}}/>

      <Stack.Screen name="createUser" component={CreateUser} options={{title: 'create Account',headerStyle: {backgroundColor: '#6a0c0c', },headerTintColor: 'white',}}/>
      <Stack.Screen name="signInexistAcc" component={SignIn} options={{title: 'create Account',headerStyle: {backgroundColor: '#6a0c0c', },headerTintColor: 'white',}}/>

      <Stack.Screen name="addPersnoalInfo" component={PersonalAccInfo} options={{title: 'Personal Information',headerStyle: {backgroundColor: '#6a0c0c', },headerTintColor: 'white',}}/>

      <Stack.Screen name="selectPeronalAcc" component={SelectPersnalAcc} options={{title: 'Truckerz',headerStyle: {backgroundColor: '#6a0c0c', },headerTintColor: 'white',}}/>
      <Stack.Screen name="personalInfomation" component={PersnonalAccInfoEdit}initialParams={{username : username , contact : contact ,}} options={{headerShown:false}}/>
      <Stack.Screen name="peronalAccLoads" component={PersnalAccLoads} options={{title: 'Manage Loads',headerStyle: {backgroundColor: '#6a0c0c', },headerTintColor: 'white',}}/>
      <Stack.Screen name="peronalAccTrucks" component={PersonalAccTrucks} options={{title: 'Manage Trucks',headerStyle: {backgroundColor: '#6a0c0c', },headerTintColor: 'white',}}/>

      <Stack.Screen name="selectChat" component={SelectChat} options={{title: 'Chats',headerStyle: {backgroundColor: '#6a0c0c', },headerTintColor: 'white',}}/>
      <Stack.Screen name="mainGroup" component={MainGroup} initialParams={{username : username }} options={{title: 'Main Group',headerStyle: {backgroundColor: '#6a0c0c', },headerTintColor: 'white',}}/>
      <Stack.Screen name="message" component={Messaging}  initialParams={{username : username}} options={{headerShown: false}}/>
      <Stack.Screen name="SlctBookingsAndBiddings" component={SlctBookingAndBidding} options={{title: 'Bookings And Biddings',headerStyle: {backgroundColor: '#6a0c0c', },headerTintColor: 'white',}}/>
      <Stack.Screen name="DspBookingsAndBiddings" component={BookingsAndBiddings} options={{headerShown : false}}/>

      <Stack.Screen name="selectAddIterms" component={AddIterms} options={{title: 'Add Iterms',headerStyle: {backgroundColor: '#6a0c0c', },headerTintColor: 'white',}}/>
      <Stack.Screen name="addLoadsDB" component={AddLoadDB} initialParams={{username : username , contact : contact , expoPushToken:expoPushToken ,isVerified:isVerified ,isBlackListed : isBlackListed ,  blackLWarning : blackLWarning ,blockVerifiedU:blockVerifiedU,verifyOngoing:verifyOngoing }} options={{title: 'Add Loads',headerStyle: {backgroundColor: '#6a0c0c', },headerTintColor: 'white',}}/>
      <Stack.Screen name="addTrucksDB" component={DBTrucksAdd} initialParams={{username : username , contact : contact ,expoPushToken:expoPushToken ,isVerified : isVerified ,isBlackListed : isBlackListed ,  blackLWarning : blackLWarning,blockVerifiedU:blockVerifiedU ,verifyOngoing:verifyOngoing}} options={{headerShown:false}}/>

      <Stack.Screen name="dspOneTrckType" component={DspOneTruckType}  options={{headerShown:false}} initialParams={{blockVerifiedU : blockVerifiedU , blackLWarning:blackLWarning }}  />

      <Stack.Screen name="selectedUserLoads" component={DspAllLoads}  options={{headerShown: false}}  initialParams={{username : username , contact : contact ,blockVerifiedU : blockVerifiedU , blackLWarning:blackLWarning }} />

      <Stack.Screen name="selectedUserTrucks" component={SelectedUserTrucks}  options={{headerShown: false}}/>


      <Stack.Screen name="shopHome" component={ShopLocation} options={{title: 'Welcome To Store',headerStyle: {backgroundColor: '#6a0c0c', },headerTintColor: 'white',}}/>
      <Stack.Screen name="DspShop" component={DspShopIterms} options={{headerShown:false}} initialParams={{spechopLoc:spechopLoc ,blockVerifiedU : blockVerifiedU , blackLWarning:blackLWarning  }} />
      <Stack.Screen name="slctAddShop" component={SelectAddToShop} options={{title: 'Add To Shop',headerStyle: {backgroundColor: '#6a0c0c', },headerTintColor: 'white',}}/>
      <Stack.Screen name="AddToShop" component={AddToShop} options={{headerShown:false}} 
       initialParams={{username : username , contact : contact , isVerified : isVerified ,  shopLocation: spechopLoc ,deliveryR :deliveryR ,expoPushToken :expoPushToken ,isBlackListed : isBlackListed ,  blackLWarning : blackLWarning ,blockVerifiedU:blockVerifiedU ,verifyOngoing :verifyOngoing}} />
      <Stack.Screen name="oneFirmsShop" component={OneFirmsShop} options={{headerShown: false}} initialParams={{blockVerifiedUP : blockVerifiedU , blackLWarningP:blackLWarning }} />
      <Stack.Screen name="searchInShop" component={SearchInshop} options={{headerShown: false}}/>

      <Stack.Screen name="helpHome" component={HelpHome}  options={{title: 'Help',headerStyle: {backgroundColor: '#6a0c0c', },headerTintColor: 'white',}}/>
      <Stack.Screen name="mobileAppSD" component={MobileAppSD}  options={{title: 'Mobile app',headerStyle: {backgroundColor: '#6a0c0c', },headerTintColor: 'white',}}/>
      <Stack.Screen name="updates" component={AppUpdates}  options={{title: 'Updates',headerStyle: {backgroundColor: '#6a0c0c', },headerTintColor: 'white',}}/>


      <Stack.Screen name="verifyInfo" component={VerifyInfo}  options={{title: ' Verification Info',headerStyle: {backgroundColor: '#6a0c0c', },headerTintColor: 'white',}}/>
      <Stack.Screen name="bbVerifiedLoad" component={BBVerifiedLoad}  options={{headerShown:false}}/>

      </Stack.Navigator>     
      
                 
    )
}
export default App