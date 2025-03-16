
import { useState } from 'react';
import { format } from 'date-fns';
import { MoreVertical, Users, Calendar, Clock, Phone, Mail, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckedState } from './ui/checkbox';

export interface Reservation {
  id: string;
  name: string;
  date: Date | string;
  time: string;
  guests: number;
  table: number;
  phone: string;
  email: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  notes?: string;
  restaurant_id?: string;
  created_at?: string;
}

interface ReservationCardProps {
  reservation: Reservation;
  onStatusChange?: (id: string, status: Reservation['status']) => void;
}

const statusStyles = {
  confirmed: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200'
  },
  pending: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200'
  },
  cancelled: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200'
  },
  completed: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200'
  },
};

const ReservationCard = ({ reservation, onStatusChange }: ReservationCardProps) => {
  const [expanded, setExpanded] = useState(false);
  
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  
  const handleStatusChange = (status: Reservation['status']) => {
    if (onStatusChange) {
      onStatusChange(reservation.id, status);
    }
  };
  
  // Ensure date is a Date object for formatting
  const reservationDate = typeof reservation.date === 'string' 
    ? new Date(reservation.date) 
    : reservation.date;
  
  return (
    <div 
      className={cn(
        "border rounded-xl overflow-hidden transition-all duration-300 ease-in-out card-hover",
        expanded ? "shadow-md" : "shadow-sm"
      )}
    >
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{reservation.name}</h3>
            <div className="flex items-center space-x-1 mt-1">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {format(reservationDate, 'MMM dd, yyyy')}
              </p>
              <span className="text-muted-foreground">•</span>
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{reservation.time}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span 
              className={cn(
                "text-xs px-2 py-1 rounded-full",
                statusStyles[reservation.status].bg,
                statusStyles[reservation.status].text,
                statusStyles[reservation.status].border
              )}
            >
              {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
            </span>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 rounded-full hover:bg-secondary">
                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleStatusChange('confirmed')}>
                  <Check className="h-4 w-4 mr-2 text-green-600" />
                  Confirm
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('completed')}>
                  <Check className="h-4 w-4 mr-2 text-blue-600" />
                  Mark as completed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('cancelled')}>
                  <X className="h-4 w-4 mr-2 text-red-600" />
                  Cancel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{reservation.guests} guests</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <span className="text-sm font-medium">Table:</span>
            <span className="text-sm">#{reservation.table}</span>
          </div>
          
          <button 
            onClick={toggleExpand}
            className="text-sm text-primary hover:text-primary/80 transition-colors ml-auto"
          >
            {expanded ? 'Less details' : 'More details'}
          </button>
        </div>
        
        {expanded && (
          <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-3 animate-fade-in">
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <a href={`tel:${reservation.phone}`} className="text-sm hover:underline">
                {reservation.phone}
              </a>
            </div>
            
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a href={`mailto:${reservation.email}`} className="text-sm hover:underline">
                {reservation.email}
              </a>
            </div>
            
            {reservation.notes && (
              <div className="col-span-full mt-2">
                <p className="text-sm font-medium">Notes:</p>
                <p className="text-sm text-muted-foreground mt-1">{reservation.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationCard;
