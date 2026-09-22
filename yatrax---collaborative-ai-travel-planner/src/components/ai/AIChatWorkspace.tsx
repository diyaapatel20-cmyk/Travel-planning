import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  ArrowRight,
  CheckCircle2,
  Clock,
  IndianRupee,
  MapPin,
  TrendingUp,
  Layers,
  Flame,
  Plus,
  RefreshCw,
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

interface AIChatWorkspaceProps {
  trip: Trip;
  members: TripMember[];
  preferences: MemberPreference[];
  itinerary: ItineraryItem[];
  allPlaces: Place[];
  onOpenPlaceDetails?: (place: Place) => void;
}

export const AIChatWorkspace: React.FC<AIChatWorkspaceProps> = ({
  trip,
  members,
  preferences,
  itinerary,
  allPlaces,
  onOpenPlaceDetails
}) => {
  const [inputQuery, setInputQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStepText, setCurrentStepText] = useState<string>('');
  const [stepIndex, setStepIndex] = useState<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUser = appStore.currentUser;
  const chatMessages = appStore.chat;

  const quickActionChips = [
    { label: 'Plan Our Trip', query: 'Plan our Ahmedabad trip under ₹5000 and make sure everyone gets something they like' },
    { label: 'More Nature & Photos', query: 'I want more nature and photography' },
    { label: 'Keep Under ₹4000', query: 'Keep the trip under ₹4000' },
    { label: 'Replace Kankaria', query: 'Replace Kankaria with something historical' },
    { label: 'Optimize Route', query: 'Optimize the route and reduce travel time' },
    { label: 'Suggest Places', query: 'Suggest top places for our group' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isProcessing]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isProcessing) return;

    setInputQuery('');
    setIsProcessing(true);
    setStepIndex(0);

    // Add user message to store
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

      // Add AI assistant response message
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
        content: 'WayTogether AI encountered an error processing the group context. Please retry your inquiry.'
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
    // Replace last or first item
    if (itinerary.length > 0) {
      appStore.replaceItineraryItem(trip.id, itinerary[0].id, rec.place_id);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden" id="ai-chat-workspace">
      {/* Header */}
      <div className="p-4 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-stone-900 shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base tracking-tight flex items-center gap-2">
              WayTogether AI
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Group Consensus Engine
              </span>
            </h2>
            <p className="text-xs text-stone-400">
              Your group's intelligent travel planner · Optimizing for all {members.length} travelers
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-stone-300 bg-stone-800 px-3 py-1.5 rounded-xl border border-stone-700">
          <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
          <span>Active Persona: <strong>{currentUser.full_name}</strong></span>
        </div>
      </div>

      {/* Quick Action Chips */}
      <div className="px-4 py-2.5 bg-stone-50 border-b border-stone-200 overflow-x-auto custom-scrollbar flex items-center gap-2 shrink-0">
        <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Flame className="w-3 h-3 text-amber-500" />
          Quick Actions:
        </span>
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

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {chatMessages.map((msg) => {
          const isUser = msg.role === 'user';
          const isSystem = msg.role === 'system';

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center my-2">
                <div className="text-[11px] font-medium text-stone-500 bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
                  {msg.content}
                </div>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              {isUser ? (
                <img
                  src={msg.user_avatar || currentUser.avatar_url}
                  alt={msg.user_name || 'User'}
                  className="w-8 h-8 rounded-lg object-cover border border-amber-300 shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-stone-900 flex items-center justify-center shadow-xs shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              {/* Message Bubble Content */}
              <div className={`max-w-2xl space-y-3 ${isUser ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 text-[11px] text-stone-400">
                  <span className="font-semibold text-stone-700">
                    {isUser ? msg.user_name || currentUser.full_name : 'WayTogether AI'}
                  </span>
                  <span>·</span>
                  <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    isUser
                      ? 'bg-amber-600 text-white rounded-tr-none shadow-xs font-medium'
                      : 'bg-stone-50 border border-stone-200 text-stone-800 rounded-tl-none shadow-xs'
                  }`}
                >
                  {msg.content}
                </div>

                {/* UX Detail: WHAT CHANGED, WHY, IMPACT Card */}
                {msg.impact && (
                  <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-200/80 shadow-xs space-y-2 text-xs">
                    <div className="font-bold text-amber-950 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      Living Itinerary Optimization Report
                    </div>
                    <p className="text-stone-700 leading-relaxed font-medium">
                      {msg.impact.summary}
                    </p>
                    <div className="grid grid-cols-3 gap-2 pt-1 border-t border-amber-200/60 text-stone-600 font-mono text-[11px]">
                      <div className="bg-white/80 p-1.5 rounded-lg border border-amber-100">
                        <span className="text-[10px] text-stone-400 block font-sans">Budget Impact</span>
                        <span className="font-bold text-emerald-700">
                          {msg.impact.budget_change <= 0 ? `Saved ₹${Math.abs(msg.impact.budget_change)}` : `+₹${msg.impact.budget_change}`}
                        </span>
                      </div>
                      <div className="bg-white/80 p-1.5 rounded-lg border border-amber-100">
                        <span className="text-[10px] text-stone-400 block font-sans">Travel Transit</span>
                        <span className="font-bold text-amber-800">
                          {msg.impact.travel_time_change <= 0 ? `${Math.abs(msg.impact.travel_time_change)}m less` : `+${msg.impact.travel_time_change}m`}
                        </span>
                      </div>
                      <div className="bg-white/80 p-1.5 rounded-lg border border-amber-100">
                        <span className="text-[10px] text-stone-400 block font-sans">Group Consensus</span>
                        <span className="font-bold text-stone-900">
                          {msg.impact.match_score_before}% → {msg.impact.match_score_after}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Recommendation Cards */}
                {msg.recommendations && msg.recommendations.length > 0 && (
                  <div className="space-y-3 pt-1">
                    <div className="text-xs font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-amber-600" />
                      Group Recommendations ({msg.recommendations.length})
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {msg.recommendations.map((rec, idx) => {
                        const place = rec.place || allPlaces.find((p) => p.id === rec.place_id);
                        if (!place) return null;

                        return (
                          <div
                            key={idx}
                            className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs hover:border-amber-400 transition-all flex flex-col justify-between"
                          >
                            <div className="relative h-28 w-full overflow-hidden bg-stone-100">
                              <img
                                src={place.image_url}
                                alt={place.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute top-2 right-2 bg-stone-900/80 backdrop-blur text-amber-400 font-extrabold text-[11px] px-2 py-0.5 rounded-full border border-amber-400/40">
                                {rec.group_match_score}% Match
                              </div>
                              <div className="absolute bottom-2 left-2 bg-stone-900/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                                {place.category}
                              </div>
                            </div>

                            <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                              <div>
                                <h4 className="font-bold text-stone-900 text-sm">{place.name}</h4>
                                <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5">
                                  {rec.reason}
                                </p>
                              </div>

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

                              <div className="flex items-center justify-between text-[11px] text-stone-600 pt-1 border-t border-stone-100">
                                <span className="flex items-center gap-1 font-semibold text-stone-800">
                                  <IndianRupee className="w-3 h-3 text-amber-600" />
                                  {place.estimated_cost === 0 ? 'Free' : `₹${place.estimated_cost}`}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-stone-400" />
                                  {place.visit_duration}m visit
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-1.5 pt-2">
                                <button
                                  onClick={() => handleAddRecommendation(rec)}
                                  className="w-full flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs transition-colors"
                                >
                                  <Plus className="w-3 h-3" />
                                  Add
                                </button>
                                <button
                                  onClick={() => onOpenPlaceDetails?.(place)}
                                  className="w-full py-1.5 px-2 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-700 font-medium text-xs transition-colors"
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
        })}

        {/* AI Progress Step-by-Step UI when processing */}
        {isProcessing && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-stone-900 flex items-center justify-center shadow-xs shrink-0 animate-spin">
              <RefreshCw className="w-4 h-4" />
            </div>

            <div className="bg-stone-900 text-stone-100 p-4 rounded-2xl rounded-tl-none shadow-sm border border-stone-800 max-w-md space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-amber-400 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  WayTogether AI Reasoning Engine
                </span>
                <span className="font-mono text-[10px]">Step {stepIndex + 1}/6</span>
              </div>

              <div className="space-y-1.5 text-xs">
                {[
                  'Analyzing group preferences...',
                  'Checking current itinerary...',
                  'Checking budget & constraints...',
                  'Evaluating alternative candidate places...',
                  'Computing Dijkstra shortest paths...',
                  'Updating shared living itinerary...'
                ].map((step, idx) => {
                  const isDone = idx < stepIndex;
                  const isCurrent = idx === stepIndex;

                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 transition-all ${
                        isDone
                          ? 'text-emerald-400 font-medium'
                          : isCurrent
                          ? 'text-amber-300 font-bold'
                          : 'text-stone-600'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : isCurrent ? (
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-stone-700" />
                      )}
                      <span>{step}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 sm:p-4 bg-stone-50 border-t border-stone-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Tell your group AI what you need (e.g. 'I want more nature', 'Keep under ₹4000')..."
            className="flex-1 bg-white border border-stone-300 rounded-xl px-4 py-3 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-2xs"
            disabled={isProcessing}
            id="ai-chat-input"
          />

          <button
            type="submit"
            disabled={!inputQuery.trim() || isProcessing}
            className="px-4 py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            id="ai-chat-send-btn"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
