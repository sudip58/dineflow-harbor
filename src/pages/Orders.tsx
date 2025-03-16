
import { useState, useEffect } from 'react';
import { Search, Filter, Eye, Check, X, Clock, ChevronDown, ChevronUp, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Navbar from '@/components/Navbar';
import { format } from 'date-fns';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

interface Order {
  id: string;
  tableNumber: number;
  customerName?: string;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  type: 'dine-in' | 'takeout' | 'delivery';
  items: OrderItem[];
  total: number;
  createdAt: Date;
  estimatedTime?: number; // in minutes
  paymentStatus: 'unpaid' | 'paid';
}

// Sample orders data
const ordersData: Order[] = [
  {
    id: 'ORD-001',
    tableNumber: 5,
    customerName: 'Alex Johnson',
    status: 'preparing',
    type: 'dine-in',
    items: [
      { id: '1', name: 'Classic Cheeseburger', quantity: 2, price: 12.99 },
      { id: '2', name: 'Caesar Salad', quantity: 1, price: 9.99 },
      { id: '3', name: 'Fresh Mojito', quantity: 2, price: 10.99, notes: 'Extra mint' }
    ],
    total: 57.95,
    createdAt: new Date(),
    estimatedTime: 15,
    paymentStatus: 'unpaid'
  },
  {
    id: 'ORD-002',
    tableNumber: 3,
    customerName: 'Emily Carter',
    status: 'ready',
    type: 'dine-in',
    items: [
      { id: '4', name: 'Margherita Pizza', quantity: 1, price: 14.99 },
      { id: '5', name: 'Truffle Fries', quantity: 1, price: 7.99 }
    ],
    total: 22.98,
    createdAt: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
    estimatedTime: 20,
    paymentStatus: 'unpaid'
  },
  {
    id: 'ORD-003',
    tableNumber: 0,
    customerName: 'David Smith',
    status: 'delivered',
    type: 'takeout',
    items: [
      { id: '6', name: 'Chocolate Lava Cake', quantity: 2, price: 8.99 },
      { id: '7', name: 'Classic Cheeseburger', quantity: 2, price: 12.99 }
    ],
    total: 43.96,
    createdAt: new Date(Date.now() - 40 * 60 * 1000), // 40 minutes ago
    paymentStatus: 'paid'
  },
  {
    id: 'ORD-004',
    tableNumber: 0,
    customerName: 'Sarah Williams',
    status: 'pending',
    type: 'delivery',
    items: [
      { id: '8', name: 'Margherita Pizza', quantity: 1, price: 14.99 },
      { id: '9', name: 'Caesar Salad', quantity: 1, price: 9.99 },
      { id: '10', name: 'Truffle Fries', quantity: 1, price: 7.99 }
    ],
    total: 32.97,
    createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    paymentStatus: 'unpaid'
  },
  {
    id: 'ORD-005',
    tableNumber: 8,
    customerName: 'Michael Brown',
    status: 'cancelled',
    type: 'dine-in',
    items: [
      { id: '11', name: 'Fresh Mojito', quantity: 4, price: 10.99 }
    ],
    total: 43.96,
    createdAt: new Date(Date.now() - 60 * 60 * 1000), // 60 minutes ago
    paymentStatus: 'unpaid'
  },
  {
    id: 'ORD-006',
    tableNumber: 2,
    customerName: 'Jessica Lee',
    status: 'preparing',
    type: 'dine-in',
    items: [
      { id: '12', name: 'Classic Cheeseburger', quantity: 1, price: 12.99 },
      { id: '13', name: 'Truffle Fries', quantity: 1, price: 7.99 },
      { id: '14', name: 'Fresh Mojito', quantity: 1, price: 10.99 }
    ],
    total: 31.97,
    createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    estimatedTime: 25,
    paymentStatus: 'unpaid'
  }
];

const statusColors = {
  pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/20', text: 'text-yellow-800 dark:text-yellow-300' },
  preparing: { bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-800 dark:text-blue-300' },
  ready: { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-800 dark:text-green-300' },
  delivered: { bg: 'bg-purple-100 dark:bg-purple-900/20', text: 'text-purple-800 dark:text-purple-300' },
  cancelled: { bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-800 dark:text-red-300' }
};

const typeIcons = {
  'dine-in': '🍽️',
  'takeout': '🥡',
  'delivery': '🚚'
};

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>(ordersData);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState('all');
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    setLoaded(true);
  }, []);
  
  const filteredOrders = orders.filter(order => {
    // Filter by search query
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customerName && order.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      order.tableNumber.toString().includes(searchQuery);
    
    // Filter by status
    const matchesStatus = 
      activeStatus === 'all' || 
      order.status === activeStatus;
    
    return matchesSearch && matchesStatus;
  });
  
  const viewOrderDetails = (order: Order) => {
    setCurrentOrder(order);
    setIsDetailsDialogOpen(true);
  };
  
  const updateOrderStatus = (id: string, status: Order['status']) => {
    setOrders(prev => prev.map(order => 
      order.id === id ? { ...order, status } : order
    ));
    
    if (currentOrder?.id === id) {
      setCurrentOrder(prev => prev ? { ...prev, status } : null);
    }
  };
  
  // Group orders by status for the dashboard view
  const pendingOrders = orders.filter(order => order.status === 'pending');
  const preparingOrders = orders.filter(order => order.status === 'preparing');
  const readyOrders = orders.filter(order => order.status === 'ready');
  
  const getTimeDisplay = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    } else {
      return format(date, 'h:mm a');
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
            <p className="text-muted-foreground mt-1">Track and manage all customer orders</p>
          </div>
          
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>Create Order</span>
          </Button>
        </header>
        
        {/* Quick Order Dashboard */}
        <div 
          className={cn(
            "mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6 transition-all duration-500",
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          {/* Pending Orders */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center">
                <div className="bg-yellow-100 text-yellow-800 p-1 rounded-full mr-2">
                  <Clock className="h-4 w-4" />
                </div>
                Pending Orders
              </CardTitle>
              <CardDescription>
                {pendingOrders.length} {pendingOrders.length === 1 ? 'order' : 'orders'} waiting to be accepted
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingOrders.length > 0 ? (
                  pendingOrders.map(order => (
                    <div key={order.id} className="flex justify-between p-3 bg-background rounded-lg border">
                      <div>
                        <div className="font-medium flex items-center">
                          <span className="mr-1">{typeIcons[order.type]}</span>
                          {order.type === 'dine-in' ? `Table ${order.tableNumber}` : order.customerName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {order.items.reduce((acc, item) => acc + item.quantity, 0)} items • ${order.total.toFixed(2)}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button size="icon" className="h-7 w-7" variant="outline" onClick={() => viewOrderDetails(order)}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" className="h-7 w-7" onClick={() => updateOrderStatus(order.id, 'preparing')}>
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    No pending orders
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Preparing Orders */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center">
                <div className="bg-blue-100 text-blue-800 p-1 rounded-full mr-2">
                  <Clock className="h-4 w-4" />
                </div>
                Preparing
              </CardTitle>
              <CardDescription>
                {preparingOrders.length} {preparingOrders.length === 1 ? 'order' : 'orders'} in progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {preparingOrders.length > 0 ? (
                  preparingOrders.map(order => (
                    <div key={order.id} className="flex justify-between p-3 bg-background rounded-lg border">
                      <div>
                        <div className="font-medium flex items-center">
                          <span className="mr-1">{typeIcons[order.type]}</span>
                          {order.type === 'dine-in' ? `Table ${order.tableNumber}` : order.customerName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Est. time: {order.estimatedTime} min • {getTimeDisplay(order.createdAt)}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button size="icon" className="h-7 w-7" variant="outline" onClick={() => viewOrderDetails(order)}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" className="h-7 w-7" onClick={() => updateOrderStatus(order.id, 'ready')}>
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    No orders in preparation
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Ready for Pickup/Delivery */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center">
                <div className="bg-green-100 text-green-800 p-1 rounded-full mr-2">
                  <Check className="h-4 w-4" />
                </div>
                Ready
              </CardTitle>
              <CardDescription>
                {readyOrders.length} {readyOrders.length === 1 ? 'order' : 'orders'} ready for service
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {readyOrders.length > 0 ? (
                  readyOrders.map(order => (
                    <div key={order.id} className="flex justify-between p-3 bg-background rounded-lg border">
                      <div>
                        <div className="font-medium flex items-center">
                          <span className="mr-1">{typeIcons[order.type]}</span>
                          {order.type === 'dine-in' ? `Table ${order.tableNumber}` : order.customerName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Ready for {order.type === 'dine-in' ? 'service' : order.type}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button size="icon" className="h-7 w-7" variant="outline" onClick={() => viewOrderDetails(order)}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" className="h-7 w-7" onClick={() => updateOrderStatus(order.id, 'delivered')}>
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    No orders ready for service
                  </div>
                )}
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
              className="w-full sm:w-[600px]"
              onValueChange={setActiveStatus}
            >
              <TabsList className="grid grid-cols-6 w-full">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="preparing">Preparing</TabsTrigger>
                <TabsTrigger value="ready">Ready</TabsTrigger>
                <TabsTrigger value="delivered">Delivered</TabsTrigger>
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
        
        {/* All Orders List */}
        <div 
          className={cn(
            "rounded-lg border overflow-hidden transition-all duration-500",
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
          style={{ transitionDelay: '200ms' }}
        >
          <div className="grid grid-cols-7 bg-muted/50 p-4 font-medium">
            <div className="col-span-2">Order Details</div>
            <div>Items</div>
            <div>Total</div>
            <div>Time</div>
            <div>Status</div>
            <div>Actions</div>
          </div>
          
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order, index) => (
              <Collapsible 
                key={order.id}
                className={cn(
                  "border-t transition-all duration-300",
                  index % 2 === 0 ? "bg-background" : "bg-muted/20"
                )}
              >
                <div className="grid grid-cols-7 p-4 items-center">
                  <div className="col-span-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{typeIcons[order.type]}</span>
                      <div>
                        <div className="font-medium">{order.id}</div>
                        <div className="text-sm text-muted-foreground">
                          {order.type === 'dine-in' ? 
                            `Table ${order.tableNumber}` : 
                            order.customerName
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-medium">
                      {order.items.reduce((acc, item) => acc + item.quantity, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">items</div>
                  </div>
                  
                  <div>
                    <div className="font-medium">${order.total.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">
                      {order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-medium">
                      {format(order.createdAt, 'h:mm a')}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(order.createdAt, 'MMM d')}
                    </div>
                  </div>
                  
                  <div>
                    <Badge 
                      className={cn(
                        statusColors[order.status].bg,
                        statusColors[order.status].text
                      )}
                    >
                      {order.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => viewOrderDetails(order)}
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      Details
                    </Button>
                    
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </div>
                
                <CollapsibleContent>
                  <div className="p-4 pt-0 pl-12 pr-8 pb-4 border-t bg-muted/10">
                    <div className="text-sm font-medium mb-2">Order Items</div>
                    <div className="space-y-2">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between py-1 border-b border-dashed border-muted last:border-0">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <span className="font-medium">{item.quantity} × </span>
                              <span className="ml-1">{item.name}</span>
                            </div>
                            {item.notes && (
                              <div className="text-xs text-muted-foreground">
                                Note: {item.notes}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between mt-4 font-medium">
                      <span>Total</span>
                      <span>${order.total.toFixed(2)}</span>
                    </div>
                    
                    <div className="mt-4 flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, 
                          order.status === 'pending' ? 'preparing' :
                          order.status === 'preparing' ? 'ready' :
                          order.status === 'ready' ? 'delivered' : 'delivered'
                        )}
                        disabled={['delivered', 'cancelled'].includes(order.status)}
                      >
                        <Check className="h-3.5 w-3.5 mr-1" />
                        {order.status === 'pending' ? 'Accept' :
                         order.status === 'preparing' ? 'Mark Ready' :
                         order.status === 'ready' ? 'Mark Delivered' : 'Update'}
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        disabled={['delivered', 'cancelled'].includes(order.status)}
                      >
                        <X className="h-3.5 w-3.5 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No orders found matching your criteria
            </div>
          )}
        </div>
        
        {/* Order Details Dialog */}
        {currentOrder && (
          <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Order {currentOrder.id}</DialogTitle>
                <DialogDescription>
                  {format(currentOrder.createdAt, 'MMMM d, yyyy h:mm a')}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-2 gap-4 py-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Order Type</h3>
                  <p className="flex items-center mt-1">
                    <span className="mr-1">{typeIcons[currentOrder.type]}</span>
                    {currentOrder.type.charAt(0).toUpperCase() + currentOrder.type.slice(1)}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <Badge 
                    className={cn(
                      "mt-1",
                      statusColors[currentOrder.status].bg,
                      statusColors[currentOrder.status].text
                    )}
                  >
                    {currentOrder.status}
                  </Badge>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {currentOrder.type === 'dine-in' ? 'Table' : 'Customer'}
                  </h3>
                  <p className="mt-1">
                    {currentOrder.type === 'dine-in' 
                      ? `Table ${currentOrder.tableNumber}` 
                      : currentOrder.customerName
                    }
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Payment</h3>
                  <p className="mt-1">
                    {currentOrder.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                  </p>
                </div>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted/50 p-3 font-medium">
                  Order Items
                </div>
                
                <div className="divide-y">
                  {currentOrder.items.map((item, i) => (
                    <div key={i} className="p-3 flex justify-between">
                      <div>
                        <span className="font-medium">{item.quantity} × </span>
                        <span>{item.name}</span>
                        {item.notes && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Note: {item.notes}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-3 bg-muted/20 flex justify-between font-medium">
                  <span>Total</span>
                  <span>${currentOrder.total.toFixed(2)}</span>
                </div>
              </div>
              
              <DialogFooter className="gap-2 sm:gap-0">
                <Button 
                  variant="outline" 
                  onClick={() => updateOrderStatus(currentOrder.id, 'cancelled')}
                  disabled={['delivered', 'cancelled'].includes(currentOrder.status)}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel Order
                </Button>
                
                <Button 
                  onClick={() => updateOrderStatus(currentOrder.id, 
                    currentOrder.status === 'pending' ? 'preparing' :
                    currentOrder.status === 'preparing' ? 'ready' :
                    currentOrder.status === 'ready' ? 'delivered' : 'delivered'
                  )}
                  disabled={['delivered', 'cancelled'].includes(currentOrder.status)}
                >
                  <Check className="h-4 w-4 mr-2" />
                  {currentOrder.status === 'pending' ? 'Accept Order' :
                   currentOrder.status === 'preparing' ? 'Mark as Ready' :
                   currentOrder.status === 'ready' ? 'Mark as Delivered' : 'Update Status'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  );
};

export default Orders;
