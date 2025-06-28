import { StyleSheet, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Countries, Truck, Contracts } from '@/types/types'
import { wp } from '@/constants/common'
import { useThemeColor } from '@/hooks/useThemeColor'
import { ThemedText } from './ThemedText'
import { Image } from 'expo-image'
import { FontAwesome5, FontAwesome6, Fontisto, Octicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { collection, serverTimestamp, addDoc, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { auth, db } from '@/app/components/config/fireBase'

const TruckItemComponent = ({ truck = {} as Truck, truckContract = {} as Contracts }) => {
    const backgroundLight = useThemeColor('backgroundLight')
    const background = useThemeColor('background')
    const coolGray = useThemeColor('coolGray')
    const icon = useThemeColor('icon')
    const textColor = useThemeColor('text')
    const accent = useThemeColor('accent')

    const placeholder = require('@/assets/images/failedimage.jpg')


    const checkExistixtBBDoc = async (trckContractId: string) => {
        console.log("Checking truck is booked")
        const chatsRef = collection(db, 'OngoingContracts'); // Reference to the 'ppleInTouch' collection
        const chatQuery = query(chatsRef, where('trckContractId', '==', trckContractId), where('alreadyInContract', '==', true)); // Query for matching chat ID

        const querySnapshot = await getDocs(chatQuery);
        // Check if any documents exist with the chat ID
        console.log("Truck Booked")
        return !querySnapshot.empty; // Returns true if a document exists, false otherwise
    };

    //


    async function accentODenyTruck() {

        if (auth.currentUser) {

            const userId = auth.currentUser.uid
            //   const existingBBDoc = await checkExistixtBBDoc(`${userId}contractId ${item.timeStamp}`);
            const existingBBDoc = await checkExistixtBBDoc(`${userId}contractId asdsadas`);
            if (!existingBBDoc) {

                console.log('start adding')

                const theCollection = collection(db, "OngoingContracts");
                const docRef = await addDoc(theCollection, {


                    truckInfo: truck,
                    truckAccpetedContracts: true,

                    trckContractId: `${userId}contractId asdsad`,
                    truckContrSt: true,
                    contractId: truckContract.contractId,
                    contractName: truckContract.contractName,
                    approvedTrck: false,
                    alreadyInContract: true,
                    timeStamp: serverTimestamp()
                })

                alert('doneee adding')

            } else {
                alert("Truck alreadyy Booked")
            }

        }
    }




    return (
        <TouchableOpacity onPress={() => router.push({ pathname: "/Logistics/Trucks/TruckDetails", params: { truckid: truck.id, dspDetails: "true", truckFrContract: 'true' } })} style={[styles.container, { backgroundColor: background, borderColor: backgroundLight }]}>
            <Image placeholderContentFit='cover' transition={400} contentFit='cover' placeholder={placeholder} source={{ uri: truck.imageUrl }} style={styles.image} />
            <View style={styles.detailsContainer}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <ThemedText type='subtitle' numberOfLines={1} style={[styles.title, { color: textColor, flex: 1 }]}>{truck.CompanyName || 'Unknown Company'}</ThemedText>

                </View>
                {/* ADD THE CONDITION HERE!!!!! */}
                {false &&
                    <View style={{ flexDirection: "row", gap: wp(2), marginVertical: wp(2) }}>
                        <TouchableOpacity
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                borderColor: accent,
                                paddingHorizontal: wp(4),
                                height: wp(9),
                                borderRadius: wp(30),
                                borderWidth: 1,
                                flex: 1,
                                justifyContent: 'center',
                            }}
                            onPress={accentODenyTruck}
                            activeOpacity={0.8}
                        >
                            <FontAwesome5 name="check-circle" size={wp(4)} color={accent} style={{ marginRight: wp(2) }} />
                            <ThemedText style={{ color: accent, fontWeight: 'bold', fontSize: wp(4) }}>Accept</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: '#e74c3c',
                                paddingHorizontal: wp(4),
                                height: wp(9),
                                borderRadius: wp(30),
                                flex: 1,
                                justifyContent: 'center',
                            }}
                            activeOpacity={0.8}
                        >
                            <FontAwesome5 name="times-circle" size={wp(4)} color="#fff" style={{ marginRight: wp(2) }} />
                            <ThemedText style={{ color: "#fff", fontWeight: 'bold', fontSize: wp(4) }}>Deny</ThemedText>
                        </TouchableOpacity>
                    </View>
                }

                <View style={{ flexDirection: 'row', backgroundColor: backgroundLight, padding: wp(2), alignSelf: 'flex-start', borderRadius: wp(4), alignItems: 'center' }}>

                    <Fontisto name="truck" size={wp(4)} style={{ width: wp(6) }} color={icon} />
                    <ThemedText numberOfLines={1} type='tiny' style={[{ color: coolGray, fontSize: 15 }]}>
                        {truck.truckType || 'N/A'}
                    </ThemedText>
                </View>
                <View style={{ gap: wp(3), paddingHorizontal: wp(2), marginTop: wp(1) }}>



                    <View style={{ flexDirection: 'row', alignSelf: 'flex-start', borderRadius: wp(4), alignItems: 'center' }}>
                        <FontAwesome5 name="truck-loading" size={wp(3.6)} style={{ width: wp(6) }} color={icon} />
                        <ThemedText numberOfLines={1} type='tiny' style={[{ color: coolGray, fontSize: 15 }]}>
                            {truck.cargoArea || 'N/A'}
                        </ThemedText>
                    </View>

                    <View style={{ flexDirection: 'row', alignSelf: 'flex-start', borderRadius: wp(4), alignItems: 'center' }}>
                        {/* Else if international trucks diasplay were permits are availeble */}
                        <FontAwesome6 name="map-location-dot" size={wp(4)} style={{ width: wp(6) }} color={icon} />
                        <ThemedText numberOfLines={1} type='tiny' style={[{ color: coolGray, fontSize: 15 }]}>
                            {truck.locations?.map(item => item + ', ') || 'N/A'}
                        </ThemedText>
                    </View>

                    <View style={{ flexDirection: 'row', alignSelf: 'flex-start', borderRadius: wp(4), alignItems: 'center' }}>
                        <FontAwesome5 name="weight" size={wp(3.6)} style={{ width: wp(6) }} color={icon} />
                        <ThemedText numberOfLines={1} type='tiny' style={[{ color: coolGray, fontSize: 15 }]}>
                            {truck.truckCapacity || 'N/A'}
                        </ThemedText>
                    </View>
                </View>

            </View>
            {truck.isVerified &&
                <View style={{ flexDirection: 'row', alignSelf: 'flex-start', borderRadius: wp(4), alignItems: 'center', gap: wp(1), padding: wp(1), backgroundColor: background, position: 'absolute', left: wp(4), top: wp(4) }}>
                    <Octicons name='verified' size={wp(3)} color={'#4eb3de'} />
                    <ThemedText numberOfLines={1} type='tiny' style={[{ color: '#4eb3de', fontSize: 13 }]}>
                        Verified
                    </ThemedText>
                </View>
            }
        </TouchableOpacity>
    )
}

export default TruckItemComponent

const styles = StyleSheet.create({
    container: {
        margin: wp(2),
        borderWidth: 0.5,
        borderRadius: wp(6),
        padding: wp(2),
        flexDirection: 'row',
        gap: wp(2),
        shadowColor: '#3535353b',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 13
    },
    image: {
        flex: 1,
        width: wp(60),
        height: wp(40),
        borderRadius: wp(4),
    },
    detailsContainer: {
        flex: 1,
        paddingHorizontal: wp(2),
        gap: wp(1)
    },
    title: {
        fontSize: wp(5),
        fontWeight: 'bold',
        marginBottom: wp(1),
    },
    subtitle: {
        fontSize: wp(4),
        marginBottom: wp(1),
    },
    text: {
        fontSize: wp(3.3),
        marginBottom: wp(0.5),
    },
})