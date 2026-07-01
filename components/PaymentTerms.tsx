/**
 * PaymentTerms.tsx
 * -----------------------------------------------------------------------
 * Payment terms picker for the Add Load form.
 *
 * FULL PAYMENT
 *   → choose when the whole rate is paid: On Loading / On Delivery / Later Date
 *   → if "Later Date" is chosen, a date picker appears
 *
 * SPLIT PAYMENT
 *   → choose Percent (%) or Fixed amount (defaults to Percent)
 *   → "On Loading" amount input (the first portion, paid when the load goes out)
 *   → the remaining portion defaults to "On Delivery"; tapping "Later Date"
 *     switches it to a specific date (date picker appears) plus its own
 *     amount input
 *
 * Fixed amounts show no currency symbol — the rate already carries the
 * currency, so repeating it here would be redundant.
 * -----------------------------------------------------------------------
 * HOW TO WIRE IT IN
 * -----------------------------------------------------------------------
 * const [paymentTerms, setPaymentTerms] = useState<PaymentTermsValue>(
 *   getDefaultPaymentTerms()
 * );
 *
 * <PaymentTerms value={paymentTerms} onChange={setPaymentTerms} />
 *
 * // submit alongside your other load fields:
 * body: { ...otherLoadFields, paymentTerms }
 * -----------------------------------------------------------------------
 * Requires: @react-native-community/datetimepicker
 *   npm install @react-native-community/datetimepicker
 */

import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ThemedText } from '@/components/ThemedText'; // adjust path to match your project
import { Ionicons } from "@expo/vector-icons";
import Input from './Input';
import { useThemeColor } from '@/hooks/useThemeColor';

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

export type PaymentType = 'full' | 'split';
export type AmountType = 'percent' | 'fixed';
export type FullTiming = 'On Loading' | 'On Delivery' | 'Later Date';
export type SecondTiming = 'On Delivery' | 'Later Date';

export interface PaymentTermsValue {
  type: PaymentType;

  // Full payment fields
  timing: FullTiming;
  date: string | null; // ISO string, set when timing === 'Later Date'

  // Split payment fields
  amountType: AmountType; // defaults to 'percent'
  firstAmount: string; // "On Loading" portion
  secondTiming: SecondTiming; // defaults to 'On Delivery'
  secondAmount: string; // the remaining portion's amount
  secondDate: string | null; // ISO string, set when secondTiming === 'Later Date'
}

interface PaymentTermsProps {
  value: PaymentTermsValue;
  onChange: (v: PaymentTermsValue) => void;
}

export const getDefaultPaymentTerms = (): PaymentTermsValue => ({
  type: 'full',
  timing: 'On Loading',
  date: null,
  amountType: 'percent',
  firstAmount: '',
  secondTiming: 'On Delivery',
  secondAmount: '',
  secondDate: null,
});

