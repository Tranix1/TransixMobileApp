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
import { wp,hp } from '@/constants/common';
import { ThemedText } from './ThemedText'; // Assuming this is your custom ThemedText component
import { Ionicons } from '@expo/vector-icons'; // Assuming you're using Expo for Ionicons
import TruckItemComponent from './TruckItemComponent';
import { SpecifyTruckDetails } from './SpecifyTruckDetails';
import { SpecifyTruckDetailsProps } from '@/types/types';
import { TruckTypeProps } from '@/types/types';

import { useThemeColor } from '@/hooks/useThemeColor'
import { useAuth } from '@/context/AuthContext';

type FinalReturnComponentProps = {
  showfilter: boolean;
  setShowfilter: React.Dispatch<React.SetStateAction<boolean>>;
  truckCapacity: string ;
  setTruckCapacity: React.Dispatch<React.SetStateAction<string>>;
selectedCargoArea: TruckTypeProps | null; // Adjust 'any' to actual image type if known
  setSelectedTruckType: React.Dispatch<React.SetStateAction<TruckTypeProps | null>>;
  tankerType: string ;
  setTankerType: React.Dispatch<React.SetStateAction<string>>;
  operationCountries: string[];
  setOperationCountries: React.Dispatch<React.SetStateAction<string[] >> 
  truckConfig: string ;
  setTruckConfig: React.Dispatch<React.SetStateAction<string>>;
  truckSuspension: string ;
  setTruckSuspension: React.Dispatch<React.SetStateAction<string>> ;
  userId ?: string;
  organisationName ?: string

  trucks: any

  refreshing: boolean;
  onRefresh: () => void;
  loadMoreTrucks: () => void;
  lastVisible: any; // Define a more specific type for lastVisible if it's a Firestore document snapshot
  loadingMore: boolean;
  clearFilter: () => void;

  contractName ?: string 
  contractId  ?: string

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
  truckConfig,
  setTruckConfig,
  truckSuspension,
  setTruckSuspension,
  userId,
  organisationName,
  trucks,
  refreshing,
  onRefresh,
  loadMoreTrucks,
  lastVisible,
  loadingMore,
  clearFilter,
contractName ,
contractId,

}) => {
  
  console.log(contractName)
    const { user } = useAuth();
     const background = useThemeColor('backgroundLight')
    const bg = useThemeColor('background')
    const coolGray = useThemeColor('coolGray')
    const accent = useThemeColor('accent')
    const icon = useThemeColor('icon')
  return (
    <View style={{ flex: 1}}>
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
        truckConfig={truckConfig}
        setTruckConfig={setTruckConfig}
        truckSuspension={truckSuspension}
        setTruckSuspension={setTruckSuspension}
      />

      <View style={[styles.container, { backgroundColor: bg }]}>
        <View
          style={{
            backgroundColor: bg,
            paddingHorizontal: wp(2),
            paddingVertical: wp(1),
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: wp(1),
          }}
        >
          { !contractId &&!userId && <View>
              <View style={{}}>
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <ThemedText type="title" >Trucks</ThemedText>
                  
                </View>
              </View>
              {/* <ThemedzText type="tiny">Find a Truck for your Load Today</ThemedText> */}
            </View>
          }
          { (userId|| contractId ) && (
            <View style={{paddingRight:5}}>
              {(userId===user?.uid ||contractId) ? <ThemedText type="subtitle" > Manage Trucks </ThemedText> :
              <ThemedText type="subtitle" >{organisationName} Trucks </ThemedText>}
            </View>
          )}
          <View style={{ flexDirection: 'row', gap: wp(2) }}>
            <View style={{ overflow: 'hidden', borderRadius: wp(10) }}>
              <TouchableNativeFeedback onPress={() => setShowfilter(true)}>
                <View style={{ padding: wp(2) }}>
                  <Ionicons name={'filter'} size={wp(4)} color={icon} />
                </View>
              </TouchableNativeFeedback>
            </View>
          </View>
        </View>

        <FlatList
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={() => (
            <>
              <View style={{ marginHorizontal: wp(1), marginBottom: wp(1) }}>
                {(selectedCargoArea ||
                  truckSuspension ||
                  truckConfig ||
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
                          <View style={[styles.countryButton, { backgroundColor: '#73c8a9' }]}>
                            <ThemedText style={{ color: 'white' }}>{truckCapacity}</ThemedText>
                          </View>
                        )}
                        {truckConfig && (
                          <View style={[styles.countryButton, { backgroundColor: '#73c8a9' }]}>
                            <ThemedText style={{ color: 'white' }}>{truckConfig}</ThemedText>
                          </View>
                        )}
                        {truckSuspension && (
                          <View style={[styles.countryButton, { backgroundColor: '#73c8a9' }]}>
                            <ThemedText style={{ color: 'white' }}>{truckSuspension}</ThemedText>
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
          data={ trucks }
          renderItem={({ item }) => <TruckItemComponent truck={contractId!=="undefined" && contractId  ? item.truckInfo : item } truckContract={contractId ? item: null } />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[accent]} />
          }
          ListEmptyComponent={
            <View style={{ minHeight: hp(80), justifyContent: 'center' }}>
              <ThemedText type="defaultSemiBold" style={{ textAlign: 'center' }}>
                Loading Trucks…
              </ThemedText>
               <ThemedText type='tiny' style={{ textAlign: 'center', marginTop: wp(2) }}>
                        pull to refresh
                    </ThemedText>
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
                  <ActivityIndicator size="small" color={accent} />
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
});