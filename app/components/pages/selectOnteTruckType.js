import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, ImageBackground } from "react-native";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import bulkTImage from "../../../assets/images/Trucks/download (1).jpeg"
import lowbedTImage from "../../../assets/images/Trucks/H805f1f51529345648d1da9e5fcd6807e2.jpg"
import flatdeckTIm from "../../../assets/images/Trucks/images (2).jpeg"
import taultTIm from "../../../assets/images/Trucks/download (3).jpeg"
import sideTipperTMAGE from "../../../assets/images/Trucks/images (5).jpeg"
import tankerTIma from "../../../assets/images/Trucks/images (7).jpeg"
import rigidTImage from "../../../assets/images/Trucks/download (4).jpeg"

function SelectOneTruckType({ navigation }) {
    return (
        <View style={{ alignItems: 'center', paddingTop: 20 }} >


            <TouchableOpacity onPress={() => navigation.navigate('dspOneTrckType', { truckType: 'flatDecks' })} style={styles.selectTruck}>

                <Text style={{ position: 'absolute', alignSelf: 'center', fontWeight: 'bold', fontSize: 16, zIndex: 14, backgroundColor: 'white' }} >Flat deck</Text>
                <ImageBackground source={flatdeckTIm} style={{ width: 135, height: 60 }} />
            </TouchableOpacity>

            <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress={() => navigation.navigate('dspOneTrckType', { truckType: 'BulkTrailers' })} style={styles.selectTruck}>

                    <Text style={{ position: 'absolute', alignSelf: 'center', fontWeight: 'bold', fontSize: 16, zIndex: 14, backgroundColor: 'white' }} >BulkTrailer</Text>
                    <ImageBackground source={bulkTImage} style={{ width: 135, height: 60 }} />
                </TouchableOpacity>


                <TouchableOpacity onPress={() => navigation.navigate('dspOneTrckType', { truckType: 'LowBeds' })} style={styles.selectTruck}>
                    <Text style={{ position: 'absolute', alignSelf: 'center', fontWeight: 'bold', fontSize: 16, zIndex: 14, backgroundColor: 'white' }} >LowBed</Text>
                    <ImageBackground source={lowbedTImage} style={{ width: 135, height: 60 }} />
                </TouchableOpacity>

            </View>
            <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress={() => navigation.navigate('dspOneTrckType', { truckType: 'sideTippers' })} style={styles.selectTruck}>
                    <Text style={{ position: 'absolute', alignSelf: 'center', fontWeight: 'bold', fontSize: 16, zIndex: 14, backgroundColor: 'white' }} >Side Tipper</Text>
                    <ImageBackground source={sideTipperTMAGE} style={{ width: 135, height: 60 }} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('dspOneTrckType', { truckType: 'tauntliner' })} style={styles.selectTruck} >
                    <Text style={{ position: 'absolute', alignSelf: 'center', fontWeight: 'bold', fontSize: 16, zIndex: 14, backgroundColor: 'white' }} >Tautliner</Text>
                    <ImageBackground source={taultTIm} style={{ width: 135, height: 60 }} />
                </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row' }} >

                <TouchableOpacity onPress={() => navigation.navigate('dspOneTrckType', { truckType: 'tanker' })} style={styles.selectTruck}>
                    <Text style={{ position: 'absolute', alignSelf: 'center', fontWeight: 'bold', fontSize: 16, zIndex: 14, backgroundColor: 'white' }} >Tanker</Text>
                    <ImageBackground source={tankerTIma} style={{ width: 135, height: 60 }} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('dspOneTrckType', { truckType: 'Rigid' })} style={styles.selectTruck}>
                    <Text style={{ position: 'absolute', alignSelf: 'center', fontWeight: 'bold', fontSize: 16, zIndex: 14, backgroundColor: 'white' }} >Rigid</Text>
                    <ImageBackground source={rigidTImage} style={{ width: 135, height: 60 }} />
                </TouchableOpacity>
            </View>

        </View>
    )
}
export default SelectOneTruckType


const styles = StyleSheet.create({
    selectTruck: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 60,
        width: 135,
        borderWidth: 1,
        borderColor: 'black',
        padding: 5,
        margin: 10,

    }
});