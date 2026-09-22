import React, { useState } from 'react';
import {
  X,
  Search,
  MapPin,
  Clock,
  IndianRupee,
  Star,
  Plus,
  Sparkles,
  Check,
  Filter
} from 'lucide-react';
import { Place, Trip, ItineraryItem, MemberPreference } from '../../types';
import { appStore } from '../../lib/database/store';
import { scorePlaceForGroup } from '../../lib/scoring/groupScoring';

interface ExploreModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip?: Trip;
  itinerary?: ItineraryItem[];
  preferences?: MemberPreference[];
  onOpenPlaceDetails?: (place: Place) => void;
}

export const ExploreModal: React.FC<ExploreModalProps> = ({
  isOpen,
  onClose,
  trip,
  itinerary = [],
  preferences = [],
  onOpenPlaceDetails
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [addedPlaceId, setAddedPlaceId] = useState<string | null>(null);

  if (!isOpen) return null;

  const allPlaces = appStore.places || [];
  const categories = ['All', 'Heritage', 'Culture', 'Food', 'Nature', 'Architecture'];

  const filteredPlaces = allPlaces.filter((place) => {
    const matchesSearch =
      place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || place.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const handleAddToTrip = (place: Place, dayNumber: number = 1) => {
    if (trip) {
      appStore.addItineraryItem(trip.id, place.id, dayNumber);
      setAddedPlaceId(place.id);
      setTimeout(() => setAddedPlaceId(null), 2000);
    }
  };

  const currentTripId = trip?.id || appStore.trips[0]?.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-stone-200">
        {/* Header */}
        <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                Ahmedabad Destination Catalog
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                {allPlaces.length} Curated Attractions
              </span>
            </div>
            <h2 className="text-xl font-black text-stone-900 tracking-tight mt-0.5">
              Explore Heritage, Street Food & Iconic Sights
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search monuments, street markets, riverfront..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs font-medium rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <Filter className="w-3.5 h-3.5 text-stone-400 shrink-0 ml-1 hidden sm:block" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-stone-950 shadow-2xs font-bold'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Places Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlaces.map((place) => {
            const isAlreadyInTrip = itinerary.some(
              (item) => item.place_id === place.id || item.place?.id === place.id
            );
            const isJustAdded = addedPlaceId === place.id;
            const matchScore = preferences.length
              ? scorePlaceForGroup(place, preferences, trip?.budget || 5000, []).groupMatchScore
              : 88;

            return (
              <div
                key={place.id}
                className="bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-2xs hover:shadow-md hover:border-amber-400 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-36 w-full overflow-hidden bg-stone-100">
                    <img
                      src={place.image_url}
                      alt={place.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 bg-stone-900/85 backdrop-blur-xs text-amber-400 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-amber-400/30">
                      {matchScore}% Match
                    </div>
                    <div className="absolute bottom-2 left-2 bg-stone-900/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                      {place.category}
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-bold text-stone-900 text-sm leading-snug">
                        {place.name}
                      </h4>
                      <div className="flex items-center gap-1 text-xs text-stone-600 shrink-0">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="font-bold">{place.rating}</span>
                      </div>
                    </div>

                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                      {place.description}
                    </p>

                    <div className="flex items-center justify-between text-xs text-stone-600 pt-2 border-t border-stone-100">
                      <span className="flex items-center gap-1 font-semibold text-stone-800">
                        <IndianRupee className="w-3.5 h-3.5 text-amber-600" />
                        {place.estimated_cost === 0 ? 'Free Entry' : `₹${place.estimated_cost}`}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-stone-500">
                        <Clock className="w-3 h-3 text-stone-400" />
                        {place.visit_duration} mins
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 flex items-center gap-2">
                  <button
                    onClick={() => onOpenPlaceDetails?.(place)}
                    className="flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold border border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors text-center"
                  >
                    Details
                  </button>

                  {isAlreadyInTrip ? (
                    <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Added
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAddToTrip(place, 1)}
                      disabled={!currentTripId}
                      className="flex-1 py-1.5 px-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-stone-950 flex items-center justify-center gap-1 transition-colors shadow-2xs"
                    >
                      {isJustAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added!</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Trip</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
