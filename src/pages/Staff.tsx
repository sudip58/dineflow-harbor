
import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, Mail, Phone, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import Navbar from '@/components/Navbar';
import { format, addDays } from 'date-fns';

interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  avatar: string;
  status: 'active' | 'away' | 'off';
  shifts: {
    date: Date;
    start: string;
    end: string;
  }[];
}

// Sample staff data
const staffData: Staff[] = [
  {
    id: '1',
    name: 'Emily Johnson',
    email: 'emily@dineflow.com',
    phone: '(555) 123-4567',
    position: 'Head Chef',
    department: 'kitchen',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    status: 'active',
    shifts: [
      { date: new Date(), start: '10:00 AM', end: '6:00 PM' },
      { date: addDays(new Date(), 1), start: '10:00 AM', end: '6:00 PM' },
      { date: addDays(new Date(), 3), start: '12:00 PM', end: '8:00 PM' }
    ]
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael@dineflow.com',
    phone: '(555) 234-5678',
    position: 'Sous Chef',
    department: 'kitchen',
    avatar: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    status: 'active',
    shifts: [
      { date: new Date(), start: '9:00 AM', end: '5:00 PM' },
      { date: addDays(new Date(), 2), start: '9:00 AM', end: '5:00 PM' },
      { date: addDays(new Date(), 4), start: '11:00 AM', end: '7:00 PM' }
    ]
  },
  {
    id: '3',
    name: 'Sophia Rodriguez',
    email: 'sophia@dineflow.com',
    phone: '(555) 345-6789',
    position: 'Server',
    department: 'service',
    avatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    status: 'away',
    shifts: [
      { date: addDays(new Date(), 1), start: '4:00 PM', end: '10:00 PM' },
      { date: addDays(new Date(), 2), start: '4:00 PM', end: '10:00 PM' },
      { date: addDays(new Date(), 5), start: '4:00 PM', end: '10:00 PM' }
    ]
  },
  {
    id: '4',
    name: 'Daniel Wilson',
    email: 'daniel@dineflow.com',
    phone: '(555) 456-7890',
    position: 'Bartender',
    department: 'bar',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    status: 'active',
    shifts: [
      { date: new Date(), start: '4:00 PM', end: '12:00 AM' },
      { date: addDays(new Date(), 2), start: '4:00 PM', end: '12:00 AM' },
      { date: addDays(new Date(), 3), start: '4:00 PM', end: '12:00 AM' }
    ]
  },
  {
    id: '5',
    name: 'Olivia Martinez',
    email: 'olivia@dineflow.com',
    phone: '(555) 567-8901',
    position: 'Host',
    department: 'service',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    status: 'off',
    shifts: [
      { date: addDays(new Date(), 1), start: '11:00 AM', end: '7:00 PM' },
      { date: addDays(new Date(), 4), start: '11:00 AM', end: '7:00 PM' },
      { date: addDays(new Date(), 5), start: '5:00 PM', end: '11:00 PM' }
    ]
  },
  {
    id: '6',
    name: 'James Kim',
    email: 'james@dineflow.com',
    phone: '(555) 678-9012',
    position: 'Dishwasher',
    department: 'kitchen',
    avatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    status: 'active',
    shifts: [
      { date: new Date(), start: '4:00 PM', end: '10:00 PM' },
      { date: addDays(new Date(), 2), start: '4:00 PM', end: '10:00 PM' },
      { date: addDays(new Date(), 3), start: '4:00 PM', end: '10:00 PM' }
    ]
  }
];

