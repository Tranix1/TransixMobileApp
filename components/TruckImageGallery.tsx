import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { wp } from '@/constants/common';
import { EditableImage } from './EditableImage';
import { ImageEditState } from '@/Utilities/imageEditingUtils';

interface ImageItem {
    field: string;
    uri: string;
    label: string;
}

interface TruckImageGalleryProps {
    images: ImageItem[];
    category: string;
    isOwner: boolean;
    imageEditState: ImageEditState;
    onImagePress: (field: string) => void;
    onEditPress: (field: string) => void;
    onConfirmEdit: () => void;
    onCancelEdit: () => void;
    onImageIndexChange: (index: number) => void;
}

export const TruckImageGallery: React.FC<TruckImageGalleryProps> = ({
    images,
    category,
    isOwner,
    imageEditState,
    onImagePress,
    onEditPress,
    onConfirmEdit,
    onCancelEdit,
    onImageIndexChange
}) => {
    const accent = useThemeColor('accent');

    if (images.length === 0) {
        return null;
    }

    return (
        <View>
            <ThemedText style={{
                textAlign: 'center',
                marginVertical: wp(4),
                color: "#1E90FF"
            }}>
                {category} Details
            </ThemedText>

            <ScrollView
                pagingEnabled
                horizontal
                style={{ marginVertical: 10 }}
                showsHorizontalScrollIndicator={false}
            >
                {images.map((item, index) => (
                    <EditableImage
                        key={item.field}
                        imageUri={item.uri}
                        field={item.field}
                        label={item.label}
                        isOwner={isOwner}
                        imageEditState={imageEditState}
                        onImagePress={() => {
                            onImageIndexChange(index);
                            onImagePress(item.field);
                        }}
                        onEditPress={onEditPress}
                        onConfirmEdit={onConfirmEdit}
                        onCancelEdit={onCancelEdit}
                        style={{ marginRight: wp(2) }}
                    />
                ))}
            </ScrollView>
        </View>
    );
};
