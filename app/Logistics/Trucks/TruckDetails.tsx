import { View, ScrollView, RefreshControl, TouchableOpacity, Modal, TouchableNativeFeedback, Linking, Pressable, } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import ScreenWrapper from "@/components/ScreenWrapper";
import { ThemedText } from "@/components/ThemedText";
import Heading from "@/components/Heading";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Ionicons, Octicons } from "@expo/vector-icons";
import { hp, wp } from "@/constants/common";
import { ReactElement, useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import AlertComponent, { Alertbutton } from "@/components/AlertComponent";
import { BlurView } from 'expo-blur';
import { Truck, User } from "@/types/types";
import { deleteDocument, readById } from "@/db/operations";
import { Image } from 'expo-image'
import { useAuth } from "@/context/AuthContext";
import Divider from "@/components/Divider";
import { formatNumber } from "@/services/services";

const TruckDetails = () => {


    const icon = useThemeColor("icon");
    const accent = useThemeColor("accent");
    const accentlight = useThemeColor("accentlight");
    const background = useThemeColor("background");
    const coolGray = useThemeColor("coolGray");
    const backgroundLight = useThemeColor("backgroundLight");
    const { truckid, dspDetails, truckFrContract } = useLocalSearchParams();

    const [truckData, setTruckData] = useState<Truck>({} as Truck)
    const [modalVisible, setModalVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false)
    const [isSaved, setIsSaved] = useState(false);

    const { user } = useAuth();
    const getData = async () => {
        try {
            setRefreshing(true)
            if (!truckid) return;
            const truck = await readById('Trucks', truckid as string)
            if (truck) {
                setTruckData(truck as Truck)
                if (truckData) {
                    getowenerdata();
                }
            }

        } catch (error) {

        } finally {
            setRefreshing(false)
        }

    };


    const [postOwner, setPostUser] = useState<User>();

    useEffect(() => {
        getData();
        const checkSavedProducts = async () => {
            try {
                const savedProducts = await AsyncStorage.getItem('savedProducts');
                const savedProductsArray = savedProducts ? JSON.parse(savedProducts) : [];
                const isProductSaved = savedProductsArray.some((item: Truck) => item.id === truckData.id);
                setIsSaved(isProductSaved);
            } catch (error) {
                console.error('Error checking saved products:', error);
            }
        };
        checkSavedProducts();
    }, [])

    const getowenerdata = async () => {
        if (truckData.userId) {
            const owner = await readById('personalData', truckData.userId);

            if (owner) {
                const user: User = {
                    ...owner,
                    uid: String(owner.id),
                    createdAt: (owner as any).createdAt ?? Date.now(), // fallback if missing
                };
                setPostUser(user);
            }
        }
    };

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

    const placeholder = require('@/assets/images/failedimage.jpg')
    return (
        <ScreenWrapper>
            <Modal transparent statusBarTranslucent visible={modalVisible} animationType="fade">
                <Pressable onPress={() => setModalVisible(false)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
                    <BlurView intensity={100} style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}>

                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <View style={{ backgroundColor: backgroundLight, borderRadius: wp(4), padding: wp(4), width: wp(80), gap: wp(3) }}>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                                        <Ionicons name="close-circle" size={wp(6)} color={icon} />
                                    </TouchableOpacity>
                                </View>
                                <ThemedText type="title" style={{ textAlign: 'center', marginBottom: wp(4) }}>
                                    Manage Truck
                                </ThemedText>
                                <TouchableOpacity
                                    onPress={() => {
                                        setModalVisible(false);
                                        router.push('/Logistics/Trucks/AddTrucks');
                                    }}
                                    style={{ backgroundColor: accent, alignItems: 'center', padding: wp(2), borderRadius: wp(4) }}
                                >
                                    <ThemedText color="#fff" type="subtitle">Edit Truck</ThemedText>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        setModalVisible(false);
                                        alertBox(
                                            "Delete Truck",
                                            "Are you sure you want to delete this truck?",
                                            [
                                                {
                                                    title: "Delete",
                                                    onPress: async () => {
                                                        try {
                                                            // Add delete logic here
                                                            deleteDocument('Trucks', truckData.id)
                                                            alertBox("Success", "Truck deleted successfully", [], "success");
                                                        } catch (error) {
                                                            alertBox("Error", "Failed to delete truck", [], "error");
                                                        }
                                                    },
                                                },
                                            ],
                                            "destructive"
                                        );
                                    }}
                                    style={{ backgroundColor: '#FF5252', alignItems: 'center', padding: wp(2), borderRadius: wp(4) }}
                                >
                                    <ThemedText color="#fff" type="subtitle">Delete Truck</ThemedText>
                                </TouchableOpacity>

                            </View>
                        </View>
                    </BlurView>
                </Pressable>
            </Modal>

            {showAlert}
            <Heading page={truckData.name || "Truck Details"}
                rightComponent={
                    <View style={{ flexDirection: 'row', gap: wp(2), marginRight: wp(2) }}>
                        {!refreshing && user?.uid === truckData.userId &&
                           ( <View style={{ overflow: 'hidden', borderRadius: wp(2.4) }}>
                                <TouchableNativeFeedback onPress={() => setModalVisible(true)}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: wp(2), padding: wp(1.5) }}>
                                        <Ionicons name='reorder-three-outline' size={wp(6)} color={icon} />
                                    </View>
                                </TouchableNativeFeedback>
                            </View>)
                        }
                    </View>} />
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={getData}
                        colors={[accent]}
                        tintColor={accent}
                    />
                }
                contentContainerStyle={{ paddingBottom: hp(6), marginHorizontal: wp(2) }}>
                <View style={{ marginHorizontal: wp(2) }}>
                    <View style={{ alignItems: 'center', borderRadius: 2, flex: 1, marginBottom: wp(2) }}>
                        {/* <Image source={{ uri: truckData.images[0] }} /> */}


                        <Image
                            source={truckData.imageUrl}
                            style={{
                                width: wp(96),
                                height: wp(95),
                                borderRadius: wp(4),
                                marginVertical: wp(2),
                                //opacity: index === currentIndex ? 1 : 0.5
                            }}
                            placeholderContentFit='cover' transition={400} contentFit='cover' placeholder={placeholder}
                        />



                    </View>
                </View>

                <View style={{ padding: wp(4), borderRadius: wp(4), backgroundColor: backgroundLight }}>
                    <View style={{ flexDirection: 'row', gap: wp(6), justifyContent: 'center' }}>
                        {(postOwner?.phoneNumber) &&
                            <View style={{ alignItems: 'center', gap: wp(1) }}>
                                <View style={{ overflow: 'hidden', borderRadius: wp(10) }}>
                                    <TouchableNativeFeedback onPress={() => (postOwner?.phoneNumber) && Linking.openURL(`tel:${(postOwner?.phoneNumber)}`)}>
                                        <View style={{ width: wp(10), height: wp(10), backgroundColor: background, justifyContent: 'center', alignItems: 'center', borderRadius: wp(10) }}>
                                            <Ionicons name='call-outline' size={wp(5)} color={icon} />
                                        </View>
                                    </TouchableNativeFeedback>
                                </View>
                                <ThemedText type="tiny" style={{ width: '100%', textAlign: 'center', fontFamily: 'SemiBold' }}>
                                    Call
                                </ThemedText>
                            </View>
                        }
                        {(postOwner?.phoneNumber) &&
                            <View style={{ alignItems: 'center', gap: wp(1) }}>
                                <View style={{ overflow: 'hidden', borderRadius: wp(10) }}>
                                    <TouchableNativeFeedback
                                        onPress={() => {
                                            const message = `Hello ${postOwner?.displayName},\n\nI am interested in your product "${truckData.CompanyName}".\n`;
                                            (postOwner?.phoneNumber) && Linking.openURL(`sms:${(postOwner?.phoneNumber)}?body=${encodeURIComponent(message)}`);
                                        }}
                                    >
                                        <View style={{ width: wp(10), height: wp(10), backgroundColor: background, justifyContent: 'center', alignItems: 'center', borderRadius: wp(10) }}>
                                            <Ionicons name='chatbox-outline' size={wp(5)} color={icon} />
                                        </View>
                                    </TouchableNativeFeedback>
                                </View>
                                <ThemedText type="tiny" style={{ width: '100%', textAlign: 'center', fontFamily: 'SemiBold' }}>
                                    SMS
                                </ThemedText>
                            </View>
                        }
                        {(postOwner?.phoneNumber) &&
                            <View style={{ alignItems: 'center', gap: wp(1) }}>
                                <View style={{ overflow: 'hidden', borderRadius: wp(10) }}>
                                    <TouchableNativeFeedback
                                        onPress={() => {
                                            const message = `Hello ${postOwner?.displayName},\n\nI am interested in your product "${truckData.CompanyName}".\n`;
                                            (postOwner?.phoneNumber) && Linking.openURL(`https://wa.me/${(postOwner?.phoneNumber)}?text=${encodeURIComponent(message)}`);
                                        }}
                                    >
                                        <View style={{ width: wp(10), height: wp(10), backgroundColor: background, justifyContent: 'center', alignItems: 'center', borderRadius: wp(10) }}>
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
                                            backgroundColor: background,
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


                <View
                    style={{
                        gap: wp(4),
                        paddingHorizontal: wp(2),
                        marginBottom: wp(2),
                        paddingVertical: wp(5),
                        backgroundColor: background,
                        borderRadius: wp(4),
                        paddingBottom: wp(4),
                    }}
                >
                    {truckFrContract && (
                        <View style={{ flexDirection: "row", justifyContent: "center", gap: wp(3), marginVertical: wp(2) }}>
                            <TouchableOpacity
                                style={{
                                    backgroundColor: "#22c55e",
                                    width: 110,
                                    height: 44,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    borderRadius: 24,
                                    shadowColor: "#22c55e",
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.2,
                                    shadowRadius: 4,
                                    elevation: 3,
                                }}
                                activeOpacity={0.85}
                            >
                                <ThemedText style={{ color: "#fff", fontWeight: "600", fontSize: 16, letterSpacing: 0.5 }}>
                                    Accept
                                </ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{
                                    backgroundColor: "#ef4444",
                                    width: 110,
                                    height: 44,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    borderRadius: 24,
                                    shadowColor: "#ef4444",
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.2,
                                    shadowRadius: 4,
                                    elevation: 3,
                                }}
                                activeOpacity={0.85}
                            >
                                <ThemedText style={{ color: "#fff", fontWeight: "600", fontSize: 16, letterSpacing: 0.5 }}>
                                    Deny
                                </ThemedText>
                            </TouchableOpacity>
                        </View>
                    )}


                    <View style={{}}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View>

                                <ThemedText type="title" style={{ maxWidth: wp(80), }}>
                                    {truckData.CompanyName}
                                </ThemedText>
                                <ThemedText>
                                    {truckData.name}
                                </ThemedText>
                            </View>
                            {truckData.isVerified &&
                                <View style={{ flexDirection: 'row', alignSelf: 'center', borderRadius: wp(4), alignItems: 'center', gap: wp(2), borderWidth: .4, padding: wp(1), borderColor: coolGray }}>
                                    <Octicons name='verified' size={wp(3)} color={'#4eb3de'} />
                                    <ThemedText numberOfLines={1} type='tiny' style={[{ color: '#4eb3de', fontSize: 13 }]}>
                                        Verified
                                    </ThemedText>
                                </View>
                            }
                        </View>
                        {/* <ThemedText type="tiny" style={{ color: icon }}>{truckData.fromLocation}</ThemedText> */}


                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ flex: 1 }}>
                            <ThemedText type="tiny" style={{}}>
                                Truck Model
                            </ThemedText>
                            <ThemedText type="subtitle" style={{}}>
                                {truckData.truckName || '--'}
                            </ThemedText>
                        </View>

                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ flex: 1 }}>
                            <ThemedText type="tiny" style={{}}>
                                Truck Type
                            </ThemedText>
                            <ThemedText type="subtitle" style={{}}>
                                {truckData.truckType || '--'}
                            </ThemedText>
                        </View>

                    </View>


                    {/* <Divider /> */}
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ flex: 1 }}>
                            <ThemedText type="tiny" style={{}}>
                                Cargo Area
                            </ThemedText>
                            <ThemedText type="subtitle" style={{}}>
                                {truckData.cargoArea !== "Other" ? truckData.cargoArea : truckData.otherCargoArea}
                            </ThemedText>
                        </View>



                    </View>
                    {truckData.cargoArea === "Tanker" && <View style={{}}>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ flex: 1 }}>
                                <ThemedText type="tiny" style={{}}>
                                    Tanker Type
                                </ThemedText>
                                {
                                    <ThemedText type="subtitle" style={{}}>
                                        {truckData.tankerType !== "Other" ? truckData.tankerType : truckData.otherTankerType}
                                    </ThemedText>
                                }
                            </View>

                        </View>


                    </View>}



                    <View style={{ flexDirection: 'row', gap: wp(2), alignItems: 'center' }}>
                        <View style={{ flex: 1 }}>
                            <ThemedText type="tiny" style={{}}>
                                Maximum Load Capacity
                            </ThemedText>
                            <ThemedText type="subtitle" style={{}}>
                                {truckData.maxloadCapacity || '--'}t
                            </ThemedText>
                        </View>
                        <ThemedText>|</ThemedText>
                        <View style={{ flex: 1 }}>
                            <ThemedText type="tiny" style={{}}>
                                Capacity:
                            </ThemedText>
                            <ThemedText type="subtitle" style={{}}>
                                {truckData.truckCapacity || '--'}t
                            </ThemedText>
                        </View>

                    </View>
                    {/* <Divider /> */}
                    <View style={{}}>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ flex: 1 }}>
                                <ThemedText type="tiny" style={{}}>
                                    Operation Country{truckData.locations?.length > 1 ? 's' : ''}
                                </ThemedText>
                                <ThemedText type="subtitle" style={{ marginBottom: wp(4) }}>
                                    {truckData.locations?.join(', ') || '--'}
                                </ThemedText>
                            </View>

                        </View>


                    </View>



                    {truckData.additionalInfo &&
                        <View style={{}}>
                            <ThemedText type="tiny" style={{}}>
                                Additional Infomation:
                            </ThemedText>
                            <ThemedText numberOfLines={3} style={{ paddingTop: 0, }}>
                                {truckData.additionalInfo}
                            </ThemedText>
                            {truckData.additionalInfo.length > 100 && (
                                <TouchableOpacity onPress={() => alertBox("Additional Infomation:", truckData.additionalInfo)}>
                                    <ThemedText type="tiny" style={{ color: accent, marginTop: wp(1) }}>
                                        Read More
                                    </ThemedText>
                                </TouchableOpacity>
                            )}
                        </View>
                    }

                    {dspDetails && <View>
                        <ThemedText style={{ textAlign: 'center', marginVertical: wp(4),color:"#1E90FF" }}>Truck Details</ThemedText>
                        <ScrollView pagingEnabled horizontal style={{ marginVertical: 10 }} >
                            {truckData.truckBookImage &&
                                <View style={{ gap: 10 }}>
                                    <ThemedText type="subtitle" style={{}} >Truck Book Image</ThemedText>
                                    <Image source={{ uri: truckData.truckBookImage }} style={{ height: wp(80), borderRadius: 10, width: wp(80), marginLeft: 5 }} />
                                </View>}

                            {truckData.trailerBookF &&
                                <View style={{ gap: 10 }}>
                                    <ThemedText type="subtitle" style={{}}>Trailer Book</ThemedText>
                                    <Image source={{ uri: truckData.trailerBookF }} style={{ height: wp(80), borderRadius: 10, width: wp(80), marginLeft: 5 }} />
                                </View>}

                            {truckData.trailerBookSc &&
                                <View style={{ gap: 10 }}>
                                    <ThemedText type="subtitle" style={{}}>Trailer Book Second</ThemedText>
                                    <Image source={{ uri: truckData.trailerBookSc }} style={{ height: wp(80), borderRadius: 10, width: wp(80), marginLeft: 5 }} />
                                </View>}

                        </ScrollView>

                        <ThemedText style={{  textAlign: 'center', marginVertical: wp(4),color:"#1E90FF" }}>Driver Details</ThemedText>
                        <Divider />
                        <ThemedText type="tiny" style={{ marginTop: hp(1) }}>Driver Phone</ThemedText>
                        <ThemedText type="subtitle">{formatNumber(parseFloat(truckData.driverPhone))}</ThemedText>
                        <Divider />


                        <ScrollView pagingEnabled horizontal style={{ marginVertical: 10 }} >
                            {truckData.driverLicense &&
                                <View style={{ gap: 10 }}>
                                    <ThemedText type="subtitle" style={{}}>Drivers License</ThemedText>

                                    {truckData.driverLicense && <Image source={{ uri: truckData.driverLicense }} style={{ height: wp(80), borderRadius: 10, width: wp(80), marginLeft: 5 }} />}
                                </View>}
                            {truckData.driverPassport &&
                                <View style={{ gap: 10 }}>
                                    <ThemedText type="subtitle" style={{}}>Drivers Passport</ThemedText>
                                    {<Image source={{ uri: truckData.driverPassport }} style={{ height: wp(80), borderRadius: 10, width: wp(80), marginLeft: 5 }} />}
                                </View>}
                                     {truckData.driverIntPermit &&
                                <View style={{ gap: 10 }}>
                                    <ThemedText type="subtitle" style={{}}>International Driver Permit</ThemedText>
                                    {<Image source={{ uri: truckData.driverIntPermit }} style={{ height: wp(80), borderRadius: 10, width: wp(80), marginLeft: 5 }} />}
                                </View>}
                        </ScrollView>

                        <Divider />

                        <View>
                            
                            <ThemedText style={{ textAlign: 'center', marginVertical: wp(4),color:"#1E90FF" }}>Truck Owner Details </ThemedText>
                            <ThemedText type="tiny" >Owner Phone Number</ThemedText>
                            <ThemedText style={{ marginBottom: wp(2) }} type="subtitle">{truckData.ownerPhoneNum}</ThemedText>
                            <ThemedText type="tiny" >Owner Email</ThemedText>
                            <ThemedText type="subtitle">{truckData.onwerEmail}</ThemedText>

                        </View>

                    </View>}

                    <TouchableOpacity
                        style={{
                            height: 45,
                            backgroundColor: accent,
                            width: 240,
                            borderRadius: 21,
                            justifyContent: "center",
                            alignItems: "center",
                            alignSelf: "center",
                            marginTop: wp(4),
                            marginBottom: wp(4),
                            shadowColor: accent,
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.12,
                            shadowRadius: 4,
                            elevation: 2,
                        }}
                        onPress={() =>
                            router.push({
                                pathname: "/Logistics/Trucks/Index",
                                params: { userId: truckData.userId, organisationName: truckData.CompanyName },
                            })
                        }
                    >
                        <ThemedText style={{ color: "white" }}>
                            View Trucks from{'  '}
                            <ThemedText style={{ textDecorationLine: 'underline', color: 'white' }}>
                                {truckData.CompanyName}
                            </ThemedText>
                        </ThemedText>
                    </TouchableOpacity>

                </View>
            </ScrollView>
        </ScreenWrapper >
    )
}

export default TruckDetails

