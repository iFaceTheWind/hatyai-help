'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import MapWrapper from '@/components/MapWrapper';
import RequestForm from '@/components/RequestForm';
import AuthModal from '@/components/AuthModal';
import { Request, Volunteer, RequestStatus, HelpType, UrgencyLevel } from '@/types';
import { Plus, Heart, Globe, List, Map as MapIcon, LogIn, LogOut, Droplets, Utensils, Pill, Car, LifeBuoy, Zap, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Mock Data for initial fallback or volunteers
const INITIAL_VOLUNTEERS: Volunteer[] = [
  {
    id: 'v1',
    user_id: 'user_v1',
    name: 'Rescue Team A',
    help_types: ['rescue', 'transport', 'food'],
    location: { lat: 7.008, lng: 100.470 },
    service_radius_km: 5,
    contact: { phone: '089-999-9999' },
    is_available: true
  }
];

const typeIcons: Record<HelpType, React.ReactNode> = {
  water: <Droplets className="w-4 h-4" />,
  food: <Utensils className="w-4 h-4" />,
  medicine: <Pill className="w-4 h-4" />,
  shelter: <span className="text-lg">🏠</span>, // Fallback for Home icon conflict
  transport: <Car className="w-4 h-4" />,
  rescue: <LifeBuoy className="w-4 h-4" />,
  power: <Zap className="w-4 h-4" />,
};

export default function Home() {
  const { t, language, setLanguage } = useLanguage();
  const { user, signOut, loading } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [volunteers] = useState<Volunteer[]>(INITIAL_VOLUNTEERS);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Filters
  const [filterType, setFilterType] = useState<HelpType | 'all'>('all');
  const [filterUrgency, setFilterUrgency] = useState<UrgencyLevel | 'all'>('all');

  // Fetch requests from Supabase on mount
  useEffect(() => {
    const fetchRequests = async () => {
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching requests:', error.message, error.details);
      } else if (data) {
        // Map Supabase flat structure to our nested Request type
        const mappedRequests: Request[] = data.map((item: any) => ({
          id: item.id,
          type: item.type,
          urgency: item.urgency,
          description: item.description,
          location: {
            lat: item.lat,
            lng: item.lng,
            address: item.address
          },
          contact: {
            phone: item.contact_phone,
            lineId: item.contact_line_id,
            whatsapp: item.contact_whatsapp
          },
          status: item.status as RequestStatus,
          created_at: item.created_at,
          user_id: item.user_id
        }));
        setRequests(mappedRequests);
      }
    };

    fetchRequests();

    // Realtime subscription
    const subscription = supabase
      .channel('requests-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, (payload) => {
        console.log('Realtime change:', payload);
        fetchRequests(); // Refresh data on any change
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handlePostRequest = async (data: Omit<Request, 'id' | 'created_at' | 'status' | 'user_id'>) => {
    if (!user) {
      setShowRequestForm(false);
      setShowAuthModal(true);
      return;
    }

    // Optimistic update (will be overwritten by realtime/refresh)
    const newRequest: Request = {
      ...data,
      id: 'temp-' + Date.now(),
      created_at: new Date().toISOString(),
      status: 'open',
      user_id: user.id
    };
    setRequests([newRequest, ...requests]);
    setShowRequestForm(false);
    setSelectedLocation(null);

    // Insert into Supabase
    const { data: insertedData, error } = await supabase
      .from('requests')
      .insert({
        type: data.type,
        urgency: data.urgency,
        description: data.description,
        lat: data.location.lat,
        lng: data.location.lng,
        address: data.location.address,
        contact_phone: data.contact.phone,
        status: 'open',
        user_id: user.id
      })
      .select();

    if (error) {
      console.error('Error posting request:', error.message, error.details, error.hint);
      alert(`Error saving request: ${error.message || 'Please try again.'}`);
      // Remove optimistic update on error
      setRequests(requests.filter(req => req.id !== newRequest.id));
    }
  };

  const handleSelectOnMap = () => {
    setShowRequestForm(false);
    setIsSelectingLocation(true);
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (isSelectingLocation) {
      setSelectedLocation({ lat, lng });
      setIsSelectingLocation(false);
      setShowRequestForm(true);
    }
  };

  const handleStatusChange = async (id: string, newStatus: RequestStatus) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    // Optimistic update
    const previousRequests = [...requests];
    setRequests(requests.map(req => 
      req.id === id ? { ...req, status: newStatus } : req
    ));

    // Update Supabase
    const { error } = await supabase
      .from('requests')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      console.error('Error updating status:', error.message, error.details);
      alert(`Error updating status: ${error.message || 'Please try again.'}`);
      // Revert on error
      setRequests(previousRequests);
    }
  };

  const initiatePostRequest = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      setShowRequestForm(true);
    }
  };

  // Filtered requests for list view
  const filteredRequests = requests.filter(req => {
    if (filterType !== 'all' && req.type !== filterType) return false;
    if (filterUrgency !== 'all' && req.urgency !== filterUrgency) return false;
    return true;
  });

  return (
    <div className="h-dvh flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
            H
          </div>
          <h1 className="text-xl font-bold text-gray-800">{t.app_name}</h1>
        </div>
        
        <div className="flex items-center gap-3">
          {isSelectingLocation && (
            <div className="text-sm font-bold text-blue-600 animate-pulse hidden sm:block">
              {t.form.tap_to_select}
            </div>
          )}
          
          <button 
            onClick={() => setLanguage(language === 'en' ? 'th' : 'en')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full border hover:bg-gray-50 text-sm font-medium text-gray-700"
          >
            <Globe className="w-4 h-4" />
            {language === 'en' ? 'TH' : 'EN'}
          </button>

          {user ? (
            <button 
              onClick={signOut}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full border hover:bg-gray-50 text-sm font-medium text-red-600"
              title={t.auth.sign_out}
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <button 
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-900 text-white text-sm font-medium hover:bg-gray-800"
            >
              <LogIn className="w-4 h-4" />
              {t.auth.login_title}
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative flex flex-col h-full overflow-hidden">
        {viewMode === 'map' ? (
          <MapWrapper 
            requests={requests} 
            volunteers={volunteers} 
            className="w-full h-full"
            onMapClick={handleMapClick}
            selectionMode={isSelectingLocation}
            onStatusChange={handleStatusChange}
          />
        ) : (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Filters Bar */}
            <div className="bg-white border-b px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
              <button 
                onClick={() => { setFilterType('all'); setFilterUrgency('all'); }}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border whitespace-nowrap ${filterType === 'all' && filterUrgency === 'all' ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600'}`}
              >
                {t.form.filter_all}
              </button>
              <button 
                onClick={() => setFilterUrgency(filterUrgency === 'urgent' ? 'all' : 'urgent')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border whitespace-nowrap flex items-center gap-1 ${filterUrgency === 'urgent' ? 'bg-red-50 text-red-700 border-red-200' : 'border-gray-200 text-gray-600'}`}
              >
                🚨 {t.form.filter_urgent}
              </button>
              {(Object.keys(t.help_type) as HelpType[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setFilterType(filterType === key ? 'all' : key)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border whitespace-nowrap flex items-center gap-1 ${filterType === key ? 'bg-blue-50 text-blue-700 border-blue-200' : 'border-gray-200 text-gray-600'}`}
                >
                  {typeIcons[key]}
                  {t.help_type[key]}
                </button>
              ))}
            </div>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto p-4 pb-24">
              <div className="max-w-2xl mx-auto space-y-4">
                {filteredRequests.map(req => (
                  <div key={req.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-lg text-gray-900 flex items-center gap-2">
                        {typeIcons[req.type]}
                        {t.help_type[req.type]}
                      </span>
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${req.urgency === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                        {t.urgency[req.urgency]}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3 text-base">{req.description}</p>
                    <div className="text-sm text-gray-500 flex items-center gap-2 mb-3">
                      <span>{new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>•</span>
                      <span className={`capitalize font-medium ${req.status === 'open' ? 'text-green-600' : 'text-gray-600'}`}>
                        {t.status[req.status]}
                      </span>
                    </div>
                    
                    {req.contact.phone && (
                       <a href={`tel:${req.contact.phone}`} className="mb-3 block text-center w-full py-3 bg-gray-50 rounded-xl text-blue-600 font-semibold border border-gray-100 active:bg-gray-100">
                         Call {req.contact.phone}
                       </a>
                    )}
                    
                    {/* Action Buttons for List View */}
                    <div className="flex gap-2">
                      {req.status === 'open' && (
                        <button 
                          onClick={() => handleStatusChange(req.id, 'in_progress')}
                          className="flex-1 py-2 bg-blue-50 text-blue-600 text-sm font-semibold rounded-lg hover:bg-blue-100"
                        >
                          Mark In Progress
                        </button>
                      )}
                      {req.status !== 'resolved' && (
                        <button 
                          onClick={() => handleStatusChange(req.id, 'resolved')}
                          className="flex-1 py-2 bg-green-50 text-green-600 text-sm font-semibold rounded-lg hover:bg-green-100"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                {filteredRequests.length === 0 && (
                  <div className="text-center py-10 text-gray-500">
                    No requests found matching filters.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Floating Action Button & Controls */}
        <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-4 pointer-events-none px-4 z-20 pb-safe-or-4">
          {/* View Toggle */}
          <div className="bg-white rounded-full shadow-lg p-1 flex pointer-events-auto border border-gray-100">
            <button 
              onClick={() => setViewMode('map')}
              className={`p-3 rounded-full transition-colors ${viewMode === 'map' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <MapIcon className="w-6 h-6" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-full transition-colors ${viewMode === 'list' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <List className="w-6 h-6" />
            </button>
          </div>

          {/* Main Action Button */}
          <div className="flex gap-4 w-full max-w-md pointer-events-auto pb-2">
            <button 
              onClick={initiatePostRequest}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 px-6 rounded-2xl shadow-xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <Plus className="w-6 h-6" />
              <span className="text-lg">{t.need_help}</span>
            </button>
            <button 
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-4 px-6 rounded-2xl shadow-xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-95"
              onClick={() => alert('Volunteer registration coming soon!')}
            >
              <Heart className="w-6 h-6" />
              <span className="text-lg">{t.give_help}</span>
            </button>
          </div>
        </div>
      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}

      {/* Request Form Modal */}
      {showRequestForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in duration-200">
          <RequestForm 
            onSubmit={handlePostRequest} 
            onCancel={() => {
              setShowRequestForm(false);
              setSelectedLocation(null);
            }}
            onSelectOnMap={handleSelectOnMap}
            initialLocation={selectedLocation}
            isAuthenticated={!!user}
          />
        </div>
      )}
    </div>
  );
}
