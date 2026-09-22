import React, { useState } from 'react';
import {
  Compass,
  Plus,
  Users,
  Calendar,
  IndianRupee,
  ArrowRight,
  Activity,
  Share2,
  Sparkles,
  MapPin,
  Check
} from 'lucide-react';
import { Trip, TripEvent } from '../types';
import { appStore } from '../lib/database/store';

interface DashboardPageProps {
  onNavigate: (route: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [joinError, setJoinError] = useState('');

  const currentUser = appStore.currentUser;
  const trips = appStore.trips;
  const events = appStore.events;

  const handleJoinJourney = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCodeInput.trim()) return;

    const joinedTrip = appStore.joinTripByCode(inviteCodeInput);
    if (joinedTrip) {
      onNavigate(`/trip/${joinedTrip.id}/overview`);
    } else {
      setJoinError('Invalid invite code. Try YTX-8K4P');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" id="dashboard-container">
      {/* Greeting Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-2xs">
        <div>
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block mb-1">
            Traveler Workspace
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Plan your next journey, {currentUser.full_name.split(' ')[0]}.
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Collaborative travel itineraries powered by living multi-member AI consensus.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate('/trip/new')}
            className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl flex items-center gap-2 shadow-sm text-xs transition-colors"
            id="dashboard-create-trip-btn"
          >
            <Plus className="w-4 h-4" />
            <span>Create Journey</span>
          </button>

          {/* Join trip popover/inline form */}
          <form onSubmit={handleJoinJourney} className="flex items-center gap-1.5">
            <input
              type="text"
              value={inviteCodeInput}
              onChange={(e) => {
                setInviteCodeInput(e.target.value.toUpperCase());
                setJoinError('');
              }}
              placeholder="Code (e.g. YTX-8K4P)"
              className="w-36 px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono uppercase focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
            <button
              type="submit"
              className="px-3 py-2.5 bg-stone-900 text-white hover:bg-stone-800 text-xs font-bold rounded-xl transition-colors"
            >
              Join
            </button>
          </form>
        </div>
      </div>

      {joinError && (
        <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
          {joinError}
        </div>
      )}

      {/* Active Journeys Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-600" />
            Active Journeys ({trips.length})
          </h2>
          <span className="text-xs text-stone-500 font-medium">Realtime Synchronized</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => {
            const tripMembers = appStore.members.filter((m) => m.trip_id === trip.id);
            const tripItinerary = appStore.itinerary.filter((i) => i.trip_id === trip.id);

            return (
              <div
                key={trip.id}
                className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xs hover:shadow-md hover:border-amber-400 transition-all flex flex-col justify-between"
              >
                {/* Trip Cover Image */}
                <div className="relative h-44 w-full bg-stone-100 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=800&q=80"
                    alt={trip.destination}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                    {trip.destination}
                  </div>
                  <div className="absolute top-3 right-3 bg-amber-500 text-stone-950 text-[11px] font-mono font-extrabold px-2 py-0.5 rounded-md shadow-xs">
                    {trip.invite_code}
                  </div>
                </div>

                {/* Trip Details */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-stone-900 leading-snug">{trip.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      <span>{trip.start_date} → {trip.end_date}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-2 border-y border-stone-100 text-xs">
                    <div>
                      <span className="text-[10px] text-stone-400 block font-medium">Budget</span>
                      <span className="font-bold text-stone-800">₹{trip.budget.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 block font-medium">Travelers</span>
                      <span className="font-bold text-stone-800">{tripMembers.length} Members</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 block font-medium">Stops</span>
                      <span className="font-bold text-amber-700">{tripItinerary.length} Places</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate(`/trip/${trip.id}/overview`)}
                    className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl flex items-center justify-center gap-2 text-xs transition-colors shadow-2xs"
                  >
                    <span>Open Journey</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Stream */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-600" />
            Recent Multi-Traveler Activity
          </h2>
          <span className="text-xs text-stone-400 font-mono">Live Timeline</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {events.slice(0, 4).map((ev) => (
            <div key={ev.id} className="p-3 bg-stone-50 rounded-2xl border border-stone-100 flex items-start gap-3 text-xs">
              <img
                src={ev.user_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                alt="Avatar"
                className="w-7 h-7 rounded-lg object-cover shrink-0 mt-0.5"
              />
              <div className="space-y-0.5">
                <div className="font-bold text-stone-900">{ev.metadata.description}</div>
                <div className="text-[10px] text-stone-400">
                  {new Date(ev.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
