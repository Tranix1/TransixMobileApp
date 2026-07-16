import React from 'react';
import {
    View,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Image,
} from 'react-native';
import {
    Ionicons,
    MaterialCommunityIcons,
    FontAwesome6,
    Fontisto,
} from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { wp, hp } from '@/constants/common';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

import TodayCard from '@/components/DashboardTodayCard';
import FinanceCard from '@/components/DashboardFinanceCard';
import VehicleHealthCard from '@/components/DashboardVehicleHealthCard';
import AttentionCard from '@/components/AttentionCard';
import MyActivityCard from '@/components/DashboardMyActivtyCard';
// ---------------------------------------------------------------------------
// Brand palette (kept local to this screen so it doesn't depend on theme
// keys that may not exist yet in the design system).
// ---------------------------------------------------------------------------
const BRAND = {
    navy: '#12315C',
    teal: '#0E8C82',
    amber: '#E08A2C',
    good: '#1E8E5A',
    bad: '#C24343',
    info: '#4285F4',
};



// ---------------------------------------------------------------------------
// Small shared types
// ---------------------------------------------------------------------------
interface MiniStatRowProps {
    label: string;
    value: string | number;
    dotColor: string;
    border: string;
    textlight: string;
}

interface OverviewCardProps {
    title: string;
    iconElement: React.ReactNode;
    iconBg: string;
    primaryValue: string | number;
    primaryLabel: string;
    rows: { label: string; value: string | number; dotColor: string }[];
    background: string;
    backgroundLight: string;
    border: string;
    textlight: string;
        onPress?: () => void;

}

interface OperationsCardProps {
    title: string;
    subtitle: string;
    iconElement: React.ReactNode;
    iconBg: string;
    onPress: () => void;
    background: string;
    border: string;
    textlight: string;
}

interface AttentionItemProps {
    iconElement: React.ReactNode;
    iconBg: string;
    title: string;
    subtitle: string;
    actionLabel: string;
    onPress: () => void;
    primary?: boolean;
    border: string;
    textlight: string;
    accent: string;
    background: string;
}

interface ActivityItemProps {
    text: string;
    time: string;
    dotColor: string;
    isLast: boolean;
    border: string;
    textlight: string;
}

interface PerformanceStatProps {
    label: string;
    value: string;
    iconElement: React.ReactNode;
    backgroundLight: string;
    border: string;
    textlight: string;
}

interface QuickActionProps {
    label: string;
    iconElement: React.ReactNode;
    iconBg: string;
    onPress: () => void;
    background: string;
    border: string;
    textlight: string;
}

// ---------------------------------------------------------------------------
// Reusable pieces
// ---------------------------------------------------------------------------

const SectionHeader = ({
    title,
    actionLabel,
    onAction,
    textlight,
    accent,
}: {
    title: string;
    actionLabel?: string;
    onAction?: () => void;
    textlight: string;
    accent: string;
}) => (
    <View style={styles.sectionHeaderRow}>
        <ThemedText type="subtitle" style={styles.sectionHeaderTitle}>
            {title}
        </ThemedText>
        {actionLabel ? (
            <TouchableOpacity onPress={onAction} activeOpacity={0.7} style={styles.sectionHeaderAction}>
                <ThemedText type="tiny" style={{ color: accent, fontWeight: '700' }}>
                    {actionLabel}
                </ThemedText>
                <Ionicons name="chevron-forward" size={wp(3.2)} color={accent} />
            </TouchableOpacity>
        ) : null}
    </View>
);

const MiniStatRow = ({ label, value, dotColor, border, textlight }: MiniStatRowProps) => (
    <View style={[styles.miniStatRow, { borderTopColor: border }]}>
        <View style={styles.miniStatLabelWrap}>
            <View style={[styles.dot, { backgroundColor: dotColor }]} />
            <ThemedText type="tiny" style={{ color: textlight }}>
                {label}
            </ThemedText>
        </View>
        <ThemedText type="tiny" style={styles.miniStatValue}>
            {value}
        </ThemedText>
    </View>
);

