import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { supabase } from './supabase';

export const useImageUploader = () => {
  const pickImage = async (): Promise<string | null> => {
    try {
      console.log('📸 Requesting media permissions...');
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Błąd', 'Potrzebujemy uprawnień do galerii!');
        return null;
      }

      console.log('🖼️ Launching image library...');
      
      // ✅ POPRAWIONE: Nowe API Expo ImagePicker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // ✅ UŻYJ MediaTypeOptions
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      console.log('Image picker result:', result);

      // ✅ POPRAWIONE: Nowy sposób sprawdzania wyniku
      if (result.canceled) {
        console.log('❌ Image selection canceled');
        return null;
      }

      if (result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        console.log('✅ Image selected:', selectedImage.uri);
        return selectedImage.uri;
      }
      
      console.log('❌ No assets selected');
      return null;

    } catch (error) {
      console.error('💥 Błąd wyboru zdjęcia:', error);
      Alert.alert('Błąd', 'Nie udało się wybrać zdjęcia');
      return null;
    }
  };

  const uploadImage = async (imageUri: string, userId: string): Promise<string | null> => {
    try {
      console.log('🔄 Starting upload process...');
      console.log('📸 Image URI:', imageUri);
      console.log('👤 User ID:', userId);

      if (!imageUri || !imageUri.startsWith('file://')) {
        console.error('❌ Invalid image URI:', imageUri);
        return null;
      }

      // ✅ Prosta metoda z fetch
      console.log('🌐 Fetching image data...');
      const response = await fetch(imageUri);
      
      if (!response.ok) {
        console.error('❌ Fetch failed:', response.status);
        return null;
      }

      const blob = await response.blob();
      console.log('✅ Blob created, size:', blob.size, 'bytes, type:', blob.type);

      // Stwórz nazwę pliku
      const fileExt = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      console.log('📝 File name:', fileName);

      // UPLOAD
      console.log('🚀 Attempting upload to clothing-images...');
      const { data, error } = await supabase.storage
        .from('clothing-images')
        .upload(fileName, blob, {
          contentType: blob.type || 'image/jpeg',
          upsert: false,
        });

      if (error) {
        console.error('❌ UPLOAD ERROR:');
        console.error('Message:', error.message);
        console.error('Error code:', error.code);
        return null;
      }

      console.log('✅ Upload successful!');

      // Pobierz publiczny URL
      const { data: { publicUrl } } = supabase.storage
        .from('clothing-images')
        .getPublicUrl(fileName);

      console.log('🌐 Public URL:', publicUrl);
      return publicUrl;

    } catch (error) {
      console.error('💥 CATCH ERROR:', error);
      return null;
    }
  };

  return { pickImage, uploadImage };
};