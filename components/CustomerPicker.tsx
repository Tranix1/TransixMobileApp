import React, { useState, useEffect } from 'react';
import { View, Modal, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; // adjust to your actual import
import Input from './Input'; // adjust path
import { ThemedText } from './ThemedText'; // adjust path
import { wp } from '@/constants/common';
import { fetchDocuments, addDocument } from '@/db/operations';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';

export interface Customer {
  id: string;
  organizationId: string | null;
  name: string;
  phone?: string;
  billingAddress?: string;
  createdBy?: string;
}

interface NewCustomerForm {
  name: string;
  phone: string;
  billingAddress: string;
}

interface CustomerPickerProps {
  userId: string;
  selectedCustomer: Customer | null;
  onSelectCustomer: (customer: Customer | null) => void;
}

/**
 * CustomerPicker
 *
 * Self-contained search + list + "add new customer" modal.
 * Parent only needs to store the selected customer.
 */
export default function CustomerPicker({
  userId,
  selectedCustomer,
  onSelectCustomer
}: CustomerPickerProps) {

  const { currentRole } = useAuth();
  const background = useThemeColor('background')
  const backgroundLight = useThemeColor('backgroundLight')


  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newCustomer, setNewCustomer] = useState<NewCustomerForm>({
    name: '',
    phone: '',
    billingAddress: ''
  });
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    loadCustomers();
  }, [currentRole?.organizationId]);

  const loadCustomers = async () => {
    try {
      const result = await fetchDocuments(`fleets/${currentRole?.organizationId}/Customers`, 100);
      if (result && result.data && Array.isArray(result.data)) {
        setCustomers(result.data as Customer[]);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const displayedCustomers: Customer[] =
    searchQuery.length > 0
      ? customers.filter(c =>
        c.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      : customers.slice(0, 5);

  const handleSelect = (customer: Customer) => {
    const isSelected = selectedCustomer?.id === customer.id;
    onSelectCustomer?.(isSelected ? null : customer);
  };

  const handleAddCustomer = async () => {
    if (!newCustomer.name?.trim()) return;

    setSaving(true);
    try {
      const customerData: Omit<Customer, 'id'> = {
        organizationId: currentRole?.organizationId || null,
        name: newCustomer.name.trim(),
        phone: newCustomer.phone,
        billingAddress: newCustomer.billingAddress,
        createdBy: userId
      };

      // addDocument returns the new document's id as a string
      const newId = await addDocument(`fleets/${currentRole?.organizationId}/Customers`, customerData);

      if (newId) {
        await loadCustomers();

        // auto-select the newly created customer
        const createdCustomer: Customer = { id: newId, ...customerData };
        onSelectCustomer?.(createdCustomer);

        setNewCustomer({ name: '', phone: '', billingAddress: '' });
        setShowAddModal(false);
      }
    } catch (error) {
      console.error('Error adding customer:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View>
      <View style={{ alignItems: 'center', flexDirection: 'row', marginBottom: wp(2) }}>
        <View style={{ width: "85%", height: 10 }}>
          <Input
            placeholder="Search customer..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          //   style={{ flex: 1 }}
          />
        </View>
        <TouchableOpacity
          onPress={() => setShowAddModal(true)}
          style={{
            padding: wp(3.7),
            paddingHorizontal: wp(5.5),
            backgroundColor: '#4CAF50',
            borderEndEndRadius: 8,
            borderEndStartRadius: 8,
            marginLeft: wp(-3),
          }}
        >
          <Ionicons name="add" color="#fff" size={20} />
        </TouchableOpacity>
      </View>

      {displayedCustomers.map(customer => {
        const isSelected = selectedCustomer?.id === customer.id;
        return (
          <TouchableOpacity
            key={customer.id}
            onPress={() => handleSelect(customer)}
            style={{
              marginTop: wp(1),
              padding: wp(2),
              borderRadius: 8,
              borderWidth: 1,
              backgroundColor: isSelected ? '#F3E8FF' : backgroundLight,
              borderColor: isSelected ? '#7C3AED' : '#ddd',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons
                name={isSelected ? 'checkbox' : 'square-outline'}
                color={isSelected ? '#7C3AED' : '#ddd'}
                size={18}
              />

              <ThemedText style={{
                marginLeft: wp(2), color: isSelected ? "#7C3AED" : '#666',
                fontWeight: isSelected ? "600" : "400",
              }}>
                {customer.name}
              </ThemedText>
            </View>
          </TouchableOpacity>
        );
      })}

      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: background, margin: wp(4), padding: wp(4), borderRadius: 12 }}>
            <ThemedText style={{ fontWeight: 'bold', marginBottom: wp(2) }}>
              Add Customer
            </ThemedText>

            <Input
              placeholder="Name"
              value={newCustomer.name}
              onChangeText={(t: string) => setNewCustomer(prev => ({ ...prev, name: t }))}
            />
            <Input
              placeholder="Phone"
              value={newCustomer.phone}
              onChangeText={(t: string) => setNewCustomer(prev => ({ ...prev, phone: t }))}
              style={{ marginTop: wp(2) }}
            />

            <Input
              placeholder="Billing Address"
              value={newCustomer.billingAddress}
              onChangeText={(t: string) => setNewCustomer(prev => ({ ...prev, billingAddress: t }))}
              style={{ marginTop: wp(2) }}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: wp(3) }}>
              <TouchableOpacity
                onPress={() => setShowAddModal(false)}
                style={{ padding: wp(2), marginRight: wp(2) }}
                disabled={saving}
              >
                <ThemedText>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddCustomer}
                style={{ padding: wp(2), backgroundColor: '#4CAF50', borderRadius: 8 }}
                disabled={saving}
              >
                <ThemedText style={{ color: '#fff' }}>
                  {saving ? 'Saving...' : 'Save'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
