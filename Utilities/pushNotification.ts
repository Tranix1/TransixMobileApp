import { useState, useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

// // Set notification handler once
// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldPlaySound: false,
//     shouldSetBadge: false,
//     shouldShowBanner: true,
//     shouldShowList: true,
//   }),
// });

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,  // <-- this is the required property
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// Main hook to u   se in any screen/component
export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState<Notifications.Notification | undefined>();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => token && setExpoPushToken(token));

    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response received:', response);
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  // Schedule local push
  //   const schedulePushNotification = async () => {
  //     await Notifications.scheduleNotificationAsync({
  //       content: {
  //         title: "You've got mail! 📬",
  //         body: 'Here is the notification body',
  //         data: { data: 'goes here', test: { test1: 'more data' } },
  //       },

  //         trigger: {
  //     type: 'timeInterval',
  //     seconds: 2,
  //     repeats: false, // Optional — set to true if you want it to repeat
  //   },
  //     });
  //   };

  return {
    expoPushToken,
    notification,
    // schedulePushNotification,
  };
}

// Internal function
async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('myNotificationChannel', {
      name: 'Default channel',
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
      Alert.alert('Permission Error', 'Failed to get push token for notifications!');
      return;
    }

    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (!projectId) throw new Error('Project ID not found');

      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log('Expo Push Token:', token);
    } catch (e) {
      console.error('Push token error:', e);
      token = '';
    }
  } else {
    Alert.alert('Device Error', 'Must use a physical device for push notifications');
  }

  return token;
}



export async function sendPushNotification(
  expoPushToken: string,
  title: string,
  body: string,
  route: any, // ✅ New argument to specify route
  extraData: Record<string, any> = {} // Optional data like IDs
) {
  console.log("hiiii")
  const message = {
    to: expoPushToken,
    sound: 'default',
    title,
    body,
    data: {
      route,        // 👈 Required for routing with expo-router
      ...extraData, // 👈 Optional additional data
    },
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });

  console.log("Byeee")
}

// Tracker sharing specific notifications
export const sendTrackerSharingRequestNotification = async (
  truckOwnerToken: string,
  loadOwnerName: string,
  loadDetails: string,
  loadRequestId: string
) => {
  const title = "Tracker Sharing Request";
  const body = `${loadOwnerName} has requested to share your truck's tracker for load: ${loadDetails}`;

  await sendPushNotification(
    truckOwnerToken,
    title,
    body,
    `/BooksAndBids/ViewBidsAndBooks?dspRoute=Requested by Carriers`,
    { loadRequestId, type: 'tracker_sharing_request' }
  );
};

export const sendTrackerSharingAcceptedNotification = async (
  loadOwnerToken: string,
  truckOwnerName: string,
  truckDetails: string,
  loadRequestId: string
) => {
  const title = "Tracker Sharing Accepted";
  const body = `${truckOwnerName} has accepted your tracker sharing request for truck: ${truckDetails}`;

  await sendPushNotification(
    loadOwnerToken,
    title,
    body,
    `/BooksAndBids/ViewBidsAndBooks?dspRoute=Requested Loads`,
    { loadRequestId, type: 'tracker_sharing_accepted' }
  );
};

export const sendBookingWithTrackerNotification = async (
  loadOwnerToken: string,
  truckOwnerName: string,
  loadDetails: string,
  hasTracker: boolean,
  loadRequestId: string
) => {
  const title = hasTracker ? "Load Booked - Truck Has Tracker" : "Load Booked - Truck Has No Tracker";
  const body = hasTracker
    ? `${truckOwnerName} has booked your load: ${loadDetails}. ✅ This truck has an active tracker available for sharing.`
    : `${truckOwnerName} has booked your load: ${loadDetails}. ⚠️ This truck does not have a tracker.`;

  await sendPushNotification(
    loadOwnerToken,
    title,
    body,
    `/BooksAndBids/ViewBidsAndBooks?dspRoute=Requested Loads`,
    { loadRequestId, type: 'booking_with_tracker', hasTracker }
  );
};


import { router, } from "expo-router";
// hooks/useNotificationRouting.ts




export function useNotificationRouting() {
  useEffect(() => {
    console.log('🔔 Notification listener mounted');

    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('🔔 Notification tapped:', response);

      const data = response.notification.request.content.data;

      // Delay execution by 1 minute (60000 milliseconds)
      setTimeout(() => {
        if (data?.route) {
          console.log('➡️ Navigating to route:', data.route);
          router.push(data.route);

          // router.replace("/Logistics/Contracts/AddContracts");
        } else {
          console.log('❌ No route in notification data');
        }
      }, 1000);
    });

    return () => subscription.remove();
  }, []);
}

