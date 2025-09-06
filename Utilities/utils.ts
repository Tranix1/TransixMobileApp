

import * as ImagePicker from 'expo-image-picker';
import type { ImagePickerAsset } from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { DocumentAsset } from '@/types/types';
import * as Location from 'expo-location';

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

  enableEditing : boolean  ,
  AddToStore?: boolean // new optional prop

) => {
  const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permissionResult.granted) {
    alert('Permission is required to select an image.');
    return;
  }

  const pickerResult = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: enableEditing ?true :false ,
    legacy: true,
     aspect: [1, 1],
    quality: .7,
    allowsMultipleSelection:AddToStore ? true: false ,
  });



  if (pickerResult.canceled || !pickerResult.assets?.length) {
    return;
  }

  const validAssets: ImageAsset[] = [];

  for (const asset of pickerResult.assets) {
    if (!asset.uri) continue;

    let fileSize = asset.fileSize;

    if (fileSize === undefined) {
      const fileInfo = await FileSystem.getInfoAsync(asset.uri);
      if (fileInfo.exists && fileInfo.size) {
        fileSize = fileInfo.size;
      } else {
        alert('Could not determine file size for one image. Skipping it.');
        continue;
      }
    }

    if (fileSize > 1.5 * 1024 * 1024) {
      alert('One of the selected images is larger than 1.5MB. It will be skipped.');
      continue;
    }

    validAssets.push(asset);
  }

  if (validAssets.length > 0) {
    setImages(prevImages => [...prevImages, ...validAssets] as ImagePicker.ImagePickerAsset[]);

  }
};




export const pickDocument = async (
  setDocuments: React.Dispatch<React.SetStateAction<DocumentAsset[]>>,
  setMakeType: React.Dispatch<React.SetStateAction<('pdf' | 'image')[]>>
) => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
    });

    if (result.canceled) return;

    const assets = result.assets;
    if (!assets || assets.length === 0) {
      alert('No file selected.');
      return;
    }

    const selectedFile = assets[0];

    if (!selectedFile.uri) {
      alert('Selected document URI is undefined.');
      return;
    }

    if (selectedFile.size !== undefined && selectedFile.size > 0.5 * 1024 * 1024) {
      alert('The selected document must not be more than 0.5MB.');
      return;
    }

    const mimeType = selectedFile.mimeType || '';
    let type: 'pdf' | 'image';

    if (mimeType.startsWith('image/')) {
      type = 'image';
    } else if (mimeType === 'application/pdf') {
      type = 'pdf';
    } else {
      alert('Unsupported file type selected.');
      return;
    }

    // Add to documents and types
    setDocuments((prevDocs) => [...prevDocs, selectedFile] as DocumentAsset[]);
    setMakeType((prevTypes) => [...prevTypes, type]);

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
