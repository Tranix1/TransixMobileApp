import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import ScreenWrapper from '@/components/ScreenWrapper';
import Heading from '@/components/Heading';
import { useThemeColor } from '@/hooks/useThemeColor';
import { wp } from '@/constants/common';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { fetchDocuments, getUsers, getUsersByReferrerId, updateDocument } from '@/db/operations';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useAdminPermissions } from '@/hooks/useAdminPermissions';
import { router } from 'expo-router';
import { where } from 'firebase/firestore';
import { notifyUserById } from '@/Utilities/pushNotification';

interface User {
    id: string;
    email: string;
    displayName?: string;
    phoneNumber?: string;
    userType?: string;
    isActive?: boolean;
}

const Admin = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalUsers, setTotalUsers] = useState(0);

    const { user } = useAuth();
    const { isSuperAdmin } = useAdminPermissions();
    const background = useThemeColor('background') || Colors.light.background;
    const backgroundLight = useThemeColor('backgroundLight') || Colors.light.backgroundLight;
    const icon = useThemeColor('icon') || Colors.light.icon;
    const accent = useThemeColor('accent') || Colors.light.accent;
    const coolGray = useThemeColor('coolGray') || Colors.light.coolGray;

    const [verifiedOUnverified, setVerifiedUnverfied] = React.useState<"declined" | "approved" | "pending" | null>(null)

    const fetchUsers = async () => {
        setLoading(true);
        try {
            let usersData: any[] = [];
            let filters: any[] = [];


            // Super admin can see all users
            if (verifiedOUnverified === "approved") {

                filters = [
                    where("verificationStatus", "==", "approved"),

                ];

            } else if (verifiedOUnverified === "pending") {
                filters = [
                    where("verificationStatus", "==", "pending"),


                ];

            } else if (verifiedOUnverified === "declined") {
                filters = [
                    where("verificationStatus", "==", "declined"),

                ];
            }




            const result = await fetchDocuments("verifiedUsers", 200, undefined)

            setUsers(result.data);



        } catch (error) {
            console.error('Error fetching users:', error);
            setUsers([]);
            setTotalUsers(0);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchUsers();
    }, [verifiedOUnverified]);




    async function approveAcc(
        organizationId: string,
        organizationName: string,
        userId: string,
        adminName: string,
        accType: string,
    ) {
        const orgDBAcc = accType === "fleet" ? "fleets" : accType === "brokerage" ? "brokerages" : accType === "driver" ? "Drivers" : ""

        updateDocument("verifiedUsers", organizationId, {
            verificationStatus: 'approved',

        })

        updateDocument("organizationProfiles", organizationId, {
            verificationStatus: 'approved',

        })

        updateDocument(orgDBAcc, organizationId, {
            verificationStatus: 'approved',

        })

        const pathForNotification = accType === "fleet" ? `Fleet/FleetSelector/Index` : accType === "brokerage" ? "brokerage/BrokerageSelector/Index" : accType === "driver" ? "brokerage/BrokerageSelector/Index" : ""


        await notifyUserById(
            userId,
            `Hello ${adminName}`,
            `Your ${accType} account for ${organizationName}, has been approved and is now active. Thank you for choosing transix`,

            {
                pathname: pathForNotification,
            }, {
            type: "account_verification",
        }
        );


    }




    const renderUserItem = (user: any) => (
        <View key={user.id} style={[styles.userCard, { backgroundColor: background }]}>
            <View style={styles.userInfo}>
                <View style={[styles.avatar, { backgroundColor: accent }]}>
                    <Ionicons name="person" size={24} color="white" />
                </View>
                <View style={styles.userDetails}>
                    <ThemedText type="default" style={styles.userName}>
                        {user.organizationName || 'No Name'}
                    </ThemedText>

                    {user.phoneNumber && (
                        <ThemedText type="tiny" color={coolGray}>
                            {user.phoneNumber}
                        </ThemedText>
                    )}
                    <View style={styles.userMeta}>
                        <ThemedText type="tiny" color={coolGray}>
                            ID: {user.id.substring(0, 8)}...
                        </ThemedText>
                        {user.accType && (
                            <View style={[styles.userTypeBadge, { backgroundColor: accent }]}>
                                <ThemedText color="white" type="tiny">
                                    {user.accType} {user.verificationStatus}
                                </ThemedText>
                            </View>
                        )}
                    </View>
                </View>
            </View>




            <View style={{
                flexDirection: 'row',
                gap: wp(2),
                marginTop: wp(2),
            }}>


                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => approveAcc(user.organizationId, user.organizationName, user.userId, user.adminName, user.accType)}
                >
                    <Ionicons
                        name="alert-circle-outline"
                        size={16}
                        color={accent}
                    />

                    <ThemedText style={styles.actionButtonText}>
                        Approve
                    </ThemedText>

                </TouchableOpacity>

                {/* DRIVER */}
                <TouchableOpacity
                    style={styles.actionButton}

                >
                    <Ionicons name="person-circle-outline" size={16} color={accent} />
                    <ThemedText style={styles.actionButtonText}>Decline</ThemedText>
                </TouchableOpacity>

                {/* LOAD */}
                <TouchableOpacity
                    style={styles.actionButton}

                >
                    <Ionicons name="cube-outline" size={16} color={accent} />
                    <ThemedText style={styles.actionButtonText}>Hold</ThemedText>
                </TouchableOpacity>


                <TouchableOpacity
                    style={styles.actionButton}
                >
                    <Ionicons
                        name="alert-circle-outline"
                        size={16}
                        color={accent}
                    />

                    <ThemedText style={styles.actionButtonText}>
                        Hold
                    </ThemedText>

                </TouchableOpacity>



            </View>






        </View>
    );


    return (
        <ScreenWrapper>
            <Heading page={isSuperAdmin() ? 'Admin Panel - All Users' : 'Admin Panel - Your Referred Users'} />
            <ScrollView style={styles.container}>
                {/* User Count Summary */}
                <View style={[styles.summaryCard, { backgroundColor: backgroundLight }]}>
                    <View style={styles.summaryItem}>
                        <Ionicons name="people" size={24} color={accent} />
                        <ThemedText type="title" style={styles.summaryNumber}>
                            {totalUsers}
                        </ThemedText>
                        <ThemedText type="tiny" color={coolGray}>
                            Total Users
                        </ThemedText>
                    </View>
                    <View style={styles.summaryItem}>
                        <Ionicons name="checkmark-circle" size={24} color={accent} />
                        <ThemedText type="title" style={styles.summaryNumber}>
                            {users.filter(user => user.isActive !== false).length}
                        </ThemedText>
                        <ThemedText type="tiny" color={coolGray}>
                            Active Users
                        </ThemedText>
                    </View>
                </View>

                {/* Approval Actions */}
                <View style={[styles.approvalCard, { backgroundColor: backgroundLight }]}>
                    <ThemedText type="subtitle" style={styles.approvalTitle}>
                        Account Management
                    </ThemedText>
                    <View style={styles.approvalButtons}>
                        <TouchableOpacity
                            style={[styles.approvalButton, { backgroundColor: accent }]}
                            onPress={() => setVerifiedUnverfied(null)}
                        >
                            <Ionicons name="cube-outline" size={24} color="white" />
                            <ThemedText style={styles.approvalButtonText}>
                                All
                            </ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.approvalButton, { backgroundColor: accent }]}
                            onPress={() => setVerifiedUnverfied("pending")}
                        >
                            <Ionicons name="people-outline" size={24} color="white" />
                            <ThemedText style={styles.approvalButtonText}>
                                Pending
                            </ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.approvalButton, { backgroundColor: accent }]}
                            onPress={() => setVerifiedUnverfied("approved")}
                        >
                            <Ionicons name="people-outline" size={24} color="white" />
                            <ThemedText style={styles.approvalButtonText}>
                                Approved
                            </ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.approvalButton, { backgroundColor: accent }]}
                            onPress={() => setVerifiedUnverfied("declined")}

                        >
                            <Ionicons name="people-outline" size={24} color="white" />
                            <ThemedText style={styles.approvalButtonText}>
                                Declined
                            </ThemedText>
                        </TouchableOpacity>

                    </View>
                </View>



                {/* Users List */}
                <View style={styles.listContainer}>
                    <View style={styles.listHeader}>
                        <ThemedText type="default" style={styles.sectionTitle}>
                            {isSuperAdmin() ? `All Users (${totalUsers})` : `Your Referred Users (${totalUsers})`}
                        </ThemedText>
                        <TouchableOpacity
                            style={[styles.refreshButton, { backgroundColor: accent }]}
                            onPress={fetchUsers}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <Ionicons name="refresh" size={20} color="white" />
                            )}
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={accent} />
                            <ThemedText type="default" color={coolGray} style={styles.loadingText}>
                                Loading users...
                            </ThemedText>
                        </View>
                    ) : (
                        <View style={styles.usersList}>
                            {users.map(renderUserItem)}
                        </View>
                    )}
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: wp(4),
    },
    summaryCard: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: wp(4),
        borderRadius: wp(2),
        marginBottom: wp(4),
    },
    summaryItem: {
        alignItems: 'center',
        gap: wp(1),
    },
    summaryNumber: {
        fontWeight: 'bold',
        fontSize: 24,
    },
    approvalCard: {
        padding: wp(4),
        borderRadius: wp(2),
        marginBottom: wp(4),
    },
    approvalTitle: {
        marginBottom: wp(3),
        color: '#1E90FF',
    },
    approvalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: wp(2),
    },
    approvalButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: wp(2),
        borderRadius: wp(2),
        gap: wp(2),
    },
    approvalButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: wp(3),
    },
    listContainer: {
        flex: 1,
    }, actionButtonText: {
        color: "white",
        fontSize: 12,
        fontWeight: "600",
    },
    actionButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        gap: 4,
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: wp(3),
    },
    sectionTitle: {
        fontWeight: '600',
    },
    refreshButton: {
        padding: wp(2),
        borderRadius: wp(2),
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: wp(10),
    },
    loadingContainer: {
        alignItems: 'center',
        padding: wp(8),
        gap: wp(2),
    },
    loadingText: {
        marginTop: wp(2),
    },
    usersList: {
        gap: wp(2),
    },
    userCard: {
        padding: wp(3),
        borderRadius: wp(2),
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(3),
    },
    avatar: {
        width: wp(12),
        height: wp(12),
        borderRadius: wp(6),
        justifyContent: 'center',
        alignItems: 'center',
    },
    userDetails: {
        flex: 1,
    },
    userName: {
        fontWeight: '600',
        marginBottom: wp(1),
    },
    userMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: wp(1),
    },
    userTypeBadge: {
        paddingHorizontal: wp(2),
        paddingVertical: wp(1),
        borderRadius: wp(1),
    },
});

export default Admin;