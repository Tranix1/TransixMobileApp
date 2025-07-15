import  { useCallback, useRef } from "react";
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
import { FontAwesome6, Fontisto, Octicons, Entypo,  } from "@expo/vector-icons";
import { hp, wp } from "@/constants/common";
import { router } from "expo-router";
import ScreenWrapper from "@/components/ScreenWrapper";

const Tab = createBottomTabNavigator();

export default function Index() {
  const accent = useThemeColor("accent");
  const icon = useThemeColor("icon");
  const background = useThemeColor("background");
  const backgroundColor = useThemeColor("background");

 
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