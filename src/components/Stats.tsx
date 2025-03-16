
import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, Users, DollarSign, ShoppingBag, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

type StatCardProps = {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  description: string;
};

const StatCard = ({ title, value, change, icon, description }: StatCardProps) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  return (
    <div 
      className={cn(
        "stat-card transform transition-all duration-500 ease-out",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      )}
    >
      <div className="flex justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
      </div>
      
      <div className="mt-4 flex items-center">
        <span className={cn(
          "text-xs font-medium flex items-center",
          change > 0 ? "text-green-600" : "text-red-600"
        )}>
          {change > 0 ? 
            <ArrowUpRight className="h-3 w-3 mr-1" /> : 
            <ArrowDownRight className="h-3 w-3 mr-1" />}
          {Math.abs(change)}%
        </span>
        <span className="text-xs text-muted-foreground ml-2">vs last week</span>
      </div>
      
      <p className="mt-3 text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
};

const Stats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Customers"
        value="2,420"
        change={12}
        icon={<Users className="h-5 w-5" />}
        description="Active diners this month"
      />
      
      <StatCard
        title="Revenue"
        value="$23,592"
        change={8}
        icon={<DollarSign className="h-5 w-5" />}
        description="Total earnings this month"
      />
      
      <StatCard
        title="Orders"
        value="342"
        change={-3}
        icon={<ShoppingBag className="h-5 w-5" />}
        description="Completed orders today"
      />
      
      <StatCard
        title="Avg. Wait Time"
        value="24m"
        change={-5}
        icon={<Clock className="h-5 w-5" />}
        description="Average customer wait time"
      />
    </div>
  );
};

export default Stats;
