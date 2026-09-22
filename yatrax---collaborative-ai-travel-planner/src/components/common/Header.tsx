import React, { useState } from 'react';
import {
  Compass,
  Users,
  Bell,
  Sparkles,
  ChevronDown,
  LogOut,
  MapPin,
  Calendar,
  Layers,
  Activity,
  Check,
  Search,
  PlusCircle,
  Menu,
  X,
  MessageSquare
} from 'lucide-react';
import { appStore, DEMO_USERS } from '../../lib/database/store';
import { UserProfile, Trip } from '../../types';

interface HeaderProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  activeTripId?: string;
  onOpenAIDrawer?: () => void;
  onOpenExplore?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRoute,
  onNavigate,
  activeTripId,
  onOpenAIDrawer,
  onOpenExplore
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const currentUser = appStore.currentUser;
  const trips = appStore.trips || [];
  const events = appStore.events || [];

  // Determine if we are currently inside a trip workspace
  const isInsideTrip = currentRoute.startsWith('/trip/');
  const routeParts = currentRoute.split('/').filter(Boolean);
  const tripIdFromUrl = isInsideTrip ? routeParts[1] : activeTripId;
  const activeTrip = trips.find((t) => t.id === tripIdFromUrl) || trips[0];
  const activeTab = isInsideTrip ? routeParts[2] || 'overview' : '';

  const handleSwitchUser = (user: UserProfile) => {
    appStore.setCurrentUser(user);
    setShowUserMenu(false);
  };

  const handleResetDemo = () => {
    appStore.resetToDemo();
    setShowUserMenu(false);
    window.location.reload();
  };

  const handleOpenAI = () => {
    if (onOpenAIDrawer) {
      onOpenAIDrawer();
    } else if (activeTrip) {
      onNavigate(`/trip/${activeTrip.id}/ai`);
    }
  };

  const handleOpenExploreModal = () => {
    if (onOpenExplore) {
      onOpenExplore();
    } else {
      window.dispatchEvent(new CustomEvent('open-explore-modal'));
    }
  };

  // Recent notifications for live activity
  const recentNotifications = events.slice(0, 5);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-stone-200/80 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16 gap-3">
        {/* Left Section: Logo + Navigation Links */}
        <div className="flex items-center gap-4 lg:gap-6 min-w-0">
          {/* WayTogether Logo */}
          <button
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2.5 text-left group focus:outline-none shrink-0"
            id="brand-logo-btn"
          >
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-stone-950 shadow-sm group-hover:scale-105 transition-transform font-black">
              <Compass className="w-5 h-5 text-stone-950" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xl tracking-tight text-stone-900">
                Way<span className="text-amber-600">Together</span>
              </span>
            </div>
          </button>

          {/* Conditional Navigation: In-Trip vs Global */}
          {isInsideTrip && activeTrip ? (
            /* WHEN USER ENTERS A TRIP */
            <div className="hidden md:flex items-center gap-1 min-w-0">
              <span className="text-stone-300 mx-1">/</span>

              {/* Trip Name Pill */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-stone-100 border border-stone-200 text-stone-900 font-bold text-xs shrink-0 max-w-[160px] lg:max-w-[200px] truncate">
                <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                <span className="truncate">{activeTrip.name}</span>
              </div>

              {/* Trip Navigation Tabs */}
              <nav className="flex items-center gap-1 ml-2">
                <button
                  onClick={() => onNavigate(`/trip/${activeTrip.id}/overview`)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'overview'
                      ? 'bg-amber-500 text-stone-950 shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  Overview
                </button>

                <button
                  onClick={() => onNavigate(`/trip/${activeTrip.id}/itinerary`)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'itinerary'
                      ? 'bg-amber-500 text-stone-950 shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  Itinerary
                </button>

                <button
                  onClick={() => onNavigate(`/trip/${activeTrip.id}/map`)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'map'
                      ? 'bg-amber-500 text-stone-950 shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  Map
                </button>

                <button
                  onClick={() => onNavigate(`/trip/${activeTrip.id}/members`)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'members'
                      ? 'bg-amber-500 text-stone-950 shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  Members
                </button>

                <button
                  onClick={() => onNavigate(`/trip/${activeTrip.id}/chat`)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'chat'
                      ? 'bg-amber-500 text-stone-950 shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                  title="Google Chat Spaces"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Chat</span>
                </button>

                {/* ✨ AI Planner Button */}
                <button
                  onClick={handleOpenAI}
                  className="ml-1 px-3.5 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-stone-950 shadow-2xs flex items-center gap-1.5 transition-all"
                  title="Open AI Group Planner"
                >
                  <Sparkles className="w-3.5 h-3.5 text-stone-950" />
                  <span>✨ AI Planner</span>
                </button>
              </nav>
            </div>
          ) : (
            /* GLOBAL NAVIGATION (When not in a trip) */
            <nav className="hidden md:flex items-center gap-1 text-xs font-bold text-stone-600">
              <button
                onClick={() => onNavigate('/dashboard')}
                className={`px-3.5 py-2 rounded-xl transition-all ${
                  currentRoute === '/dashboard'
                    ? 'bg-stone-100 text-stone-900 font-extrabold'
                    : 'hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                My Trips
              </button>

              <button
                onClick={handleOpenExploreModal}
                className="px-3.5 py-2 rounded-xl hover:text-stone-900 hover:bg-stone-50 transition-all flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5 text-amber-600" />
                <span>Explore</span>
              </button>

              <button
                onClick={() => onNavigate(`/trip/${activeTrip?.id || 'trip-ahmedabad-sih'}/chat`)}
                className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  currentRoute.includes('/chat')
                    ? 'bg-stone-100 text-stone-900 font-extrabold'
                    : 'hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                <span>Google Chat</span>
              </button>

              <button
                onClick={handleOpenAI}
                className="px-3.5 py-2 rounded-xl text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>AI Planner</span>
              </button>
            </nav>
          )}
        </div>

        {/* Right Section: Notifications, Members, Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200/80 transition-colors"
              title="Recent Activity Notifications"
              id="notifications-btn"
            >
              <Bell className="w-4 h-4" />
              {recentNotifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
              )}
            </button>

            {/* Notifications Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-stone-200 py-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 pb-2 border-b border-stone-100 flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-stone-800 tracking-wider">
                    Live Collaborative Activity
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                    Realtime Sync
                  </span>
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-stone-100">
                  {recentNotifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-stone-400">
                      No recent actions yet
                    </div>
                  ) : (
                    recentNotifications.map((ev) => (
                      <div key={ev.id} className="p-3 hover:bg-stone-50 transition-colors">
                        <div className="flex items-center justify-between text-[10px] text-stone-400">
                          <span className="font-bold text-stone-700">{ev.user_name}</span>
                          <span>{new Date(ev.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-xs text-stone-800 font-medium mt-0.5">
                          {ev.metadata?.description || ev.event_type}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-2 px-3 border-t border-stone-100 text-center">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      if (activeTrip) onNavigate(`/trip/${activeTrip.id}/activity`);
                    }}
                    className="text-[11px] font-bold text-amber-700 hover:text-amber-800"
                  >
                    View Full Activity Feed →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Members Button */}
          <button
            onClick={() => {
              if (activeTrip) onNavigate(`/trip/${activeTrip.id}/members`);
            }}
            className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-stone-200/80 hover:bg-stone-50 transition-colors"
            title="View Group Members"
            id="members-btn"
          >
            <div className="flex -space-x-1.5 overflow-hidden">
              {DEMO_USERS.slice(0, 3).map((u) => (
                <img
                  key={u.id}
                  src={u.avatar_url}
                  alt={u.full_name}
                  className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                />
              ))}
            </div>
            <span className="hidden sm:inline text-xs font-bold text-stone-800">
              4 Members
            </span>
          </button>

          {/* Profile & Demo Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-xl border border-stone-200/80 hover:bg-stone-50 transition-colors"
              id="user-profile-menu-btn"
            >
              <img
                src={currentUser.avatar_url}
                alt={currentUser.full_name}
                className="w-7 h-7 rounded-lg object-cover"
              />
              <span className="hidden md:inline text-xs font-bold text-stone-800 truncate max-w-[100px]">
                {currentUser.full_name.split(' ')[0]}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
            </button>

            {/* Profile Menu Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2 border-b border-stone-100">
                  <div className="text-[10px] font-black text-stone-400 uppercase tracking-wider">
                    Simulate Group Member
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Switch perspective to test individual scoring:
                  </p>
                </div>

                <div className="p-2 space-y-1">
                  {DEMO_USERS.map((user) => {
                    const isSelected = user.id === currentUser.id;
                    return (
                      <button
                        key={user.id}
                        onClick={() => handleSwitchUser(user)}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors ${
                          isSelected
                            ? 'bg-amber-50 text-amber-950 font-bold border border-amber-200'
                            : 'hover:bg-stone-50 text-stone-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={user.avatar_url}
                            alt={user.full_name}
                            className="w-7 h-7 rounded-lg object-cover"
                          />
                          <div>
                            <div className="font-bold">{user.full_name}</div>
                            <div className="text-[10px] text-stone-400">{user.email}</div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-amber-600" />}
                      </button>
                    );
                  })}
                </div>

                <div className="border-t border-stone-100 p-2 space-y-1">
                  <button
                    onClick={handleResetDemo}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
                  >
                    Reset Demo State
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onNavigate('/login');
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 rounded-xl text-stone-600 hover:bg-stone-100"
          >
            {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Top Menu Dropdown */}
      {showMobileMenu && (
        <div className="md:hidden border-t border-stone-200 py-3 px-2 space-y-1 animate-in fade-in">
          {isInsideTrip && activeTrip ? (
            <>
              <div className="px-3 py-1 text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                {activeTrip.name}
              </div>
              <button
                onClick={() => {
                  onNavigate(`/trip/${activeTrip.id}/overview`);
                  setShowMobileMenu(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-stone-800 hover:bg-stone-100"
              >
                Overview
              </button>
              <button
                onClick={() => {
                  onNavigate(`/trip/${activeTrip.id}/itinerary`);
                  setShowMobileMenu(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-stone-800 hover:bg-stone-100"
              >
                Itinerary
              </button>
              <button
                onClick={() => {
                  onNavigate(`/trip/${activeTrip.id}/map`);
                  setShowMobileMenu(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-stone-800 hover:bg-stone-100"
              >
                Map
              </button>
              <button
                onClick={() => {
                  onNavigate(`/trip/${activeTrip.id}/members`);
                  setShowMobileMenu(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-stone-800 hover:bg-stone-100"
              >
                Members
              </button>
              <button
                onClick={() => {
                  handleOpenAI();
                  setShowMobileMenu(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-black bg-amber-500 text-stone-950"
              >
                ✨ AI Planner
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  onNavigate('/dashboard');
                  setShowMobileMenu(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-stone-800 hover:bg-stone-100"
              >
                My Trips
              </button>
              <button
                onClick={() => {
                  handleOpenExploreModal();
                  setShowMobileMenu(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-stone-800 hover:bg-stone-100"
              >
                Explore Sights
              </button>
              <button
                onClick={() => {
                  handleOpenAI();
                  setShowMobileMenu(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-black bg-amber-500 text-stone-950"
              >
                ✨ AI Planner
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};
