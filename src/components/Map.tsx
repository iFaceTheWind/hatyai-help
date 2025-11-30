'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Request, Volunteer, RequestStatus, UrgencyLevel } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

// Define helper to generate custom markers
const createCustomIcon = (colorClass: string, borderColorClass: string, innerSymbol: string, pulse: boolean = false, size: 'normal' | 'small' = 'normal') => {
  const iconSize = size === 'small' ? 20 : 32;
  const fontSize = size === 'small' ? '0.75rem' : '0.875rem';
  
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div class="relative flex items-center justify-center">
        ${pulse ? `<div class="absolute w-full h-full rounded-full ${colorClass} opacity-75 animate-ping"></div>` : ''}
        <div class="relative rounded-full ${colorClass} border-2 ${borderColorClass} shadow-lg flex items-center justify-center text-white font-bold" style="width: ${iconSize}px; height: ${iconSize}px; font-size: ${fontSize};">
          ${innerSymbol}
        </div>
      </div>
    `,
    iconSize: [iconSize, iconSize],
    iconAnchor: [iconSize/2, iconSize],
    popupAnchor: [0, -iconSize]
  });
};

const getRequestIcon = (status: RequestStatus, urgency: UrgencyLevel) => {
  if (status === 'resolved') {
    return createCustomIcon('bg-gray-400', 'border-gray-500', '✓', false, 'small');
  }
  if (status === 'in_progress') {
    return createCustomIcon('bg-amber-400', 'border-amber-600', '⏳');
  }
  // Open
  if (urgency === 'urgent') {
    return createCustomIcon('bg-red-600', 'border-white', '!', true);
  }
  return createCustomIcon('bg-blue-500', 'border-white', '');
};

const volunteerIcon = createCustomIcon('bg-emerald-500', 'border-white', '♥');

interface MapProps {
  requests: Request[];
  volunteers: Volunteer[];
  center?: [number, number];
  zoom?: number;
  onMapClick?: (lat: number, lng: number) => void;
  selectionMode?: boolean;
  // Añadir nueva prop para cambiar estado
  onStatusChange?: (id: string, status: RequestStatus) => void;
}

const HAT_YAI_CENTER: [number, number] = [7.0086, 100.4767];

// Component to handle map clicks
function MapEvents({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  const map = useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export default function Map({ 
  requests, 
  volunteers, 
  center = HAT_YAI_CENTER, 
  zoom = 13, 
  onMapClick, 
  selectionMode = false,
  onStatusChange // Recibir la función
}: MapProps) {
  const { t } = useLanguage();

  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      scrollWheelZoom={true} 
      className="h-full w-full z-0"
      style={{ height: '100%', width: '100%', cursor: selectionMode ? 'crosshair' : 'grab' }}
    >
      <MapEvents onMapClick={onMapClick} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {requests.map((req) => (
        <Marker 
          key={req.id} 
          position={[req.location.lat, req.location.lng]}
          icon={getRequestIcon(req.status, req.urgency)}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-bold text-lg">{t.help_type[req.type]}</h3>
              <p className={`text-sm font-semibold ${req.urgency === 'urgent' ? 'text-red-600' : 'text-gray-600'}`}>
                {t.urgency[req.urgency]}
              </p>
              <p className="text-sm my-1">{req.description}</p>
              <p className="text-xs text-gray-500">{t.status[req.status]}</p>
              {req.contact.phone && (
                <p className="text-sm mt-2">📞 {req.contact.phone}</p>
              )}

              {/* NUEVOS BOTONES DE ACCIÓN */}
              <div className="mt-3 flex flex-col gap-2 border-t pt-2">
                {req.status === 'open' && (
                  <button 
                    onClick={() => onStatusChange?.(req.id, 'in_progress')}
                    className="w-full py-1 px-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                  >
                    Mark as In Progress / Calling
                  </button>
                )}
                
                {req.status !== 'resolved' && (
                  <button 
                    onClick={() => onStatusChange?.(req.id, 'resolved')}
                    className="w-full py-1 px-2 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                  >
                    Mark as Resolved
                  </button>
                )}
              </div>

            </div>
          </Popup>
        </Marker>
      ))}

      {volunteers.map((vol) => (
        <Marker 
          key={vol.id} 
          position={[vol.location.lat, vol.location.lng]}
          opacity={0.9}
          icon={volunteerIcon}
        >
           <Popup>
            <div className="p-2">
              <h3 className="font-bold text-lg">{vol.name}</h3>
              <p className="text-sm text-green-600">{t.role.volunteer}</p>
              <div className="flex flex-wrap gap-1 my-1">
                {vol.help_types.map(type => (
                  <span key={type} className="text-xs bg-green-100 text-green-800 px-1 rounded">
                    {t.help_type[type]}
                  </span>
                ))}
              </div>
              {vol.contact.phone && (
                <p className="text-sm mt-2">📞 {vol.contact.phone}</p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

