import React, { useState, useEffect } from "react";
import { View, ScrollView, TouchableOpacity, TextInput, Share, TouchableHighlight, Animated, FlatList, ActivityIndicator, StyleSheet, Modal, SafeAreaView } from "react-native";
import { BlurView } from 'expo-blur';

import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from "@/db/fireBaseConfig";

import { EvilIcons, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { ThemedText } from "@/components/ThemedText";
import ScreenWrapper from "@/components/ScreenWrapper";
import { router } from "expo-router";
import { wp, hp } from "@/constants/common";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { useThemeColor } from "@/hooks/useThemeColor";

import { Countries } from '@/data/appConstants'

interface Load {
  id: string;
  userId: string;
  companyName: string;
  timeStamp: number;
  typeofLoad: string;
  rate: string;
  fromLocation: string;
  toLocation: string;
  origin?: {
    description: string;
    placeId: string;
    latitude: number;
    longitude: number;
    country: string | null;
    city: string | null;
  };
  destination?: {
    description: string;
    placeId: string;
    latitude: number;
    longitude: number;
    country: string | null;
    city: string | null;
  };
  isVerified?: boolean;
  commodity?: string;
  paymentTerms?: string;
  requirements?: string;
  additionalInfo?: string;
  currency?: string;
  model?: string;
  distance?: string;
}

interface Truck {
  id: string;
  userId: string;
  CompanyName: string;
  timeStamp: number;
  fromLocation: string;
  toLocation: string;
  origin?: {
    description: string;
    placeId: string;
    latitude: number;
    longitude: number;
    country: string | null;
    city: string | null;
  };
  destination?: {
    description: string;
    placeId: string;
    latitude: number;
    longitude: number;
    country: string | null;
    city: string | null;
  };
  availability?: {
    loadType: 'city-to-city' | 'local' | 'any-load';
    origin: {
      description: string;
      placeId: string;
      latitude: number;
      longitude: number;
      country: string | null;
      city: string | null;
    } | null;
    destination: {
      description: string;
      placeId: string;
      latitude: number;
      longitude: number;
      country: string | null;
      city: string | null;
    } | null;
    localArea: {
      description: string;
      placeId: string;
      latitude: number;
      longitude: number;
      country: string | null;
      city: string | null;
    } | null;
    flexibleRouting: boolean;
    additionalInfo: string;
    isAvailable: boolean;
    distance: string;
    duration: string;
    durationInTraffic: string;
  };
  truckTonnage?: string;
  truckType: string;
  truckCapacity?: string;
  cargoArea?: string;
  tankerType?: string;
  isVerified?: boolean;
  additionalInfo?: string;
  operationCountries?: string[];
}

function SearchIterms() {
  const [loadsList, setLoadsList] = useState<Load[]>([]);
  const [textTyped, setTextTyped] = useState<string>("");
  const [allTrucks, setAllTrucks] = useState<Truck[]>([]);
  const [filteredData, setFilteredData] = useState<Load[]>([]);
  const [filteredDataTrucks, setFilteredDataTruks] = useState<Truck[]>([]);
  const [wordEntered, setWordEntered] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchAnimation] = useState(new Animated.Value(0));

  // Filter modal state
  const [showFilter, setShowFilter] = useState(false);
  const [selectedCountryId, setSelectedCountryId] = useState<{
    id: number;
    name: string;
  } | null>(Countries[0] ?? null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedTab, setSelectedTab] = useState("Showroom");

  // Advanced search states
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    try {
      const dataQuery = query(collection(db, "Cargo"));

      const unsubscribe = onSnapshot(dataQuery, (snapshot) => {
        const loadedData: Load[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Load));

        const sortedData = loadedData.sort((a, b) => b.timeStamp - a.timeStamp);
        setLoadsList(sortedData);
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
      const dataQuery = query(collection(db, "Trucks"), where("isApproved", "==", true));

      const unsubscribe = onSnapshot(dataQuery, (snapshot) => {
        const loadedData: Truck[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Truck));

        const sortedData = loadedData.sort((a, b) => b.timeStamp - a.timeStamp);
        setAllTrucks(sortedData);
      });

      // Clean up function to unsubscribe from the listener when the component unmounts
      return () => unsubscribe();
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Generate search suggestions based on available data
  const generateSuggestions = (searchText: string) => {
    if (searchText.length < 2) return [];

    const suggestions = new Set<string>();
    const searchLower = searchText.toLowerCase();

    // Add location suggestions
    loadsList.forEach(load => {
      if (load.fromLocation?.toLowerCase().includes(searchLower)) {
        suggestions.add(load.fromLocation);
      }
      if (load.toLocation?.toLowerCase().includes(searchLower)) {
        suggestions.add(load.toLocation);
      }
      if (load.origin?.description?.toLowerCase().includes(searchLower)) {
        suggestions.add(load.origin.description);
      }
      if (load.destination?.description?.toLowerCase().includes(searchLower)) {
        suggestions.add(load.destination.description);
      }
    });

    allTrucks.forEach(truck => {
      // Check availability data for location suggestions
      if (truck.availability?.origin?.description?.toLowerCase().includes(searchLower)) {
        suggestions.add(truck.availability.origin.description);
      }
      if (truck.availability?.destination?.description?.toLowerCase().includes(searchLower)) {
        suggestions.add(truck.availability.destination.description);
      }
      if (truck.availability?.localArea?.description?.toLowerCase().includes(searchLower)) {
        suggestions.add(truck.availability.localArea.description);
      }
      // Also check legacy location fields
      if (truck.origin?.description?.toLowerCase().includes(searchLower)) {
        suggestions.add(truck.origin.description);
      }
      if (truck.destination?.description?.toLowerCase().includes(searchLower)) {
        suggestions.add(truck.destination.description);
      }
    });

    return Array.from(suggestions).slice(0, 5);
  };

  // Enhanced search function with multiple criteria and category filtering
  const performSearch = (searchText: string) => {
    if (!searchText.trim()) {
      setFilteredData([]);
      setFilteredDataTruks([]);
      setShowSuggestions(false);
      return;
    }

    const searchLower = searchText.toLowerCase();
    const searchWords = searchLower.split(' ').filter(word => word.length > 0);

    // Apply category filtering
    let loadsToSearch = loadsList;
    let trucksToSearch = allTrucks;

    // Filter by category
    if (selectedCategory === "transport&Lgistcs") {
      // Only search loads and trucks (default behavior)
      loadsToSearch = loadsList;
      trucksToSearch = allTrucks;
    } else if (selectedCategory === "Store") {
      // For now, only show trucks as store items
      // In the future, this could include other store items
      loadsToSearch = [];
      trucksToSearch = allTrucks;
    }

    // Search loads with multiple criteria
    const filteredLoads = loadsToSearch.filter((load) => {
      const searchableFields = [
        load.companyName,
        load.typeofLoad,
        load.fromLocation,
        load.toLocation,
        load.origin?.description,
        load.destination?.description,
        load.origin?.city,
        load.destination?.city,
        load.origin?.country,
        load.destination?.country,
        load.commodity,
        load.paymentTerms,
        load.requirements,
        load.additionalInfo,
        load.currency,
        load.model
      ].filter(Boolean);

      const searchableText = searchableFields.join(' ').toLowerCase();

      // Check if all search words are found in any of the fields
      return searchWords.every(word => searchableText.includes(word));
    });

    // Search trucks with multiple criteria
    const filteredTrucks = trucksToSearch.filter((truck) => {
      const searchableFields = [
        truck.CompanyName,
        truck.truckType,
        truck.truckCapacity,
        truck.cargoArea,
        truck.tankerType,
        // Availability data (new format)
        truck.availability?.origin?.description,
        truck.availability?.destination?.description,
        truck.availability?.localArea?.description,
        truck.availability?.origin?.city,
        truck.availability?.destination?.city,
        truck.availability?.origin?.country,
        truck.availability?.destination?.country,
        truck.availability?.localArea?.city,
        truck.availability?.localArea?.country,
        // Legacy location fields
        truck.origin?.description,
        truck.destination?.description,
        truck.origin?.city,
        truck.destination?.city,
        truck.origin?.country,
        truck.destination?.country,
        truck.additionalInfo,
        ...(truck.operationCountries || [])
      ].filter(Boolean);

      const searchableText = searchableFields.join(' ').toLowerCase();

      // Check if all search words are found in any of the fields
      return searchWords.every(word => searchableText.includes(word));
    });

    setFilteredData(filteredLoads);
    setFilteredDataTruks(filteredTrucks);
  };

  const handleFilter = (text: string) => {
    setTextTyped(text);
    setWordEntered(text);
    setIsSearching(true);

    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Generate suggestions
    const suggestions = generateSuggestions(text);
    setSearchSuggestions(suggestions);
    setShowSuggestions(text.length > 1 && suggestions.length > 0);

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

    // Debounce search to improve performance
    const timeout = setTimeout(() => {
      performSearch(text);
      setIsSearching(false);
    }, 300);

    setSearchTimeout(timeout);
  };

  const clearInput = () => {
    setFilteredData([]);
    setFilteredDataTruks([]);
    setWordEntered("");
    setTextTyped("");
    setShowSuggestions(false);
    setSearchSuggestions([]);
    setIsSearching(false);
    if (searchTimeout) {
      clearTimeout(searchTimeout);
      setSearchTimeout(null);
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    setTextTyped(suggestion);
    setWordEntered(suggestion);
    setShowSuggestions(false);
    addToSearchHistory(suggestion);
    performSearch(suggestion);
  };

  const addToSearchHistory = (searchTerm: string) => {
    if (searchTerm.trim() && !searchHistory.includes(searchTerm.trim())) {
      setSearchHistory(prev => [searchTerm.trim(), ...prev.slice(0, 9)]);
    }
  };

  const applyFilters = () => {
    // Re-perform search with current filters
    if (textTyped.trim()) {
      performSearch(textTyped);
    }
    setShowFilter(false);
  };

  const clearFilters = () => {
    setSelectedCountryId(Countries[0] ?? null);
    setSelectedCategory("");
    setSelectedTab("Showroom");
    // Re-perform search without filters
    if (textTyped.trim()) {
      performSearch(textTyped);
    }
    setShowFilter(false);
  };

  // Modern card component for trucks
  const renderTruckCard = ({ item }: { item: Truck }) => (
    <TouchableOpacity
      style={[styles.modernCard, { backgroundColor: backgroundLight }]}
      onPress={() => router.push({ pathname: "/Logistics/Trucks/TruckDetails", params: { truckid: item.id, dspDetails: "false", } })}
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
        {/* Show route based on availability load type */}
        {item.availability?.loadType === 'local' ? (
          // Local area display
          <View style={styles.locationRow}>
            <Ionicons name="home" size={16} color={icon} />
            <ThemedText style={styles.locationText}>
              Local Area: {item.availability?.localArea?.description || 'Not specified'}
            </ThemedText>
          </View>
        ) : item.availability?.loadType === 'any-load' ? (
          // Any load display (flexible routing)
          <View style={styles.locationRow}>
            <Ionicons name="swap-horizontal" size={16} color={icon} />
            <ThemedText style={styles.locationText}>
              Starting: {item.availability?.origin?.description || 'Not specified'}
            </ThemedText>
          </View>
        ) : (
          // City-to-city display (default)
          <>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={16} color={icon} />
              <ThemedText style={styles.locationText}>
                {item.availability?.origin?.description ||
                  item.fromLocation ||
                  item.origin?.description || 'Not specified'}
              </ThemedText>
            </View>
            <View style={styles.arrowContainer}>
              <Ionicons name="arrow-forward" size={16} color={icon} />
            </View>
            <View style={styles.locationRow}>
              <Ionicons name="flag" size={16} color={accent} />
              <ThemedText style={styles.locationText}>
                {item.availability?.destination?.description ||
                  item.toLocation ||
                  item.destination?.description || 'Not specified'}
              </ThemedText>
            </View>
          </>
        )}
      </View>

      <View style={styles.detailsRow}>
        {item.truckCapacity && (
          <View style={styles.detailChip}>
            <ThemedText style={styles.detailText}>{item.truckCapacity}</ThemedText>
          </View>
        )}
        <View style={styles.detailChip}>
          <ThemedText style={styles.detailText}>{item.truckType}</ThemedText>
        </View>
        {item.cargoArea && (
          <View style={styles.detailChip}>
            <ThemedText style={styles.detailText}>{item.cargoArea}</ThemedText>
          </View>
        )}
        {item.tankerType && (
          <View style={styles.detailChip}>
            <ThemedText style={styles.detailText}>{item.tankerType}</ThemedText>
          </View>
        )}
        {/* Show availability load type */}
        {item.availability?.loadType && (
          <View style={[styles.detailChip, { backgroundColor: accent + '20' }]}>
            <ThemedText style={[styles.detailText, { color: accent, fontWeight: '600' }]}>
              {item.availability.loadType === 'city-to-city' ? 'City-to-City' :
                item.availability.loadType === 'local' ? 'Local' :
                  item.availability.loadType === 'any-load' ? 'Any Load' : ''}
            </ThemedText>
          </View>
        )}
        {/* Show availability status */}
        {item.availability?.isAvailable !== undefined && (
          <View style={[styles.detailChip, {
            backgroundColor: item.availability.isAvailable ? '#4CAF5020' : '#F4433620'
          }]}>
            <ThemedText style={[styles.detailText, {
              color: item.availability.isAvailable ? '#4CAF50' : '#F44336',
              fontWeight: '600'
            }]}>
              {item.availability.isAvailable ? 'Available' : 'Unavailable'}
            </ThemedText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  // Modern card component for loads
  const renderLoadCard = ({ item }: { item: Load }) => (
    <TouchableOpacity
      style={[styles.modernCard, { backgroundColor: backgroundLight }]}
      onPress={() => router.push({ pathname: "/Logistics/Loads/Index", params: { itemId: item.id, } })}
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
          <ThemedText style={styles.locationText}>
            {item.fromLocation || item.origin?.description}
          </ThemedText>
        </View>
        <View style={styles.arrowContainer}>
          <Ionicons name="arrow-forward" size={16} color={icon} />
        </View>
        <View style={styles.locationRow}>
          <Ionicons name="flag" size={16} color={accent} />
          <ThemedText style={styles.locationText}>
            {item.toLocation || item.destination?.description}
          </ThemedText>
        </View>
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.detailChip}>
          <ThemedText style={styles.detailText}>{item.typeofLoad}</ThemedText>
        </View>
        {item.rate && (
          <View style={[styles.detailChip, styles.rateChip]}>
            <ThemedText style={[styles.detailText, styles.rateText]}>
              {item.rate} {item.currency || ''}
            </ThemedText>
          </View>
        )}
        {item.commodity && (
          <View style={styles.detailChip}>
            <ThemedText style={styles.detailText}>{item.commodity}</ThemedText>
          </View>
        )}
        {item.model && (
          <View style={styles.detailChip}>
            <ThemedText style={styles.detailText}>{item.model}</ThemedText>
          </View>
        )}
        {item.distance && (
          <View style={styles.detailChip}>

            <ThemedText type="tiny" style={styles.detailText}>
              Distance: {item.distance}
            </ThemedText>
          </View>
        )}
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

  const tabKeys = ["Showroom", "Trailers", "Spares", "Service Provider"]

  return (
    <ScreenWrapper>
      {/* Simple Header with Search and Filter */}
      <View style={styles.headerContainer}>
        <TouchableHighlight
          underlayColor={coolGray}
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name='chevron-back' size={wp(6)} color={icon} />
        </TouchableHighlight>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Input
              onChangeText={(text) => handleFilter(text)}
              placeholder='Search loads, trucks, locations, commodities...'
              value={textTyped}
              autoFocus
              Icon={ <TouchableOpacity
                onPress={() => {
                  if (textTyped.trim() &&textTyped.length > 0 && textTyped.trim().length > 0) {
                    addToSearchHistory(textTyped.trim());
                    performSearch(textTyped);
                  }
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <EvilIcons name='search' size={wp(6)} color={icon} />
              </TouchableOpacity>}
              isDynamicwidth
              containerStyles={[styles.searchInput, { backgroundColor: backgroundColor }]}
              onSubmitEditing={() => {
                if (textTyped.trim()) {
                  addToSearchHistory(textTyped.trim());
                  performSearch(textTyped);
                }
              }}
            />
            {textTyped.length > 0 && (
              <TouchableOpacity onPress={clearInput} style={styles.clearButton}>
                <Ionicons name="close-circle" size={wp(5)} color={icon} />
              </TouchableOpacity>
            )}
          
          </View>

          {/* Search Suggestions */}
          {showSuggestions && searchSuggestions.length > 0 && (
            <View style={[styles.suggestionsContainer, { backgroundColor: backgroundLight }]}>
              {searchSuggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionItem}
                  onPress={() => handleSuggestionPress(suggestion)}
                >
                  <Ionicons name="search" size={wp(4)} color={icon} />
                  <ThemedText style={styles.suggestionText}>{suggestion}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Search History */}
          {!showSuggestions && textTyped.length === 0 && searchHistory.length > 0 && (
            <View style={[styles.historyContainer, { backgroundColor: backgroundLight }]}>
              <ThemedText style={styles.historyTitle}>Recent Searches</ThemedText>
              {searchHistory.slice(0, 5).map((historyItem, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.historyItem}
                  onPress={() => handleSuggestionPress(historyItem)}
                >
                  <Ionicons name="time" size={wp(4)} color={icon} />
                  <ThemedText style={styles.historyText}>{historyItem}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={() => setShowFilter(true)}
          style={styles.filterButton}
        >
          <Ionicons name="filter" size={wp(5)} color={icon} />
        </TouchableOpacity>
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
              {isSearching ? 'Searching...' : `Search Results (${filteredData.length + filteredDataTrucks.length})`}
            </ThemedText>
            {isSearching && (
              <ActivityIndicator size="small" color={accent} style={{ marginLeft: wp(2) }} />
            )}
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

      {/* Filter Modal */}
      <Modal
        visible={showFilter}
        animationType="slide"
        transparent={true}
        statusBarTranslucent
        onRequestClose={() => setShowFilter(false)}
      >
        <BlurView
          intensity={10}
          tint="systemMaterialDark"
          experimentalBlurMethod="dimezisBlurView"
          style={{ flex: 1 }}
        >
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }}>
            <View style={{
              width: '95%',
              backgroundColor: background,
              borderRadius: wp(4),
              padding: wp(4),
            }}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: wp(4)
              }}>
                <ThemedText style={{ fontSize: wp(5), fontWeight: '600' }}>Filter Search</ThemedText>
                <TouchableOpacity onPress={() => setShowFilter(false)}>
                  <Ionicons name="close" size={wp(5)} color={icon} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{ gap: wp(4) }}>
                  {/* Country Selection */}
                  <View>
                    <ThemedText style={{ fontSize: wp(4), fontWeight: '600', marginBottom: wp(2) }}>
                      Select Country
                    </ThemedText>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ gap: wp(2) }}
                    >
                      {Countries.map((item) => {
                        const isSelected = item.id === selectedCountryId?.id;
                        return (
                          <TouchableOpacity
                            key={item.id}
                            onPress={() => setSelectedCountryId(item)}
                            style={[
                              styles.modalChip,
                              {
                                backgroundColor: isSelected ? accent : backgroundLight,
                                borderColor: isSelected ? accent : coolGray,
                              }
                            ]}
                            activeOpacity={0.7}
                          >
                            <ThemedText
                              style={[
                                styles.modalChipText,
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

                  {/* Category Selection */}
                  <View>
                    <ThemedText style={{ fontSize: wp(4), fontWeight: '600', marginBottom: wp(2) }}>
                      Select Category
                    </ThemedText>
                    <View style={{ gap: wp(2) }}>
                      <TouchableOpacity
                        onPress={() => setSelectedCategory("transport&Lgistcs")}
                        style={[
                          styles.modalButton,
                          {
                            backgroundColor: selectedCategory === "transport&Lgistcs" ? accent : backgroundLight,
                            borderColor: selectedCategory === "transport&Lgistcs" ? accent : coolGray,
                          }
                        ]}
                        activeOpacity={0.7}
                      >
                        <MaterialCommunityIcons
                          name="truck"
                          size={wp(4)}
                          color={selectedCategory === "transport&Lgistcs" ? 'white' : icon}
                        />
                        <ThemedText
                          style={[
                            styles.modalButtonText,
                            { color: selectedCategory === "transport&Lgistcs" ? 'white' : textColor }
                          ]}
                        >
                          Transport & Logistics
                        </ThemedText>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => setSelectedCategory("Store")}
                        style={[
                          styles.modalButton,
                          {
                            backgroundColor: selectedCategory === "Store" ? accent : backgroundLight,
                            borderColor: selectedCategory === "Store" ? accent : coolGray,
                          }
                        ]}
                        activeOpacity={0.7}
                      >
                        <MaterialCommunityIcons
                          name="store"
                          size={wp(4)}
                          color={selectedCategory === "Store" ? 'white' : icon}
                        />
                        <ThemedText
                          style={[
                            styles.modalButtonText,
                            { color: selectedCategory === "Store" ? 'white' : textColor }
                          ]}
                        >
                          Store
                        </ThemedText>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Tab Selection */}
                  <View>
                    <ThemedText style={{ fontSize: wp(4), fontWeight: '600', marginBottom: wp(2) }}>
                      Select Type
                    </ThemedText>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ gap: wp(2) }}
                    >
                      {tabKeys.map((tab) => {
                        const isSelected = selectedTab === tab;
                        return (
                          <TouchableOpacity
                            key={tab}
                            onPress={() => setSelectedTab(tab)}
                            style={[
                              styles.modalChip,
                              {
                                backgroundColor: isSelected ? accent : backgroundLight,
                                borderColor: isSelected ? accent : coolGray,
                              }
                            ]}
                            activeOpacity={0.7}
                          >
                            <ThemedText
                              style={[
                                styles.modalChipText,
                                { color: isSelected ? 'white' : textColor }
                              ]}
                            >
                              {tab}
                            </ThemedText>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                </View>
              </ScrollView>

              <View style={{ marginTop: wp(4), gap: wp(2) }}>
                <Button
                  onPress={applyFilters}
                  title="Apply Filter"
                  colors={{ bg: accent + '1c', text: accent }}
                  style={{ height: 45 }}
                />
                <Button
                  onPress={clearFilters}
                  title="Clear All"
                  colors={{ bg: coolGray + '1c', text: coolGray }}
                  style={{ height: 45 }}
                />
              </View>
            </View>
          </View>
        </BlurView>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(3),
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
    position: 'relative',
  },
  searchInputContainer: {
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
    right: wp(2),
    top: wp(3),
    padding: wp(1),
  },
  searchButton: {
    position: 'absolute',
    right: wp(8),
    padding: wp(1),
  },
  filterButton: {
    padding: wp(2),
    borderRadius: wp(5),
    backgroundColor: 'rgba(0,0,0,0.05)',
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
  // Modal styles
  modalChip: {
    paddingHorizontal: wp(3),
    paddingVertical: wp(1.5),
    borderRadius: wp(5),
    borderWidth: 1,
    marginHorizontal: wp(1),
    minWidth: wp(18),
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalChipText: {
    fontSize: wp(3),
    fontWeight: '500',
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: wp(2.5),
    paddingHorizontal: wp(3),
    borderRadius: wp(2),
    borderWidth: 1,
    gap: wp(2),
  },
  modalButtonText: {
    fontSize: wp(3.2),
    fontWeight: '600',
  },
  // New styles for suggestions and history
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 1000,
    borderRadius: wp(2),
    marginTop: wp(1),
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    maxHeight: hp(30),
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: wp(3),
    paddingHorizontal: wp(4),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    gap: wp(3),
  },
  suggestionText: {
    flex: 1,
    fontSize: wp(4),
  },
  historyContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 1000,
    borderRadius: wp(2),
    marginTop: wp(1),
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    maxHeight: hp(30),
  },
  historyTitle: {
    fontSize: wp(3.5),
    fontWeight: '600',
    paddingVertical: wp(2),
    paddingHorizontal: wp(4),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: wp(3),
    paddingHorizontal: wp(4),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    gap: wp(3),
  },
  historyText: {
    flex: 1,
    fontSize: wp(4),
  },
});

export default React.memo(SearchIterms);