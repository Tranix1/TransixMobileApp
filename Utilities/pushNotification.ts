import { useState, useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

// Check if running in Expo Go (where push notifications are not supported in SDK 53+)
const isExpoGo = Constants.appOwnership === 'expo';

// Set notification handler for both development and production
if (!isExpoGo) {
  try {
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
  } catch (error) {
    console.warn('⚠️ Could not set notification handler:', error);
  }
} else {
  console.log('ℹ️ Running in Expo Go - push notifications disabled for development');
}

// Main hook to use in any screen/component
export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState<Notifications.Notification | undefined>();

  useEffect(() => {
    // Skip notification setup in Expo Go
    if (isExpoGo) {
      console.log('ℹ️ Push notifications disabled in Expo Go - use development build for testing');
      return;
    }

    registerForPushNotificationsAsync().then(token => token && setExpoPushToken(token));

    let notificationListener: any;
    let responseListener: any;

    try {
      notificationListener = Notifications.addNotificationReceivedListener(notification => {
        setNotification(notification);
      });

      responseListener = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('Notification response received:', response);

        // Handle routing if route data is provided
        if (response.notification.request.content.data?.route) {
          const route = response.notification.request.content.data.route;
          console.log('Navigating to route:', route);
          // You can add navigation logic here if needed
        }
      });
    } catch (error) {
      console.error('❌ Error setting up notification listeners:', error);
    }

    return () => {
      try {
        notificationListener?.remove();
        responseListener?.remove();
      } catch (error) {
        console.warn('⚠️ Error removing notification listeners:', error);
      }
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
    // Add function to get token info for debugging
    getTokenInfo: () => ({
      token: expoPushToken,
      isProduction: !expoPushToken.includes('expo-go'),
      isDevelopment: expoPushToken.includes('expo-go'),
      projectId: Constants?.expoConfig?.extra?.eas?.projectId
    })
  };
}

// Internal function
async function registerForPushNotificationsAsync() {
  // Skip push notification registration in Expo Go
  if (isExpoGo) {
    console.log('⚠️ Push notifications not supported in Expo Go with SDK 53+. Use a development build for testing.');
    return null;
  }

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
        development: false // Always use production tokens for consistent app identity
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
    // Add app name for proper display
    _displayInForeground: true,
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
    // Skip notification routing in Expo Go
    if (isExpoGo) {
      console.log('ℹ️ Notification routing disabled in Expo Go');
      return;
    }

    console.log('🔔 Notification listener mounted');

    try {
      const subscription = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('🔔 Notification tapped:', response);

        const data = response.notification.request.content.data;

        // Delay execution by 1 second
        setTimeout(() => {
          try {
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
          } catch (error) {
            console.error('❌ Error handling notification navigation:', error);
          }
        }, 1000);
      });

      return () => {
        try {
          subscription.remove();
        } catch (error) {
          console.warn('⚠️ Error removing notification listener:', error);
        }
      };
    } catch (error) {
      console.error('❌ Error setting up notification routing:', error);
    }
  }, []);
}

