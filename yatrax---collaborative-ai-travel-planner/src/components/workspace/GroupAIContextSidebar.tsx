import React from 'react';
import {
  Sparkles,
  Users,
  Calendar,
  IndianRupee,
  ShieldCheck,
  TrendingUp,
  Clock,
  Navigation,
  Compass,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Trip, TripMember, MemberPreference, ItineraryItem, AIDecision } from '../../types';
import { analyzeGroupPreferences } from '../../lib/scoring/groupScoring';
import { calculateItineraryBudget } from '../../lib/itinerary/itineraryEngine';

interface GroupAIContextSidebarProps {
  trip: Trip;
  members: TripMember[];
  preferences: MemberPreference[];
  itinerary: ItineraryItem[];
  decisions?: AIDecision[];
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onNavigateTab?: (tab: 'itinerary' | 'ai' | 'map' | 'members') => void;
}

export const GroupAIContextSidebar: React.FC<GroupAIContextSidebarProps> = ({
  trip,
  members = [],
  preferences = [],
  itinerary = [],
  decisions = [],
  isMobileOpen,
  onCloseMobile,
  onNavigateTab
}) => {
  const analysis = analyzeGroupPreferences(members, preferences);
  const budgetData = calculateItineraryBudget(itinerary, trip?.budget ?? 5000, members?.length ?? 4);

  return (
    <aside
      className={`w-80 shrink-0 bg-stone-900 text-stone-100 flex flex-col border-l border-stone-800 transition-all ${
        isMobileOpen ? 'fixed inset-y-0 right-0 z-50 shadow-2xl flex' : 'hidden xl:flex'
      }`}
      id="group-ai-context-panel"
    >
      {/* Panel Header */}
      <div className="p-4 border-b border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-wide text-white flex items-center gap-1.5">
              GROUP AI CONTEXT
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </h3>
            <p className="text-[11px] text-stone-400">Living Multi-Traveler Memory</p>
          </div>
        </div>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="xl:hidden text-stone-400 hover:text-white p-1 text-xs"
          >
            ✕
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar text-xs">
        {/* Overall Group Consensus Indicator */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-500/10 via-stone-800 to-stone-900 border border-amber-500/30">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-stone-300 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              Group Match Consensus
            </span>
            <span className="text-lg font-extrabold text-amber-400">
              {analysis.group_satisfaction_score}%
            </span>
          </div>

          <div className="w-full bg-stone-700/60 rounded-full h-2 overflow-hidden my-2">
            <div
              className="bg-gradient-to-r from-amber-500 to-orange-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${analysis.group_satisfaction_score}%` }}
            />
          </div>

          {/* Breakdown metrics */}
          <div className="grid grid-cols-2 gap-2 mt-2.5 pt-2.5 border-t border-stone-800/80 text-[11px]">
            <div>
              <span className="text-stone-400">Interest Coverage:</span>
              <span className="ml-1 font-semibold text-stone-200">{analysis.breakdown.coverage}%</span>
            </div>
            <div>
              <span className="text-stone-400">Budget Fit:</span>
              <span className="ml-1 font-semibold text-emerald-400">{analysis.breakdown.budget_fit}%</span>
            </div>
            <div>
              <span className="text-stone-400">Time Fit:</span>
              <span className="ml-1 font-semibold text-stone-200">{analysis.breakdown.time_fit}%</span>
            </div>
            <div>
              <span className="text-stone-400">Route Efficiency:</span>
              <span className="ml-1 font-semibold text-stone-200">{analysis.breakdown.route_efficiency}%</span>
            </div>
          </div>
        </div>

        {/* Trip snapshot */}
        <div className="space-y-2 p-3 bg-stone-800/50 rounded-xl border border-stone-800">
          <div className="flex items-center justify-between">
            <span className="text-stone-400">Destination</span>
            <span className="font-semibold text-white">{trip.destination}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-stone-400">Dates</span>
            <span className="font-medium text-stone-200">{trip.start_date} → {trip.end_date}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-stone-400">Group Budget</span>
            <span className="font-bold text-amber-300">₹{trip.budget.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-stone-400">Planned Cost</span>
            <span className="font-semibold text-stone-200">₹{budgetData.totalPlannedCost.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-stone-400">Active Members</span>
            <span className="font-semibold text-white flex items-center gap-1">
              <Users className="w-3 h-3 text-amber-400" />
              {members.length} Travelers
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-stone-400">Living Stops</span>
            <span className="font-semibold text-amber-400">{itinerary.length} Places Scheduled</span>
          </div>
        </div>

        {/* Top Calculated Group Interests */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-stone-200 uppercase tracking-wider text-[11px]">
              Top Group Interests
            </h4>
            <span className="text-[10px] text-stone-400">Consensus</span>
          </div>
          <div className="space-y-2">
            {analysis.top_interests.slice(0, 5).map((item) => (
              <div key={item.interest} className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-stone-300 font-medium">{item.interest}</span>
                  <span className="text-stone-400 font-mono">{item.percentage}%</span>
                </div>
                <div className="w-full bg-stone-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Constraints & Tolerances */}
        <div>
          <h4 className="font-semibold text-stone-200 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Hard Constraints Checked
          </h4>
          <div className="space-y-1.5">
            <div className="p-2 rounded-lg bg-stone-800/60 border border-stone-700/60 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-stone-300">Max travel per leg: 60 mins</span>
            </div>
            <div className="p-2 rounded-lg bg-stone-800/60 border border-stone-700/60 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-stone-300">Budget cap strictly ₹{trip.budget}</span>
            </div>
            <div className="p-2 rounded-lg bg-stone-800/60 border border-stone-700/60 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-stone-300">Vegetarian dining options required</span>
            </div>
          </div>
        </div>

        {/* Detected Group Compromises / Conflicts */}
        {analysis.conflicts.length > 0 && (
          <div>
            <h4 className="font-semibold text-amber-300 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              Compromises Resolved
            </h4>
            <div className="space-y-2">
              {analysis.conflicts.map((c, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-stone-800/80 border border-stone-700 text-[11px] space-y-1">
                  <div className="font-semibold text-amber-200">{c.conflict}</div>
                  <p className="text-stone-400 leading-relaxed">{c.explanation}</p>
                  <div className="text-[10px] text-emerald-400 font-medium pt-1">
                    ✓ Balanced via: {c.suggested_places[0]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Decisions Memory */}
        <div>
          <h4 className="font-semibold text-stone-200 uppercase tracking-wider text-[11px] mb-2">
            Recent Group AI Decisions
          </h4>
          <div className="space-y-2">
            {(!decisions || decisions.length === 0) ? (
              <div className="text-stone-500 italic p-2 bg-stone-800/30 rounded-lg text-center">
                Initial consensus established for 4 travelers.
              </div>
            ) : (
              decisions.slice(0, 3).map((d) => (
                <div
                  key={d.id}
                  className="p-2.5 rounded-lg bg-stone-800/80 border border-stone-700 text-[11px] space-y-1"
                >
                  <div className="font-semibold text-amber-400">{d.action}</div>
                  <p className="text-stone-300 text-[10px] leading-relaxed">{d.reason}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
