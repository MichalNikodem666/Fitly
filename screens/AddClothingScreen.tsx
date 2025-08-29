import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useImageUploader } from '../lib/imageUploader';
import { testSupabaseConnection, testStorageAccess, checkAuth, ensureBucketExists } from '../lib/supabase'; // ← DODAJ ensureBucketExists

const CATEGORIES = ['koszulka', 'spodnie', 'bluza', 'buty', 'czapka', 'kurtka', 'sukienka', 'spódnica'];

export default function AddClothingScreen() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [color, setColor] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { pickImage, uploadImage } = useImageUploader();

  // ⭐⭐⭐ ZAKTUALIZOWANY TEST POŁĄCZENIA ⭐⭐⭐
  useEffect(() => {
    const testEverything = async () => {
      console.log('🧪 Testing Supabase connection...');
      
      // Test połączenia
      const isConnected = await testSupabaseConnection();
      if (!isConnected) {
        console.error('❌ Brak połączenia z Supabase');
        Alert.alert('Błąd', 'Brak połączenia z bazą danych');
        return;
      }

      // ⭐⭐⭐ NAJWAŻNIEJSZE: Upewnij się że bucket istnieje ⭐⭐⭐
      console.log('🛠️ Ensuring bucket exists...');
      const bucketReady = await ensureBucketExists('clothing-images');
      
      if (!bucketReady) {
        Alert.alert(
          'Uwaga', 
          'Bucket clothing-images nie istnieje. Utwórz go ręcznie w Supabase Dashboard → Storage → New bucket → clothing-images'
        );
      }

      // Test storage
      const storageAccess = await testStorageAccess('clothing-images');
      console.log('Storage access:', storageAccess);
      
      // Test autentykacji
      const session = await checkAuth();
      console.log('User session:', session ? 'Zalogowany' : 'Niezalogowany');
      if (!session) {
        Alert.alert('Błąd', 'Użytkownik nie jest zalogowany');
      } else {
        console.log('User ID:', session.user.id);
      }
    };

    testEverything();
  }, []);
  // ⭐⭐⭐ KONIEC KODU TESTOWEGO ⭐⭐⭐

  const handlePickImage = async () => {
    try {
      const uri = await pickImage();
      if (uri) {
        setImageUri(uri);
      }
    } catch (error) {
      console.error('Błąd wyboru zdjęcia:', error);
      Alert.alert('Błąd', 'Nie udało się wybrać zdjęcia');
    }
  };

  const handleAddClothing = async () => {
    if (!name || !category) {
      Alert.alert('Błąd', 'Wypełnij nazwę i kategorię');
      return;
    }

    if (!user) {
      Alert.alert('Błąd', 'Musisz być zalogowany');
      return;
    }

    setIsLoading(true);
    
    try {
      let imageUrl = null;
      
      // Upload zdjęcia jeśli wybrano
      if (imageUri) {
        console.log('Rozpoczynam upload zdjęcia...');
        imageUrl = await uploadImage(imageUri, user.id);
        
        if (!imageUrl) {
          Alert.alert('Błąd', 'Nie udało się przesłać zdjęcia. Możesz dodać ubranie bez zdjęcia.');
        } else {
          console.log('Zdjęcie przesłane pomyślnie:', imageUrl);
        }
      }

      // Przygotuj dane do wysłania
      const clothingData: any = {
        name,
        category,
        user_id: user.id
      };

      // Dodaj opcjonalne pola tylko jeśli mają wartość
      if (color && color.trim()) clothingData.color = color;
      if (imageUrl) clothingData.image_url = imageUrl;

      // Dodaj ubranie do bazy danych
      const { error } = await supabase
        .from('clothes')
        .insert([clothingData]);

      if (error) {
        console.error('Błąd dodawania ubrania:', error);
        Alert.alert('Błąd', 'Nie udało się dodać ubrania do bazy');
      } else {
        Alert.alert('Sukces', 'Ubranie dodane do szafy!');
        // Reset form
        setName('');
        setCategory('');
        setColor('');
        setImageUri(null);
      }
    } catch (error) {
      console.error('Nieoczekiwany błąd:', error);
      Alert.alert('Błąd', 'Coś poszło nie tak');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddWithoutImage = async () => {
    if (!name || !category) {
      Alert.alert('Błąd', 'Wypełnij nazwę i kategorię');
      return;
    }

    if (!user) {
      Alert.alert('Błąd', 'Musisz być zalogowany');
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('clothes')
        .insert([{
          name,
          category,
          color: color || null,
          user_id: user.id
        }]);

      if (error) {
        console.error('Błąd:', error);
        Alert.alert('Błąd', 'Nie udało się dodać ubrania');
      } else {
        Alert.alert('Sukces', 'Ubranie dodane (bez zdjęcia)!');
        setName('');
        setCategory('');
        setColor('');
        setImageUri(null);
      }
    } catch (error) {
      console.error('Błąd:', error);
      Alert.alert('Błąd', 'Coś poszło nie tak');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.title}>Dodaj nowe ubranie</Text>
      
      <TouchableOpacity style={styles.addImageButton} onPress={handlePickImage}>
        <Text style={styles.addImageText}>
          {imageUri ? '📷 Zmień zdjęcie' : '📷 Dodaj zdjęcie'}
        </Text>
      </TouchableOpacity>

      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.imagePreview} />
      )}

      <TextInput
        style={styles.input}
        placeholder="Nazwa ubrania *"
        value={name}
        onChangeText={setName}
        placeholderTextColor="#999"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Kategoria *"
        value={category}
        onChangeText={setCategory}
        placeholderTextColor="#999"
      />
      
      <Text style={styles.categoriesTitle}>Popularne kategorie:</Text>
      
      <View style={styles.categoriesContainer}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryButton, 
              category === cat && styles.categoryButtonActive
            ]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[
              styles.categoryText,
              category === cat && styles.categoryTextActive
            ]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Kolor (opcjonalnie)"
        value={color}
        onChangeText={setColor}
        placeholderTextColor="#999"
      />
      
      <TouchableOpacity 
        style={[styles.addButton, isLoading && styles.addButtonDisabled]}
        onPress={handleAddClothing}
        disabled={isLoading}
      >
        <Text style={styles.addButtonText}>
          {isLoading ? "Dodawanie..." : "➕ Dodaj ubranie"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.addButton, { backgroundColor: '#666', marginTop: 10 }]}
        onPress={handleAddWithoutImage}
        disabled={isLoading}
      >
        <Text style={styles.addButtonText}>📦 Dodaj bez zdjęcia</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333333',
  },
  addImageButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  addImageText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#dddddd',
    marginBottom: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    fontSize: 16,
    color: '#333333',
  },
  categoriesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#666666',
    marginTop: 10,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
    justifyContent: 'center',
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dddddd',
    marginBottom: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryText: {
    color: '#666666',
    fontSize: 14,
    textAlign: 'center',
  },
  categoryTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});