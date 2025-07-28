import { ScrollView, StyleSheet, Text, TouchableNativeFeedback, View } from 'react-native'
import React from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import Heading from '@/components/Heading'
import { Image } from 'expo-image'
import { ThemedText } from '@/components/ThemedText'
import { useAuth } from '@/context/AuthContext'
import { useThemeColor } from '@/hooks/useThemeColor'
import { wp } from '@/constants/common'
import { AntDesign, Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import Divider from '@/components/Divider'
import Button from '@/components/Button'

const Settings = () => {

    const { user, Logout } = useAuth()

    const icon = useThemeColor('icon');
    const coolgray = useThemeColor('coolGray');
    const background = useThemeColor('background');
    const backgroundLight = useThemeColor('backgroundLight');

    const logout = async () => {
        const deed = await Logout();
    }
    return (
        <ScreenWrapper>
            <Heading page='Settings' />
            <ScrollView contentContainerStyle={{ padding: wp(4), }}>
                    <TouchableNativeFeedback onPress={() => router.push('/Account/Index')}>
                <View style={{ flexDirection: 'row', gap: wp(4), marginBottom: wp(4) }}>
                    <Image
                        style={{ backgroundColor: coolgray, borderRadius: 999, width: wp(15), height: wp(15) }}
                        source={{ uri: user?.photoURL || 'https://via.placeholder.com/100' }}
                    />
                    <View style={{ flex: 1 }}>
                        <ThemedText type='title'>{user?.organisation || '-'}</ThemedText>
                        <ThemedText type='tiny' color={icon}>{user?.email || 'Click button below to login'}</ThemedText>
                        {!user &&
                            <View style={{ marginTop: wp(2) }}>
                                <Button title='Login' onPress={() => router.push('/Account/Login')} />
                            </View>
                        }
                    </View>
                    {user &&
                        <View style={{ overflow: 'hidden', borderRadius: wp(10), alignSelf: 'flex-end' }}>
                                <View style={{ padding: wp(2), flex: 1, justifyContent: 'center' }}>
                                    <Ionicons name='chevron-forward' color={icon} size={wp(4)} />
                                </View>
                        </View>
                    }
                </View>
                            </TouchableNativeFeedback>

                {user &&
                    <ThemedText style={{ margin: wp(4) }} type='subtitle'>Account</ThemedText>
                }
                {user &&
                    <View style={{ gap: wp(1), padding: wp(2), marginBottom: wp(4), backgroundColor: backgroundLight, borderRadius: wp(4) }}>
                        <View style={{ borderRadius: wp(2), overflow: 'hidden' }}>
                            <TouchableNativeFeedback onPress={() => router.push('/Account/Edit')}>
                                <View style={{ backgroundColor: backgroundLight, padding: wp(4), flexDirection: 'row', gap: wp(3) }}>
                                    <AntDesign name='edit' size={wp(4)} color={icon} style={{ width: wp(6), textAlign: 'center' }} />
                                    <View>
                                        <ThemedText type='default'>
                                            Edit Account
                                        </ThemedText>
                                    </View>
                                </View>
                            </TouchableNativeFeedback>
                        </View>
                        <View style={{ borderRadius: wp(2), overflow: 'hidden' }}>
                            <TouchableNativeFeedback onPress={() => logout()}>
                                <View style={{ backgroundColor: backgroundLight, padding: wp(4), flexDirection: 'row', gap: wp(3) }}>
                                    <AntDesign name='logout' size={wp(4)} color={icon} style={{ width: wp(6), textAlign: 'center' }} />
                                    <View>
                                        <ThemedText type='default'>
                                            Logout
                                        </ThemedText>
                                    </View>
                                </View>
                            </TouchableNativeFeedback>
                        </View>
                        <View style={{ borderRadius: wp(2), overflow: 'hidden' }}>
                            <TouchableNativeFeedback onPress={() => router.push('/Account/Edit')}>
                                <View style={{ backgroundColor: backgroundLight, padding: wp(4), flexDirection: 'row', gap: wp(3) }}>
                                    <AntDesign name='deleteuser' size={wp(4)} color={icon} style={{ width: wp(6), textAlign: 'center' }} />
                                    <View>
                                        <ThemedText color='#ff0f35' type='default'>
                                            Delete Account
                                        </ThemedText>
                                    </View>
                                </View>
                            </TouchableNativeFeedback>
                        </View>
                    </View>
                }
            </ScrollView>
        </ScreenWrapper>
    )
}

export default Settings

const styles = StyleSheet.create({})