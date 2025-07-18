import { Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, TouchableNativeFeedback, View, TouchableOpacity, TouchableHighlight, Image, useColorScheme,ToastAndroid } from 'react-native'
import React, { useState } from 'react'
import { ThemedText } from '@/components/ThemedText'
import { hp, wp } from '@/constants/common'
import { AntDesign, EvilIcons, FontAwesome, FontAwesome6, Fontisto, Ionicons, MaterialCommunityIcons, MaterialIcons, Octicons } from '@expo/vector-icons'
import { useThemeColor } from '@/hooks/useThemeColor'
import Button from '@/components/Button'
import { router, useFocusEffect } from "expo-router";
import { BlurView } from 'expo-blur'
import { useAuth } from '@/context/AuthContext'
import * as Updates from 'expo-updates';
import { auth } from '../components/config/fireBase'
import { signOut, sendEmailVerification } from 'firebase/auth'

const Index = () => {
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
                        <TouchableNativeFeedback onPress={()=>checkAuth(true) }>
                            <View style={{ padding: wp(2) }}>
                                <Ionicons name='reorder-three' size={wp(6)} color={icon} />
                            </View>
                        </TouchableNativeFeedback>
                    </View>
                </View>
            </View>

        );
    }
    const accent = useThemeColor('accent')
    const icon = useThemeColor('icon')
    const backgroundColor = useThemeColor('backgroundLight')
    const background = useThemeColor('background')
    const coolGray = useThemeColor('coolGray')
    const textlight = useThemeColor('textlight')

 
    const { user } = useAuth()


    const [dspCreateAcc , setDspCreateAcc]= useState(false)
    const [dspVerifyAcc , setDspVerifyAcc]=useState(false)
    const [dspMenu , setDspMenu]= useState(false)

    

    function checkAuth(theAction: any) {

    if (auth.currentUser) {
        if (!auth.currentUser.emailVerified) {
            setDspVerifyAcc(true);
        } else {
            // user exists and email is verified
if (typeof theAction === 'function') {
        theAction(); // call the action
      } else {
        setDspMenu(true); // if it's not a function, open the menu
      }

        }
    } else {
        // no user logged in
        setDspCreateAcc(true);
    }
}

    interface DataItem {
        topic: string;
        description: string;
        id: number
        btnTitle: string
    }

