
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Users, Store, Plus, Edit, Trash, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import Navbar from '@/components/Navbar';

interface Restaurant {
  id: string;
  name: string;
  created_at: string;
  owner_id: string;
  owner_email?: string;
}

interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

const AdminDashboard = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRestaurantName, setNewRestaurantName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('manager');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchRestaurants();
    fetchUsers();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*');
      
      if (error) throw error;
      
      // Get owner emails for each restaurant
      const restaurantsWithOwners = await Promise.all(
        data.map(async (restaurant) => {
          const { data: userData } = await supabase
            .from('users')
            .select('email')
            .eq('id', restaurant.owner_id)
            .single();
          
          return {
            ...restaurant,
            owner_email: userData?.email
          };
        })
      );
      
      setRestaurants(restaurantsWithOwners);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      toast({
        title: 'Error',
        description: 'Failed to load restaurants',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*');
      
      if (error) throw error;
      
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createRestaurant = async () => {
    try {
      setIsSubmitting(true);
      
      // Create new user for restaurant owner
      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email: newUserEmail,
        password: newUserPassword,
        email_confirm: true
      });
      
      if (userError) throw userError;
      
      // Create restaurant
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .insert([
          { name: newRestaurantName, owner_id: userData.user.id }
        ])
        .select()
        .single();
      
      if (restaurantError) throw restaurantError;
      
      // Add user to restaurant staff
      const { error: staffError } = await supabase
        .from('restaurant_staff')
        .insert([
          { user_id: userData.user.id, restaurant_id: restaurantData.id, role: 'manager' }
        ]);
      
      if (staffError) throw staffError;
      
      toast({
        title: 'Success',
        description: 'Restaurant created successfully'
      });
      
      setNewRestaurantName('');
      setNewUserEmail('');
      setNewUserPassword('');
      fetchRestaurants();
      fetchUsers();
    } catch (error: any) {
      console.error('Error creating restaurant:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create restaurant',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const createUser = async () => {
    try {
      setIsSubmitting(true);
      
      // Create new user
      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email: newUserEmail,
        password: newUserPassword,
        email_confirm: true
      });
      
      if (userError) throw userError;
      
      // Add user metadata
      const { error: metadataError } = await supabase
        .from('users')
        .insert([
          { id: userData.user.id, email: newUserEmail, role: newUserRole }
        ]);
      
      if (metadataError) throw metadataError;
      
      toast({
        title: 'Success',
        description: 'User created successfully'
      });
      
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('manager');
      fetchUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create user',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteRestaurant = async (id: string) => {
    if (!confirm('Are you sure you want to delete this restaurant? This will also remove all associated data.')) {
      return;
    }
    
    try {
      // Delete restaurant and all cascaded data
      const { error } = await supabase
        .from('restaurants')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Restaurant deleted successfully'
      });
      
      fetchRestaurants();
    } catch (error: any) {
      console.error('Error deleting restaurant:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete restaurant',
        variant: 'destructive'
      });
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }
    
    try {
      // Delete user
      const { error } = await supabase.auth.admin.deleteUser(id);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'User deleted successfully'
      });
      
      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete user',
        variant: 'destructive'
      });
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage restaurants and users</p>
        </header>
        
        <Tabs defaultValue="restaurants" className="mb-8">
          <TabsList>
            <TabsTrigger value="restaurants">
              <Store className="h-4 w-4 mr-2" />
              Restaurants
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="restaurants" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">All Restaurants</h2>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Restaurant
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Restaurant</DialogTitle>
                    <DialogDescription>
                      Add a new restaurant and create an owner account
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="restaurantName">Restaurant Name</Label>
                      <Input
                        id="restaurantName"
                        value={newRestaurantName}
                        onChange={(e) => setNewRestaurantName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ownerEmail">Owner Email</Label>
                      <Input
                        id="ownerEmail"
                        type="email"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ownerPassword">Temporary Password</Label>
                      <Input
                        id="ownerPassword"
                        type="password"
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={createRestaurant} disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : "Create Restaurant"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {restaurants.map((restaurant) => (
                  <Card key={restaurant.id}>
                    <CardHeader>
                      <CardTitle>{restaurant.name}</CardTitle>
                      <CardDescription>
                        Owner: {restaurant.owner_email}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Created: {new Date(restaurant.created_at).toLocaleDateString()}
                      </p>
                    </CardContent>
                    <div className="p-4 pt-0 flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => deleteRestaurant(restaurant.id)}
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="users" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">All Users</h2>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                    <DialogDescription>
                      Add a new user to the system
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="userEmail">Email</Label>
                      <Input
                        id="userEmail"
                        type="email"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="userPassword">Temporary Password</Label>
                      <Input
                        id="userPassword"
                        type="password"
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="userRole">Role</Label>
                      <select
                        id="userRole"
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="manager">Manager</option>
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={createUser} disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : "Create User"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {users.map((user) => (
                  <Card key={user.id}>
                    <CardHeader>
                      <CardTitle>{user.email}</CardTitle>
                      <CardDescription>
                        Role: {user.role}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Created: {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </CardContent>
                    <div className="p-4 pt-0 flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => deleteUser(user.id)}
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
