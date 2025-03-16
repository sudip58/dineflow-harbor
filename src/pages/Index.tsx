
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, BarChart, CalendarRange, UsersRound, Utensils } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header 
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md py-3 shadow-sm" : "bg-transparent py-6"
        )}
      >
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">R</span>
            </div>
            <span className="font-semibold text-xl">RestoManager</span>
          </div>
          
          <Button onClick={() => navigate('/dashboard')} variant="default">
            Get Started
          </Button>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20">
        <div 
          className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-800"
          aria-hidden="true"
        />
        
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 animate-fade-in">
              Seamless Restaurant Management
            </h1>
            <p className="text-xl text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
              Elevate your restaurant operations with our elegant, intuitive management system designed for modern dining establishments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '400ms' }}>
              <Button 
                onClick={() => navigate('/dashboard')} 
                size="lg" 
                className="px-8 rounded-full"
              >
                Get Started
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            <FeatureCard 
              icon={<BarChart className="h-6 w-6" />}
              title="Performance Insights"
              description="Real-time analytics and reports to optimize your restaurant's performance."
              delay={600}
            />
            <FeatureCard 
              icon={<CalendarRange className="h-6 w-6" />}
              title="Reservation System"
              description="Streamlined booking experience for your staff and guests."
              delay={800}
            />
            <FeatureCard 
              icon={<UsersRound className="h-6 w-6" />}
              title="Staff Management"
              description="Scheduling, task assignment, and performance tracking in one place."
              delay={1000}
            />
            <FeatureCard 
              icon={<Utensils className="h-6 w-6" />}
              title="Menu Management"
              description="Create, update, and optimize your menu items with ease."
              delay={1200}
            />
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold">R</span>
              </div>
              <span className="font-semibold">RestoManager</span>
            </div>
            
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} RestoManager. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

const FeatureCard = ({ icon, title, description, delay }: FeatureCardProps) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={cn(
        "glass rounded-xl p-6 transition-all duration-500 ease-out transform",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      )}
    >
      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

export default Index;
