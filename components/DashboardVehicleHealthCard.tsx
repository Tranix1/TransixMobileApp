import React from 'react';
import { View, StyleSheet } from 'react-native';

import {
    Ionicons
} from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { BRAND } from '@/constants/Colors';

import { hp, wp } from '@/constants/common';

type VehicleHealthCardProps = {
    background: string;
    border: string;
};


const VehicleHealthCard = ({
    background,
    border,
}: VehicleHealthCardProps) => {


    return (

        <View
            style={[
                styles.card,
                {
                    backgroundColor: background,
                    borderColor: border
                }
            ]}
        >


            {/* HEADER */}
            <View style={styles.header}>

                <View>

                    <ThemedText style={styles.title}>
                        Vehicle Health
                    </ThemedText>


                    <ThemedText type="tiny">
                        Fleet condition overview
                    </ThemedText>

                </View>


                <View
                    style={[
                        styles.iconBox,
                        {
                            backgroundColor:`${BRAND.teal}1A`
                        }
                    ]}
                >

                    <Ionicons
                        name="fitness-outline"
                        size={wp(5)}
                        color={BRAND.teal}
                    />

                </View>

            </View>




            {/* HEALTH SUMMARY */}
            <View style={styles.healthContainer}>


                <HealthStatus
                    icon="checkmark-circle"
                    label="Good"
                    value="118"
                    color={BRAND.good}
                />


                <HealthStatus
                    icon="warning"
                    label="Service Due"
                    value="7"
                    color={BRAND.amber}
                />


                <HealthStatus
                    icon="close-circle"
                    label="Problems"
                    value="3"
                    color={BRAND.bad}
                />


            </View>




            {/* FOOTER */}
            <View
                style={[
                    styles.footer,
                    {
                        borderColor:border
                    }
                ]}
            >

                <ThemedText type="tiny">
                    Total Vehicles Checked
                </ThemedText>


                <ThemedText style={styles.total}>
                    128 Vehicles
                </ThemedText>


            </View>


        </View>

    );

};





const HealthStatus = ({
    icon,
    label,
    value,
    color
}:any)=> (

    <View style={styles.status}>


        <Ionicons
            name={icon}
            size={wp(5)}
            color={color}
        />


        <ThemedText
            style={[
                styles.value,
                {
                    color
                }
            ]}
        >
            {value}
        </ThemedText>


        <ThemedText type="tiny">
            {label}
        </ThemedText>


    </View>

);





export default VehicleHealthCard;





const styles = StyleSheet.create({

card:{
    borderWidth:1,
    borderRadius:20,
    padding:wp(4),
},


header:{
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center'
},


title:{
    fontSize:wp(4.5),
    fontWeight:'700'
},


iconBox:{
    width:wp(11),
    height:wp(11),
    borderRadius:wp(3),
    justifyContent:'center',
    alignItems:'center'
},



healthContainer:{
    flexDirection:'row',
    justifyContent:'space-between',
    marginTop:hp(2.5)
},



status:{
    alignItems:'center',
    flex:1
},



value:{
    fontSize:wp(6),
    fontWeight:'800',
    marginTop:hp(.5)
},



footer:{
    borderTopWidth:1,
    marginTop:hp(2),
    paddingTop:hp(1.5),
    flexDirection:'row',
    justifyContent:'space-between'
},



total:{
    fontWeight:'700'
}


});