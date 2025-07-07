import React, { useState, useEffect } from "react";
import { View, ScrollView, TouchableOpacity, TextInput, Share, TouchableHighlight } from "react-native";

import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from "../components/config/fireBase";

import { EvilIcons, Ionicons } from "@expo/vector-icons";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { ThemedText } from "@/components/ThemedText";
import ScreenWrapper from "@/components/ScreenWrapper";
import { router } from "expo-router";
import { wp } from "@/constants/common";
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
    const newFilter = loadsList.filter((value) => {
      return (value.fromLocation || value.toLocation)?.toLowerCase().includes(searchWord.toLowerCase());
    });

    const newFilterTrucks = allTrucks.filter((value) => {
      return (value.fromLocation || value.toLocation)?.toLowerCase().includes(searchWord.toLowerCase());
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
  };

  const displaySearchedTrucks = filteredDataTrucks.slice(0, 15).map((value, key) => {
    return (
      <TouchableOpacity style={{ flex: 1, marginBottom: 6, padding: 6 }} key={value.id} onPress={() => navigation.navigate('selectedUserTrucks', { userId: value.userId, itemKey: value.timeStamp, CompanyName: value.CompanyName })}>

        {value.isVerified && <View style={{ position: 'absolute', top: 0, right: 0, backgroundColor: 'white', zIndex: 66 }} >
          <MaterialIcons name="verified" size={24} color="green" />
        </View>}
        <ThemedText style={{ color: '#6a0c0c', textAlign: 'center', fontSize: 17 }}>{value.CompanyName} </ThemedText>
        <ThemedText >from {value.fromLocation} to {value.toLocation} </ThemedText>
        {value.truckTonnage && <ThemedText> Truck Ton : {value.truckTonnage}</ThemedText>}
        <ThemedText>Trailer Type : {value.truckType}</ThemedText>
      </TouchableOpacity>
    );
  });

  const displaySearched = filteredData.slice(0, 15).map((value, key) => {
    return (
      <TouchableOpacity style={{ flex: 1, marginBottom: 6, padding: 6 }} key={value.id} onPress={() => navigation.navigate('selectedUserLoads', { userId: value.userId, companyNameG: value.companyName, itemKey: value.timeStamp })}  >

        {value.isVerified && <View style={{ position: 'absolute', top: 0, right: 0, backgroundColor: 'white', zIndex: 66 }} >
          <MaterialIcons name="verified" size={24} color="green" />
        </View>}
        <ThemedText style={{ color: '#6a0c0c', textAlign: 'center', fontSize: 17 }}>{value.companyName} </ThemedText>
        <ThemedText style={{ fontSize: 17 }} >Commodity {value.typeofLoad}  </ThemedText>
        <ThemedText style={{ color: 'green', fontWeight: 'bold', fontSize: 15 }} >Rate {value.ratePerTonne} </ThemedText>
        <ThemedText >from {value.fromLocation} to {value.toLocation} </ThemedText>
      </TouchableOpacity>
    );
  });

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

  const [industry , setIndusrty]=React.useState("")
  const tabKeys = ["Showroom", "Trailers", "Spares", "Service Provider"]
  const [selectedTab, setSelectedTab] = useState(tabKeys[0]);
    const [selectedCountryId, setSelectedCountryId] = useState<{
        id: number;
        name: string;
    } | null>(Countries[0] ?? null)
  return (
    <ScreenWrapper>

     
      <View style={{ margin: wp(4), marginTop: wp(3), flexDirection: 'row', gap: 2, alignItems: 'center' }}>
        <TouchableHighlight
          underlayColor={'#7f7f7f1c'}
          onPress={() => router.back()}
          style={{ padding: wp(2), marginLeft: wp(0), borderRadius: wp(5), marginBottom: wp(3) }}
        >
          <Ionicons name='chevron-back' size={wp(5)} color={icon} />
        </TouchableHighlight>
        <Input onChangeText={(text) => handleFilter(text)}
          placeholder='Search...'
          autoFocus
          Icon={<EvilIcons name='search' size={wp(6)} color={icon} />}
          isDynamicwidth
          containerStyles={{ backgroundColor: backgroundColor, borderRadius: wp(8), flex: 1 }} />
      </View>



<View>





 <View style={{ marginVertical: wp(2) }}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{
                            paddingHorizontal: wp(2),
                            gap: wp(2),
                        }}
                    >
                        {Countries.map((item) => {
                            const isSelected = item.id === selectedCountryId?.id;
                            return (
                                <TouchableOpacity
                                    key={item.id}
                                    onPress={() => {
                                        setSelectedCountryId(item);
                                        // Optionally filter products here or trigger a filter function
                                    }}
                                    style={{
                                        backgroundColor: isSelected ? accent : backgroundLight,
                                        borderColor: isSelected ? accent : coolGray,
                                        borderWidth: 1,
                                    marginLeft:wp(2),
                                    borderRadius:wp(2),
                                    paddingHorizontal: wp(3),

                                       
                                        marginRight: wp(1),
                                        shadowColor: isSelected ? accent : '#000',
                                        shadowOpacity: isSelected ? 0.15 : 0.05,
                                        shadowRadius: 4,
                                        elevation: isSelected ? 2 : 0,
                                    }}
                                    activeOpacity={0.8}
                                >
                                    <ThemedText
                                        type="defaultSemiBold"
                                        style={{
                                            color: isSelected ? 'white' : textColor,
                                            fontSize: wp(2.5),
                                        }}
                                    >
                                        {item.name}
                                    </ThemedText>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
                












    <View style={{flexDirection:"row",margin :6}}>
   <TouchableOpacity
                // key={tab}
                onPress={() => setIndusrty("transport&Lgistcs") }
                style={{
                       paddingVertical: wp(0.1),
                  marginLeft: wp(2),
                  borderRadius: wp(2),
                  paddingHorizontal: wp(3),
                  backgroundColor: industry === "transport&Lgistcs" ? accent : backgroundLight,
                  borderWidth: 1,
                  borderColor: industry === "transport&Lgistcs" ? accent : coolGray,
                  flex :1,
                  justifyContent:"center",
                  alignItems:"center"
                }}
                activeOpacity={0.8}
              >
                <ThemedText
                  type="defaultSemiBold"
                  style={{
                    color: industry === "transport&Lgistcs" ? 'white' : textColor,
                    fontSize: wp(3.5),
                  }}
                >
                  Loads & Trucks
                </ThemedText>
              </TouchableOpacity>

               <TouchableOpacity
                // key={tab}
                // onPress={() => setSelectedTab(tab)}))
                onPress={() => setIndusrty("Store") }
                style={{
                  paddingVertical: wp(0.1),
                  marginLeft: wp(2),
                  borderRadius: wp(2),
                  paddingHorizontal: wp(3),
                  backgroundColor: industry === "Store" ? accent : backgroundLight,
                  borderWidth: 1,
                  borderColor: industry === "Store" ? accent : coolGray,
                  flex :1,
                  justifyContent:"center",
                  alignItems:"center"
                }}
                activeOpacity={0.8}
              >
                <ThemedText
                  type="defaultSemiBold"
                  style={{
                    color: industry === "Store" ? 'white' : textColor,
                    fontSize: wp(3.5),
                  }}
                >
                  Store
                </ThemedText>
              </TouchableOpacity>

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
                }}
                activeOpacity={0.8}
              >
                <ThemedText
                  type="defaultSemiBold"
                  style={{
                    color: selectedTab === tab ? 'white' : textColor,
                    fontSize: wp(3.5),
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















      {allTrucks.length <= 0 && loadsList.length <= 0 && <ThemedText>Loading......</ThemedText>}

      <View style={{ flexDirection: 'row', }} >
        {filteredData.length > 0 && (
          <ScrollView style={{ width: 280 }} >
            {<ThemedText >
              {loadsList.length > 0 && filteredData.length <= 0 ? "Load Not Available" : "Available Loads"} </ThemedText>}
            {displaySearched}
          </ScrollView>

        )
        }

        <View style={{ width: 2, backgroundColor: '#6a0c0c' }} >
        </View>

        {filteredDataTrucks.length > 0 && <ScrollView >
          {<ThemedText  >
            {allTrucks.length > 0 && filteredDataTrucks.length <= 0 ? "Trucks Not Available" : "Available Trucks"}
          </ThemedText>}
          {displaySearchedTrucks}
        </ScrollView>}


      </View>

      {/* {textTyped && allTrucks.length > 0 && filteredDataTrucks.length <= 0 && loadsList.length > 0 && filteredData.length <= 0 && <Text style={{ fontSize: 20, }} >  No Loads Or Truck Available </Text>} */}
      {textTyped && allTrucks.length > 0 && filteredDataTrucks.length <= 0 && loadsList.length > 0 && filteredData.length <= 0 && <TouchableOpacity onPress={handleShareApp} >
        <ThemedText style={{ fontSize: 20, textDecorationLine: 'underline' }} > Share or recommend our app for more services and  products!</ThemedText>
      </TouchableOpacity>}

    </ScreenWrapper>
  );
}
export default React.memo(SearchIterms);