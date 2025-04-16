import React, { useCallback, useRef } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { StyleSheet, TouchableNativeFeedback, View } from "react-native";
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
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";

const Tab = createBottomTabNavigator();




export default function Index() {
  const accent = useThemeColor("accent");
  const icon = useThemeColor("icon");
  const background = useThemeColor("background");
  const backgroundColor = useThemeColor("background");


  const bottomSheetRef = useRef<BottomSheet>(null);

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);
  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} opacity={0.2} appearsOnIndex={0} disappearsOnIndex={-1} />,
    []
  );

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
            <TouchableNativeFeedback onPress={() => bottomSheetRef.current?.expand()}>
              <View style={{ padding: wp(2) }}>
                <Ionicons name='reorder-three' size={wp(6)} />
              </View>
            </TouchableNativeFeedback>
          </View>
        </View>
      </View>

    );
  }

  return (
    <ScreenWrapper>

      <View style={{ flex: 1, backgroundColor: background }}>
        <CustomHeader />

        <BottomSheet
          handleIndicatorStyle={{ backgroundColor: icon }}
          index={-1}
          ref={bottomSheetRef}
          onChange={handleSheetChanges}
          enablePanDownToClose
          backgroundStyle={{ backgroundColor: background }}
          backdropComponent={renderBackdrop}

          style={{ elevation: wp(10) }}
          handleStyle={{ borderColor: background, borderBottomWidth: 0, borderWidth: 1, borderTopEndRadius: wp(4), borderTopStartRadius: wp(4) }}

        >
          <BottomSheetView style={styles.contentContainer}>

            <View >

              <View style={[styles.settingsCont, { backgroundColor }]}>
                <TouchableNativeFeedback onPress={() => { }} >
                  <View style={[styles.settingsItem, { borderBottomWidth: 0 }]}>
                    <View style={{ flexDirection: 'row', gap: wp(2), alignItems: 'center' }}>
                      <Ionicons name="settings-outline" size={wp(6)} style={{ width: wp(8), textAlign: 'center' }} color={icon} />
                      <View style={{}}>
                        <ThemedText type='defaultSemiBold'>
                          Profile
                        </ThemedText>
                        <ThemedText type='tiny'>

                        </ThemedText>
                      </View>
                    </View>
                    <Ionicons name='chevron-forward' color={icon} size={wp(4)} />
                  </View>

                </TouchableNativeFeedback>
              </View>

              <View style={[styles.settingsCont, { backgroundColor }]}>
                <TouchableNativeFeedback onPress={() => { }}>
                  <View style={[styles.settingsItem, { borderBottomWidth: 0 }]}>
                    <View style={{ flexDirection: 'row', gap: wp(2), alignItems: 'center' }}>
                      <Ionicons name="heart" size={wp(6)} style={{ width: wp(8), textAlign: 'center' }} color={icon} />
                      <View style={{}}>
                        <ThemedText type='defaultSemiBold'>
                          Saved Items
                        </ThemedText>

                      </View>
                    </View>
                    <Ionicons name='chevron-forward' color={icon} size={wp(4)} />
                  </View>

                </TouchableNativeFeedback>
              </View>
            </View>


          </BottomSheetView>
        </BottomSheet>

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
          <Tab.Screen name="Home" component={Home} />
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