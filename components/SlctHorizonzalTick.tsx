import {TouchableOpacity ,StyleSheet,View} from "react-native"
import { hp,wp } from "@/constants/common";
import { ThemedText } from "./ThemedText";
import {   Ionicons } from "@expo/vector-icons";
import { useThemeColor } from '@/hooks/useThemeColor'
type HorizontalPickerTickProps = {
 data: any ;
  condition: string
  onSelect: any
};


export const HorizontalTickComponent: React.FC<HorizontalPickerTickProps> = ({
  data,
  condition,
  onSelect,
  
}) => {
        // Theme colors
    const iconColor = useThemeColor('icon');
    const accent = useThemeColor('accent');
return(

    <View style={styles.row}>

     {data.map((item:any ) => (
     
        <TouchableOpacity
                            style={[
                                styles.checkbox,
                                condition===item.value && styles.checkboxSelected
                            ]}
                            onPress={()=>onSelect(item.value) }
                        >
                            <Ionicons
                                name={condition===item.value ? "checkbox" : "square-outline"}
                                size={wp(4)}
                                color={condition===item.value ? accent : iconColor}
                            />
                            <ThemedText style={{ marginLeft: wp(1) }}>{item.topic} </ThemedText>
                        </TouchableOpacity>



      ))}



                        
                    </View>

)
 }

    const styles = StyleSheet.create({
  row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: hp(1),
    },
      checkbox: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: hp(1),
    },
    checkboxSelected: {
        // Add any selected styles if needed
    },
    }

    )