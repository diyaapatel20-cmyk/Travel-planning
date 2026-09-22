import React, { useState } from 'react';
import {
  Calendar,
  IndianRupee,
  Clock,
  Users,
  MapPin,
  Sparkles,
  TrendingUp,
  Share2,
  Copy,
  Check,
  Send,
  Navigation,
  Layers,
  ChevronRight,
  ShieldCheck,
  Plus,
  MessageSquare
} from 'lucide-react';
import {
  Trip,
  TripMember,
  MemberPreference,
  ItineraryItem,
  Place
} from '../../types';
import { calculateItineraryBudget } from '../../lib/itinerary/itineraryEngine';
import { optimizeRouteOrder } from '../../lib/routing/dijkstra';
import { analyzeGroupPreferences } from '../../lib/scoring/groupScoring';
import { InteractiveMap } from '../map/InteractiveMap';
import { VisualItineraryTimeline } from '../itinerary/VisualItineraryTimeline';

interface TripOverviewProps {
  trip: Trip;
  members: TripMember[];
  preferences: MemberPreference[];
  itinerary: ItineraryItem[];
  allPlaces: Place[];
  onOpenAIDrawer: (initialQuery?: string) => void;
  onOpenPlaceDetails: (place: Place) => void;
  onOpenExplore: () => void;
  onNavigateTab: (tab: 'overview' | 'itinerary' | 'map' | 'members' | 'chat') => void;
}

