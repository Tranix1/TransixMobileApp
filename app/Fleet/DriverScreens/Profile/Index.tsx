import React from 'react';
import { View, StyleSheet, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAuth } from '@/context/AuthContext';
import CustomHeader from '@/components/CustomHeader';
import AuthStatusModal from '@/components/AuthStatusModal';
import UserMenuModal from '@/components/UserMenuModal';
import { useAuthState } from '@/hooks/useAuthState';
import { router } from 'expo-router';

function Profile() {
    const background = useThemeColor('background');
    const backgroundLight = useThemeColor('backgroundLight');
    const text = useThemeColor('text');
    const accent = useThemeColor('accent');
    const icon = useThemeColor('icon');
    const coolGray = useThemeColor('coolGray');

    const {
        isAuthenticated,
        user,
        needsProfileSetup,
        needsEmailVerification,
        updateUserProfile
    } = useAuthState();

    const { currentRole } = useAuth();

    const [dspCreateAcc, setDspCreateAcc] = React.useState(false);
    const [dspVerifyAcc, setDspVerifyAcc] = React.useState(false);
    const [dspMenu, setDspMenu] = React.useState(false);

    const driver = React.useMemo(() => ({
        fullName: user?.displayName ?? 'David K. Ochieng',
        role: 'Senior Fleet Driver',
        status: 'Active',
        driverId: 'D-1983',
        rating: 4.9,
        reviews: 84,
        mileage: '96,400 km',
        trips: 152,
        onTime: '98%',
        license: 'KDL-321-981',
        truck: 'Volvo FH16',
        phone: user?.phoneNumber ?? '+254 712 345 678',
        email: user?.email ?? 'david.ochieng@transix.co.ke',
        experience: '7 years',
        region: 'Nairobi – Mombasa',
        photoUrl: 'https://via.placeholder.com/160?text=Driver',
        previousRoutes: [
            { route: 'Nairobi → Mombasa', date: 'Jun 3, 2026', status: 'Delivered', load: 'Fuel & Spares' },
            { route: 'Mombasa → Kisumu', date: 'May 26, 2026', status: 'Completed', load: 'Grain' },
            { route: 'Kisumu → Eldoret', date: 'May 20, 2026', status: 'Completed', load: 'Construction Materials' }
        ],
        comments: [
            { author: 'Fleet Manager', message: 'Always meets delivery windows and keeps the truck in excellent condition.' },
            { author: 'Operations Lead', message: 'Great communication, very responsive on long-haul jobs.' }
        ]
    }), [user]);

    const checkAuth = (theAction?: () => void) => {
        if (!isAuthenticated) {
            setDspCreateAcc(true);
            return;
        }

        if (needsProfileSetup) {
            router.push({ pathname: '/Account/Profile', params: { operation: 'create' } });
            return;
        }

        if (needsEmailVerification) {
            setDspVerifyAcc(true);
            return;
        }

        if (typeof theAction === 'function') {
            theAction();
        } else {
            setDspMenu(true);
        }
    };

    return (
        <View style={[styles.wrapper, { backgroundColor: background }]}> 
            <CustomHeader onPressMenu={() => checkAuth()} currentRole={currentRole} pageTitle="Driver Profile" />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={[styles.hero, { backgroundColor: accent + '15' }]}> 
                    <View style={styles.heroTop}>
                        <View style={[styles.avatarFrame, { borderColor: accent }]}> 
                            <Image source={{ uri: driver.photoUrl }} style={styles.avatar} />
                        </View>
                        <View style={styles.heroText}>
                            <Text style={[styles.name, { color: text }]}>{driver.fullName}</Text>
                            <Text style={[styles.subtitle, { color: icon }]}>{driver.role}</Text>
                            <View style={[styles.statusBadge, { backgroundColor: accent + '10' }]}> 
                                <Text style={[styles.statusText, { color: accent }]}>{driver.status}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.heroStats}>
                        <View style={[styles.statCard, { backgroundColor: backgroundLight }]}> 
                            <Text style={[styles.statValue, { color: text }]}>{driver.mileage}</Text>
                            <Text style={[styles.statLabel, { color: coolGray }]}>Mileage</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: backgroundLight }]}> 
                            <Text style={[styles.statValue, { color: text }]}>{driver.trips}</Text>
                            <Text style={[styles.statLabel, { color: coolGray }]}>Trips</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: backgroundLight }]}> 
                            <Text style={[styles.statValue, { color: text }]}>{driver.rating}</Text>
                            <Text style={[styles.statLabel, { color: coolGray }]}>Rating</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: backgroundLight }]}> 
                            <Text style={[styles.statValue, { color: text }]}>{driver.onTime}</Text>
                            <Text style={[styles.statLabel, { color: coolGray }]}>On-time</Text>
                        </View>
                    </View>
                </View>

                <View style={[styles.card, { backgroundColor: backgroundLight }]}> 
                    <Text style={[styles.sectionTitle, { color: text }]}>Driver information</Text>
                    <View style={styles.infoGrid}>
                        <View style={styles.infoItem}>
                            <Text style={[styles.infoLabel, { color: coolGray }]}>Driver ID</Text>
                            <Text style={[styles.infoValue, { color: text }]}>{driver.driverId}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={[styles.infoLabel, { color: coolGray }]}>License</Text>
                            <Text style={[styles.infoValue, { color: text }]}>{driver.license}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={[styles.infoLabel, { color: coolGray }]}>Assigned Truck</Text>
                            <Text style={[styles.infoValue, { color: text }]}>{driver.truck}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={[styles.infoLabel, { color: coolGray }]}>Region</Text>
                            <Text style={[styles.infoValue, { color: text }]}>{driver.region}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={[styles.infoLabel, { color: coolGray }]}>Experience</Text>
                            <Text style={[styles.infoValue, { color: text }]}>{driver.experience}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={[styles.infoLabel, { color: coolGray }]}>Phone</Text>
                            <Text style={[styles.infoValue, { color: text }]}>{driver.phone}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={[styles.infoLabel, { color: coolGray }]}>Email</Text>
                            <Text style={[styles.infoValue, { color: text }]}>{driver.email}</Text>
                        </View>
                    </View>
                </View>

                <View style={[styles.card, { backgroundColor: backgroundLight }]}> 
                    <View style={styles.sectionHeader}> 
                        <Text style={[styles.sectionTitle, { color: text }]}>Recent routes</Text>
                        <Text style={[styles.sectionMeta, { color: accent }]}>{driver.previousRoutes.length} records</Text>
                    </View>
                    {driver.previousRoutes.map((route, index) => (
                        <View key={index} style={[styles.routeItem, { backgroundColor: background }]}> 
                            <View style={styles.routeText}> 
                                <Text style={[styles.routeName, { color: text }]}>{route.route}</Text>
                                <Text style={[styles.routeDetail, { color: coolGray }]}>{route.date} · {route.load}</Text>
                            </View>
                            <View style={styles.routeStatus}> 
                                <Text style={[styles.routeStatusText, { color: accent }]}>{route.status}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={[styles.card, { backgroundColor: backgroundLight }]}> 
                    <View style={styles.sectionHeader}> 
                        <Text style={[styles.sectionTitle, { color: text }]}>Comments & rating</Text>
                        <Text style={[styles.sectionMeta, { color: accent }]}>{driver.rating} / 5</Text>
                    </View>
                    {driver.comments.map((comment, index) => (
                        <View key={index} style={[styles.commentCard, { backgroundColor: background }]}> 
                            <Text style={[styles.commentAuthor, { color: text }]}>{comment.author}</Text>
                            <Text style={[styles.commentBody, { color: icon }]}>{comment.message}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.actionRow}> 
                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: accent }]} onPress={() => {}}>
                        <Text style={styles.actionText}>Message Driver</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionButtonOutline, { borderColor: accent }]} onPress={() => {}}>
                        <Text style={[styles.actionTextOutline, { color: accent }]}>View Documents</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <AuthStatusModal
                visible={dspCreateAcc}
                onClose={() => setDspCreateAcc(false)}
                user={user}
                type="create"
            />

            <AuthStatusModal
                visible={dspVerifyAcc}
                onClose={() => setDspVerifyAcc(false)}
                user={user}
                type="verify"
            />

            <UserMenuModal
                visible={dspMenu}
                onClose={() => setDspMenu(false)}
                user={user}
                onProfileUpdate={updateUserProfile}
            />
        </View>
    );
}

