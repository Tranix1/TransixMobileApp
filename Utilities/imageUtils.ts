import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { ImagePickerAsset } from 'expo-image-picker';

const MAX_FILE_SIZE_MB = 1.5; // Max file size in MB

// Media library permission check removed - using Android Photo Picker instead

// Helper to check camera permission only when needed
const checkCameraPermission = async (): Promise<boolean> => {
  const { status, canAskAgain } = await ImagePicker.getCameraPermissionsAsync();
  if (status === 'granted') return true;
  if (!canAskAgain) {
    alert('Please enable camera permissions in your device settings.');
    return false;
  }
  const result = await ImagePicker.requestCameraPermissionsAsync();
  return result.granted;
};

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

export const selectImage = (callback: (image: ImagePickerAsset) => void) => {
  const showImagePicker = async () => {
    try {
      // No permission check - uses Android Photo Picker automatically
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (!(await validateFileSize(asset, MAX_FILE_SIZE_MB))) {
          alert(`Selected image exceeds ${MAX_FILE_SIZE_MB}MB. Please choose a smaller image.`);
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

export const selectMultipleImages = (callback: (images: ImagePickerAsset[]) => void) => {
  const showImagePicker = async () => {
    try {
      // No permission check - uses Android Photo Picker automatically
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        allowsMultipleSelection: true,
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

        if (skipped) alert(`Some images were skipped because they exceed ${MAX_FILE_SIZE_MB}MB.`);
        if (validAssets.length > 0) callback(validAssets);
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
      const granted = await checkCameraPermission();
      if (!granted) return;

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (!(await validateFileSize(asset, MAX_FILE_SIZE_MB))) {
          alert(`Captured image exceeds ${MAX_FILE_SIZE_MB}MB. Please take a smaller image.`);
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
