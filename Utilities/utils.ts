

import * as ImagePicker from 'expo-image-picker';
import type { ImagePickerAsset } from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as DocumentPicker from 'expo-document-picker';
import { DocumentAsset } from '@/types/types';
import * as Location from 'expo-location';

/**
 * Fixes Firebase Storage URL encoding issues
 * Firebase Storage URLs need proper URL encoding for the path part
 * @param url - The Firebase Storage URL to fix
 * @returns The properly encoded URL
 */
export function fixFirebaseUrl(url: string): string {
  if (!url) return url;

  // Check if it's a Firebase Storage URL
  if (url.includes('firebasestorage.googleapis.com')) {
    // Extract the path part and encode it properly
    const urlParts = url.split('/o/');
    if (urlParts.length === 2) {
      const [baseUrl, pathAndQuery] = urlParts;
      const [path, query] = pathAndQuery.split('?');

      // URL encode the path part (replace / with %2F)
      const encodedPath = encodeURIComponent(path);

      // Reconstruct the URL
      return `${baseUrl}/o/${encodedPath}${query ? `?${query}` : ''}`;
    }
  }

  return url;
}

// Reusable function to toggle local country
export function toggleLocalCountry(
  count: string,
  setLocaOpLoc: React.Dispatch<React.SetStateAction<string>>,
  setIntOpLoc: React.Dispatch<React.SetStateAction<string[]>>,
): void {
  setIntOpLoc([]); // Clear international country selections
  setLocaOpLoc(count); // Set local country
}

// Reusable function to toggle international country
export function toggleInternationalCountry(
  country: string,
  setLocaOpLoc: React.Dispatch<React.SetStateAction<string>>,
  setIntOpLoc: React.Dispatch<React.SetStateAction<string[]>>
): void {
  setLocaOpLoc(''); // Clear local country
  setIntOpLoc((prev) => {
    if (prev.includes(country)) {
      return prev.filter(item => item !== country); // Remove if already selected
    } else {
      return [...prev, country]; // Add if not selected
    }
  });
}



// Reusable Way to select many images and put them in an array
// But it will select one by one not many at once 
type ImageAsset = {
  uri: string;
  fileSize?: number;
  [key: string]: any; // in case you're using additional properties
};


export const selectManyImages = async (
  setImages: React.Dispatch<React.SetStateAction<ImagePickerAsset[]>>,
  enableEditing: boolean = false,
  maxImages: number = 6,
  currentCount: number = 0
) => {
  // No permission check - uses Android Photo Picker automatically
  const pickerResult = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: enableEditing,
    allowsMultipleSelection: true,
    aspect: [1, 1],
    quality: 0.5, // Reduced quality to help with file size
  });

  if (pickerResult.canceled || !pickerResult.assets?.length) {
    return;
  }

  // Check if adding these images would exceed the maximum
  if (currentCount + pickerResult.assets!.length > maxImages) {
    alert(`Maximum ${maxImages} images allowed. You can add ${maxImages - currentCount} more images.`);
    return;
  }

  const validAssets: ImagePickerAsset[] = [];
  let skippedTooLarge = false;

  for (const asset of pickerResult.assets) {
    if (!asset.uri) continue;

    let fileSize = asset.fileSize;

    if (fileSize === undefined) {
      const fileInfo = await FileSystem.getInfoAsync(asset.uri);
      if (fileInfo.exists && fileInfo.size) {
        fileSize = fileInfo.size;
      } else {
        continue; // skip assets we cannot read
      }
    }

    if (fileSize > 2 * 1024 * 1024) {
      skippedTooLarge = true;
      continue; // skip large images
    }

    validAssets.push(asset);
  }

  if (skippedTooLarge) {
    alert('Some images were skipped because they exceed 2MB, add quality screenshot or resize');
  }

  if (validAssets.length > 0) {
    setImages(prevImages => [...prevImages, ...validAssets]);
  }
};





