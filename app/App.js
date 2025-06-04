// This is the begenning of the transix dumentation
// Transix is a business focusiing on improving the transport and logistics industry using cutting edge technology it keeps advancing and adapting to improve how the overal services work .
// For now there is way to connect truck and loads or freight business , and a shop yto sell products in the transort industry .
// On the logistics side there are trucks wich are ordered using their location also one can select a truck type using its trailer and get those type of trucks only , there is also a verified fetaure for trucks were there are verified trucks  .
// And for loads they are sorted using their time latest load on top , they are also mini loads which show few details and can direct somone to the owner of the loads 
// On the shop side they are vheicles wich include small cars , carg vehicles , construction for now and some can be sorted undeer other option .
// There is also  trallers , spares , service providers that can be found in the store .
// In the shop one can also add what they are looking for and they can also specify l will explain in depth of all the features in the code  .



// Lets begin

// Here is the first step as we are impoting react reusable functions that l will use for diffrent purposes like storing , tracking and prioritizing. 
// I first imported React as it is the main function and consist of all other elements in it like usestate or useeffect but firsy l call React hook.
// I also extracted the other functions from react so l can use them without calling React first like useState only it will not reuire me to call React first it simplifies the code and makees it shorter
// So In short am just importing React functions
import React, { useState, useEffect, useRef } from "react";

// In my application am not using plain react am using React native for mobile app developemnt and there is need to import the elements used to display items in React native .
// Most of the imports below are used visualization or displaying itemrs to the user end 
// The View is like a div in web dev its the empty container used to store items in it and can take varoius shapes and elemets in it
// The Text is just like a p tag in html it used to store text all the text is found in the p tag that is seen by the user . Text cannot run wihtout being in a Text it cause an error 
// The touchableOpcaity is the clickable part of the application , its like a button in html 
// StatusBar is the topMost of the device llike the part wich have time battery and l wanted to change color
// BackHandler is used to goBack when a user press a back button on the phsyical device
// Linking is used to open urls or links eg when you want to open whatsapp with a number we use the linking tag
// The platform is used to check wich device we are oprating on coz react ntive is cross platform so check if its andaroid or ios 
// ActivityIndicator is a loading item which show a circle loading 

import { View, Text, TouchableOpacity, StatusBar, BackHandler, Linking, Platform, ActivityIndicator, StyleSheet } from "react-native";

// The stack createNativeStackNavigator is a library used for navigation or changing pages like if am on the home page and l want to go to the store its used to change them and makes it easier to go back make Headers it automate many things even a smooth transision . I called it and store in a variable called stack ich l then used throughiut the whole code to call the screeens to be navigated . 
// Its like react router fdom for web
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// I imported the Updates so that l can refresh the app when a user is waiting to verify their account and they verified but its not respoding so in short l wanted to restart the app
import * as Updates from 'expo-updates';

//Check if user is online or offline 
import NetInfo from '@react-native-community/netinfo';

// The imports below are used for notifications to send and receive notifications
// The isDevice check if the user is using a physical device
import { isDevice } from 'expo-device';
// Here we are importing all elements in the expo notification thats why there is * so we can use them
import * as Notifications from 'expo-notifications';
// I dont know what the constants is for need help here 
import Constants from 'expo-constants';
// Imports for notification end here

// The imports below are from firebase so l can use firebase elements in the code

// The auth is being used to check if the user is authiateted or created an account and the account is being created using firebase
// db its for database and used to know wich data base is being reuired or being used
// The auth and db are both connceted to my personal info as they are uniue to my credentials so that they can add to the correct imported db thats why they are imported from a local file
// The confiig firebase file is the one that have all my configs with firebase what l imported and the keys to link them to firebase
import { auth, db, } from "./components/config/fireBase"

// The firebase auth is not configured by me
// SignOut is used to signout a user from the app not delete the accoutn
// sendEmailVerification is used to send link so that user can verify their email that its legit 

import { signOut, sendEmailVerification } from 'firebase/auth'

// The below are the imports from firestore wich l used for diffrent many oprations 
// I used firestre as my database and these are some of the functons ich l need in the App file and how they work
import { doc, query, collection, where, onSnapshot, updateDoc } from "firebase/firestore"

// The header element of the app  or the top most view which have the compny Name to display small menu etc
import Header from "./components/Header"

// The Page wich display when the search icon is clicked consist of all searchng code
import SearchIterms from "./components/pages/SearchElement"

// Code for Auth and Auth
// The page wich deal with creating and new user or logining in to an account
import CreateUser from "./components/Auth/LogIn"
// The Page wichconsist of signing in to an existing user
import SignIn from "./components/Auth/SignIn"
// The page wich allow a user to add  a username and contact information
import PersonalAccInfo from "./components/Auth/Personalnfo"
// Code for Auth and Auth end here

import FirstHomePage from "./components/pages/FirstHomePage"

