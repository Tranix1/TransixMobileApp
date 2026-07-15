import React from 'react';
import {
    TouchableOpacity,
    View,
    StyleSheet,
} from 'react-native';


import { ThemedText } from '@/components/ThemedText';
import { hp, wp } from '@/constants/common';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Props = {
    title: string;
    subtitle: string;
    value: string;

    icon: keyof typeof MaterialCommunityIcons.glyphMap;

    color: string;

    background: string;
    border: string;
    textlight: string;

    onPress: () => void;
};


const MyActivityCard = ({
    title,
    subtitle,
    value,
    icon,
    color,
    background,
    border,
    textlight,
    onPress,
}: Props) => {


    return (

        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}

            style={[
                styles.card,
                {
                    backgroundColor: background,
                    borderColor: border,
                },
            ]}
        >


            <View style={styles.left}>


                <View
                    style={[
                        styles.iconBox,
                        {
                            backgroundColor:`${color}18`
                        }
                    ]}
                >

                   <MaterialCommunityIcons
    name={icon}
    size={wp(4)}
    color={color}
/>

                </View>



                <View style={{flex:1}}>

                    <ThemedText style={styles.title}>
                        {title}
                    </ThemedText>


                    <ThemedText
                        type="tiny"
                        style={{
                            color:textlight
                        }}
                        numberOfLines={1}
                    >
                        {subtitle}
                    </ThemedText>


                </View>


            </View>




            <View style={styles.right}>


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


               <MaterialCommunityIcons
    name={icon}
    size={wp(4)}
    color={color}
/>


            </View>



        </TouchableOpacity>

    );
};



export default MyActivityCard;



const styles = StyleSheet.create({


    card:{
        borderWidth:1,
        borderRadius:14,

        paddingVertical:hp(1),
        paddingHorizontal:wp(3),

        marginBottom:hp(.7),

        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
    },


    left:{
        flexDirection:'row',
        alignItems:'center',
        flex:1,
    },


    iconBox:{
        width:wp(8),
        height:wp(8),

        borderRadius:wp(2.5),

        justifyContent:'center',
        alignItems:'center',

        marginRight:wp(2.2),
    },


    title:{
        fontSize:wp(3.5),
        fontWeight:'700',
    },


    right:{
        flexDirection:'row',
        alignItems:'center',
        gap:wp(1.5),
    },


    value:{
        fontSize:wp(3.8),
        fontWeight:'800',
    },


});