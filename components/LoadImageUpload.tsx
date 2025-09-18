import React from 'react';
import { View, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ImagePickerAsset } from 'expo-image-picker';
import { ThemedText } from './ThemedText';
import Button from './Button';
import { selectManyImages } from '@/Utilities/utils';
import { wp } from '@/constants/common';
import { useThemeColor } from '@/hooks/useThemeColor';

interface LoadImageUploadProps {
  loadImages: ImagePickerAsset[];
  setLoadImages: React.Dispatch<React.SetStateAction<ImagePickerAsset[]>>;
  onAnalyzeImages: () => void;
  aiLoading: boolean;
  aiAnalysisComplete: boolean;
  aiAnalysisError: string | null;
}

export const LoadImageUpload: React.FC<LoadImageUploadProps> = ({
  loadImages,
  setLoadImages,
  onAnalyzeImages,
  aiLoading,
  aiAnalysisComplete,
  aiAnalysisError
}) => {
  const accent = useThemeColor('accent');
  const backgroundLight = useThemeColor('backgroundLight');

  return (
    <View>
      <ThemedText>
        Upload Images of Your Load<ThemedText color="red">*</ThemedText>
      </ThemedText>
      <TouchableOpacity
        onPress={() => selectManyImages(setLoadImages, false, true)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: wp(4),
          borderRadius: 12,
          borderWidth: 2,
          borderStyle: 'dashed',
          justifyContent: 'center',
          backgroundColor: backgroundLight,
          borderColor: accent
        }}
      >
        <Ionicons name="camera-outline" size={24} color={accent} />
        <ThemedText style={{ marginLeft: wp(2), color: accent }}>
          {loadImages.length > 0 ? `${loadImages.length} image(s) selected` : 'Add Images'}
        </ThemedText>
      </TouchableOpacity>

      {loadImages.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: wp(2) }}>
          {loadImages.map((image, index) => (
            <View key={index} style={{ marginRight: wp(2) }}>
              <Image source={{ uri: image.uri }} style={{ width: 80, height: 80, borderRadius: 8 }} />
              <TouchableOpacity
                onPress={() => setLoadImages(prev => prev.filter((_, i) => i !== index))}
                style={{
                  position: 'absolute',
                  top: -5,
                  right: -5,
                  backgroundColor: 'white',
                  borderRadius: 10,
                }}
              >
                <Ionicons name="close-circle" size={20} color="red" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {loadImages.length > 0 && !aiAnalysisComplete && (
        <Button
          title={aiLoading ? "Analyzing Images..." : "Analyze with AI"}
          onPress={onAnalyzeImages}
          disabled={aiLoading}
        />
      )}

      {aiAnalysisError && (
        <View style={{ padding: wp(3), borderRadius: 8, marginVertical: wp(2), backgroundColor: '#ffebee' }}>
          <ThemedText style={{ color: 'red' }}>{aiAnalysisError}</ThemedText>
        </View>
      )}
    </View>
  );
};
