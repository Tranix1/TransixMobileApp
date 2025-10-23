import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    ToastAndroid,
    RefreshControl,
} from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import CustomHeader from '@/components/CustomHeader';
import { wp, hp } from '@/constants/common';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import {
    getInsuranceQuotationRequestsForFirm,
    updateInsuranceQuotationRequestStatus,
    getInsuranceFirms,
} from '@/db/operations';
import ScreenWrapper from '@/components/ScreenWrapper';
import Heading from '@/components/Heading';
interface QuotationRequest {
    id: string;
    applicantName: string;
    applicantEmail: string;
    applicantPhone: string;
    companyName?: string;
    vehicleType: string;
    vehicleValue: number;
    coverageType: string;
    additionalInfo?: string;
    selectedFirmIds: string[];
    status: 'pending' | 'contacted' | 'quoted' | 'rejected';
    timeStamp: any;
    lastUpdatedBy?: string;
    lastUpdatedAt?: any;
}

interface InsuranceFirm {
    id: string;
    companyName: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: string;
    description: string;
    specialties: string[];
    licenseNumber: string;
    isActive: boolean;
}

export default function QuotationsDashboard() {
    const accent = useThemeColor('accent');
    const background = useThemeColor('background');
    const backgroundLight = useThemeColor('backgroundLight');
    const text = useThemeColor('text');
    const textLight = useThemeColor('textlight');
    const border = useThemeColor('border');

    // State
    const [requests, setRequests] = useState<QuotationRequest[]>([]);
    const [firms, setFirms] = useState<InsuranceFirm[]>([]);
    const [selectedFirmId, setSelectedFirmId] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'contacted' | 'quoted' | 'rejected'>('all');

    useEffect(() => {
        loadFirms();
    }, []);

    useEffect(() => {
        if (selectedFirmId) {
            loadRequests();
        }
    }, [selectedFirmId]);

    const loadFirms = async () => {
        try {
            const allFirms = await getInsuranceFirms();
            setFirms(allFirms);
            if (allFirms.length > 0) {
                setSelectedFirmId(allFirms[0].id);
            }
        } catch (error) {
            console.error('Error loading firms:', error);
            ToastAndroid.show('Failed to load insurance firms', ToastAndroid.SHORT);
        }
    };

    const loadRequests = async () => {
        if (!selectedFirmId) return;

        try {
            setLoading(true);
            const allRequests = await getInsuranceQuotationRequestsForFirm(selectedFirmId);
            setRequests(allRequests);
        } catch (error) {
            console.error('Error loading requests:', error);
            ToastAndroid.show('Failed to load quotation requests', ToastAndroid.SHORT);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadRequests();
        setRefreshing(false);
    };

    const handleStatusUpdate = async (requestId: string, newStatus: 'contacted' | 'quoted' | 'rejected') => {
        try {
            setLoading(true);
            await updateInsuranceQuotationRequestStatus(requestId, newStatus, selectedFirmId);
            ToastAndroid.show(`Request marked as ${newStatus}`, ToastAndroid.SHORT);
            loadRequests();
        } catch (error) {
            console.error('Error updating status:', error);
            ToastAndroid.show('Failed to update request status', ToastAndroid.SHORT);
        } finally {
            setLoading(false);
        }
    };

    const handleContactApplicant = (request: QuotationRequest) => {
        Alert.alert(
            'Contact Applicant',
            `Contact ${request.applicantName}?\n\nPhone: ${request.applicantPhone}\nEmail: ${request.applicantEmail}`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Call',
                    onPress: () => {
                        // In a real app, you would use Linking to make a phone call
                        ToastAndroid.show('Calling functionality would be implemented here', ToastAndroid.SHORT);
                        handleStatusUpdate(request.id, 'contacted');
                    }
                },
                {
                    text: 'Email',
                    onPress: () => {
                        // In a real app, you would use Linking to open email client
                        ToastAndroid.show('Email functionality would be implemented here', ToastAndroid.SHORT);
                        handleStatusUpdate(request.id, 'contacted');
                    }
                }
            ]
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return '#ff9800';
            case 'contacted': return '#2196f3';
            case 'quoted': return '#4caf50';
            case 'rejected': return '#f44336';
            default: return textLight;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return 'time';
            case 'contacted': return 'call';
            case 'quoted': return 'checkmark-circle';
            case 'rejected': return 'close-circle';
            default: return 'help-circle';
        }
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'Unknown';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const filteredRequests = requests.filter(request =>
        statusFilter === 'all' || request.status === statusFilter
    );

    const renderRequestCard = (request: QuotationRequest) => (
        <View key={request.id} style={[styles.requestCard, { backgroundColor: backgroundLight, borderColor: border }]}>
            <View style={styles.requestHeader}>
                <View style={styles.requestInfo}>
                    <Text style={[styles.applicantName, { color: text }]}>{request.applicantName}</Text>
                    {request.companyName && (
                        <Text style={[styles.companyName, { color: textLight }]}>{request.companyName}</Text>
                    )}
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
                    <Ionicons name={getStatusIcon(request.status)} size={16} color="white" />
                    <Text style={styles.statusText}>{request.status.toUpperCase()}</Text>
                </View>
            </View>

            <View style={styles.requestDetails}>
                <View style={styles.detailRow}>
                    <Ionicons name="car" size={16} color={textLight} />
                    <Text style={[styles.detailText, { color: textLight }]}>
                        {request.vehicleType} - {formatCurrency(request.vehicleValue)}
                    </Text>
                </View>
                <View style={styles.detailRow}>
                    <Ionicons name="shield" size={16} color={textLight} />
                    <Text style={[styles.detailText, { color: textLight }]}>
                        {request.coverageType}
                    </Text>
                </View>
                <View style={styles.detailRow}>
                    <Ionicons name="call" size={16} color={textLight} />
                    <Text style={[styles.detailText, { color: textLight }]}>
                        {request.applicantPhone}
                    </Text>
                </View>
                <View style={styles.detailRow}>
                    <Ionicons name="mail" size={16} color={textLight} />
                    <Text style={[styles.detailText, { color: textLight }]}>
                        {request.applicantEmail}
                    </Text>
                </View>
                <View style={styles.detailRow}>
                    <Ionicons name="time" size={16} color={textLight} />
                    <Text style={[styles.detailText, { color: textLight }]}>
                        {formatDate(request.timeStamp)}
                    </Text>
                </View>
            </View>

            {request.additionalInfo && (
                <View style={styles.additionalInfoContainer}>
                    <Text style={[styles.additionalInfoLabel, { color: text }]}>Additional Information:</Text>
                    <Text style={[styles.additionalInfoText, { color: textLight }]}>
                        {request.additionalInfo}
                    </Text>
                </View>
            )}

            {request.status === 'pending' && (
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        onPress={() => handleContactApplicant(request)}
                        style={[styles.actionButton, styles.contactButton, { backgroundColor: accent, alignItems: 'center', justifyContent: 'center' }]}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.actionButtonText}>Contact</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleStatusUpdate(request.id, 'quoted')}
                        style={[styles.actionButton, styles.quoteButton, { backgroundColor: '#4caf50', alignItems: 'center', justifyContent: 'center' }]}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.actionButtonText}>Quote</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleStatusUpdate(request.id, 'rejected')}
                        style={[styles.actionButton, styles.rejectButton, { backgroundColor: '#f44336', alignItems: 'center', justifyContent: 'center' }]}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.actionButtonText}>Reject</Text>
                    </TouchableOpacity>
                </View>
            )}

            {request.status === 'contacted' && (
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        onPress={() => handleStatusUpdate(request.id, 'quoted')}
                        style={[styles.actionButton, styles.quoteButton, { backgroundColor: '#4caf50', alignItems: 'center', justifyContent: 'center' }]}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.actionButtonText}>Mark as Quoted</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleStatusUpdate(request.id, 'rejected')}
                        style={[styles.actionButton, styles.rejectButton, { backgroundColor: '#f44336', alignItems: 'center', justifyContent: 'center' }]}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.actionButtonText}>Reject</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    return (
        <ScreenWrapper>

        <View style={[styles.container, { backgroundColor: background }]}>
<Heading page="Quotations Dashboard" />
            <View style={styles.content}>
                {/* Firm Selector */}
                <View style={styles.firmSelector}>
                    <Text style={[styles.selectorLabel, { color: text }]}>Select Insurance Firm:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {firms.map((firm) => (
                            <TouchableOpacity
                                key={firm.id}
                                style={[
                                    styles.firmChip,
                                    { borderColor: border },
                                    selectedFirmId === firm.id && { backgroundColor: accent, borderColor: accent }
                                ]}
                                onPress={() => setSelectedFirmId(firm.id)}
                            >
                                <Text style={[
                                    styles.firmChipText,
                                    { color: selectedFirmId === firm.id ? 'white' : text }
                                ]}>
                                    {firm.companyName}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Status Filter */}
                <View style={styles.statusFilter}>
                    <Text style={[styles.filterLabel, { color: text }]}>Filter by Status:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {[
                            { key: 'all', label: 'All' },
                            { key: 'pending', label: 'Pending' },
                            { key: 'contacted', label: 'Contacted' },
                            { key: 'quoted', label: 'Quoted' },
                            { key: 'rejected', label: 'Rejected' }
                        ].map((filter) => (
                            <TouchableOpacity
                                key={filter.key}
                                style={[
                                    styles.filterChip,
                                    { borderColor: border },
                                    statusFilter === filter.key && { backgroundColor: accent, borderColor: accent }
                                ]}
                                onPress={() => setStatusFilter(filter.key as any)}
                            >
                                <Text style={[
                                    styles.filterChipText,
                                    { color: statusFilter === filter.key ? 'white' : text }
                                ]}>
                                    {filter.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Requests List */}
                <ScrollView
                    style={styles.requestsList}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                    }
                >
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={accent} />
                            <Text style={[styles.loadingText, { color: textLight }]}>
                                Loading quotation requests...
                            </Text>
                        </View>
                    ) : filteredRequests.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="document-text" size={64} color={textLight} />
                            <Text style={[styles.emptyText, { color: textLight }]}>
                                No quotation requests found
                            </Text>
                            <Text style={[styles.emptySubtext, { color: textLight }]}>
                                {statusFilter === 'all'
                                    ? 'No requests have been submitted yet'
                                    : `No ${statusFilter} requests found`
                                }
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.requestsContainer}>
                            {filteredRequests.map(renderRequestCard)}
                        </View>
                    )}
                </ScrollView>
            </View>
        </View>
        </ScreenWrapper>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: wp(4),
    },
    firmSelector: {
        marginBottom: wp(4),
    },
    selectorLabel: {
        fontSize: wp(4),
        fontWeight: '600',
        marginBottom: wp(2),
    },
    firmChip: {
        paddingHorizontal: wp(4),
        paddingVertical: wp(2.5),
        borderRadius: wp(6),
        borderWidth: 1,
        marginRight: wp(2),
    },
    firmChipText: {
        fontSize: wp(3.5),
        fontWeight: '500',
    },
    statusFilter: {
        marginBottom: wp(4),
    },
    filterLabel: {
        fontSize: wp(4),
        fontWeight: '600',
        marginBottom: wp(2),
    },
    filterChip: {
        paddingHorizontal: wp(4),
        paddingVertical: wp(2.5),
        borderRadius: wp(6),
        borderWidth: 1,
        marginRight: wp(2),
    },
    filterChipText: {
        fontSize: wp(3.5),
        fontWeight: '500',
    },
    requestsList: {
        flex: 1,
    },
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: hp(5),
    },
    loadingText: {
        marginTop: wp(3),
        fontSize: wp(4),
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: hp(10),
    },
    emptyText: {
        fontSize: wp(5),
        fontWeight: 'bold',
        marginTop: wp(3),
    },
    emptySubtext: {
        fontSize: wp(4),
        marginTop: wp(1),
        textAlign: 'center',
    },
    requestsContainer: {
        gap: wp(3),
    },
    requestCard: {
        padding: wp(4),
        borderRadius: wp(3),
        borderWidth: 1,
    },
    requestHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: wp(3),
    },
    requestInfo: {
        flex: 1,
    },
    applicantName: {
        fontSize: wp(4.5),
        fontWeight: 'bold',
        marginBottom: wp(1),
    },
    companyName: {
        fontSize: wp(3.5),
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: wp(3),
        paddingVertical: wp(1.5),
        borderRadius: wp(4),
        gap: wp(1),
    },
    statusText: {
        color: 'white',
        fontSize: wp(3),
        fontWeight: '600',
    },
    requestDetails: {
        marginBottom: wp(3),
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: wp(1.5),
    },
    detailText: {
        fontSize: wp(3.5),
        marginLeft: wp(2),
        flex: 1,
    },
    additionalInfoContainer: {
        marginBottom: wp(3),
        padding: wp(3),
        borderRadius: wp(2),
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    additionalInfoLabel: {
        fontSize: wp(3.5),
        fontWeight: '600',
        marginBottom: wp(1),
    },
    additionalInfoText: {
        fontSize: wp(3.5),
        lineHeight: wp(4.5),
    },
    actionButtons: {
        flexDirection: 'row',
        gap: wp(2),
    },
    actionButton: {
        flex: 1,
        paddingVertical: wp(2.5),
        borderRadius: wp(2),
    },
    contactButton: {
        // backgroundColor set dynamically
    },
    quoteButton: {
        // backgroundColor set dynamically
    },
    rejectButton: {
        // backgroundColor set dynamically
    },
    actionButtonText: {
        color: 'white',
        fontSize: wp(3.5),
        fontWeight: '600',
        textAlign: 'center',
    },
});
