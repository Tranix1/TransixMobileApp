import React from 'react';
import { View, TouchableNativeFeedback } from 'react-native';
import { ThemedText } from './ThemedText';
import { Ionicons, EvilIcons } from '@expo/vector-icons';
import { wp } from '@/constants/common';
import { useThemeColor } from '@/hooks/useThemeColor';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext'
import { CurrentRole } from '@/types/types';
import { FontAwesome6 } from '@expo/vector-icons';

interface CustomHeaderProps {
    onPressMenu: () => void;
    currentRole?: CurrentRole;
    pageTitle?: string;
}

export default function CustomHeader({ onPressMenu, currentRole, pageTitle }: CustomHeaderProps) {
    const background = useThemeColor("background");
    const icon = useThemeColor('icon');
    const { user,  } = useAuth()

    return (
        <View
            style={{
                backgroundColor: background,
                paddingHorizontal: wp(2),
                paddingVertical: wp(1),
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                // marginBottom: wp(1),
            }}
        >
            
            
            
            { (user?.email==="transix16@gmail.com" || user?.email==="kelvinyaya8@gmail.com") &&  <TouchableNativeFeedback onPress={()=> router.push("/Fleet/DriverScreens/Profile/Index")}  >
                        <View style={{ padding: wp(2) }}>
                            <FontAwesome6 name="user" size={wp(7)} color={icon} />;
                        </View>
                    </TouchableNativeFeedback>
                }
            
            <View>
                {pageTitle ? (
                    <>
                        <ThemedText  style= {{ alignSelf: 'center',fontWeight: 'bold',fontSize: wp(5) }} > {pageTitle} </ThemedText>

                        {typeof currentRole === 'object' && currentRole.role === 'fleet' && (
                            <ThemedText type="tiny" style={{ alignSelf: 'center' }}>
                                {currentRole.companyName}: {currentRole.accType} - {currentRole.userRole}
                            </ThemedText>
                        )}
                    </>
                ) : typeof currentRole === 'object' && (currentRole.role === 'fleet'||currentRole.role === 'broker' ) ? (
                    <>
                        {currentRole.userRole === '' ? 
                        <View>
                                <ThemedText  style= {{ alignSelf: 'center',fontWeight: 'bold',fontSize: wp(5) }} >Fleet Selector</ThemedText>

                        </View>
                         :
                            <View>
                                <ThemedText  style= {{ alignSelf: 'center',fontWeight: 'bold',fontSize: wp(5) }} >{currentRole.companyName}</ThemedText>
                        <ThemedText type="tiny" style={{ fontWeight: 'bold' }}>
                            {currentRole.accType}: {currentRole.userRole}
                        </ThemedText>
                                 </View>
                          }

                        
                    </>
                ) 
                
                : (
                    <>
                        <ThemedText type="title">Transix</ThemedText>
                        <ThemedText type="tiny">  Role: Tracking</ThemedText>


                        {/* <ThemedText type="tiny">The future of Transport & Logistics</ThemedText> */}
                        {/* {currentRole && (
                            <ThemedText type="tiny" style={{ fontWeight: 'bold' }}>
                                Role: {currentRole === 'general' ? 'General User' : currentRole === 'fleet' ? 'Fleet Manager' : 'Broker'}
                            </ThemedText>
                        )} */}
                    </>
                )}
            </View>



          {  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {typeof currentRole === 'object' && currentRole.role === 'fleet' && currentRole.userRole === 'owner' && (
                    <View style={{ overflow: 'hidden', borderRadius: wp(10) }}>
                        <TouchableNativeFeedback onPress={() => router.push("/Search/Index")}>
                            <View style={{ padding: wp(2) }}>
                                <EvilIcons name='search' size={wp(7)} color={icon} />
                            </View>
                        </TouchableNativeFeedback>
                    </View>
                )}
               { (user?.email==="transix16@gmail.com" || user?.email==="kelvinyaya8@gmail.com") &&  <View style={{ overflow: 'hidden', borderRadius: wp(10) , flexDirection:'row'}}>
               
                
                    <TouchableNativeFeedback onPress={onPressMenu}>
                        <View style={{ padding: wp(2) }}>
                            <Ionicons name="ellipsis-vertical" size={wp(7)} color={icon} />
                        </View>
                    </TouchableNativeFeedback>
                </View>}
            </View>}


            
        </View>
    );
}