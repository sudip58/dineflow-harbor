
import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, TrendingUp, TrendingDown, AlertCircle, CalendarClock } from 'lucide-react';
import { cn } from '@/lib/utils';
import Stats from '@/components/Stats';
import Navbar from '@/components/Navbar';
import TableGrid from '@/components/TableGrid';
import ReservationCard, { Reservation } from '@/components/ReservationCard';

// Sample data for dashboard
const pieData = [
  { name: 'Main Course', value: 45 },
  { name: 'Appetizers', value: 20 },
  { name: 'Desserts', value: 15 },
  { name: 'Drinks', value: 20 },
];

const barData = [
  { day: 'Mon', revenue: 2400 },
  { day: 'Tue', revenue: 1800 },
  { day: 'Wed', revenue: 3200 },
  { day: 'Thu', revenue: 3600 },
  { day: 'Fri', revenue: 4800 },
  { day: 'Sat', revenue: 5400 },
  { day: 'Sun', revenue: 4200 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const todayReservations: Reservation[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    date: new Date(),
    time: '12:30 PM',
    guests: 4,
    table: 3,
    phone: '(555) 123-4567',
    email: 'alex@example.com',
    status: 'confirmed',
  },
  {
    id: '2',
    name: 'Emily Carter',
    date: new Date(),
    time: '1:00 PM',
    guests: 2,
    table: 1,
    phone: '(555) 987-6543',
    email: 'emily@example.com',
    status: 'pending',
    notes: 'Anniversary celebration'
  },
  {
    id: '3',
    name: 'David Smith',
    date: new Date(),
    time: '7:30 PM',
    guests: 6,
    table: 5,
    phone: '(555) 456-7890',
    email: 'david@example.com',
    status: 'confirmed',
    notes: 'Prefers window seating'
  },
];

const Dashboard = () => {
  const [reservations, setReservations] = useState(todayReservations);
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    setLoaded(true);
  }, []);
  
  const handleReservationStatusChange = (id: string, status: Reservation['status']) => {
    setReservations(prev => 
      prev.map(reservation => 
        reservation.id === id ? { ...reservation, status } : reservation
      )
    );
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back to your restaurant overview</p>
        </header>
        
        <section 
          className={cn(
            "mb-10 transition-all duration-500",
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          <Stats />
        </section>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Restaurant Layout */}
          <Card 
            className={cn(
              "col-span-full lg:col-span-2 transition-all duration-500",
              loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
            style={{ transitionDelay: '100ms' }}
          >
            <CardHeader className="pb-2">
              <CardTitle>Restaurant Layout</CardTitle>
              <CardDescription>Current table status and arrangement</CardDescription>
            </CardHeader>
            <CardContent>
              <TableGrid />
            </CardContent>
          </Card>
          
          {/* Today's Reservations */}
          <Card 
            className={cn(
              "transition-all duration-500",
              loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
            style={{ transitionDelay: '200ms' }}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Today's Reservations</CardTitle>
                  <CardDescription>Upcoming and current bookings</CardDescription>
                </div>
                <CalendarClock className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reservations.length > 0 ? reservations.map((reservation, index) => (
                  <div 
                    key={reservation.id}
                    className={cn(
                      "transition-all duration-500",
                      loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    )}
                    style={{ transitionDelay: `${300 + index * 100}ms` }}
                  >
                    <ReservationCard 
                      reservation={reservation} 
                      onStatusChange={handleReservationStatusChange}
                    />
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No reservations for today</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Sales Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card 
            className={cn(
              "transition-all duration-500",
              loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
            style={{ transitionDelay: '300ms' }}
          >
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Weekly Revenue</CardTitle>
                  <CardDescription>Revenue breakdown by day</CardDescription>
                </div>
                <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>12% ↑</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`$${value}`, 'Revenue']}
                      contentStyle={{ 
                        borderRadius: '8px', 
                        border: '1px solid hsl(var(--border))',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                      }}
                    />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className={cn(
              "transition-all duration-500",
              loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
            style={{ transitionDelay: '400ms' }}
          >
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Order Breakdown</CardTitle>
                  <CardDescription>Distribution by category</CardDescription>
                </div>
                <Tabs defaultValue="today">
                  <TabsList className="grid w-36 grid-cols-2">
                    <TabsTrigger value="today">Today</TabsTrigger>
                    <TabsTrigger value="week">Week</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Percentage']}
                      contentStyle={{ 
                        borderRadius: '8px', 
                        border: '1px solid hsl(var(--border))',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
