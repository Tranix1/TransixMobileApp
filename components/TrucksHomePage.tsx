import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ScrollView,
  Image,
  TouchableNativeFeedback,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { wp, hp } from '@/constants/common';
import { ThemedText } from './ThemedText'; // Assuming this is your custom ThemedText component
import { Ionicons } from '@expo/vector-icons'; // Assuming you're using Expo for Ionicons
import TruckItemComponent from './TruckItemComponent';
import { SpecifyTruckDetails } from './SpecifyTruckDetails';
import { SpecifyTruckDetailsProps } from '@/types/types';
import { TruckTypeProps } from '@/types/types';

import { useThemeColor } from '@/hooks/useThemeColor'
import { useAuth } from '@/context/AuthContext';
import AccentRingLoader from '@/components/AccentRingLoader';
import { router } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';
import CustomHeader from './CustomHeader';

type FinalReturnComponentProps = {
  showfilter: boolean;
  setShowfilter: React.Dispatch<React.SetStateAction<boolean>>;
  truckCapacity: string;
  setTruckCapacity: React.Dispatch<React.SetStateAction<string>>;
  selectedCargoArea: TruckTypeProps | null; // Adjust 'any' to actual image type if known
  setSelectedTruckType: React.Dispatch<React.SetStateAction<TruckTypeProps | null>>;
  tankerType: string;
  setTankerType: React.Dispatch<React.SetStateAction<string>>;
  operationCountries: string[];
  setOperationCountries: React.Dispatch<React.SetStateAction<string[]>>

  trucks: any

  refreshing: boolean;
  onRefresh: () => void;
  loadMoreTrucks: () => void;
  lastVisible: any; // Define a more specific type for lastVisible if it's a Firestore document snapshot
  loadingMore: boolean;
  clearFilter: () => void;

  filteredPNotAavaialble: boolean;
  isLoading?: boolean;
  visibilitySelector?: React.ReactNode;

}