const theData: DataItem[] = [
    {
        id: 1,
        topic: "Long-Term Contracts", 
        description: 'Secure long-term contracts with trusted partners to grow your business with stable income, guaranteed loads, and reliable payments.',
        btnTitle: "Get Verified  "
    },
    {
        id: 2,
        topic: "First Level Verification",
        description: 'Verify your business today to build trust with customers, access exclusive deals, and boost your company’s reputation easily.',
        btnTitle: "Get Verified  "
    },
    {
        id: 3,
        topic: "GIT (Goods in Transit Insurance)",
        description: 'Protect your trucks and cargo while on the road. Get insurance that covers theft, accidents, and damages during transit.',
        btnTitle: "Get GIT  "
    },
    {
        id: 4,
        topic: "Tracking",
        description: 'Track your trucks and cargo live on the app. Improve safety, monitor routes, and keep customers updated anytime.',
        btnTitle: "View Tracking  "
    },
    {
        id: 6,
        topic: "Fuel   ",
        description: 'Find nearby fuel service stations with the best prices. Enjoy special discounts and get quick directions to save time and money.',
        btnTitle: "Get Fuel "
    },
    {
        id: 5,
        topic: "Warehouse   ",
        description: 'Find secure, affordable warehouses near your routes. Store your goods safely with easy directions and discounted rates for members.',
        btnTitle: "Check Warehouses  "
    },
    {
        id: 7,
        topic: "Truck Stop   ",
        description: 'Locate safe and comfortable truck stops on your journey. Rest, refresh, refuel, and access facilities conveniently anytime.',
        btnTitle: "Visit Truck Stop  "
    },
];


    interface HomeItemProps {
        topic: string;
        description: string;
        mainColor: string;
        icon: string;
        buttonTitle: string;
        btnBackground: string;
        btnPressValue: () => void;

        isAvaialble: boolean;

    }
    const colorScheme = useColorScheme();
    const HomeItemView: React.FC<HomeItemProps> = ({
        topic,
        description,
        mainColor,
        btnBackground,
        icon,
        buttonTitle,
        isAvaialble,
        btnPressValue
    }) => (
        <View style={[styles.homefeature, { borderColor: mainColor, backgroundColor: background, overflow: 'hidden', }]}>

            {!isAvaialble &&
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, height: '125%', alignItems: 'center', justifyContent: 'center', backgroundColor: colorScheme === 'light' ? 'rgba(255, 255, 255, 0.6)' : "rgba(0, 0, 0, 0.6)" }} >
                    <ThemedText type='defaultSemiBold'  > Coming Soon</ThemedText>
                    <Ionicons name='time-outline' size={wp(6)} color={colorScheme === 'light'? "black" : "white" }  />
                </View>}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(2) }}>
                <View style={{ backgroundColor: mainColor, borderRadius: wp(2), padding: wp(1.5) }}>
                    <Octicons name='verified' color={'#fff'} size={wp(4)} />
                </View>
                <ThemedText type='subtitle' color={mainColor} style={{ fontWeight: 'bold', fontSize: wp(4.5) }} >
                    {topic}
                </ThemedText>
            </View>

            <View>
                <ThemedText
                    type='default'
                    numberOfLines={0}
                    style={{ marginVertical: wp(2), lineHeight: wp(5), fontSize: wp(3.8) }}
                >
                    {description}
                </ThemedText>
            </View>

            <Button
                onPress={btnPressValue}
                colors={{ text: mainColor, bg: btnBackground }}
                title={buttonTitle} // ✅ Dynamic title
                Icon={<Ionicons name='chevron-forward-outline' size={wp(4)} color={mainColor} />}
            />
        </View>
    );

    return (

        <View style={{ flex: 1 }}>
            <CustomHeader />
            <SafeAreaView>
                <Modal onRequestClose={() => setDspMenu(false)} statusBarTranslucent visible={dspMenu} transparent animationType='fade'>
                    <Pressable onPressIn={() => { }} style={{ flex: 1, }}>
                        <BlurView intensity={10} experimentalBlurMethod='dimezisBlurView' tint='regular' style={{ backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-start', flex: 1, padding: wp(4), }}>
                            <View style={{
                                backgroundColor: backgroundColor, padding: wp(4), elevation: 12,
                                shadowColor: '#0c0c0c69', borderRadius: wp(6), marginTop: hp(15)
                            }}>

                                <TouchableOpacity
                                    onPress={() => setDspMenu(false)}
                                    style={{
                                        position: "absolute",
                                        top: wp(2),
                                        right: wp(2),
                                        padding: wp(2),
                                        borderRadius: wp(10),
                                        backgroundColor: background,
                                    }}
                                >
                                    <Ionicons name="close" size={wp(4)} color={icon} />
                                </TouchableOpacity>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                                    <ThemedText type='title' color={accent} style={{ flex: 1, textAlign: 'center' }}>
                                        Transix
                                    </ThemedText>

                                </View>
                                <View style={{ marginVertical: wp(4), gap: 4, marginBottom: wp(2) }}>
                                    <View style={{ borderTopRightRadius: wp(5), borderTopLeftRadius: wp(5), backgroundColor: background, padding: wp(4) }}>
                                        {user ?

                                            <View style={{ gap: wp(4), }}>
                                                <View style={{ flexDirection: 'row', padding: wp(2), gap: wp(2), alignItems: 'center', }}>
                                                    {!user?.photoURL && <FontAwesome name='user-circle' color={coolGray} size={wp(10)} />}
                                                    {user?.photoURL && <Image
                                                        style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#ddd', }}
                                                        source={{ uri: user?.photoURL || 'https://via.placeholder.com/100' }}
                                                    />}
                                                    <View style={{ flex: 1 }}>
                                                        <ThemedText type='subtitle'>
                                                            {user?.organisation || user?.displayName || 'No name'}
                                                        </ThemedText>
                                                        <ThemedText type='tiny' color={coolGray}>
                                                            {user?.email}
                                                        </ThemedText>

                                                    </View>
                                                    {
                                                        !user?.organisation &&
                                                        <View style={{ overflow: 'hidden', borderRadius: wp(10), alignSelf: 'flex-end' }}>
                                                            <TouchableNativeFeedback 
                                                            onPress={() => {router.push('/Account/Edit'); setDspMenu(false) }  }>
                                                                <View style={{ padding: wp(2), flex: 1, justifyContent: 'center' }}>
                                                                    <Ionicons name='alert-circle-outline' color={icon} size={wp(6)} />
                                                                </View>
                                                            </TouchableNativeFeedback>
                                                        </View>
                                                    }
                                                </View>
                                                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: wp(2), justifyContent: 'center', borderWidth: 1, borderColor: backgroundColor, padding: wp(3), borderRadius: wp(4) }} onPress={() => {router.push('/Account/Index'); setDspMenu(false) }  }>
                                                    <MaterialIcons name="manage-accounts" size={wp(5)} color={accent} style={{ marginLeft: wp(1) }} />
                                                    <ThemedText>
                                                        Manage Account
                                                    </ThemedText>
                                                </TouchableOpacity>
                                            </View>
                                            :
                                            <View style={{ gap: wp(4), }}>
                                                <View style={{ flexDirection: 'row', padding: wp(2), gap: wp(2), alignItems: 'center' }}>
                                                    <FontAwesome name='user-circle' color={coolGray} size={wp(10)} />
                                                    <View>
                                                        <ThemedText>
                                                            You are not Logged In
                                                        </ThemedText>
                                                        <ThemedText type='tiny' color={coolGray}>
                                                            Click button below to Login or Create New Account
                                                        </ThemedText>

                                                    </View>
                                                </View>
                                                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: wp(2), justifyContent: 'center', borderWidth: 1, borderColor: backgroundColor, padding: wp(3), borderRadius: wp(4) }} onPress={() => {router.push('/Account/Login'); setDspMenu(false)  }  }>
                                                    <AntDesign name='login' size={wp(3)} color={accent} style={{ marginLeft: wp(1) }} />
                                                    <ThemedText>
                                                        Login Now
                                                    </ThemedText>
                                                </TouchableOpacity>


                                            </View>
                                        }
                                    </View>
                                    <TouchableNativeFeedback onPress={() => {router.push("/BooksAndBids/SlctBidsAndBooks"); setDspMenu(false) }  } >
                                        <View style={{ backgroundColor: background, padding: wp(4), flexDirection: 'row', gap: wp(3) }}>
                                            <FontAwesome6 name="truck-front" size={wp(4)} color={icon} style={{ width: wp(6), textAlign: 'center' }} />
                                            <View>
                                                <ThemedText type='default'>
                                                    Bookings and Biddings
                                                </ThemedText>
                                            </View>
                                        </View>
                                    </TouchableNativeFeedback>
                                    <TouchableNativeFeedback onPress={() => {router.push("/Logistics/Contracts/ViewMiniContracts"); setDspMenu(false) } }>
                                        <View style={{ backgroundColor: background, padding: wp(4), flexDirection: 'row', gap: wp(3) }}>
                                            <Ionicons name="reader" size={wp(4)} color={icon} style={{ width: wp(6), textAlign: 'center' }} />
                                            <View>
                                                <ThemedText type='default'>
                                                    My Contracts
                                                </ThemedText>
                                            </View>
                                        </View>
                                    </TouchableNativeFeedback>
                                    <TouchableNativeFeedback onPress={
                                        () => {router.push({ pathname: '/Logistics/Trucks/Index', params: { userId: user?.uid } }); setDspMenu(false)  } } >
                                        <View style={{ backgroundColor: background, padding: wp(4), flexDirection: 'row', gap: wp(3) }}>
                                            <FontAwesome6 name="truck-front" size={wp(4)} color={icon} style={{ width: wp(6), textAlign: 'center' }} />
                                            <View>
                                                <ThemedText type='default'>
                                                    Manage My Trucks
                                                </ThemedText>
                                            </View>
                                        </View>
                                    </TouchableNativeFeedback>
                                    <TouchableNativeFeedback
                                     onPress={() => {router.push({ pathname: '/Logistics/Loads/Index', params: { userId: user?.uid } }); setDspMenu(false)  }  }>
                                        <View style={{ backgroundColor: background, padding: wp(4), flexDirection: 'row', gap: wp(3) }}>
                                            <FontAwesome6 name="boxes-stacked" size={wp(4)} color={icon} style={{ width: wp(6), textAlign: 'center' }} />
                                            <View>
                                                <ThemedText type='default'>
                                                    Manage My Loads
                                                </ThemedText>
                                            </View>
                                        </View>
                                    </TouchableNativeFeedback>
                                    <TouchableNativeFeedback>
                                        <View style={{ backgroundColor: background, padding: wp(4), flexDirection: 'row', gap: wp(3) }}>
                                            <MaterialIcons name="work-history" size={wp(4)} color={icon} style={{ width: wp(6), textAlign: 'center' }} />

                                            <View>
                                                <ThemedText type='default'>
                                                    My Payments History
                                                </ThemedText>
                                            </View>
                                        </View>
                                    </TouchableNativeFeedback>
                                    <View style={{ borderBottomRightRadius: wp(5), borderBottomLeftRadius: wp(5), overflow: 'hidden' }}>

                                        <TouchableNativeFeedback>
                                            <View style={{ backgroundColor: background, padding: wp(4), flexDirection: 'row', gap: wp(3) }}>
                                                <FontAwesome6 name="shop" size={wp(4)} color={icon} style={{ width: wp(6), textAlign: 'center' }} />
                                                <View>
                                                    <ThemedText type='default'>
                                                        Manage My Shop
                                                    </ThemedText>
                                                </View>
                                            </View>
                                        </TouchableNativeFeedback>
                                    </View>

                                </View>
                                <TouchableNativeFeedback onPress={() => {router.push('/Account/Settings'); setDspMenu(false)  } }>
                                    <View style={{ paddingHorizontal: wp(4), flexDirection: 'row', gap: wp(3), paddingVertical: wp(4) }}>
                                        <Ionicons name="settings-outline" size={wp(4)} color={icon} style={{ width: wp(6), textAlign: 'center' }} />

                                        <View>
                                            <ThemedText type='default'>
                                                Settings
                                            </ThemedText>
                                        </View>
                                    </View>
                                </TouchableNativeFeedback>
                                <View style={{ marginBottom: wp(0) }} />
                            </View>
                        </BlurView>
                    </Pressable>
                </Modal>
            </SafeAreaView>


   <Modal statusBarTranslucent visible={dspCreateAcc } animationType='fade' transparent>
                    <Pressable onPressIn={() => setDspCreateAcc(false)  } style={{ flex: 1, }}>
                <BlurView intensity={10} experimentalBlurMethod='dimezisBlurView' tint='regular' style={{ backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', flex: 1, padding: wp(4), alignItems: 'center' }}>
                    <View
                        style={{
                            justifyContent: "center",
                            alignItems: "center",
                            padding: wp(6),
                            backgroundColor: background,
                            borderRadius: wp(6),
                            margin: wp(4),
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.15,
                            shadowRadius: 8,
                            elevation: 10,
                        }}
                    >
                        <TouchableOpacity
                            onPress={() => setDspCreateAcc(false) }
                            style={{
                                position: "absolute",
                                top: wp(2),
                                right: wp(2),
                                padding: wp(2),
                                borderRadius: wp(10),
                                backgroundColor: backgroundColor,
                            }}
                        >
                            <Ionicons name="close" size={wp(4)} color={icon} />
                        </TouchableOpacity>
                        <ThemedText
                            type="title"
                            style={{
                                marginBottom: wp(2),
                                textAlign: "center",
                                color: accent,
                                fontWeight: "bold",
                                fontSize: wp(5),
                            }}
                        >
                            Get Authenticated
                        </ThemedText>
                       

                        <ThemedText
                            type="tiny"
                            style={{
                                marginBottom: wp(6),
                                textAlign: "center",
                                color: coolGray,
                            }}
                        >
                             Create an account or sign in to add items, book loads, bid on loads, and access more features.
                        </ThemedText>

                           
                            <TouchableOpacity
                                onPress={()=>{router.push("/Account/Login"); setDspCreateAcc(false)  }  }
                                style={{
                                    backgroundColor: "#d1f7e9",
                                    width:wp(70),
                                    // paddingVertical: wp(2),
                                    borderRadius: wp(3),
                                    alignItems: "center",
                                }}
                            >
                                <ThemedText style={{ color: "#0f9d58", fontWeight: "bold" }}>Autheticate</ThemedText>
                            </TouchableOpacity>
                    </View>
                </BlurView>

                    </Pressable>
            </Modal>







            <Modal statusBarTranslucent visible={dspVerifyAcc } animationType='fade' transparent>
                <BlurView intensity={10} experimentalBlurMethod='dimezisBlurView' tint='regular' style={{ backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', flex: 1, padding: wp(4), alignItems: 'center' }}>
                    <View
                        style={{
                            justifyContent: "center",
                            alignItems: "center",
                            padding: wp(6),
                            backgroundColor: background,
                            borderRadius: wp(6),
                            margin: wp(4),
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.15,
                            shadowRadius: 8,
                            elevation: 10,
                        }}
                    >
                        <TouchableOpacity
                            onPress={() => setDspVerifyAcc(false) }
                            style={{
                                position: "absolute",
                                top: wp(2),
                                right: wp(2),
                                padding: wp(2),
                                borderRadius: wp(10),
                                backgroundColor: backgroundColor,
                            }}
                        >
                            <Ionicons name="close" size={wp(4)} color={icon} />
                        </TouchableOpacity>
                        <ThemedText
                            type="title"
                            style={{
                                marginBottom: wp(2),
                                textAlign: "center",
                                color: accent,
                                fontWeight: "bold",
                                fontSize: wp(5),
                            }}
                        >
                            Verify Your Email
                        </ThemedText>
                        <ThemedText
                            type="default"
                            style={{
                                marginBottom: wp(4),
                                textAlign: "center",
                                color: icon,
                                fontSize: wp(3.8),
                            }}
                        >
                            {auth.currentUser?.email}
                        </ThemedText>

                        <ThemedText
                            type="tiny"
                            style={{
                                marginBottom: wp(6),
                                textAlign: "center",
                                color: coolGray,
                            }}
                        >
                            Please check your inbox and click the verification link. Once verified, tap Refresh.
                        </ThemedText>

                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                width: "100%",
                                gap: wp(3),
                            }}
                        >
                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    backgroundColor: "#e0e7ef",
                                    paddingVertical: wp(2),
                                    borderRadius: wp(3),
                                    alignItems: "center",
                                }}
                                onPress={async () => {
                                    try {
                                        console.log("Sending verification email...");

                                        await sendEmailVerification(auth.currentUser as any);
                                        ToastAndroid.show('verification email Link sent!', ToastAndroid.SHORT)
                                        setDspVerifyAcc(false) 
                                    } catch (error) {
                                        console.log("Error sending verification email:", error);
                                        alert("Failed to send verification email. Try again.");
                                    }
                                }}
                            >
                                <ThemedText style={{ color: accent, fontWeight: "bold" }}>New code</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    backgroundColor: "#f8d7da",
                                    paddingVertical: wp(2),
                                    borderRadius: wp(3),
                                    alignItems: "center",
                                }}
                                onPress={async ()=> {await signOut(auth) ; ToastAndroid.show('Signed out successfully.', ToastAndroid.SHORT);
                                        setDspVerifyAcc(false)  } }
                            >
                                <ThemedText style={{ color: "#e50914", fontWeight: "bold" }}>Sign out</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => Updates.reloadAsync()}
                                style={{
                                    flex: 1,
                                    backgroundColor: "#d1f7e9",
                                    paddingVertical: wp(2),
                                    borderRadius: wp(3),
                                    alignItems: "center",
                                }}
                            >
                                <ThemedText style={{ color: "#0f9d58", fontWeight: "bold" }}>Refresh</ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </BlurView>
            </Modal>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ marginVertical: wp(4), marginHorizontal: wp(2) }}>

             <View style={{ margin: wp(4), marginTop: 0 }}>
                    <TouchableOpacity onPress={() => router.push("/Search/Index")}
                        style={{ backgroundColor: backgroundColor, borderRadius: wp(8), padding: wp(3), flexDirection: 'row', gap: wp(2), borderWidth: .4, borderColor: icon }}>
                        <EvilIcons name='search' size={wp(6)} color={icon} />
                        <ThemedText color={textlight}>
                            Search..
                        </ThemedText>
                    </TouchableOpacity>
                </View>

              

                <View style={[styles.homefeature, { borderColor: backgroundColor, backgroundColor: background, }]}>
                    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: wp(2) }]}>
                        <View style={{}}>
                            <MaterialCommunityIcons name="lightning-bolt-circle" size={wp(4)} color={icon} />
                        </View>
                        <ThemedText type='subtitle' style={{ fontWeight: 'bold', fontSize: wp(3.5) }}>
                            Quick Links
                        </ThemedText>
                    </View>
                    <View style={[{ flexDirection: 'row', gap: wp(2), justifyContent: 'space-between' }]}>
                        <View style={{ alignItems: 'center', justifyContent: 'flex-start', gap: wp(2), width: wp(16) }}>
                            <TouchableHighlight onPress={()=> checkAuth(()=> router.push('/Logistics/Contracts/NewContract')) }
                                                               
                                underlayColor={'#F480245a'} style={{ justifyContent: 'center', width: wp(14), alignItems: 'center', height: wp(14), borderRadius: wp(60), backgroundColor: '#F4802424' }}>
                                <Ionicons name="reader" size={wp(5)} color="#e50914" />
                            </TouchableHighlight>
                            <ThemedText type='tiny' style={{ textAlign: 'center' }}>
                                Create Contract
                            </ThemedText>
                        </View>
                        <View style={{ alignItems: 'center', justifyContent: 'flex-start', gap: wp(2), width: wp(16) }}>
                            <TouchableHighlight onPress={() =>checkAuth(()=>router.push('/Logistics/Trucks/AddTrucks'))} underlayColor={'#0f9d585a'} style={{ justifyContent: 'center', width: wp(14), alignItems: 'center', height: wp(14), borderRadius: wp(60), backgroundColor: '#0f9d5824' }}>
                                <Fontisto name="truck" size={wp(5)} color="#0f9d58" />
                            </TouchableHighlight>
                            <ThemedText type='tiny' style={{ textAlign: 'center' }}>
                                Add Truck
                            </ThemedText>
                        </View>
                        <View style={{ alignItems: 'center', justifyContent: 'flex-start', gap: wp(2), width: wp(16) }}>
                            <TouchableHighlight onPress={() =>checkAuth(()=>router.push('/Logistics/Loads/AddLoads')) } underlayColor={'#4285f45a'} style={{ justifyContent: 'center', width: wp(14), alignItems: 'center', height: wp(14), borderRadius: wp(60), backgroundColor: '#4285f424' }}>
                                <FontAwesome6 name="box" size={wp(5)} color="#4285f4" />
                            </TouchableHighlight>
                            <ThemedText type='tiny' style={{ textAlign: 'center' }}>
                                Add Load
                            </ThemedText>
                        </View>
                        <View style={{ alignItems: 'center', justifyContent: 'flex-start', gap: wp(2), width: wp(16) }}>
                            <TouchableHighlight  onPress={() =>checkAuth(()=>router.push('/Transport/Store/CreateProduct')) }   underlayColor={'#F480245a'} style={{ justifyContent: 'center', width: wp(14), alignItems: 'center', height: wp(14), borderRadius: wp(60), backgroundColor: '#F4802424' }}>
                                <Fontisto name="dollar" size={wp(5)} color="#F48024" />
                            </TouchableHighlight>
                            <ThemedText type='tiny' style={{ textAlign: 'center' }}>
                                Sell Products
                            </ThemedText>
                        </View>

                    </View>

                </View>


                {theData.map((item) => (<View>



                    {item.id === 1 && <View style={[styles.homefeature, { borderColor: backgroundColor, backgroundColor: background, }]}>

                        <View style={[{ flexDirection: 'row', alignItems: 'center', gap: wp(2) }]}>
                            <View style={{}}>
                                <FontAwesome6 name="file-contract" color={'#4285f4'} size={wp(3)} />
                            </View>
                            <ThemedText type='defaultSemiBold' color={'#4285f4'} style={{ fontSize: wp(3.5), flex: 1 }}>
                                Long-Term Contracts
                            </ThemedText>
                            <TouchableOpacity onPress={() => router.push('/Logistics/Contracts/ViewMiniContracts')} style={{ flexDirection: 'row', gap: wp(1) }}>
                                <ThemedText type='tiny'>
                                    Open Contracts
                                </ThemedText>
                                <Ionicons name='arrow-forward' color={icon} />
                            </TouchableOpacity>
                        </View>
                        <ThemedText color={icon} type='tiny' numberOfLines={0} style={{ marginVertical: wp(2), lineHeight: wp(5) }}>
                            Secure long-term contracts with trusted partners to ensure consistent and reliable business operations.
                        </ThemedText>



                        <View style={{ marginVertical: wp(15), alignItems: 'center', gap: wp(4) }}>

                            <ThemedText>
                                Create contract and start transporting loads today!
                            </ThemedText>

                            <TouchableOpacity onPress={() => router.push('/Logistics/Contracts/ViewMiniContracts')} style={{ paddingHorizontal: wp(4), paddingVertical: wp(1.5), backgroundColor: '#212121', borderRadius: wp(3), flexDirection: 'row', gap: wp(2), alignItems: 'center' }}>
                                <FontAwesome6 name="file-signature" size={wp(3)} color="#fff" />
                                <ThemedText color='#fff' >
                                    Booked Contracts
                                </ThemedText>
                            </TouchableOpacity>
                        </View>




                    </View>}

                    {/* <View style={{ flexDirection: 'row', gap: wp(2), marginBottom: wp(5), paddingHorizontal: wp(2) }}>
                    <View style={{ borderWidth: .5, borderColor: accent, padding: wp(3), borderRadius: wp(6), flex: 1, alignItems: 'center' }}>
                        <ThemedText color={accent}>
                            Add Logistics
                        </ThemedText>
                    </View>
                    <View style={{
                        borderWidth: .5, borderColor: accent, padding: wp(3), borderRadius: wp(6), flex: 1, alignItems: 'center'
                    }}>
                        <ThemedText color={accent}>
                            Add To Store
                        </ThemedText>
                    </View>
                </View> */}



                    {item.id === 2 && <HomeItemView
                        topic={item.topic}
                        description={item.description}
                        mainColor="#6bacbf"
                        icon="#333"
                        buttonTitle={item.btnTitle}
                        btnBackground="#6bacbf24"
                        isAvaialble={true}
                        btnPressValue={() => router.push("/Account/Verification/ApplyVerification")}
                    />}


                    {item.id === 3 && <HomeItemView
                        topic={item.topic}
                        description={item.description}
                        mainColor="#fb9274"
                        icon="#333"
                        buttonTitle={item.btnTitle}
                        btnBackground="#fb927424"
                        isAvaialble={true}
                        btnPressValue={() => router.push("/Compliances/GITInsuarance/Index")}
                    />}

                    {item.id === 4 && <HomeItemView
                        topic={item.topic}
                        description={item.description}
                        mainColor="#bada5f"
                        icon="#333"
                        buttonTitle={item.btnTitle}
                        btnBackground="#bada5f24"
                        isAvaialble={false}
                        btnPressValue={() => router.push("/Compliances/GITInsuarance/Index")}
                    />}

                    {item.id === 5 && <HomeItemView
                        topic={item.topic}
                        description={item.description}
                        mainColor="#bada5f"
                        icon="#333"
                        buttonTitle={item.btnTitle}
                        btnBackground="#bada5f24"
                        isAvaialble={false}
                        btnPressValue={() => router.push("/Account/Verification/ApplyVerification")}
                    />}

                    {item.id === 6 && <HomeItemView
                        topic={item.topic}
                        description={item.description}
                        mainColor="#bada5f"
                        icon="#333"
                        buttonTitle={item.btnTitle}
                        btnBackground="#bada5f24"
                        isAvaialble={false}
                        btnPressValue={() => router.push("/Account/Verification/ApplyVerification")}
                    />}
                    {item.id === 7 && <HomeItemView
                        topic={item.topic}
                        description={item.description}
                        mainColor="#bada5f"
                        icon="#333"
                        buttonTitle={item.btnTitle}
                        btnBackground="#bada5f24"
                        isAvaialble={false}
                        btnPressValue={() => router.push("/Account/Verification/ApplyVerification")}
                    />}

                </View>))}


            </ScrollView>

        </View>
    )
}

export default Index

const styles = StyleSheet.create({
    homefeature: {
        padding: wp(4),
        borderRadius: wp(6),
        gap: wp(2),
        marginBottom: wp(6),
        borderWidth: 0.5,
        shadowColor: '#3535353b',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 13
    }
})