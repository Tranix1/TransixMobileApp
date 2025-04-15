import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { TouchableNativeFeedback, View } from "react-native";
import Home from "./Home/Index";
import Loads from "./Logistics/Loads/Index";
import Store from "./Transport/Store/Index";
import Trucks from "./Logistics/Trucks/Index";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { FontAwesome6, Fontisto, Octicons, Entypo, EvilIcons, Ionicons } from "@expo/vector-icons";
import { hp, wp } from "@/constants/common";
import { router } from "expo-router";
import ScreenWrapper from "@/components/ScreenWrapper";

const Tab = createBottomTabNavigator();

function CustomHeader() {
  const background = useThemeColor("background");
  return (
    <View
      style={{
        backgroundColor: background,
        paddingHorizontal: wp(2),
        paddingVertical: wp(1),
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: wp(1),
      }}
    >
      <View>
        <ThemedText type="title">Transix</ThemedText>
        <ThemedText type="tiny">The future of Transport & Logistics</ThemedText>
      </View>
      <View style={{ flexDirection: 'row', gap: wp(2) }}>
        <View style={{ overflow: 'hidden', borderRadius: wp(10) }}>
          <TouchableNativeFeedback onPress={() => router.push('/App')}>
            <View style={{ padding: wp(2), flex: 1, justifyContent: 'center' }}>
              <Entypo name='archive' size={wp(6)} />
            </View>
          </TouchableNativeFeedback>
        </View>
        <View style={{ overflow: 'hidden', borderRadius: wp(10) }}>
          <TouchableNativeFeedback>
            <View style={{ padding: wp(2), flex: 1, justifyContent: 'center' }}>
              <EvilIcons name='search' size={wp(6)} />
            </View>
          </TouchableNativeFeedback>
        </View>
        <View style={{ overflow: 'hidden', borderRadius: wp(10) }}>
          <TouchableNativeFeedback>
            <View style={{ padding: wp(2) }}>
              <Ionicons name='reorder-three' size={wp(6)} />
            </View>
          </TouchableNativeFeedback>
        </View>
      </View>
    </View>

  );
}

export default function Index() {
  const accent = useThemeColor("accent");
  const icon = useThemeColor("icon");
  const background = useThemeColor("background");

  return (
    <ScreenWrapper>

      <View style={{ flex: 1, backgroundColor: background }}>
        <CustomHeader />
        
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused }) => {
              const color = focused ? accent : icon;
              const size = wp(5);
              const style = { marginVertical: wp(2) };
              switch (route.name) {
                case "Home":
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
            },
            sceneStyle: {
              backgroundColor: useThemeColor("background"),
              paddingBottom: 0,
              marginBottom: 0
            }, tabBarItemStyle: {
              flex: 1,
              borderTopWidth: 0,
            }
          })}
        >
          <Tab.Screen name="Home" component={Home} />
          <Tab.Screen name="Loads" component={Loads} />
          <Tab.Screen name="Trucks" component={Trucks} />
          <Tab.Screen name="Store" component={Store} />
        </Tab.Navigator>
      </View>
    </ScreenWrapper>

  );
}
