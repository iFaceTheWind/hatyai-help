'use client';

import dynamic from 'next/dynamic';
import { Request, Volunteer, RequestStatus } from '@/types';

const Map = dynamic(() => import('./Map'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center text-gray-500">Loading Map...</div>
});

interface MapWrapperProps {
  requests: Request[];
  volunteers: Volunteer[];
  className?: string;
  onMapClick?: (lat: number, lng: number) => void;
  selectionMode?: boolean;
  // Nueva prop
  onStatusChange?: (id: string, status: RequestStatus) => void;
}

export default function MapWrapper({ 
  requests, 
  volunteers, 
  className, 
  onMapClick, 
  selectionMode,
  onStatusChange 
}: MapWrapperProps) {
  return (
    <div className={className}>
      <Map 
        requests={requests} 
        volunteers={volunteers} 
        onMapClick={onMapClick}
        selectionMode={selectionMode}
        onStatusChange={onStatusChange} // Pasarla al mapa
      />
    </div>
  );
}

