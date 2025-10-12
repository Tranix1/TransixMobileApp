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
          shouldShowBanner: true,
          shouldShowList: true,
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

    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token);
        // Auto-update all collections when token changes
        updateAllCollectionsWithNewToken(token);
      }
    });

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
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
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
import { getAdminUser, updateAdminExpoPushToken } from './adminPermissions';
import { collection, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { db } from '@/db/fireBaseConfig';
import { updateDocument } from '@/db/operations';
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
                console.log('➡️ Navigating to string route:', data.route);
                router.push(data.route as any);
              } else if (typeof data.route === 'object' && (data.route as any).pathname) {
                console.log('➡️ Navigating to object route:', data.route);
                router.push(data.route as any);
              } else {
                console.log('❌ Invalid route format:', data.route);
                // Fallback to admin panel if route is invalid
                router.push('/Account/Admin' as any);
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

/**
 * Send notification to all active admins
 * @param title - Notification title
 * @param body - Notification body
 * @param route - Route to navigate to
 * @param extraData - Additional data
 */
export const sendNotificationToAllAdmins = async (
  title: string,
  body: string,
  route: any,
  extraData: Record<string, any> = {}
) => {
  try {
    console.log('🔔 Sending notification to all admins...');

    // Get all active admins
    const adminsQuery = query(
      collection(db, 'adminRoles'),
      where('isActive', '==', true)
    );

    const adminsSnapshot = await getDocs(adminsQuery);
    const adminTokens: string[] = [];

    adminsSnapshot.forEach((doc) => {
      const adminData = doc.data();
      if (adminData.expoPushToken) {
        adminTokens.push(adminData.expoPushToken);
      }
    });

    console.log(`📊 Found ${adminTokens.length} active admins with tokens`);

    // Send notification to each admin
    const notificationPromises = adminTokens.map(token =>
      sendPushNotification(token, title, body, route, extraData)
    );

    await Promise.all(notificationPromises);
    console.log('✅ Notifications sent to all admins successfully');

  } catch (error) {
    console.error('❌ Error sending notifications to admins:', error);
  }
};

/**
 * Send notification to admins with specific permission
 * @param permission - The specific permission required (e.g., 'approve_trucks', 'approve_loads')
 * @param title - Notification title
 * @param body - Notification body
 * @param route - Route to navigate to
 * @param extraData - Additional data
 */
export const sendNotificationToAdminsWithPermission = async (
  permission: string,
  title: string,
  body: string,
  route: any,
  extraData: Record<string, any> = {}
) => {
  try {
    console.log(`🔔 Sending notification to admins with permission: ${permission}`);

    // Get all active admins
    const adminsQuery = query(
      collection(db, 'adminRoles'),
      where('isActive', '==', true)
    );

    const adminsSnapshot = await getDocs(adminsQuery);
    const adminTokens: string[] = [];

    adminsSnapshot.forEach((doc) => {
      const adminData = doc.data();
      // Check if admin has the specific permission
      if (adminData.expoPushToken && adminData.permissions && adminData.permissions.includes(permission)) {
        adminTokens.push(adminData.expoPushToken);
        console.log(`✅ Admin ${adminData.email} has permission: ${permission}`);
      }
    });

    console.log(`📊 Found ${adminTokens.length} admins with permission '${permission}' and tokens`);

    if (adminTokens.length === 0) {
      console.log(`⚠️ No admins found with permission: ${permission}`);
      return;
    }

    // Send notification to each admin with the permission
    const notificationPromises = adminTokens.map(token =>
      sendPushNotification(token, title, body, route, extraData)
    );

    await Promise.all(notificationPromises);
    console.log(`✅ Notifications sent to ${adminTokens.length} admins with permission '${permission}'`);

  } catch (error) {
    console.error('❌ Error sending notifications to admins with permission:', error);
  }
};

/**
 * Send notification to admins with multiple permissions (any of them)
 * @param permissions - Array of permissions (admin needs ANY of these)
 * @param title - Notification title
 * @param body - Notification body
 * @param route - Route to navigate to
 * @param extraData - Additional data
 */
export const sendNotificationToAdminsWithAnyPermission = async (
  permissions: string[],
  title: string,
  body: string,
  route: any,
  extraData: Record<string, any> = {}
) => {
  try {
    console.log(`🔔 Sending notification to admins with any of permissions: ${permissions.join(', ')}`);

    // Get all active admins
    const adminsQuery = query(
      collection(db, 'adminRoles'),
      where('isActive', '==', true)
    );

    const adminsSnapshot = await getDocs(adminsQuery);
    const adminTokens: string[] = [];

    adminsSnapshot.forEach((doc) => {
      const adminData = doc.data();
      // Check if admin has ANY of the specified permissions
      if (adminData.expoPushToken && adminData.permissions) {
        const hasAnyPermission = permissions.some(permission =>
          adminData.permissions.includes(permission)
        );

        if (hasAnyPermission) {
          adminTokens.push(adminData.expoPushToken);
          const adminPermissions = permissions.filter(p => adminData.permissions.includes(p));
          console.log(`✅ Admin ${adminData.email} has permissions: ${adminPermissions.join(', ')}`);
        }
      }
    });

    console.log(`📊 Found ${adminTokens.length} admins with any of the specified permissions`);

    if (adminTokens.length === 0) {
      console.log(`⚠️ No admins found with any of the permissions: ${permissions.join(', ')}`);
      return;
    }

    // Send notification to each admin with the permissions
    const notificationPromises = adminTokens.map(token =>
      sendPushNotification(token, title, body, route, extraData)
    );

    await Promise.all(notificationPromises);
    console.log(`✅ Notifications sent to ${adminTokens.length} admins with specified permissions`);

  } catch (error) {
    console.error('❌ Error sending notifications to admins with permissions:', error);
  }
};

/**
 * Update admin expoPushToken when they log in
 * @param userId - Admin user ID
 * @param expoPushToken - Current expo push token
 */
export const updateAdminTokenOnLogin = async (userId: string, expoPushToken: string) => {
  try {
    // Check if user is an admin
    const adminUser = await getAdminUser(userId);
    if (adminUser && adminUser.isActive) {
      await updateAdminExpoPushToken(userId, expoPushToken);
      console.log('✅ Admin expoPushToken updated successfully');
    }
  } catch (error) {
    console.error('❌ Error updating admin expoPushToken:', error);
  }
};

/**
 * Update expoPushToken in ALL collections for a user
 * This ensures tokens are updated everywhere when they change
 * @param userId - User ID
 * @param expoPushToken - New expo push token
 */
export const updateUserTokenInAllCollections = async (userId: string, expoPushToken: string) => {
  try {
    console.log('🔄 Updating expoPushToken in all collections for user:', userId);

    const updatePromises = [];

    // 1. Update personalData collection (user profile)
    updatePromises.push(
      updateDocument('personalData', userId, { expoPushToken })
        .then(() => console.log('✅ Updated personalData collection'))
        .catch(err => console.error('❌ Error updating personalData:', err))
    );

    // 2. Update adminRoles collection (if user is admin)
    updatePromises.push(
      updateAdminTokenOnLogin(userId, expoPushToken)
        .then(() => console.log('✅ Updated adminRoles collection'))
        .catch(err => console.error('❌ Error updating adminRoles:', err))
    );

    // 3. Update all user's trucks
    updatePromises.push(
      updateUserTrucksToken(userId, expoPushToken)
        .then(() => console.log('✅ Updated user trucks'))
        .catch(err => console.error('❌ Error updating trucks:', err))
    );

    // 4. Update all user's loads
    updatePromises.push(
      updateUserLoadsToken(userId, expoPushToken)
        .then(() => console.log('✅ Updated user loads'))
        .catch(err => console.error('❌ Error updating loads:', err))
    );

    // Wait for all updates to complete
    await Promise.all(updatePromises);
    console.log('✅ All collections updated successfully');

  } catch (error) {
    console.error('❌ Error updating user token in all collections:', error);
  }
};

/**
 * Update expoPushToken for all trucks owned by a user
 * @param userId - User ID
 * @param expoPushToken - New expo push token
 */
const updateUserTrucksToken = async (userId: string, expoPushToken: string) => {
  try {
    const trucksQuery = query(
      collection(db, 'Trucks'),
      where('userId', '==', userId)
    );

    const trucksSnapshot = await getDocs(trucksQuery);
    const updatePromises = trucksSnapshot.docs.map(doc =>
      updateDoc(doc.ref, { expoPushToken })
    );

    await Promise.all(updatePromises);
    console.log(`✅ Updated ${trucksSnapshot.docs.length} trucks`);
  } catch (error) {
    console.error('❌ Error updating trucks token:', error);
  }
};

/**
 * Update expoPushToken for all loads owned by a user
 * @param userId - User ID
 * @param expoPushToken - New expo push token
 */
const updateUserLoadsToken = async (userId: string, expoPushToken: string) => {
  try {
    const loadsQuery = query(
      collection(db, 'Cargo'),
      where('userId', '==', userId)
    );

    const loadsSnapshot = await getDocs(loadsQuery);
    const updatePromises = loadsSnapshot.docs.map(doc =>
      updateDoc(doc.ref, { expoPushToken })
    );

    await Promise.all(updatePromises);
    console.log(`✅ Updated ${loadsSnapshot.docs.length} loads`);
  } catch (error) {
    console.error('❌ Error updating loads token:', error);
  }
};

/**
 * Update all collections with new token when it changes
 * This is called automatically when the expoPushToken changes
 * @param newToken - The new expo push token
 */
const updateAllCollectionsWithNewToken = async (newToken: string) => {
  try {
    // Get current user from AsyncStorage
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const storedUser = await AsyncStorage.getItem('user');

    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.uid) {
        console.log('🔄 Token changed, updating all collections for user:', user.uid);
        await updateUserTokenInAllCollections(user.uid, newToken);
      }
    }
  } catch (error) {
    console.error('❌ Error updating collections with new token:', error);
  }
};

