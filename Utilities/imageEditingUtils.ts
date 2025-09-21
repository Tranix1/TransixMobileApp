import { ImagePickerAsset } from 'expo-image-picker';
import { uploadImage } from '@/db/operations';
import { DocumentAsset } from '@/types/types';

export interface ImageEditState {
    isEditing: boolean;
    currentImageField: string | null;
    newImage: ImagePickerAsset | null;
    isUploading: boolean;
    uploadProgress: string;
}

export const getDefaultImageEditState = (): ImageEditState => ({
    isEditing: false,
    currentImageField: null,
    newImage: null,
    isUploading: false,
    uploadProgress: ""
});

export const handleImageSelection = async (
    imageField: string,
    setImageEditState: React.Dispatch<React.SetStateAction<ImageEditState>>,
    selectImage: (callback: (image: ImagePickerAsset) => void) => void
) => {
    setImageEditState(prev => ({
        ...prev,
        isEditing: true,
        currentImageField: imageField,
        newImage: null,
        isUploading: false,
        uploadProgress: ""
    }));

    selectImage((image: ImagePickerAsset) => {
        setImageEditState(prev => ({
            ...prev,
            newImage: image
        }));
    });
};

export const handleImageUpload = async (
    imageField: string,
    newImage: ImagePickerAsset,
    setImageEditState: React.Dispatch<React.SetStateAction<ImageEditState>>,
    onImageUpdate: (field: string, newUrl: string) => void,
    onError: (error: string) => void
) => {
    try {
        setImageEditState(prev => ({
            ...prev,
            isUploading: true,
            uploadProgress: "Uploading image..."
        }));

        const imageUrl = await uploadImage(
            newImage,
            "TruckImages",
            (progress) => {
                setImageEditState(prev => ({
                    ...prev,
                    uploadProgress: `Uploading... ${progress}%`
                }));
            },
            `${imageField}_${Date.now()}`
        );

        if (imageUrl) {
            onImageUpdate(imageField, imageUrl);
            setImageEditState(prev => ({
                ...prev,
                isEditing: false,
                currentImageField: null,
                newImage: null,
                isUploading: false,
                uploadProgress: ""
            }));
        } else {
            throw new Error('Failed to upload image');
        }
    } catch (error) {
        console.error('Image upload error:', error);
        onError(error instanceof Error ? error.message : 'Failed to upload image');
        setImageEditState(prev => ({
            ...prev,
            isUploading: false,
            uploadProgress: ""
        }));
    }
};

export const cancelImageEdit = (
    setImageEditState: React.Dispatch<React.SetStateAction<ImageEditState>>
) => {
    setImageEditState(getDefaultImageEditState());
};

export const getImageFieldLabel = (field: string): string => {
    const labels: { [key: string]: string } = {
        truckBookImage: 'Truck Book Image',
        trailerBookF: 'Trailer Book (Front)',
        trailerBookSc: 'Trailer Book (Second)',
        driverLicense: 'Driver License',
        driverPassport: 'Driver Passport',
        driverIntPermit: 'Driver International Permit',
        gitImage: 'GIT Image',
        truckNumberPlate: 'Truck Number Plate',
        truckThirdPlate: 'Truck Third Plate'
    };
    return labels[field] || field;
};

export const getImageFieldCategory = (field: string): string => {
    const truckDetailFields = ['truckBookImage', 'trailerBookF', 'trailerBookSc'];
    const driverDetailFields = ['driverLicense', 'driverPassport', 'driverIntPermit'];
    const additionalFields = ['gitImage', 'truckNumberPlate', 'truckThirdPlate'];

    if (truckDetailFields.includes(field)) return 'truck';
    if (driverDetailFields.includes(field)) return 'driver';
    if (additionalFields.includes(field)) return 'additional';
    return 'other';
};

export const organizeImagesByCategory = (truckData: any) => {
    const categories = {
        truck: [] as { field: string; uri: string; label: string }[],
        driver: [] as { field: string; uri: string; label: string }[],
        additional: [] as { field: string; uri: string; label: string }[]
    };

    Object.entries(truckData).forEach(([key, value]) => {
        if (typeof value === 'string' && (value.startsWith('http') || value.startsWith('file://') || value.startsWith('content://'))) {
            const category = getImageFieldCategory(key);
            if (categories[category as keyof typeof categories]) {
                categories[category as keyof typeof categories].push({
                    field: key,
                    uri: value,
                    label: getImageFieldLabel(key)
                });
            }
        }
    });

    return categories;
};
