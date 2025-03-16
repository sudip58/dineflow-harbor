
import { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus, Search, Filter, Save, X, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Navbar from '@/components/Navbar';
import TableGrid from '@/components/TableGrid';

interface Table {
  id: number;
  number: number;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  location: string;
  shape: 'rectangle' | 'circle';
  accessibility: boolean;
  lastOccupied?: string; 
}

const tablesData: Table[] = [
  { id: 1, number: 1, capacity: 2, status: 'available', location: 'Window', shape: 'circle', accessibility: true },
  { id: 2, number: 2, capacity: 2, status: 'occupied', location: 'Window', shape: 'circle', accessibility: true, lastOccupied: '12:30 PM' },
  { id: 3, number: 3, capacity: 4, status: 'reserved', location: 'Center', shape: 'rectangle', accessibility: false },
  { id: 4, number: 4, capacity: 4, status: 'available', location: 'Center', shape: 'rectangle', accessibility: true },
  { id: 5, number: 5, capacity: 6, status: 'occupied', location: 'Back', shape: 'rectangle', accessibility: true, lastOccupied: '1:15 PM' },
  { id: 6, number: 6, capacity: 8, status: 'available', location: 'Back', shape: 'rectangle', accessibility: true },
  { id: 7, number: 7, capacity: 2, status: 'reserved', location: 'Bar', shape: 'circle', accessibility: false },
  { id: 8, number: 8, capacity: 4, status: 'maintenance', location: 'Center', shape: 'rectangle', accessibility: true },
  { id: 9, number: 9, capacity: 6, status: 'available', location: 'Patio', shape: 'rectangle', accessibility: true },
  { id: 10, number: 10, capacity: 2, status: 'occupied', location: 'Patio', shape: 'circle', accessibility: true, lastOccupied: '2:00 PM' },
];

const statusColors = {
  available: { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-800 dark:text-green-300', border: 'border-green-200 dark:border-green-800' },
  occupied: { bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-800 dark:text-red-300', border: 'border-red-200 dark:border-red-800' },
  reserved: { bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-800 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
  maintenance: { bg: 'bg-gray-100 dark:bg-gray-800/50', text: 'text-gray-800 dark:text-gray-300', border: 'border-gray-200 dark:border-gray-700' }
};

const Tables = () => {
  const [tables, setTables] = useState<Table[]>(tablesData);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentTable, setCurrentTable] = useState<Table | null>(null);
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    setLoaded(true);
  }, []);
  
  const filteredTables = tables.filter(table => {
    // Filter by search query
    const matchesSearch = 
      table.number.toString().includes(searchQuery) ||
      table.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by tab
    const matchesTab = 
      activeTab === 'all' || 
      table.status === activeTab;
    
    return matchesSearch && matchesTab;
  });
  
  const openEditDialog = (table: Table) => {
    setCurrentTable({...table});
    setIsEditDialogOpen(true);
  };
  
  const handleSaveTable = () => {
    if (!currentTable) return;
    
    setTables(prev => prev.map(table => 
      table.id === currentTable.id ? currentTable : table
    ));
    
    setIsEditDialogOpen(false);
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tables</h1>
            <p className="text-muted-foreground mt-1">Manage your restaurant tables</p>
          </div>
          
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            <span>Add Table</span>
          </Button>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Table Layout */}
          <Card 
            className={cn(
              "col-span-full transition-all duration-500",
              loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <CardHeader>
              <CardTitle>Table Layout</CardTitle>
              <CardDescription>Visual representation of your restaurant</CardDescription>
            </CardHeader>
            <CardContent>
              <TableGrid />
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
                <TabsTrigger value="available">Available</TabsTrigger>
                <TabsTrigger value="occupied">Occupied</TabsTrigger>
                <TabsTrigger value="reserved">Reserved</TabsTrigger>
                <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="w-full sm:w-auto flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search tables..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                <Search className="h-4 w-4" />
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Filter by capacity</DropdownMenuItem>
                <DropdownMenuItem>Filter by location</DropdownMenuItem>
                <DropdownMenuItem>Filter by accessibility</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Tables List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTables.map((table, index) => (
            <div 
              key={table.id}
              className={cn(
                "transition-all duration-500",
                loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
              style={{ transitionDelay: `${200 + index * 50}ms` }}
            >
              <Card className="card-hover">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-lg">Table #{table.number}</h3>
                        {table.accessibility && (
                          <Badge variant="outline" className="text-xs">
                            Accessible
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {table.capacity} {table.capacity === 1 ? 'person' : 'people'}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {table.shape.charAt(0).toUpperCase() + table.shape.slice(1)}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {table.location}
                        </Badge>
                      </div>
                    </div>
                    
                    <Badge 
                      className={cn(
                        "ml-auto",
                        statusColors[table.status].bg,
                        statusColors[table.status].text,
                        statusColors[table.status].border
                      )}
                    >
                      {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
                    </Badge>
                  </div>
                  
                  {table.lastOccupied && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Occupied since: {table.lastOccupied}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 gap-1"
                        onClick={() => openEditDialog(table)}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span className="text-xs">Edit</span>
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8 gap-1">
                            <Settings2 className="h-3.5 w-3.5" />
                            <span className="text-xs">Status</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Mark as Available</DropdownMenuItem>
                          <DropdownMenuItem>Mark as Occupied</DropdownMenuItem>
                          <DropdownMenuItem>Mark as Reserved</DropdownMenuItem>
                          <DropdownMenuItem>Mark as Maintenance</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
        
        {/* Edit Table Dialog */}
        {currentTable && (
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Edit Table #{currentTable.number}</DialogTitle>
                <DialogDescription>
                  Make changes to the table configuration here.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="table-number">Table Number</Label>
                    <Input
                      id="table-number"
                      type="number"
                      value={currentTable.number}
                      onChange={(e) => setCurrentTable({...currentTable, number: parseInt(e.target.value)})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="table-capacity">Capacity</Label>
                    <Input
                      id="table-capacity"
                      type="number"
                      value={currentTable.capacity}
                      onChange={(e) => setCurrentTable({...currentTable, capacity: parseInt(e.target.value)})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="table-location">Location</Label>
                    <Input
                      id="table-location"
                      value={currentTable.location}
                      onChange={(e) => setCurrentTable({...currentTable, location: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="table-shape">Shape</Label>
                    <select
                      id="table-shape"
                      value={currentTable.shape}
                      onChange={(e) => setCurrentTable({...currentTable, shape: e.target.value as 'rectangle' | 'circle'})}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="rectangle">Rectangle</option>
                      <option value="circle">Circle</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="table-status">Status</Label>
                  <select
                    id="table-status"
                    value={currentTable.status}
                    onChange={(e) => setCurrentTable({...currentTable, status: e.target.value as Table['status']})}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="reserved">Reserved</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="accessibility"
                    checked={currentTable.accessibility}
                    onCheckedChange={(checked) => setCurrentTable({...currentTable, accessibility: checked})}
                  />
                  <Label htmlFor="accessibility">Accessibility Features</Label>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSaveTable}>
                  <Save className="h-4 w-4 mr-2" />
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

export default Tables;
