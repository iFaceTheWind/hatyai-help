export type UserRole = 'need' | 'volunteer' | 'organization';

export type HelpType = 
  | 'water' 
  | 'food' 
  | 'medicine' 
  | 'shelter' 
  | 'transport' 
  | 'rescue' 
  | 'power';

export type UrgencyLevel = 'normal' | 'urgent';

export type RequestStatus = 'open' | 'in_progress' | 'resolved' | 'expired';

export interface Location {
  lat: number;
  lng: number;
  address?: string; // Approximate location description
}

export interface ContactInfo {
  phone?: string;
  lineId?: string;
  whatsapp?: string;
}

export interface Request {
  id: string;
  created_at: string;
  type: HelpType;
  urgency: UrgencyLevel;
  description: string;
  location: Location;
  contact: ContactInfo;
  status: RequestStatus;
  user_id?: string; // Optional for anonymous posting if allowed, or linked to auth
}

export interface Volunteer {
  id: string;
  user_id: string;
  name: string;
  help_types: HelpType[];
  location: Location;
  service_radius_km: number;
  contact: ContactInfo;
  is_available: boolean;
}

