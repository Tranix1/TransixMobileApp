import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import Button from './Button';
import { TruckTypeProps } from '@/types/types';
import { wp } from '@/constants/common';
import { useThemeColor } from '@/hooks/useThemeColor';

interface AIRecommendationsProps {
  aiDetectedCargoArea: TruckTypeProps | null;
  aiDetectedTruckType: { id: number, name: string } | null;
  aiDetectedCapacity: { id: number, name: string } | null;
  aiDetectedTankerType: { id: number, name: string } | null;
  aiAnswer: string;
  onUseRecommendations: () => void;
  onAnalyzeAgain: () => void;
}

export const AIRecommendations: React.FC<AIRecommendationsProps> = ({
  aiDetectedCargoArea,
  aiDetectedTruckType,
  aiDetectedCapacity,
  aiDetectedTankerType,
  aiAnswer,
  onUseRecommendations,
  onAnalyzeAgain
}) => {
  const accent = useThemeColor('accent');
  const backgroundLight = useThemeColor('backgroundLight');
  const background = useThemeColor('background');
  const icon = useThemeColor('icon');

  return (
    <View style={{ padding: wp(4), borderRadius: 12, marginVertical: wp(2), backgroundColor: backgroundLight }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(2) }}>
        <Ionicons name="sparkles" size={20} color={accent} />
        <ThemedText style={{ fontSize: 16, fontWeight: 'bold', color: accent, marginLeft: wp(1) }}>
          AI Recommendations
        </ThemedText>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: wp(1) }}>
        <ThemedText style={{ fontWeight: 'bold' }}>Cargo Area:</ThemedText>
        <ThemedText style={{ color: accent, fontWeight: '600' }}>{aiDetectedCargoArea?.name}</ThemedText>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: wp(1) }}>
        <ThemedText style={{ fontWeight: 'bold' }}>Truck Type:</ThemedText>
        <ThemedText style={{ color: accent, fontWeight: '600' }}>{aiDetectedTruckType?.name}</ThemedText>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: wp(1) }}>
        <ThemedText style={{ fontWeight: 'bold' }}>Capacity:</ThemedText>
        <ThemedText style={{ color: accent, fontWeight: '600' }}>{aiDetectedCapacity?.name}</ThemedText>
      </View>

      {aiDetectedTankerType && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: wp(1) }}>
          <ThemedText style={{ fontWeight: 'bold' }}>Tanker Type:</ThemedText>
          <ThemedText style={{ color: accent, fontWeight: '600' }}>{aiDetectedTankerType.name}</ThemedText>
        </View>
      )}

      {aiAnswer && (
        <View style={{ marginTop: wp(2), padding: wp(2), backgroundColor: background, borderRadius: 8 }}>
          <ThemedText style={{ fontSize: 12, fontStyle: 'italic', opacity: 0.8 }}>
            AI Reasoning: {aiAnswer}
          </ThemedText>
        </View>
      )}

      <View style={{ flexDirection: 'row', gap: wp(2), marginTop: wp(3) }}>
        <Button
          title="Use Recommendations"
          onPress={onUseRecommendations}
          style={{ flex: 1 }}
        />
        <Button
          title="Analyze Again"
          onPress={onAnalyzeAgain}
          colors={{ text: icon, bg: backgroundLight }}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
};