// ========================================
// SPECIFIC ADMIN NOTIFICATION FUNCTIONS
// ========================================

/**
 * Notify admins who can approve trucks about new truck registration
 */
export const notifyTruckApprovalAdmins = async (truckData: any) => {
  await sendNotificationToAdminsWithPermission(
    'approve_trucks',
    'New Truck Registration 🚛',
    `New truck "${truckData.truckType} - ${truckData.truckCapacity}" registered by ${truckData.CompanyName}. Requires approval.`,
    {
      pathname: '/Account/Admin/ApproveTrucks',
      params: {
        highlightTruckId: truckData.id,
        source: 'notification'
      }
    },
    {
      type: 'truck_approval',
      truckId: truckData.id,
      truckOwner: truckData.CompanyName,
      priority: 'high'
    }
  );
};

/**
 * Notify admins who can approve loads about new load submission
 */
export const notifyLoadApprovalAdmins = async (loadData: any) => {
  await sendNotificationToAdminsWithPermission(
    'approve_loads',
    'New Load Submission 📦',
    `New load "${loadData.typeofLoad}" from ${loadData.origin} to ${loadData.destination} by ${loadData.companyName}. Requires approval.`,
    {
      pathname: '/Account/Admin/ApproveLoads',
      params: {
        highlightLoadId: loadData.id,
        source: 'notification'
      }
    },
    {
      type: 'load_approval',
      loadId: loadData.id,
      loadOwner: loadData.companyName,
      priority: 'high'
    }
  );
};

