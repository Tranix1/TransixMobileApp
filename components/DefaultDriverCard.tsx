import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { wp } from "@/constants/common";
import { Image } from "expo-image";

type Props = {
    driver: any;
    onPress: () => void;
};


export default function DefaultDriverCard({
    driver,
    onPress,
}: Props) {

    const accent = useThemeColor("accent");
    const coolGray = useThemeColor("coolGray");


    if (!driver) {
        return (
            <TouchableOpacity
                style={[
                    styles.card,
                    {
                        borderColor: coolGray
                    }
                ]}
                onPress={onPress}
            >

                <Ionicons
                    name="person-add-outline"
                    size={28}
                    color={accent}
                />


                <View style={{marginLeft:wp(3)}}>

                    <ThemedText type="subtitle">
                        Assign Default Driver
                    </ThemedText>


                    <ThemedText style={{opacity:0.6}}>
                        No driver assigned
                    </ThemedText>

                </View>


            </TouchableOpacity>
        );
    }



    return (

        <TouchableOpacity onPress={onPress} style={[styles.card,{borderColor: coolGray}]}>

        {/* driver.profilePhoto    <Ionicons name="person-circle-outline" size={40} color={accent}/> */}

        {driver.profilePhoto ? (
    <Image
        source={{ uri: driver.profilePhoto }}
        style={{
            width: 40,
            height: 40,
            borderRadius: 20,
        }}
    />
) : (
    <Ionicons
        name="person-circle-outline"
        size={40}
        color={accent}
    />
)}

            <View style={{flex:1,marginLeft:wp(3)}}>

               <ThemedText type="subtitle">

                    {driver.driverName}

                </ThemedText>



                <ThemedText
                    style={{
                        opacity:0.6
                    }}
                >

                    {driver.phoneNumber || "No phone"}

                </ThemedText>


            </View>




            <Ionicons
                name="chevron-forward"
                size={24}
                color={accent}
            />



        </TouchableOpacity>

    );
}



const styles = StyleSheet.create({

    card:{

        flexDirection:"row",

        alignItems:"center",

        padding:wp(3),

        borderWidth:1,

        borderRadius:wp(3),

        marginVertical:wp(2)

    }

});