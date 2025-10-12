import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { ImagePickerAsset } from 'expo-image-picker';

const MAX_FILE_SIZE_MB = 2; // Max file size in MB

// Helper to validate file size
const validateFileSize = async (asset: ImagePickerAsset, maxMB: number): Promise<boolean> => {
    let fileSize = asset.fileSize;
    if (fileSize === undefined) {
        const fileInfo = await FileSystem.getInfoAsync(asset.uri);
        if (fileInfo.exists && fileInfo.size) {
            fileSize = fileInfo.size;
        } else {
            return false;
        }
    }
    return fileSize <= maxMB * 1024 * 1024;
};

// Single image picker using Android Photo Picker (no permissions required)
export const selectImage = (callback: (image: ImagePickerAsset) => void) => {
    const showImagePicker = async () => {
        try {
            // Use launchImageLibraryAsync without requesting permissions
            // This will use Android Photo Picker on Android 13+ and fallback to gallery on older versions
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.5, // Reduced quality to help with file size
                // This is the key: we don't request permissions, letting the system handle it
                // Android 13+ will use the Photo Picker automatically
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                if (!(await validateFileSize(asset, MAX_FILE_SIZE_MB))) {
                    alert(`It's more than 2MB, add quality screenshot or resize`);
                    return;
                }
                callback(asset);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            alert('Error picking image');
        }
    };

    showImagePicker();
};

// Multiple images picker using Android Photo Picker (no permissions required)
export const selectMultipleImages = (callback: (images: ImagePickerAsset[]) => void) => {
    const showImagePicker = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                quality: 0.5, // Reduced quality to help with file size
                allowsMultipleSelection: true,
                // No permission requests - uses Android Photo Picker
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const validAssets: ImagePickerAsset[] = [];
                let skipped = false;

                for (const asset of result.assets) {
                    if (await validateFileSize(asset, MAX_FILE_SIZE_MB)) {
                        validAssets.push(asset);
                    } else {
                        skipped = true;
                    }
                }

                if (skipped) alert(`Some images were skipped because they exceed 2MB, add quality screenshot or resize`);
                if (validAssets.length > 0) callback(validAssets);
            }
        } catch (error) {
            console.error('Error picking images:', error);
            alert('Error picking images');
        }
    };

    showImagePicker();
};

// Camera picker (still needs camera permission, but no media library permission)
export const takePhoto = (callback: (image: ImagePickerAsset) => void) => {
    const showCamera = async () => {
        try {
            // Only request camera permission, not media library
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                alert('Camera permission is required to take photos.');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                if (!(await validateFileSize(asset, MAX_FILE_SIZE_MB))) {
                    alert(`It's more than 2MB, add quality screenshot or resize`);
                    return;
                }
                callback(asset);
            }
        } catch (error) {
            console.error('Error taking photo:', error);
            alert('Error taking photo');
        }
    };

    showCamera();
};

// Legacy function for backward compatibility - now uses photo picker
export const selectManyImages = async (
    setImages: React.Dispatch<React.SetStateAction<ImagePickerAsset[]>>,
    enableEditing: boolean,
    AddToStore?: boolean
) => {
    if (AddToStore) {
        // For multiple selection (AddToStore)
        selectMultipleImages((images) => {
            setImages(prevImages => [...prevImages, ...images]);
        });
    } else {
        // For single selection with editing
        selectImage((image) => {
            setImages(prevImages => [...prevImages, image]);
        });
    }
};


