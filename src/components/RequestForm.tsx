'use client';

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { HelpType, UrgencyLevel, Request } from '@/types';
import { 
  AlertCircle, MapPin, Phone, Send, Search, Loader2, X,
  Droplets, Utensils, Pill, Home, Car, LifeBuoy, Zap
} from 'lucide-react';

interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
}

interface RequestFormProps {
  onSubmit: (data: Omit<Request, 'id' | 'created_at' | 'status' | 'user_id'>) => void;
  onCancel: () => void;
  onSelectOnMap: () => void;
  initialLocation?: { lat: number; lng: number } | null;
  isAuthenticated?: boolean;
}

export default function RequestForm({ onSubmit, onCancel, onSelectOnMap, initialLocation, isAuthenticated = false }: RequestFormProps) {
  const { t } = useLanguage();
  const [type, setType] = useState<HelpType>('water');
  const [urgency, setUrgency] = useState<UrgencyLevel>('normal');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(initialLocation || null);
  
  // Update location if initialLocation changes
  useEffect(() => {
    if (initialLocation) {
      setLocation(initialLocation);
    }
  }, [initialLocation]);

  // Address Search State
  const [addressQuery, setAddressQuery] = useState('');
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Icons mapping
  const typeIcons: Record<HelpType, React.ReactNode> = {
    water: <Droplets className="w-6 h-6 mb-1" />,
    food: <Utensils className="w-6 h-6 mb-1" />,
    medicine: <Pill className="w-6 h-6 mb-1" />,
    shelter: <Home className="w-6 h-6 mb-1" />,
    transport: <Car className="w-6 h-6 mb-1" />,
    rescue: <LifeBuoy className="w-6 h-6 mb-1" />,
    power: <Zap className="w-6 h-6 mb-1" />,
  };

  // Debounced Search
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (addressQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressQuery)}&limit=5&addressdetails=1&countrycodes=th`, {
          headers: {
            'User-Agent': 'HatYaiHelp/1.0'
          }
        });
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 800);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [addressQuery]);

  const handleSelectAddress = (result: NominatimResult) => {
    setLocation({
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon)
    });
    setAddressQuery(result.display_name.split(',')[0]); 
    setSuggestions([]);
  };

  const handleGetLocation = () => {
    setGettingLocation(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setGettingLocation(false);
      }, (error) => {
        console.error('Error getting location:', error);
        setGettingLocation(false);
        alert('Could not get location. Defaulting to Hat Yai center.');
      }, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });
    } else {
      setGettingLocation(false);
      alert('Geolocation not supported');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!location) {
      alert('Please provide a location');
      return;
    }

    onSubmit({
      type,
      urgency,
      description,
      location: { ...location, address: addressQuery || 'Approximated' },
      contact: { phone }
    });
  };

  return (
    <div className="bg-white rounded-t-2xl md:rounded-2xl shadow-2xl max-w-md w-full mx-auto flex flex-col max-h-[90vh] md:max-h-[85vh]">
      {/* Header with Close Button */}
      <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
        <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
          <AlertCircle className="text-red-600" />
          {t.need_help}
        </h2>
        <button 
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      
      <div className="overflow-y-auto p-4 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Help Type - Visual Grid */}
          <div>
            <label className="block text-base font-semibold text-gray-900 mb-3">
              1. {t.form.description.split(' ')[0] || 'Type'} {/* Simplification */}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(t.help_type) as HelpType[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setType(key)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                    type === key 
                      ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' 
                      : 'border-gray-100 bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {typeIcons[key]}
                  <span className="text-xs font-medium text-center leading-tight">{t.help_type[key]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Urgency - Big Toggles */}
          <div>
            <label className="block text-base font-semibold text-gray-900 mb-3">2. {t.form.urgency_label}</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setUrgency('normal')}
                className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all text-center ${
                  urgency === 'normal'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                {t.urgency.normal}
              </button>
              <button
                type="button"
                onClick={() => setUrgency('urgent')}
                className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all text-center ${
                  urgency === 'urgent'
                    ? 'border-red-500 bg-red-50 text-red-700 shadow-sm animate-pulse'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                🚨 {t.urgency.urgent}
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-base font-semibold text-gray-900 mb-2">3. {t.form.description}</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl p-3 h-24 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-0 text-base"
              placeholder="..."
              required
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-base font-semibold text-gray-900 mb-2">4. {t.form.location}</label>
            
            <div className="space-y-3">
              {/* Search */}
              <div className="relative">
                <div className="flex items-center gap-2 border-2 border-gray-200 rounded-xl p-3 bg-white focus-within:border-blue-500">
                  {isSearching ? <Loader2 className="w-5 h-5 text-gray-400 animate-spin" /> : <Search className="w-5 h-5 text-gray-400" />}
                  <input 
                    type="text"
                    value={addressQuery}
                    onChange={(e) => setAddressQuery(e.target.value)}
                    className="flex-1 outline-none text-gray-900 placeholder:text-gray-400 text-base"
                    placeholder={t.form.search_address}
                  />
                </div>
                {suggestions.length > 0 && (
                  <ul className="absolute z-20 w-full bg-white border border-gray-200 rounded-xl shadow-xl mt-1 max-h-48 overflow-y-auto">
                    {suggestions.map((item) => (
                      <li 
                        key={item.place_id}
                        onClick={() => handleSelectAddress(item)}
                        className="p-3 hover:bg-gray-50 cursor-pointer text-sm text-gray-800 border-b border-gray-100"
                      >
                        {item.display_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Location Buttons */}
              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={handleGetLocation}
                  className={`flex-1 py-3 px-2 rounded-xl flex items-center justify-center gap-2 transition-colors font-medium ${
                    location && !addressQuery 
                      ? 'bg-green-100 text-green-800 border-2 border-green-200' 
                      : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                  }`}
                >
                  <MapPin className="w-5 h-5" />
                  <span className="text-sm">{gettingLocation ? t.form.locating : location ? t.form.location_set : t.form.use_current_location}</span>
                </button>
                <button 
                  type="button"
                  onClick={onSelectOnMap}
                  className="px-5 rounded-xl bg-blue-50 text-blue-600 border-2 border-blue-100 hover:bg-blue-100 flex items-center justify-center"
                  title={t.form.select_on_map}
                >
                  <MapPin className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div>
            <label className="block text-base font-semibold text-gray-900 mb-2">5. {t.form.contact} <span className="text-red-500">*</span></label>
            <div className="flex items-center gap-3 border-2 border-gray-200 rounded-xl p-3 bg-white focus-within:border-blue-500 transition-colors">
              <Phone className="w-5 h-5 text-gray-400" />
              <input 
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 outline-none text-gray-900 placeholder:text-gray-400 text-lg font-medium"
                placeholder="08x-xxx-xxxx"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 pb-2">
            <button 
              type="submit" 
              className="w-full py-4 bg-red-600 text-white rounded-xl shadow-lg hover:bg-red-700 flex items-center justify-center gap-2 text-lg font-bold active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={gettingLocation}
            >
              <Send className="w-5 h-5" />
              {t.form.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
