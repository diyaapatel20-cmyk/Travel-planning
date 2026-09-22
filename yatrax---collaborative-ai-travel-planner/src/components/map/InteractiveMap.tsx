import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { APIProvider } from '@vis.gl/react-google-maps';
import { Place, ItineraryItem } from '../../types';
import { Sparkles, Map as MapIcon, Globe } from 'lucide-react';
import { GoogleMapView } from './GoogleMapView';

interface InteractiveMapProps {
  itinerary: ItineraryItem[];
  allPlaces: Place[];
  onSelectPlace?: (place: Place) => void;
  selectedPlaceId?: string;
  activeDay?: number;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  itinerary,
  allPlaces,
  onSelectPlace,
  selectedPlaceId,
  activeDay
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);

  const [googleMapsKey, setGoogleMapsKey] = useState<string>(() => {
    return (
      (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY ||
      'AIzaSyBeksgHwElh3uXYFdFocbQub1RoJAvExmg'
    );
  });

  const [mapMode, setMapMode] = useState<'google' | 'osm'>('google');

  // Verify key from API config if needed
  useEffect(() => {
    fetch('/api/config/maps')
      .then((res) => res.json())
      .then((data) => {
        if (data?.apiKey) {
          setGoogleMapsKey(data.apiKey);
        }
      })
      .catch((err) => {
        console.warn('Map config load notice:', err);
      });
  }, []);

  // Filter items by day if activeDay is specified, otherwise show all
  const displayItems = (activeDay
    ? (itinerary || []).filter((i) => i.day_number === activeDay)
    : (itinerary || [])) || [];

  const dayColors: Record<number, string> = {
    1: '#d97706', // amber-600
    2: '#059669', // emerald-600
    3: '#2563eb', // blue-600
    4: '#7c3aed', // violet-600
    5: '#db2777'  // pink-600
  };

  // Setup Leaflet map when in 'osm' mode
  useEffect(() => {
    if (mapMode !== 'osm') {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
        routePolylineRef.current = null;
      }
      return;
    }

    if (!mapContainerRef.current) return;

    const container = mapContainerRef.current;
    if ((container as any)._leaflet_id && !mapInstanceRef.current) {
      container.innerHTML = '';
      delete (container as any)._leaflet_id;
    }

    // Center on Ahmedabad
    const defaultCenter: [number, number] = [23.0375, 72.5714];

    if (!mapInstanceRef.current) {
      const map = L.map(container, {
        center: defaultCenter,
        zoom: 12,
        zoomControl: true,
        attributionControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);
    }

    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();
    if (routePolylineRef.current) {
      map.removeLayer(routePolylineRef.current);
      routePolylineRef.current = null;
    }

    const coordinates: [number, number][] = [];

    displayItems.forEach((item, index) => {
      const place = item.place || allPlaces.find((p) => p.id === item.place_id);
      if (!place) return;

      const latLng: [number, number] = [place.latitude, place.longitude];
      coordinates.push(latLng);

      const color = dayColors[item.day_number] || '#d97706';
      const stopNumber = index + 1;

      // Custom numbered pin icon
      const customHtml = `
        <div style="
          background-color: ${color};
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 13px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.35);
          border: 2px solid white;
          transform: translate(-50%, -50%);
          cursor: pointer;
        ">
          ${stopNumber}
        </div>
      `;

      const icon = L.divIcon({
        html: customHtml,
        className: 'custom-leaflet-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker(latLng, { icon }).addTo(markersGroup);

      // Popup with place info
      const popupHtml = `
        <div style="font-family: sans-serif; max-width: 220px; padding: 2px;">
          <img src="${place.image_url}" alt="${place.name}" style="width: 100%; height: 95px; object-fit: cover; border-radius: 6px; margin-bottom: 6px;" />
          <div style="font-size: 11px; font-weight: 700; color: ${color}; text-transform: uppercase;">Day ${item.day_number} · Stop #${stopNumber}</div>
          <div style="font-size: 14px; font-weight: 700; color: #1c1917; margin: 2px 0;">${place.name}</div>
          <div style="font-size: 11px; color: #78716c; margin-bottom: 6px;">${place.category} · ★ ${place.rating}</div>
          <div style="font-size: 11px; color: #44403c; display: flex; justify-content: space-between; border-top: 1px solid #f5f5f4; padding-top: 4px;">
            <span>Cost: ${place.estimated_cost === 0 ? 'Free' : `₹${place.estimated_cost}`}</span>
            <span>Duration: ${place.visit_duration}m</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        if (onSelectPlace) {
          onSelectPlace(place);
        }
      });
    });

    // Draw route polyline between sequential stops
    if (coordinates.length > 1) {
      const polyline = L.polyline(coordinates, {
        color: '#d97706',
        weight: 3.5,
        opacity: 0.85,
        dashArray: '6, 8',
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      routePolylineRef.current = polyline;
    }

    // Auto fit bounds to markers
    if (coordinates.length > 0) {
      const bounds = L.latLngBounds(coordinates);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [mapMode, displayItems, allPlaces, onSelectPlace, activeDay]);

  return (
    <div className="relative w-full h-full min-h-[480px] rounded-2xl overflow-hidden border border-stone-200 shadow-sm bg-stone-100 flex flex-col">
      {/* Top Map Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex items-center justify-between pointer-events-none">
        <div className="bg-white/95 backdrop-blur px-3 py-1.5 rounded-xl border border-stone-200 shadow-sm pointer-events-auto flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-stone-800">
            {activeDay ? `Day ${activeDay} Route` : 'All 3 Days Journey'}
          </span>
          <span className="text-stone-400">·</span>
          <span className="text-stone-600">{displayItems?.length || 0} Stops</span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {googleMapsKey ? (
            <div className="bg-white/95 backdrop-blur p-1 rounded-xl border border-stone-200 shadow-sm flex text-xs font-medium">
              <button
                type="button"
                onClick={() => setMapMode('google')}
                className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                  mapMode === 'google'
                    ? 'bg-amber-100 text-amber-900 font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5 text-amber-600" />
                <span>Google Maps</span>
              </button>
              <button
                type="button"
                onClick={() => setMapMode('osm')}
                className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                  mapMode === 'osm'
                    ? 'bg-amber-100 text-amber-900 font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-stone-500" />
                <span>OSM / Leaflet</span>
              </button>
            </div>
          ) : (
            <div className="bg-white/95 backdrop-blur px-2.5 py-1.5 rounded-xl border border-stone-200 shadow-sm text-[11px] text-stone-600 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>Interactive OpenStreetMap + Dijkstra Routing Active</span>
            </div>
          )}
        </div>
      </div>

      {/* Map Content View */}
      {mapMode === 'google' && googleMapsKey ? (
        <div className="w-full flex-1 relative z-10" id="waytogether-google-map">
          <APIProvider apiKey={googleMapsKey} libraries={['marker', 'routes']}>
            <GoogleMapView
              displayItems={displayItems}
              allPlaces={allPlaces}
              onSelectPlace={onSelectPlace}
              selectedPlaceId={selectedPlaceId}
              dayColors={dayColors}
            />
          </APIProvider>
        </div>
      ) : (
        <div ref={mapContainerRef} className="w-full flex-1 z-10" id="waytogether-interactive-map" />
      )}

      {/* Bottom Map Legend */}
      <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur px-3 py-2 rounded-xl border border-stone-200 shadow-sm text-xs flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
          <span className="text-stone-700 font-medium">Day 1</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
          <span className="text-stone-700 font-medium">Day 2</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
          <span className="text-stone-700 font-medium">Day 3</span>
        </div>
        <div className="text-[11px] text-stone-400 pl-2 border-l border-stone-200">
          Click any pin for stop details
        </div>
      </div>
    </div>
  );
};
