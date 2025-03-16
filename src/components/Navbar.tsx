
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, Calendar, Users, Coffee, ClipboardCheck, LayoutGrid } from 'lucide-react';
import { cn } from "@/lib/utils";

const navItems = [
  { path: '/dashboard', name: 'Dashboard', icon: Home },
  { path: '/reservations', name: 'Reservations', icon: Calendar },
  { path: '/tables', name: 'Tables', icon: LayoutGrid },
  { path: '/menu', name: 'Menu', icon: Coffee },
  { path: '/staff', name: 'Staff', icon: Users },
  { path: '/orders', name: 'Orders', icon: ClipboardCheck },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    document.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  // Close mobile menu when changing routes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <nav 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out",
        scrolled ? 
          "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm py-3" : 
          "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 text-foreground">
          <div className="relative h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold">R</span>
          </div>
          <span className="font-semibold text-xl hidden sm:inline-block">RestoManager</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-1",
                location.pathname === item.path
                  ? "text-primary bg-primary/10"
                  : "text-foreground/70 hover:text-foreground hover:bg-accent"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden flex items-center text-foreground"
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <X className="h-6 w-6 text-foreground" />
          ) : (
            <Menu className="h-6 w-6 text-foreground" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden fixed inset-0 z-50 bg-background/95 backdrop-blur-sm transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full pt-20 p-8 space-y-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "px-4 py-3 rounded-lg text-lg font-medium transition-colors duration-200 flex items-center space-x-3",
                location.pathname === item.path
                  ? "bg-primary/10 text-primary"
                  : "text-foreground hover:bg-accent"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
