
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  restaurantId: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, restaurantName: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setIsAdmin(false);
        setRestaurantId(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchUserData(userId: string) {
    try {
      // Check if user is admin
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();
      
      setIsAdmin(userData?.role === 'admin');

      // Get restaurant ID
      const { data: staffData } = await supabase
        .from('restaurant_staff')
        .select('restaurant_id')
        .eq('user_id', userId)
        .single();
      
      setRestaurantId(staffData?.restaurant_id || null);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      toast({
        title: "Signed in successfully",
        description: "Welcome back to DineFlow!",
      });
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message || "Please check your credentials and try again",
        variant: "destructive"
      });
      throw error;
    }
  }

  async function signUp(email: string, password: string, restaurantName: string) {
    try {
      const { error, data } = await supabase.auth.signUp({ email, password });
      
      if (error) throw error;
      
      if (data.user) {
        // Create restaurant entry
        const { data: restaurantData, error: restaurantError } = await supabase
          .from('restaurants')
          .insert([{ name: restaurantName, owner_id: data.user.id }])
          .select()
          .single();
          
        if (restaurantError) throw restaurantError;
        
        // Add user to restaurant staff
        const { error: staffError } = await supabase
          .from('restaurant_staff')
          .insert([{
            user_id: data.user.id,
            restaurant_id: restaurantData.id,
            role: 'manager'
          }]);
          
        if (staffError) throw staffError;
      }
      
      toast({
        title: "Signed up successfully",
        description: "Please check your email to confirm your account",
      });
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message || "There was a problem creating your account",
        variant: "destructive"
      });
      throw error;
    }
  }

  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive"
      });
    }
  }

  const value = {
    user,
    session,
    isLoading,
    isAdmin,
    restaurantId,
    signIn,
    signUp,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