export const FinalReturnComponent: React.FC<FinalReturnComponentProps> = ({
  showfilter,
  setShowfilter,
  truckCapacity,
  setTruckCapacity,
  selectedCargoArea,
  setSelectedTruckType,
  tankerType,
  setTankerType,
  operationCountries,
  setOperationCountries,
  trucks,
  refreshing,
  onRefresh,
  loadMoreTrucks,
  lastVisible,
  loadingMore,
  clearFilter,
  filteredPNotAavaialble,
  isLoading,
  visibilitySelector

}) => {

  const { user } = useAuth();
  const background = useThemeColor('backgroundLight')
  const bg = useThemeColor('background')
  const coolGray = useThemeColor('coolGray')
  const accent = useThemeColor('accent')
  const icon = useThemeColor('icon')
  return (
    <View style={{ flex: 1 }}>
      <SpecifyTruckDetails
        dspSpecTruckDet={showfilter}
        setDspSpecTruckDet={setShowfilter}
        truckCapacity={truckCapacity}
        setTruckCapacity={setTruckCapacity}
        selectedTruckType={selectedCargoArea}
        setSelectedTruckType={setSelectedTruckType}
        tankerType={tankerType}
        setTankerType={setTankerType}
        operationCountries={operationCountries}
        setOperationCountries={setOperationCountries}
      />

      <View style={[styles.container, { backgroundColor: bg }]}>

        {/* Visibility Selector */}

        <CustomHeader pageTitle='Trucks' addingNavigate="/Logistics/Trucks/AddTrucks" filterElement={setShowfilter} />


        {visibilitySelector}


        <FlatList
          keyExtractor={(item) => item.id || Math.random().toString()}
          ListHeaderComponent={() => (
            <>

              <View style={{ marginHorizontal: wp(1), marginBottom: wp(1) }}>
                {(selectedCargoArea ||
                  operationCountries.length > 0 ||
                  truckCapacity) && (
                    <TouchableOpacity
                      onPress={() => {
                        clearFilter();
                        setShowfilter(true);
                      }}
                      style={{
                        padding: wp(2),
                        flexDirection: 'row',
                        backgroundColor: background,
                        borderRadius: wp(6),
                        marginBottom: wp(2),
                        position: 'relative',
                        alignItems: 'center',
                      }}
                    >
                      {selectedCargoArea?.image && (
                        <View style={{ marginRight: wp(2) }}>
                          <Image
                            source={selectedCargoArea.image}
                            style={{
                              width: wp(20),
                              height: wp(15),
                              borderRadius: wp(4),
                              resizeMode: 'cover',
                            }}
                          />
                        </View>
                      )}

                      <View style={{ flex: 1 }}>
                        {selectedCargoArea?.name && (

                          <ThemedText type="subtitle" style={{ marginBottom: wp(1) }}>
                            {selectedCargoArea.name}
                          </ThemedText>
                        )}

                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={{ gap: wp(2) }}
                        >
                          {truckCapacity && (
                            <View style={[styles.countryButton, { backgroundColor: accent }]}>
                              <ThemedText style={{ color: 'white' }}>{truckCapacity}</ThemedText>
                            </View>
                          )}

                        </ScrollView>
                        <ThemedText style={{ textAlign: 'center' }}>
                          {operationCountries?.map((item) => item + ', ') || 'N/A'}
                        </ThemedText>
                      </View>

                      <View
                        style={{
                          overflow: 'hidden',
                          borderRadius: wp(10),
                          position: 'absolute',
                          right: wp(2),
                          top: wp(2),
                        }}
                      >
                        <TouchableNativeFeedback onPress={clearFilter}>
                          <View style={{ padding: wp(2) }}>
                            <Ionicons name="close" size={wp(4)} color={icon} />
                          </View>
                        </TouchableNativeFeedback>
                      </View>
                    </TouchableOpacity>
                  )}
              </View>
            </>
          )}
          data={trucks}
          renderItem={({ item }) => <TruckItemComponent truck={item} truckContract={item} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[accent]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              {isLoading ? (
                <>
                  <AccentRingLoader color={accent} size={32} dotSize={6} />
                  <ThemedText type='defaultSemiBold' style={styles.emptyText}>
                    Loading Trucks…
                  </ThemedText>
                  <ThemedText type='tiny' style={styles.emptySubtext}>
                    Please Wait
                  </ThemedText>
                </>
              ) : filteredPNotAavaialble ? (
                <>
                  <Ionicons name="car-outline" size={wp(8)} color={icon} />
                  <ThemedText type='defaultSemiBold' style={styles.emptyText}>
                    Specified Truck Not Available!
                  </ThemedText>
                  <ThemedText type='tiny' style={styles.emptySubtext}>
                    Pull to refresh
                  </ThemedText>
                </>
              ) : (
                <>
                  <Ionicons name="car-outline" size={wp(8)} color={icon} />
                  <ThemedText type='defaultSemiBold' style={styles.emptyText}>
                    No Trucks Available
                  </ThemedText>
                  <TouchableOpacity onPress={() => router.push("/Logistics/Trucks/AddTrucks")} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                    <ThemedText style={{ color: '#666' }}>
                      Add your first truck to start building your fleet
                    </ThemedText>

                    <Ionicons name="chevron-forward" size={16} color={accent} style={{ marginLeft: 4 }} />
                  </TouchableOpacity>




                </>
              )}
            </View>
          }
          onEndReached={loadMoreTrucks}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            <View style={{ marginBottom: wp(10), marginTop: wp(6) }}>
              {loadingMore ? (
                <View style={{ flexDirection: 'row', gap: wp(4), alignItems: 'center', justifyContent: 'center' }}>
                  <ThemedText type="tiny" style={{ color: icon }}>
                    Loading More
                  </ThemedText>
                  <AccentRingLoader color={accent} size={20} dotSize={4} />
                </View>
              ) : !lastVisible && trucks.length > 0 ? (
                <View style={{ gap: wp(2), alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                  <ThemedText type="tiny" style={{ color: icon, paddingTop: 0, width: wp(90), textAlign: 'center' }}>
                    No more Trucks to Load
                  </ThemedText>
                  <Ionicons color={icon} style={{}} name="alert-circle-outline" size={wp(6)} />
                </View>
              ) : null}
            </View>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  countryButton: {
    paddingVertical: wp(1),
    paddingHorizontal: wp(3),
    borderRadius: wp(5),
  },
  emptySubtext: {
    textAlign: 'center',
    marginTop: wp(2)
  }, emptyText: {
    textAlign: 'center'
  }, emptyContainer: {
    minHeight: hp(80),
    justifyContent: 'center',
    alignItems: 'center'
  },
});