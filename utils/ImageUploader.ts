import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';

export const useImageUploader = () => {
  const pickImage = async (): Promise<string | null> => {
    try {
      // Prośba o uprawnienia
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Potrzebujemy uprawnień do galerii!');
        return null;
      }

      // Wybierz zdjęcie
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0].uri;
      }
      return null;
    } catch (error) {
      console.error('Błąd wyboru zdjęcia:', error);
      return null;
    }
  };

  const uploadImage = async (imageUri: string, userId: string): Promise<string | null> => {
    try {
      // Konwertuj URI na blob
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Stwórz unikalną nazwę pliku
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;

      // Upload do Supabase Storage
      const { data, error } = await supabase.storage
        .from('clothing-images')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (error) {
        console.error('Błąd uploadu:', error);
        return null;
      }

      // Pobierz publiczny URL
      const { data: { publicUrl } } = supabase.storage
        .from('clothing-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Błąd przetwarzania zdjęcia:', error);
      return null;
    }
  };

  return { pickImage, uploadImage };
};