// The funcytion wich display the small loads on the first page

// The function wich get all trucks and are the ones wich are below the small loads on front page
import DspAllTrucks from "./components/pages/DspCombinedTrucks"
// The page wich display all loads both for one person all loads and selected country they are all here
import DspAllLoads from "./components/pages/DspAllLoads"
// These are contracts for loads long term like when tthere is a 7 onths contract avaialvbel 
import LoadsContracts from "./components/pages/LoadsContracts"
// Dsp More Info of the Contract like more details
import ViewContractMoreInfo from "./components/pages//MoreContractInfo"

import BookLContract from "./components/pages/BookContract"
// Function that allow you to select a truck type you want to view its fount on the header
import SelectOneTruckType from "./components/pages/selectOnteTruckType"
// The page wich allow somone to view only one Truck type is were the trucks can be viewed
import DspOneTruckType from "./components/pages/DspOneTruckType"

// THe below is code to add itemrs in logistics sector eg trucks and loads
// When one click Add button on the fist page when they eneter the app

// The first page where they select are they adding loads or trucks display 
import AddIterms from "./components/DataBase/AddIterms"

// This page display when a user select a truck type they want to add and mention they want to add a truck
import DBTrucksAdd from "./components/DataBase/DBTrucksAdd"

// If one want to add a load this page will display
import AddLoadDB from "./components/DataBase/addloadDB";

// When they have privelleg to add contracts this is the page to add contracts
import AddLoadContractDB from "./components/DataBase/AddLoadsContracts"

// THe code for adding Iterns end here


// Here start the code that allow somone to modify the data they have added 

// Allow somoene to specify what they want to edit in their personal Products just seleecting
import SelectPersnalAcc from "./components/PersonalData/SelectPersnalAcc"
// Give Accesss to the loads one have added and allow them to delete them  and modify them 
import PersnalAccLoads from "./components/PersonalData/PersnalAccLoads"
// Allow one to edit their personal information eg changing a username or contact  also were somoene can signout
import PersnonalAccInfoEdit from "./components/PersonalData/PersnonalAccInfoEdit"
// Give Accesss to the trucks one have added and allow them to delete them  and modify them 
import PersonalAccTrucks from "./components/PersonalData/PersonalAccTrucks"
// Here END the code that allow somone to modify the data they have added 

// Here beigin the code that allow people to conctact one another for communication

// The page below is for the main group were people can join a community similiar to a whatsapp group
import SlctBookingAndBidding from "./components/communcication/selectBookingAndBiddding"
// This is were the code that display all bookings and bids are shown wthere you bookked bidded or your itenrs are 
import BookingsAndBiddings from "./components/communcication/DspBookingsAndBiidinga"
// Code for communication end here

// This page is when you select one persns truck like after when they book your load and you click truck owned or when search a truck just ersonal trucks for one user
import SelectedUserTrucks from "./components/selectedUserIterms/userPersonalTrucls"


// All code for the store start here

// After a user click on store they selct location this is the page where they must select the location 
import ShopLocation from "./components/shop/shopHome"
// The page below is like the App for the store . It the one that combine all itemrs like the shop header itemrs beign sold and put all itemrs on the same page. Thhats were you find the shop Header an other shop properties pages called in it
import DspShopIterms from "./components/shop/DspShopIterms"
// The page below is the one were you select what you want to add to the shop like specify want to sell or buy and also specify what you are having and directed to the page were you can add the product
import SelectAddToShop from "./components/shop/SelectAddToShop"
// This is the page where one add their Itenrs to the shop after they selct hat they are adding thats were the info is taken
import AddToShop from "./components/shop/AddToShop"
// When is were we get shop iterms for one person only like all the elements added by the user the selected one and you can select them in shop Home page when one click a user 
import OneFirmsShop from "./components/shop/OneFirmsShop";
// This is the page were you can search products in the shop and  select them its were you can search in shop
import SearchInshop from "./components/shop/SearchInshop";
// All code for the store endt here



// The Page below is when you want to book a a verified load and must add the reuirements
import BBVerifiedLoad from "./components/verify/BBVerifiedLoad"

// This is the page were one can contact for help when they face issues  and can be acceseed when press help on small menu
import HelpHome from "./components/HelpCentre/HelpHome"
// This is the page were one can get information on how to be verified and can get verified 
import VerifyInfo from './components/verify/verifyInfo'
// This is were one can download or share the mobile app
import BlackList from './components/verify/Blacklist'
import MobileAppSD from "./components/MobileAppSD"
// The is were one can View the updates any update abut anything way for developer to meet the user
import AppUpdates from "./components/pages/Updates"

// We impoerting the page were we display the page to book a GIT
import ApplyGit from "./components/verify/ApplyGit"

// When one is applying for Verfication first time
import ApplyVerification from "./components/verify/ApplyVerification"

