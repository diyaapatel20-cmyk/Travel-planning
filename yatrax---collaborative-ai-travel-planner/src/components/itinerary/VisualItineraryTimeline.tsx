import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  IndianRupee,
  MapPin,
  Trash2,
  RefreshCw,
  AlertTriangle,
  ArrowDown,
  Plus,
  Star,
  Info,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { ItineraryItem, Place, Trip, TripMember } from '../../types';
import { calculateItineraryBudget, validateItinerarySchedule } from '../../lib/itinerary/itineraryEngine';
import { appStore } from '../../lib/database/store';

interface VisualItineraryTimelineProps {
  trip: Trip;
  members?: TripMember[];
  itinerary?: ItineraryItem[];
  allPlaces?: Place[];
  activeDay?: number;
  onSelectDay?: (day: number) => void;
  onOpenPlaceDetails?: (place: Place) => void;
  onOpenExplore?: () => void;
}

export const VisualItineraryTimeline: React.FC<VisualItineraryTimelineProps> = ({
  trip,
  members = [],
  itinerary = [],
  allPlaces = [],
  activeDay: controlledActiveDay,
  onSelectDay,
  onOpenPlaceDetails,
  onOpenExplore
}) => {
  const [internalActiveDay, setInternalActiveDay] = useState<number>(1);
  const [replacingItemId, setReplacingItemId] = useState<string | null>(null);

  const activeDay = controlledActiveDay !== undefined ? controlledActiveDay : internalActiveDay;

  const safeItinerary = itinerary || [];
  const safeMembers = members || [];
  const safePlaces = allPlaces || [];

  // Get unique day numbers
  const days: number[] = Array.from(new Set<number>(safeItinerary.map((i) => i.day_number))).sort((a, b) => a - b);
  if (days.length === 0) days.push(1, 2, 3);

  const currentDayItems = safeItinerary
    .filter((i) => i.day_number === activeDay)
    .sort((a, b) => a.order_index - b.order_index);

  const timeConflicts = validateItinerarySchedule(safeItinerary);

  const handleTabChange = (day: number) => {
    setInternalActiveDay(day);
    if (onSelectDay) onSelectDay(day);
  };

  const handleRemoveItem = (itemId: string) => {
    appStore.removeItineraryItem(trip.id, itemId);
  };

  const handleConfirmReplacement = (itemId: string, newPlaceId: string) => {
    appStore.replaceItineraryItem(trip.id, itemId, newPlaceId);
    setReplacingItemId(null);
  };

  // Find candidate replacements not yet in itinerary
  const usedPlaceIds = new Set(safeItinerary.map((i) => i.place?.id || i.place_id).filter(Boolean));
  const candidatePlaces = safePlaces.filter((p) => !usedPlaceIds.has(p.id));

  // Day stats
  const dayCost = currentDayItems.reduce(
    (sum, item) => sum + (item.place?.estimated_cost ?? item.estimated_cost ?? 0) * (safeMembers.length || 4),
    0
  );

  return (
    <div className="space-y-4" id="visual-itinerary-timeline">
      {/* Time Conflict Alert */}
      {timeConflicts && timeConflicts.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-2.5 shadow-2xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-bold uppercase tracking-wider text-amber-950 block">
              Schedule Overlap Detected
            </span>
            {timeConflicts.slice(0, 2).map((c, idx) => (
              <p key={idx} className="text-amber-800">
                • Day {c.dayNumber}: {c.message}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Day Tabs Navigation Header */}
      <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {days.map((d) => {
            const count = safeItinerary.filter((i) => i.day_number === d).length;
            const isActive = activeDay === d;
            return (
              <button
                key={d}
                onClick={() => handleTabChange(d)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-amber-500 text-stone-950 shadow-2xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <span>Day {d}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-black/10 text-stone-950' : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-stone-600 shrink-0">
          <span className="hidden sm:inline text-stone-400 font-normal">Day budget:</span>
          <span className="text-stone-900 font-bold font-mono">₹{dayCost.toLocaleString()}</span>
          {onOpenExplore && (
            <button
              onClick={onOpenExplore}
              className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
              title="Add place from catalog"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Timeline Items List */}
      <div className="space-y-1">
        {currentDayItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-stone-200 p-8 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-stone-900 text-sm">No stops planned for Day {activeDay}</h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
              Use WayTogether AI to schedule this day automatically or choose attractions from the destination catalog.
            </p>
            {onOpenExplore && (
              <button
                onClick={onOpenExplore}
                className="text-xs font-bold px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-2xs inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Browse Ahmedabad Sights
              </button>
            )}
          </div>
        ) : (
          currentDayItems.map((item, index) => {
            const place = item.place || safePlaces.find((p) => p.id === item.place_id);
            if (!place) return null;

            const isReplacing = replacingItemId === item.id;
            const isLast = index === currentDayItems.length - 1;

            return (
              <div key={item.id} className="relative group">
                {/* Transit Indicator Connector */}
                {index > 0 && (
                  <div className="flex items-center gap-2 py-1.5 pl-6 my-1">
                    <div className="w-6 flex justify-center text-amber-600">
                      <span className="text-sm font-bold leading-none">↓</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-full border border-stone-200/80">
                      <Clock className="w-3 h-3 text-stone-400" />
                      <span>{item.travel_duration || 18} min transit ({trip.transport || 'Taxi'})</span>
                    </div>
                  </div>
                )}

                {/* Main Timeline Card */}
                <div className="bg-white rounded-2xl border border-stone-200/90 p-3.5 shadow-2xs hover:border-amber-300 hover:shadow-sm transition-all">
                  <div className="flex items-start gap-3">
                    {/* Left: Time and Node */}
                    <div className="shrink-0 flex flex-col items-center pt-0.5">
                      <span className="text-xs font-extrabold font-mono text-stone-900 tracking-tight">
                        {item.start_time}
                      </span>
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-amber-100 mt-1.5 mb-1" />
                      <span className="text-[10px] text-stone-400 font-mono">
                        {item.end_time}
                      </span>
                    </div>

                    {/* Place Thumbnail */}
                    <img
                      src={place.image_url}
                      alt={place.name}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-stone-100 shrink-0"
                    />

                    {/* Place Info */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-extrabold text-stone-900 text-sm leading-snug truncate">
                          {place.name}
                        </h4>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                          {place.category}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 text-xs text-stone-500">
                        <span className="flex items-center gap-1 font-semibold text-stone-700">
                          <IndianRupee className="w-3 h-3 text-amber-600" />
                          {place.estimated_cost === 0 ? 'Free' : `₹${place.estimated_cost}`}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-stone-400" />
                          {place.visit_duration} min
                        </span>
                        <span>·</span>
                        <span className="text-amber-700 font-medium">
                          ★ {place.rating}
                        </span>
                      </div>
                    </div>

                    {/* Actions Menu */}
                    <div className="flex items-center gap-1 shrink-0 self-start">
                      <button
                        onClick={() => onOpenPlaceDetails?.(place)}
                        className="px-2 py-1 rounded-lg text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                        title="View Details"
                      >
                        Details
                      </button>

                      <button
                        onClick={() => setReplacingItemId(isReplacing ? null : item.id)}
                        className={`p-1.5 rounded-lg text-xs transition-colors ${
                          isReplacing
                            ? 'bg-amber-100 text-amber-900'
                            : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
                        }`}
                        title="Replace Stop"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Remove Stop"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Inline Replacement Candidate Drawer */}
                  {isReplacing && (
                    <div className="mt-3 pt-3 border-t border-stone-100 animate-in fade-in">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                          Swap with nearby destination:
                        </span>
                        <button
                          onClick={() => setReplacingItemId(null)}
                          className="text-[10px] text-stone-500 hover:text-stone-800"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                        {candidatePlaces.slice(0, 6).map((c) => (
                          <div
                            key={c.id}
                            onClick={() => handleConfirmReplacement(item.id, c.id)}
                            className="p-2 rounded-xl border border-stone-200 hover:border-amber-400 hover:bg-amber-50/40 cursor-pointer flex items-center justify-between gap-2 text-left transition-all"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <img
                                src={c.image_url}
                                alt={c.name}
                                className="w-9 h-9 rounded-lg object-cover shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-stone-800 truncate">{c.name}</div>
                                <div className="text-[10px] text-stone-500 flex items-center gap-1">
                                  <span>{c.category}</span>
                                  <span>·</span>
                                  <span>₹{c.estimated_cost}</span>
                                </div>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded shrink-0">
                              Swap
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
