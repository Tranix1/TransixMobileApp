import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Modal, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import Button from './Button';
import Input from './Input';
import { wp } from '@/constants/common';
import { useThemeColor } from '@/hooks/useThemeColor';
import { addDocument, fetchDocuments, setDocuments } from '@/db/operations';
import { useAuth } from '@/context/AuthContext';
import { where } from 'firebase/firestore';

interface LoadTrackingShareProps {
  loadId: string;
  loadDetails: any;
  isLoadOwner: boolean;
  onShareUpdate?: () => void;
}

export const LoadTrackingShare: React.FC<LoadTrackingShareProps> = ({
  loadId,
  loadDetails,
  isLoadOwner,
  onShareUpdate
}) => {
  const { user } = useAuth();
  const accent = useThemeColor('accent');
  const backgroundLight = useThemeColor('backgroundLight');
  const background = useThemeColor('background');
  
  const [showShareModal, setShowShareModal] = useState(false);
  const [availableTrucks, setAvailableTrucks] = useState<any[]>([]);
  const [selectedTruck, setSelectedTruck] = useState<any>(null);
  const [shareCode, setShareCode] = useState('');
  const [accessLevel, setAccessLevel] = useState<'view_only' | 'full_access'>('view_only');
  const [sharedAccess, setSharedAccess] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSharedAccess();
    if (isLoadOwner) {
      fetchAvailableTrucks();
    }
  }, []);

  const fetchAvailableTrucks = async () => {
    try {
      const trucks = await fetchDocuments("Trucks", 50, undefined, [
        where("isApproved", "==", true),
        where("hasTracker", "==", true),
        where("trackerStatus", "==", "active")
      ]);
      setAvailableTrucks(trucks.data || []);
    } catch (error) {
      console.error("Error fetching trucks:", error);
    }
  };

  const fetchSharedAccess = async () => {
    try {
      const shares = await fetchDocuments("LoadTrackingShares", 50, undefined, [
        where("loadId", "==", loadId)
      ]);
      setSharedAccess(shares.data || []);
    } catch (error) {
      console.error("Error fetching shared access:", error);
    }
  };

  const generateShareCode = () => {
    return `LT${Math.floor(100000 + Math.random() * 900000)}`;
  };

  const handleCreateShare = async () => {
    if (!selectedTruck) {
      Alert.alert("Error", "Please select a truck to share tracking with");
      return;
    }

    setIsSubmitting(true);
    try {
      const newShareCode = generateShareCode();
      const shareData = {
        loadId,
        loadOwnerId: user?.uid,
        loadOwnerEmail: user?.email,
        truckId: selectedTruck.truckId,
        truckOwnerId: selectedTruck.userId,
        trackerId: selectedTruck.trackerId,
        shareCode: newShareCode,
        accessLevel,
        status: 'active',
        createdAt: Date.now().toString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        loadDetails: {
          origin: loadDetails.origin,
          destination: loadDetails.destination,
          typeofLoad: loadDetails.typeofLoad,
          budget: loadDetails.budget
        },
        truckDetails: {
          truckType: selectedTruck.truckType,
          cargoArea: selectedTruck.cargoArea,
          numberPlate: selectedTruck.numberPlate
        }
      };

      await addDocument("LoadTrackingShares", shareData);
      setShareCode(newShareCode);
      fetchSharedAccess();
      onShareUpdate?.();
      Alert.alert("Success", `Tracking share created! Share code: ${newShareCode}`);
    } catch (error) {
      console.error("Error creating share:", error);
      Alert.alert("Error", "Failed to create tracking share");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinShare = async () => {
    if (!shareCode.trim()) {
      Alert.alert("Error", "Please enter a share code");
      return;
    }

    setIsSubmitting(true);
    try {
      const shares = await fetchDocuments("LoadTrackingShares", 10, undefined, [
        where("shareCode", "==", shareCode.trim()),
        where("status", "==", "active")
      ]);

      if (!shares.data || shares.data.length === 0) {
        Alert.alert("Error", "Invalid or expired share code");
        return;
      }

      const share = shares.data[0];
      
      // Check if user owns a truck that matches the share
      const userTrucks = await fetchDocuments("Trucks", 50, undefined, [
        where("userId", "==", user?.uid),
        where("truckId", "==", share.truckId)
      ]);

      if (!userTrucks.data || userTrucks.data.length === 0) {
        Alert.alert("Error", "You don't own the truck associated with this share code");
        return;
      }

      // Update share to include truck owner acceptance
      await setDocuments(`LoadTrackingShares/${share.id}`, {
        ...share,
        truckOwnerAccepted: true,
        truckOwnerAcceptedAt: Date.now().toString()
      });

      fetchSharedAccess();
      onShareUpdate?.();
      Alert.alert("Success", "Successfully joined load tracking share!");
      setShareCode('');
    } catch (error) {
      console.error("Error joining share:", error);
      Alert.alert("Error", "Failed to join tracking share");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderShareItem = ({ item }: { item: any }) => (
    <View style={{
      padding: wp(3),
      backgroundColor: backgroundLight,
      borderRadius: 8,
      marginBottom: wp(2)
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <ThemedText style={{ fontWeight: 'bold' }}>Share Code: {item.shareCode}</ThemedText>
        <View style={{
          paddingHorizontal: wp(2),
          paddingVertical: wp(0.5),
          backgroundColor: item.truckOwnerAccepted ? '#51cf66' : '#ffd43b',
          borderRadius: 4
        }}>
          <ThemedText style={{ fontSize: 10, color: 'white' }}>
            {item.truckOwnerAccepted ? 'Active' : 'Pending'}
          </ThemedText>
        </View>
      </View>
      
      <ThemedText style={{ fontSize: 12, opacity: 0.7, marginTop: wp(1) }}>
        Truck: {item.truckDetails?.truckType} ({item.truckDetails?.numberPlate})
      </ThemedText>
      
      <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>
        Access: {item.accessLevel === 'view_only' ? 'View Only' : 'Full Access'}
      </ThemedText>
      
      <ThemedText style={{ fontSize: 10, opacity: 0.5, marginTop: wp(1) }}>
        Expires: {new Date(item.expiresAt).toLocaleDateString()}
      </ThemedText>
    </View>
  );

  return (
    <View>
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: wp(2),
          backgroundColor: backgroundLight,
          borderRadius: 8,
          marginTop: wp(2)
        }}
        onPress={() => setShowShareModal(true)}
      >
        <Ionicons name="share-outline" size={20} color={accent} />
        <ThemedText style={{ marginLeft: wp(2), color: accent }}>
          {isLoadOwner ? 'Share Tracking' : 'Join Tracking'} ({sharedAccess.length})
        </ThemedText>
      </TouchableOpacity>

      <Modal visible={showShareModal} transparent animationType="slide">
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          paddingHorizontal: wp(4)
        }}>
          <View style={{
            backgroundColor: background,
            borderRadius: 12,
            padding: wp(4),
            maxHeight: '80%'
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: wp(3) }}>
              <ThemedText style={{ fontSize: 18, fontWeight: 'bold' }}>
                {isLoadOwner ? 'Share Load Tracking' : 'Join Load Tracking'}
              </ThemedText>
              <TouchableOpacity onPress={() => setShowShareModal(false)}>
                <Ionicons name="close" size={24} color={accent} />
              </TouchableOpacity>
            </View>

            {isLoadOwner ? (
              <View>
                <ThemedText style={{ marginBottom: wp(2) }}>Select Truck to Share With:</ThemedText>
                <FlatList
                  data={availableTrucks}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={{
                        padding: wp(2),
                        borderWidth: 1,
                        borderColor: selectedTruck?.id === item.id ? accent : '#ddd',
                        borderRadius: 8,
                        marginBottom: wp(1),
                        backgroundColor: selectedTruck?.id === item.id ? `${accent}20` : 'transparent'
                      }}
                      onPress={() => setSelectedTruck(item)}
                    >
                      <ThemedText style={{ fontWeight: 'bold' }}>
                        {item.truckType} - {item.cargoArea}
                      </ThemedText>
                      <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>
                        Owner: {item.ownerName} | Plate: {item.numberPlate}
                      </ThemedText>
                    </TouchableOpacity>
                  )}
                  style={{ maxHeight: 150, marginBottom: wp(3) }}
                />

                <View style={{ flexDirection: 'row', gap: wp(2), marginBottom: wp(3) }}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      padding: wp(2),
                      backgroundColor: accessLevel === 'view_only' ? accent : backgroundLight,
                      borderRadius: 8,
                      alignItems: 'center'
                    }}
                    onPress={() => setAccessLevel('view_only')}
                  >
                    <ThemedText style={{ color: accessLevel === 'view_only' ? 'white' : accent }}>
                      View Only
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      padding: wp(2),
                      backgroundColor: accessLevel === 'full_access' ? accent : backgroundLight,
                      borderRadius: 8,
                      alignItems: 'center'
                    }}
                    onPress={() => setAccessLevel('full_access')}
                  >
                    <ThemedText style={{ color: accessLevel === 'full_access' ? 'white' : accent }}>
                      Full Access
                    </ThemedText>
                  </TouchableOpacity>
                </View>

                <Button
                  title={isSubmitting ? "Creating..." : "Create Share"}
                  onPress={handleCreateShare}
                  disabled={isSubmitting || !selectedTruck}
                />
              </View>
            ) : (
              <View>
                <ThemedText style={{ marginBottom: wp(2) }}>Enter Share Code:</ThemedText>
                <Input
                  value={shareCode}
                  onChangeText={setShareCode}
                  placeholder="Enter 6-digit share code"
                  style={{ marginBottom: wp(3) }}
                />
                <Button
                  title={isSubmitting ? "Joining..." : "Join Share"}
                  onPress={handleJoinShare}
                  disabled={isSubmitting || !shareCode.trim()}
                />
              </View>
            )}

            {sharedAccess.length > 0 && (
              <View style={{ marginTop: wp(3) }}>
                <ThemedText style={{ fontWeight: 'bold', marginBottom: wp(2) }}>
                  Active Shares:
                </ThemedText>
                <FlatList
                  data={sharedAccess}
                  keyExtractor={(item) => item.id}
                  renderItem={renderShareItem}
                  style={{ maxHeight: 200 }}
                />
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};