export default Profile;

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 32,
    },
    hero: {
        borderRadius: 24,
        padding: 18,
        marginBottom: 20,
        overflow: 'hidden',
    },
    heroTop: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 18,
    },
    avatarFrame: {
        width: 92,
        height: 92,
        borderRadius: 24,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        backgroundColor: '#ffffff',
    },
    avatar: {
        width: 84,
        height: 84,
        borderRadius: 20,
    },
    heroText: {
        flex: 1,
    },
    name: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 10,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },
    heroStats: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    statCard: {
        flexBasis: '48%',
        borderRadius: 18,
        paddingVertical: 16,
        paddingHorizontal: 14,
        marginBottom: 12,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 6,
    },
    statLabel: {
        fontSize: 12,
    },
    card: {
        borderRadius: 24,
        padding: 18,
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    sectionMeta: {
        fontSize: 12,
        fontWeight: '700',
    },
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    infoItem: {
        width: '48%',
        marginBottom: 14,
    },
    infoLabel: {
        fontSize: 12,
        marginBottom: 6,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    routeItem: {
        borderRadius: 18,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    routeText: {
        flex: 1,
        paddingRight: 12,
    },
    routeName: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 5,
    },
    routeDetail: {
        fontSize: 12,
    },
    routeStatus: {
        borderRadius: 14,
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: 'rgba(0,0,0,0.03)',
    },
    routeStatusText: {
        fontSize: 12,
        fontWeight: '700',
    },
    commentCard: {
        borderRadius: 18,
        padding: 16,
        marginBottom: 12,
    },
    commentAuthor: {
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 6,
    },
    commentBody: {
        fontSize: 13,
        lineHeight: 19,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        flex: 1,
        borderRadius: 18,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    actionButtonOutline: {
        flex: 1,
        borderRadius: 18,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        marginLeft: 10,
        backgroundColor: 'transparent',
    },
    actionText: {
        fontSize: 14,
        color: '#ffffff',
        fontWeight: '700',
    },
    actionTextOutline: {
        fontSize: 14,
        fontWeight: '700',
    }
});
