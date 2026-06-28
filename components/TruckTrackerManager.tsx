import React, { useState } from 'react';
import { View, TouchableOpacity, Modal, ToastAndroid } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import Button from './Button';
import Input from './Input';      
import { wp } from '@/constants/common';
import { useThemeColor } from '@/hooks/useThemeColor';
import { updateDocument } from '@/db/operations';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

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
  const icon = useThemeColor('icon');

      const { currentRole } = useAuth();
  
  
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
     


      await updateDocument(
    `fleets/${currentRole?.fleetId}/Trucks`    ,
    truck.id,
    {
        hasTracker: true,
        trackerStatus: "available",
        trackerName: trackerName.trim(),
        trackerImei: trackerImei.trim(),
        trackerId: `TRK${Date.now()}`,
        trackerAddedAt: Date.now().toString(),
    }
);

      
      setShowAddTracker(false);
      setTrackerName('');
      setTrackerImei('');
      onTrackerUpdate?.();
      ToastAndroid.show("Tracker added successfully", ToastAndroid.SHORT);
    } catch (error) {
      console.error('Error adding tracker:', error);
      alert('Failed to add tracker. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewTracker = () => {
    if (truck.hasTracker && truck.trackingDeviceId) {

      router.push({
                    pathname: "/Tracking/Map",
                    params: {
                      deviceId: truck.trackingDeviceId,
                      firebaseDocId: truck.id,
                      isOnceOff:  'false'
                    }, }  )

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
            onPress={() => router.push('/Tracking/AddTrackedVehicle')}
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

     
    </View>

    
  );
};