const formatDate = (iso: string | null) => {
  if (!iso) return 'Select date';
  return new Date(iso).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------

export default function PaymentTerms({ value, onChange }: PaymentTermsProps) {
  const safeValue = value ?? getDefaultPaymentTerms();
  const {
    type,
    timing,
    date,
    amountType,
    firstAmount,
    secondTiming,
    secondAmount,
    secondDate,
  } = safeValue;

  const [showFullDatePicker, setShowFullDatePicker] = useState(false);
  const [showSecondDatePicker, setShowSecondDatePicker] = useState(false);
  const icon = useThemeColor('icon')

  const patch = (fields: Partial<PaymentTermsValue>) =>
    onChange({ ...safeValue, ...fields });

  // No currency symbol on fixed — the rate already carries the currency.
  const suffix = amountType === 'percent' ? '%' : '';

  return (
    <View style={styles.container}>
      <ThemedText style={styles.sectionLabel}>
        Payment Terms<ThemedText color="red">*</ThemedText>
      </ThemedText>

      {/* Full vs Split */}
      <View style={styles.segmentRow}>
        {(['full', 'split'] as PaymentType[]).map((t) => {
          const active = type === t;
          return (
            <TouchableOpacity
              key={t}
              style={[styles.segmentBtn, active && styles.segmentBtnActive]}
              onPress={() => patch({ type: t })}
            >
              <ThemedText
                style={[
                  styles.segmentBtnText,
                  active && styles.segmentBtnTextActive,
                ]}
              >
                {t === 'full' ? 'Full Payment' : 'Split Payment'}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ---------------- FULL PAYMENT ---------------- */}
      {type === 'full' && (
        <>
          <ThemedText style={styles.fieldLabel}>When is it paid?</ThemedText>
          <View style={styles.segmentRow}>
            {(['On Loading', 'On Delivery', 'Later Date'] as FullTiming[]).map(
              (t) => {
                const active = timing === t;
                return (
                  <TouchableOpacity
                    key={t}
                    style={[
                      styles.segmentBtn,
                      active && styles.segmentBtnActive,
                    ]}
                    onPress={() => patch({ timing: t })}
                  >
                    <ThemedText
                      style={[
                        styles.segmentBtnText,
                        active && styles.segmentBtnTextActive,
                      ]}
                    >
                      {t}
                    </ThemedText>
                  </TouchableOpacity>
                );
              }
            )}
          </View>

          {timing === 'Later Date' && (
            <View style={{ marginTop: 8 }}>
              <TouchableOpacity
                style={styles.dateBtn}
                onPress={() => setShowFullDatePicker(true)}
              >
                <ThemedText style={styles.dateBtnText}>
                  📅 {formatDate(date)}
                </ThemedText>
              </TouchableOpacity>

              {showFullDatePicker && (
                <DateTimePicker
                  value={date ? new Date(date) : new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowFullDatePicker(false);
                    if (selectedDate) {
                      patch({ date: selectedDate.toISOString() });
                    }
                  }}
                />
              )}
            </View>
          )}
        </>
      )}

      {/* ---------------- SPLIT PAYMENT ---------------- */}
      {type === 'split' && (
        <>
          <View style={[styles.segmentRow, { marginTop: 10 }]}>
            {(['percent', 'fixed'] as AmountType[]).map((a) => {
              const active = amountType === a;
              return (
                <TouchableOpacity
                  key={a}
                  style={[styles.segmentBtn, active && styles.segmentBtnActive]}
                  onPress={() => patch({ amountType: a })}
                >
                  <ThemedText
                    style={[
                      styles.segmentBtnText,
                      active && styles.segmentBtnTextActive,
                    ]}
                  >
                    {a === 'percent' ? 'Percent (%)' : 'Fixed'}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* On Loading amount */}
          <ThemedText style={styles.fieldLabel}>On Loading  {!!suffix && <ThemedText style={styles.suffixText}>{suffix}</ThemedText>}   </ThemedText>
          <View >
            <Input
              style={styles.suffixInput}
              value={firstAmount}
              onChangeText={(v) => patch({ firstAmount: v })}
              placeholder={amountType === 'percent' ? '50' : '1000'}
              keyboardType="decimal-pad"
              placeholderTextColor="#9CA3AF"
            />
            
          </View>

          {/* Remaining portion: On Delivery (default) or Later Date */}
          <ThemedText style={styles.fieldLabel}>Remaining Balance {!!suffix && <ThemedText style={styles.suffixText}>{suffix}</ThemedText>}   </ThemedText>
          <View style={styles.segmentRow}>
            {(['On Delivery', 'Later Date'] as SecondTiming[]).map((t) => {
              const active = secondTiming === t;
              return (
                <TouchableOpacity
                  key={t}
                  style={[styles.segmentBtn, active && styles.segmentBtnActive]}
                  onPress={() => patch({ secondTiming: t })}
                >
                  <ThemedText
                    style={[
                      styles.segmentBtnText,
                      active && styles.segmentBtnTextActive,
                    ]}
                  >
                    {t}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>

          <View  style={{ marginTop: 8, }}>
            <Input
              style={styles.suffixInput}
              value={secondAmount}
              onChangeText={(v) => patch({ secondAmount: v })}
              placeholder={amountType === 'percent' ? '50' : '1000'}
              keyboardType="decimal-pad"
              placeholderTextColor="#9CA3AF"
            />
            
          </View>

          {secondTiming === 'Later Date' && (
            <View style={{ marginTop: 8 }}>
              <TouchableOpacity
                style={styles.dateBtn}
                onPress={() => setShowSecondDatePicker(true)}
              >
              

            <View style={styles.dateBtnContent}>
              <Ionicons name="calendar-outline" size={18} color={icon} />
              <ThemedText style={styles.dateBtnText}>
                {formatDate(secondDate)}
              </ThemedText>
            </View>

              </TouchableOpacity>

              {showSecondDatePicker && (
                <DateTimePicker
                  value={secondDate ? new Date(secondDate) : new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowSecondDatePicker(false);
                    if (selectedDate) {
                      patch({ secondDate: selectedDate.toISOString() });
                    }
                  }}
                />
              )}
            </View>
          )}
        </>
      )}
    </View>
  );
}

// ------------------------------------------------------------------
// Styles
// ------------------------------------------------------------------

const styles = StyleSheet.create({
  container: { width: '100%' },
  sectionLabel: { fontSize: 15, fontWeight: '600', marginBottom: 8 },
  fieldLabel: {
    fontSize: 12,
    
    marginTop: 10,
    marginBottom: 4,
    fontWeight: '500',
  },

  segmentRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  segmentBtn: {
    flex: 1,
    minWidth: 90,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    backgroundColor: '#111827',
  },
  segmentBtnActive: { backgroundColor: '#0f9d58', borderColor: '#111827' },
  segmentBtnText: { fontSize: 12, color: '#fff' },
  segmentBtnTextActive: { color: '#fff', fontWeight: '600' },

  
  suffixInput: { flex: 1, paddingVertical: 9, fontSize: 14,borderWidth: 0,  marginTop:4},
  suffixText: { fontSize: 12, color: '#6D28D9', marginLeft: 6 },

  dateBtn: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  dateBtnText: { fontSize: 15, fontWeight: '500',marginLeft: 6,  },
  dateBtnContent: {
  flexDirection: "row",
  alignItems: "center",
  
},


});
