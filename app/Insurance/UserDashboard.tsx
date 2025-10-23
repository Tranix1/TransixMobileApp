import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { wp, hp } from '@/constants/common';
import ScreenWrapper from '@/components/ScreenWrapper';
import Heading from '@/components/Heading';
import { getUserInsuranceRequests } from '@/db/operations';

interface UserRequest {
    id: string;
    firmName: string;
    status: 'pending' | 'responded' | 'closed';
    response?: string;
    timeStamp: any;
}

export default function UserDashboard() {
    const accent = useThemeColor('accent');
    const background = useThemeColor('background');
    const text = useThemeColor('text');
    const textLight = useThemeColor('textlight');

    const [requests, setRequests] = useState<UserRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            setLoading(true);
            const userRequests = await getUserInsuranceRequests();
            setRequests(userRequests);
        } catch (error) {
            console.error('Error loading user requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadRequests();
        setRefreshing(false);
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'Unknown';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const renderRequestCard = (request: UserRequest) => (
        <View key={request.id} style={[styles.requestCard, { borderColor: accent }]}>
            <Text style={[styles.firmName, { color: text }]}>{request.firmName}</Text>
            <Text style={[styles.status, { color: textLight }]}>Status: {request.status}</Text>
            {request.response && (
                <Text style={[styles.response, { color: textLight }]}>Response: {request.response}</Text>
            )}
            <Text style={[styles.timestamp, { color: textLight }]}>Requested on: {formatDate(request.timeStamp)}</Text>
        </View>
    );

    return (
        <ScreenWrapper>
            <View style={[styles.container, { backgroundColor: background }]}>
                <Heading page='Your Requests' />

                {loading ? (
                    <ActivityIndicator size="large" color={accent} />
                ) : (
                    <ScrollView
                        contentContainerStyle={styles.content}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
                    >
                        {requests.map(renderRequestCard)}
                    </ScrollView>
                )}
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: wp(4),
    },
    requestCard: {
        borderWidth: 2,
        borderRadius: wp(4),
        padding: wp(4),
        marginBottom: hp(2),
    },
    firmName: {
        fontSize: wp(5),
        fontWeight: 'bold',
        marginBottom: wp(2),
    },
    status: {
        fontSize: wp(4),
        marginBottom: wp(1),
    },
    response: {
        fontSize: wp(4),
        marginBottom: wp(1),
    },
    timestamp: {
        fontSize: wp(3.5),
    },
});