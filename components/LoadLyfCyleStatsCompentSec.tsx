import { Ionicons } from "@expo/vector-icons";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "./ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";

type StatRowProps = {
    title: string;
    value: number | string;
    icon: keyof typeof Ionicons.glyphMap;


};

export const LoadLyfCyleStatsCompentSec = ({
    title,
    value,
    icon,
    
}: StatRowProps) => {

    const accent = useThemeColor("accent")
    const iconColor = useThemeColor("icon")
    const textColor = useThemeColor("text")

    return (
        <View style={styles.container}>

            <View style={styles.leftSection}>

                <View
                    style={[
                        styles.iconBox,
                        {
                            backgroundColor: `${accent}20`
                        }
                    ]}
                >
                    <Ionicons
                        name={icon}
                        size={18}
                        color={iconColor ?? accent}
                    />
                </View>


                <ThemedText
                    style={[
                        styles.title,
                        { color:textColor }
                    ]}
                    numberOfLines={1}
                >
                    {title}
                </ThemedText>

            </View>



            <ThemedText
                style={[
                    styles.value,
                    {
                        color:accent
                    }
                ]}
            >
                {value}
            </ThemedText>


        </View>
    );
};


const styles = StyleSheet.create({

    container:{
        flexDirection:"row",
        alignItems:"center",
        justifyContent:"space-between",

        paddingVertical:9,
    },


    leftSection:{
        flexDirection:"row",
        alignItems:"center",

        flex:1,
    },


    iconBox:{
        width:32,
        height:32,

        borderRadius:10,

        alignItems:"center",
        justifyContent:"center",

        marginRight:10,
    },


    title:{
        fontSize:14,

        flexShrink:1,
    },


    value:{
        fontSize:16,
        fontWeight:"800",

        marginLeft:10,

        minWidth:45,

        textAlign:"right",
    },

});