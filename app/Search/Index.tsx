import React, { useState, useEffect } from "react";
import { View, ScrollView, TouchableOpacity, TextInput, Share, TouchableHighlight, Animated, FlatList, ActivityIndicator, StyleSheet } from "react-native";

import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from "../components/config/fireBase";

import { EvilIcons, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { ThemedText } from "@/components/ThemedText";
import ScreenWrapper from "@/components/ScreenWrapper";
import { router } from "expo-router";
import { wp, hp } from "@/constants/common";
import Input from "@/components/Input";
import { useThemeColor } from "@/hooks/useThemeColor";

import { Countries } from '@/data/appConstants'

interface Load {
  id: string;
  userId: string;
  companyName: string;
  timeStamp: number;
  typeofLoad: string;
  ratePerTonne: string;
  fromLocation: string;
  toLocation: string;
  isVerified?: boolean;
}

interface Truck {
  id: string;
  userId: string;
  CompanyName: string;
  timeStamp: number;
  fromLocation: string;
  toLocation: string;
  truckTonnage?: string;
  truckType: string;
  isVerified?: boolean;
}

interface SearchItermsProps {
  navigation: any; // You might want to define a more specific type for navigation
}

function SearchIterms({ navigation }: SearchItermsProps) {
  const [loadsList, setLoadsList] = useState<Load[]>([]);
  const [textTyped, setTextTyped] = useState<string>("");
  const [allTrucks, setAllTrucks] = useState<Truck[]>([]);
  const [filteredData, setFilteredData] = useState<Load[]>([]);
  const [filteredDataTrucks, setFilteredDataTruks] = useState<Truck[]>([]);
  const [wordEntered, setWordEntered] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    try {
      const dataQuery = query(collection(db, "Loads"));

      const unsubscribe = onSnapshot(dataQuery, (snapshot) => {
        let loadedData: Load[] = [];
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added' || change.type === 'modified') {
            const dataWithId: Load = { id: change.doc.id, ...change.doc.data() } as Load;
            loadedData.push(dataWithId);
          }
        });

        loadedData = loadedData.sort((a, b) => b.timeStamp - a.timeStamp);
        setLoadsList(loadedData);
        setIsLoading(false);
      });

      // Clean up function to unsubscribe from the listener when the component unmounts
      return () => unsubscribe();
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    try {
      const dataQuery = query(collection(db, "Trucks"));

      const unsubscribe = onSnapshot(dataQuery, (snapshot) => {
        let loadedData: Truck[] = [];
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added' || change.type === 'modified') {
            const dataWithId: Truck = { id: change.doc.id, ...change.doc.data() } as Truck;
            loadedData.push(dataWithId);
          }
        });

        loadedData = loadedData.sort((a, b) => b.timeStamp - a.timeStamp);
        setAllTrucks(loadedData);
      });

      // Clean up function to unsubscribe from the listener when the component unmounts
      return () => unsubscribe();
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleFilter = (text: string) => {
    const searchWord = text;
    setTextTyped(text);
    setWordEntered(text);
    
    // Animate search results
    if (text.length > 0) {
      Animated.timing(searchAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(searchAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }

    const newFilter = loadsList.filter((value) => {
      return (value.fromLocation || value.toLocation || value.companyName || value.typeofLoad)?.toLowerCase().includes(searchWord.toLowerCase());
    });

    const newFilterTrucks = allTrucks.filter((value) => {
      return (value.fromLocation || value.toLocation || value.CompanyName || value.truckType)?.toLowerCase().includes(searchWord.toLowerCase());
    });
    
    if (searchWord === "") {
      setFilteredData([]);
      setFilteredDataTruks([]);
    } else {
      setFilteredData(newFilter);
      setFilteredDataTruks(newFilterTrucks);
    }
  };

  const clearInput = () => {
    setFilteredData([]);
    setFilteredDataTruks([]);
    setWordEntered("");
    setTextTyped("");
  };

  // Modern card component for trucks
  const renderTruckCard = ({ item }: { item: Truck }) => (
    <TouchableOpacity 
      style={[styles.modernCard, { backgroundColor: backgroundLight }]}
      onPress={() => navigation.navigate('selectedUserTrucks', { userId: item.userId, itemKey: item.timeStamp, CompanyName: item.CompanyName })}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.companyInfo}>
          <MaterialCommunityIcons name="truck" size={24} color={accent} />
          <ThemedText style={[styles.companyName, { color: accent }]}>{item.CompanyName}</ThemedText>
        </View>
        {item.isVerified && (
          <MaterialIcons name="verified" size={20} color="#4CAF50" />
        )}
      </View>
      
      <View style={styles.routeContainer}>
        <View style={styles.locationRow}>
          <Ionicons name="location" size={16} color={icon} />
          <ThemedText style={styles.locationText}>{item.fromLocation}</ThemedText>
        </View>
        <View style={styles.arrowContainer}>
          <Ionicons name="arrow-forward" size={16} color={icon} />
        </View>
        <View style={styles.locationRow}>
          <Ionicons name="flag" size={16} color={accent} />
          <ThemedText style={styles.locationText}>{item.toLocation}</ThemedText>
        </View>
      </View>

      <View style={styles.detailsRow}>
        {item.truckTonnage && (
          <View style={styles.detailChip}>
            <ThemedText style={styles.detailText}>{item.truckTonnage} Ton</ThemedText>
          </View>
        )}
        <View style={styles.detailChip}>
          <ThemedText style={styles.detailText}>{item.truckType}</ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Modern card component for loads
  const renderLoadCard = ({ item }: { item: Load }) => (
    <TouchableOpacity 
      style={[styles.modernCard, { backgroundColor: backgroundLight }]}
      onPress={() => navigation.navigate('selectedUserLoads', { userId: item.userId, companyNameG: item.companyName, itemKey: item.timeStamp })}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.companyInfo}>
          <MaterialCommunityIcons name="package-variant" size={24} color={accent} />
          <ThemedText style={[styles.companyName, { color: accent }]}>{item.companyName}</ThemedText>
        </View>
        {item.isVerified && (
          <MaterialIcons name="verified" size={20} color="#4CAF50" />
        )}
      </View>
      
      <View style={styles.routeContainer}>
        <View style={styles.locationRow}>
          <Ionicons name="location" size={16} color={icon} />
          <ThemedText style={styles.locationText}>{item.fromLocation}</ThemedText>
        </View>
        <View style={styles.arrowContainer}>
          <Ionicons name="arrow-forward" size={16} color={icon} />
        </View>
        <View style={styles.locationRow}>
          <Ionicons name="flag" size={16} color={accent} />
          <ThemedText style={styles.locationText}>{item.toLocation}</ThemedText>
        </View>
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.detailChip}>
          <ThemedText style={styles.detailText}>{item.typeofLoad}</ThemedText>
        </View>
        <View style={[styles.detailChip, styles.rateChip]}>
          <ThemedText style={[styles.detailText, styles.rateText]}>{item.ratePerTonne}</ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );

  const handleShareApp = async () => {
    try {
      const message = `I invite you to Transix!

Transix is a tech-driven business enhancing transportation and logistics services, connecting suppliers with demand for truckloads, vehicles, trailers, and spare parts etc.

Contact us at +263716325160 with the message "Application" to swiftly receive the application download link.

Explore Application at : https://play.google.com/store/apps/details?id=com.yayapana.Transix
Explore website at : https://transix.net/

Experience the future of transportation and logistics!`;

      const result = await Share.share({
        message: message,
      });

      if (result) {
        if (result.action === Share.sharedAction) {
          if (result.activityType) {
            // Shared with activity type of result.activityType
          } else {
            // Shared
          }
        } else if (result.action === Share.dismissedAction) {
          // Dismissed
        }
      } else {
        // Handle the case where result is undefined or null
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  const accent = useThemeColor('accent')
  const icon = useThemeColor('icon')
  const backgroundColor = useThemeColor('backgroundLight')
  const background = useThemeColor('background')
  const coolGray = useThemeColor('coolGray')
  const backgroundLight = useThemeColor('backgroundLight')
  const textColor = useThemeColor('text')

  const [industry, setIndusrty] = React.useState("")
  const tabKeys = ["Showroom", "Trailers", "Spares", "Service Provider"]
  const [selectedTab, setSelectedTab] = useState(tabKeys[0]);
  const [selectedCountryId, setSelectedCountryId] = useState<{
    id: number;
    name: string;
  } | null>(Countries[0] ?? null)
  return (
    <ScreenWrapper>


      {/* Enhanced Header with Search */}
      <View style={styles.headerContainer}>
        <TouchableHighlight
          underlayColor={coolGray}
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name='chevron-back' size={wp(6)} color={icon} />
        </TouchableHighlight>
        
        <View style={styles.searchContainer}>
          <Input 
            onChangeText={(text) => handleFilter(text)}
            placeholder='Search loads, trucks, locations...'
            autoFocus
            Icon={<EvilIcons name='search' size={wp(6)} color={icon} />}
            isDynamicwidth
            containerStyles={[styles.searchInput, { backgroundColor: backgroundColor }]} 
          />
          {textTyped.length > 0 && (
            <TouchableOpacity onPress={clearInput} style={styles.clearButton}>
              <Ionicons name="close-circle" size={wp(5)} color={icon} />
            </TouchableOpacity>
          )}
        </View>
      </View>


      <View style={{marginBottom:30}}>





        {/* Country Selection */}
        <View style={styles.filterSection}>
          <View style={styles.filterHeader}>
            <Ionicons name="location-outline" size={wp(4)} color={icon} />
            <ThemedText style={styles.filterLabel}>Select Country</ThemedText>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.countryScrollContainer}
          >
            {Countries.map((item) => {
              const isSelected = item.id === selectedCountryId?.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setSelectedCountryId(item)}
                  style={[
                    styles.countryChip,
                    {
                      backgroundColor: isSelected ? accent : backgroundLight,
                      borderColor: isSelected ? accent : coolGray,
                    }
                  ]}
                  activeOpacity={0.7}
                >
                  <ThemedText
                    style={[
                      styles.countryChipText,
                      { color: isSelected ? 'white' : textColor }
                    ]}
                  >
                    {item.name}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>













        {/* Industry Selection */}
        <View style={styles.filterSection}>
          <View style={styles.filterHeader}>
            <MaterialCommunityIcons name="truck-outline" size={wp(4)} color={icon} />
            <ThemedText style={styles.filterLabel}>Select Category</ThemedText>
          </View>
          <View style={styles.industryContainer}>
            <TouchableOpacity
              onPress={() => setIndusrty("transport&Lgistcs")}
              style={[
                styles.industryButton,
                {
                  backgroundColor: industry === "transport&Lgistcs" ? accent : backgroundLight,
                  borderColor: industry === "transport&Lgistcs" ? accent : coolGray,
                }
              ]}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons 
                name="truck" 
                size={wp(4)} 
                color={industry === "transport&Lgistcs" ? 'white' : icon} 
              />
              <ThemedText
                style={[
                  styles.industryButtonText,
                  { color: industry === "transport&Lgistcs" ? 'white' : textColor }
                ]}
              >
                Transport & Logistics
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIndusrty("Store")}
              style={[
                styles.industryButton,
                {
                  backgroundColor: industry === "Store" ? accent : backgroundLight,
                  borderColor: industry === "Store" ? accent : coolGray,
                }
              ]}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons 
                name="store" 
                size={wp(4)} 
                color={industry === "Store" ? 'white' : icon} 
              />
              <ThemedText
                style={[
                  styles.industryButtonText,
                  { color: industry === "Store" ? 'white' : textColor }
                ]}
              >
                Store
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>





        <View style={{ marginVertical: wp(2) }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: wp(2),
              gap: wp(2),
            }}
          >
            {tabKeys.map((tab, idx) => {
              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setSelectedTab(tab)}
                  style={{
                    paddingVertical: wp(0.1),
                    marginLeft: wp(2),
                    borderRadius: wp(2),
                    paddingHorizontal: wp(3),
                    backgroundColor: selectedTab === tab ? accent : backgroundLight,
                    borderWidth: 1,
                    borderColor: selectedTab === tab ? accent : coolGray,

                    height: 20,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  activeOpacity={0.8}
                >
                  <ThemedText
                    type="defaultSemiBold"
                    style={{
                      color: selectedTab === tab ? 'white' : textColor,
                      fontSize: wp(2.5),
                    }}
                  >
                    {tab}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

      </View>

      {/* Loading State */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={accent} />
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        </View>
      )}

      {/* Search Results */}
      {textTyped.length > 0 && (
        <Animated.View 
          style={[
            styles.resultsContainer,
            {
              opacity: searchAnimation,
              transform: [{
                translateY: searchAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                })
              }]
            }
          ]}
        >
          {/* Results Header */}
          <View style={styles.resultsHeader}>
            <ThemedText style={styles.resultsTitle}>
              Search Results ({filteredData.length + filteredDataTrucks.length})
            </ThemedText>
          </View>

          {/* Loads Section */}
          {filteredData.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="package-variant" size={20} color={accent} />
                <ThemedText style={styles.sectionTitle}>Available Loads ({filteredData.length})</ThemedText>
              </View>
              <FlatList
                data={filteredData.slice(0, 15)}
                renderItem={renderLoadCard}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
              />
            </View>
          )}

          {/* Trucks Section */}
          {filteredDataTrucks.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="truck" size={20} color={accent} />
                <ThemedText style={styles.sectionTitle}>Available Trucks ({filteredDataTrucks.length})</ThemedText>
              </View>
              <FlatList
                data={filteredDataTrucks.slice(0, 15)}
                renderItem={renderTruckCard}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
              />
            </View>
          )}

          {/* No Results */}
          {filteredData.length === 0 && filteredDataTrucks.length === 0 && textTyped.length > 0 && (
            <View style={styles.noResultsContainer}>
              <MaterialCommunityIcons name="magnify-close" size={48} color={coolGray} />
              <ThemedText style={styles.noResultsTitle}>No Results Found</ThemedText>
              <ThemedText style={styles.noResultsSubtitle}>
                Try searching with different keywords or locations
              </ThemedText>
              <TouchableOpacity onPress={handleShareApp} style={styles.shareButton}>
                <ThemedText style={styles.shareButtonText}>
                  Share our app for more services!
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingTop: wp(3),
    paddingBottom: wp(2),
    gap: wp(2),
  },
  backButton: {
    padding: wp(2),
    borderRadius: wp(5),
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  searchInput: {
    flex: 1,
    borderRadius: wp(8),
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  clearButton: {
    position: 'absolute',
    right: wp(3),
    padding: wp(1),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: hp(20),
  },
  loadingText: {
    marginTop: wp(3),
    fontSize: wp(4),
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: wp(4),
  },
  resultsHeader: {
    paddingVertical: wp(3),
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    marginBottom: wp(3),
  },
  resultsTitle: {
    fontSize: wp(4.5),
    fontWeight: '600',
  },
  sectionContainer: {
    marginBottom: wp(4),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: wp(2),
    paddingHorizontal: wp(1),
    gap: wp(2),
  },
  sectionTitle: {
    fontSize: wp(4),
    fontWeight: '500',
  },
  listContainer: {
    paddingBottom: wp(2),
  },
  modernCard: {
    padding: wp(4),
    marginVertical: wp(2),
    borderRadius: wp(3),
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: wp(3),
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
    flex: 1,
  },
  companyName: {
    fontSize: wp(4.2),
    fontWeight: '600',
    flex: 1,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: wp(3),
    paddingVertical: wp(2),
    paddingHorizontal: wp(3),
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: wp(2),
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1),
    flex: 1,
  },
  locationText: {
    fontSize: wp(3.5),
    flex: 1,
  },
  arrowContainer: {
    paddingHorizontal: wp(2),
  },
  detailsRow: {
    flexDirection: 'row',
    gap: wp(2),
    flexWrap: 'wrap',
  },
  detailChip: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: wp(3),
    paddingVertical: wp(1),
    borderRadius: wp(4),
  },
  detailText: {
    fontSize: wp(3),
    fontWeight: '500',
  },
  rateChip: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  rateText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: hp(10),
    paddingHorizontal: wp(8),
  },
  noResultsTitle: {
    fontSize: wp(5),
    fontWeight: '600',
    marginTop: wp(4),
    textAlign: 'center',
  },
  noResultsSubtitle: {
    fontSize: wp(3.5),
    textAlign: 'center',
    marginTop: wp(2),
    opacity: 0.7,
  },
  shareButton: {
    marginTop: wp(6),
    paddingVertical: wp(3),
    paddingHorizontal: wp(6),
    borderRadius: wp(6),
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  shareButtonText: {
    color: '#007AFF',
    fontSize: wp(3.5),
    fontWeight: '500',
    textAlign: 'center',
  },
  // Filter Section Styles
  filterSection: {
    marginVertical: wp(3),
    paddingHorizontal: wp(4),
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: wp(2),
    gap: wp(2),
  },
  filterLabel: {
    fontSize: wp(3.5),
    fontWeight: '600',
  },
  countryScrollContainer: {
    paddingHorizontal: wp(1),
    gap: wp(2),
  },
  countryChip: {
    paddingHorizontal: wp(3),
    paddingVertical: wp(1.5),
    borderRadius: wp(5),
    borderWidth: 1,
    marginHorizontal: wp(1),
    minWidth: wp(18),
    alignItems: 'center',
    justifyContent: 'center',
  },
  countryChipText: {
    fontSize: wp(3),
    fontWeight: '500',
  },
  industryContainer: {
    flexDirection: 'row',
    gap: wp(3),
  },
  industryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: wp(2.5),
    paddingHorizontal: wp(3),
    borderRadius: wp(2),
    borderWidth: 1,
    gap: wp(2),
  },
  industryButtonText: {
    fontSize: wp(3.2),
    fontWeight: '600',
  },
});

export default React.memo(SearchIterms);