import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  IndianRupee,
  MapPin,
  Trash2,
  RefreshCw,
  AlertTriangle,
  ChevronRight,
  ArrowDown,
  Sparkles,
  Info,
  Plus
} from 'lucide-react';
import { ItineraryItem, Place, Trip, TripMember } from '../../types';
import { calculateItineraryBudget, validateItinerarySchedule } from '../../lib/itinerary/itineraryEngine';
import { appStore } from '../../lib/database/store';

interface ItineraryViewProps {
  trip: Trip;
  members: TripMember[];
  itinerary: ItineraryItem[];
  allPlaces: Place[];
  onOpenPlaceDetails?: (place: Place) => void;
  onSelectDay?: (day: number) => void;
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({
  trip,
  members = [],
  itinerary = [],
  allPlaces = [],
  onOpenPlaceDetails,
  onSelectDay
}) => {
  const [activeDay, setActiveDay] = useState<number>(1);
  const [replacingItemId, setReplacingItemId] = useState<string | null>(null);

  const safeItinerary = itinerary || [];
  const safeMembers = members || [];
  const safePlaces = allPlaces || [];

  // Group items by day
  const days: number[] = Array.from(new Set<number>(safeItinerary.map((i) => i.day_number))).sort((a, b) => a - b);
  const currentDayItems = safeItinerary
    .filter((i) => i.day_number === activeDay)
    .sort((a, b) => a.order_index - b.order_index);

  const budgetData = calculateItineraryBudget(safeItinerary, trip?.budget ?? 5000, safeMembers.length || 4);
  const timeConflicts = validateItinerarySchedule(safeItinerary);

  const handleTabChange = (day: number) => {
    setActiveDay(day);
    if (onSelectDay) onSelectDay(day);
  };

  const handleRemoveItem = (itemId: string) => {
    appStore.removeItineraryItem(trip.id, itemId);
  };

  const handleConfirmReplacement = (itemId: string, newPlaceId: string) => {
    appStore.replaceItineraryItem(trip.id, itemId, newPlaceId);
    setReplacingItemId(null);
  };

  // Daily budget cost
  const dayActivityCost = currentDayItems.reduce((acc, curr) => {
    return acc + (curr.place?.estimated_cost ?? 0) * (safeMembers.length || 4);
  }, 0);

  // Find candidate replacements not yet in itinerary
  const usedPlaceIds = new Set(safeItinerary.map((i) => i.place?.id).filter(Boolean));
  const candidatePlaces = safePlaces.filter((p) => !usedPlaceIds.has(p.id));

  return (
    <div className="space-y-6" id="itinerary-view-container">
      {/* Time Conflict Alert Banner if any exists */}
      {timeConflicts && timeConflicts.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-3 shadow-2xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <div className="font-bold uppercase tracking-wider text-amber-950">
              Schedule Conflict Detected
            </div>
            {timeConflicts.map((c, idx) => (
              <div key={idx} className="text-amber-800">
                • Day {c.dayNumber}: {c.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Day Tabs & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {days.length === 0 ? (
            <span className="text-xs text-stone-500 italic p-2">No itinerary days yet. Click "Plan Our Trip" in WayTogether AI!</span>
          ) : (
            days.map((d) => (
              <button
                key={d}
                onClick={() => handleTabChange(d)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                  activeDay === d
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Day {d}</span>
                <span className="text-[10px] bg-black/10 px-1.5 py-0.5 rounded-full font-mono">
                  {itinerary.filter((i) => i.day_number === d).length}
                </span>
              </button>
            ))
          )}
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-stone-600 px-2">
          <span>Day {activeDay} Activity: <strong>₹{dayActivityCost.toLocaleString()}</strong></span>
          <span className="text-stone-300">|</span>
          <span>Trip Total: <strong className="text-amber-700">₹{budgetData.totalPlannedCost.toLocaleString()}</strong></span>
        </div>
      </div>

      {/* Daily Stops Timeline */}
      <div className="space-y-4">
        {currentDayItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 p-8 space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-stone-800">No stops scheduled for Day {activeDay}</h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Use the WayTogether AI Planner or choose from the Ahmedabad place catalog to insert attractions.
            </p>
          </div>
        ) : (
          currentDayItems.map((item, index) => {
            const place = item.place || allPlaces.find((p) => p.id === item.place_id);
            if (!place) return null;

            const isReplacing = replacingItemId === item.id;

            return (
              <div key={item.id} className="space-y-3">
                {/* Transit indicator between sequential stops */}
                {index > 0 && (
                  <div className="flex items-center gap-2 pl-6 py-1 text-[11px] text-stone-500 font-medium">
                    <ArrowDown className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
                    <span className="bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200">
                      ~{item.travel_duration || 15} mins travel ({trip.transport})
                    </span>
                  </div>
                )}

                {/* Itinerary Item Card */}
                <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs hover:border-amber-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  {/* Left: Time badge + Place Image + Details */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="shrink-0 flex flex-col items-center justify-center w-16 p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-center">
                      <span className="text-[10px] uppercase font-bold text-amber-700">Stop #{index + 1}</span>
                      <span className="text-xs font-extrabold mt-0.5 font-mono">{item.start_time}</span>
                      <span className="text-[9px] text-stone-500">to {item.end_time}</span>
                    </div>

                    <img
                      src={place.image_url}
                      alt={place.name}
                      className="w-20 h-20 rounded-xl object-cover border border-stone-200 shrink-0"
                    />

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-stone-900 text-base">{place.name}</h4>
                        <span className="text-[10px] font-semibold px-2 py-0.5 bg-stone-100 text-stone-700 rounded-md">
                          {place.category}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 line-clamp-2">{place.description}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600 pt-1">
                        <span className="flex items-center gap-1 font-semibold text-stone-800">
                          <IndianRupee className="w-3 h-3 text-amber-600" />
                          {place.estimated_cost === 0 ? 'Free Entry' : `₹${place.estimated_cost}/person`}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-stone-400" />
                          {place.visit_duration} mins visit
                        </span>
                        <span>·</span>
                        <span>★ {place.rating}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      onClick={() => setReplacingItemId(isReplacing ? null : item.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1 transition-colors ${
                        isReplacing
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>{isReplacing ? 'Cancel' : 'Replace'}</span>
                    </button>

                    <button
                      onClick={() => onOpenPlaceDetails?.(place)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors"
                    >
                      Details
                    </button>

                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Remove place"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Smart Alternative Picker Drawer if replacing */}
                {isReplacing && (
                  <div className="p-4 bg-stone-50 rounded-2xl border border-amber-300 shadow-sm space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        Select Smart Alternative for {place.name}:
                      </div>
                      <span className="text-[11px] text-stone-500">Group AI Optimized</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {candidatePlaces.slice(0, 3).map((alt) => (
                        <div
                          key={alt.id}
                          className="bg-white p-2.5 rounded-xl border border-stone-200 hover:border-amber-400 flex flex-col justify-between gap-2"
                        >
                          <div>
                            <div className="font-bold text-xs text-stone-900">{alt.name}</div>
                            <div className="text-[10px] text-stone-500">{alt.category} · ₹{alt.estimated_cost}</div>
                          </div>
                          <button
                            onClick={() => handleConfirmReplacement(item.id, alt.id)}
                            className="w-full py-1 text-[11px] font-bold bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-lg transition-colors"
                          >
                            Replace with This
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Visual Budget Breakdown Card */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
        <h3 className="font-bold text-sm text-stone-900 flex items-center gap-1.5">
          <IndianRupee className="w-4 h-4 text-amber-600" />
          Real-Time Budget Breakdown ({safeMembers.length || 4} Travelers)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono">
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
            <span className="text-stone-400 font-sans block text-[10px]">Activities</span>
            <span className="font-bold text-stone-900">₹{budgetData.plannedActivitiesCost.toLocaleString()}</span>
          </div>
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
            <span className="text-stone-400 font-sans block text-[10px]">Transport</span>
            <span className="font-bold text-stone-900">₹{budgetData.estimatedTransportCost.toLocaleString()}</span>
          </div>
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
            <span className="text-stone-400 font-sans block text-[10px]">Food & Dining</span>
            <span className="font-bold text-stone-900">₹{budgetData.estimatedFoodCost.toLocaleString()}</span>
          </div>
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
            <span className="text-stone-400 font-sans block text-[10px]">Buffer Reserve</span>
            <span className="font-bold text-stone-900">₹{budgetData.bufferCost.toLocaleString()}</span>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 col-span-2 sm:col-span-1">
            <span className="text-amber-800 font-sans block text-[10px]">Total Planned</span>
            <span className="font-bold text-amber-950">₹{budgetData.totalPlannedCost.toLocaleString()}</span>
            <span className="text-[10px] text-emerald-700 block font-sans mt-0.5">
              ₹{budgetData.remainingBudget.toLocaleString()} left
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
