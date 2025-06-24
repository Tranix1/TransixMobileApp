
import { Dropdown } from "react-native-element-dropdown";
import { View, StyleSheet } from "react-native";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { hp, wp } from "@/constants/common";
import { ThemedText } from "./ThemedText";

import { useThemeColor } from '@/hooks/useThemeColor'
interface DropDownItemProps {
  allData: object[];
  selectedItem: any;
  setSelectedItem: any;
  placeholder: string
}

const icon = useThemeColor('icon')
const background = useThemeColor('backgroundLight')
const backG = useThemeColor('background')
export const DropDownItem: React.FC<DropDownItemProps> = ({ allData, selectedItem, setSelectedItem, placeholder }) => (
  <View  >
    <Dropdown
      style={[styles.dropdown,]}
      selectedTextStyle={[styles.selectedTextStyle, { color: icon }]}
      data={allData}
      maxHeight={hp(60)}
      labelField="name"
      valueField="name"
      placeholderStyle={{ color: icon + 'a1' }}
      itemTextStyle={{ color: icon }}
      placeholder={placeholder}
      value={selectedItem?.name}
      itemContainerStyle={{ borderRadius: wp(2), marginHorizontal: wp(1) }}
      activeColor={backG}
      containerStyle={{
        borderRadius: wp(3), backgroundColor: background, borderWidth: 0, shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 9,
        },
        shadowOpacity: 0.50,
        shadowRadius: 12.35,

        elevation: 19,
        paddingVertical: wp(1)
      }}
      onChange={item => {
        console.log(item);
        setSelectedItem(item);
      }}

      renderLeftIcon={() => <></>}
      renderRightIcon={() => <Entypo name="chevron-thin-down" size={wp(4)} color={icon} />}
      renderItem={((item) =>
        <View style={[styles.item, item.Id === selectedItem?.id && {}]}>
          <ThemedText style={[{ textAlign: 'left', flex: 1 }, item.id === selectedItem?.id && { color: '#0f9d58' }]}>{item.name}</ThemedText>
          {item.id === selectedItem?.id && (
            <Ionicons
              color={icon}
              name='checkmark-outline'
              size={wp(5)}
            />
          )}
        </View>
      )}

    />
  </View>
);
const styles = StyleSheet.create({
  dropdown: {
    padding: wp(3),
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: wp(4),
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  item: {
    padding: 17,
    gap: wp(2),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: wp(1),
    marginBottom: 5
  },
  selectedTextStyle: {
    fontSize: 16,
  },
});