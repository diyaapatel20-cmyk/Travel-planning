import React, { useState, useEffect } from 'react';
import {
  Compass,
  Calendar,
  Sparkles,
  MapPin,
  Users,
  Activity,
  Settings,
  Plus
} from 'lucide-react';
import { Trip, TripMember, MemberPreference, ItineraryItem, Place } from '../types';
import { appStore } from '../lib/database/store';
import { TripOverview } from '../components/workspace/TripOverview';
import { VisualItineraryTimeline } from '../components/itinerary/VisualItineraryTimeline';
import { InteractiveMap } from '../components/map/InteractiveMap';
import { MemberManagement } from '../components/members/MemberManagement';
import { ActivityFeed } from '../components/activity/ActivityFeed';
import { TripSettings } from '../components/workspace/TripSettings';
import { PlaceDetailModal } from '../components/places/PlaceDetailModal';
import { AIDrawer } from '../components/ai/AIDrawer';
import { ExploreModal } from '../components/explore/ExploreModal';
import { GoogleChatWorkspace } from '../components/chat/GoogleChatWorkspace';

interface TripWorkspacePageProps {
  tripId: string;
  initialTab?: string;
  onNavigate: (route: string) => void;
}

export const TripWorkspacePage: React.FC<TripWorkspacePageProps> = ({
  tripId,
  initialTab = 'overview',
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'map' | 'members' | 'chat' | 'activity' | 'settings'>(
    (initialTab as any) === 'ai' ? 'overview' : ((initialTab as any) || 'overview')
  );
  const [isAIDrawerOpen, setIsAIDrawerOpen] = useState<boolean>(initialTab === 'ai');
  const [initialAIQuery, setInitialAIQuery] = useState<string>('');
  const [isExploreOpen, setIsExploreOpen] = useState<boolean>(false);
  const [selectedPlaceForModal, setSelectedPlaceForModal] = useState<Place | null>(null);

  useEffect(() => {
    if (initialTab === 'ai') {
      setIsAIDrawerOpen(true);
    } else if (initialTab && initialTab !== activeTab) {
      setActiveTab(initialTab as any);
    }
  }, [initialTab]);

  // Listen to custom event for opening explore or AI drawer
  useEffect(() => {
    const handleOpenExplore = () => setIsExploreOpen(true);
    const handleOpenAI = (e: any) => {
      setInitialAIQuery(e.detail?.query || '');
      setIsAIDrawerOpen(true);
    };

    window.addEventListener('open-explore-modal', handleOpenExplore);
    window.addEventListener('open-ai-drawer', handleOpenAI);

    return () => {
      window.removeEventListener('open-explore-modal', handleOpenExplore);
      window.removeEventListener('open-ai-drawer', handleOpenAI);
    };
  }, []);

  const trip = (appStore.trips && appStore.trips.length > 0)
    ? (appStore.trips.find((t) => t.id === tripId) || appStore.trips[0])
    : {
        id: tripId || 'trip-ahmedabad-sih',
        name: 'Ahmedabad Escape',
        destination: 'Ahmedabad',
        start_date: '2026-10-12',
        end_date: '2026-10-14',
        budget: 5000,
        currency: 'INR',
        transport: 'Taxi' as const,
        invite_code: 'YTX-8K4P',
        created_by: 'user-diya',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

  const members = (appStore.members || []).filter((m) => m.trip_id === trip.id);
  const preferences = (appStore.preferences || []).filter((p) => p.trip_id === trip.id);
  const itinerary = (appStore.itinerary || []).filter((i) => i.trip_id === trip.id);
  const allPlaces = appStore.places || [];
  const events = (appStore.events || []).filter((e) => e.trip_id === trip.id);
  const decisions = (appStore.decisions || []).filter((d) => d.trip_id === trip.id);

  const handleOpenAIDrawer = (query?: string) => {
    setInitialAIQuery(query || '');
    setIsAIDrawerOpen(true);
  };

  const handleTabChange = (tab: 'overview' | 'itinerary' | 'map' | 'members' | 'chat' | 'activity' | 'settings') => {
    setActiveTab(tab);
    onNavigate(`/trip/${trip.id}/${tab}`);
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20 md:pb-12" id="trip-workspace-container">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Main View Switching based on Active Tab */}
        {activeTab === 'overview' && (
          <TripOverview
            trip={trip}
            members={members}
            preferences={preferences}
            itinerary={itinerary}
            allPlaces={allPlaces}
            onOpenAIDrawer={handleOpenAIDrawer}
            onOpenPlaceDetails={(place) => setSelectedPlaceForModal(place)}
            onOpenExplore={() => setIsExploreOpen(true)}
            onNavigateTab={handleTabChange}
          />
        )}

        {activeTab === 'itinerary' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs">
              <div>
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block mb-1">
                  Living Schedule
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                  Visual Itinerary Timeline
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 mt-1">
                  Multi-day chronological schedule with Dijkstra transit durations and budget checks.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsExploreOpen(true)}
                  className="px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4 text-stone-600" />
                  <span>Browse Places</span>
                </button>
                <button
                  onClick={() => handleOpenAIDrawer('Optimize the itinerary to balance everyone’s preferences and fix overlaps')}
                  className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>AI Optimize</span>
                </button>
              </div>
            </div>

            <VisualItineraryTimeline
              trip={trip}
              members={members}
              itinerary={itinerary}
              allPlaces={allPlaces}
              onOpenPlaceDetails={(place) => setSelectedPlaceForModal(place)}
              onOpenExplore={() => setIsExploreOpen(true)}
            />
          </div>
        )}

        {activeTab === 'map' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs">
              <div>
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block mb-1">
                  Geographic Route
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                  Ahmedabad Interactive Map
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 mt-1">
                  Numbered itinerary markers, Dijkstra transit paths, and Google Maps integration.
                </p>
              </div>

              <button
                onClick={() => handleOpenAIDrawer('Optimize route with Dijkstra to minimize travel time')}
                className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Sparkles className="w-4 h-4" />
                <span>Re-route Dijkstra</span>
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xs">
              <div className="h-[650px] w-full">
                <InteractiveMap
                  itinerary={itinerary}
                  allPlaces={allPlaces}
                  onSelectPlace={(place) => setSelectedPlaceForModal(place)}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <MemberManagement
            trip={trip}
            members={members}
            preferences={preferences}
            onTriggerAIReplan={() => handleOpenAIDrawer('Re-plan our itinerary using the updated member preferences')}
          />
        )}

        {activeTab === 'chat' && (
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block mb-1">
                  Google Workspace Integration
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                  Google Chat Spaces & Messaging
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 mt-1">
                  Collaborate in real-time with your travel group, browse Google Chat spaces, and broadcast itineraries.
                </p>
              </div>
            </div>
            <GoogleChatWorkspace trip={trip} itinerary={itinerary} members={members} />
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-2xs">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block mb-1">
                Collaboration Log
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                Live Group Activity Timeline
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                Realtime stream of member joins, preference updates, and WayTogether AI itinerary optimizations.
              </p>
            </div>
            <ActivityFeed events={events} decisions={decisions} />
          </div>
        )}

        {activeTab === 'settings' && (
          <TripSettings trip={trip} onNavigate={onNavigate} />
        )}
      </div>

      {/* AI Drawer (Slides in from right; map/itinerary remain visible behind on desktop) */}
      <AIDrawer
        isOpen={isAIDrawerOpen}
        onClose={() => setIsAIDrawerOpen(false)}
        trip={trip}
        members={members}
        preferences={preferences}
        itinerary={itinerary}
        allPlaces={allPlaces}
        initialQuery={initialAIQuery}
        onOpenPlaceDetails={(place) => setSelectedPlaceForModal(place)}
      />

      {/* Explore Ahmedabad Sights Modal */}
      <ExploreModal
        isOpen={isExploreOpen}
        onClose={() => setIsExploreOpen(false)}
        trip={trip}
        itinerary={itinerary}
        preferences={preferences}
        onOpenPlaceDetails={(place) => setSelectedPlaceForModal(place)}
      />

      {/* Place Detail Modal */}
      <PlaceDetailModal
        place={selectedPlaceForModal}
        trip={trip}
        itinerary={itinerary}
        onClose={() => setSelectedPlaceForModal(null)}
      />
    </div>
  );
};
