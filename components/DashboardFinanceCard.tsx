import React from 'react';
import { View, StyleSheet } from 'react-native';

import {
    Ionicons
} from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { BRAND } from '@/constants/Colors';
import { wp , hp } from '@/constants/common';


type FinanceCardProps = {
    background: string;
    border: string;
    textlight: string;
};


const FinanceCard = ({
    background,
    border,
    textlight,
}: FinanceCardProps) => {


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

                    <ThemedText
                        style={styles.title}
                    >
                        Finance Overview
                    </ThemedText>


                    <ThemedText type="tiny">
                        Fleet financial performance
                    </ThemedText>

                </View>


                <View
                    style={[
                        styles.iconBox,
                        {
                            backgroundColor:`${BRAND.good}1A`
                        }
                    ]}
                >

                    <Ionicons
                        name="wallet-outline"
                        size={wp(5)}
                        color={BRAND.good}
                    />

                </View>


            </View>




            {/* PROFIT */}
            <View style={styles.profitRow}>


                <View>

                    <ThemedText type="tiny">
                        Net Profit
                    </ThemedText>


                    <ThemedText
                        style={[
                            styles.profit,
                            {
                                color:BRAND.good
                            }
                        ]}
                    >
                        $184,320
                    </ThemedText>


                </View>



                <View
                    style={[
                        styles.trend,
                        {
                            backgroundColor:`${BRAND.good}1A`
                        }
                    ]}
                >

                    <Ionicons
                        name="trending-up"
                        size={wp(3.5)}
                        color={BRAND.good}
                    />

                    <ThemedText
                        style={{
                            color:BRAND.good,
                            marginLeft:wp(1),
                            fontWeight:'700'
                        }}
                    >
                        12.4%
                    </ThemedText>


                </View>


            </View>





            {/* SUMMARY */}
            <View style={styles.grid}>


                <FinanceItem
                    title="Revenue"
                    value="$412,900"
                    icon="cash-outline"
                    color={BRAND.good}
                />


                <FinanceItem
                    title="Expenses"
                    value="$228,580"
                    icon="remove-circle-outline"
                    color={BRAND.good}
                />


                <FinanceItem
                    title="Pending"
                    value="$18,240"
                    icon="time-outline"
                    color={BRAND.amber}
                />


            </View>





            {/* TODAY */}
            <View
                style={[
                    styles.daily,
                    {
                        borderColor:border
                    }
                ]}
            >

                <ThemedText style={styles.dailyTitle}>
                    Today's Activity
                </ThemedText>


                <FinanceRow
                    icon="car-outline"
                    title="Fuel"
                    value="$850"
                />


                <FinanceRow
                    icon="person-outline"
                    title="Driver payouts"
                    value="$1,250"
                />


                <FinanceRow
                    icon="construct-outline"
                    title="Maintenance"
                    value="$320"
                />


                <FinanceRow
                    icon="checkmark-circle-outline"
                    title="Payments received"
                    value="$4,600"
                />


            </View>




            {/* PERFORMANCE */}
            <View style={styles.performance}>


                <FinanceStat
                    title="Cost/KM"
                    value="$0.42"
                />


                <FinanceStat
                    title="Revenue Truck"
                    value="$3,220"
                />


                <FinanceStat
                    title="Margin"
                    value="44%"
                />


            </View>


        </View>

    );

};





const FinanceItem = ({
    icon,
    title,
    value,
    color
}:any)=>(
    <View style={styles.financeItem}>

        <Ionicons
            name={icon}
            size={wp(4)}
            color={color}
        />


        <ThemedText type="tiny">
            {title}
        </ThemedText>


        <ThemedText style={styles.value}>
            {value}
        </ThemedText>


    </View>
);





const FinanceRow = ({
    icon,
    title,
    value
}:any)=>(
<View style={styles.row}>


    <View style={styles.rowLeft}>

        <Ionicons
            name={icon}
            size={wp(4)}
            color={BRAND.teal}
        />


        <ThemedText>
            {title}
        </ThemedText>


    </View>


    <ThemedText style={{fontWeight:'700'}}>
        {value}
    </ThemedText>


</View>
);





const FinanceStat = ({
    title,
    value
}:any)=>(
<View>

    <ThemedText type="tiny">
        {title}
    </ThemedText>


    <ThemedText style={styles.statValue}>
        {value}
    </ThemedText>

</View>
);





export default FinanceCard;





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


profitRow:{
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    marginTop:hp(2)
},


profit:{
    fontSize:wp(7),
    fontWeight:'800'
},


trend:{
    flexDirection:'row',
    paddingHorizontal:wp(2),
    paddingVertical:hp(.5),
    borderRadius:20
},


grid:{
    flexDirection:'row',
    justifyContent:'space-between',
    marginTop:hp(2)
},


financeItem:{
    flex:1,
    gap:4
},


value:{
    fontWeight:'700'
},


daily:{
    marginTop:hp(2),
    paddingTop:hp(2),
    borderTopWidth:1
},


dailyTitle:{
    fontWeight:'700',
    marginBottom:hp(1)
},


row:{
    flexDirection:'row',
    justifyContent:'space-between',
    marginBottom:hp(1.2)
},


rowLeft:{
    flexDirection:'row',
    alignItems:'center',
    gap:wp(2)
},


performance:{
    flexDirection:'row',
    justifyContent:'space-between',
    marginTop:hp(2)
},


statValue:{
    fontWeight:'800',
    fontSize:wp(4)
}

});