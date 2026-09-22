import React from 'react';
import {
  X,
  IndianRupee,
  Clock,
  MapPin,
  Star,
  Plus,
  RefreshCw,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { Place, ItineraryItem, Trip } from '../../types';
import { appStore } from '../../lib/database/store';

interface PlaceDetailModalProps {
  place: Place | null;
  trip: Trip;
  itinerary: ItineraryItem[];
  onClose: () => void;
}

export const PlaceDetailModal: React.FC<PlaceDetailModalProps> = ({
  place,
  trip,
  itinerary,
  onClose
}) => {
  if (!place) return null;

  const isInItinerary = itinerary.some((i) => i.place?.id === place.id || i.place_id === place.id);

  const handleAdd = () => {
    appStore.addItineraryItem(trip.id, place.id, 1);
    onClose();
  };

  const handleReplace = () => {
    if (itinerary.length > 0) {
      appStore.replaceItineraryItem(trip.id, itinerary[0].id, place.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 animate-in zoom-in-95">
        {/* Modal Image Cover */}
        <div className="relative h-56 w-full">
          <img
            src={place.image_url}
            alt={place.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-3 left-3 bg-stone-900/80 backdrop-blur text-white text-xs font-semibold px-2.5 py-1 rounded-lg">
            {place.category}
          </div>
          <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur text-stone-900 text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{place.rating}</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="font-extrabold text-xl text-stone-900">{place.name}</h3>
            <p className="text-xs text-stone-500 flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{place.address}</span>
            </p>
          </div>

          <p className="text-sm text-stone-600 leading-relaxed">
            {place.description}
          </p>

          <div className="grid grid-cols-3 gap-2 py-3 border-y border-stone-100 text-xs">
            <div className="p-2 rounded-xl bg-stone-50 text-center">
              <span className="text-[10px] text-stone-400 block">Estimated Cost</span>
              <span className="font-bold text-stone-900 mt-0.5 block">
                {place.estimated_cost === 0 ? 'Free Entry' : `₹${place.estimated_cost}`}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-stone-50 text-center">
              <span className="text-[10px] text-stone-400 block">Visit Duration</span>
              <span className="font-bold text-stone-900 mt-0.5 block">
                {place.visit_duration} mins
              </span>
            </div>
            <div className="p-2 rounded-xl bg-stone-50 text-center">
              <span className="text-[10px] text-stone-400 block">Hours</span>
              <span className="font-bold text-stone-900 mt-0.5 block">
                {place.opening_time} - {place.closing_time}
              </span>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1.5">
              Tags & Features
            </span>
            <div className="flex flex-wrap gap-1.5">
              {place.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs font-semibold px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center gap-3">
            {!isInItinerary ? (
              <button
                onClick={handleAdd}
                className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Add to Itinerary
              </button>
            ) : (
              <div className="flex-1 py-3 px-4 bg-emerald-50 text-emerald-800 font-bold rounded-xl text-center text-sm border border-emerald-200">
                ✓ Currently in Itinerary
              </div>
            )}

            <button
              onClick={handleReplace}
              className="py-3 px-4 border border-stone-200 hover:bg-stone-50 text-stone-700 font-semibold rounded-xl flex items-center gap-1.5 transition-colors text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Replace Stop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
