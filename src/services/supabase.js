import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from './firebase';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const missing = [
  !supabaseUrl && 'EXPO_PUBLIC_SUPABASE_URL',
  !supabaseKey && 'EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
].filter(Boolean);

if (missing.length > 0) {
  throw new Error(`Supabase configuration is incomplete. Missing: ${missing.join(', ')}`);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  accessToken: async () => {
    try {
      return await auth.currentUser?.getIdToken(false);
    } catch {
      return null;
    }
  },
});

export { supabase };
