import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
// Define the shape of the image object (adjust based on your actual data structure)
import { ImagePickerAsset } from 'expo-image-picker'; // Import the correct type
interface UploadedImage {
  uri: string;
}

interface ImageUploadCardProps {
//   image: UploadedImage | null;
  image: ImagePickerAsset | null;
//   setImage: (image: UploadedImage | null) => void;
  setImage: React.Dispatch<React.SetStateAction<ImagePickerAsset | null>>;
//   selectImage: (callback: (image: UploadedImage) => void) => void;
  selectImage: (callback: (image: ImagePickerAsset) => void) => void;
  label: string;
  successMessage: string;
    }

const ImageUploadCard: React.FC<ImageUploadCardProps> = ({ 
  image, 
  setImage, 
  selectImage, 
  label, 
  successMessage, 
}) => {
      const background = useThemeColor('background');
        const icon = useThemeColor('icon');
const borderColor = `${icon}4c`;

  return (
    <View style={[styles.card, { borderColor :icon + "4c" , backgroundColor:background }]}>
      {image ? (
        <>
          <Image source={{ uri: image.uri }} style={styles.image} />
          <TouchableOpacity 
            onPress={() => setImage(null)} 
            style={styles.closeButton}
          >
            <Ionicons name="close-circle" size={20} color="red" />
          </TouchableOpacity>
          <ThemedText style={styles.successText} color={icon}>
            {successMessage}
          </ThemedText>
        </>
      ) : (
        <>
          <ThemedText style={styles.label}>{label}</ThemedText>
          <TouchableOpacity 
            onPress={() => selectImage((img) => setImage(img))} 
            style={styles.uploadButton}
          >
            <Ionicons name="camera" size={40} color={borderColor} />
            <ThemedText style={styles.buttonText} color={borderColor}>
              Take Photo<ThemedText color="red">*</ThemedText>
            </ThemedText>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 0.9,
    borderRadius: 10,
    padding: 5,
    width: 146,
    marginRight: 6,
    elevation: 13,
    // Add shadow props here as needed
  },
  image: { width: "100%", height: 100, borderRadius: 10 },
  closeButton: { position: 'absolute', top: -5, right: -5, backgroundColor: 'white', borderRadius: 10 },
  uploadButton: { height: 100, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  label: { fontSize: 14.5, textAlign: "center", marginBottom: 5 },
  successText: { fontSize: 10, textAlign: 'center', marginTop: 5 },
  buttonText: { fontSize: 13.5, fontWeight: "bold" }
});

export default ImageUploadCard;