
import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, Camera, Tag, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Navbar from '@/components/Navbar';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  tags: string[];
  available: boolean;
}

// Sample menu data
const menuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Classic Cheeseburger',
    description: 'Juicy beef patty with melted cheddar, lettuce, tomato, and special sauce on a brioche bun',
    price: 12.99,
    category: 'mains',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    tags: ['beef', 'popular', 'lunch'],
    available: true
  },
  {
    id: '2',
    name: 'Caesar Salad',
    description: 'Crisp romaine lettuce with parmesan, croutons, and Caesar dressing',
    price: 9.99,
    category: 'starters',
    image: 'https://images.unsplash.com/photo-1551248429-40975aa4de74?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    tags: ['vegetarian', 'healthy'],
    available: true
  },
  {
    id: '3',
    name: 'Truffle Fries',
    description: 'Golden fries tossed with truffle oil, parmesan, and herbs',
    price: 7.99,
    category: 'sides',
    image: 'https://images.unsplash.com/photo-1639744211796-4bd1d285c645?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    tags: ['vegetarian', 'popular'],
    available: true
  },
  {
    id: '4',
    name: 'Chocolate Lava Cake',
    description: 'Warm chocolate cake with a molten center, served with vanilla ice cream',
    price: 8.99,
    category: 'desserts',
    image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    tags: ['sweet', 'popular'],
    available: true
  },
  {
    id: '5',
    name: 'Fresh Mojito',
    description: 'Refreshing mix of lime, mint, sugar, and rum',
    price: 10.99,
    category: 'drinks',
    image: 'https://images.unsplash.com/photo-1546171753-97d7676e4602?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    tags: ['alcoholic', 'refreshing'],
    available: true
  },
  {
    id: '6',
    name: 'Margherita Pizza',
    description: 'Classic pizza with tomato sauce, fresh mozzarella, and basil',
    price: 14.99,
    category: 'mains',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    tags: ['vegetarian', 'popular'],
    available: true
  }
];

const Menu = () => {
  const [items, setItems] = useState<MenuItem[]>(menuItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<MenuItem | null>(null);
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    setLoaded(true);
  }, []);
  
  const filteredItems = items.filter(item => {
    // Filter by search query
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by category
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  const openEditDialog = (item: MenuItem) => {
    setCurrentItem({...item});
    setIsEditDialogOpen(true);
  };
  
  const handleSaveItem = () => {
    if (!currentItem) return;
    
    setItems(prev => prev.map(item => 
      item.id === currentItem.id ? currentItem : item
    ));
    
    setIsEditDialogOpen(false);
  };
  
  const toggleItemAvailability = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, available: !item.available } : item
    ));
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Menu Management</h1>
            <p className="text-muted-foreground mt-1">Create and manage your restaurant's offerings</p>
          </div>
          
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            <span>Add Menu Item</span>
          </Button>
        </header>
        
        {/* Filters and Search */}
        <div 
          className={cn(
            "mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between transition-all duration-500",
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          <div className="w-full sm:w-auto">
            <Tabs 
              defaultValue="all" 
              className="w-full sm:w-[600px]"
              onValueChange={setActiveCategory}
            >
              <TabsList className="grid grid-cols-6 w-full">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="starters">Starters</TabsTrigger>
                <TabsTrigger value="mains">Mains</TabsTrigger>
                <TabsTrigger value="sides">Sides</TabsTrigger>
                <TabsTrigger value="desserts">Desserts</TabsTrigger>
                <TabsTrigger value="drinks">Drinks</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="w-full sm:w-auto flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search menu items..."
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
        
        {/* Menu Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, index) => (
            <div 
              key={item.id}
              className={cn(
                "transition-all duration-500",
                loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              <Card className="overflow-hidden h-full flex flex-col">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                  />
                  <div className="absolute top-2 right-2 flex flex-col gap-2">
                    <Badge 
                      variant={item.available ? "default" : "secondary"}
                      className={cn(
                        item.available ? "bg-green-500" : "bg-gray-400"
                      )}
                    >
                      {item.available ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="flex-grow p-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <div className="flex items-center font-semibold text-xl text-primary">
                        <DollarSign className="h-4 w-4" />
                        {item.price.toFixed(2)}
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {item.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="border-t p-4">
                  <div className="flex justify-between items-center w-full">
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 gap-1"
                        onClick={() => openEditDialog(item)}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span className="text-xs">Edit</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 gap-1"
                        onClick={() => toggleItemAvailability(item.id)}
                      >
                        <Tag className="h-3.5 w-3.5" />
                        <span className="text-xs">
                          {item.available ? "Mark Unavailable" : "Mark Available"}
                        </span>
                      </Button>
                    </div>
                    
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>
        
        {/* Edit Menu Item Dialog */}
        {currentItem && (
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Edit Menu Item</DialogTitle>
                <DialogDescription>
                  Make changes to the menu item here.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="item-name">Item Name</Label>
                    <Input
                      id="item-name"
                      value={currentItem.name}
                      onChange={(e) => setCurrentItem({...currentItem, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="item-price">Price</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="item-price"
                        type="number"
                        step="0.01"
                        value={currentItem.price}
                        onChange={(e) => setCurrentItem({...currentItem, price: parseFloat(e.target.value)})}
                        className="pl-8"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="item-description">Description</Label>
                  <Textarea
                    id="item-description"
                    value={currentItem.description}
                    onChange={(e) => setCurrentItem({...currentItem, description: e.target.value})}
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="item-category">Category</Label>
                    <select
                      id="item-category"
                      value={currentItem.category}
                      onChange={(e) => setCurrentItem({...currentItem, category: e.target.value})}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="starters">Starters</option>
                      <option value="mains">Mains</option>
                      <option value="sides">Sides</option>
                      <option value="desserts">Desserts</option>
                      <option value="drinks">Drinks</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="item-image">Image URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="item-image"
                        value={currentItem.image}
                        onChange={(e) => setCurrentItem({...currentItem, image: e.target.value})}
                      />
                      <Button variant="outline" size="icon" className="shrink-0">
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveItem}>
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

export default Menu;
