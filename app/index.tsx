import { useCallback, useRef, useState, useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { StyleSheet, TouchableNativeFeedback, View, LogBox } from "react-native";
import Home from "./Home/Index";
import Loads from "./Logistics/Loads/Index";
import Store from "./Transport/Store/Index";
import Trucks from "./Logistics/Trucks/Index";
import Account from "./Account/SignUp";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { FontAwesome6, Fontisto, Octicons, Entypo, } from "@expo/vector-icons";
import { hp, wp } from "@/constants/common";
import { router } from "expo-router";
import ScreenWrapper from "@/components/ScreenWrapper";
import AppLoadingScreen from "@/components/AppLoadingScreen";
import UpdateModal from "@/components/UpdateModal";
import { useAuthState } from "@/hooks/useAuthState";
import { useAppUpdate } from "@/hooks/useAppUpdate";
import { usePushNotifications } from "@/Utilities/pushNotification";
import NetInfo from '@react-native-community/netinfo';

const Tab = createBottomTabNavigator();

export default function Index() {
  const accent = useThemeColor("accent");
  const icon = useThemeColor("icon");
  const background = useThemeColor("background");
  const backgroundColor = useThemeColor("background");

  const [isAppReady, setIsAppReady] = useState(false);
  const [isConnectedInternet, setIsConnectedInternet] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [versionCheckComplete, setVersionCheckComplete] = useState(false);
  const versionCheckRun = useRef(false);

  const {
    isLoading: authLoading,
    isAuthenticated,
    user,
    needsProfileSetup,
    needsEmailVerification,
    error: authError,
  } = useAuthState();

  const {
    showUpdateModal,
    currentVersion,
    latestVersion,
    isForceUpdate,
    checkForUpdate,
    dismissUpdate,
    isLoading: updateLoading
  } = useAppUpdate();

  // Initialize push notifications
  const { expoPushToken, notification, schedulePushNotification } = usePushNotifications();

  // Debug notification setup
  useEffect(() => {
    if (expoPushToken) {
      console.log('🔔 Push token received:', expoPushToken);
    }
    if (notification) {
      console.log('🔔 Notification received in app:', notification);
    }
  }, [expoPushToken, notification]);

  // Check internet connection
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnectedInternet(state.isConnected as any);
    });
    return () => unsubscribe();
  }, []);

  // Simulate loading progress
  useEffect(() => {
    if (authLoading) {
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 200);

      return () => clearInterval(progressInterval);
    } else {
      setLoadingProgress(100);
    }
  }, [authLoading]);

  // Determine if app is ready to show main content
  useEffect(() => {
    console.log('Auth loading:', authLoading, 'App ready:', isAppReady, 'Version check complete:', versionCheckComplete);
    if (!authLoading) {
      // Add a small delay to ensure smooth transition
      const timer = setTimeout(() => {
        console.log('Setting app ready to true');
        setIsAppReady(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [authLoading]);

  // Check for updates after app is ready - wait for completion before showing main content
  useEffect(() => {
    if (isAppReady && isConnectedInternet && !versionCheckRun.current) {
      versionCheckRun.current = true;
      console.log('Running version check...');

      // Add timeout to prevent hanging
      const versionTimeout = setTimeout(() => {
        console.log('Version check timeout - allowing app to continue');
        setVersionCheckComplete(true);
      }, 5000); // 5 second timeout

      // Run version check and wait for completion
      checkForUpdate().then(() => {
        clearTimeout(versionTimeout);
        console.log('Version check completed, showUpdateModal:', showUpdateModal);
        setVersionCheckComplete(true);
      }).catch(error => {
        clearTimeout(versionTimeout);
        console.log('Version check failed:', error);
        setVersionCheckComplete(true); // Still allow app to show even if version check fails
      });
    }
  }, [isAppReady, isConnectedInternet]);

  // Show loading screen while app is initializing or version check is running
  if (!isAppReady || authLoading || !versionCheckComplete) {
    return (
      <ScreenWrapper>
        <View style={{ flex: 1, backgroundColor: background }}>
          <AppLoadingScreen
            message="Initializing Transix..."
            showProgress={true}
            progress={loadingProgress}
          />
        </View>
      </ScreenWrapper>
    );
  }

  // Show error state if there's an authentication error
  if (authError) {
    return (
      <ScreenWrapper>
        <View style={{ flex: 1, backgroundColor: background }}>
          <AppLoadingScreen
            message="Something went wrong. Please try again."
          />
        </View>
      </ScreenWrapper>
    );
  }

  // Debug log for update modal state
  console.log('Update modal state - showUpdateModal:', showUpdateModal, 'currentVersion:', currentVersion, 'latestVersion:', latestVersion);

  return (
    <ScreenWrapper>

      <View style={{ flex: 1, backgroundColor: background }}>

        {/* <CustomHeader /> */}
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused }) => {
              const color = focused ? accent : icon;
              const size = wp(5);
              const style = { marginVertical: wp(2) };
              switch (route.name) {
                case "Home ":
                  return <Octicons name="home" size={size} color={color} />;
                case "Loads":
                  return <FontAwesome6 name="trailer" size={size} color={color} />;
                case "Trucks":
                  return <Fontisto name="truck" size={size} color={color} />;
                case "Store":
                  return <Entypo name="shop" size={size} color={color} />;

                default:
                  return null;
              }
            },
            tabBarLabel: ({ focused }) => (
              <ThemedText
                type={focused ? "defaultSemiBold" : "default"}
                color={focused ? accent : icon}
              >
                {route.name}
              </ThemedText>
            ),
            tabBarHideOnKeyboard: true,
            headerShown: false,
            animation: 'shift',
            tabBarStyle: {
              backgroundColor: useThemeColor("background"),
              borderTopWidth: 0,
              height: hp(8),
              justifyContent: 'center'
            },
            sceneStyle: {
              backgroundColor: useThemeColor("background"),
              paddingBottom: 0,
              marginBottom: 0
            }, tabBarItemStyle: {
              flex: 1,
              borderTopWidth: 0,
              padding: wp(2)
            }
          })}
        >
          <Tab.Screen name="Home " component={Home} />
          <Tab.Screen name="Loads" component={Loads} />
          <Tab.Screen name="Trucks" component={Trucks} />
          <Tab.Screen name="Store" component={Store} />
        </Tab.Navigator>

        {/* Update Modal */}
        <UpdateModal
          visible={showUpdateModal}
          onClose={dismissUpdate}
          currentVersion={currentVersion}
          latestVersion={latestVersion}
          updateUrl="https://play.google.com/store/apps/details?id=com.yayapana.TransixNewVersion"
          isForceUpdate={isForceUpdate}
        />
      </View>
    </ScreenWrapper>

  );
}


const styles = StyleSheet.create({
  optionsContainerStyle: {
    borderRadius: wp(3)
  }, MenuOption: {
    borderRadius: wp(2),
    padding: wp(1.3),
    flexDirection: 'row',
    gap: wp(1),
    alignItems: 'center',
    marginVertical: wp(1),
    marginHorizontal: wp(2)
  }, contentContainer: {
    paddingHorizontal: wp(4),
    paddingBottom: wp(5)
  }, settingsCont: {
    borderWidth: wp(.2),
    // padding: wp(2),
    overflow: 'hidden',
    marginTop: wp(1.5),
    marginBottom: wp(1),
    borderRadius: wp(4),
    borderColor: '#6565651c',
    gap: wp(2)
  }, settingsItem: {
    flexDirection: 'row',
    padding: wp(3),
    paddingVertical: wp(4.5),
    justifyContent: 'space-between',
    alignItems: 'center'
  }
})