/**
 * Notify admins who can approve truck accounts about new account submission
 */
export const notifyTruckAccountApprovalAdmins = async (accountData: any) => {
  await sendNotificationToAdminsWithPermission(
    'approve_truck_accounts',
    'New Truck Account Submission 👤',
    `New truck account details submitted by ${accountData.CompanyName}. Requires approval.`,
    {
      pathname: '/Account/Admin/ApproveTruckAccounts',
      params: {
        highlightAccountId: accountData.id,
        source: 'notification'
      }
    },
    {
      type: 'truck_account_approval',
      accountId: accountData.id,
      accountOwner: accountData.CompanyName,
      priority: 'medium'
    }
  );
};

/**
 * Notify admins who can approve load accounts about new account submission
 */
export const notifyLoadAccountApprovalAdmins = async (accountData: any) => {
  await sendNotificationToAdminsWithPermission(
    'approve_loads_accounts',
    'New Load Account Submission 👤',
    `New load account details submitted by ${accountData.companyName}. Requires approval.`,
    {
      pathname: '/Account/Admin/ApproveLoadsAccounts',
      params: {
        highlightAccountId: accountData.id,
        source: 'notification'
      }
    },
    {
      type: 'load_account_approval',
      accountId: accountData.id,
      accountOwner: accountData.companyName,
      priority: 'medium'
    }
  );
};

