import { createClient } from '@supabase/supabase-js';
import { Alert } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Rozszerzone logowanie dla debugowania
console.log('🔍 Supabase Config Check:');
console.log('URL exists:', !!supabaseUrl);
console.log('URL:', supabaseUrl?.substring(0, 20) + '...');
console.log('Key exists:', !!supabaseAnonKey);
console.log('Key starts with:', supabaseAnonKey?.substring(0, 10) + '...');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ BRAKUJĄCE ZMIENNE ŚRODOWISKOWE:');
  throw new Error('Brakujące zmienne środowiskowe Supabase! Sprawdź .env file!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'x-region': 'eu-north-1'
    }
  }
});

// Funkcja testująca połączenie
export const testSupabaseConnection = async () => {
  try {
    console.log('🧪 Testing Supabase connection...');
    
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('❌ Supabase connection error:', error);
      return false;
    }

    console.log('✅ Supabase connection successful!');
    console.log('User authenticated:', !!session);
    return true;
  } catch (error) {
    console.error('❌ Supabase test failed:', error);
    return false;
  }
};

// Funkcja testująca storage
export const testStorageAccess = async (bucketName: string = 'clothing-images') => {
  try {
    console.log(`🧪 Testing storage access for bucket: ${bucketName}`);
    
    const { data: buckets, error: bucketError } = await supabase
      .storage
      .listBuckets();

    if (bucketError) {
      console.error('❌ Bucket list error:', bucketError);
      return false;
    }

    const bucketExists = buckets?.some(b => b.name === bucketName);
    console.log(`Bucket ${bucketName} exists:`, bucketExists);
    return bucketExists || false;

  } catch (error) {
    console.error('❌ Storage test failed:', error);
    return false;
  }
};

// Funkcja sprawdzająca autentykację
export const checkAuth = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  console.log('User logged in:', !!session);
  if (session) {
    console.log('User ID:', session.user.id);
  }
  return session;
};

// Eksport pomocniczy
export { supabaseUrl, supabaseAnonKey };