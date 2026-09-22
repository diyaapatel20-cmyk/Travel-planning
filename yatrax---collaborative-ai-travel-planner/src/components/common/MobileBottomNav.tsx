import React from 'react';
import { Compass, Search, Sparkles, Users, MessageSquare } from 'lucide-react';
import { Trip } from '../../types';

interface MobileBottomNavProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  trip?: Trip;
  onOpenAIDrawer: () => void;
  onOpenExplore: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentRoute,
  onNavigate,
  trip,
  onOpenAIDrawer,
  onOpenExplore
}) => {
  const isTrip = currentRoute.startsWith('/trip/') && trip;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-stone-200 px-3 py-2 flex items-center justify-around shadow-lg">
      {/* Trips */}
      <button
        onClick={() => {
          if (isTrip) {
            onNavigate(`/trip/${trip.id}/overview`);
          } else {
            onNavigate('/dashboard');
          }
        }}
        className={`flex flex-col items-center gap-1 p-1 text-[10px] font-bold ${
          currentRoute.includes('overview') || currentRoute === '/dashboard'
            ? 'text-amber-600'
            : 'text-stone-500'
        }`}
      >
        <Compass className="w-4 h-4" />
        <span>Trips</span>
      </button>

      {/* Explore */}
      <button
        onClick={onOpenExplore}
        className="flex flex-col items-center gap-1 p-1 text-[10px] font-bold text-stone-500 hover:text-stone-900"
      >
        <Search className="w-4 h-4" />
        <span>Explore</span>
      </button>

      {/* AI Planner */}
      <button
        onClick={onOpenAIDrawer}
        className="flex flex-col items-center gap-1 p-1 text-[10px] font-black text-stone-950"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-stone-950 shadow-sm -mt-3 ring-4 ring-white">
          <Sparkles className="w-4 h-4" />
        </div>
        <span className="text-amber-700">AI</span>
      </button>

      {/* Group */}
      <button
        onClick={() => {
          if (isTrip) {
            onNavigate(`/trip/${trip.id}/members`);
          } else {
            onNavigate('/dashboard');
          }
        }}
        className={`flex flex-col items-center gap-1 p-1 text-[10px] font-bold ${
          currentRoute.includes('members') ? 'text-amber-600' : 'text-stone-500'
        }`}
      >
        <Users className="w-4 h-4" />
        <span>Group</span>
      </button>

      {/* Google Chat */}
      <button
        onClick={() => {
          if (isTrip) {
            onNavigate(`/trip/${trip.id}/chat`);
          } else {
            onNavigate(`/trip/trip-ahmedabad-sih/chat`);
          }
        }}
        className={`flex flex-col items-center gap-1 p-1 text-[10px] font-bold ${
          currentRoute.includes('chat') ? 'text-amber-600' : 'text-stone-500'
        }`}
      >
        <MessageSquare className="w-4 h-4" />
        <span>Chat</span>
      </button>
    </div>
  );
};

