
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Status, DataTable } from '@/components/OrdersTable';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Plus, Search, Filter, Clock, CheckCircle, XCircle, ShoppingCart, 
  AlertTriangle, Loader2
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  table_number: number;
  status: Status;
  total: number;
  items: OrderItem[];
  created_at: string;
  restaurant_id: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const { restaurantId } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (restaurantId) {
      fetchOrders(restaurantId);
      setupRealtimeSubscription(restaurantId);
    }
  }, [restaurantId]);

  useEffect(() => {
    // Filter orders based on search query and active tab
    const filtered = orders.filter(order => {
      const matchesSearch = 
        order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.table_number.toString().includes(searchQuery);
      
      const matchesTab = 
        activeTab === 'all' || 
        order.status === activeTab;
      
      return matchesSearch && matchesTab;
    });
    
    setFilteredOrders(filtered);
  }, [orders, searchQuery, activeTab]);

  const fetchOrders = async (restaurantId: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to match our Order interface
      const transformedOrders: Order[] = data.map(order => ({
        id: order.id,
        order_number: order.order_number,
        customer_name: order.customer_name,
        table_number: order.table_number,
        status: order.status as Status,
        total: order.total,
        items: order.order_items,
        created_at: order.created_at,
        restaurant_id: order.restaurant_id
      }));
      
      setOrders(transformedOrders);
      setLoading(false);
      setTimeout(() => setLoaded(true), 100);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load orders',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = (restaurantId: string) => {
    const subscription = supabase
      .channel('orders-channel')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public',
          table: 'orders',
          filter: `restaurant_id=eq.${restaurantId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            fetchOrderWithItems(payload.new.id);
          } else if (payload.eventType === 'UPDATE') {
            // Update the order in the state
            setOrders(prev => prev.map(order => 
              order.id === payload.new.id ? { ...order, ...payload.new } : order
            ));
          } else if (payload.eventType === 'DELETE') {
            // Remove the order from the state
            setOrders(prev => prev.filter(order => order.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  };

  const fetchOrderWithItems = async (orderId: string) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single();
    
    if (error) {
      console.error('Error fetching new order:', error);
      return;
    }
    
    const newOrder: Order = {
      id: data.id,
      order_number: data.order_number,
      customer_name: data.customer_name,
      table_number: data.table_number,
      status: data.status as Status,
      total: data.total,
      items: data.order_items,
      created_at: data.created_at,
      restaurant_id: data.restaurant_id
    };
    
    setOrders(prev => [newOrder, ...prev]);
    
    toast({
      title: 'New Order',
      description: `Order #${data.order_number} has been received`,
    });
  };

  const updateOrderStatus = async (orderId: string, status: Status) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);
      
      if (error) throw error;
      
      // The state will be updated via the real-time subscription
      toast({
        title: 'Status Updated',
        description: `Order status changed to ${status}`,
      });
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive'
      });
    }
  };

  if (!restaurantId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Not Connected</h1>
          <p className="text-muted-foreground mb-4">You are not connected to a restaurant.</p>
          <Button asChild>
            <a href="/auth/login">Sign In</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
            <p className="text-muted-foreground mt-1">Manage incoming and ongoing orders</p>
          </div>
          
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            <span>New Order</span>
          </Button>
        </header>
        
        {/* Order Stats */}
        <div 
          className={cn(
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 transition-all duration-500",
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">New Orders</p>
                <p className="text-2xl font-bold">
                  {orders.filter(o => o.status === 'new').length}
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <ShoppingCart className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">In Progress</p>
                <p className="text-2xl font-bold">
                  {orders.filter(o => o.status === 'preparing').length}
                </p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-full text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
                <Clock className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Completed</p>
                <p className="text-2xl font-bold">
                  {orders.filter(o => o.status === 'completed').length}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-full text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <CheckCircle className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Cancelled</p>
                <p className="text-2xl font-bold">
                  {orders.filter(o => o.status === 'cancelled').length}
                </p>
              </div>
              <div className="p-2 bg-red-100 rounded-full text-red-600 dark:bg-red-900/30 dark:text-red-400">
                <XCircle className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Filters and Search */}
        <div 
          className={cn(
            "mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between transition-all duration-500",
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
          style={{ transitionDelay: '100ms' }}
        >
          <div className="w-full sm:w-auto">
            <Tabs 
              defaultValue="all" 
              className="w-full sm:w-[500px]"
              onValueChange={setActiveTab}
            >
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="new">New</TabsTrigger>
                <TabsTrigger value="preparing">Preparing</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="w-full sm:w-auto flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                <Search className="h-4 w-4" />
              </div>
            </div>
            
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Orders Table */}
        <div 
          className={cn(
            "transition-all duration-500",
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
          style={{ transitionDelay: '200ms' }}
        >
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredOrders.length > 0 ? (
            <DataTable 
              data={filteredOrders} 
              onStatusChange={updateOrderStatus} 
            />
          ) : (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-1">No orders found</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {searchQuery || activeTab !== 'all'
                  ? "Try adjusting your filters or search criteria."
                  : "There are no orders in the system yet."}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Orders;
