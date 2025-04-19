import { Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TouchableNativeFeedback, View } from 'react-native'
import React, { useState } from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import { ThemedText } from '@/components/ThemedText'
import { hp, wp } from '@/constants/common'
import { AntDesign, Entypo, EvilIcons, FontAwesome, FontAwesome6, Ionicons, MaterialIcons, Octicons } from '@expo/vector-icons'
import { useColorScheme } from '@/hooks/useColorScheme.web'
import { useThemeColor } from '@/hooks/useThemeColor'
import Button from '@/components/Button'
import Input from '@/components/Input'
import { router, useFocusEffect } from "expo-router";
import { BlurView } from 'expo-blur'
import { useAuth } from '@/context/AuthContext'

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
                        <TouchableNativeFeedback onPress={() => router.push('/App')}>
                            <View style={{ padding: wp(2), flex: 1, justifyContent: 'center' }}>
                                <Entypo name='archive' size={wp(6)} color={icon} />
                            </View>
                        </TouchableNativeFeedback>
                    </View>
                    <View style={{ overflow: 'hidden', borderRadius: wp(10) }}>
                        <TouchableNativeFeedback>
                            <View style={{ padding: wp(2), flex: 1, justifyContent: 'center' }}>
                                <EvilIcons name='search' size={wp(6)} color={icon} />
                            </View>
                        </TouchableNativeFeedback>
                    </View>
                    <View style={{ overflow: 'hidden', borderRadius: wp(10) }}>
                        <TouchableNativeFeedback onPress={() => { setIsVisible(true) }}>
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

    const [isVisible, setIsVisible] = useState(true)

    const { user } = useAuth()



    useFocusEffect(
        React.useCallback(() => {
            setIsVisible(false);
        }, [])
    );


    return (

        <View style={{ flex: 1 }}>
            <CustomHeader />
            <SafeAreaView>
                <Modal onRequestClose={() => setIsVisible(false)} statusBarTranslucent visible={isVisible} transparent animationType='fade'>
                    <Pressable onPressIn={() => { }} style={{ flex: 1, }}>
                        <BlurView intensity={10} experimentalBlurMethod='dimezisBlurView' tint='regular' style={{ backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-start', flex: 1, padding: wp(4), }}>
                            <View style={{
                                backgroundColor: backgroundColor, padding: wp(4), elevation: 12,
                                shadowColor: '#0c0c0c69', borderRadius: wp(6), marginTop: hp(15)
                            }}>

                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={{ overflow: 'hidden', borderRadius: wp(10) }}>
                                        <TouchableNativeFeedback onPress={() => setIsVisible(false)}>
                                            <View style={{ padding: wp(2), justifyContent: 'center' }}>
                                                <Ionicons name='close' color={icon} size={wp(4)} />
                                            </View>
                                        </TouchableNativeFeedback>
                                    </View>
                                    <ThemedText type='subtitle' color={accent} style={{ flex: 1, textAlign: 'center' }}>
                                        Transix
                                    </ThemedText>
                                    <View style={{ overflow: 'hidden', borderRadius: wp(10), width: wp(8) }}>
                                        {/* <TouchableNativeFeedback>
                                            <View style={{ padding: wp(2), flex: 1, justifyContent: 'center' }}>
                                                <Ionicons name='close' color={icon} size={wp(6)} />
                                            </View>
                                        </TouchableNativeFeedback> */}
                                    </View>
                                </View>
                                <View style={{ marginVertical: wp(4), gap: 4, marginBottom: wp(2) }}>
                                    <View style={{ borderTopRightRadius: wp(5), borderTopLeftRadius: wp(5), backgroundColor: background, padding: wp(4) }}>
                                        {user ?

                                            <View style={{ gap: wp(4), }}>
                                                <View style={{ flexDirection: 'row', padding: wp(2), gap: wp(2), alignItems: 'center', }}>
                                                    <FontAwesome name='user-circle' color={coolGray} size={wp(10)} />
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
                                                            <TouchableNativeFeedback onPress={() => router.push('/Account/Edit')}>
                                                                <View style={{ padding: wp(2), flex: 1, justifyContent: 'center' }}>
                                                                    <Ionicons name='alert-circle-outline' color={icon} size={wp(6)} />
                                                                </View>
                                                            </TouchableNativeFeedback>
                                                        </View>
                                                    }
                                                </View>

                                                <Button title='Manage Account' onPress={() => router.push('/Account/Index')}
                                                    Icon={<AntDesign name='arrowright' size={wp(4)} color={accent} style={{ marginLeft: wp(1) }} />} />
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

                                                <Button title='Login Now' onPress={() => router.push('/Account/Login')}
                                                    Icon={<AntDesign name='login' size={wp(4)} color={accent} style={{ marginLeft: wp(1) }} />} />
                                            </View>
                                        }
                                    </View>
                                    <TouchableNativeFeedback>
                                        <View style={{ backgroundColor: background, padding: wp(4), flexDirection: 'row', gap: wp(3) }}>
                                            <Ionicons name="reader" size={wp(4)} color={icon} style={{ width: wp(6), textAlign: 'center' }} />
                                            <View>
                                                <ThemedText type='default'>
                                                    My Contracts
                                                </ThemedText>
                                            </View>
                                        </View>
                                    </TouchableNativeFeedback>
                                    <TouchableNativeFeedback>
                                        <View style={{ backgroundColor: background, padding: wp(4), flexDirection: 'row', gap: wp(3) }}>
                                            <FontAwesome6 name="truck-front" size={wp(4)} color={icon} style={{ width: wp(6), textAlign: 'center' }} />
                                            <View>
                                                <ThemedText type='default'>
                                                    Manage My Trucks
                                                </ThemedText>
                                            </View>
                                        </View>
                                    </TouchableNativeFeedback>
                                    <TouchableNativeFeedback>
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
                                <TouchableNativeFeedback onPress={() => router.push('/Account/Settings')}>
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

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ marginVertical: wp(4), marginHorizontal: wp(2) }}>

                {/* <View style={{ marginBottom: wp(4) }}>
                        <Button title='Go To Store' />
                    </View> */}

                <View style={{ margin: wp(4), marginTop: 0 }}>
                    <Input placeholder='Search...' Icon={<EvilIcons name='search' size={wp(6)} />} containerStyles={{ backgroundColor: backgroundColor }} />
                </View>
                <View style={[styles.homefeature, { borderColor: coolGray, backgroundColor: background, }]}>
                    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: wp(2) }]}>
                        <View style={{ backgroundColor: '#395a4f', borderRadius: wp(2), padding: wp(1.5) }}>
                            <Ionicons name='reader-outline' color={'#fff'} size={wp(4)} />
                        </View>
                        <ThemedText type='subtitle' color={'#395a4f'} style={{ fontWeight: 'bold', fontSize: wp(4.5) }}>
                            Long-Term Contracts
                        </ThemedText>
                    </View>
                    <ThemedText color={icon} type='default' numberOfLines={0} style={{ marginVertical: wp(2), lineHeight: wp(5), fontSize: wp(3.8) }}>
                        Secure long-term contracts with trusted partners to ensure consistent and reliable business operations.
                    </ThemedText>
                    <Button
                        colors={{ text: '#395a4f', bg: '#395a4f24' }}
                        title='Learn More'
                        Icon={<Ionicons name='chevron-forward-outline' size={wp(4)} color={"#395a4f"} />}
                        onPress={() => router.push('/Logistics/Contracts/Index')}
                    />
                </View>


                <View style={[styles.homefeature, { borderColor: coolGray, backgroundColor: background, }]}>
                    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: wp(2) }]}>
                        <View style={{ backgroundColor: '#6bacbf', borderRadius: wp(2), padding: wp(1.5) }}>
                            <Octicons name='verified' color={'#fff'} size={wp(4)} />
                        </View>
                        <ThemedText type='subtitle' color={'#6bacbf'} style={{ fontWeight: 'bold', fontSize: wp(4.5) }}>
                            First Level Verification
                        </ThemedText>
                    </View>
                    <ThemedText color={icon} type='default' numberOfLines={0} style={{ marginVertical: wp(2), lineHeight: wp(5), fontSize: wp(3.8) }}>
                        We encourage all legit business to be verified{'\n'}
                        Increase business trust and credibility by verifying your company.
                    </ThemedText>
                    <Button
                        colors={{ text: '#6bacbf', bg: '#6bacbf24' }}
                        title='Get Verified'
                        Icon={<Ionicons name='chevron-forward-outline' size={wp(4)} color={"#6bacbf"} />}
                    />
                </View>


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





                <View style={[styles.homefeature, { borderColor: coolGray, backgroundColor: background, }]}>
                    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: wp(2) }]}>
                        <View style={{ backgroundColor: '#fb9274', borderRadius: wp(2), padding: wp(1.5) }}>
                            <Octicons name='verified' color={'#fff'} size={wp(4)} />
                        </View>
                        <ThemedText type='subtitle' color={'#fb9274'} style={{ fontWeight: 'bold', fontSize: wp(4.5) }}>
                            GIT (Goods in transit Insuarance)
                        </ThemedText>
                    </View>
                    <ThemedText color={icon} type='default' numberOfLines={0} style={{ marginVertical: wp(2), lineHeight: wp(5), fontSize: wp(3.8) }}>
                        Ensures financial protection for trucks and cargo, keeping your
                        business secure.
                    </ThemedText>
                    <Button
                        colors={{ text: '#fb9274', bg: '#fb927424' }}
                        title='Get Verified'
                        Icon={<Ionicons name='chevron-forward-outline' size={wp(4)} color={"#fb9274"} />}
                    />
                </View>

                <View style={[styles.homefeature, { borderColor: coolGray, backgroundColor: background, }]}>
                    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: wp(2) }]}>
                        <View style={{ backgroundColor: '#bada5f', borderRadius: wp(2), padding: wp(1.5) }}>
                            <Octicons name='verified' color={'#fff'} size={wp(4)} />
                        </View>
                        <ThemedText type='subtitle' color={'#bada5f'} style={{ fontWeight: 'bold', fontSize: wp(4.5) }}>
                            T & L Events
                        </ThemedText>
                    </View>
                    <ThemedText color={icon} type='default' numberOfLines={0} style={{ marginVertical: wp(2), lineHeight: wp(5), fontSize: wp(3.8) }}>
                        Get your tickets now for upcoming transport & logistics events!{'\n'}
                        Featuring : burnouts, car shows, expos, conferences, racing and tournaments!
                    </ThemedText>
                    <Button
                        colors={{ text: '#bada5f', bg: '#bada5f24' }}
                        title='Get Verified'
                        Icon={<Ionicons name='chevron-forward-outline' size={wp(4)} color={"##bada5f"} />}
                    />
                </View>


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