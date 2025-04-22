      import { TouchableOpacity,StyleSheet } from "react-native";
      import { ThemedText } from "./ThemedText";
      
  // This is the button to choose a country 
  type SlctCountryBtnProps = {
    selectedLoc: string;
    onPress: () => void;
    isSelected?: boolean;
  };


   export   const SlctCountryBtn = ({ selectedLoc, onPress, isSelected }: SlctCountryBtnProps) => (
    <TouchableOpacity
    onPress={onPress}
      style={[
        styles.buttonStyle,
        { backgroundColor: isSelected ? '#6a0c0c' : '#eee' },
      ]}
    >
      <ThemedText style={{ color: isSelected ? 'white' : '#6a0c0c' }}>{selectedLoc}</ThemedText>
    </TouchableOpacity>
  );
const styles = StyleSheet.create({
  buttonStyle: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    width: 150,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "#6a0c0c",
    borderRadius: 10,
    alignSelf:"center"
  },
})