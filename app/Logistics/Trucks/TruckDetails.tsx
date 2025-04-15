import { View, Text, Image, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Modal, TouchableNativeFeedback, SafeAreaView, Switch, Linking, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import ScreenWrapper from "@/components/ScreenWrapper";
import { ThemedText } from "@/components/ThemedText";
import Heading from "@/components/Heading";
import { useThemeColor } from "@/hooks/useThemeColor";
import { AntDesign, FontAwesome6, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { hp, wp } from "@/constants/common";
import { ReactElement, useCallback, useEffect, useRef, useState } from "react";
import { FlatList, GestureHandlerRootView } from "react-native-gesture-handler";
import { useAnimatedScrollHandler } from "react-native-reanimated";
import Button from "@/components/Button";
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import AsyncStorage from '@react-native-async-storage/async-storage';
import AlertComponent, { Alertbutton } from "@/components/AlertComponent";
import { BlurView } from 'expo-blur';
import FormatedText from "@/components/FormatedText";
import Divider from "@/components/Divider";
import { Truck, User } from "@/types/types";
import { readById } from "@/db/operations";

const TruckDetails = () => {

    const icon = useThemeColor("icon");
    const accent = useThemeColor("accent");
    const accentlight = useThemeColor("accentlight");
    const background = useThemeColor("background");
    const coolGray = useThemeColor("coolGray");
    const backgroundLight = useThemeColor("backgroundLight");
    const { product } = useLocalSearchParams();

    const truckData = JSON.parse(product as string) as Truck; // Convert string back to object
    const [items, setItems] = useState<Truck[] | []>([]);
    const [selectedImage, setSelectedImage] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false)
    const [applyDeliveryFee, setApplyDeliveryFee] = useState(false)
    const [totalPrce, setTotalPrice] = useState(0);
    const [cartCount, setCartCount] = useState(0);
    const [isSaved, setIsSaved] = useState(false);


    const getData = async () => {
        try {
            setRefreshing(true)

        } catch (error) {

        } finally {
            setRefreshing(false)
        }

    };

    const bottomSheetRef = useRef<BottomSheet>(null);

    // callbacks
    const handleSheetChanges = useCallback((index: number) => {
        console.log('handleSheetChanges', index);
    }, []);
    const renderBackdrop = useCallback(
        (props: any) => <BottomSheetBackdrop {...props} opacity={0.4} appearsOnIndex={0} disappearsOnIndex={-1} />,
        []
    );

    const [postOwner, setPostUser] = useState<User>();

    useEffect(() => {
        getowenerdata();
    }, [truckData])

    const getowenerdata = async () => {
        if (truckData.userId) {

            const owner = await readById('users', truckData.userId)
            if (owner) {
                const user: User = {
                    ...owner,
                    uid: owner.id, // Map `id` to `uid` or adjust as needed
                };
                setPostUser(user);
            }
        }
    }

    // Function to toggle save state
    const toggleSaveProduct = async () => {
        try {
            const savedProducts = await AsyncStorage.getItem('savedProducts');
            const savedProductsArray = savedProducts ? JSON.parse(savedProducts) : [];

            if (isSaved) {
                // Remove product from saved list
                const updatedProducts = savedProductsArray.filter((item: Truck) => item.id !== truckData.id);
                await AsyncStorage.setItem('savedProducts', JSON.stringify(updatedProducts));
                setIsSaved(false);
            } else {
                // Add product to saved list
                const updatedProducts = [...savedProductsArray, truckData];
                await AsyncStorage.setItem('savedProducts', JSON.stringify(updatedProducts));
                setIsSaved(true);
            }
        } catch (error) {
            console.error('Error saving product:', error);
        }
    };

    const [showAlert, setshowAlert] = useState<ReactElement | null>(null);
    function alertBox(title: string, message: string, buttons?: Alertbutton[], type?: "default" | "error" | "success" | "laoding" | "destructive" | undefined) {
        setshowAlert(
            <AlertComponent
                visible
                title={title}
                message={message}
                buttons={buttons}
                type={type}
                onBackPress={() => setshowAlert(null)}
            />
        )

    }

    return (
        <ScreenWrapper>
            {showAlert}
            <Heading page={truckData.CompanyName || "Product Details"}
                rightComponent={
                    <View style={{ flexDirection: 'row', gap: wp(2), marginRight: wp(2) }}>

                        <View style={{ overflow: 'hidden', borderRadius: wp(2.4) }}>
                            <TouchableNativeFeedback onPress={() => { }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: wp(2), padding: wp(1.5) }}>
                                    <Ionicons name='reorder-three-outline' size={wp(6)} color={icon} />
                                </View>
                            </TouchableNativeFeedback>
                        </View>
                    </View>} />
            <ScrollView contentContainerStyle={{ paddingBottom: hp(6), marginHorizontal: wp(2) }}>
                <View style={{ marginHorizontal: wp(2) }}>
                    <View style={{ alignItems: 'center', borderRadius: 2, flex: 1, marginBottom: wp(2) }}>
                        {/* <Image source={{ uri: truckData.images[0] }} /> */}


                        <Image
                            source={{ uri: truckData.imageUrl }}
                            style={{

                                width: wp(96),
                                height: wp(95),
                                borderRadius: wp(4),
                                marginVertical: wp(2),
                                //opacity: index === currentIndex ? 1 : 0.5
                            }}
                        />



                    </View>
                </View>

                <View style={{ padding: wp(4), borderRadius: wp(4) }}>
                    <View style={{ flexDirection: 'row', gap: wp(6), justifyContent: 'center' }}>
                        {postOwner?.phoneNumber &&
                            <View style={{ alignItems: 'center', gap: wp(1) }}>
                                <View style={{ overflow: 'hidden', borderRadius: wp(10) }}>
                                    <TouchableNativeFeedback onPress={() => postOwner?.phoneNumber && Linking.openURL(`tel:${postOwner.phoneNumber}`)}>
                                        <View style={{ width: wp(10), height: wp(10), backgroundColor: backgroundLight, justifyContent: 'center', alignItems: 'center', borderRadius: wp(10) }}>
                                            <Ionicons name='call-outline' size={wp(5)} color={icon} />
                                        </View>
                                    </TouchableNativeFeedback>
                                </View>
                                <ThemedText type="tiny" style={{ width: '100%', textAlign: 'center', fontFamily: 'SemiBold' }}>
                                    Call
                                </ThemedText>
                            </View>
                        }
                        {postOwner?.phoneNumber &&
                            <View style={{ alignItems: 'center', gap: wp(1) }}>
                                <View style={{ overflow: 'hidden', borderRadius: wp(10) }}>
                                    <TouchableNativeFeedback
                                        onPress={() => {
                                            const message = `Hello ${postOwner?.displayName},\n\nI am interested in your product "${truckData.CompanyName}".\n`;
                                            postOwner?.phoneNumber && Linking.openURL(`sms:${postOwner?.phoneNumber}?body=${encodeURIComponent(message)}`);
                                        }}
                                    >
                                        <View style={{ width: wp(10), height: wp(10), backgroundColor: backgroundLight, justifyContent: 'center', alignItems: 'center', borderRadius: wp(10) }}>
                                            <Ionicons name='chatbox-outline' size={wp(5)} color={icon} />
                                        </View>
                                    </TouchableNativeFeedback>
                                </View>
                                <ThemedText type="tiny" style={{ width: '100%', textAlign: 'center', fontFamily: 'SemiBold' }}>
                                    SMS
                                </ThemedText>
                            </View>
                        }
                        {postOwner?.phoneNumber &&
                            <View style={{ alignItems: 'center', gap: wp(1) }}>
                                <View style={{ overflow: 'hidden', borderRadius: wp(10) }}>
                                    <TouchableNativeFeedback
                                        onPress={() => {
                                            const message = `Hello ${postOwner?.displayName},\n\nI am interested in your product "${truckData.CompanyName}".\n`;
                                            postOwner?.phoneNumber && Linking.openURL(`https://wa.me/${postOwner?.phoneNumber}?text=${encodeURIComponent(message)}`);
                                        }}
                                    >
                                        <View style={{ width: wp(10), height: wp(10), backgroundColor: backgroundLight, justifyContent: 'center', alignItems: 'center', borderRadius: wp(10) }}>
                                            <Ionicons name='logo-whatsapp' size={wp(5)} color={icon} />
                                        </View>
                                    </TouchableNativeFeedback>
                                </View>
                                <ThemedText type="tiny" style={{ width: '100%', textAlign: 'center', fontFamily: 'SemiBold' }}>
                                    Whatsapp
                                </ThemedText>
                            </View>
                        }

                        <View style={{ alignItems: 'center', gap: wp(1) }}>
                            <View style={{ overflow: 'hidden', borderRadius: wp(10) }}>
                                <TouchableNativeFeedback onPress={toggleSaveProduct}>
                                    <View
                                        style={{
                                            width: wp(10),
                                            height: wp(10),
                                            backgroundColor: backgroundLight,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            borderRadius: wp(10),
                                        }}
                                    >
                                        <Ionicons
                                            name={isSaved ? 'heart' : 'heart-outline'}
                                            size={wp(5)}
                                            color={isSaved ? '#FFAB91' : icon}
                                        />
                                    </View>
                                </TouchableNativeFeedback>
                            </View>
                            <ThemedText type="tiny" style={{ width: '100%', textAlign: 'center', fontFamily: 'SemiBold' }}>
                                {isSaved ? 'Saved' : 'Save'}
                            </ThemedText>
                        </View>
                    </View>
                </View>

                <View style={{ gap: wp(2), marginBottom: wp(2), padding: wp(2), backgroundColor: backgroundLight, borderRadius: wp(4), paddingBottom: wp(4) }}>
                    <View style={{}}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', }}>
                            <ThemedText type="title" style={{ fontSize: 25, maxWidth: wp(80) }}>
                                {truckData.CompanyName}
                            </ThemedText>
                        </View>
                        <ThemedText type="tiny" style={{ color: icon }}>{truckData.fromLocation}</ThemedText>


                    </View>
                    <Divider />
                    <View style={{}}>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ flex: 1 }}>
                                <ThemedText type="tiny" style={{}}>
                                    Location
                                </ThemedText>
                                <ThemedText style={{ marginBottom: wp(4) }}>
                                    {truckData.toLocation || '--'}
                                </ThemedText>
                            </View>
                            {truckData.toLocation &&
                                <MaterialCommunityIcons name="google-maps" size={wp(6)} color={icon} />
                            }
                        </View>
                        {truckData.toLocation &&
                            <Button
                                onPress={() => {
                                    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(truckData.toLocation)}`;
                                    Linking.openURL(url);
                                }}

                                title="Open in Google Maps"
                            />

                        }

                    </View>
                    <Divider />

                    {truckData.additionalInfo &&
                        <Divider />
                    }
                    {truckData.additionalInfo &&
                        <View style={{}}>
                            <ThemedText type="tiny" style={{}}>
                                Description:
                            </ThemedText>
                            <FormatedText numberOfLines={3} style={{ paddingTop: 0, }}>
                                {truckData.additionalInfo}
                            </FormatedText>
                            {truckData.additionalInfo.length > 100 && (
                                <TouchableOpacity onPress={() => alertBox("Description", truckData.additionalInfo)}>
                                    <ThemedText type="tiny" style={{ color: accent, marginTop: wp(1) }}>
                                        Read More
                                    </ThemedText>
                                </TouchableOpacity>
                            )}
                        </View>
                    }







                </View>


            </ScrollView>




        </ScreenWrapper >
    )
}

export default TruckDetails

const styles = StyleSheet.create({})
