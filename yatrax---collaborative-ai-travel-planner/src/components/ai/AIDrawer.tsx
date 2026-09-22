import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Layers,
  Flame,
  Clock,
  IndianRupee,
  MapPin,
  Check,
  Plus,
  RefreshCw,
  TrendingUp,
  Loader2,
  ChevronRight,
  Info
} from 'lucide-react';
import {
  Trip,
  TripMember,
  MemberPreference,
  ItineraryItem,
  Place,
  ChatMessage,
  AIRecommendation,
  AIDecisionImpact
} from '../../types';
import { processAIGroupQuery } from '../../lib/ai/aiAssistant';
import { appStore } from '../../lib/database/store';

interface AIDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  members: TripMember[];
  preferences: MemberPreference[];
  itinerary: ItineraryItem[];
  allPlaces: Place[];
  initialQuery?: string;
  onOpenPlaceDetails?: (place: Place) => void;
}

export const AIDrawer: React.FC<AIDrawerProps> = ({
  isOpen,
  onClose,
  trip,
  members = [],
  preferences = [],
  itinerary = [],
  allPlaces = [],
  initialQuery = '',
  onOpenPlaceDetails
}) => {
  const [inputQuery, setInputQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStepText, setCurrentStepText] = useState<string>('');
  const [stepIndex, setStepIndex] = useState<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUser = appStore.currentUser;
  const chatMessages = (appStore.chat || []).filter((c) => c.trip_id === trip.id);

  const quickActionChips = [
    { label: '✨ Plan My Trip', query: 'Plan our Ahmedabad trip under ₹5000 and make sure everyone gets something they like' },
    { label: '📍 Suggest Places', query: 'Suggest top places for our group based on member preferences' },
    { label: '💰 Optimize Budget', query: 'Optimize our trip budget to stay under ₹4000 without losing quality' },
    { label: '⚡ Optimize Route', query: 'Optimize the route with Dijkstra to minimize travel time between stops' },
    { label: '🔄 Replace a Place', query: 'Replace Kankaria Lake with a historical destination' },
    { label: '⏱️ Fix Schedule', query: 'Check schedule for time overlaps and adjust the timings for lunch breaks' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [chatMessages, isProcessing, isOpen]);

  useEffect(() => {
    if (initialQuery && isOpen) {
      handleSendMessage(initialQuery);
    }
  }, [initialQuery, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isProcessing) return;

    setInputQuery('');
    setIsProcessing(true);
    setStepIndex(0);

    // Record user message
    appStore.addChatMessage(trip.id, {
      trip_id: trip.id,
      user_id: currentUser.id,
      role: 'user',
      content: query,
      user_name: currentUser.full_name,
      user_avatar: currentUser.avatar_url
    });

    try {
      const aiResponse = await processAIGroupQuery(
        query,
        trip,
        members,
        preferences,
        itinerary,
        allPlaces,
        currentUser.id,
        (idx, stepName) => {
          setStepIndex(idx);
          setCurrentStepText(stepName);
        }
      );

      appStore.addChatMessage(trip.id, {
        trip_id: trip.id,
        user_id: 'assistant',
        role: 'assistant',
        content: aiResponse.message,
        recommendations: aiResponse.recommendations,
        impact: aiResponse.impact,
        action: aiResponse.action
      });
    } catch (err) {
      console.error('Error processing AI query', err);
      appStore.addChatMessage(trip.id, {
        trip_id: trip.id,
        user_id: 'assistant',
        role: 'assistant',
        content: 'WayTogether AI encountered an error processing your query. Please try again.'
      });
    } finally {
      setIsProcessing(false);
      setCurrentStepText('');
    }
  };

  const handleAddRecommendation = (rec: AIRecommendation) => {
    appStore.addItineraryItem(trip.id, rec.place_id, 1);
  };

  const handleReplaceRecommendation = (rec: AIRecommendation) => {
    if (itinerary.length > 0) {
      appStore.replaceItineraryItem(trip.id, itinerary[0].id, rec.place_id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" id="ai-drawer-container">
      {/* Backdrop overlay (semitransparent so map/itinerary are visible behind on desktop) */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-stone-900/30 backdrop-blur-2xs transition-opacity duration-300"
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <aside className="w-screen max-w-xl bg-white shadow-2xl flex flex-col border-l border-stone-200 animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-4 sm:p-5 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-stone-950 shadow-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base tracking-tight text-white">WayTogether AI</h3>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Group Consensus
                  </span>
                </div>
                <p className="text-xs text-stone-400">
                  Optimizing shared preferences for {members.length} travelers
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
                title="Close AI Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Action Chips Bar */}
          <div className="px-4 py-2.5 bg-stone-50 border-b border-stone-200 overflow-x-auto flex items-center gap-2 shrink-0">
            {quickActionChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip.query)}
                disabled={isProcessing}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-950 transition-all shadow-2xs whitespace-nowrap disabled:opacity-50"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* AI Analysis Status (Step indicator when processing) */}
          {isProcessing && (
            <div className="p-3 bg-amber-50 border-b border-amber-200 text-amber-900 flex items-center gap-3 animate-pulse shrink-0">
              <Loader2 className="w-4 h-4 text-amber-600 animate-spin shrink-0" />
              <div className="text-xs">
                <span className="font-bold">AI Analysis in Progress:</span>{' '}
                <span className="text-amber-800 font-medium">
                  {currentStepText || 'Evaluating group constraints & Dijkstra transit corridor...'}
                </span>
              </div>
            </div>
          )}

          {/* Messages & Recommendations Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
            {chatMessages.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-stone-900">What would you like to plan or change?</h4>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Ask to optimize your route, balance individual preferences, replace stops, or keep costs under budget.
                </p>
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  <button
                    onClick={() => handleSendMessage('Plan our Ahmedabad trip under ₹5000 and make sure everyone gets something they like')}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-xs"
                  >
                    ✨ Plan My Trip
                  </button>
                  <button
                    onClick={() => handleSendMessage('Suggest top places for our group')}
                    className="text-xs font-medium px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700"
                  >
                    📍 Suggest Places
                  </button>
                </div>
              </div>
            ) : (
              chatMessages.map((msg) => {
                const isUser = msg.role === 'user';
                const isSystem = msg.role === 'system';

                if (isSystem) {
                  return (
                    <div key={msg.id} className="flex justify-center my-1">
                      <span className="text-[11px] font-medium text-stone-500 bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
                        {msg.content}
                      </span>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {isUser ? (
                      <img
                        src={msg.user_avatar || currentUser.avatar_url}
                        alt={msg.user_name || 'User'}
                        className="w-8 h-8 rounded-xl object-cover border border-amber-300 shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-stone-950 flex items-center justify-center shadow-xs shrink-0 font-bold">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div className={`max-w-[85%] space-y-2.5 ${isUser ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 text-[10px] text-stone-400">
                        <span className="font-semibold text-stone-700">
                          {isUser ? msg.user_name || currentUser.full_name : 'WayTogether AI'}
                        </span>
                        <span>·</span>
                        <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      <div
                        className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                          isUser
                            ? 'bg-amber-600 text-white rounded-tr-none shadow-xs font-medium'
                            : 'bg-stone-50 border border-stone-200 text-stone-800 rounded-tl-none shadow-xs'
                        }`}
                      >
                        {msg.content}
                      </div>

                      {/* Living Itinerary Impact Card */}
                      {msg.impact && (
                        <div className="p-3 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 shadow-2xs space-y-2 text-xs">
                          <div className="font-bold text-amber-950 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                            Living Itinerary Impact Report
                          </div>
                          <p className="text-stone-700 text-xs leading-relaxed font-medium">
                            {msg.impact.summary}
                          </p>
                          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-amber-200/60 font-mono text-[11px]">
                            <div className="bg-white/90 p-1.5 rounded-lg border border-amber-100 text-center">
                              <span className="text-[9px] text-stone-400 block font-sans">Budget Impact</span>
                              <span className="font-bold text-emerald-700">
                                {msg.impact.budget_change <= 0 ? `Saved ₹${Math.abs(msg.impact.budget_change)}` : `+₹${msg.impact.budget_change}`}
                              </span>
                            </div>
                            <div className="bg-white/90 p-1.5 rounded-lg border border-amber-100 text-center">
                              <span className="text-[9px] text-stone-400 block font-sans">Transit</span>
                              <span className="font-bold text-amber-800">
                                {msg.impact.travel_time_change <= 0 ? `${Math.abs(msg.impact.travel_time_change)}m less` : `+${msg.impact.travel_time_change}m`}
                              </span>
                            </div>
                            <div className="bg-white/90 p-1.5 rounded-lg border border-amber-100 text-center">
                              <span className="text-[9px] text-stone-400 block font-sans">Consensus</span>
                              <span className="font-bold text-stone-900">
                                {msg.impact.match_score_before}% → {msg.impact.match_score_after}%
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* AI Recommendation Cards (per user prompt) */}
                      {msg.recommendations && msg.recommendations.length > 0 && (
                        <div className="space-y-2.5 pt-1">
                          <div className="text-[11px] font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-amber-600" />
                            Recommended Places ({msg.recommendations.length})
                          </div>

                          <div className="space-y-3">
                            {msg.recommendations.map((rec, idx) => {
                              const place = rec.place || allPlaces.find((p) => p.id === rec.place_id);
                              if (!place) return null;

                              return (
                                <div
                                  key={idx}
                                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs hover:border-amber-400 transition-all flex flex-col"
                                >
                                  <div className="relative h-28 w-full overflow-hidden bg-stone-100">
                                    <img
                                      src={place.image_url}
                                      alt={place.name}
                                      className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-2 right-2 bg-stone-900/85 backdrop-blur-xs text-amber-400 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-amber-400/40">
                                      {rec.group_match_score}% Group Match
                                    </div>
                                    <div className="absolute bottom-2 left-2 bg-stone-900/80 text-white text-[9px] font-semibold px-2 py-0.5 rounded">
                                      {place.category}
                                    </div>
                                  </div>

                                  <div className="p-3 space-y-2">
                                    <div>
                                      <h4 className="font-bold text-stone-900 text-sm">{place.name}</h4>
                                      <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                                        {rec.reason}
                                      </p>
                                    </div>

                                    {/* Matched preferences tags */}
                                    <div className="flex flex-wrap gap-1">
                                      {rec.matched_preferences.map((badge, bIdx) => (
                                        <span
                                          key={bIdx}
                                          className="text-[9px] font-semibold bg-amber-50 text-amber-900 border border-amber-200 px-1.5 py-0.5 rounded"
                                        >
                                          {badge}
                                        </span>
                                      ))}
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-stone-600 pt-1 border-t border-stone-100">
                                      <span className="flex items-center gap-1 font-semibold text-stone-800">
                                        <IndianRupee className="w-3 h-3 text-amber-600" />
                                        {place.estimated_cost === 0 ? 'Free' : `₹${place.estimated_cost}`}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3 text-stone-400" />
                                        {place.visit_duration}m duration
                                      </span>
                                      <span className="text-[11px] text-stone-400">
                                        ~18m travel
                                      </span>
                                    </div>

                                    {/* Action Buttons: Add to Trip, Replace, View Details */}
                                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                                      <button
                                        onClick={() => handleAddRecommendation(rec)}
                                        className="py-1.5 px-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs flex items-center justify-center gap-1 transition-colors shadow-2xs"
                                      >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Add</span>
                                      </button>
                                      <button
                                        onClick={() => handleReplaceRecommendation(rec)}
                                        className="py-1.5 px-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs flex items-center justify-center gap-1 transition-colors"
                                      >
                                        <RefreshCw className="w-3 h-3" />
                                        <span>Replace</span>
                                      </button>
                                      <button
                                        onClick={() => onOpenPlaceDetails?.(place)}
                                        className="py-1.5 px-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 font-medium text-xs flex items-center justify-center transition-colors"
                                      >
                                        Details
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom AI Input Box */}
          <div className="p-3 sm:p-4 bg-white border-t border-stone-200 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask WayTogether AI to change your journey..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                disabled={isProcessing}
                className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-2xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim() || isProcessing}
                className="w-10 h-10 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-stone-950 flex items-center justify-center transition-colors shrink-0 shadow-2xs font-bold"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
};
