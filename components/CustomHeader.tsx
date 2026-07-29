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
import { Image } from 'expo-image';
import { selectImage, selectImageNoCrop } from '@/Utilities/imageUtils';
import ProfileImageModal from './selectImageNoCrop';

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
    const [profileImageModal, setProfileImageModal] = React.useState(false);
    const [selectedImage, setSelectedImage] = React.useState<any>(null);

    const handleSelectProfileImage = () => {
        selectImage((image) => {
            setSelectedImage(image);
            setProfileImageModal(true);
        });
    };


    console.log(currentRole)

    return (
        <View style={{ backgroundColor: background, }} >

            <UserMenuModal
                visible={dspMenu}
                onClose={() => setDspMenu(false)}
                user={user}
                onProfileUpdate={updateUserProfile}
            />

            <View>

                <ProfileImageModal
                    visible={profileImageModal}
                    image={selectedImage}
                    onClose={() => setProfileImageModal(false)}
                    onChangeImage={handleSelectProfileImage}

                />




                {(currentRole.accType === 'fleet' || currentRole.accType === 'brokerage' || currentRole.accType === "driver") ? (
                    <>
                        {currentRole.userRole === "create_Acc" ?
                            <View
                                style={{
                                    backgroundColor: background,
                                    paddingHorizontal: wp(3.5),
                                    paddingVertical: wp(1),
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: wp(1),
                                    paddingRight: 15,

                                }}
                            >

                                <View style={{}}>
                                    <ThemedText style={{ fontSize: 30, fontFamily: 'sfbold', }} >{pageTitle}</ThemedText>
                                    {pageTitle === "Tracking" && <ThemedText type='default' >Role: {currentRole.accType}
                                    </ThemedText>}
                                </View>

                                <View style={{ flexDirection: "row" }}>
                                    <View style={{ paddingRight: 20 }}>
                                        <TouchableNativeFeedback onPress={handleSelectProfileImage} style={{ paddingRight: 15 }}>
                                            <View
                                                style={{
                                                    padding: wp(1),
                                                    width: wp(9),
                                                    height: wp(9),
                                                    overflow: "hidden",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    borderWidth: 1,
                                                }}
                                            >

                                                {currentRole?.profilePhoto ? (
                                                    <Image
                                                        source={{ uri: currentRole.profilePhoto }}
                                                        style={{
                                                            width: "100%",
                                                            height: "100%"
                                                        }}
                                                    />
                                                ) : (
                                                    <View style={{ alignItems: "center" }}>
                                                        <Ionicons
                                                            name="person-add-outline"
                                                            size={wp(5)}
                                                            color={icon}
                                                        />

                                                        <ThemedText
                                                            type="tiny"
                                                            style={{
                                                                fontSize: wp(2.5),
                                                            }}
                                                        >
                                                            Photo
                                                        </ThemedText>
                                                    </View>
                                                )}

                                            </View>
                                        </TouchableNativeFeedback>
                                    </View>
                                    <TouchableNativeFeedback onPress={() => setDspMenu(true)} style={{ marginLeft: 10 }} >
                                        <View >
                                            <Ionicons name="ellipsis-vertical" size={wp(6)} color={icon} />
                                        </View>
                                    </TouchableNativeFeedback>
                                </View>


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

                                {currentRole.userRole && <TouchableNativeFeedback onPress={handleProfileNvigation}

                                >
                                    <View style={{ padding: wp(2) }}>
                                        <FontAwesome6 name="user" size={wp(7)} color={icon} />;
                                    </View>
                                </TouchableNativeFeedback>  }
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
                                        <ThemedText type="title" style={{ alignSelf: "center" }} >{pageTitle}</ThemedText>
                                      { currentRole.userRole && <ThemedText type="tiny" style={{ alignSelf: 'center' }}><ThemedText type='tiny' style={{ fontSize: wp(3), }}>
                                            {currentRole.companyName?.length > 5
                                                ? `${currentRole.companyName.slice(0, 5)}`
                                                : currentRole.companyName}
                                        </ThemedText> : {currentRole.accType} - {currentRole.userRole}
                                        </ThemedText>}
                                    </View>
                                


                                <View style={{ flexDirection: 'row', width: wp(26), justifyContent: "space-around", alignItems: 'center', }}>

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