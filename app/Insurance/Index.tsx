import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAuth } from '@/context/AuthContext';
import Heading from '@/components/Heading';
import { wp, hp } from '@/constants/common';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import ScreenWrapper from '@/components/ScreenWrapper';

export default function InsuranceIndex() {
    const accent = useThemeColor('accent');
    const background = useThemeColor('background');
    const text = useThemeColor('text');

    return (
        <ScreenWrapper>
            <View style={[styles.container, { backgroundColor: background }]}>
                <Heading page='Insurance' />

                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.headerSection}>
                        <Text style={[styles.welcomeText, { color: text }]}>Welcome to Insurance Services</Text>
                        <Text style={[styles.subtitleText, { color: text }]}>Manage your insurance needs with ease</Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.simpleCard, { borderColor: accent }]}
                        onPress={() => router.push('/Insurance/RequestQuote')}
                    >
                        <Ionicons name="shield-checkmark" size={wp(8)} color={accent} />
                        <Text style={[styles.cardText, { color: text }]}>Request Insurance Quote</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.simpleCard, { borderColor: accent }]}
                        onPress={() => router.push('/Insurance/QuotationsDashboard')}
                    >
                        <Ionicons name="list" size={wp(8)} color={accent} />
                        <Text style={[styles.cardText, { color: text }]}>Quotations Dashboard</Text>
                    </TouchableOpacity>
                     <TouchableOpacity
                        style={[styles.simpleCard, { borderColor: accent }]}
                        onPress={() => router.push('/Insurance/UserDashboard')}
                    >
                        <Ionicons name="list" size={wp(8)} color={accent} />
                        <Text style={[styles.cardText, { color: text }]}>User Dashboard</Text>
                    </TouchableOpacity>

                    <View style={styles.infoSection}>
                        <Text style={[styles.infoTitle, { color: text }]}>How It Works</Text>
                        <Text style={[styles.infoText, { color: text }]}
                        >
                            1. Request a quote by providing your vehicle details{"\n"}
                            2. Select insurance firms you want quotations from{"\n"}
                            3. Compare quotes and choose the best option
                        </Text>
                    </View>
                </ScrollView>
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
    headerSection: {
        marginBottom: hp(4),
        alignItems: 'center',
    },
    welcomeText: {
        fontSize: wp(6),
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: wp(2),
    },
    subtitleText: {
        fontSize: wp(4),
        textAlign: 'center',
    },
    simpleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderRadius: wp(4),
        padding: wp(4),
        marginBottom: hp(2),
    },
    cardText: {
        fontSize: wp(4.5),
        fontWeight: 'bold',
        marginLeft: wp(3),
    },
    infoSection: {
        marginTop: hp(4),
    },
    infoTitle: {
        fontSize: wp(5),
        fontWeight: 'bold',
        marginBottom: wp(2),
    },
    infoText: {
        fontSize: wp(4),
        lineHeight: wp(5),
    },
});