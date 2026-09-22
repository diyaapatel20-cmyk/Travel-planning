import React from 'react';
import {
  Compass,
  Sparkles,
  Users,
  Repeat,
  MapPin,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Calendar,
  IndianRupee,
  Cpu,
  Layers,
  Zap,
  Globe
} from 'lucide-react';
import { DEMO_TRIP_ID } from '../lib/database/store';

interface LandingPageProps {
  onNavigate: (route: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 selection:bg-amber-200">
      {/* Top Application Header & Quick Launch */}
      <section className="relative pt-6 pb-6 sm:pt-8 sm:pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-5xl mx-auto bg-white border border-stone-200 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-stone-950 font-black shadow-xs shrink-0">
              <Compass className="w-6 h-6 text-stone-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-stone-900 tracking-tight">Ahmedabad Expedition Workspace</h2>
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[11px] font-extrabold uppercase tracking-wide">
                  Active
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                3 Days · 4 Members · Real-time Consensus & Route Optimization
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => onNavigate(`/trip/${DEMO_TRIP_ID}/overview`)}
              className="flex-1 sm:flex-none px-6 py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold rounded-2xl shadow-sm flex items-center justify-center gap-2 text-sm transition-all hover:scale-102"
              id="hero-start-planning-btn"
            >
              <span>Launch Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('how-it-works-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-5 py-3 bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-800 font-bold rounded-2xl transition-colors text-sm"
            >
              How It Works
            </button>
          </div>
        </div>

        {/* Hero Interactive Visual Architecture Demonstration */}
        <div className="mt-6 max-w-5xl mx-auto bg-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-800 space-y-6">
          <div className="flex items-center justify-between border-b border-stone-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-stone-950 font-bold">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold">WayTogether Collaborative Engine Pipeline</div>
                <div className="text-[11px] text-stone-400">Multi-Traveler Preference Consensus</div>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
              Live Architecture
            </span>
          </div>

          {/* Flow Diagram */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center text-xs">
            <div className="p-3.5 rounded-2xl bg-stone-800/90 border border-stone-700 space-y-1">
              <span className="text-[10px] text-amber-400 font-bold block uppercase tracking-wider">Step 1</span>
              <div className="font-bold text-stone-100">Individual Preferences</div>
              <div className="text-[11px] text-stone-400">Diya, Rahul, Ananya, Dev</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 space-y-1">
              <span className="text-[10px] text-amber-300 font-bold block uppercase tracking-wider">Step 2</span>
              <div className="font-bold text-amber-200">Group AI Context</div>
              <div className="text-[11px] text-amber-100/70">Consensus scoring</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-800/90 border border-stone-700 space-y-1">
              <span className="text-[10px] text-amber-400 font-bold block uppercase tracking-wider">Step 3</span>
              <div className="font-bold text-stone-100">AI Recommendations</div>
              <div className="text-[11px] text-stone-400">Heritage + Nature + Food</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-800/90 border border-stone-700 space-y-1">
              <span className="text-[10px] text-amber-400 font-bold block uppercase tracking-wider">Step 4</span>
              <div className="font-bold text-stone-100">Shared Itinerary</div>
              <div className="text-[11px] text-stone-400">Dijkstra routing</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 space-y-1">
              <span className="text-[10px] text-emerald-400 font-bold block uppercase tracking-wider">Step 5</span>
              <div className="font-bold text-emerald-200">Living Optimization</div>
              <div className="text-[11px] text-emerald-100/70">Realtime multiplayer sync</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-16 bg-white border-y border-stone-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">
              Core Innovations
            </span>
            <h2 className="text-3xl font-black text-stone-900 tracking-tight">
              Built for Real Groups, Not Solo Travelers
            </h2>
            <p className="text-stone-600 text-sm">
              Traditional planners optimize for one person. WayTogether calculates continuous mathematical compromise across all travelers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-stone-900">1. Group-Aware AI</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Rather than chatting in isolation, the AI listens to the collective interests of all members, balancing conflicting priorities (e.g. History vs Nature vs Food).
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center font-bold">
                <Repeat className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-stone-900">2. Living Itinerary</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                When Rahul says "I want more photography", the system updates his weight, re-evaluates the schedule, replaces Kankaria with Adalaj Stepwell, and recalculates budget.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-stone-900">3. Dijkstra Route Routing</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Inter-attraction routes are optimized through graph algorithms and priority queues, preventing erratic zigzag travel across Ahmedabad.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <IndianRupee className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-stone-900">4. Budget Intelligence</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Guarantees the overall group expenditure strictly adheres to ceilings like ₹5,000, factoring in activity entry fees, estimated transport legs, and street food.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-stone-900">5. Realtime Sync Engine</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Changes executed on one browser tab propagate instantaneously to all other connected group devices without requiring page refresh.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-stone-900">6. Conflict Resolution</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Detects clashes between fast-paced sightseeing and relaxation, offering mathematical compromises that maintain satisfaction ratings above 90%.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works-section" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">
            The 6-Step Workflow
          </span>
          <h2 className="text-3xl font-black text-stone-900 tracking-tight">
            How WayTogether Powers Group Travel
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { step: '01', title: 'Create Your Journey', desc: 'Define your destination, dates, initial group budget, and preferred transit mode.' },
            { step: '02', title: 'Invite Your Group', desc: 'Generate a unique group invite code (e.g. YTX-8K4P) to add your co-travelers.' },
            { step: '03', title: 'Everyone Adds Preferences', desc: 'Each member rates interests (1-5), dietary restrictions, and travel tolerance.' },
            { step: '04', title: 'AI Understands the Group', desc: 'The system computes consensus weights, detects conflicts, and seeds group context.' },
            { step: '05', title: 'AI Creates Shared Itinerary', desc: 'Synthesizes multi-day daily stops with lunch breaks and realistic transit times.' },
            { step: '06', title: 'Auto Re-Optimization', desc: 'Any member preference tweak dynamically re-optimizes the living plan.' }
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-2">
              <span className="font-mono font-bold text-amber-600 text-sm">{item.step}</span>
              <h4 className="font-bold text-base text-stone-900">{item.title}</h4>
              <p className="text-xs text-stone-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center pt-8">
          <button
            onClick={() => onNavigate(`/trip/${DEMO_TRIP_ID}/overview`)}
            className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-2xl shadow-md transition-transform hover:scale-105 inline-flex items-center gap-2"
          >
            <span>Open Ahmedabad Demo Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
