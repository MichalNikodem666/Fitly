import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useImageUploader } from '../utils/ImageUploader';

interface ClothingItem {
  id: string;
  name: string;
  category: string;
  color: string;
}

export default function ClothingListScreen() {
  const [clothes, setClothes] = useState<ClothingItem[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchClothes();
    }
  }, [user]);

  const fetchClothes = async () => {
    const { data, error } = await supabase
      .from('clothes')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (data) {
      setClothes(data);
    }
  };

  const renderItem = ({ item }: { item: ClothingItem }) => (
    <View style={styles.item}>
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemDetails}>{item.category} • {item.color}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Twoja szafa</Text>
      <Text style={styles.subtitle}>Liczba ubrań: {clothes.length}</Text>
      
      <FlatList
        data={clothes}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  item: {
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginBottom: 10,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '500',
  },
  itemDetails: {
    fontSize: 14,
    color: '#666',
  },
});