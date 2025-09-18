import React, { useState } from 'react';
import { View, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import Button from './Button';
import Input from './Input';
import { wp } from '@/constants/common';
import { useThemeColor } from '@/hooks/useThemeColor';
import { setDocuments } from '@/db/operations';
import { router } from 'expo-router';

interface TruckTrackerManagerProps {
  truck: any;
  isOwner: boolean;
  onTrackerUpdate?: () => void;
}

export const TruckTrackerManager: React.FC<TruckTrackerManagerProps> = ({
  truck,
  isOwner,
  onTrackerUpdate
}) => {
  const accent = useThemeColor('accent');
  const backgroundLight = useThemeColor('backgroundLight');
  const background = useThemeColor('background');
  
  const [showAddTracker, setShowAddTracker] = useState(false);
  const [trackerName, setTrackerName] = useState('');
  const [trackerImei, setTrackerImei] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTracker = async () => {
    if (!trackerName.trim() || !trackerImei.trim()) {
      alert('Please enter tracker name and IMEI number');
      return;
    }

    setIsSubmitting(true);
    try {
      // Use document ID to update the truck
      await setDocuments(`Trucks/${truck.id}`, {
        hasTracker: true,
        trackerStatus: 'available',
        trackerName: trackerName.trim(),
        trackerImei: trackerImei.trim(),
        trackerId: `TRK${Date.now()}`,
        trackerAddedAt: Date.now().toString()
      });
      
      setShowAddTracker(false);
      setTrackerName('');
      setTrackerImei('');
      onTrackerUpdate?.();
      alert('Tracker added successfully!');
    } catch (error) {
      console.error('Error adding tracker:', error);
      alert('Failed to add tracker. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewTracker = () => {
    if (truck.hasTracker && truck.trackerId) {
      router.push(`/Tracking/Map?trackerId=${truck.trackerId}`);
    }
  };

  const renderTrackerStatus = () => {
    if (!truck.hasTracker) {
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: wp(2) }}>
          <Ionicons name="location-outline" size={16} color="#ff6b6b" />
          <ThemedText style={{ marginLeft: wp(1), color: '#ff6b6b', fontSize: 12 }}>
            Tracker Not Available
          </ThemedText>
        </View>
      );
    }

    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: wp(2) }}>
        <Ionicons name="location" size={16} color="#51cf66" />
        <ThemedText style={{ marginLeft: wp(1), color: '#51cf66', fontSize: 12 }}>
          Tracker Available
        </ThemedText>
      </View>
    );
  };

  const renderTrackerActions = () => {
    if (!isOwner) {
      return renderTrackerStatus();
    }

    if (!truck.hasTracker) {
      return (
        <View>
          {renderTrackerStatus()}
          <Button
            title="Add Tracker"
            onPress={() => setShowAddTracker(true)}
            style={{ marginTop: wp(2), paddingVertical: wp(1) }}
            colors={{ text: accent, bg: `${accent}20` }}
          />
        </View>
      );
    }

    return (
      <View>
        {renderTrackerStatus()}
        <Button
          title="View Tracker"
          onPress={handleViewTracker}
          style={{ marginTop: wp(2), paddingVertical: wp(1) }}
          colors={{ text: accent, bg: `${accent}20` }}
        />
      </View>
    );
  };

  return (
    <View>
      {renderTrackerActions()}

      <Modal visible={showAddTracker} transparent animationType="slide">
        <View style={{ 
          flex: 1, 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          justifyContent: 'center', 
          paddingHorizontal: wp(4) 
        }}>
          <View style={{ 
            backgroundColor: background, 
            borderRadius: 12, 
            padding: wp(4) 
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: wp(3) }}>
              <ThemedText style={{ fontSize: 18, fontWeight: 'bold' }}>Add Tracker</ThemedText>
              <TouchableOpacity onPress={() => setShowAddTracker(false)}>
                <Ionicons name="close" size={24} color={accent} />
              </TouchableOpacity>
            </View>

            <ThemedText style={{ marginBottom: wp(1) }}>Tracker Name</ThemedText>
            <Input
              value={trackerName}
              onChangeText={setTrackerName}
              placeholder="e.g., Main Truck Tracker"
              style={{ marginBottom: wp(3) }}
            />

            <ThemedText style={{ marginBottom: wp(1) }}>IMEI Number</ThemedText>
            <Input
              value={trackerImei}
              onChangeText={setTrackerImei}
              placeholder="Enter tracker IMEI"
              keyboardType="numeric"
              style={{ marginBottom: wp(4) }}
            />

            <View style={{ flexDirection: 'row', gap: wp(2) }}>
              <Button
                title="Cancel"
                onPress={() => setShowAddTracker(false)}
                colors={{ text: '#666', bg: backgroundLight }}
                style={{ flex: 1 }}
              />
              <Button
                title={isSubmitting ? "Adding..." : "Add Tracker"}
                onPress={handleAddTracker}
                disabled={isSubmitting}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
