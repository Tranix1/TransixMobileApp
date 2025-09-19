import * as ImagePicker from 'expo-image-picker';
import { ImagePickerAsset } from 'expo-image-picker';

export const selectImage = (callback: (image: ImagePickerAsset) => void) => {
    const showImagePicker = async () => {
        try {
            // Request permission
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (permissionResult.granted === false) {
                alert('Permission to access camera roll is required!');
                return;
            }

            // Launch image picker
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                callback(result.assets[0]);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            alert('Error picking image');
        }
    };

    showImagePicker();
};

export const selectMultipleImages = (callback: (images: ImagePickerAsset[]) => void) => {
    const showImagePicker = async () => {
        try {
            // Request permission
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (permissionResult.granted === false) {
                alert('Permission to access camera roll is required!');
                return;
            }

            // Launch image picker
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                quality: 0.8,
                allowsMultipleSelection: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                callback(result.assets);
            }
        } catch (error) {
            console.error('Error picking images:', error);
            alert('Error picking images');
        }
    };

    showImagePicker();
};

export const takePhoto = (callback: (image: ImagePickerAsset) => void) => {
    const showCamera = async () => {
        try {
            // Request permission
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

            if (permissionResult.granted === false) {
                alert('Permission to access camera is required!');
                return;
            }

            // Launch camera
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                callback(result.assets[0]);
            }
        } catch (error) {
            console.error('Error taking photo:', error);
            alert('Error taking photo');
        }
    };

    showCamera();
};
