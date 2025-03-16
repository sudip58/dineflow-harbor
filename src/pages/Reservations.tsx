
import { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay } from 'date-fns';
import { CalendarIcon, PlusCircle, ChevronLeft, ChevronRight, Users, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import ReservationCard, { Reservation } from '@/components/ReservationCard';
import ReservationForm from '@/components/ReservationForm';
import Navbar from '@/components/Navbar';
import { subscribeToReservations, updateReservationStatus } from '@/services/reservationService';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const Reservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
  const [loaded, setLoaded] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    setLoaded(true);
    
    // Subscribe to real-time updates
    const unsubscribe = subscribeToReservations((data) => {
      setReservations(data);
      setIsLoading(false);
    });
    
    // Cleanup subscription on component unmount
    return () => {
      unsubscribe();
    };
  }, []);
  
  const handleReservationStatusChange = async (id: string, status: Reservation['status']) => {
    const success = await updateReservationStatus(id, status);
    
    if (success) {
      toast({
        title: 'Status updated',
        description: `Reservation status changed to ${status}`,
      });
    } else {
      toast({
        title: 'Error',
        description: 'Failed to update reservation status',
        variant: 'destructive',
      });
    }
  };
  
  const filteredReservations = reservations.filter(res => {
    // Filter by date
    const resDate = typeof res.date === 'string' ? new Date(res.date) : res.date;
    const sameDay = isSameDay(resDate, selectedDate);
    
    // Filter by status
    const matchesStatus = statusFilter === 'all' || res.status === statusFilter;
    
    // Filter by search query
    const matchesSearch = res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          res.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          res.phone.includes(searchQuery);
    
    return sameDay && matchesStatus && matchesSearch;
  });
  
  const nextWeek = () => {
    setWeekStart(addWeeks(weekStart, 1));
  };
  
  const prevWeek = () => {
    setWeekStart(subWeeks(weekStart, 1));
  };
  
  // Generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  // Count reservations by status
  const reservationCounts = {
    total: filteredReservations.length,
    confirmed: filteredReservations.filter(r => r.status === 'confirmed').length,
    pending: filteredReservations.filter(r => r.status === 'pending').length,
    cancelled: filteredReservations.filter(r => r.status === 'cancelled').length,
    completed: filteredReservations.filter(r => r.status === 'completed').length,
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reservations</h1>
            <p className="text-muted-foreground mt-1">Manage your upcoming bookings</p>
          </div>
          
          <Button className="gap-2" onClick={() => setIsFormOpen(true)}>
            <PlusCircle className="h-4 w-4" />
            <span>New Reservation</span>
          </Button>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Calendar Card */}
          <Card 
            className={cn(
              "transition-all duration-500",
              loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
              <CardDescription>Select a date to view reservations</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border shadow-sm"
              />
            </CardContent>
          </Card>
          
          {/* Week View */}
          <Card 
            className={cn(
              "col-span-full lg:col-span-2 transition-all duration-500",
              loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
            style={{ transitionDelay: '100ms' }}
          >
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Week View</CardTitle>
                  <CardDescription>Quick overview of your week</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="icon" onClick={prevWeek}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={nextWeek}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day, i) => {
                  const dayReservations = reservations.filter(r => {
                    const rDate = typeof r.date === 'string' ? new Date(r.date) : r.date;
                    return isSameDay(rDate, day);
                  });
                  const isToday = isSameDay(day, new Date());
                  const isSelected = isSameDay(day, selectedDate);
                  
                  return (
                    <div 
                      key={i} 
                      className={cn(
                        "flex flex-col items-center p-2 rounded-lg cursor-pointer transition-colors",
                        isToday && "bg-primary/10 font-medium",
                        isSelected && "border-2 border-primary",
                        !isToday && !isSelected && "hover:bg-secondary"
                      )}
                      onClick={() => setSelectedDate(day)}
                    >
                      <span className="text-xs text-muted-foreground">
                        {format(day, 'EEE')}
                      </span>
                      <span className="font-medium text-lg">
                        {format(day, 'd')}
                      </span>
                      {dayReservations.length > 0 && (
                        <div className="mt-1 flex items-center justify-center">
                          <div className={cn(
                            "flex items-center justify-center w-6 h-6 rounded-full text-xs",
                            "bg-primary text-primary-foreground"
                          )}>
                            {dayReservations.length}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
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
          style={{ transitionDelay: '200ms' }}
        >
          <div className="w-full sm:w-auto">
            <Tabs 
              defaultValue="all" 
              value={statusFilter}
              onValueChange={setStatusFilter}
              className="w-full sm:w-[400px]"
            >
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="all">
                  All
                  <span className="ml-1 text-xs bg-secondary rounded-full px-1.5 py-0.5">
                    {reservationCounts.total}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="confirmed">
                  Confirmed
                  <span className="ml-1 text-xs bg-green-100 text-green-800 rounded-full px-1.5 py-0.5">
                    {reservationCounts.confirmed}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Pending
                  <span className="ml-1 text-xs bg-yellow-100 text-yellow-800 rounded-full px-1.5 py-0.5">
                    {reservationCounts.pending}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed
                  <span className="ml-1 text-xs bg-blue-100 text-blue-800 rounded-full px-1.5 py-0.5">
                    {reservationCounts.completed}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="cancelled">
                  Cancelled
                  <span className="ml-1 text-xs bg-red-100 text-red-800 rounded-full px-1.5 py-0.5">
                    {reservationCounts.cancelled}
                  </span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="w-full sm:w-auto flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search reservations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Filter by table</DropdownMenuItem>
                <DropdownMenuItem>Filter by party size</DropdownMenuItem>
                <DropdownMenuItem>Filter by time</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        {/* Selected Day Heading */}
        <div 
          className={cn(
            "mb-6 transition-all duration-500",
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
          style={{ transitionDelay: '300ms' }}
        >
          <h2 className="text-xl font-semibold">
            Reservations for {format(selectedDate, 'MMMM d, yyyy')}
          </h2>
          <div className="flex items-center space-x-2 mt-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {filteredReservations.length} {filteredReservations.length === 1 ? 'reservation' : 'reservations'}
            </span>
          </div>
        </div>
        
        {/* Reservations List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReservations.length > 0 ? (
              filteredReservations.map((reservation, index) => (
                <div 
                  key={reservation.id}
                  className={cn(
                    "transition-all duration-500",
                    loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  )}
                  style={{ transitionDelay: `${400 + index * 100}ms` }}
                >
                  <ReservationCard 
                    reservation={reservation}
                    onStatusChange={handleReservationStatusChange}
                  />
                </div>
              ))
            ) : (
              <div 
                className="col-span-full flex flex-col items-center justify-center py-12 text-center"
                style={{ transitionDelay: '400ms' }}
              >
                <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-1">No reservations found</h3>
                <p className="text-muted-foreground max-w-md">
                  There are no reservations for the selected date or your search criteria.
                  Try selecting a different date or adjusting your filters.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setIsFormOpen(true)}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Reservation
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
      
      {/* New Reservation Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>New Reservation</DialogTitle>
          </DialogHeader>
          <ReservationForm 
            onSuccess={() => setIsFormOpen(false)}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reservations;