export const TripOverview: React.FC<TripOverviewProps> = ({
  trip,
  members = [],
  preferences = [],
  itinerary = [],
  allPlaces = [],
  onOpenAIDrawer,
  onOpenPlaceDetails,
  onOpenExplore,
  onNavigateTab
}) => {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [aiInputText, setAiInputText] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  const safeMembers = members || [];
  const safeItinerary = itinerary || [];
  const safePlaces = allPlaces || [];

  const budgetData = calculateItineraryBudget(safeItinerary, trip?.budget ?? 5000, safeMembers.length || 4);
  const places = safeItinerary.map((i) => i.place).filter(Boolean) as Place[];
  const routeSummary = optimizeRouteOrder(places);
  const groupAnalysis = analyzeGroupPreferences(safeMembers, preferences || []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(trip.invite_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleAiInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInputText.trim()) return;
    onOpenAIDrawer(aiInputText);
    setAiInputText('');
  };

  const quickActions = [
    { label: '✨ Plan My Trip', query: 'Plan our Ahmedabad trip under ₹5000 and make sure everyone gets something they like' },
    { label: '📍 Suggest Places', query: 'Suggest top places for our group based on member preferences' },
    { label: '💰 Optimize Budget', query: 'Optimize our trip budget to stay under ₹4000 without losing quality' },
    { label: '⚡ Optimize Route', query: 'Optimize the route with Dijkstra to minimize travel time between stops' },
    { label: '🔄 Replace a Place', query: 'Replace Kankaria Lake with a historical destination' },
    { label: '⏱️ Fix Schedule', query: 'Check schedule for time overlaps and adjust the timings for lunch breaks' }
  ];

  // Estimated budget breakdown
  const activityBudget = safeItinerary.reduce(
    (sum, i) => sum + (i.place?.estimated_cost ?? 0) * (safeMembers.length || 4),
    0
  );
  const transportBudget = Math.round(routeSummary.totalDistanceKm * 15 * 2.2);
  const foodBudget = Math.round(safeMembers.length * 400 * (safeItinerary.length > 3 ? 3 : 2));
  const otherBudget = Math.max(0, budgetData.totalPlannedCost - (activityBudget + transportBudget + foodBudget));

  return (
    <div className="space-y-8" id="trip-main-overview">
      {/* Beautiful Trip Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white p-6 sm:p-8 shadow-md border border-stone-800">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/30">
                <MapPin className="w-3 h-3 text-amber-400" />
                {trip.destination || 'Ahmedabad'}
              </span>
              <span className="text-[11px] font-semibold text-stone-300 bg-white/10 px-2.5 py-1 rounded-full">
                12 Oct – 14 Oct
              </span>
              <span className="text-[11px] font-semibold text-stone-300 bg-white/10 px-2.5 py-1 rounded-full">
                {safeMembers.length} Members
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              {trip.name || 'Ahmedabad Escape'}
            </h1>

            <p className="text-xs sm:text-sm text-stone-300/90 leading-relaxed font-normal">
              Multi-member collaborative journey in Ahmedabad. Real-time consensus routing, shared budget tracking, and living itinerary updates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-stone-800/80 backdrop-blur-xs px-3.5 py-2 rounded-2xl border border-stone-700">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Code:</span>
              <span className="text-xs font-mono font-bold text-amber-400">{trip.invite_code}</span>
              <button
                onClick={handleCopyCode}
                className="p-1 rounded-lg hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
                title="Copy Invite Code"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <button
              onClick={() => onNavigateTab('chat')}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors border border-white/10 flex items-center gap-1.5"
              title="Open Google Chat Room"
            >
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span>Google Chat</span>
            </button>

            <button
              onClick={onOpenExplore}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors border border-white/10 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Explore Sights</span>
            </button>

            <button
              onClick={() => onOpenAIDrawer('Plan our Ahmedabad trip under ₹5000')}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-stone-950 font-black text-xs transition-all shadow-sm flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-stone-950" />
              <span>✨ AI Planner</span>
            </button>
          </div>
        </div>
      </div>

      {/* Three Compact Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. Group Match Card */}
        <div className="bg-white rounded-3xl border border-stone-200/90 p-5 shadow-2xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                Group Match
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                High Consensus
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
              {groupAnalysis.group_satisfaction_score || 91}% Group Match
            </div>
            <p className="text-xs text-stone-500 mt-1">
              High agreement on History (88%), Culture (84%), and Photography (76%).
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
            <div className="flex -space-x-1.5 overflow-hidden">
              {safeMembers.map((m) => (
                <img
                  key={m.id}
                  src={m.profile.avatar_url}
                  alt={m.profile.full_name}
                  className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                  title={m.profile.full_name}
                />
              ))}
            </div>
            <button
              onClick={() => onNavigateTab('members')}
              className="text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
            >
              <span>View Preferences</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* 2. Budget Card */}
        <div className="bg-white rounded-3xl border border-stone-200/90 p-5 shadow-2xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                Budget
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                ₹{budgetData.remainingBudget.toLocaleString()} remaining
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
              ₹{budgetData.totalPlannedCost.toLocaleString()} / ₹{trip.budget.toLocaleString()}
            </div>
            <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden mt-2.5">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((budgetData.totalPlannedCost / trip.budget) * 100))}%` }}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-500 flex items-center justify-between flex-wrap gap-1 font-medium">
            <span>Activities: <strong className="text-stone-700">₹{activityBudget.toLocaleString()}</strong></span>
            <span>·</span>
            <span>Transit: <strong className="text-stone-700">₹{transportBudget.toLocaleString()}</strong></span>
            <span>·</span>
            <span>Food: <strong className="text-stone-700">₹{foodBudget.toLocaleString()}</strong></span>
          </div>
        </div>

        {/* 3. Trip Stats Card */}
        <div className="bg-white rounded-3xl border border-stone-200/90 p-5 shadow-2xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                Trip Stats
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Dijkstra Optimized
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
              {safeItinerary.length} Places · {routeSummary.totalDistanceKm} km · {routeSummary.formattedTravelTime}
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Optimal {trip.transport || 'Auto/Taxi'} transit sequence minimizing backtrack loops across Ahmedabad.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
            <span className="text-[11px] text-stone-500 font-medium">
              Daily start: 09:00 AM · 3 Days
            </span>
            <button
              onClick={() => onOpenAIDrawer('Optimize the route with Dijkstra to minimize travel time')}
              className="text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
            >
              <span>Re-optimize</span>
              <Sparkles className="w-3 h-3 text-amber-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Interactive route/map */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-amber-600" />
              <h3 className="font-black text-stone-900 text-base">
                Interactive Route & Destination Map
              </h3>
            </div>
            <span className="text-xs text-stone-500 font-medium hidden sm:inline">
              Day {selectedDay} Corridor Active
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200/90 overflow-hidden shadow-2xs">
            <div className="h-[480px] w-full">
              <InteractiveMap
                itinerary={safeItinerary}
                allPlaces={safePlaces}
                activeDay={selectedDay}
                onSelectPlace={onOpenPlaceDetails}
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Visual itinerary timeline */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <h3 className="font-black text-stone-900 text-base">
                Visual Itinerary Timeline
              </h3>
            </div>
            <button
              onClick={onOpenExplore}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Stop</span>
            </button>
          </div>

          <VisualItineraryTimeline
            trip={trip}
            members={safeMembers}
            itinerary={safeItinerary}
            allPlaces={safePlaces}
            activeDay={selectedDay}
            onSelectDay={(day) => setSelectedDay(day)}
            onOpenPlaceDetails={onOpenPlaceDetails}
            onOpenExplore={onOpenExplore}
          />
        </div>
      </div>

      {/* GROUP AI SECTION AT BOTTOM */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950 text-white rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-lg space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800/80 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-stone-950 font-black shadow-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white tracking-tight">Group AI</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">
                  Consensus Engine
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Harmonizing individual traveler goals into a single cohesive journey.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-stone-800/80 px-4 py-2 rounded-2xl border border-stone-700/80">
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Group Match</span>
              <span className="text-lg font-black font-mono text-amber-400">
                {groupAnalysis.group_satisfaction_score || 91}%
              </span>
            </div>
            <div className="h-8 w-px bg-stone-700" />
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Status</span>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Balanced
              </span>
            </div>
          </div>
        </div>

        {/* 4 Members & Current Constraints Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {safeMembers.map((member) => {
            const memberPref = preferences.find((p) => p.user_id === member.user_id) || {
              interests: ['History', 'Culture'],
              budget_preference: 'Moderate',
              transport: 'Taxi',
              restrictions: []
            };

            return (
              <div
                key={member.id}
                className="bg-stone-800/60 rounded-2xl p-4 border border-stone-700/60 space-y-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={member.profile.avatar_url}
                    alt={member.profile.full_name}
                    className="w-8 h-8 rounded-xl object-cover ring-1 ring-amber-400/40"
                  />
                  <div className="min-w-0">
                    <h5 className="font-bold text-xs text-white truncate">
                      {member.profile.full_name}
                    </h5>
                    <span className="text-[10px] text-amber-400/90 font-medium">
                      {memberPref.budget_preference}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {(memberPref.interests || []).slice(0, 3).map((int, i) => (
                    <span
                      key={i}
                      className="text-[9px] font-semibold bg-stone-700/80 text-stone-300 px-1.5 py-0.5 rounded"
                    >
                      {int}
                    </span>
                  ))}
                </div>

                <div className="text-[10px] text-stone-400 pt-1 border-t border-stone-700/40">
                  Max travel: {memberPref.max_travel_time || 60}m · {memberPref.transport || 'Taxi'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Top Interests & Constraints Summary */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-stone-800/40 border border-stone-800 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-stone-400 font-bold uppercase text-[10px]">Top Interests:</span>
            <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-lg border border-amber-500/30 font-semibold">
              History (88%)
            </span>
            <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-lg border border-amber-500/30 font-semibold">
              Culture (84%)
            </span>
            <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-lg border border-amber-500/30 font-semibold">
              Photography (76%)
            </span>
            <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-lg border border-amber-500/30 font-semibold">
              Food (82%)
            </span>
          </div>

          <div className="flex items-center gap-2 text-stone-400 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Active constraints: Max 60m travel · Vegetarian options prioritized · ₹5,000 budget cap</span>
          </div>
        </div>

        {/* AI Input Form */}
        <form onSubmit={handleAiInputSubmit} className="relative flex items-center">
          <input
            type="text"
            placeholder="Ask WayTogether AI to change your journey... (e.g., 'Replace Kankaria Lake with a historical destination')"
            value={aiInputText}
            onChange={(e) => setAiInputText(e.target.value)}
            className="w-full pl-5 pr-28 py-3.5 text-xs sm:text-sm rounded-2xl bg-stone-800/90 border border-stone-700 text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={!aiInputText.trim()}
            className="absolute right-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-40 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
          >
            <span>Ask AI</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Quick Action Buttons */}
        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
            Quick Actions
          </span>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => onOpenAIDrawer(action.query)}
                className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white border border-stone-700 hover:border-amber-400 transition-all shadow-2xs"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
