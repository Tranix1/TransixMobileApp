import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import ScreenWrapper from '@/components/ScreenWrapper';
import { searchUsersByEmail, addTrackingAgent } from '@/db/operations';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/Input';
import Heading from '@/components/Heading';
const AddAgent = () => {
  const [email, setEmail] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const { user } = useAuth();

  const handleSearch = async () => {
    if (email.trim() === '') {
      Alert.alert('Error', 'Please enter an email to search.');
      return;
    }
    try {
      const fetchedUsers = await searchUsersByEmail(email.trim());
      setUsers(fetchedUsers);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to search for users.');
    }
  };

  const handleAddAgent = async (agent: any) => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to add an agent.');
      return;
    }
    try {
      await addTrackingAgent(user.uid, agent.id);
      Alert.alert('Success', `${agent.organisation} has been added as a tracking agent.`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add tracking agent.');
    }
  };

  return (
    <ScreenWrapper>
      <Heading page='Add Agent' />
      <View style={styles.searchContainer}>
        <View style={{width:'85%'}}> 
        <Input
          placeholder="Search by email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        </View>
        <TouchableOpacity style={styles.button} onPress={handleSearch}>
          <Text style={styles.buttonText}>Search</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.userContainer}>
            <View>
              <ThemedText>{item.name}</ThemedText>
              <ThemedText>{item.email}</ThemedText>
            </View>
            <TouchableOpacity style={styles.addButton} onPress={() => handleAddAgent(item)}>
              <Text style={styles.buttonText}>Add</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    padding: 10,
  },
 
  button: {
    backgroundColor: '#007BFF',
    padding:3,
    height:50,
    borderRadius: 5,
    marginLeft: 10,
    justifyContent: 'center',
    
    
  },
  buttonText: {
    color: '#fff',
  },
  userContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  addButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
  },
});

export default AddAgent;
