import { ScrollView, StyleSheet, Text, TouchableNativeFeedback, View } from 'react-native'
import React from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import Heading from '@/components/Heading'
import { Image } from 'expo-image'
import { ThemedText } from '@/components/ThemedText'
import { useAuth } from '@/context/AuthContext'
import { useThemeColor } from '@/hooks/useThemeColor'
import { useAdminPermissions } from '@/hooks/useAdminPermissions'
import { wp } from '@/constants/common'
import { AntDesign, Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import Divider from '@/components/Divider'
import Button from '@/components/Button'
import AdminReferralCode from '@/components/AdminReferralCode'

const Settings = () => {

    const { user, Logout } = useAuth()
    const { isAdmin, hasPermissionSync, isSuperAdmin } = useAdminPermissions()

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
                            <TouchableNativeFeedback onPress={() => router.push('/Account/Profile')}>
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
                            <TouchableNativeFeedback onPress={() => router.push('/Account/Profile')}>
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

                {/* Admin Section */}
                {user && isAdmin && (
                    <>
                        <ThemedText style={{ margin: wp(4) }} type='subtitle'>Admin</ThemedText>
                        <View style={{ gap: wp(1), padding: wp(2), marginBottom: wp(4), backgroundColor: backgroundLight, borderRadius: wp(4) }}>
                            {/* Admin Referral Code - For All Admins */}
                            <View style={{ borderRadius: wp(2), overflow: 'hidden' }}>
                                <AdminReferralCode userEmail={user.email || ""} adminName={user.displayName} />
                            </View>
                            <View style={{ borderRadius: wp(2), overflow: 'hidden' }}>
                                <TouchableNativeFeedback onPress={() => router.push('/Account/Admin')}>
                                    <View style={{ backgroundColor: backgroundLight, padding: wp(4), flexDirection: 'row', gap: wp(3) }}>
                                        <Ionicons name='people-outline' size={wp(4)} color={icon} style={{ width: wp(6), textAlign: 'center' }} />
                                        <View style={{ flex: 1 }}>
                                            <ThemedText type='default'>
                                                Admin Panel
                                            </ThemedText>
                                            <ThemedText type='tiny' color={coolgray}>
                                                View all users on the platform
                                            </ThemedText>
                                        </View>
                                        <Ionicons name='chevron-forward' size={wp(4)} color={icon} />
                                    </View>
                                </TouchableNativeFeedback>
                            </View>
                            {isSuperAdmin() && (
                                <View style={{ borderRadius: wp(2), overflow: 'hidden' }}>
                                    <TouchableNativeFeedback onPress={() => router.push('/Account/Admin/AddAdmin')}>
                                        <View style={{ backgroundColor: backgroundLight, padding: wp(4), flexDirection: 'row', gap: wp(3) }}>
                                            <Ionicons name='person-add-outline' size={wp(4)} color={icon} style={{ width: wp(6), textAlign: 'center' }} />
                                            <View style={{ flex: 1 }}>
                                                <ThemedText type='default'>
                                                    Add Admin
                                                </ThemedText>
                                                <ThemedText type='tiny' color={coolgray}>
                                                    Assign admin roles to users
                                                </ThemedText>
                                            </View>
                                            <Ionicons name='chevron-forward' size={wp(4)} color={icon} />
                                        </View>
                                    </TouchableNativeFeedback>
                                </View>
                            )}
                            {isSuperAdmin() && (
                                <View style={{ borderRadius: wp(2), overflow: 'hidden' }}>
                                    <TouchableNativeFeedback onPress={() => router.push('/Account/Admin/UpdateVersion')}>
                                        <View style={{ backgroundColor: backgroundLight, padding: wp(4), flexDirection: 'row', gap: wp(3) }}>
                                            <Ionicons name='refresh-outline' size={wp(4)} color={icon} style={{ width: wp(6), textAlign: 'center' }} />
                                            <View style={{ flex: 1 }}>
                                                <ThemedText type='default'>
                                                    Update Version
                                                </ThemedText>
                                                <ThemedText type='tiny' color={coolgray}>
                                                    Update app version and force updates
                                                </ThemedText>
                                            </View>
                                            <Ionicons name='chevron-forward' size={wp(4)} color={icon} />
                                        </View>
                                    </TouchableNativeFeedback>
                                </View>
                            )}


                           {isSuperAdmin() && <View style={{ borderRadius: wp(2), overflow: 'hidden' }}>
                                          <TouchableNativeFeedback onPress={() => router.push('/Account/Admin/Rewards')}>
                                              <View style={{ backgroundColor: backgroundLight, padding: wp(4), flexDirection: 'row', gap: wp(3) }}>
                                                  <Ionicons name='gift-outline' size={wp(4)} color={icon} style={{ width: wp(6), textAlign: 'center' }} />
                                                  <View style={{ flex: 1 }}>
                                                      <ThemedText type='default'>
                                                          Manage Rewards
                                                      </ThemedText>
                                                      <ThemedText type='tiny' color={coolgray}>
                                                          View rewarded users and grant rewards
                                                      </ThemedText>
                                                  </View>
                                                  <Ionicons name='chevron-forward' size={wp(4)} color={icon} />
                                              </View>
                                          </TouchableNativeFeedback>
                                      </View>}


                            {isSuperAdmin() && (
                                <View style={{ borderRadius: wp(2), overflow: 'hidden' }}>
                                    <TouchableNativeFeedback onPress={() => router.push('/Account/Admin/ActionLogs')}>
                                        <View style={{ backgroundColor: backgroundLight, padding: wp(4), flexDirection: 'row', gap: wp(3) }}>
                                            <Ionicons name='list-outline' size={wp(4)} color={icon} style={{ width: wp(6), textAlign: 'center' }} />
                                            <View style={{ flex: 1 }}>
                                                <ThemedText type='default'>
                                                    Admin Action Logs
                                                </ThemedText>
                                                <ThemedText type='tiny' color={coolgray}>
                                                    View admin actions and email tracking
                                                </ThemedText>
                                            </View>
                                            <Ionicons name='chevron-forward' size={wp(4)} color={icon} />
                                        </View>
                                    </TouchableNativeFeedback>
                                </View>
                            )}
                            {hasPermissionSync('approve_trucks') && (
                                <View style={{ borderRadius: wp(2), overflow: 'hidden' }}>
                                    <TouchableNativeFeedback onPress={() => router.push('/Account/Admin/ApproveTrucks')}>
                                        <View style={{ backgroundColor: backgroundLight, padding: wp(4), flexDirection: 'row', gap: wp(3) }}>
                                            <Ionicons name='checkmark-circle-outline' size={wp(4)} color={icon} style={{ width: wp(6), textAlign: 'center' }} />
                                            <View style={{ flex: 1 }}>
                                                <ThemedText type='default'>
                                                    Approve Trucks
                                                </ThemedText>
                                                <ThemedText type='tiny' color={coolgray}>
                                                    Review and approve pending trucks
                                                </ThemedText>
                                            </View>
                                            <Ionicons name='chevron-forward' size={wp(4)} color={icon} />
                                        </View>
                                    </TouchableNativeFeedback>
                                </View>
                            )}
                            {hasPermissionSync('approve_truck_accounts') && (
                                <View style={{ borderRadius: wp(2), overflow: 'hidden' }}>
                                    <TouchableNativeFeedback onPress={() => router.push('/Account/Admin/ApproveTruckAccounts')}>
                                        <View style={{ backgroundColor: backgroundLight, padding: wp(4), flexDirection: 'row', gap: wp(3) }}>
                                            <Ionicons name='person-check-outline' size={wp(4)} color={icon} style={{ width: wp(6), textAlign: 'center' }} />
                                            <View style={{ flex: 1 }}>
                                                <ThemedText type='default'>
                                                    Approve Truck Accounts
                                                </ThemedText>
                                                <ThemedText type='tiny' color={coolgray}>
                                                    Review and approve truck personal details
                                                </ThemedText>
                                            </View>
                                            <Ionicons name='chevron-forward' size={wp(4)} color={icon} />
                                        </View>
                                    </TouchableNativeFeedback>
                                </View>
                            )}
                            {hasPermissionSync('approve_loads') && (
                                <View style={{ borderRadius: wp(2), overflow: 'hidden' }}>
                                    <TouchableNativeFeedback onPress={() => router.push('/Account/Admin/ApproveLoads')}>
                                        <View style={{ backgroundColor: backgroundLight, padding: wp(4), flexDirection: 'row', gap: wp(3) }}>
                                            <Ionicons name='cube-outline' size={wp(4)} color={icon} style={{ width: wp(6), textAlign: 'center' }} />
                                            <View style={{ flex: 1 }}>
                                                <ThemedText type='default'>
                                                    Approve Loads
                                                </ThemedText>
                                                <ThemedText type='tiny' color={coolgray}>
                                                    Review and approve pending load requests
                                                </ThemedText>
                                            </View>
                                            <Ionicons name='chevron-forward' size={wp(4)} color={icon} />
                                        </View>
                                    </TouchableNativeFeedback>
                                </View>
                            )}
                            {hasPermissionSync('approve_loads_accounts') && (
                                <View style={{ borderRadius: wp(2), overflow: 'hidden' }}>
                                    <TouchableNativeFeedback onPress={() => router.push('/Account/Admin/ApproveLoadsAccounts')}>
                                        <View style={{ backgroundColor: backgroundLight, padding: wp(4), flexDirection: 'row', gap: wp(3) }}>
                                            <Ionicons name='business-outline' size={wp(4)} color={icon} style={{ width: wp(6), textAlign: 'center' }} />
                                            <View style={{ flex: 1 }}>
                                                <ThemedText type='default'>
                                                    Approve Loads Accounts
                                                </ThemedText>
                                                <ThemedText type='tiny' color={coolgray}>
                                                    Review and approve load account details
                                                </ThemedText>
                                            </View>
                                            <Ionicons name='chevron-forward' size={wp(4)} color={icon} />
                                        </View>
                                    </TouchableNativeFeedback>
                                </View>
                            )}
                            {hasPermissionSync('manage_referrers') && (
                                <View style={{ borderRadius: wp(2), overflow: 'hidden' }}>
                                    <TouchableNativeFeedback onPress={() => router.push('/Account/ManageReferrers')}>
                                        <View style={{ backgroundColor: backgroundLight, padding: wp(4), flexDirection: 'row', gap: wp(3) }}>
                                            <Ionicons name='person-add-outline' size={wp(4)} color={icon} style={{ width: wp(6), textAlign: 'center' }} />
                                            <View style={{ flex: 1 }}>
                                                <ThemedText type='default'>
                                                    Manage Referrers
                                                </ThemedText>
                                                <ThemedText type='tiny' color={coolgray}>
                                                    Add and manage referrer codes
                                                </ThemedText>
                                            </View>
                                            <Ionicons name='chevron-forward' size={wp(4)} color={icon} />
                                        </View>
                                    </TouchableNativeFeedback>
                                </View>
                            )}
                            {hasPermissionSync('version_management') && (
                                <View style={{ borderRadius: wp(2), overflow: 'hidden' }}>
                                    <TouchableNativeFeedback onPress={() => router.push('/Account/VersionManagement')}>
                                        <View style={{ backgroundColor: backgroundLight, padding: wp(4), flexDirection: 'row', gap: wp(3) }}>
                                            <Ionicons name='settings-outline' size={wp(4)} color={icon} style={{ width: wp(6), textAlign: 'center' }} />
                                            <View style={{ flex: 1 }}>
                                                <ThemedText type='default'>
                                                    Version Management
                                                </ThemedText>
                                                <ThemedText type='tiny' color={coolgray}>
                                                    Manage app versions and updates
                                                </ThemedText>
                                            </View>
                                            <Ionicons name='chevron-forward' size={wp(4)} color={icon} />
                                        </View>
                                    </TouchableNativeFeedback>
                                </View>
                            )}
                            {hasPermissionSync('add_tracking_agent') && (
                                <View style={{ borderRadius: wp(2), overflow: 'hidden' }}>
                                    <TouchableNativeFeedback onPress={() => router.push('/Tracking/AddAgent')}>
                                        <View style={{ backgroundColor: backgroundLight, padding: wp(4), flexDirection: 'row', gap: wp(3) }}>
                                            <Ionicons name='person-add-outline' size={wp(4)} color={icon} style={{ width: wp(6), textAlign: 'center' }} />
                                            <View style={{ flex: 1 }}>
                                                <ThemedText type='default'>
                                                    Add Tracking Agent
                                                </ThemedText>
                                                <ThemedText type='tiny' color={coolgray}>
                                                    Add users as tracking agents
                                                </ThemedText>
                                            </View>
                                            <Ionicons name='chevron-forward' size={wp(4)} color={icon} />
                                        </View>
                                    </TouchableNativeFeedback>
                                </View>
                            )}
                            {hasPermissionSync('add_service_station_owner') && (
                                <View style={{ borderRadius: wp(2), overflow: 'hidden' }}>
                                    <TouchableNativeFeedback onPress={() => router.push('/Fuel/AddServiceStationOwner')}>
                                        <View style={{ backgroundColor: backgroundLight, padding: wp(4), flexDirection: 'row', gap: wp(3) }}>
                                            <Ionicons name='business-outline' size={wp(4)} color={icon} style={{ width: wp(6), textAlign: 'center' }} />
                                            <View style={{ flex: 1 }}>
                                                <ThemedText type='default'>
                                                    Add Service Station Owner
                                                </ThemedText>
                                                <ThemedText type='tiny' color={coolgray}>
                                                    Add users as service station owners
                                                </ThemedText>
                                            </View>
                                            <Ionicons name='chevron-forward' size={wp(4)} color={icon} />
                                        </View>
                                    </TouchableNativeFeedback>
                                </View>
                            )}
                            {hasPermissionSync('add_truck_stop_owner') && (
                                <View style={{ borderRadius: wp(2), overflow: 'hidden' }}>
                                    <TouchableNativeFeedback onPress={() => router.push('/TruckStop/AddTruckStopOwner')}>
                                        <View style={{ backgroundColor: backgroundLight, padding: wp(4), flexDirection: 'row', gap: wp(3) }}>
                                            <Ionicons name='car-outline' size={wp(4)} color={icon} style={{ width: wp(6), textAlign: 'center' }} />
                                            <View style={{ flex: 1 }}>
                                                <ThemedText type='default'>
                                                    Add Truck Stop Owner
                                                </ThemedText>
                                                <ThemedText type='tiny' color={coolgray}>
                                                    Add users as truck stop owners
                                                </ThemedText>
                                            </View>
                                            <Ionicons name='chevron-forward' size={wp(4)} color={icon} />
                                        </View>
                                    </TouchableNativeFeedback>
                                </View>
                            )}
                                  {hasPermissionSync('add_truck_stop_owner') && (
                                      <View style={{ borderRadius: wp(2), overflow: 'hidden' }}>
                                          <TouchableNativeFeedback onPress={() => router.push('/Insurance/ManageFirms')}>
                                              <View style={{ backgroundColor: backgroundLight, padding: wp(4), flexDirection: 'row', gap: wp(3) }}>
                                                  <Ionicons name='car-outline' size={wp(4)} color={icon} style={{ width: wp(6), textAlign: 'center' }} />
                                                  <View style={{ flex: 1 }}>
                                                      <ThemedText type='default'>
                                                          Manage Insurance Firms
                                                      </ThemedText>
                                                      <ThemedText type='tiny' color={coolgray}>
                                                          Manage insurance companies on the platform
                                                      </ThemedText>
                                                  </View>
                                                  <Ionicons name='chevron-forward' size={wp(4)} color={icon} />
                                              </View>
                                          </TouchableNativeFeedback>
                                      </View>
                                  )}
                                  {hasPermissionSync('manage_rewards') && (
                                      <View style={{ borderRadius: wp(2), overflow: 'hidden' }}>
                                          <TouchableNativeFeedback onPress={() => router.push('/Account/Admin/Rewards')}>
                                              <View style={{ backgroundColor: backgroundLight, padding: wp(4), flexDirection: 'row', gap: wp(3) }}>
                                                  <Ionicons name='gift-outline' size={wp(4)} color={icon} style={{ width: wp(6), textAlign: 'center' }} />
                                                  <View style={{ flex: 1 }}>
                                                      <ThemedText type='default'>
                                                          Manage Rewards
                                                      </ThemedText>
                                                      <ThemedText type='tiny' color={coolgray}>
                                                          View rewarded users and grant rewards
                                                      </ThemedText>
                                                  </View>
                                                  <Ionicons name='chevron-forward' size={wp(4)} color={icon} />
                                              </View>
                                          </TouchableNativeFeedback>
                                      </View>
                                  )}
                        </View>
                    </>
                )}
            </ScrollView>

        </ScreenWrapper>
    )
}

export default Settings

const styles = StyleSheet.create({})
