import React from 'react';
import {
  Activity,
  Sparkles,
  UserPlus,
  Sliders,
  Calendar,
  IndianRupee,
  MapPin,
  RefreshCw,
  Clock,
  TrendingUp,
  Brain
} from 'lucide-react';
import { TripEvent, AIDecision } from '../../types';

interface ActivityFeedProps {
  events: TripEvent[];
  decisions: AIDecision[];
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ events, decisions }) => {
  const getEventIcon = (type: TripEvent['event_type']) => {
    switch (type) {
      case 'MEMBER_JOINED':
        return <UserPlus className="w-4 h-4 text-emerald-600" />;
      case 'PREFERENCE_UPDATED':
        return <Sliders className="w-4 h-4 text-amber-600" />;
      case 'ITINERARY_GENERATED':
        return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'PLACE_REPLACED':
        return <RefreshCw className="w-4 h-4 text-purple-600" />;
      case 'BUDGET_CHANGED':
        return <IndianRupee className="w-4 h-4 text-rose-600" />;
      case 'ROUTE_OPTIMIZED':
        return <MapPin className="w-4 h-4 text-teal-600" />;
      default:
        return <Activity className="w-4 h-4 text-stone-600" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="activity-feed-panel">
      {/* Real-Time Group Events Timeline */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-600" />
            Live Group Activity Timeline
          </h3>
          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Realtime Sync Active
          </span>
        </div>

        <div className="space-y-4">
          {events.length === 0 ? (
            <p className="text-xs text-stone-400 italic text-center py-6">No recent group actions logged.</p>
          ) : (
            events.map((ev) => (
              <div key={ev.id} className="flex items-start gap-3 text-xs">
                <div className="w-8 h-8 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-center shrink-0 mt-0.5">
                  {getEventIcon(ev.event_type)}
                </div>

                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900">{ev.user_name || 'Group Member'}</span>
                    <span className="text-[10px] text-stone-400 font-mono">
                      {new Date(ev.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-stone-600 font-medium">{ev.metadata.description}</p>

                  {ev.metadata.impact && (
                    <div className="text-[11px] text-amber-800 bg-amber-50/70 p-2 rounded-lg border border-amber-200/60 mt-1">
                      {ev.metadata.impact.summary}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* AI Decision Log & Architectural Explanations */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
            <Brain className="w-4 h-4 text-amber-600" />
            AI Decision Memory Log
          </h3>
          <span className="text-[11px] font-semibold text-stone-500">Autonomous Reasoning</span>
        </div>

        <div className="space-y-3">
          {decisions.length === 0 ? (
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 text-xs text-stone-500 space-y-1">
              <span className="font-bold text-stone-800 block">Living Itinerary Initialized</span>
              <p>
                Initial balance established across 4 members: Diya (History), Rahul (Nature/Photos), Ananya (Food), and Dev (Architecture/Budget).
              </p>
            </div>
          ) : (
            decisions.map((dec) => (
              <div
                key={dec.id}
                className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5 text-xs hover:border-amber-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-950 uppercase tracking-wider text-[10px] bg-amber-100 px-2 py-0.5 rounded">
                    {dec.intent}
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">
                    {new Date(dec.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="font-bold text-stone-900 text-sm">{dec.action}</div>
                <p className="text-stone-600 leading-relaxed">{dec.reason}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