/**
 * Notify admins who can manage referrers about new referrer code usage
 */
export const notifyReferrerManagementAdmins = async (referrerData: any) => {
  await sendNotificationToAdminsWithPermission(
    'manage_referrers',
    'New Referrer Code Usage 🎯',
    `Referrer code "${referrerData.referrerCode}" was used by a new user. Check referrer activity.`,
    '/Account/Admin/ManageReferrers',
    {
      type: 'referrer_activity',
      referrerCode: referrerData.referrerCode,
      newUser: referrerData.newUserEmail,
      priority: 'low'
    }
  );
};

/**
 * Notify admins who can manage versions about app update requests
 */
export const notifyVersionManagementAdmins = async (versionData: any) => {
  await sendNotificationToAdminsWithPermission(
    'version_management',
    'App Version Update Request 📱',
    `New app version ${versionData.version} submitted for review. Requires admin approval.`,
    '/Account/Admin/VersionManagement',
    {
      type: 'version_update',
      version: versionData.version,
      submittedBy: versionData.submittedBy,
      priority: 'high'
    }
  );
};

/**
 * Notify admins who can add tracking agents about tracking requests
 */
export const notifyTrackingAgentAdmins = async (trackingData: any) => {
  await sendNotificationToAdminsWithPermission(
    'add_tracking_agent',
    'New Tracking Agent Request 📍',
    `User ${trackingData.userName} requests to become a tracking agent. Requires admin approval.`,
    '/Account/Admin/ManageTrackingAgents',
    {
      type: 'tracking_agent_request',
      userId: trackingData.userId,
      userName: trackingData.userName,
      priority: 'medium'
    }
  );
};

/**
 * Notify admins who can add service station owners about new requests
 */
export const notifyServiceStationAdmins = async (stationData: any) => {
  await sendNotificationToAdminsWithPermission(
    'add_service_station_owner',
    'New Service Station Request ⛽',
    `User ${stationData.userName} requests to become a service station owner. Requires admin approval.`,
    '/Account/Admin/ManageServiceStations',
    {
      type: 'service_station_request',
      userId: stationData.userId,
      userName: stationData.userName,
      priority: 'medium'
    }
  );
};

/**
 * Notify admins who can add truck stop owners about new requests
 */
export const notifyTruckStopAdmins = async (stopData: any) => {
  await sendNotificationToAdminsWithPermission(
    'add_truck_stop_owner',
    'New Truck Stop Request 🛑',
    `User ${stopData.userName} requests to become a truck stop owner. Requires admin approval.`,
    '/Account/Admin/ManageTruckStops',
    {
      type: 'truck_stop_request',
      userId: stopData.userId,
      userName: stopData.userName,
      priority: 'medium'
    }
  );
};

