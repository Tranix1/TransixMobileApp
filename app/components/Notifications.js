// import React from "react"
// import * as Device from 'expo-device';
// import * as Notifications from 'expo-notifications';
// import Constants from 'expo-constants';

// import { useNavigation } from '@react-navigation/native';

//   const navigation = useNavigation();


// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: false,
//     shouldSetBadge: false,
//   }),
// });

// async function sendPushNotification(expoPushToken, title, message,dbName ) {
//   const notification = {
//     to: expoPushToken,
//     sound: 'default',
//     title: title,
//     body: message,
//     data: {
//       message: "helpHome",
//       dbName : dbName, 
//     }
//   };

//   await fetch('https://exp.host/--/api/v2/push/send', {
//     method: 'POST',
//     headers: {
//       Accept: 'application/json',
//       'Accept-encoding': 'gzip, deflate',
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(notification),
//   });
// }

// function handleRegistrationError(errorMessage) {
//   throw new Error(errorMessage);
// }

// async function registerForPushNotificationsAsync() {
//   if (Platform.OS === 'android') {
//     Notifications.setNotificationChannelAsync('default', {
//       name: 'default',
//       importance: Notifications.AndroidImportance.MAX,
//       vibrationPattern: [0, 250, 250, 250],
//       lightColor: '#FF231F7C',
//     });
//   }

//   if (Device.isDevice) {
//     const { status: existingStatus } = await Notifications.getPermissionsAsync();
//     let finalStatus = existingStatus;
//     if (existingStatus !== 'granted') {
//       const { status } = await Notifications.requestPermissionsAsync();
//       finalStatus = status;
//     }
//     if (finalStatus !== 'granted') {
//       handleRegistrationError('Permission not granted to get push token for push notification!');
//       return;
//     }
//     const projectId =
//       Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
//     if (!projectId) {
//       handleRegistrationError('Project ID not found');
//     }
//     try {
//       const pushTokenString = (
//         await Notifications.getExpoPushTokenAsync({
//           projectId,
//         })
//       ).data;
//       return pushTokenString;
//     } catch (e) {
//       handleRegistrationError(`${e}`);
//     }
//   } else {
//     handleRegistrationError('Must use physical device for push notifications');
//   }
// }

//       // }
//   const [expoPushToken, setExpoPushToken] = useState('');
//   const [notification, setNotification] = useState(Notifications.Notification )

//   const notificationListener = useRef(Notifications.Subscription);
//   const responseListener = useRef(Notifications.Subscription);

//   useEffect(() => {
//     registerForPushNotificationsAsync()
//       .then(token => setExpoPushToken(token ?? ''))
//       .catch((error) => setExpoPushToken(`${error}`));

//     notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
//       setNotification(notification);
//     });

//     responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
//       console.log(response);
//     });

//     return () => {
//       notificationListener.current &&
//         Notifications.removeNotificationSubscription(notificationListener.current);
//       responseListener.current &&
//         Notifications.removeNotificationSubscription(responseListener.current);
//     };
//   }, [notification]);


  
//   if(notification){
//     let dbName = notification.request.content.data.dbName 
//     let wereToG0 
//     if(dbName ==="bookings" ){
//       wereToG0 = "yourBookedItems"
//     }else if(dbName=== "biddings"){
//       wereToG0="yourBiddedItems"
//     }
//     navigation.navigate(`DspBookingsAndBiddings` , {dbName: dbName , dspRoute :wereToG0})
//     setNotification(null)
//   }

// const NotificationsEx ={
// expoPushToken ,
// notification,
// sendPushNotification 
// }

// export default React.memo(NotificationsEx)