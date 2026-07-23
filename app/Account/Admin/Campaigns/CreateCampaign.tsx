import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '@/components/ScreenWrapper';
import Heading from '@/components/Heading';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/context/AuthContext';
import { createCampaign, type CampaignInput } from '@/db/operations';
import { useThemeColor } from '@/hooks/useThemeColor';
import { wp } from '@/constants/common';

const STATUSES: CampaignInput['status'][] = ['Upcoming', 'Active', 'Paused', 'Completed'];
const PLATFORMS = [{ id: 'FB', label: 'Facebook' }, { id: 'TT', label: 'TikTok' }, { id: 'IG', label: 'Instagram' }, { id: 'YT', label: 'YouTube' }, { id: 'LI', label: 'LinkedIn' }, { id: 'TW', label: 'X' }, { id: 'WA', label: 'WhatsApp' }, { id: 'TG', label: 'Telegram' }, { id: 'EM', label: 'Email' }, { id: 'WB', label: 'Website' }, { id: 'RF', label: 'Radio' }, { id: 'TV', label: 'Television' }, { id: 'OT', label: 'Other' }];

/** Admin form for creating a reusable campaign. Dates are stored as ISO date strings. */
export default function CreateCampaign() {
  const { user } = useAuth();
  const accent = useThemeColor('accent');
  const backgroundLight = useThemeColor('backgroundLight');
  const [saving, setSaving] = useState(false);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [status, setStatus] = useState<CampaignInput['status']>('Upcoming');
  const [form, setForm] = useState({ campaignName: '', description: '', objective: '', content: '', marketingMessage: '', startDate: '', endDate: '', targetAudience: '', maxUses: '', budget: '', notes: '' });
  const update = (key: keyof typeof form) => (value: string) => setForm((current) => ({ ...current, [key]: value }));
  const togglePlatform = (id: string) => setPlatforms((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);

  const save = async () => {
    if (!user?.uid || !form.campaignName.trim() || !form.objective.trim() || !form.startDate || !form.endDate) {
      Alert.alert('Missing details', 'Campaign name, objective, start date, and end date are required.'); return;
    }
    if (Number.isNaN(Date.parse(form.startDate)) || Number.isNaN(Date.parse(form.endDate)) || Date.parse(form.endDate) < Date.parse(form.startDate)) {
      Alert.alert('Invalid dates', 'Use YYYY-MM-DD and ensure the end date is not before the start date.'); return;
    }
    setSaving(true);
    try {
      const campaignId = await createCampaign({ campaignName: form.campaignName.trim(), description: form.description.trim(), objective: form.objective.trim(), content: form.content.trim(), marketingMessage: form.marketingMessage.trim(), platforms, status, startDate: form.startDate, endDate: form.endDate, targetAudience: form.targetAudience.trim(), maxUses: form.maxUses ? Number(form.maxUses) : null, budget: form.budget ? Number(form.budget) : null, notes: form.notes.trim(), createdBy: user.uid });
      Alert.alert('Campaign created', `Campaign ID: ${campaignId}`);
      setForm({ campaignName: '', description: '', objective: '', content: '', marketingMessage: '', startDate: '', endDate: '', targetAudience: '', maxUses: '', budget: '', notes: '' }); setPlatforms([]); setStatus('Upcoming');
    } catch (error) { console.error('Create campaign error', error); Alert.alert('Unable to create campaign', 'Please try again.'); }
    finally { setSaving(false); }
  };

  return <ScreenWrapper><Heading page="Create Campaign" /><ScrollView contentContainerStyle={styles.content}>
    <Field label="Campaign Name" value={form.campaignName} onChangeText={update('campaignName')} />
    <Field label="Campaign Description" value={form.description} onChangeText={update('description')} multiline />
    <Field label="Campaign Objective" value={form.objective} onChangeText={update('objective')} multiline />
    <Field label="Campaign Content" value={form.content} onChangeText={update('content')} multiline />
    <Field label="Marketing Message" value={form.marketingMessage} onChangeText={update('marketingMessage')} multiline />
    <Field label="Start Date" value={form.startDate} onChangeText={update('startDate')} placeholder="YYYY-MM-DD" />
    <Field label="End Date" value={form.endDate} onChangeText={update('endDate')} placeholder="YYYY-MM-DD" />
    <ThemedText type="defaultSemiBold">Campaign Status</ThemedText><View style={styles.chips}>{STATUSES.map((item) => <Chip key={item} label={item} selected={status === item} onPress={() => setStatus(item)} accent={accent} background={backgroundLight} />)}</View>
    <Field label="Target Audience" value={form.targetAudience} onChangeText={update('targetAudience')} />
    <ThemedText type="defaultSemiBold">Platforms Allowed</ThemedText><View style={styles.chips}>{PLATFORMS.map((item) => <Chip key={item.id} label={item.label} selected={platforms.includes(item.id)} onPress={() => togglePlatform(item.id)} accent={accent} background={backgroundLight} />)}</View>
    <Field label="Maximum Uses (optional)" value={form.maxUses} onChangeText={update('maxUses')} keyboardType="number-pad" />
    <Field label="Budget (optional)" value={form.budget} onChangeText={update('budget')} keyboardType="decimal-pad" />
    <Field label="Notes" value={form.notes} onChangeText={update('notes')} multiline />
    <Button title="Create Campaign" loading={saving} disabled={saving} onPress={save} colors={{ text: '#fff', bg: accent }} />
  </ScrollView></ScreenWrapper>;
}
function Field(props: { label: string; multiline?: boolean } & React.ComponentProps<typeof Input>) { const { label, multiline, ...input } = props; return <View style={styles.field}><ThemedText type="defaultSemiBold">{label}</ThemedText><Input {...input} multiline={multiline} style={multiline ? styles.multiline : undefined} /></View>; }
function Chip({ label, selected, onPress, accent, background }: { label: string; selected: boolean; onPress: () => void; accent: string; background: string }) { return <TouchableOpacity onPress={onPress} style={[styles.chip, { backgroundColor: selected ? accent : background }]}><ThemedText type="tiny" style={{ color: selected ? '#fff' : undefined }}>{label}</ThemedText>{selected && <Ionicons name="checkmark" color="#fff" size={14} />}</TouchableOpacity>; }
const styles = StyleSheet.create({ content: { padding: wp(4), gap: wp(3), paddingBottom: wp(10) }, field: { gap: wp(1) }, multiline: { minHeight: 88, textAlignVertical: 'top' }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: wp(2) }, chip: { flexDirection: 'row', gap: 4, alignItems: 'center', paddingHorizontal: wp(3), paddingVertical: wp(1.5), borderRadius: 20 } });