const statusColors = {
  active: { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-800 dark:text-green-300' },
  away: { bg: 'bg-yellow-100 dark:bg-yellow-900/20', text: 'text-yellow-800 dark:text-yellow-300' },
  off: { bg: 'bg-gray-100 dark:bg-gray-800/50', text: 'text-gray-800 dark:text-gray-300' }
};

const Staff = () => {
  const [staff, setStaff] = useState<Staff[]>(staffData);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDepartment, setActiveDepartment] = useState('all');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentStaff, setCurrentStaff] = useState<Staff | null>(null);
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    setLoaded(true);
  }, []);
  
  const filteredStaff = staff.filter(member => {
    // Filter by search query
    const matchesSearch = 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by department
    const matchesDepartment = 
      activeDepartment === 'all' || 
      member.department === activeDepartment;
    
    return matchesSearch && matchesDepartment;
  });
  
  const openEditDialog = (member: Staff) => {
    setCurrentStaff({...member});
    setIsEditDialogOpen(true);
  };
  
  const handleSaveStaff = () => {
    if (!currentStaff) return;
    
    setStaff(prev => prev.map(member => 
      member.id === currentStaff.id ? currentStaff : member
    ));
    
    setIsEditDialogOpen(false);
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  // Get today's shifts
  const todayShifts = staff.filter(member => 
    member.shifts.some(shift => 
      shift.date.toDateString() === new Date().toDateString()
    )
  );
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
            <p className="text-muted-foreground mt-1">Manage your restaurant staff and scheduling</p>
          </div>
          
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            <span>Add Staff Member</span>
          </Button>
        </header>
        
        {/* Today's Schedule */}
        <div 
          className={cn(
            "mb-8 transition-all duration-500",
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          <h2 className="text-xl font-semibold mb-4">Today's Schedule</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todayShifts.length > 0 ? (
              todayShifts.map((member, index) => {
                const todayShift = member.shifts.find(shift => 
                  shift.date.toDateString() === new Date().toDateString()
                );
                
                if (!todayShift) return null;
                
                return (
                  <Card 
                    key={member.id}
                    className={cn(
                      "transition-all duration-500",
                      loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    )}
                    style={{ transitionDelay: `${index * 50}ms` }}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <Avatar className="h-12 w-12 border-2 border-primary">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{member.name}</h3>
                          <Badge 
                            className={cn(
                              statusColors[member.status].bg,
                              statusColors[member.status].text
                            )}
                          >
                            {member.status}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">{member.position}</p>
                        
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs font-medium">{todayShift.start} - {todayShift.end}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-full text-center py-8">
                <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No staff scheduled for today</p>
              </div>
            )}
          </div>
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
              className="w-full sm:w-[400px]"
              onValueChange={setActiveDepartment}
            >
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="kitchen">Kitchen</TabsTrigger>
                <TabsTrigger value="service">Service</TabsTrigger>
                <TabsTrigger value="bar">Bar</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="w-full sm:w-auto flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search staff..."
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
        
        {/* Staff List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStaff.map((member, index) => (
            <div 
              key={member.id}
              className={cn(
                "transition-all duration-500",
                loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
              style={{ transitionDelay: `${200 + index * 50}ms` }}
            >
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h3 className="font-semibold text-lg">{member.name}</h3>
                      <div className="flex items-center">
                        <Badge 
                          className={cn(
                            "mr-2",
                            statusColors[member.status].bg,
                            statusColors[member.status].text
                          )}
                        >
                          {member.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{member.position}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{member.email}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{member.phone}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium mb-2">Upcoming Shifts</h4>
                    <div className="space-y-2">
                      {member.shifts.slice(0, 3).map((shift, i) => (
                        <div key={i} className="flex justify-between items-center text-sm">
                          <span>{format(shift.date, 'EEE, MMM d')}</span>
                          <span className="text-muted-foreground">{shift.start} - {shift.end}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t flex justify-between">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 gap-1"
                      onClick={() => openEditDialog(member)}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      <span className="text-xs">Edit</span>
                    </Button>
                    
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
        
        {/* Edit Staff Dialog */}
        {currentStaff && (
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Edit Staff Member</DialogTitle>
                <DialogDescription>
                  Make changes to the staff member here.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="staff-name">Full Name</Label>
                    <Input
                      id="staff-name"
                      value={currentStaff.name}
                      onChange={(e) => setCurrentStaff({...currentStaff, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="staff-position">Position</Label>
                    <Input
                      id="staff-position"
                      value={currentStaff.position}
                      onChange={(e) => setCurrentStaff({...currentStaff, position: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="staff-email">Email</Label>
                    <Input
                      id="staff-email"
                      type="email"
                      value={currentStaff.email}
                      onChange={(e) => setCurrentStaff({...currentStaff, email: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="staff-phone">Phone</Label>
                    <Input
                      id="staff-phone"
                      value={currentStaff.phone}
                      onChange={(e) => setCurrentStaff({...currentStaff, phone: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="staff-department">Department</Label>
                    <select
                      id="staff-department"
                      value={currentStaff.department}
                      onChange={(e) => setCurrentStaff({...currentStaff, department: e.target.value})}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="kitchen">Kitchen</option>
                      <option value="service">Service</option>
                      <option value="bar">Bar</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="staff-status">Status</Label>
                    <select
                      id="staff-status"
                      value={currentStaff.status}
                      onChange={(e) => setCurrentStaff({...currentStaff, status: e.target.value as Staff['status']})}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="active">Active</option>
                      <option value="away">Away</option>
                      <option value="off">Off</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveStaff}>
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  );
};

export default Staff;