const OverviewCard = ({
    title,
    iconElement,
    iconBg,
    primaryValue,
    primaryLabel,
    rows,
    background,
    backgroundLight,
    border,
    textlight,
    onPress,
}: OverviewCardProps) => (
    <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        disabled={!onPress}
        style={[
            styles.overviewCard,
            {
                backgroundColor: background,
                borderColor: border,
            },
        ]}
    >
        <View>
            <View style={styles.overviewCardHead}>
                <View
                    style={[
                        styles.overviewIconWrap,
                        { backgroundColor: iconBg },
                    ]}
                >
                    {iconElement}
                </View>

                <ThemedText type="tiny" style={styles.overviewCardTitle}>
                    {title}
                </ThemedText>
            </View>

            <ThemedText style={styles.overviewPrimaryValue}>
                {primaryValue}
            </ThemedText>

            <ThemedText
                type="tiny"
                style={{ color: textlight, marginBottom: hp(1) }}
            >
                {primaryLabel}
            </ThemedText>

            <View>
                {rows.map((row, index) => (
                    <MiniStatRow
                        key={`${title}-${row.label}-${index}`}
                        label={row.label}
                        value={row.value}
                        dotColor={row.dotColor}
                        border={border}
                        textlight={textlight}
                    />
                ))}
            </View>
        </View>
    </TouchableOpacity>
);




const ActivityItem = ({ text, time, dotColor, isLast, border, textlight }: ActivityItemProps) => (
    <View style={styles.activityItem}>
        <View style={styles.activityRail}>
            <View style={[styles.activityDot, { backgroundColor: dotColor }]} />
            {!isLast && <View style={[styles.activityLine, { backgroundColor: border }]} />}
        </View>
        <View style={{ flex: 1, paddingBottom: hp(1.6) }}>
            <ThemedText type="tiny" style={styles.activityText}>
                {text}
            </ThemedText>
            <ThemedText type="tiny" style={{ color: textlight, marginTop: hp(0.2) }}>
                {time}
            </ThemedText>
        </View>
    </View>
);

const PerformanceStat = ({ label, value, iconElement, backgroundLight, border, textlight }: PerformanceStatProps) => (
    <View style={[styles.perfStat, { backgroundColor: backgroundLight, borderColor: border }]}>
        {iconElement}
        <ThemedText style={styles.perfValue}>{value}</ThemedText>
        <ThemedText type="tiny" style={{ color: textlight, textAlign: 'center' }}>
            {label}
        </ThemedText>
    </View>
);

const QuickAction = ({ label, iconElement, iconBg, onPress, background, border, textlight }: QuickActionProps) => (
    <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.75}
        style={[styles.quickActionBtn, { backgroundColor: background, borderColor: border }]}
    >
        <View style={[styles.quickActionIconWrap, { backgroundColor: iconBg }]}>{iconElement}</View>
        <ThemedText type="tiny" style={[styles.quickActionLabel, { color: textlight }]} numberOfLines={2}>
            {label}
        </ThemedText>
    </TouchableOpacity>
);










// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------
export default function TransixDashboard() {
    const { user } = useAuth();

    const accent = useThemeColor('accent');
    const icon = useThemeColor('icon');
    const backgroundColor = useThemeColor('backgroundLight');
    const background = useThemeColor('background');
    const textlight = useThemeColor('textlight');
    const border = useThemeColor('border');

    const companyName = user?.displayName || 'Transix Fleet Operator';
    const profileUri = (user as any)?.photoURL as string | undefined;
    const initials = companyName
        .split(' ')
        .map((w) => w[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const pipelineSteps = [
        { label: 'Created', count: 36, done: true },
        { label: 'Approved', count: 30, done: true },
        { label: 'Assigned', count: 24, done: true },
        { label: 'Picked Up', count: 17, done: false },
        { label: 'Delivered', count: 9, done: false },
    ];

    return (
        <View style={[styles.safeArea, { backgroundColor: background }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* ============================= HEADER ============================= */}
                <View style={styles.headerRow}>
                    <View style={styles.headerLeft}>
                        {profileUri ? (
                            <Image source={{ uri: profileUri }} style={styles.avatarImage} />
                        ) : (
                            <View style={[styles.avatarFallback, { backgroundColor: BRAND.navy }]}>
                                <ThemedText style={styles.avatarInitials}>{initials || 'TX'}</ThemedText>
                            </View>
                        )}
                        <View style={{ flexShrink: 1 }}>
                            <ThemedText type="subtitle" style={styles.headerName} numberOfLines={1}>
                                {companyName}
                            </ThemedText>
                            <View style={styles.headerMetaRow}>
                                <View style={styles.ratingWrap}>
                                    <Ionicons name="star" size={wp(3.2)} color={BRAND.amber} />
                                    <ThemedText type="tiny" style={{ color: textlight, marginLeft: wp(1) }}>
                                        4.8
                                    </ThemedText>
                                </View>
                                <View style={[styles.statusPill, { backgroundColor: `${BRAND.good}1F` }]}>
                                    <View style={[styles.statusDot, { backgroundColor: BRAND.good }]} />
                                    <ThemedText type="tiny" style={{ color: BRAND.good, fontWeight: '700' }}>
                                        Active
                                    </ThemedText>
                                </View>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.75}
                        style={[styles.notifBtn, { backgroundColor: backgroundColor, borderColor: border }]}
                    >
                        <Ionicons name="notifications-outline" size={wp(5)} color={icon} />
                        <View style={[styles.notifDot, { borderColor: background }]} />
                    </TouchableOpacity>
                </View>





                {/* ======================= AttentionCard ======================= */}



<>
<SectionHeader
    title="Needs Attention"
    actionLabel="View All"
    textlight={textlight}
    accent={accent}
/>

<AttentionCard
    title="Drivers"
    subtitle="Awaiting trip acceptance"
    count={3}
    icon="people-outline"
    color={BRAND.amber}
    background={background}
    border={border}
    textlight={textlight}
    onPress={() => router.push('/Driver/DriverSelector/Index')}
/>

<AttentionCard
    title="Loads"
    subtitle="Waiting approval"
    count={5}
    icon="cube-outline"
    color={BRAND.teal}
    background={background}
    border={border}
    textlight={textlight}
    onPress={() => router.push('/Logistics/Loads/AddLoads')}
/>

<AttentionCard
    title="Fleet"
    subtitle="Vehicles need servicing"
    count={2}
    icon="car-sport-outline"
    color={BRAND.bad}
    background={background}
    border={border}
    textlight={textlight}
    onPress={() => router.push('/Fleet/Admin')}
 />

<AttentionCard
    title="Assignments"
    subtitle="Pending confirmation"
    count={4}
    icon="clipboard-outline"
    color={BRAND.navy}
    background={background}
    border={border}
    textlight={textlight}
    onPress={() => router.push('/Assignments/Index')}
/>

<AttentionCard
    title="Finance"
    subtitle="Overdue payments"
    count={1}
    icon="wallet-outline"
    color={BRAND.good}
    background={background}
    border={border}
    textlight={textlight}
    onPress={() => router.push('/Wallet/WalletHistory')}
/>
</>



<>

<SectionHeader
    title="My Activity"
    actionLabel="View All"
    textlight={textlight}
    accent={accent}
/>


<MyActivityCard
    title="My Loads"
    subtitle="Loads created and managed by you"
    value="24"
    icon="cube-outline"
    color={BRAND.teal}
    background={background}
    border={border}
    textlight={textlight}
    onPress={() => router.push('/Logistics/AddHome')}
/>


<MyActivityCard
    title="Booked Trucks"
    subtitle="Trucks currently booked"
    value="8"
    icon="truck-outline"
    color={BRAND.navy}
    background={background}
    border={border}
    textlight={textlight}
    onPress={() => router.push('/Fleet/Admin/Index')}
/>


<MyActivityCard
    title="My Assignments"
    subtitle="Assignments you manage"
    value="15"
    icon="clipboard-outline"
    color={BRAND.amber}
    background={background}
    border={border}
    textlight={textlight}
    onPress={() => router.push('/Assignments/Index')}
/>


<MyActivityCard
    title="My Trips"
    subtitle="Active trips in progress"
    value="6"
    icon="map-marker-path"
    color={BRAND.good}
    background={background}
    border={border}
    textlight={textlight}
    onPress={() => router.push('/Tracking/Index')}
/>


</>


                {/* ======================= Today Card ======================= */}



    <TodayCard
                    background={background}
                    backgroundLight={backgroundColor}
                    border={border}
                    textlight={textlight}
                />



                {/* ======================= BUSINESS OVERVIEW ======================= */}
                <SectionHeader title="Business Overview" textlight={textlight} accent={accent} />
                <View style={styles.overviewGrid}>
                    <OverviewCard
                        title="Trucks"
                        iconElement={<Fontisto name="truck" size={wp(4)} color={BRAND.navy} />}
                        iconBg={`${BRAND.navy}1A`}
                        primaryValue={128}
                        primaryLabel="Total fleet size"
                        rows={[
                            { label: 'Available', value: 41, dotColor: BRAND.good },
                            { label: 'On Trip', value: 79, dotColor: BRAND.teal },
                            { label: 'Maintance', value: 22, dotColor: BRAND.good },

                        ]}
                        background={background}
                        backgroundLight={backgroundColor}
                        border={border}
                        textlight={textlight}
                    />
                    <OverviewCard
                        title="Loads"
                        iconElement={<FontAwesome6 name="box" size={wp(4)} color={BRAND.teal} />}
                        iconBg={`${BRAND.teal}1A`}
                        primaryValue={36}
                        primaryLabel="In the system today"
                        rows={[
                            { label: 'Active', value: 24, dotColor: BRAND.teal },
                            { label: 'Pending', value: 12, dotColor: BRAND.amber },
                        ]}
                        background={background}
                        backgroundLight={backgroundColor}
                        border={border}
                        textlight={textlight}
                    />
                    <OverviewCard
                        title="Assignments"
                        iconElement={
                            <MaterialCommunityIcons name="clipboard-list-outline" size={wp(4)} color={BRAND.amber} />
                        }
                        iconBg={`${BRAND.amber}1A`}
                        primaryValue={57}
                        primaryLabel="Tracked this week"
                        rows={[
                            { label: 'Pending Approval', value: 6, dotColor: BRAND.amber },
                            { label: 'Active Trips', value: 29, dotColor: BRAND.teal },
                            { label: 'Completed', value: 22, dotColor: BRAND.good },
                        ]}
                        background={background}
                        backgroundLight={backgroundColor}
                        border={border}
                        textlight={textlight}
                        onPress={()=>router.push("/Assignments/Index")}
                    />
                    <OverviewCard
                        title="Finance"
                        iconElement={<Ionicons name="cash-outline" size={wp(4)} color={BRAND.good} />}
                        iconBg={`${BRAND.good}1A`}
                        primaryValue="$184,320"
                        primaryLabel="Net profit this month"
                        rows={[
                            { label: 'Revenue', value: '$412,900', dotColor: BRAND.good },
                            { label: 'Expenses', value: '$228,580', dotColor: BRAND.bad },
                        ]}
                        background={background}
                        backgroundLight={backgroundColor}
                        border={border}
                        textlight={textlight}
                            onPress={() => router.push("/Fleet/Finance/Index")}

                    />


                    <OverviewCard
                        title="Drivers"
                        iconElement={<Ionicons name="cash-outline" size={wp(4)} color={BRAND.good} />}
                        iconBg={`${BRAND.good}1A`}
                        primaryValue="$184,320"
                        primaryLabel="Net profit this month"
                        rows={[
                            { label: 'Revenue', value: '$412,900', dotColor: BRAND.good },
                            { label: 'Expenses', value: '$228,580', dotColor: BRAND.bad },
                        ]}
                        background={background}
                        backgroundLight={backgroundColor}
                        border={border}
                        textlight={textlight}
                    />
                    <OverviewCard
                        title="Trailers"
                        iconElement={<Ionicons name="cash-outline" size={wp(4)} color={BRAND.good} />}
                        iconBg={`${BRAND.good}1A`}
                        primaryValue="$184,320"
                        primaryLabel="Net profit this month"
                        rows={[
                            { label: 'Revenue', value: '$412,900', dotColor: BRAND.good },
                            { label: 'Expenses', value: '$228,580', dotColor: BRAND.bad },
                        ]}
                        background={background}
                        backgroundLight={backgroundColor}
                        border={border}
                        textlight={textlight}
                    />



                </View>

             






            



                {/* Loads pipeline */}
                <View style={[styles.pipelineCard, { backgroundColor: background, borderColor: border }]}>
                    <ThemedText type="tiny" style={styles.pipelineTitle}>
                        Loads Pipeline
                    </ThemedText>
                    <View style={styles.pipelineRow}>
                        {pipelineSteps.map((step, index) => (
                            <React.Fragment key={step.label}>
                                <View style={styles.pipelineStepWrap}>
                                    <View
                                        style={[
                                            styles.pipelineDot,
                                            {
                                                backgroundColor: step.done ? BRAND.teal : backgroundColor,
                                                borderColor: step.done ? BRAND.teal : border,
                                            },
                                        ]}
                                    >
                                        {step.done && <Ionicons name="checkmark" size={wp(2.6)} color="#fff" />}
                                    </View>
                                    <ThemedText type="tiny" style={styles.pipelineCount}>
                                        {step.count}
                                    </ThemedText>
                                    <ThemedText type="tiny" style={{ color: textlight, textAlign: 'center' }} numberOfLines={1}>
                                        {step.label}
                                    </ThemedText>
                                </View>
                                {index < pipelineSteps.length - 1 && (
                                    <View
                                        style={[
                                            styles.pipelineConnector,
                                            { backgroundColor: step.done ? BRAND.teal : border },
                                        ]}
                                    />
                                )}
                            </React.Fragment>
                        ))}
                    </View>
                </View>




                <VehicleHealthCard
                    background={background}
                    border={border}
                />

                {/* ============================ FINANCE CENTRE ============================ */}

                <SectionHeader
                    title="Finance Centre"
                    actionLabel="View all"
                    onAction={() => router.push('/Wallet/WalletHistory')}
                    textlight={textlight}
                    accent={accent}
                />


                <FinanceCard
                    background={background}
                    border={border}
                    textlight={textlight}
                />

                {/* ========================= PERFORMANCE OVERVIEW ========================= */}
                <SectionHeader title="Performance Overview" textlight={textlight} accent={accent} />
                <View style={styles.performanceGrid}>
                    <PerformanceStat
                        label="Completed Trips"
                        value="342"
                        iconElement={<MaterialCommunityIcons name="truck-check" size={wp(4.4)} color={BRAND.navy} />}
                        backgroundLight={backgroundColor}
                        border={border}
                        textlight={textlight}
                    />
                    <PerformanceStat
                        label="On-Time Delivery"
                        value="96%"
                        iconElement={<MaterialCommunityIcons name="clock-check-outline" size={wp(4.4)} color={BRAND.good} />}
                        backgroundLight={backgroundColor}
                        border={border}
                        textlight={textlight}
                    />
                    <PerformanceStat
                        label="Acceptance Rate"
                        value="88%"
                        iconElement={<MaterialCommunityIcons name="account-check" size={wp(4.4)} color={BRAND.teal} />}
                        backgroundLight={backgroundColor}
                        border={border}
                        textlight={textlight}
                    />
                    <PerformanceStat
                        label="Response Time"
                        value="12m"
                        iconElement={<Ionicons name="speedometer-outline" size={wp(4.4)} color={BRAND.amber} />}
                        backgroundLight={backgroundColor}
                        border={border}
                        textlight={textlight}
                    />
                    <PerformanceStat
                        label="Rating"
                        value="4.8"
                        iconElement={<Ionicons name="star" size={wp(4.4)} color={BRAND.amber} />}
                        backgroundLight={backgroundColor}
                        border={border}
                        textlight={textlight}
                    />
                </View>


                {/* ============================ RECENT ACTIVITY ============================ */}
                <SectionHeader title="Recent Activity" textlight={textlight} accent={accent} />
                <View style={[styles.listCard, { backgroundColor: background, borderColor: border, paddingVertical: hp(1) }]}>
                    <ActivityItem
                        text="New load created — Bulawayo to Gaborone, 28t"
                        time="12:58"
                        dotColor={BRAND.navy}
                        isLast={false}
                        border={border}
                        textlight={textlight}
                    />
                    <ActivityItem
                        text="Booking accepted by carrier for load #4432"
                        time="13:12"
                        dotColor={BRAND.teal}
                        isLast={false}
                        border={border}
                        textlight={textlight}
                    />
                    <ActivityItem
                        text="Driver T. Moyo assigned to trip TX-8823"
                        time="13:47"
                        dotColor={BRAND.teal}
                        isLast={false}
                        border={border}
                        textlight={textlight}
                    />
                    <ActivityItem
                        text="Trip TX-8823 marked completed — Mutare to Harare"
                        time="14:22"
                        dotColor={BRAND.good}
                        isLast={false}
                        border={border}
                        textlight={textlight}
                    />
                    <ActivityItem
                        text="Payment received — Invoice #TX-4390, $6,240.00"
                        time="15:05"
                        dotColor={BRAND.good}
                        isLast={true}
                        border={border}
                        textlight={textlight}
                    />
                </View>

                {/* ============================== QUICK ACTIONS ============================== */}
                <SectionHeader title="Quick Actions" textlight={textlight} accent={accent} />
                <View style={styles.quickActionsGrid}>
                    <QuickAction
                        label="Add Load"
                        iconElement={<FontAwesome6 name="box" size={wp(4.4)} color={BRAND.navy} />}
                        iconBg={`${BRAND.navy}1A`}
                        onPress={() => router.push('/Logistics/Loads/AddLoads')}
                        background={background}
                        border={border}
                        textlight={textlight}
                    />
                    <QuickAction
                        label="Create Booking"
                        iconElement={<Ionicons name="calendar-outline" size={wp(4.4)} color={BRAND.teal} />}
                        iconBg={`${BRAND.teal}1A`}
                        onPress={() => router.push('/BooksAndBids/ViewBidsAndBooks')}
                        background={background}
                        border={border}
                        textlight={textlight}
                    />
                    <QuickAction
                        label="View Assignments"
                        iconElement={<MaterialCommunityIcons name="clipboard-list-outline" size={wp(4.4)} color={BRAND.amber} />}
                        iconBg={`${BRAND.amber}1A`}
                        onPress={() => router.push('/Assignments/Index')}
                        background={background}
                        border={border}
                        textlight={textlight}
                    />
                    <QuickAction
                        label="Finance Centre"
                        iconElement={<Ionicons name="cash-outline" size={wp(4.4)} color={BRAND.good} />}
                        iconBg={`${BRAND.good}1A`}
                        onPress={() => router.push('/Wallet/DepositAndWithdraw')}
                        background={background}
                        border={border}
                        textlight={textlight}
                    />
                    <QuickAction
                        label="Track Vehicles"
                        iconElement={<MaterialCommunityIcons name="map-marker-radius" size={wp(4.4)} color={BRAND.info} />}
                        iconBg={`${BRAND.info}1A`}
                        onPress={() => router.push('/Tracking/Index')}
                        background={background}
                        border={border}
                        textlight={textlight}
                    />
                </View>
            </ScrollView>
        </View>
    );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: wp(4),
        paddingTop: hp(1.5),
        paddingBottom: hp(4),
    },

    // Header
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: hp(2.4),
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(3),
        flexShrink: 1,
    },
    avatarImage: {
        width: wp(12),
        height: wp(12),
        borderRadius: wp(6),
    },
    avatarFallback: {
        width: wp(12),
        height: wp(12),
        borderRadius: wp(6),
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitials: {
        color: '#fff',
        fontWeight: '700',
        fontSize: wp(3.6),
    },
    headerName: {
        fontWeight: '800',
        fontSize: wp(4),
    },
    headerMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(2),
        marginTop: hp(0.4),
    },
    ratingWrap: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(1.2),
        paddingHorizontal: wp(2),
        paddingVertical: hp(0.3),
        borderRadius: wp(3),
    },
    statusDot: {
        width: wp(1.6),
        height: wp(1.6),
        borderRadius: wp(1),
    },
    notifBtn: {
        width: wp(10.5),
        height: wp(10.5),
        borderRadius: wp(3),
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    notifDot: {
        position: 'absolute',
        top: wp(2),
        right: wp(2),
        width: wp(2),
        height: wp(2),
        borderRadius: wp(1),
        backgroundColor: BRAND.amber,
        borderWidth: 1.5,
    },

    // Section header
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: hp(1.2),
        marginBottom: hp(1.2),
    },
    sectionHeaderTitle: {
        fontWeight: '800',
        fontSize: wp(3.8),
    },
    sectionHeaderAction: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(0.5),
    },

    // Overview cards
    overviewGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: hp(1),
    },
    overviewCard: {
        width: '48.5%',
        borderWidth: 1,
        borderRadius: wp(4),
        padding: wp(3.4),
        marginBottom: wp(3),
    },
    overviewCardHead: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(2),
        marginBottom: hp(1.2),
    },
    overviewIconWrap: {
        width: wp(7.5),
        height: wp(7.5),
        borderRadius: wp(2.2),
        alignItems: 'center',
        justifyContent: 'center',
    },
    overviewCardTitle: {
        fontWeight: '700',
        fontSize: wp(3.2),
    },
    overviewPrimaryValue: {
        fontWeight: '800',
        fontSize: wp(6),
        marginBottom: hp(0.2),
    },
    miniStatRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: hp(0.7),
        borderTopWidth: 1,
    },
    miniStatLabelWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(1.6),
    },
    dot: {
        width: wp(1.6),
        height: wp(1.6),
        borderRadius: wp(1),
    },
    miniStatValue: {
        fontWeight: '700',
    },

    // Operations centre
    operationsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: wp(3),
        gap: wp(2.6),
    },
    operationsCard: {
        flex: 1,
        borderWidth: 1,
        borderRadius: wp(4),
        padding: wp(3),
        alignItems: 'flex-start',
        gap: hp(0.6),
    },
    operationsIconWrap: {
        width: wp(9),
        height: wp(9),
        borderRadius: wp(2.4),
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: hp(0.2),
    },
    operationsTitle: {
        fontWeight: '700',
        fontSize: wp(3.2),
    },

    // Pipeline
    pipelineCard: {
        borderWidth: 1,
        borderRadius: wp(4),
        padding: wp(3.6),
        marginBottom: hp(1),
    },
    pipelineTitle: {
        fontWeight: '700',
        marginBottom: hp(1.6),
    },
    pipelineRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    pipelineStepWrap: {
        alignItems: 'center',
        width: wp(13),
    },
    pipelineDot: {
        width: wp(6),
        height: wp(6),
        borderRadius: wp(3),
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: hp(0.6),
    },
    pipelineCount: {
        fontWeight: '800',
        fontSize: wp(3.2),
    },
    pipelineConnector: {
        flex: 1,
        height: 2,
        marginTop: wp(3),
        marginHorizontal: -wp(1),
    },

    // Finance centre
    financeCard: {
        borderWidth: 1,
        borderRadius: wp(4),
        padding: wp(3.6),
        marginBottom: hp(1),
    },
    financeSummaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: hp(1.6),
    },
    financeProfit: {
        fontWeight: '800',
        fontSize: wp(6.2),
        marginTop: hp(0.2),
    },
    financeTrendPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: wp(2.2),
        paddingVertical: hp(0.5),
        borderRadius: wp(3),
    },
    financeGrid: {
        flexDirection: 'row',
    },
    financeGridItem: {
        flex: 1,
        borderRightWidth: 1,
        paddingRight: wp(2),
        marginRight: wp(2),
        gap: hp(0.4),
    },
    financeGridValue: {
        fontWeight: '800',
        fontSize: wp(3.8),
    },

    // Performance
    performanceGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: hp(1),
    },
    perfStat: {
        width: '31.5%',
        borderWidth: 1,
        borderRadius: wp(3.4),
        paddingVertical: hp(1.6),
        alignItems: 'center',
        gap: hp(0.5),
        marginBottom: wp(2.6),
    },
    perfValue: {
        fontWeight: '800',
        fontSize: wp(4.2),
    },

    // Attention / activity list card
    listCard: {
        borderWidth: 1,
        borderRadius: wp(4),
        marginBottom: hp(1),
        paddingHorizontal: wp(3.4),
    },
    attentionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(2.6),
        paddingVertical: hp(1.4),
        borderBottomWidth: 1,
    },
    attentionIconWrap: {
        width: wp(9),
        height: wp(9),
        borderRadius: wp(2.4),
        alignItems: 'center',
        justifyContent: 'center',
    },
    attentionBody: {
        flex: 1,
    },
    attentionTitle: {
        fontWeight: '700',
    },
    attentionBtn: {
        borderWidth: 1,
        borderRadius: wp(2),
        paddingHorizontal: wp(2.6),
        paddingVertical: hp(0.8),
    },

    // Activity timeline
    activityItem: {
        flexDirection: 'row',
        gap: wp(2.6),
        paddingTop: hp(1),
    },
    activityRail: {
        alignItems: 'center',
        width: wp(3),
    },
    activityDot: {
        width: wp(2.2),
        height: wp(2.2),
        borderRadius: wp(1.1),
    },
    activityLine: {
        flex: 1,
        width: 1,
        marginTop: hp(0.4),
    },
    activityText: {
        fontWeight: '600',
    },

    // Quick actions
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    quickActionBtn: {
        width: '31.5%',
        borderWidth: 1,
        borderRadius: wp(3.4),
        paddingVertical: hp(1.6),
        paddingHorizontal: wp(1.5),
        alignItems: 'center',
        gap: hp(0.8),
        marginBottom: wp(2.6),
    },
    quickActionIconWrap: {
        width: wp(9.5),
        height: wp(9.5),
        borderRadius: wp(2.6),
        alignItems: 'center',
        justifyContent: 'center',
    },
    quickActionLabel: {
        textAlign: 'center',
        fontWeight: '600',
        fontSize: wp(2.9),
    }, miniContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '50%',
        marginBottom: hp(1.8),
    },

    miniIcon: {
        width: wp(8),
        height: wp(8),
        borderRadius: wp(2),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: wp(2),
    },

    miniValue: {
        fontSize: wp(3.8),
        fontWeight: '700',
    },

    miniLabel: {
        fontSize: wp(3),
        opacity: 0.6,
    },

});