
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to get the current user's restaurant ID
export const getCurrentRestaurantId = async (): Promise<string | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  // Fetch the restaurant profile for this user
  const { data } = await supabase
    .from('restaurant_staff')
    .select('restaurant_id')
    .eq('user_id', user.id)
    .single();
  
  return data?.restaurant_id || null;
};

// Check if the current user is an admin
export const isUserAdmin = async (): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return false;
  
  const { data } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();
  
  return data?.role === 'admin';
};
