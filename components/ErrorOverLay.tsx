import {View,Text ,TouchableOpacity }from "react-native"

export const ErrorOverlay = ({
  visible,
  title,
  errors,
  onClose,
}: {
  visible: boolean;
  title: string;
  errors: string[];
  onClose: () => void;
}) => {
  if (!visible) return null;

  return (
    <View
      style={{
        position: 'absolute',
        left: 50,
        right: 50,
        height: 500,
        top: 100,
        backgroundColor: 'white',
        zIndex: 300,
        padding: 20,
      }}
    >
      <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>{title}</Text>
      {errors.map((err, idx) => (
        <Text key={idx} style={{ color: 'red' }}>
          {err}
        </Text>
      ))}

      <TouchableOpacity
        onPress={onClose}
        style={{
          marginTop: 15,
          alignSelf: 'center',
          backgroundColor: 'green',
          padding: 5,
          borderRadius: 5,
        }}
      >
        <Text style={{ color: 'white' }}>Understood</Text>
      </TouchableOpacity>
    </View>
  );
};