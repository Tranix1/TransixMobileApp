import React from 'react';
import { View, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from './ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';
import { wp } from '@/constants/common';
import { ImageEditState } from '@/Utilities/imageEditingUtils';

interface EditableImageProps {
    imageUri: string;
    field: string;
    label: string;
    isOwner: boolean;
    imageEditState: ImageEditState;
    onImagePress: (field: string) => void;
    onEditPress: (field: string) => void;
    onConfirmEdit: () => void;
    onCancelEdit: () => void;
    style?: any;
}

export const EditableImage: React.FC<EditableImageProps> = ({
    imageUri,
    field,
    label,
    isOwner,
    imageEditState,
    onImagePress,
    onEditPress,
    onConfirmEdit,
    onCancelEdit,
    style
}) => {
    const icon = useThemeColor('icon');
    const accent = useThemeColor('accent');
    const background = useThemeColor('background');
    const coolGray = useThemeColor('coolGray');

    const isCurrentlyEditing = imageEditState.isEditing && imageEditState.currentImageField === field;
    const hasNewImage = isCurrentlyEditing && imageEditState.newImage;
    const isUploading = imageEditState.isUploading && isCurrentlyEditing;

    const handlePress = () => {
        if (isCurrentlyEditing) {
            if (hasNewImage) {
                onConfirmEdit();
            } else {
                onEditPress(field);
            }
        } else {
            onImagePress(field);
        }
    };

    const handleLongPress = () => {
        if (isOwner && !isCurrentlyEditing) {
            Alert.alert(
                'Edit Image',
                `Do you want to replace the ${label.toLowerCase()}?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Replace', onPress: () => onEditPress(field) }
                ]
            );
        }
    };

    return (
        <View style={[{ position: 'relative' }, style]}>
            <TouchableOpacity
                onPress={handlePress}
                onLongPress={handleLongPress}
                activeOpacity={0.8}
                disabled={isUploading}
            >
                <Image
                    source={{
                        uri: hasNewImage ? imageEditState.newImage!.uri : imageUri
                    }}
                    style={{
                        height: wp(80),
                        borderRadius: 10,
                        width: wp(80),
                        margin: 5,
                        opacity: isUploading ? 0.7 : 1
                    }}
                    contentFit="cover"
                />

                {/* Overlay for editing state */}
                {isCurrentlyEditing && (
                    <View
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            borderRadius: 10,
                            justifyContent: 'center',
                            alignItems: 'center',
                            margin: 5
                        }}
                    >
                        {isUploading ? (
                            <View style={{ alignItems: 'center' }}>
                                <ActivityIndicator size="large" color={accent} />
                                <ThemedText style={{ color: 'white', marginTop: wp(2) }}>
                                    {imageEditState.uploadProgress}
                                </ThemedText>
                            </View>
                        ) : hasNewImage ? (
                            <View style={{ alignItems: 'center' }}>
                                <Ionicons name="checkmark-circle" size={wp(8)} color="#4CAF50" />
                                <ThemedText style={{ color: 'white', marginTop: wp(1) }}>
                                    Tap to confirm
                                </ThemedText>
                            </View>
                        ) : (
                            <View style={{ alignItems: 'center' }}>
                                <Ionicons name="camera" size={wp(6)} color="white" />
                                <ThemedText style={{ color: 'white', marginTop: wp(1) }}>
                                    Select new image
                                </ThemedText>
                            </View>
                        )}
                    </View>
                )}

                {/* Edit button for owners */}
                {isOwner && !isCurrentlyEditing && (
                    <TouchableOpacity
                        style={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            backgroundColor: 'rgba(0,0,0,0.7)',
                            borderRadius: wp(4),
                            padding: wp(1.5),
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        onPress={() => onEditPress(field)}
                    >
                        <Ionicons name="create-outline" size={wp(4)} color="white" />
                    </TouchableOpacity>
                )}

                {/* Cancel button when editing */}
                {isCurrentlyEditing && !isUploading && (
                    <TouchableOpacity
                        style={{
                            position: 'absolute',
                            top: 10,
                            left: 10,
                            backgroundColor: 'rgba(255,0,0,0.7)',
                            borderRadius: wp(4),
                            padding: wp(1.5),
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        onPress={onCancelEdit}
                    >
                        <Ionicons name="close" size={wp(4)} color="white" />
                    </TouchableOpacity>
                )}
            </TouchableOpacity>

            {/* Image label */}
            <ThemedText
                type="tiny"
                style={{
                    textAlign: 'center',
                    marginTop: wp(1),
                    color: isCurrentlyEditing ? accent : coolGray
                }}
            >
                {label}
                {isCurrentlyEditing && ' (Editing)'}
            </ThemedText>
        </View>
    );
};
