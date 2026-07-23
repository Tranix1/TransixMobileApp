import { useRef, useState, useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from "expo-router";

import Dashboard from "./Fleet/Dashboard/Index";

import Home from "./Home/Index";
import About from "./About/Index";
import Loads from "./Logistics/Loads/Index";
import Store from "./Transport/Store/Index";
import LogisticsTrucks from "./Logistics/Trucks/Index";
import Wallet from "./Wallet/Index";
// import Jobs from "./Fleet/DriverScreens/Jobs/Index";
import Jobs from "./Assignments/Index"
import Trucks from "./Fleet/DriverScreens/Trucks/Index";
import Earnings from "./Fleet/DriverScreens/Earnings/Index";
import DriverProfile from "./Fleet/DriverScreens/Profile/Index";
import ChatIndex from "./Chats/Index";

import { ThemedText } from "@/components/ThemedText";
import ScreenWrapper from "@/components/ScreenWrapper";
import AppLoadingScreen from "@/components/AppLoadingScreen";
import UpdateModal from "@/components/UpdateModal";
import AuthStatusModal from "@/components/AuthStatusModal";

import { useThemeColor } from "@/hooks/useThemeColor";
import { useAuthState } from "@/hooks/useAuthState";
import { useAppUpdate } from "@/hooks/useAppUpdate";
import { useAuth } from '@/context/AuthContext';
import SignUp from "./Account/SignUp"

import {
  FontAwesome6,
  Fontisto,
  Octicons,
  Entypo,
} from "@expo/vector-icons";

import { hp, wp } from "@/constants/common";
import NetInfo from '@react-native-community/netinfo';
import FleetSelector from "./Fleet/FleetSelector/Index";
import DriverSelector from "./Driver/DriverSelector/Index"
import BrokerageSelector from "./brokerage/BrokerageSelector/Index";

import Login from "./Account/Login";
import Tracking from "./Tracking/Map";
import TrackingIndex from "./Tracking/Index"
import CreateFleet from "./Fleet/CreateFleet";
import CreateDriverAcc from "./Driver/Add/Index"
import CreateBrokerageAcc from "./brokerage/CreateBrokerage/Index"

const Tab = createBottomTabNavigator();

export default function Index() {
  const accent = useThemeColor("accent");
  const icon = useThemeColor("icon");
  const background = useThemeColor("background");
  const { bottom } = useSafeAreaInsets();

  const [isConnectedInternet, setIsConnectedInternet] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const [dspCreateAcc, setDspCreateAcc] = useState(false);
  const versionCheckRun = useRef(false);

  const [dspLoginOrSignup, setDspLoginOrSignup] = useState(true);
  const [isSigningUp, setIsSigningUp] = useState(false);

  const {
    isLoading: authLoading,
    isAuthenticated,
    user,
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
  } = useAppUpdate();

  const { currentRole } = useAuth();

  // Check if profile details are missing

  const isAuthReady = !authLoading && user !== undefined;

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnectedInternet(!!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (authLoading) {
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => (prev >= 90 ? prev : prev + Math.random() * 10));
      }, 200);
      return () => clearInterval(progressInterval);
    } else {
      setLoadingProgress(100);
    }
  }, [authLoading]);

  useEffect(() => {
    if (!isAuthReady) {
      return;
    }

    const timer = setTimeout(() => {
      setDspCreateAcc(false);

      if (!isConnectedInternet) {
        return;
      }

      if (!isAuthenticated) {
        setDspCreateAcc(true);
        return;
      }

    }, 300);

    return () => clearTimeout(timer);
  }, [isAuthReady, isConnectedInternet, isAuthenticated, needsEmailVerification,]);

  useEffect(() => {
    if (!isAuthReady || !isConnectedInternet || versionCheckRun.current) {
      return;
    }

    versionCheckRun.current = true;
    const versionTimeout = setTimeout(() => { }, 5000);
    checkForUpdate()
      .then(() => {
        clearTimeout(versionTimeout);
      })
      .catch(() => {
        clearTimeout(versionTimeout);
      });
  }, [isAuthReady, isConnectedInternet]);



  if (!isAuthReady) {
    return (
      <ScreenWrapper>
        <View style={{ flex: 1, backgroundColor: background }}>
          <AppLoadingScreen message="Initializing Transix..." showProgress={true} progress={loadingProgress} />
        </View>
      </ScreenWrapper>
    );
  }

  if (isSigningUp) {
    return (
      <ScreenWrapper>
        <View style={{ flex: 1, backgroundColor: background }}>
          <AppLoadingScreen
            message="Creating your Transix account..."
          />
        </View>
      </ScreenWrapper>
    );
  }

  if (authError) {
    return (
      <ScreenWrapper>
        <View style={{ flex: 1, backgroundColor: background }}>
          <AppLoadingScreen message="Something went wrong. Please try again." />
        </View>
      </ScreenWrapper>
    );
  }




  return (
    <ScreenWrapper>
      <View style={{ flex: 1, backgroundColor: background }}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused }) => {
              const color = focused ? accent : icon;
              const size = wp(5);
              switch (route.name) {
                case "Home ": return <Octicons name="home" size={size} color={color} />;
                case "About ": return <Octicons name="info" size={size} color={color} />;
                case "Loads": return <FontAwesome6 name="trailer" size={size} color={color} />;
                case "Trucks": return <Fontisto name="truck" size={size} color={color} />;
                case "Store": return <Entypo name="shop" size={size} color={color} />;
                case "Wallet": return <FontAwesome6 name="wallet" size={size} color={color} />;

                case "Jobs": return <FontAwesome6 name="briefcase" size={size} color={color} />;
                case "Earnings": return <FontAwesome6 name="dollar-sign" size={size} color={color} />;
                case "Chat": return <FontAwesome6 name="comments" size={size} color={color} />;
                default: return null;
              }
            },
            tabBarLabel: ({ focused }) => (
              <ThemedText type={focused ? "defaultSemiBold" : "default"} color={focused ? accent : icon}>
                {route.name}
              </ThemedText>
            ),
            tabBarHideOnKeyboard: true,
            headerShown: false,
            tabBarStyle: {
              backgroundColor: background,
              borderTopWidth: 0,
              height: hp(8) + bottom,
              paddingBottom: bottom,
              elevation: 10,
            },
          })}
        >
          {dspCreateAcc ? (
            <>
              {/* <Tab.Screen name="Home " component={dspLoginOSignup ? Login : SignUp} /> */}

              <Tab.Screen name="Home ">
                {(props) =>
                  dspLoginOrSignup ? (
                    <Login
                      {...props}
                      setDspLoginOrSignup={setDspLoginOrSignup}
                    />
                  ) : (
                    <SignUp
                      {...props}
                      setDspLoginOrSignup={setDspLoginOrSignup}
                      setIsSigningUp={setIsSigningUp}
                    />
                  )
                }
              </Tab.Screen>


              <Tab.Screen name="About " component={About} />
            </>
          ) :

            (typeof currentRole === 'object' && currentRole.accType === 'tracking') ? (
              <>
                <Tab.Screen name="Home " component={TrackingIndex} />
                <Tab.Screen name="About " component={About} />
              </>
            ) : (typeof currentRole === 'object' && currentRole.accType === 'fleet' && currentRole.userRole === 'owner') ? (
              <>
                <Tab.Screen name="Home " component={Dashboard} />
                <Tab.Screen name="Loads" component={Loads} />
                <Tab.Screen name="Chat" component={ChatIndex} />
                <Tab.Screen name="Trucks" component={LogisticsTrucks} />
              </>
            ) :
            
              (typeof currentRole === 'object' && currentRole.accType === 'fleet' &&currentRole.userRole === "create_Acc" ) ?
                (<>
                  <Tab.Screen name="Home " component={CreateFleet} />
                  <Tab.Screen name="About " component={About} />
                </>):
              (typeof currentRole === 'object' && currentRole.accType === 'fleet' ) ?
                (<>
                  <Tab.Screen name="Home " component={FleetSelector} />
                  <Tab.Screen name="About " component={About} />
                </>)

                : (typeof currentRole === 'object' && currentRole.accType === 'driver' && currentRole.userRole === 'driver') ? (
                  <>
                    <Tab.Screen name="Jobs" component={Jobs} />
                    <Tab.Screen name="Trucks" component={Trucks} />
                    <Tab.Screen name="Chat" component={ChatIndex} />
                    <Tab.Screen name="Earnings" component={Earnings} />
                  </>
                ) : (typeof currentRole === 'object' && currentRole.role === 'driver'&&currentRole.userRole === "create_Acc") ?
                  (<>
                    <Tab.Screen name="Home " component={CreateDriverAcc} />
                    <Tab.Screen name="About " component={About} />
                  </>):
                
                (typeof currentRole === 'object' && currentRole.role === 'driver') ?
                  (<>
                    <Tab.Screen name="Home " component={DriverSelector} />
                    <Tab.Screen name="About " component={About} />
                  </>)

                  : (typeof currentRole === 'object' && currentRole.accType === 'brokerage' && currentRole.userRole === 'owner') ? (
                    <>
                      <Tab.Screen name="Loads" component={Loads} />
                      <Tab.Screen name="Trucks" component={LogisticsTrucks} />
                      <Tab.Screen name="Chat" component={ChatIndex} />
                      <Tab.Screen name="Wallet" component={Wallet} />
                    </>
                  ) 
                   : (typeof currentRole === 'object' && currentRole.accType === 'brokerage'&&currentRole.userRole === "create_Acc") ?
                    (<>
                      <Tab.Screen name="Home " component={CreateBrokerageAcc} />
                      <Tab.Screen name="About " component={About} />
                    </>):
                  (typeof currentRole === 'object' && currentRole.accType === 'brokerage') ?
                    (<>
                      <Tab.Screen name="Home " component={BrokerageSelector} />
                      <Tab.Screen name="About " component={About} />
                    </>)

                    : (
                      <>
                        {/* <Tab.Screen name="Home " component={Login} /> */}
                        <Tab.Screen name="About " component={About} />
                      </>
                    )}
        </Tab.Navigator>

        <UpdateModal visible={showUpdateModal} onClose={dismissUpdate} currentVersion={currentVersion} latestVersion={latestVersion} updateUrl="https://play.google.com/store/apps/details?id=com.yayapana.TransixNewVersion" isForceUpdate={isForceUpdate} />



      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingHorizontal: wp(10),
    paddingVertical: hp(1.5),
    borderRadius: wp(2),
    marginTop: 10
  }
});