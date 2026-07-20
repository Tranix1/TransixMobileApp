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
import UserMenuModal from './UserMenuModal';
import { useAuthState } from '@/hooks/useAuthState';

interface CustomHeaderProps {
    pageTitle?: string;
    addingNavigate?: string
    filterElement?: (value: boolean) => void;

}

export default function CustomHeader({ pageTitle, addingNavigate, filterElement }: CustomHeaderProps) {
    const background = useThemeColor("background");
    const icon = useThemeColor('icon');
    const accent = useThemeColor('accent');
    const { user, currentRole } = useAuth()
    const { updateUserProfile } = useAuthState();

    const [dspMenu, setDspMenu] = React.useState(false)

    function handleProfileNvigation() {
        if (currentRole.accType === "fleet") {
            router.push(
                "/Fleet/Details/Index"
            )

        } else if (currentRole.accType === "brokerage") {

            router.push({
                pathname: "/brokerage/Details/Index",
                params: {
                    brokerid: currentRole.organizationId,
                    dspDetails: "true",
                },
            });

        } else if (currentRole.accType === "driver") {
            router.push("/Driver/Details/Index")
        }
    }

    return (
        <View style={{ backgroundColor: background, }} >

            <UserMenuModal
                visible={dspMenu}
                onClose={() => setDspMenu(false)}
                user={user}
                onProfileUpdate={updateUserProfile}
            />

            <View>


                {typeof currentRole === 'object' && (currentRole.role === 'fleet' || currentRole.role === 'brokerage' || currentRole.accType === "driver") ? (
                    <>
                        {currentRole.userRole === '' ?
                            <View style={{
                                flexDirection: "row", justifyContent: "space-between", alignItems: "center",
                                paddingVertical: wp(1), paddingHorizontal: wp(4)
                            }} >
                                <ThemedText style={{ alignSelf: 'center', fontWeight: 'bold', fontSize: wp(5) }} >{pageTitle} </ThemedText>
                                <TouchableNativeFeedback onPress={() => setDspMenu(true)} >
                                    <View >
                                        <Ionicons name="ellipsis-vertical" size={wp(5)} color={icon} />
                                    </View>
                                </TouchableNativeFeedback>
                            </View>
                            :
                            <View
                                style={{
                                    backgroundColor: background,
                                    paddingHorizontal: wp(2),
                                    paddingVertical: wp(1),
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: wp(1),
                                }}
                            >

                                <TouchableNativeFeedback onPress={handleProfileNvigation}

                                >
                                    <View style={{ padding: wp(2) }}>
                                        <FontAwesome6 name="user" size={wp(7)} color={icon} />;
                                    </View>
                                </TouchableNativeFeedback>
                                {/* <TouchableNativeFeedback onPress={() => router.push("/Fleet/Profile/Index")}  >
                                    <View style={{ padding: wp(2) }}>
                                        <FontAwesome6 name="user" size={wp(7)} color={icon} />;
                                    </View>
                                </TouchableNativeFeedback>
                                  <TouchableNativeFeedback onPress={() => router.push("/Driver/Profile/Index")}  >
                                    <View style={{ padding: wp(2) }}>
                                        <FontAwesome6 name="user" size={wp(7)} color={icon} />;
                                    </View>
                                </TouchableNativeFeedback> */}

                                <View style={{}}>
                                    <View style={{}}>
                                        <ThemedText type="title" style={{ alignSelf: "center" }} >{pageTitle}</ThemedText>
                                        <ThemedText type="tiny" style={{ alignSelf: 'center' }}><ThemedText type='tiny' style={{ fontSize: wp(3), }}>
                                            {currentRole.companyName?.length > 5
                                                ? `${currentRole.companyName.slice(0, 5)}`
                                                : currentRole.companyName}
                                        </ThemedText> : {currentRole.accType} - {currentRole.userRole}
                                        </ThemedText>
                                    </View>
                                </View>


                                <View style={{ flexDirection: 'row', width: wp(26), justifyContent: "space-between", alignItems: 'center' }}>

                                    <TouchableNativeFeedback onPress={() => filterElement?.(true)}>
                                        <View >
                                            <Ionicons name={'filter'} size={wp(4)} color={icon} />
                                        </View>
                                    </TouchableNativeFeedback>


                                    {addingNavigate && <TouchableNativeFeedback onPress={() => router.push(addingNavigate as any)}>
                                        <Ionicons name="add" size={wp(7)} color={icon} />
                                    </TouchableNativeFeedback>}

                                    <TouchableNativeFeedback onPress={() => setDspMenu(true)} >
                                        <View >
                                            <Ionicons name="ellipsis-vertical" size={wp(5)} color={icon} />
                                        </View>
                                    </TouchableNativeFeedback>

                                </View>


                            </View>
                        }


                    </>
                )

                    : (
                        <View
                            style={{
                                backgroundColor: background,
                                paddingHorizontal: wp(2),
                                paddingVertical: wp(1),
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: wp(1),
                                paddingRight: 15
                            }}
                        >

                            <View style={{}}>
                                <ThemedText type="title" >{pageTitle}</ThemedText>
                                {pageTitle === "Tracking" && <ThemedText type='default' >Role: {currentRole.accType}
                                </ThemedText>}
                            </View>

                            <TouchableNativeFeedback onPress={() => setDspMenu(true)} style={{ marginLeft: 10 }} >
                                <View >
                                    <Ionicons name="ellipsis-vertical" size={wp(6)} color={icon} />
                                </View>
                            </TouchableNativeFeedback>



                        </View>
                    )
                }



                {/* {  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
               
                
                    <TouchableNativeFeedback onPress={()=>set`  DspMenu(true)}>
                        <View style={{ padding: wp(2) }}>
                            <Ionicons name="ellipsis-vertical" size={wp(7)} color={icon} />
                        </View>
                    </TouchableNativeFeedback>
                </View>}
            </View>} */}



            </View>

        </View>

    );
}