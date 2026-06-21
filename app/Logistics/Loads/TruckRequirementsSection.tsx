import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { AddTruckDetails } from '@/components/AddTruckDetails';
import { ThemedText } from '@/components/ThemedText';
import { wp } from '@/constants/common';
import { TruckFormData, TruckNeededType, TruckTypeProps } from '@/types/types';

type TruckRequirementsSectionProps = {
  title?: string;
  helperText?: string;
  trucksNeeded: TruckNeededType[];
  removeTruck: (index: number) => void;
  onAddTruck: () => void;
  backgroundLight: string;
  selectedTruckType: { id: number; name: string } | null;
  setSelectedTruckType: React.Dispatch<React.SetStateAction<{ id: number; name: string } | null>>;
  selectedCargoArea: TruckTypeProps | null;
  setSelectedCargoArea: React.Dispatch<React.SetStateAction<TruckTypeProps | null>>;
  selectedTankerType: { id: number; name: string } | null;
  setSelectedTankerType: React.Dispatch<React.SetStateAction<{ id: number; name: string } | null>>;
  selectedTruckCapacity: { id: number; name: string } | null;
  setSelectedTruckCapacity: React.Dispatch<React.SetStateAction<{ id: number; name: string } | null>>;
  formDataTruck: TruckFormData;
  setFormDataTruck: React.Dispatch<React.SetStateAction<TruckFormData>>;
  showCountries: boolean;
  setShowCountries: React.Dispatch<React.SetStateAction<boolean>>;
  operationCountries: string[];
  setOperationCountries: React.Dispatch<React.SetStateAction<string[]>>;
};

export const TruckRequirementsSection = ({
  title,
  helperText,
  trucksNeeded,
  removeTruck,
  onAddTruck,
  backgroundLight,
  selectedTruckType,
  setSelectedTruckType,
  selectedCargoArea,
  setSelectedCargoArea,
  selectedTankerType,
  setSelectedTankerType,
  selectedTruckCapacity,
  setSelectedTruckCapacity,
  formDataTruck,
  setFormDataTruck,
  showCountries,
  setShowCountries,
  operationCountries,
  setOperationCountries,
}: TruckRequirementsSectionProps) => (
  <>
    {title ? <ThemedText style={{ fontWeight: 'bold', marginTop: wp(2) }}>{title}</ThemedText> : null}
    {helperText ? (
      <ThemedText style={{ fontSize: 14, color: '#666', marginBottom: wp(2) }}>
        {helperText}
      </ThemedText>
    ) : null}

    {trucksNeeded.map((truck, index) => (
      <View
        key={index}
        style={{
          position: 'relative',
          marginBottom: 10,
          padding: 14,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: 8,
          backgroundColor: backgroundLight,
        }}
      >
        <ThemedText>Truck {index + 1}: {truck.truckType?.name}</ThemedText>
        <ThemedText>{truck.cargoArea?.name}</ThemedText>
        <ThemedText>{truck.capacity?.name}</ThemedText>

        <TouchableOpacity onPress={() => removeTruck(index)} style={{ padding: 5, zIndex: 1 }}>
          <Feather name="x" color="red" size={wp(4)} />
        </TouchableOpacity>
      </View>
    ))}

    <AddTruckDetails
      selectedTruckType={selectedTruckType}
      setSelectedTruckType={setSelectedTruckType}
      selectedCargoArea={selectedCargoArea}
      setSelectedCargoArea={setSelectedCargoArea}
      selectedTankerType={selectedTankerType}
      setSelectedTankerType={setSelectedTankerType}
      selectedTruckCapacity={selectedTruckCapacity}
      setSelectedTruckCapacity={setSelectedTruckCapacity}
      formData={formDataTruck}
      setFormData={setFormDataTruck}
      showCountries={showCountries}
      setShowCountries={setShowCountries}
      operationCountries={operationCountries}
      setOperationCountries={setOperationCountries}
    />

    <TouchableOpacity
      onPress={onAddTruck}
      style={{
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 6,
        paddingVertical: 6,
        paddingHorizontal: 29,
        alignSelf: 'flex-start',
        marginVertical: 10,
      }}
    >
      <ThemedText style={{ color: 'gray', fontSize: 14 }}>
        Select {trucksNeeded.length <= 0 ? 'Truck' : 'another'}
      </ThemedText>
    </TouchableOpacity>
  </>
);
