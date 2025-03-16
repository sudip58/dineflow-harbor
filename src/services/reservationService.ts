
import { supabase, getCurrentRestaurantId } from '@/lib/supabase';
import { Reservation } from '@/components/ReservationCard';
import { useToast } from '@/components/ui/use-toast';

// Fetch all reservations for the current restaurant
export const fetchReservations = async (): Promise<Reservation[]> => {
  try {
    const restaurantId = await getCurrentRestaurantId();
    
    if (!restaurantId) {
      throw new Error('No restaurant ID found');
    }
    
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('restaurant_id', restaurantId);
      
    if (error) throw error;
    
    // Convert date strings to Date objects
    return data.map(reservation => ({
      ...reservation,
      date: new Date(reservation.date)
    }));
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return [];
  }
};

// Subscribe to reservation changes
export const subscribeToReservations = (
  callback: (reservations: Reservation[]) => void
) => {
  const handleReservationsUpdate = async () => {
    const reservations = await fetchReservations();
    callback(reservations);
  };
  
  // Initial fetch
  handleReservationsUpdate();
  
  // Set up real-time subscription
  const restaurantId = localStorage.getItem('restaurant_id');
  
  if (!restaurantId) {
    console.error('No restaurant ID found for subscription');
    return () => {}; // Return empty cleanup function
  }
  
  const subscription = supabase
    .channel('reservations_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'reservations',
        filter: `restaurant_id=eq.${restaurantId}`
      },
      () => handleReservationsUpdate()
    )
    .subscribe();
    
  // Return cleanup function
  return () => {
    subscription.unsubscribe();
  };
};

// Update reservation status
export const updateReservationStatus = async (
  id: string, 
  status: Reservation['status']
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('reservations')
      .update({ status })
      .eq('id', id);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error updating reservation status:', error);
    return false;
  }
};

// Create a new reservation
export const createReservation = async (
  reservation: Omit<Reservation, 'id' | 'created_at'>
): Promise<Reservation | null> => {
  try {
    const restaurantId = await getCurrentRestaurantId();
    
    if (!restaurantId) {
      throw new Error('No restaurant ID found');
    }
    
    const { data, error } = await supabase
      .from('reservations')
      .insert([{ ...reservation, restaurant_id: restaurantId }])
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      ...data,
      date: new Date(data.date)
    };
  } catch (error) {
    console.error('Error creating reservation:', error);
    return null;
  }
};