export const pickDocument = async (
  setDocuments: React.Dispatch<React.SetStateAction<DocumentAsset[]>>,
  setMakeType: React.Dispatch<React.SetStateAction<('pdf' | 'image' | 'doc' | 'docx')[]>>,
  maxFiles: number = 6,
  currentCount: number = 0
) => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      copyToCacheDirectory: true,
      multiple: true,
    });

    if (result.canceled) return;

    const assets = result.assets;
    if (!assets || assets.length === 0) {
      alert('No file selected.');
      return;
    }

    // Check if adding these files would exceed the maximum
    if (currentCount + assets.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed. You can add ${maxFiles - currentCount} more files.`);
      return;
    }

    const validFiles: DocumentAsset[] = [];
    const validTypes: ('pdf' | 'image' | 'doc' | 'docx')[] = [];

    for (const selectedFile of assets) {
      if (!selectedFile.uri) {
        alert('Selected document URI is undefined.');
        continue;
      }

      if (selectedFile.size !== undefined && selectedFile.size > 2 * 1024 * 1024) {
        alert(`File ${selectedFile.name} is too large. Maximum size is 2MB.`);
        continue;
      }

      const mimeType = selectedFile.mimeType || '';
      const fileName = selectedFile.name || '';
      let type: 'pdf' | 'image' | 'doc' | 'docx';

      if (mimeType.startsWith('image/')) {
        type = 'image';
      } else if (mimeType === 'application/pdf') {
        type = 'pdf';
      } else if (mimeType === 'application/msword' || fileName.toLowerCase().endsWith('.doc')) {
        type = 'doc';
      } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileName.toLowerCase().endsWith('.docx')) {
        type = 'docx';
      } else {
        alert(`Unsupported file type: ${selectedFile.name}`);
        continue;
      }

      validFiles.push(selectedFile);
      validTypes.push(type);
    }

    if (validFiles.length > 0) {
      setDocuments((prevDocs) => [...prevDocs, ...validFiles]);
      setMakeType((prevTypes) => [...prevTypes, ...validTypes]);
    }

  } catch (error) {
    console.error('Error picking document:', error);
    alert('An error occurred while picking the document.');
  }
};

// Separate function for selecting only documents (PDF, Word)
export const pickDocumentsOnly = async (
  setDocuments: React.Dispatch<React.SetStateAction<DocumentAsset[]>>,
  setMakeType: React.Dispatch<React.SetStateAction<('pdf' | 'doc' | 'docx')[]>>,
  maxFiles: number = 6,
  currentCount: number = 0
) => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      copyToCacheDirectory: true,
      multiple: true,
    });

    if (result.canceled) return;

    const assets = result.assets;
    if (!assets || assets.length === 0) {
      alert('No file selected.');
      return;
    }

    // Check if adding these files would exceed the maximum
    if (currentCount + assets.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed. You can add ${maxFiles - currentCount} more files.`);
      return;
    }

    const validFiles: DocumentAsset[] = [];
    const validTypes: ('pdf' | 'doc' | 'docx')[] = [];

    for (const selectedFile of assets) {
      if (!selectedFile.uri) {
        alert('Selected document URI is undefined.');
        continue;
      }

      if (selectedFile.size !== undefined && selectedFile.size > 2 * 1024 * 1024) {
        alert(`File ${selectedFile.name} is too large. Maximum size is 2MB.`);
        continue;
      }

      const mimeType = selectedFile.mimeType || '';
      const fileName = selectedFile.name || '';
      let type: 'pdf' | 'doc' | 'docx';

      if (mimeType === 'application/pdf') {
        type = 'pdf';
      } else if (mimeType === 'application/msword' || fileName.toLowerCase().endsWith('.doc')) {
        type = 'doc';
      } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileName.toLowerCase().endsWith('.docx')) {
        type = 'docx';
      } else {
        alert(`Unsupported file type: ${selectedFile.name}`);
        continue;
      }

      validFiles.push(selectedFile);
      validTypes.push(type);
    }

    if (validFiles.length > 0) {
      setDocuments((prevDocs) => [...prevDocs, ...validFiles]);
      setMakeType((prevTypes) => [...prevTypes, ...validTypes]);
    }

  } catch (error) {
    console.error('Error picking document:', error);
    alert('An error occurred while picking the document.');
  }
};







// Handle Data change in a form in an nput element and set it to the corresponding variable
// utils/handleChange.ts
export function handleChange<T>(
  value: string | number | boolean,
  fieldName: keyof T,
  setFormData: React.Dispatch<React.SetStateAction<T>>
): void {
  setFormData((prevFormData) => ({
    ...prevFormData,
    [fieldName]: value,
  }));
}

// Type for the toggle state object
type ToggleState = { [id: string]: boolean };

// Reusable function to toggle the state of a specific item by its ID
export const toggleItemById = (
  itemId: string,
  setToggleState: React.Dispatch<React.SetStateAction<ToggleState>>
) => {
  setToggleState((prevState) => ({
    ...prevState,
    [itemId]: !prevState[itemId],
  }));
};


export const getCurrentLocation = async (
  // setCurrentLocation: React.Dispatch<React.SetStateAction<Location.LocationObject | null>>
) => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Permission to access location was denied');
      return null;
    }

    const location = await Location.getCurrentPositionAsync({});
    return location

  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
}
