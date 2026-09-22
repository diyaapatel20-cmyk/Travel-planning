import React, { useState, useEffect } from 'react';
import { appStore, DEMO_TRIP_ID } from './lib/database/store';
import { Header } from './components/common/Header';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { ExploreModal } from './components/explore/ExploreModal';
import { PlaceDetailModal } from './components/places/PlaceDetailModal';
import { LandingPage } from './pages/LandingPage';
import { AuthPages } from './pages/AuthPages';
import { DashboardPage } from './pages/DashboardPage';
import { CreateTripPage } from './pages/CreateTripPage';
import { TripWorkspacePage } from './pages/TripWorkspacePage';
import { Place } from './types';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return window.location.hash.replace('#', '') || '/';
  });

  const [isGlobalExploreOpen, setIsGlobalExploreOpen] = useState(false);
  const [selectedPlaceModal, setSelectedPlaceModal] = useState<Place | null>(null);
  const [mapsQuotaExceeded, setMapsQuotaExceeded] = useState(false);

  // Re-render when store updates (from this tab or BroadcastChannel)
  const [, setTick] = useState(0);

  useEffect(() => {
    const handleQuota = () => setMapsQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  useEffect(() => {
    const unsubscribe = appStore.subscribe(() => {
      setTick((t) => t + 1);
    });

    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || '/';
      setCurrentRoute(hash);
    };

    const handleOpenExploreGlobal = () => setIsGlobalExploreOpen(true);

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('open-explore-modal', handleOpenExploreGlobal);

    return () => {
      unsubscribe();
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('open-explore-modal', handleOpenExploreGlobal);
    };
  }, []);

  const navigate = (path: string) => {
    window.location.hash = path;
    setCurrentRoute(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAIDrawer = () => {
    if (currentRoute.startsWith('/trip/')) {
      window.dispatchEvent(new CustomEvent('open-ai-drawer', { detail: { query: '' } }));
    } else {
      // Navigate to default trip overview and open AI
      navigate(`/trip/${DEMO_TRIP_ID}/overview`);
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('open-ai-drawer', { detail: { query: '' } }));
      }, 100);
    }
  };

  // Route matching
  const renderView = () => {
    if (currentRoute === '/' || currentRoute === '') {
      return <LandingPage onNavigate={navigate} />;
    }

    if (currentRoute === '/login') {
      return <AuthPages mode="login" onNavigate={navigate} />;
    }

    if (currentRoute === '/register') {
      return <AuthPages mode="register" onNavigate={navigate} />;
    }

    if (currentRoute === '/dashboard') {
      return <DashboardPage onNavigate={navigate} />;
    }

    if (currentRoute === '/trip/new') {
      return <CreateTripPage onNavigate={navigate} />;
    }

    if (currentRoute.startsWith('/trip/')) {
      const parts = currentRoute.split('/').filter(Boolean);
      // Format: ['trip', id, tab?]
      const tripId = parts[1] || DEMO_TRIP_ID;
      const tab = parts[2] || 'overview';
      return (
        <TripWorkspacePage
          tripId={tripId}
          initialTab={tab}
          onNavigate={navigate}
        />
      );
    }

    // Default fallback
    return <LandingPage onNavigate={navigate} />;
  };

  const activeTrip = appStore.trips.find((t) => currentRoute.includes(t.id)) || appStore.trips[0];
  const activeItinerary = appStore.itinerary.filter((i) => i.trip_id === activeTrip?.id);
  const activePreferences = appStore.preferences.filter((p) => p.trip_id === activeTrip?.id);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 font-sans text-stone-900 antialiased selection:bg-amber-200">
      {mapsQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      <Header
        activeTripId={activeTrip?.id || DEMO_TRIP_ID}
        currentRoute={currentRoute}
        onNavigate={navigate}
        onOpenAIDrawer={handleOpenAIDrawer}
        onOpenExplore={() => setIsGlobalExploreOpen(true)}
      />

      <main className="flex-1">
        {renderView()}
      </main>

      {/* Global Explore Modal */}
      <ExploreModal
        isOpen={isGlobalExploreOpen}
        onClose={() => setIsGlobalExploreOpen(false)}
        trip={activeTrip}
        itinerary={activeItinerary}
        preferences={activePreferences}
        onOpenPlaceDetails={(place) => setSelectedPlaceModal(place)}
      />

      {/* Place Detail Modal */}
      <PlaceDetailModal
        place={selectedPlaceModal}
        trip={activeTrip}
        itinerary={activeItinerary}
        onClose={() => setSelectedPlaceModal(null)}
      />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        currentRoute={currentRoute}
        onNavigate={navigate}
        trip={activeTrip}
        onOpenAIDrawer={handleOpenAIDrawer}
        onOpenExplore={() => setIsGlobalExploreOpen(true)}
      />
    </div>
  );
}
