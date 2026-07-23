import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import ScreenWrapper from '@/components/ScreenWrapper';
import Heading from '@/components/Heading';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { ThemedText } from '@/components/ThemedText';
import { createCampaignReferral, getCampaigns, searchReferrers } from '@/db/operations';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { wp } from '@/constants/common';

const PLATFORMS = [{ id: 'FB', label: 'Facebook' }, { id: 'TT', label: 'TikTok' }, { id: 'IG', label: 'Instagram' }, { id: 'YT', label: 'YouTube' }, { id: 'LI', label: 'LinkedIn' }, { id: 'TW', label: 'X' }, { id: 'WA', label: 'WhatsApp' }, { id: 'TG', label: 'Telegram' }, { id: 'EM', label: 'Email' }, { id: 'WB', label: 'Website' }, { id: 'RF', label: 'Radio' }, { id: 'TV', label: 'Television' }, { id: 'OT', label: 'Other' }];

/** Assigns one C-prefixed campaign code to a selected existing referrer. */
export default function CreateCampaignReferral() {
  const { user } = useAuth(); const accent = useThemeColor('accent'); const backgroundLight = useThemeColor('backgroundLight');
  const [referrerSearch, setReferrerSearch] = useState(''); const [campaignSearch, setCampaignSearch] = useState(''); const [referrers, setReferrers] = useState<any[]>([]); const [campaigns, setCampaigns] = useState<any[]>([]); const [selectedReferrer, setSelectedReferrer] = useState<any>(null); const [selectedCampaign, setSelectedCampaign] = useState<any>(null); const [platformId, setPlatformId] = useState(''); const [loading, setLoading] = useState(false); const [saving, setSaving] = useState(false);
  useEffect(() => { getCampaigns().then(setCampaigns).catch((error) => { console.error(error); Alert.alert('Unable to load campaigns'); }); }, []);
  const findReferrers = async () => { setLoading(true); try { setReferrers(await searchReferrers(referrerSearch)); } catch (error) { console.error(error); Alert.alert('Unable to search referrers'); } finally { setLoading(false); } };
  const visibleCampaigns = useMemo(() => campaigns.filter((item) => String(item.campaignName ?? '').toLowerCase().includes(campaignSearch.toLowerCase())), [campaigns, campaignSearch]);
  const save = async () => {
    if (!user?.uid || !selectedReferrer || !selectedCampaign || !platformId) { Alert.alert('Missing details', 'Select a referrer, campaign, and platform.'); return; }
    const platform = PLATFORMS.find((item) => item.id === platformId)!;
    setSaving(true);
    try {
      const result = await createCampaignReferral({ campaignId: selectedCampaign.campaignId, campaignName: selectedCampaign.campaignName, platformId, platformName: platform.label, userId: selectedReferrer.userId ?? selectedReferrer.uid, displayName: selectedReferrer.displayName ?? selectedReferrer.name ?? selectedReferrer.userName ?? 'Unknown', phoneNumber: selectedReferrer.phoneNumber ?? null, referralCode: selectedReferrer.referralCode ?? selectedReferrer.referrerCode, createdBy: user.uid });
      Alert.alert('Campaign referral created', `Code: ${result.campaignReferralCode}`); setSelectedReferrer(null); setSelectedCampaign(null); setPlatformId(''); setReferrerSearch(''); setCampaignSearch(''); setReferrers([]);
    } catch (error) { console.error(error); Alert.alert('Unable to create campaign referral', 'Please try again.'); } finally { setSaving(false); }
  };
  return <ScreenWrapper><Heading page="Create Campaign Referral" /><ScrollView contentContainerStyle={styles.content}>
    <ThemedText type="defaultSemiBold">Find Referrer</ThemedText><Input value={referrerSearch} onChangeText={setReferrerSearch} placeholder="Code, name, phone, or email" rightItem={<TouchableOpacity onPress={findReferrers} style={[styles.search, { backgroundColor: accent }]}><ThemedText style={{ color: '#fff' }}>Search</ThemedText></TouchableOpacity>} />
    {loading && <ActivityIndicator color={accent} />}{referrers.map((item) => <PickerRow key={item.id} label={item.displayName ?? item.name ?? item.userName ?? 'Unknown'} subtitle={`${item.referralCode ?? item.referrerCode ?? ''} · ${item.phoneNumber ?? item.userEmail ?? item.email ?? ''}`} selected={selectedReferrer?.id === item.id} onPress={() => setSelectedReferrer(item)} accent={accent} background={backgroundLight} />)}
    <ThemedText type="defaultSemiBold">Select Campaign</ThemedText><Input value={campaignSearch} onChangeText={setCampaignSearch} placeholder="Search campaign name" />{visibleCampaigns.map((item) => <PickerRow key={item.campaignId} label={item.campaignName} subtitle={`${item.status} · ${item.startDate} to ${item.endDate}`} selected={selectedCampaign?.campaignId === item.campaignId} onPress={() => setSelectedCampaign(item)} accent={accent} background={backgroundLight} />)}
    <ThemedText type="defaultSemiBold">Platform</ThemedText><View style={styles.chips}>{PLATFORMS.map((item) => <TouchableOpacity key={item.id} onPress={() => setPlatformId(item.id)} style={[styles.chip, { backgroundColor: platformId === item.id ? accent : backgroundLight }]}><ThemedText type="tiny" style={{ color: platformId === item.id ? '#fff' : undefined }}>{item.label}</ThemedText></TouchableOpacity>)}</View>
    <Button title="Generate Campaign Referral" loading={saving} disabled={saving} onPress={save} colors={{ text: '#fff', bg: accent }} />
  </ScrollView></ScreenWrapper>;
}
function PickerRow({ label, subtitle, selected, onPress, accent, background }: { label: string; subtitle: string; selected: boolean; onPress: () => void; accent: string; background: string }) { return <TouchableOpacity onPress={onPress} style={[styles.row, { backgroundColor: background, borderColor: selected ? accent : 'transparent' }]}><ThemedText type="defaultSemiBold">{label}</ThemedText><ThemedText type="tiny">{subtitle}</ThemedText></TouchableOpacity>; }
const styles = StyleSheet.create({ content: { padding: wp(4), gap: wp(3), paddingBottom: wp(10) }, search: { paddingHorizontal: wp(3), paddingVertical: wp(2), borderRadius: wp(2) }, row: { borderWidth: 1, borderRadius: wp(2), padding: wp(3), gap: 3 }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: wp(2) }, chip: { paddingHorizontal: wp(3), paddingVertical: wp(1.5), borderRadius: 20 } });
