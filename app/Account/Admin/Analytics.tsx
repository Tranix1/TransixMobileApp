import React, { useEffect, useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { collection, getDocs, orderBy, query, where, type QueryConstraint } from 'firebase/firestore';
import { db } from '@/db/fireBaseConfig';
import ScreenWrapper from '@/components/ScreenWrapper';
import Heading from '@/components/Heading';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { wp } from '@/constants/common';
import { DropDownItem } from '@/components/DropDown';
import { referralFunnelStages } from '@/services/analytics/referralAnalytics';

interface AnalyticsEvent {
  id: string;
  eventName: string;
  userId?: string | null;
  organizationId?: string | null;
  organizationType?: string | null;
  country?: string | null;
  platform?: string | null;
  timestamp?: any;
  metadata?: Record<string, unknown>;
}

interface FilterOption {
  id: string;
  name: string;
}

const eventTypeOptions: FilterOption[] = [
  { id: 'all', name: 'All Events' },
  { id: 'account_created', name: 'Accounts Created' },
  { id: 'verification_submitted', name: 'Verification Submitted' },
  { id: 'account_verified', name: 'Verified Accounts' },
  { id: 'public_load_created', name: 'Public Loads' },
  { id: 'private_fleet_load_created', name: 'Private Fleet Loads' },
  { id: 'private_brokerage_load_created', name: 'Private Brokerage Loads' },
  { id: 'truck_added', name: 'Trucks Added' },
  { id: 'trip_started', name: 'Trips Started' },
  { id: 'trip_completed', name: 'Trips Completed' },
  { id: 'subscription_paid', name: 'Subscription Paid' },
  { id: 'load_created', name: 'Load Created' },
  { id: 'load_booked', name: 'Load Booked' },
];

const organizationTypeOptions: FilterOption[] = [
  { id: 'all', name: 'All Types' },
  { id: 'fleet', name: 'Fleet' },
  { id: 'brokerage', name: 'Brokerage' },
  { id: 'driver', name: 'Driver' },
];

const platformOptions: FilterOption[] = [
  { id: 'all', name: 'All Platforms' },
  { id: 'android', name: 'Android' },
  { id: 'ios', name: 'iOS' },
  { id: 'web', name: 'Web' },
];

const subscriptionEventNames = ['subscription_paid', 'tracking_subscription_paid', 'brokerage_subscription_paid'];

const summaryMetrics = [
  { eventName: 'account_created', label: 'Accounts Created' },
  { eventName: 'verification_submitted', label: 'Verification Submitted' },
  { eventName: 'account_verified', label: 'Verified Accounts' },
  { eventName: 'public_load_created', label: 'Public Loads' },
  { eventName: 'private_fleet_load_created', label: 'Private Fleet Loads' },
  { eventName: 'private_brokerage_load_created', label: 'Private Brokerage Loads' },
  { eventName: 'truck_added', label: 'Trucks Added' },
  { eventName: 'trip_started', label: 'Trips Started' },
  { eventName: 'trip_completed', label: 'Trips Completed' },
];

const analyticsFunnelStages = referralFunnelStages.slice(0, 7).map((stage) => ({
  ...stage,
  label:
    stage.eventName === 'load_created'
      ? 'First Load'
      : stage.eventName === 'subscription_paid'
      ? 'Subscribed'
      : stage.label,
}));

const Analytics = () => {
  const background = useThemeColor('background');
  const backgroundLight = useThemeColor('backgroundLight');
  const accent = useThemeColor('accent');
  const icon = useThemeColor('icon');
  const coolGray = useThemeColor('coolGray');

  const [loading, setLoading] = useState(true);
  const [filtersChanged, setFiltersChanged] = useState(false);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const [selectedEventType, setSelectedEventType] = useState<FilterOption>(eventTypeOptions[0]);
  const [selectedOrganizationType, setSelectedOrganizationType] = useState<FilterOption>(organizationTypeOptions[0]);
  const [selectedCountry, setSelectedCountry] = useState<FilterOption>({ id: 'all', name: 'All Countries' });
  const [selectedPlatform, setSelectedPlatform] = useState<FilterOption>(platformOptions[0]);

  const [countryOptions, setCountryOptions] = useState<FilterOption[]>([{ id: 'all', name: 'All Countries' }]);
  const [summaryValues, setSummaryValues] = useState<Record<string, number>>({});
  const [subscriptionCount, setSubscriptionCount] = useState(0);
  const [funnelValues, setFunnelValues] = useState<Record<string, number>>({});
  const [recentEvents, setRecentEvents] = useState<AnalyticsEvent[]>([]);

  const filterConstraints = useMemo(() => {
    const constraints: QueryConstraint[] = [];

    if (startDate) {
      constraints.push(where('timestamp', '>=', startDate));
    }
    if (endDate) {
      constraints.push(where('timestamp', '<=', endDate));
    }
    if (selectedEventType.id !== 'all') {
      constraints.push(where('eventName', '==', selectedEventType.id));
    }
    if (selectedOrganizationType.id !== 'all') {
      constraints.push(where('organizationType', '==', selectedOrganizationType.id));
    }
    if (selectedCountry.id !== 'all') {
      constraints.push(where('country', '==', selectedCountry.id));
    }
    if (selectedPlatform.id !== 'all') {
      constraints.push(where('platform', '==', selectedPlatform.id));
    }

    return constraints;
  }, [startDate, endDate, selectedEventType, selectedOrganizationType, selectedCountry, selectedPlatform]);

  const formatDate = (value: Date | null) => {
    if (!value) return 'Any';
    return value.toLocaleDateString();
  };

  const getQuery = (...constraints: QueryConstraint[]) => query(collection(db, 'analyticsEvents'), orderBy('timestamp', 'desc'), ...constraints);

  const fetchRecent = async () => {
    const eventQuery = getQuery(...filterConstraints);
    const snapshot = await getDocs(eventQuery);
    const events = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as AnalyticsEvent));
    setRecentEvents(events.slice(0, 100));
    return events;
  };

  const getCount = async (eventName: string) => {
    const constraints = [...filterConstraints, where('eventName', '==', eventName)];
    const countQuery = getQuery(...constraints);
    const snapshot = await getDocs(countQuery);
    return snapshot.size;
  };

  const getUniqueOrganizationCountForSubscriptions = async () => {
    const uniqueIds = new Set<string>();

    for (const eventName of subscriptionEventNames) {
      const constraints = [...filterConstraints, where('eventName', '==', eventName)];
      const countQuery = getQuery(...constraints);
      const snapshot = await getDocs(countQuery);
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (typeof data.organizationId === 'string' && data.organizationId) {
          uniqueIds.add(data.organizationId);
        }
      });
    }

    return uniqueIds.size;
  };

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [allEvents, ...summaryCounts] = await Promise.all([
        fetchRecent(),
        ...summaryMetrics.map((metric) => getCount(metric.eventName)),
        getUniqueOrganizationCountForSubscriptions(),
      ]);

      const countsMap: Record<string, number> = {};
      summaryMetrics.forEach((metric, index) => {
        countsMap[metric.eventName] = summaryCounts[index];
      });
      setSummaryValues(countsMap);
      setSubscriptionCount(summaryCounts[summaryCounts.length - 1]);

      const funnelMap: Record<string, number> = {};
      await Promise.all(
        analyticsFunnelStages.map(async (stage) => {
          funnelMap[stage.eventName] = await getCount(stage.eventName);
        })
      );
      setFunnelValues(funnelMap);

      const countries = new Set<string>();
      allEvents.forEach((event) => {
        if (event.country) {
          countries.add(event.country);
        }
      });
      setCountryOptions([{ id: 'all', name: 'All Countries' }, ...Array.from(countries).map((country) => ({ id: country, name: country }))]);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [filterConstraints.join('-'), filtersChanged]);

  const onChangeStartDate = (_event: DateTimePickerEvent, selected?: Date) => {
    setShowStartDatePicker(Platform.OS === 'ios');
    if (selected) {
      setStartDate(selected);
    }
  };

  const onChangeEndDate = (_event: DateTimePickerEvent, selected?: Date) => {
    setShowEndDatePicker(Platform.OS === 'ios');
    if (selected) {
      setEndDate(selected);
    }
  };

  return (
    <ScreenWrapper>
      <Heading page='Analytics' />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.card, { backgroundColor: backgroundLight }]}> 
          <ThemedText type='subtitle' style={styles.sectionTitle}>Filters</ThemedText>
          <View style={styles.filterRow}>
            <TouchableOpacity style={[styles.dateButton, { borderColor: accent }]} onPress={() => setShowStartDatePicker(true)}>
              <ThemedText type='defaultSemiBold'>From</ThemedText>
              <ThemedText type='tiny' color={coolGray}>{formatDate(startDate)}</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.dateButton, { borderColor: accent }]} onPress={() => setShowEndDatePicker(true)}>
              <ThemedText type='defaultSemiBold'>To</ThemedText>
              <ThemedText type='tiny' color={coolGray}>{formatDate(endDate)}</ThemedText>
            </TouchableOpacity>
          </View>
          {showStartDatePicker && (
            <DateTimePicker
              value={startDate || new Date()}
              mode='date'
              display='default'
              onChange={onChangeStartDate}
            />
          )}
          {showEndDatePicker && (
            <DateTimePicker
              value={endDate || new Date()}
              mode='date'
              display='default'
              onChange={onChangeEndDate}
            />
          )}

          <View style={styles.filterBlock}>
            <DropDownItem
              allData={eventTypeOptions}
              selectedItem={selectedEventType}
              setSelectedItem={setSelectedEventType}
              placeholder='Event Type'
            />
            <DropDownItem
              allData={organizationTypeOptions}
              selectedItem={selectedOrganizationType}
              setSelectedItem={setSelectedOrganizationType}
              placeholder='Organization Type'
            />
            <DropDownItem
              allData={countryOptions}
              selectedItem={selectedCountry}
              setSelectedItem={setSelectedCountry}
              placeholder='Country'
            />
            <DropDownItem
              allData={platformOptions}
              selectedItem={selectedPlatform}
              setSelectedItem={setSelectedPlatform}
              placeholder='Platform'
            />
          </View>
          <TouchableOpacity
            style={[styles.refreshButton, { backgroundColor: accent }]}
            onPress={() => {
              setFiltersChanged((value) => !value);
            }}
          >
            <ThemedText type='defaultSemiBold' color='white'>Apply Filters</ThemedText>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingWrapper}>
            <ActivityIndicator size='large' color={accent} />
          </View>
        ) : (
          <>
            <View style={[styles.section, { backgroundColor: backgroundLight }]}> 
              <ThemedText type='subtitle' style={styles.sectionTitle}>Summary</ThemedText>
              <View style={styles.summaryGrid}>
                {summaryMetrics.map((metric) => (
                  <View key={metric.eventName} style={[styles.summaryCard, { backgroundColor: background }]}> 
                    <ThemedText type='defaultSemiBold'>{metric.label}</ThemedText>
                    <ThemedText type='title' style={{ marginTop: wp(2) }}>
                      {summaryValues[metric.eventName] ?? 0}
                    </ThemedText>
                  </View>
                ))}
                <View style={[styles.summaryCard, { backgroundColor: background }]}> 
                  <ThemedText type='defaultSemiBold'>Active Subscriptions</ThemedText>
                  <ThemedText type='title' style={{ marginTop: wp(2) }}>{subscriptionCount}</ThemedText>
                </View>
              </View>
            </View>

            <View style={[styles.section, { backgroundColor: backgroundLight }]}> 
              <ThemedText type='subtitle' style={styles.sectionTitle}>Referral Funnel</ThemedText>
              <View style={styles.funnelList}>
                {analyticsFunnelStages.map((stage) => (
                  <View key={stage.eventName} style={[styles.funnelCard, { backgroundColor: background }]}> 
                    <ThemedText type='defaultSemiBold'>{stage.label}</ThemedText>
                    <ThemedText type='title' style={{ marginTop: wp(2) }}>{funnelValues[stage.eventName] ?? 0}</ThemedText>
                  </View>
                ))}
              </View>
            </View>

            <View style={[styles.section, { backgroundColor: backgroundLight }]}> 
              <ThemedText type='subtitle' style={styles.sectionTitle}>Recent Events</ThemedText>
              {recentEvents.map((event) => (
                <View key={event.id} style={[styles.eventRow, { backgroundColor: background }]}> 
                  <View style={styles.eventRowHeader}>
                    <ThemedText type='defaultSemiBold'>{event.eventName}</ThemedText>
                    <ThemedText type='tiny' color={coolGray}>{event.timestamp?.toDate ? event.timestamp.toDate().toLocaleString() : String(event.timestamp)}</ThemedText>
                  </View>
                  <View style={styles.eventField}>
                    <ThemedText type='tiny' color={coolGray}>User</ThemedText>
                    <ThemedText type='default'>{event.userId || 'N/A'}</ThemedText>
                  </View>
                  <View style={styles.eventField}>
                    <ThemedText type='tiny' color={coolGray}>Organization</ThemedText>
                    <ThemedText type='default'>{event.organizationId || 'N/A'}</ThemedText>
                  </View>
                  <View style={styles.eventField}>
                    <ThemedText type='tiny' color={coolGray}>Country</ThemedText>
                    <ThemedText type='default'>{event.country || 'N/A'}</ThemedText>
                  </View>
                  {event.metadata && Object.keys(event.metadata).length > 0 && (
                    <View style={styles.eventMetadata}>
                      <ThemedText type='tiny' color={coolGray}>Metadata</ThemedText>
                      <ThemedText type='default'>{JSON.stringify(event.metadata)}</ThemedText>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: wp(4),
    paddingBottom: wp(12),
  },
  card: {
    borderRadius: wp(4),
    padding: wp(4),
    marginBottom: wp(4),
  },
  section: {
    borderRadius: wp(4),
    padding: wp(4),
    marginBottom: wp(4),
  },
  sectionTitle: {
    marginBottom: wp(3),
  },
  filterRow: {
    flexDirection: 'row',
    gap: wp(3),
    marginBottom: wp(3),
  },
  dateButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: wp(3),
    padding: wp(3),
  },
  filterBlock: {
    gap: wp(3),
    marginBottom: wp(3),
  },
  refreshButton: {
    paddingVertical: wp(3),
    borderRadius: wp(3),
    alignItems: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(3),
  },
  summaryCard: {
    width: '48%',
    borderRadius: wp(3),
    padding: wp(3),
    marginBottom: wp(3),
  },
  funnelList: {
    gap: wp(3),
  },
  funnelCard: {
    borderRadius: wp(3),
    padding: wp(3),
  },
  eventRow: {
    borderRadius: wp(3),
    padding: wp(3),
    marginBottom: wp(3),
  },
  eventRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: wp(2),
  },
  eventField: {
    marginBottom: wp(1),
  },
  eventMetadata: {
    marginTop: wp(2),
  },
  loadingWrapper: {
    marginTop: wp(8),
    alignItems: 'center',
  },
});

export default Analytics;
