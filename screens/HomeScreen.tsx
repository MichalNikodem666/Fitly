import React from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation();

  const handleLogout = async () => {
    const { error } = await logout();
    if (error) {
      console.error('Logout error:', error);
    }
  };

  const testDatabase = async () => {
    try {
      const { data, error } = await supabase
        .from('clothes')
        .select('*');
      
      console.log('Test bazy danych:', error ? 'Błąd' : 'Sukces', data);
      alert(error ? 'Błąd bazy danych' : 'Połączenie z bazą danych udane!');
    } catch (error) {
      console.error('Błąd testowania bazy:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Witaj, {user?.email}!</Text>
      <Text style={styles.subtitle}>Jesteś zalogowany</Text>
      
      <TouchableOpacity 
        style={styles.menuButton}
        onPress={() => navigation.navigate('AddClothing' as never)}
      >
        <Text style={styles.menuButtonText}>➕ Dodaj ubranie</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuButton} onPress={testDatabase}>
        <Text style={styles.menuButtonText}>🧪 Testuj połączenie z bazą</Text>
      </TouchableOpacity>

      <View style={styles.logoutButton}>
        <Button title="Wyloguj się" onPress={handleLogout} color="#FF3B30" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  menuButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    width: '100%',
    maxWidth: 250,
  },
  menuButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  logoutButton: {
    marginTop: 20,
  },
});