// These are ongoing events that are for transport and logistics indurty eg burnouts or carshow
import Events from "./components/pages/Events"
import ViewEvent from "./components/pages/ViewEvent"



// These are icons to be used in the App 
import MaterialIcons from '@expo/vector-icons/MaterialIcons';


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function sendPushNotification(expoPushToken, title, message, dbName) {
  const notification = {
    to: expoPushToken,
    sound: 'default',
    title: title,
    body: message,
    data: {
      message: "helpHome",
      dbName: dbName,
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

  if (isDevice) {
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








function HomeScreen({ navigation, route, }) {


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
  const [notification, setNotification] = useState(Notifications.Notification)

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



  if (notification) {
    let dbName = notification.request.content.data.dbName
    let wereToG0
    if (dbName === "bookings") {
      wereToG0 = "yourBookedItems"
    } else if (dbName === "biddings") {
      wereToG0 = "yourBiddedItems"
    }
    navigation.navigate(`DspBookingsAndBiddings`, { dbName: dbName, dspRoute: wereToG0 })
    setNotification(null)
  }



  const [trackLoading, setTrackLoading] = React.useState(false)
  const [trackLoadingScnd, setTrackLoadingScnd] = React.useState(false)

  const [currentUser, setCurrentUser] = React.useState("");
  const [username, setUsername] = React.useState(false);
  const [contact, setContact] = React.useState('');

  // Check if user is already signed in
  function checkAuthSta() {
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

  function reloadApp() {

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
      } else if (!auth.currentUser && trackLoading) {
        setUsername("")
      }
      setTrackLoading(true)
      if (trackLoading) {
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
  }, []);


  if (!isConnectedInternet) {

    alert("You are offline. Please check your internet connection.")
  }
  const logout = async () => {

    try {
      setemailVerifiedN(false)
      setCurrentUser(null)
      await signOut(auth)

    } catch (err) {
      console.error(err)
    }
  }
  const newCodeEmVeri = async () => {
    try {
      const user = auth.currentUser;

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

  const [whenemailVerifiedN, setemailVerifiedN] = React.useState(false)


  const [smallMenu, setSmallMenu] = React.useState(false)

  function toggleSmallMenu() {
    setSmallMenu(prev => !prev)
  }

  const [addStoreLoc, setStoreLoc] = React.useState(false)

  function checkAuth(routeToGo) {

    if (username !== false || trackLoadingScnd) {

      if (!currentUser) {
        navigation.navigate("createUser")
      } else if (!currentUser.emailVerified) {
        setemailVerifiedN(true)
        return
      } else if (currentUser && !username) {
        navigation.navigate("addPersnoalInfo")
      } else {
        if (routeToGo === "selectAddIterms") {

          navigation.navigate('selectAddIterms', { verifiedLoad: false })
        } else if (routeToGo === "selectAddToShop") {
          setStoreLoc(true)
        } else {
          toggleSmallMenu()
        }
      }

    }
  }

  const [dspLoads, setDspLoads] = React.useState(false)
  function toggleDspLoads() {
    setDspLoads(true)
    setDspTrckType(false)
    setDspFrstPage(false)

  }


  const [dspTruckType, setDspTrckType] = React.useState(false)
  function toggleDspTrckType() {
    setDspTrckType(true)
    setDspLoads(false)
  }

  const [dspFrstPage, setDspFrstPage] = React.useState(true)
  function toggleFrstPage() {
    setDspFrstPage(false)
  }

  function toggleGoHome() {
    setDspFrstPage(true)
    setDspTrckType(false)
    setDspLoads(false)
  }




  useEffect(() => {
    const backAction = () => {

      if (dspLoads) {
        toggleGoHome()
        return true; // Prevent default back button action
      } else if (dspTruckType) {
        setDspTrckType(false)
        return true;
      } else {

        return false
      }
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [dspLoads, dspTruckType, dspFrstPage]);



  const [userIsVerified, setIsVerified] = React.useState(false);
  const [reverifyUserV, setReverifyUser] = React.useState(false)

  const [isBlackListed, setIsBlacListed] = React.useState(false);

  const [blackLWarning, setIsblacklWarning] = React.useState(false);
  const [blackLWarningDSP, setIsblacklWarningDSP] = React.useState(false);

  const [blockVerifiedU, setBlockVerifiedU] = React.useState(false)

  async function changeStatuses(userId, elemUpdate) {
    const docRef = doc(db, 'userStatuses', userId);
    try {
      if (elemUpdate === "verifcation") {

        await updateDoc(docRef, {
          isVerified: false, veriExpTime: 0, reverifyUser: true, reverfyTime: Date.now() + 14 * 24 * 60 * 60 * 1000
        });
        alert("Verification Expired! \nRe-verify to unlock features.")
      } else if (elemUpdate === "blockWarn") {

        await updateDoc(docRef, { isBlackListed: true, blackLWarning: false, usernameBL: username, contactBL: contact });
        alert("You have been blocked")
      } else if (elemUpdate === "reverfyOff") {

        await updateDoc(docRef, {
          veriExpTime: 0, reverifyUser: false, reverfyTime: 0, leftVeri: true, usernameLV: username, contactLV: contact
        });
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

            const veriExpTime = data.veriExpTime || false; // Assuming isVerified is a boolean field
            const blockBlackWarn = data.blockBlackWarn || false; // Aswsuming isVerified is a boolean field
            const reverfyTime = data.reverfyTime || false; // Aswsuming isVerified is a boolean field


            const timeRemainingVer = veriExpTime - Date.now();

            if (isVerifiedValue) {
              if (timeRemainingVer <= 0) {
                changeStatuses(userId, "verifcation")
              } else if (timeRemainingVer > 0) {
                setIsVerified(isVerifiedValue)
              }

            }

            const timeRemainingReVer = reverfyTime - Date.now();
            if (reverifyUserValue) {
              if (timeRemainingReVer <= 0) {
                changeStatuses(userId, "reverfyOff")

              } else {
                setReverifyUser(true)
              }
            }

            const blockBlackWarnTim = blockBlackWarn - Date.now();

            if (blackLWrningValue) {
              if (blockBlackWarnTim <= 0) {

                changeStatuses(userId, "blockWarn")
              } else if (blockBlackWarnTim > 0) {

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
  }, [currentUser]);


  const [newAppUpdate, setNewAppUpdate] = React.useState(false)
  const [newAppUpdateTU, setNewAppUpdateTU] = React.useState(false)
  const [updateApp, setUpdateApp] = React.useState(false)
  const [downloadPlayStore, setDownloadOnPlaystore] = React.useState(false)
  const [downloadApkLink, setDownloadApkLink] = React.useState(false)

  React.useEffect(() => {
    try {
      const loadsQuery = query(collection(db, "updateEveryone"));
      const unsubscribe = onSnapshot(loadsQuery, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const newAppUpdate = data.newAppUpdate; // Assuming isVerified is a boolean field

          const newAppUpdateFTime = data.newAppUpdateFTime; // Assuming isVerified is a boolean field

          const newAppUpdateApkLink = data.newAppUpdateApkLink
          const newAppUpdatePlystore = data.switchToPlayStoreLink

          const appUpdateFTim = newAppUpdateFTime - Date.now();
          if (newAppUpdate) {
            if (appUpdateFTim <= 0) {
              if (newAppUpdateApkLink) {

                setDownloadApkLink(newAppUpdateApkLink)
              } else if (newAppUpdatePlystore) {
                setDownloadOnPlaystore(newAppUpdatePlystore)
              }

              setNewAppUpdateTU(true)
            } else {
              if (newAppUpdateApkLink) {

                setDownloadApkLink(newAppUpdateApkLink)
              } else if (newAppUpdatePlystore) {
                setDownloadOnPlaystore(newAppUpdatePlystore)
              }
              setNewAppUpdate(newAppUpdate)

            }


          }
        });
      });

      return () => unsubscribe(); // Cleanup the listener when the component unmounts
    } catch (error) {
      console.error(error);
    }
  }, [currentUser, username]);



  const packageJson = require('../package.json');
  const appVersion = packageJson.version;


  React.useEffect(() => {

    if (username !== false || trackLoadingScnd) {

      if (appVersion !== newAppUpdate) {
        setUpdateApp(true)
      }
    }
  }, [newAppUpdate]);





  const [contractFeature, setContactFeature] = React.useState(false)
  function toggleContractFeature() {
    setContactFeature(prev => !prev)
  }

  const [contrreuirements, setcontrreuirements] = React.useState(false)
  const [contrAdtionalI, setcontAdditonalInf] = React.useState(false)



  return (
    <View>

      {!isBlackListed ? <View >
        <Header navigation={navigation} checkAuth={checkAuth} smallMenu={smallMenu} dspMenu={username !== false} />

        <View style={{ flexDirection: 'row', justifyContent: "space-evenly", paddingLeft: 20, paddingRight: 20, height: 40, alignItems: 'center', backgroundColor: '#6a0c0c', paddingTop: 10 }}>

          <TouchableOpacity onPress={() => setDspFrstPage(true)}
          >
            {!dspTruckType && !dspLoads ?
              <Text style={{ color: 'white', textDecorationLine: 'underline', fontWeight: '600', fontSize: 18 }} > Home</Text> :
              <Text style={{ color: 'white', }} > Home</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleDspLoads}>

            {dspLoads ?
              <Text style={{ color: 'white', textDecorationLine: 'underline', fontWeight: '600', fontSize: 18 }} > Loads</Text> :
              <Text style={{ color: 'white', }} > Loads</Text>
            }
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleDspTrckType} >

            {dspTruckType ?
              <Text style={{ color: 'white', textDecorationLine: 'underline', fontWeight: '600', fontSize: 18 }} > Trucks</Text> :
              <Text style={{ color: 'white', }} > Trucks</Text>
            }

          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('shopHome')}  >
            <Text style={{ color: 'white' }} >Store</Text>
          </TouchableOpacity>
        </View>

        {/* This is the first home that display when the u ser visit the app */}

        {dspFrstPage && <FirstHomePage setDspFrstPage={setDspFrstPage} checkAuth={checkAuth} addStoreLoc={addStoreLoc} navigation={navigation} blockVerifiedU={blockVerifiedU} blackLWarning={blackLWarning} username={username} toggleDspLoads={toggleDspLoads} />}


        {blackLWarningDSP && <View style={{ alignSelf: 'center', backgroundColor: 'white', zIndex: 100, position: 'absolute', top: 130, width: 300, padding: 7, height: 150, justifyContent: 'center', alignItems: 'center', borderRadius: 7 }} >
          <Text>Your account is currently under investigation.</Text>
          <Text>
            Please contact us for resolution If Not In 4days Your Account Will Be Blocked
          </Text>

          <View style={{ flexDirection: 'row' }} >

            <TouchableOpacity style={{ height: 27, backgroundColor: 'red', width: 65, borderRadius: 5, alignItems: 'center', margin: 7 }} onPress={() => setIsblacklWarningDSP(false)} >
              <Text style={{ color: 'white' }}>Cancel</Text>
            </TouchableOpacity>



            <TouchableOpacity onPress={() => Linking.openURL(`whatsapp://send?phone=+263716325160  &text=${encodeURIComponent(`Good day \nMy Transix account is being investigated whats the issue and how can we resolve it \nMy username is ${username}`)} `)} style={{ height: 27, backgroundColor: 'green', width: 65, borderRadius: 5, alignItems: 'center', margin: 7 }}>

              <Text style={{ color: 'white' }} >OK</Text>
            </TouchableOpacity>

          </View>
        </View>}


        {blockVerifiedU && <View style={{ alignSelf: 'center', backgroundColor: 'white', zIndex: 100, position: 'absolute', top: 130, width: 300, padding: 7, height: 150, justifyContent: 'center', alignItems: 'center', borderRadius: 7 }} >
          <Text>Important: You are an investigated  verified user.</Text>
          <Text> Legal action may be taken if necessary. Contact us immediately..</Text>

          <Text>
            Please contact us for resolution If Not In 4days Your Account Will Be Blocked
          </Text>

          <View style={{ flexDirection: 'row' }} >

            <TouchableOpacity style={{ height: 27, backgroundColor: 'red', width: 65, borderRadius: 5, alignItems: 'center', margin: 7 }} onPress={() => setIsblacklWarning(false)} >
              <Text style={{ color: 'white' }}>Cancel</Text>
            </TouchableOpacity>



            <TouchableOpacity onPress={() => Linking.openURL(`whatsapp://send?phone=+263716325160  &text=${encodeURIComponent(`Good day \n I am a  investiged Transix verified User \nMy username is ${username} \n How can we speed up the resolving process l am legit`)} `)} style={{ height: 27, backgroundColor: 'green', width: 65, borderRadius: 5, alignItems: 'center', margin: 7 }}>

              <Text style={{ color: 'white' }} >OK</Text>
            </TouchableOpacity>

          </View>
        </View>}


        {/* {reverifyUserV && <View style={{alignSelf:'center', backgroundColor :'white', zIndex:100, position:'absolute', top : 130 , width:300, padding:7, height:150, justifyContent:'center',alignItems :'center', borderRadius:7}} >
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
    </View>} */}



        {updateApp && <View style={{ position: 'absolute', top: 10, left: 0, right: 0, bottom: 0, zIndex: 500, backgroundColor: 'rgba(106, 12, 12, 0.4)' }}>
          <View style={{ alignSelf: 'center', backgroundColor: 'white', zIndex: 100, position: 'absolute', top: 130, width: 300, padding: 7, height: 100, justifyContent: 'center', alignItems: 'center', borderRadius: 7 }} >

            {downloadApkLink ? <Text>Update App not yet on Playstore </Text> : <Text>Update App on Playstore</Text>}

            <Text>To latest better version</Text>
            <View style={{ flexDirection: 'row', justifyContent: "space-evenly", marginTop: 7 }} >

              {!newAppUpdateTU && <TouchableOpacity style={{ height: 27, backgroundColor: 'red', width: 65, borderRadius: 5, alignItems: 'center', margin: 7 }} onPress={() => setUpdateApp(false)} >
                <Text style={{ color: 'white' }}>Cancel</Text>
              </TouchableOpacity>}


              {!newAppUpdateTU && <TouchableOpacity onPress={() => Linking.openURL(`${downloadApkLink ? downloadApkLink : downloadPlayStore}`)} style={{ height: 27, backgroundColor: 'green', width: 65, borderRadius: 5, alignItems: 'center', margin: 7 }}>

                <Text style={{ color: 'white' }} >OK</Text>
              </TouchableOpacity>}


              {newAppUpdateTU && <TouchableOpacity onPress={() => Linking.openURL(`${downloadApkLink ? downloadApkLink : downloadPlayStore}`)} style={{ height: 35, backgroundColor: 'green', width: 120, borderRadius: 5, alignItems: 'center', margin: 7, alignSelf: 'center' }}>

                <Text style={{ color: 'white' }} >OK</Text>
              </TouchableOpacity>}


            </View>
          </View>
        </View>
        }


        {whenemailVerifiedN && <View style={{ alignSelf: 'center', backgroundColor: 'white', zIndex: 100, position: 'absolute', top: 130, width: 300, padding: 7, height: 150, justifyContent: 'center', alignItems: 'center', borderRadius: 7 }} >
          <Text style={{ fontSize: 17, fontWeight: '600' }} >Verify Your Email</Text>
          <Text style={{ fontSize: 17, fontWeight: '600', color: 'green' }} >{currentUser.email}</Text>
          <Text>To Proceed........</Text>
          <View style={{ flexDirection: 'row', justifyContent: "space-evenly", marginTop: 7 }} >

            <TouchableOpacity style={{ height: 27, backgroundColor: 'red', width: 65, borderRadius: 5, alignItems: 'center', margin: 7 }} onPress={logout} >
              <Text style={{ color: 'white' }}>Sign Out</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={newCodeEmVeri} style={{ borderWidth: 2, marginLeft: 6, marginRight: 5, width: 80, height: 27, alignItems: 'center', marginTop: 7 }} >
              <Text>new code</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={reloadApp} style={{ height: 27, backgroundColor: 'green', width: 65, borderRadius: 5, alignItems: 'center', margin: 7 }}>
              <Text style={{ color: 'white' }} >Refresh</Text>
            </TouchableOpacity>

          </View>
        </View>}

        {!blockVerifiedU && !blackLWarning && username !== false && !dspFrstPage && <TouchableOpacity onPress={() => checkAuth("selectAddIterms")} style={{ position: 'absolute', top: 440, right: 10, width: 80, height: 35, alignItems: "center", justifyContent: "space-around", backgroundColor: '#228B22', zIndex: 200, borderRadius: 8, flexDirection: 'row' }} >
          <Text style={{ color: 'white', fontSize: 17, fontWeight: 'bold' }} >Add</Text>
          <MaterialIcons name="add-box" size={26} color="white" />
        </TouchableOpacity>}


        {dspLoads && !dspTruckType && <DspAllLoads username={username} contactG={contact} route={route} sendPushNotification={sendPushNotification} expoPushToken={expoPushToken} userIsVerified={userIsVerified} blockVerifiedU={blockVerifiedU} blackLWarning={blackLWarning} />}
        {dspTruckType && <SelectOneTruckType navigation={navigation} />}
      </View> :
        <View>
          <Text>You Have been blocked</Text>
        </View>

      }

    </View>
  );
}



function App() {




  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(Notifications.Notification)

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


  const [username, setUsername] = React.useState("");
  const [contact, setContact] = React.useState('');
  const [spechopLoc, setShopLoc] = React.useState('');
  const [deliveryR, setDeliveryR] = React.useState('');

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


  const [verifyOngoing, setverifyOngoing] = React.useState(false)

  React.useEffect(() => {
    try {
      if (auth.currentUser) {
        const loadsQuery = query(collection(db, "updateEveryone"));

        const unsubscribe = onSnapshot(loadsQuery, (querySnapshot) => {
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            const isVerifyOngoing = data.verifyOngoing || false; // Assuming isVerified is a boolean field

            setverifyOngoing(isVerifyOngoing)
          });
        });

        return () => unsubscribe(); // Cleanup the listener when the component unmounts
      }
    } catch (error) {
      console.error(error);
    }
  }, [currentUser, username]);



  const [isVerified, setIsVerified] = React.useState(false);
  const [isBlackListed, setIsBlacListed] = React.useState(false);
  const [blackLWarning, setIsblacklWarning] = React.useState(false);
  const [blockVerifiedU, setBlockVerifiedU] = React.useState(false)


  if (username) {

    if (isBlackListed) {
      alert("You Are Blacklisted")
      return
    } if (blockVerifiedU) {
      alert("Important: You are a blocked verified user.\n Legal action may be taken if necessary. \nContact us immediately.")
      Linking.openURL(`whatsapp://send?phone=+263716325160  &text=${encodeURIComponent(`Good day \n I am a blocked Transix verified User \nMy username is ${username} \n How can we speed up the resolving process l am legit`)} `)
    }

  }

  async function changeStatuses(userId, elemUpdate) {
    const docRef = doc(db, 'userStatuses', userId);
    try {
      if (elemUpdate === "verifcation") {

        await updateDoc(docRef, { isVerified: false, veriExpTime: 0 });
        alert("Verification Expired! \nRe-verify to unlock features.")
      } else if (elemUpdate === "blockWarn") {

        await updateDoc(docRef, { isBlackListed: true, blackLWarning: false });
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

            const veriExpTime = data.veriExpTime || false; // Assuming isVerified is a boolean field
            const blockBlackWarn = data.blockBlackWarn || false; // Aswsuming isVerified is a boolean field

            const timeRemainingVer = veriExpTime - Date.now();

            if (isVerifiedValue) {
              if (timeRemainingVer <= 0) {
                changeStatuses(userId, "verifcation")
              } else if (timeRemainingVer > 0) {
                setIsVerified(isVerifiedValue)
              }

            }

            const blockBlackWarnTim = blockBlackWarn - Date.now();

            if (blackLWrningValue) {
              if (blockBlackWarnTim <= 0) {

                changeStatuses(userId, "blockWarn")
              } else if (blockBlackWarnTim > 0) {

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
  }, [currentUser, username]);


  const Stack = createNativeStackNavigator();


  return (
    <Stack.Navigator>

      {/* <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} /> */}
      <Stack.Screen name="Truckerz"
        options={{ headerShown: false }}
        component={HomeScreen}

        notification={notification}
        initialParams={{ isBlackListed: isBlackListed, blockVerifiedU: blockVerifiedU, blackLWarning: blackLWarning, isVerified: isVerified }}
      />

      <Stack.Screen name="searchElement" component={SearchIterms} options={{ headerShown: false }} />

      <Stack.Screen name="createUser" component={CreateUser} options={{ title: 'create Account', headerStyle: { backgroundColor: '#6a0c0c', }, headerTintColor: 'white', }} />
      <Stack.Screen name="signInexistAcc" component={SignIn} options={{ title: 'create Account', headerStyle: { backgroundColor: '#6a0c0c', }, headerTintColor: 'white', }} />

      <Stack.Screen name="addPersnoalInfo" component={PersonalAccInfo} options={{ title: 'Personal Information', headerStyle: { backgroundColor: '#6a0c0c', }, headerTintColor: 'white', }} />

      <Stack.Screen name="selectPeronalAcc" component={SelectPersnalAcc} options={{ title: 'Transix', headerStyle: { backgroundColor: '#6a0c0c', }, headerTintColor: 'white', }} initialParams={{ isVerified: isVerified }} />
      <Stack.Screen name="personalInfomation" component={PersnonalAccInfoEdit} initialParams={{ username: username, contact: contact, }} options={{ headerShown: false }} />
      <Stack.Screen name="peronalAccLoads" component={PersnalAccLoads} options={{ title: 'Manage Loads', headerStyle: { backgroundColor: '#6a0c0c', }, headerTintColor: 'white', }} />
      <Stack.Screen name="peronalAccTrucks" component={PersonalAccTrucks} options={{ title: 'Manage Trucks', headerStyle: { backgroundColor: '#6a0c0c', }, headerTintColor: 'white', }} />

      <Stack.Screen name="SlctBookingsAndBiddings" component={SlctBookingAndBidding} options={{ title: 'Bookings And Biddings', headerStyle: { backgroundColor: '#6a0c0c', }, headerTintColor: 'white', }} />
      <Stack.Screen name="DspBookingsAndBiddings" component={BookingsAndBiddings} options={{ headerShown: false }} />

      <Stack.Screen name="selectAddIterms" component={AddIterms} options={{ title: 'Add Iterms', headerStyle: { backgroundColor: '#6a0c0c', }, headerTintColor: 'white', }} />

      <Stack.Screen name="addContractsDb" component={AddLoadContractDB} initialParams={{ username: username, contact: contact, expoPushToken: expoPushToken, isVerified: isVerified, isBlackListed: isBlackListed, blackLWarning: blackLWarning, blockVerifiedU: blockVerifiedU, verifyOngoing: verifyOngoing }} options={{ title: 'Add contracts', headerStyle: { backgroundColor: '#6a0c0c', }, headerTintColor: 'white', }} />
      <Stack.Screen name="addLoadsDB" component={AddLoadDB} initialParams={{ username: username, contact: contact, expoPushToken: expoPushToken, isVerified: isVerified, isBlackListed: isBlackListed, blackLWarning: blackLWarning, blockVerifiedU: blockVerifiedU, verifyOngoing: verifyOngoing }} options={{ title: 'Add Loads', headerStyle: { backgroundColor: '#6a0c0c', }, headerTintColor: 'white', }} />
      <Stack.Screen name="addTrucksDB" component={DBTrucksAdd} initialParams={{ username: username, contact: contact, expoPushToken: expoPushToken, isVerified: isVerified, isBlackListed: isBlackListed, blackLWarning: blackLWarning, blockVerifiedU: blockVerifiedU, verifyOngoing: verifyOngoing }} options={{ headerShown: false }} />

      <Stack.Screen name="dspOneTrckType" component={DspOneTruckType} options={{ headerShown: false }} initialParams={{ blockVerifiedU: blockVerifiedU, blackLWarning: blackLWarning }} />

      <Stack.Screen name="selectedUserLoads" component={DspAllLoads} options={{ headerShown: false }} initialParams={{ username: username, contact: contact, blockVerifiedU: blockVerifiedU, blackLWarning: blackLWarning }} />

      <Stack.Screen name="loadsContracts" component={LoadsContracts} options={{ headerShown: false }} initialParams={{ username: username, contact: contact, blockVerifiedU: blockVerifiedU, blackLWarning: blackLWarning }} />
      <Stack.Screen name="ViewContractMoreInfo" component={ViewContractMoreInfo} options={{ headerShown: false }} />


      <Stack.Screen name="BookLContract" component={BookLContract} options={{ headerShown: false }} initialParams={{ username: username, contact: contact, blockVerifiedU: blockVerifiedU, blackLWarning: blackLWarning }} />



      <Stack.Screen name="selectedUserTrucks" component={SelectedUserTrucks} options={{ headerShown: false }} initialParams={{ blockVerifiedU: blockVerifiedU, blackLWarning: blackLWarning, isVerified: isVerified }} />


      <Stack.Screen name="shopHome" component={ShopLocation} options={{ title: 'Welcome To Store', headerStyle: { backgroundColor: '#6a0c0c', }, headerTintColor: 'white', }} />
      <Stack.Screen name="DspShop" component={DspShopIterms} options={{ headerShown: false }} initialParams={{ spechopLoc: spechopLoc, blockVerifiedU: blockVerifiedU, blackLWarning: blackLWarning }} />
      <Stack.Screen name="slctAddShop" component={SelectAddToShop} options={{ title: 'Add To Shop', headerStyle: { backgroundColor: '#6a0c0c', }, headerTintColor: 'white', }} />
      <Stack.Screen name="AddToShop" component={AddToShop} options={{ headerShown: false }}
        initialParams={{ username: username, contact: contact, isVerified: isVerified, shopLocation: spechopLoc, deliveryR: deliveryR, expoPushToken: expoPushToken, isBlackListed: isBlackListed, blackLWarning: blackLWarning, blockVerifiedU: blockVerifiedU, verifyOngoing: verifyOngoing }} />
      <Stack.Screen name="oneFirmsShop" component={OneFirmsShop} options={{ headerShown: false }} initialParams={{ blockVerifiedUP: blockVerifiedU, blackLWarningP: blackLWarning }} />
      <Stack.Screen name="searchInShop" component={SearchInshop} options={{ headerShown: false }} />

      <Stack.Screen name="helpHome" component={HelpHome} options={{ title: 'Help', headerStyle: { backgroundColor: '#6a0c0c', }, headerTintColor: 'white', }} />
      <Stack.Screen name="mobileAppSD" component={MobileAppSD} options={{ title: 'Mobile app', headerStyle: { backgroundColor: '#6a0c0c', }, headerTintColor: 'white', }} />
      <Stack.Screen name="updates" component={AppUpdates} options={{ title: 'Updates', headerStyle: { backgroundColor: '#6a0c0c', }, headerTintColor: 'white', }} />


      <Stack.Screen name="applyGit" component={ApplyGit} initialParams={{ username: username, contact: contact, }} options={{ title: 'Goods In Transit', headerStyle: { backgroundColor: '#6a0c0c', }, headerTintColor: 'white', }} />
      <Stack.Screen name="applyVerification" component={ApplyVerification} initialParams={{ username: username, contact: contact, }} options={{ title: 'Apply Verification', headerStyle: { backgroundColor: '#6a0c0c', }, headerTintColor: 'white', }} />



      <Stack.Screen name="Events" component={Events} options={{ headerShown: false }} initialParams={{ username: username, contact: contact, }} />
      <Stack.Screen name="viewEvent" component={ViewEvent} options={{ headerShown: false }} initialParams={{ username: username, contact: contact, }} />


      <Stack.Screen name="blackListed" component={BlackList} options={{ title: ' Black List', headerStyle: { backgroundColor: '#6a0c0c', }, headerTintColor: 'white', }} />
      <Stack.Screen name="verifyInfo" component={VerifyInfo} options={{ title: ' Verification Info', headerStyle: { backgroundColor: '#6a0c0c', }, headerTintColor: 'white', }} />
      <Stack.Screen name="bbVerifiedLoad" component={BBVerifiedLoad} options={{ headerShown: false }} />

    </Stack.Navigator>


  )
}
export default App


