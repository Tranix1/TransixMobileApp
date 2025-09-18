import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { TruckTypeProps } from '@/types/types';
import { wp } from '@/constants/common';
import { useThemeColor } from '@/hooks/useThemeColor';

interface AfricanTruckSelectorProps {
  selectedTruckTypes: TruckTypeProps[];
  setSelectedTruckTypes: React.Dispatch<React.SetStateAction<TruckTypeProps[]>>;
}

export const AfricanTruckSelector: React.FC<AfricanTruckSelectorProps> = ({
  selectedTruckTypes,
  setSelectedTruckTypes
}) => {
  const accent = useThemeColor('accent');
  const backgroundLight = useThemeColor('backgroundLight');
  const background = useThemeColor('background');

  // Most common African truck types with Dropside as primary
  const africanTruckTypes: TruckTypeProps[] = [
    { id: 1, name: "Dropside", description: "Most common in Africa - open sides for easy loading", image: undefined },
    { id: 2, name: "Flatbed", description: "Open flat platform for general cargo", image: undefined },
    { id: 3, name: "Dry Van", description: "Enclosed cargo protection", image: undefined }
  ];

  const toggleTruckType = (truck: TruckTypeProps) => {
    const isSelected = selectedTruckTypes.some(t => t.id === truck.id);
    if (isSelected) {
      setSelectedTruckTypes(prev => prev.filter(t => t.id !== truck.id));
    } else {
      setSelectedTruckTypes(prev => [...prev, truck]);
    }
  };

  return (
    <View>
      <ThemedText style={{ fontSize: 16, fontWeight: 'bold', marginBottom: wp(2) }}>
        Select Suitable Truck Types<ThemedText color="red">*</ThemedText>
      </ThemedText>
      <ThemedText style={{ fontSize: 12, opacity: 0.7, marginBottom: wp(3) }}>
        Choose the truck types suitable for your load (you can select multiple)
      </ThemedText>

      {africanTruckTypes.map((truck) => {
        const isSelected = selectedTruckTypes.some(t => t.id === truck.id);
        return (
          <TouchableOpacity
            key={truck.id}
            onPress={() => toggleTruckType(truck)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: wp(3),
              marginVertical: wp(1),
              borderRadius: 12,
              borderWidth: 2,
              borderColor: isSelected ? accent : '#e0e0e0',
              backgroundColor: isSelected ? `${accent}20` : background,
            }}
          >
            <View style={{ flex: 1 }}>
              <ThemedText style={{ 
                fontSize: 16, 
                fontWeight: 'bold',
                color: isSelected ? accent : undefined 
              }}>
                {truck.name}
                {truck.name === 'Dropside' && (
                  <ThemedText style={{ fontSize: 12, color: accent }}> (Recommended)</ThemedText>
                )}
              </ThemedText>
              <ThemedText style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>
                {truck.description}
              </ThemedText>
            </View>
            <View style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: isSelected ? accent : '#ccc',
              backgroundColor: isSelected ? accent : 'transparent',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              {isSelected && (
                <ThemedText style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>✓</ThemedText>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
