import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Błąd', 'Wypełnij wszystkie pola');
      return;
    }

    setIsLoading(true);
    const { error } = await login(email, password);
    setIsLoading(false);

    if (error) {
      Alert.alert('Błąd logowania', error.message);
    }
  };

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert('Błąd', 'Wypełnij wszystkie pola');
      return;
    }

    setIsLoading(true);
    const { error } = await register(email, password);
    setIsLoading(false);

    if (error) {
      Alert.alert('Błąd rejestracji', error.message);
    } else {
      Alert.alert('Sukces', 'Konto utworzone! Możesz się zalogować');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Witaj w Fitly!</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Hasło"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <Button 
        title={isLoading ? "Logowanie..." : "Zaloguj"} 
        onPress={handleLogin} 
        disabled={isLoading}
      />
      
      <TouchableOpacity onPress={handleRegister} disabled={isLoading}>
        <Text style={styles.registerText}>Nie masz konta? Zarejestruj się</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 15,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
  },
  registerText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#007AFF',
    fontSize: 16,
  },
});