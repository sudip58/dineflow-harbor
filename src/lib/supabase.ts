
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with your provided values
const supabaseUrl = 'https://clmsoetktmvhazctlans.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsbXNvZXRrdG12aGF6Y3RsYW5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1MTE5NTIsImV4cCI6MjA1NDA4Nzk1Mn0.4j8CLdQn9By5XawbdC4LlWhFumIQT6gqCl2lZnQwQWk';

// Create the Supabase client
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
