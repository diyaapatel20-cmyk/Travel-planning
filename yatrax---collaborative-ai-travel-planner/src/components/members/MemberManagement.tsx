import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Sliders,
  Check,
  Copy,
  Sparkles,
  ShieldCheck,
  Heart,
  IndianRupee,
  Clock,
  Car,
  AlertCircle,
  TrendingUp,
  X,
  Edit3
} from 'lucide-react';
import { Trip, TripMember, MemberPreference } from '../../types';
import { appStore } from '../../lib/database/store';
import { analyzeGroupPreferences } from '../../lib/scoring/groupScoring';

interface MemberManagementProps {
  trip: Trip;
  members: TripMember[];
  preferences: MemberPreference[];
  onTriggerAIReplan?: () => void;
}

export const MemberManagement: React.FC<MemberManagementProps> = ({
  trip,
  members = [],
  preferences = [],
  onTriggerAIReplan
}) => {
  const currentUser = appStore.currentUser;
  const currentPref = preferences.find((p) => p.user_id === currentUser.id) || {
    id: 'temp',
    trip_id: trip.id,
    user_id: currentUser.id,
    interests: ['History', 'Culture'],
    interest_scores: { History: 5, Culture: 4 },
    budget_preference: 'Moderate',
    max_travel_time: 60,
    transport: 'Taxi',
    restrictions: [],
    updated_at: new Date().toISOString()
  };

  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(currentPref.interests || []);
  const [interestScores, setInterestScores] = useState<Record<string, number>>(currentPref.interest_scores || {});
  const [budgetPref, setBudgetPref] = useState<MemberPreference['budget_preference']>(currentPref.budget_preference || 'Moderate');
  const [maxTravelTime, setMaxTravelTime] = useState<number>(currentPref.max_travel_time || 60);
  const [transport, setTransport] = useState<MemberPreference['transport']>(currentPref.transport || 'Taxi');
  const [restrictions, setRestrictions] = useState<string[]>(currentPref.restrictions || []);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    setSelectedInterests(currentPref.interests || []);
    setInterestScores(currentPref.interest_scores || {});
    setBudgetPref(currentPref.budget_preference || 'Moderate');
    setMaxTravelTime(currentPref.max_travel_time || 60);
    setTransport(currentPref.transport || 'Taxi');
    setRestrictions(currentPref.restrictions || []);
  }, [currentUser.id, currentPref]);

  const groupAnalysis = analyzeGroupPreferences(members || [], preferences || []);

  const allAvailableInterests = [
    'History',
    'Culture',
    'Architecture',
    'Food',
    'Photography',
    'Nature',
    'Shopping',
    'Adventure'
  ];

  const commonRestrictions = [
    'Vegetarian',
    'Vegan',
    'Avoid crowded places',
    'Mobility friendly',
    'No late night'
  ];

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
      const nextScores = { ...interestScores };
      delete nextScores[interest];
      setInterestScores(nextScores);
    } else {
      setSelectedInterests([...selectedInterests, interest]);
      setInterestScores({ ...interestScores, [interest]: 4 });
    }
  };

  const handleScoreChange = (interest: string, score: number) => {
    setInterestScores({ ...interestScores, [interest]: score });
  };

  const toggleRestriction = (res: string) => {
    if (restrictions.includes(res)) {
      setRestrictions(restrictions.filter((r) => r !== res));
    } else {
      setRestrictions([...restrictions, res]);
    }
  };

  const handleSavePreferences = () => {
    appStore.updateMemberPreference(trip.id, currentUser.id, {
      interests: selectedInterests,
      interest_scores: interestScores,
      budget_preference: budgetPref,
      max_travel_time: maxTravelTime,
      transport,
      restrictions
    });
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsEditingPreferences(false);
    }, 1500);
  };

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(trip.invite_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const getScoreForInterest = (interestName: string, fallback: number) => {
    const found = groupAnalysis.top_interests.find((ti) => ti.interest.toLowerCase() === interestName.toLowerCase());
    return found ? found.percentage : fallback;
  };

  const dnaCategories = [
    { label: 'History', score: getScoreForInterest('History', 88), color: 'bg-amber-500' },
    { label: 'Culture', score: getScoreForInterest('Culture', 84), color: 'bg-orange-500' },
    { label: 'Nature', score: getScoreForInterest('Nature', 76), color: 'bg-emerald-500' },
    { label: 'Photography', score: getScoreForInterest('Photography', 74), color: 'bg-blue-500' },
    { label: 'Food', score: getScoreForInterest('Food', 82), color: 'bg-rose-500' }
  ];

  return (
    <div className="space-y-8" id="member-management-panel">
      {/* Top Header & Invite Card */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block mb-1">
            Collaborative Group Workspace
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Trip Members & Group DNA
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-xl">
            WayTogether AI calculates shared consensus across each member's personal interests, budget tiers, and transit limitations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 px-4 py-2.5 rounded-2xl">
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Invite Code</span>
              <span className="text-sm font-black font-mono tracking-wider text-stone-900">
                {trip.invite_code}
              </span>
            </div>
            <button
              onClick={handleCopyInvite}
              className="p-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 transition-colors shadow-2xs ml-2"
              title="Copy Code"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <button
            onClick={() => setIsEditingPreferences(true)}
            className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs flex items-center gap-2 transition-colors shadow-2xs"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit My Preferences</span>
          </button>
        </div>
      </div>

      {/* Group DNA Section */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="font-black text-lg text-stone-900 tracking-tight">
                Group DNA & Shared Interests
              </h3>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Harmonized across {members.length} travelers with weighted compromise logic.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
            <span className="text-xs font-bold text-amber-950">Group Harmony:</span>
            <span className="text-sm font-black text-amber-800 font-mono">
              {groupAnalysis.group_satisfaction_score || 91}%
            </span>
          </div>
        </div>

        {/* DNA Metric Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {dnaCategories.map((dna) => (
            <div
              key={dna.label}
              className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2.5"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-stone-800">{dna.label}</span>
                <span className="font-extrabold text-stone-900 font-mono">{dna.score}%</span>
              </div>
              <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${dna.color}`}
                  style={{ width: `${dna.score}%` }}
                />
              </div>
              <span className="text-[10px] text-stone-500 block">
                {dna.score >= 80 ? 'High Agreement' : 'Moderate Agreement'}
              </span>
            </div>
          ))}
        </div>

        {/* Compromise Notes */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/70 text-xs text-stone-700 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-amber-950 block">AI Balancing Strategy</span>
            <p className="text-stone-600 leading-relaxed">
              Diya and Dev prioritize heritage and stepwells, while Rahul seeks outdoor photography spots and Ananya craves Gujarati street dining. WayTogether AI schedules morning heritage visits when sites are quiet, followed by street-food hubs at Manek Chowk in the evening.
            </p>
          </div>
        </div>
      </div>

      {/* Beautiful Member Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-black text-lg text-stone-900">
            Travel Party ({members.length} Members)
          </h3>
          <span className="text-xs text-stone-400 font-medium">Click any profile to switch view</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {members.map((member) => {
            const memberPref = preferences.find((p) => p.user_id === member.user_id) || {
              interests: ['General Travel'],
              budget_preference: 'Moderate',
              transport: 'Taxi',
              restrictions: []
            };

            const isCurrent = member.user_id === currentUser.id;

            return (
              <div
                key={member.id}
                className={`bg-white rounded-3xl border transition-all p-5 flex flex-col justify-between shadow-2xs hover:shadow-md ${
                  isCurrent
                    ? 'border-amber-400 ring-2 ring-amber-400/20'
                    : 'border-stone-200'
                }`}
              >
                <div className="space-y-4">
                  {/* Avatar & Name */}
                  <div className="flex items-start gap-3">
                    <img
                      src={member.profile.avatar_url}
                      alt={member.profile.full_name}
                      className="w-12 h-12 rounded-2xl object-cover border border-stone-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-black text-stone-900 text-sm truncate">
                          {member.profile.full_name}
                        </h4>
                        {isCurrent && (
                          <span className="text-[9px] font-extrabold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded shrink-0">
                            YOU
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-stone-400 block font-medium capitalize">
                        {member.role.toLowerCase()}
                      </span>
                    </div>
                  </div>

                  {/* Interests */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                      Interests
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {(memberPref.interests || []).map((interest, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-semibold bg-stone-100 text-stone-700 px-2 py-0.5 rounded-lg border border-stone-200/60"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Budget & Transport Preferences */}
                  <div className="space-y-2 pt-2 border-t border-stone-100 text-xs">
                    <div className="flex items-center justify-between text-stone-600">
                      <span className="text-stone-400 text-[11px]">Budget:</span>
                      <span className="font-bold text-stone-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/50">
                        {memberPref.budget_preference || 'Moderate'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-stone-600">
                      <span className="text-stone-400 text-[11px]">Transport:</span>
                      <span className="font-semibold text-stone-800 flex items-center gap-1">
                        <Car className="w-3 h-3 text-stone-400" />
                        {memberPref.transport || 'Taxi'} (~{memberPref.max_travel_time || 60}m)
                      </span>
                    </div>

                    {memberPref.restrictions && memberPref.restrictions.length > 0 && (
                      <div className="flex items-center justify-between text-stone-600">
                        <span className="text-stone-400 text-[11px]">Notes:</span>
                        <span className="text-[10px] text-stone-600 truncate max-w-[120px]">
                          {memberPref.restrictions.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-2">
                  {isCurrent ? (
                    <button
                      onClick={() => setIsEditingPreferences(true)}
                      className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs transition-colors shadow-2xs"
                    >
                      Edit Preferences
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        appStore.setCurrentUser(member.user_id);
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-700 font-semibold text-xs border border-stone-200 transition-colors"
                    >
                      Switch to {member.profile.full_name.split(' ')[0]}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Preferences Modal / Drawer */}
      {isEditingPreferences && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-stone-200">
            <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
              <div>
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                  Personal Travel Profile
                </span>
                <h3 className="text-xl font-black text-stone-900 tracking-tight">
                  Edit Preferences for {currentUser.full_name}
                </h3>
              </div>
              <button
                onClick={() => setIsEditingPreferences(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Interests */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-stone-900 block">
                  Select Your Favorite Travel Categories:
                </span>
                <div className="flex flex-wrap gap-2">
                  {allAvailableInterests.map((interest) => {
                    const isSelected = selectedInterests.includes(interest);
                    return (
                      <button
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-amber-500 text-stone-950 shadow-2xs'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>

                {/* Score Sliders for selected */}
                {selectedInterests.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-semibold text-stone-500 block">
                      Importance rating (1-5):
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedInterests.map((i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between"
                        >
                          <span className="text-xs font-bold text-stone-800">{i}</span>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <button
                                key={s}
                                onClick={() => handleScoreChange(i, s)}
                                className={`w-6 h-6 rounded-md text-[10px] font-bold ${
                                  (interestScores[i] || 4) >= s
                                    ? 'bg-amber-500 text-stone-950'
                                    : 'bg-stone-200 text-stone-500'
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Budget Preference */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-900 block">Budget Tier:</span>
                <div className="grid grid-cols-3 gap-2">
                  {(['Budget Friendly', 'Moderate', 'Premium'] as const).map((b) => (
                    <button
                      key={b}
                      onClick={() => setBudgetPref(b)}
                      className={`p-3 rounded-2xl border text-xs font-bold transition-all text-center ${
                        budgetPref === b
                          ? 'border-amber-500 bg-amber-50 text-amber-950 shadow-2xs'
                          : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transit & Max Travel Time */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-900 block">Transit Mode:</span>
                <div className="grid grid-cols-4 gap-2">
                  {(['Taxi', 'Auto', 'Car', 'Public Transport'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTransport(t)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                        transport === t
                          ? 'border-amber-500 bg-amber-50 text-amber-950'
                          : 'border-stone-200 bg-white text-stone-700'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dietary & Constraints */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-900 block">Constraints / Dietary:</span>
                <div className="flex flex-wrap gap-2">
                  {commonRestrictions.map((res) => {
                    const active = restrictions.includes(res);
                    return (
                      <button
                        key={res}
                        onClick={() => toggleRestriction(res)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                          active
                            ? 'bg-amber-100 border border-amber-400 text-amber-950 font-bold'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        {res}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-stone-100 bg-stone-50 flex items-center justify-between">
              <button
                onClick={() => setIsEditingPreferences(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900"
              >
                Cancel
              </button>

              <button
                onClick={handleSavePreferences}
                className="px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs flex items-center gap-2 transition-colors shadow-2xs"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-950" />
                    <span>Updated Live!</span>
                  </>
                ) : (
                  <span>Save Preferences</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
