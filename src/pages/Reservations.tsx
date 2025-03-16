
import { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay } from 'date-fns';
import { CalendarIcon, PlusCircle, ChevronLeft, ChevronRight, Users, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import ReservationCard, { Reservation } from '@/components/ReservationCard';
import Navbar from '@/components/Navbar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

// Sample data for reservations
const sampleReservations: Reservation[] = [
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
  {
    id: '4',
    name: 'Sarah Williams',
    date: addDays(new Date(), 1),
    time: '6:00 PM',
    guests: 5,
    table: 6,
    phone: '(555) 234-5678',
    email: 'sarah@example.com',
    status: 'confirmed',
  },
  {
    id: '5',
    name: 'Michael Brown',
    date: addDays(new Date(), 1),
    time: '8:00 PM',
    guests: 2,
    table: 2,
    phone: '(555) 876-5432',
    email: 'michael@example.com',
    status: 'confirmed',
    notes: 'Birthday celebration'
  },
  {
    id: '6',
    name: 'Jessica Lee',
    date: addDays(new Date(), 2),
    time: '7:00 PM',
    guests: 3,
    table: 4,
    phone: '(555) 345-6789',
    email: 'jessica@example.com',
    status: 'pending',
  }
];

const Reservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>(sampleReservations);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
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
  
  const filteredReservations = reservations.filter(res => {
    // Filter by date
    const sameDay = isSameDay(res.date, selectedDate);
    
    // Filter by search query
    const matchesSearch = res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          res.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          res.phone.includes(searchQuery);
    
    return sameDay && matchesSearch;
  });
  
  const nextWeek = () => {
    setWeekStart(addWeeks(weekStart, 1));
  };
  
  const prevWeek = () => {
    setWeekStart(subWeeks(weekStart, 1));
  };
  
  // Generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reservations</h1>
            <p className="text-muted-foreground mt-1">Manage your upcoming bookings</p>
          </div>
          
          <Button className="gap-2">
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
                  const dayReservations = reservations.filter(r => isSameDay(r.date, day));
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
            <Tabs defaultValue="all" className="w-full sm:w-[400px]">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
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
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Reservations;
