import React from 'react';
import {
    View,
    StyleSheet,
} from 'react-native';

import {
    Ionicons,
    MaterialCommunityIcons,
} from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { BRAND } from '@/constants/Colors';

import { hp , wp } from '@/constants/common';


type TodayCardProps = {
    background: string;
    backgroundLight: string;
    border: string;
    textlight: string;
};


const TodayCard = ({
    background,
    backgroundLight,
    border,
    textlight,
}: TodayCardProps) => {

    return (
        <View
            style={[
                styles.card,
                {
                    backgroundColor: background,
                    borderColor: border,
                },
            ]}
        >

            {/* HEADER */}
         <View style={styles.header}>

    <View>
        <ThemedText style={styles.title}>
            Today
        </ThemedText>

        <ThemedText style={styles.subtitle}>
            Fleet performance
        </ThemedText>
    </View>

    <View style={styles.headerRight}>

        <View
            style={[
                styles.statusBadge,
                {
                    backgroundColor: `${BRAND.good}18`,
                },
            ]}
        >
            <View
                style={[
                    styles.statusDot,
                    { backgroundColor: BRAND.good },
                ]}
            />

            <ThemedText
                style={[
                    styles.statusText,
                    { color: BRAND.good },
                ]}
            >
                Healthy
            </ThemedText>
        </View>

        <View
            style={[
                styles.iconBox,
                {
                    backgroundColor: `${BRAND.teal}1A`,
                },
            ]}
        >
            <Ionicons
                name="today-outline"
                size={wp(5)}
                color={BRAND.teal}
            />
        </View>

    </View>

</View>



            {/* MAIN NUMBERS */}
            <View style={styles.mainRow}>

                <View>
                    <ThemedText style={styles.amount}>
                        $4,250
                    </ThemedText>

                    <ThemedText style={styles.label}>
                        Revenue
                    </ThemedText>
                </View>


                <View>
                    <ThemedText style={styles.amount}>
                        18
                    </ThemedText>

                    <ThemedText style={styles.label}>
                        Trips
                    </ThemedText>
                </View>


            </View>



<View style={styles.progressSection}>

    <View style={styles.progressHeader}>

        <ThemedText style={styles.progressLabel}>
            Daily Target
        </ThemedText>

        <ThemedText style={styles.progressPercent}>
            72%
        </ThemedText>

    </View>

    <View
        style={[
            styles.progressBackground,
            {
                backgroundColor: backgroundLight,
            },
        ]}
    >

        <View
            style={[
                styles.progressFill,
                {
                    width: '72%',
                    backgroundColor: BRAND.teal,
                },
            ]}
        />

    </View>

</View>


            <View
                style={[
                    styles.divider,
                    {
                        backgroundColor:border
                    }
                ]}
            />



            <View style={styles.stats}>

                <TodayMini
                    icon="truck"
                    label="Active"
                    value="12"
                />


                <TodayMini
                    icon="gas-station"
                    label="Fuel"
                    value="$850"
                />


                <TodayMini
                    icon="map-marker-distance"
                    label="Distance"
                    value="2450 km"
                />


                <TodayMini
                    icon="chart-line"
                    label="Profit"
                    value="$2900"
                />

            </View>

<View
    style={[
        styles.footer,
        {
            borderTopColor: border,
        },
    ]}
>

    <Ionicons
        name="information-circle-outline"
        size={wp(4)}
        color={BRAND.info}
    />

    <ThemedText style={styles.footerText}>
        12 trucks are active with 18 completed trips today.
    </ThemedText>

</View>
        </View>
    );
};



const TodayMini = ({
    icon,
    label,
    value,
}: {
    icon: string;
    label: string;
    value: string;
}) => {

    return (

        <View style={styles.miniContainer}>


            <View
                style={styles.miniIcon}
            >

                <MaterialCommunityIcons
                    name={icon as any}
                    size={wp(4)}
                    color={BRAND.teal}
                />

            </View>


            <View>

                <ThemedText style={styles.miniValue}>
                    {value}
                </ThemedText>


                <ThemedText style={styles.miniLabel}>
                    {label}
                </ThemedText>

            </View>


        </View>

    );
};



export default TodayCard;



const styles = StyleSheet.create({

    card:{
        borderWidth:1,
        borderRadius:20,
        padding:wp(4),
        marginBottom:hp(2),
    },


    header:{
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
    },


    title:{
        fontSize:wp(5),
        fontWeight:'700',
    },


    subtitle:{
        fontSize:wp(3.2),
        opacity:0.6,
        marginTop:3,
    },


    iconBox:{
        width:wp(11),
        height:wp(11),
        borderRadius:wp(3),
        justifyContent:'center',
        alignItems:'center',
    },


    mainRow:{
        flexDirection:'row',
        justifyContent:'space-between',
        marginTop:hp(2.5),
    },


    amount:{
        fontSize:wp(7),
        fontWeight:'800',
    },


    label:{
        fontSize:wp(3),
        opacity:0.6,
    },


    divider:{
        height:1,
        marginVertical:hp(2),
    },


    stats:{
        flexDirection:'row',
        flexWrap:'wrap',
    },


    miniContainer:{
        width:'50%',
        flexDirection:'row',
        alignItems:'center',
        marginBottom:hp(1.5),
    },


    miniIcon:{
        width:wp(8),
        height:wp(8),
        borderRadius:wp(2),
        backgroundColor:`${BRAND.teal}1A`,
        justifyContent:'center',
        alignItems:'center',
        marginRight:wp(2),
    },


    miniValue:{
        fontSize:wp(3.8),
        fontWeight:'700',
    },


    miniLabel:{
        fontSize:wp(3),
        opacity:0.6,
    },headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
},

statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.5),
    marginRight: wp(2),
},

statusDot: {
    width: wp(2),
    height: wp(2),
    borderRadius: wp(1),
    marginRight: wp(1.2),
},

statusText: {
    fontSize: wp(3),
    fontWeight: '700',
},

progressSection: {
    marginBottom: hp(2),
},

progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(0.8),
},

progressLabel: {
    fontSize: wp(3),
    opacity: 0.7,
},

progressPercent: {
    fontSize: wp(3),
    fontWeight: '700',
},

progressBackground: {
    height: hp(0.8),
    borderRadius: 20,
    overflow: 'hidden',
},

progressFill: {
    height: '100%',
    borderRadius: 20,
},

footer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: hp(1.5),
    marginTop: hp(0.5),
},

footerText: {
    flex: 1,
    marginLeft: wp(2),
    fontSize: wp(3),
    opacity: 0.7,
},


});