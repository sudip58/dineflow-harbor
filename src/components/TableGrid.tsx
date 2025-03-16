
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

type TableStatus = 'available' | 'occupied' | 'reserved' | 'maintenance';

interface TableProps {
  id: number;
  number: number;
  seats: number;
  status: TableStatus;
  x: number;
  y: number;
  rotation?: number;
  shape?: 'circle' | 'rectangle';
  size?: 'small' | 'medium' | 'large';
}

const tableData: TableProps[] = [
  { id: 1, number: 1, seats: 2, status: 'available', x: 20, y: 20, shape: 'circle', size: 'small' },
  { id: 2, number: 2, seats: 2, status: 'occupied', x: 20, y: 50, shape: 'circle', size: 'small' },
  { id: 3, number: 3, seats: 4, status: 'reserved', x: 55, y: 20, shape: 'rectangle', size: 'medium' },
  { id: 4, number: 4, seats: 4, status: 'available', x: 55, y: 60, shape: 'rectangle', size: 'medium' },
  { id: 5, number: 5, seats: 6, status: 'occupied', x: 80, y: 35, rotation: 90, shape: 'rectangle', size: 'large' },
  { id: 6, number: 6, seats: 8, status: 'available', x: 25, y: 80, rotation: 0, shape: 'rectangle', size: 'large' },
  { id: 7, number: 7, seats: 2, status: 'reserved', x: 70, y: 80, shape: 'circle', size: 'small' },
  { id: 8, number: 8, seats: 4, status: 'maintenance', x: 85, y: 80, shape: 'rectangle', size: 'medium' },
];

const statusColors: Record<TableStatus, { bg: string, text: string, border: string }> = {
  available: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  occupied: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  reserved: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  maintenance: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' }
};

const Table = ({ number, seats, status, x, y, rotation = 0, shape = 'rectangle', size = 'medium' }: TableProps) => {
  const [isPopoverVisible, setIsPopoverVisible] = useState(false);
  
  const sizeMap = {
    circle: {
      small: 'h-12 w-12',
      medium: 'h-16 w-16',
      large: 'h-20 w-20'
    },
    rectangle: {
      small: 'h-10 w-14',
      medium: 'h-12 w-20',
      large: 'h-14 w-28'
    }
  };
  
  const handleClick = () => {
    setIsPopoverVisible(!isPopoverVisible);
  };
  
  return (
    <div 
      className="absolute cursor-pointer transition-all duration-300 ease-in-out"
      style={{ 
        left: `${x}%`, 
        top: `${y}%`, 
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        zIndex: isPopoverVisible ? 10 : 1
      }}
      onClick={handleClick}
    >
      <div 
        className={cn(
          'flex items-center justify-center border-2 font-medium shadow-sm transition-transform hover:scale-105',
          shape === 'circle' ? 'rounded-full' : 'rounded-lg',
          sizeMap[shape][size],
          statusColors[status].bg,
          statusColors[status].text,
          statusColors[status].border
        )}
      >
        {number}
      </div>
      
      {isPopoverVisible && (
        <div 
          className="absolute z-10 mt-2 p-3 bg-white dark:bg-slate-800 rounded-lg shadow-lg border text-sm min-w-36 transform origin-top transition-all duration-200 ease-out animate-scale-in"
          style={{ 
            top: '100%', 
            left: '50%', 
            transform: 'translateX(-50%)'
          }}
        >
          <div className="flex flex-col space-y-1">
            <p><span className="font-medium">Table:</span> #{number}</p>
            <p><span className="font-medium">Seats:</span> {seats}</p>
            <p>
              <span className="font-medium">Status:</span>
              <span className={cn('ml-1 px-1.5 py-0.5 rounded text-xs', statusColors[status].bg, statusColors[status].text)}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const TableGrid = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <div className="relative h-[450px] w-full bg-secondary/50 border rounded-xl shadow-sm overflow-hidden">
      {/* Restaurant Boundaries */}
      <div className="absolute inset-4 border border-dashed border-gray-300 rounded-lg">
        {/* Restaurant Elements */}
        <div className="absolute left-3 top-3 h-12 w-28 bg-gray-200 rounded-md flex items-center justify-center text-xs font-medium">Entrance</div>
        <div className="absolute right-3 top-3 h-12 w-28 bg-gray-200 rounded-md flex items-center justify-center text-xs font-medium">Bar</div>
        <div className="absolute left-3 bottom-3 h-12 w-28 bg-gray-200 rounded-md flex items-center justify-center text-xs font-medium">Kitchen</div>
        <div className="absolute right-3 bottom-3 h-12 w-28 bg-gray-200 rounded-md flex items-center justify-center text-xs font-medium">Restrooms</div>
      </div>
      
      {/* Tables */}
      {tableData.map((table) => (
        <div
          key={table.id}
          className={cn(
            "transition-all duration-500 ease-out",
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
          style={{ transitionDelay: `${table.id * 100}ms` }}
        >
          <Table {...table} />
        </div>
      ))}
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white dark:bg-slate-800 shadow-sm border rounded-lg p-2 flex flex-col space-y-1 text-xs">
        <h4 className="font-medium">Status</h4>
        <div className="flex items-center space-x-1">
          <div className="h-3 w-3 rounded-full bg-green-100 border border-green-200"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="h-3 w-3 rounded-full bg-red-100 border border-red-200"></div>
          <span>Occupied</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="h-3 w-3 rounded-full bg-blue-100 border border-blue-200"></div>
          <span>Reserved</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="h-3 w-3 rounded-full bg-gray-100 border border-gray-200"></div>
          <span>Maintenance</span>
        </div>
      </div>
    </div>
  );
};

export default TableGrid;
