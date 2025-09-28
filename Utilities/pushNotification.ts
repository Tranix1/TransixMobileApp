import { useState, useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

// Set notification handler for both development and production
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    console.log('📱 Notification received:', notification);
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    };
  },
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

  // Test notification function
  const schedulePushNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test Notification 🧪",
        body: 'This is a test notification to verify setup',
        data: { test: true },
      },
      trigger: {
        type: 'timeInterval',
        seconds: 2,
        repeats: false,
      },
    });
  };

  return {
    expoPushToken,
    notification,
    schedulePushNotification,
  };
}

// Internal function
async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('myNotificationChannel', {
        name: 'Default channel',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
        enableVibrate: true,
        enableLights: true,
        showBadge: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });
      console.log('✅ Android notification channel created');
    } catch (error) {
      console.error('❌ Error creating Android notification channel:', error);
    }
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowAnnouncements: true,
          allowCriticalAlerts: false,
          provideAppNotificationSettings: true,
        },
        android: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert('Permission Error', 'Failed to get push token for notifications!');
      return;
    }

    try {
      // Try multiple ways to get project ID for better compatibility
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId ??
        Constants?.expoConfig?.extra?.projectId;

      if (!projectId) {
        console.error('Project ID not found in Constants');
        console.log('Available Constants:', JSON.stringify(Constants, null, 2));
        throw new Error('Project ID not found');
      }

      console.log('Using Project ID:', projectId);

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
        development: __DEV__ // Use development flag for proper token generation
      });

      token = tokenData.data;
      console.log('✅ Expo Push Token generated:', token);
    } catch (e) {
      console.error('❌ Push token error:', e);
      // Try fallback method
      try {
        const fallbackToken = await Notifications.getExpoPushTokenAsync();
        token = fallbackToken.data;
        console.log('✅ Fallback Push Token:', token);
      } catch (fallbackError) {
        console.error('❌ Fallback token error:', fallbackError);
        token = '';
      }
    }
  } else {
    console.warn('⚠️ Must use a physical device for push notifications');
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
  // More lenient token validation
  if (!expoPushToken || expoPushToken.trim() === '') {
    console.error('❌ No push token provided or token is empty');
    console.log('🔍 Token value:', expoPushToken);
    return;
  }

  // Check if token looks valid (starts with ExponentPushToken)
  if (!expoPushToken.startsWith('ExponentPushToken[')) {
    console.warn('⚠️ Token format might be invalid:', expoPushToken);
    console.log('📤 Attempting to send anyway...');
  }

  console.log('📤 Sending push notification to:', expoPushToken);

  const message = {
    to: expoPushToken,
    sound: 'default',
    title,
    body,
    data: {
      route,        // 👈 Required for routing with expo-router
      ...extraData, // 👈 Optional additional data
    },
    priority: 'high',
    channelId: 'myNotificationChannel', // Android channel
  };

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Push notification sent successfully:', result);
    } else {
      console.error('❌ Push notification failed:', result);
    }
  } catch (error) {
    console.error('❌ Error sending push notification:', error);
  }
}

// Tracker sharing specific notifications
export const sendTrackerSharingRequestNotification = async (
  truckOwnerToken: string,
  loadOwnerName: string,
  loadDetails: string,
  loadRequestId: string
) => {
  console.log('🔔 sendTrackerSharingRequestNotification called with token:', truckOwnerToken);

  if (!truckOwnerToken) {
    console.error('❌ No truckOwnerToken provided to sendTrackerSharingRequestNotification');
    return;
  }

  const title = "Tracker Sharing Request";
  const body = `${loadOwnerName} has requested to share your truck's tracker for load: ${loadDetails}`;

  try {
    await sendPushNotification(
      truckOwnerToken,
      title,
      body,
      `/BooksAndBids/ViewBidsAndBooks?dspRoute=Requested by Carriers`,
      { loadRequestId, type: 'tracker_sharing_request' }
    );
  } catch (error) {
    console.error('❌ Error in sendTrackerSharingRequestNotification:', error);
  }
};

export const sendTrackerSharingAcceptedNotification = async (
  loadOwnerToken: string,
  truckOwnerName: string,
  truckDetails: string,
  loadRequestId: string
) => {
  console.log('🔔 sendTrackerSharingAcceptedNotification called with token:', loadOwnerToken);

  if (!loadOwnerToken) {
    console.error('❌ No loadOwnerToken provided to sendTrackerSharingAcceptedNotification');
    return;
  }

  const title = "Tracker Sharing Accepted";
  const body = `${truckOwnerName} has accepted your tracker sharing request for truck: ${truckDetails}`;

  try {
    await sendPushNotification(
      loadOwnerToken,
      title,
      body,
      `/BooksAndBids/ViewBidsAndBooks?dspRoute=Requested Loads`,
      { loadRequestId, type: 'tracker_sharing_accepted' }
    );
  } catch (error) {
    console.error('❌ Error in sendTrackerSharingAcceptedNotification:', error);
  }
};

export const sendBookingWithTrackerNotification = async (
  loadOwnerToken: string,
  truckOwnerName: string,
  loadDetails: string,
  hasTracker: boolean,
  loadRequestId: string
) => {
  console.log('🔔 sendBookingWithTrackerNotification called with token:', loadOwnerToken);

  if (!loadOwnerToken) {
    console.error('❌ No loadOwnerToken provided to sendBookingWithTrackerNotification');
    return;
  }

  const title = hasTracker ? "Load Booked - Truck Has Tracker" : "Load Booked - Truck Has No Tracker";
  const body = hasTracker
    ? `${truckOwnerName} has booked your load: ${loadDetails}. ✅ This truck has an active tracker available for sharing.`
    : `${truckOwnerName} has booked your load: ${loadDetails}. ⚠️ This truck does not have a tracker.`;

  try {
    await sendPushNotification(
      loadOwnerToken,
      title,
      body,
      `/BooksAndBids/ViewBidsAndBooks?dspRoute=Requested Loads`,
      { loadRequestId, type: 'booking_with_tracker', hasTracker }
    );
  } catch (error) {
    console.error('❌ Error in sendBookingWithTrackerNotification:', error);
  }
};


import { router, } from "expo-router";
// hooks/useNotificationRouting.ts




export function useNotificationRouting() {
  useEffect(() => {
    console.log('🔔 Notification listener mounted');

    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('🔔 Notification tapped:', response);

      const data = response.notification.request.content.data;

      // Delay execution by 1 second
      setTimeout(() => {
        if (data?.route) {
          console.log('➡️ Navigating to route:', data.route);

          // Handle both string routes and object routes
          if (typeof data.route === 'string') {
            router.push(data.route);
          } else if (typeof data.route === 'object' && data.route.pathname) {
            router.push(data.route);
          } else {
            console.log('❌ Invalid route format:', data.route);
          }
        } else {
          console.log('❌ No route in notification data');
        }
      }, 1000);
    });

    return () => subscription.remove();
  }, []);
}

