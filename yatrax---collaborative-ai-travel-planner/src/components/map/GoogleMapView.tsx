import React, { useEffect, useState } from 'react';
import {
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  Polyline,
  useMap
} from '@vis.gl/react-google-maps';
import { Place, ItineraryItem } from '../../types';
import { Star, Clock, IndianRupee, MapPin, Sparkles, Navigation } from 'lucide-react';

interface GoogleMapViewProps {
  displayItems: ItineraryItem[];
  allPlaces: Place[];
  onSelectPlace?: (place: Place) => void;
  selectedPlaceId?: string;
  dayColors: Record<number, string>;
}

// Helper component to auto-fit map viewport to markers
const MapBoundsAdjuster: React.FC<{ coordinates: { lat: number; lng: number }[] }> = ({ coordinates }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || coordinates.length === 0) return;

    if (window.google?.maps?.LatLngBounds) {
      const bounds = new window.google.maps.LatLngBounds();
      coordinates.forEach((coord) => bounds.extend(coord));
      map.fitBounds(bounds, {
        top: 60,
        right: 60,
        bottom: 60,
        left: 60
      });

      // Avoid excessive zoom on single marker
      if (coordinates.length === 1) {
        const listener = window.google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
          if (map.getZoom() && map.getZoom()! > 15) {
            map.setZoom(15);
          }
        });
        return () => {
          window.google.maps.event.removeListener(listener);
        };
      }
    }
  }, [map, coordinates]);

  return null;
};

export const GoogleMapView: React.FC<GoogleMapViewProps> = ({
  displayItems,
  allPlaces,
  onSelectPlace,
  selectedPlaceId,
  dayColors
}) => {
  const [activePlace, setActivePlace] = useState<{ place: Place; item: ItineraryItem; index: number } | null>(null);

  // Sync selectedPlaceId if provided from parent
  useEffect(() => {
    if (selectedPlaceId) {
      const foundItem = displayItems.find((i) => i.place_id === selectedPlaceId || i.place?.id === selectedPlaceId);
      if (foundItem) {
        const place = foundItem.place || allPlaces.find((p) => p.id === foundItem.place_id);
        if (place) {
          const index = displayItems.indexOf(foundItem);
          setActivePlace({ place, item: foundItem, index });
        }
      }
    }
  }, [selectedPlaceId, displayItems, allPlaces]);

  // Coordinates array for polyline & bounding box
  const validStops = displayItems
    .map((item, index) => {
      const place = item.place || allPlaces.find((p) => p.id === item.place_id);
      if (!place || typeof place.latitude !== 'number' || typeof place.longitude !== 'number') return null;
      return { item, place, index, coord: { lat: place.latitude, lng: place.longitude } };
    })
    .filter((entry): entry is { item: ItineraryItem; place: Place; index: number; coord: { lat: number; lng: number } } => Boolean(entry));

  const coordinates = validStops.map((s) => s.coord);

  return (
    <div className="w-full h-full relative" style={{ width: '100%', height: '100%', minHeight: '480px' }}>
      <Map
        mapId="DEMO_MAP_ID"
        defaultCenter={{ lat: 23.0375, lng: 72.5714 }}
        defaultZoom={13}
        gestureHandling="greedy"
        disableDefaultUI={false}
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        style={{ width: '100%', height: '100%' }}
      >
        <MapBoundsAdjuster coordinates={coordinates} />

        {/* Sequential Route Polyline */}
        {coordinates.length > 1 && (
          <Polyline
            path={coordinates}
            strokeColor="#d97706"
            strokeOpacity={0.85}
            strokeWeight={4}
          />
        )}

        {/* Advanced Markers for each stop */}
        {validStops.map(({ item, place, index, coord }) => {
          const stopNumber = index + 1;
          const color = dayColors[item.day_number] || '#d97706';
          const isSelected = activePlace?.place.id === place.id;

          return (
            <AdvancedMarker
              key={`${place.id}-${item.day_number}-${index}`}
              position={coord}
              title={`Day ${item.day_number} · Stop #${stopNumber}: ${place.name}`}
              onClick={() => {
                setActivePlace({ place, item, index });
                if (onSelectPlace) {
                  onSelectPlace(place);
                }
              }}
            >
              <Pin
                background={color}
                borderColor="#ffffff"
                glyphColor="#ffffff"
                scale={isSelected ? 1.3 : 1.1}
              >
                <span className="font-bold text-xs text-white leading-none">{stopNumber}</span>
              </Pin>
            </AdvancedMarker>
          );
        })}

        {/* InfoWindow for clicked stop */}
        {activePlace && (
          <InfoWindow
            position={{ lat: activePlace.place.latitude, lng: activePlace.place.longitude }}
            onCloseClick={() => setActivePlace(null)}
            pixelOffset={[0, -32]}
          >
            <div className="max-w-[260px] p-1 font-sans text-stone-900">
              {activePlace.place.image_url && (
                <div className="relative mb-2 rounded-lg overflow-hidden h-28 w-full bg-stone-100">
                  <img
                    src={activePlace.place.image_url}
                    alt={activePlace.place.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div
                    className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold text-white shadow"
                    style={{ backgroundColor: dayColors[activePlace.item.day_number] || '#d97706' }}
                  >
                    Day {activePlace.item.day_number} · Stop #{activePlace.index + 1}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-1.5 text-xs text-amber-600 font-semibold mb-0.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>{activePlace.place.category}</span>
                <span className="text-stone-300">·</span>
                <div className="flex items-center gap-0.5 text-amber-500">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-stone-700">{activePlace.place.rating}</span>
                </div>
              </div>

              <h4 className="font-bold text-sm text-stone-900 leading-snug mb-1">
                {activePlace.place.name}
              </h4>
              <p className="text-xs text-stone-500 line-clamp-2 mb-2 leading-relaxed">
                {activePlace.place.description}
              </p>

              <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-stone-100 text-[11px] text-stone-600">
                <div className="flex items-center gap-1">
                  <IndianRupee className="w-3 h-3 text-emerald-600" />
                  <span>{activePlace.place.estimated_cost === 0 ? 'Free Entry' : `₹${activePlace.place.estimated_cost}/person`}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-blue-600" />
                  <span>{activePlace.place.visit_duration} mins</span>
                </div>
              </div>

              {activePlace.item.travel_time_from_prev > 0 && (
                <div className="mt-2 pt-1.5 border-t border-dashed border-stone-200 text-[11px] text-stone-500 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Navigation className="w-3 h-3 text-stone-400" />
                    Travel from prev:
                  </span>
                  <span className="font-medium text-stone-700">{activePlace.item.travel_time_from_prev} min</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  if (onSelectPlace) {
                    onSelectPlace(activePlace.place);
                  }
                }}
                className="mt-2.5 w-full py-1.5 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 shadow-sm"
              >
                <span>Select & Focus in Itinerary</span>
              </button>
            </div>
          </InfoWindow>
        )}
      </Map>
    </div>
  );
};
