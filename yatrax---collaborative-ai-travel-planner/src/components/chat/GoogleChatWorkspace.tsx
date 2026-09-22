import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Plus,
  RefreshCw,
  LogOut,
  Users,
  Calendar,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Compass
} from 'lucide-react';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken
} from '../../lib/googleAuth';
import {
  GoogleChatService,
  ChatSpace,
  ChatMessage
} from '../../lib/googleChatApi';
import { Trip, ItineraryItem, TripMember } from '../../types';
import { GoogleSignInButton } from './GoogleSignInButton';
import { ConfirmSendMessageModal } from './ConfirmSendMessageModal';

interface GoogleChatWorkspaceProps {
  trip: Trip;
  itinerary: ItineraryItem[];
  members: TripMember[];
}

export const GoogleChatWorkspace: React.FC<GoogleChatWorkspaceProps> = ({
  trip,
  itinerary,
  members
}) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [spaces, setSpaces] = useState<ChatSpace[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<ChatSpace | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingSpaces, setIsLoadingSpaces] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const [inputMessage, setInputMessage] = useState('');
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [pendingText, setPendingText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const [showCreateSpace, setShowCreateSpace] = useState(false);
  const [newSpaceTitle, setNewSpaceTitle] = useState(`${trip.name} Planning`);
  const [isCreatingSpace, setIsCreatingSpace] = useState(false);

  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize auth listener on mount
  useEffect(() => {
    const unsubscribe = initAuth(
      (googleUser, accessToken) => {
        setUser(googleUser);
        setToken(accessToken);
        setIsAuthLoading(false);
        loadSpaces(accessToken);
      },
      () => {
        setUser(null);
        setToken(null);
        setIsAuthLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadSpaces = async (authToken?: string) => {
    const activeToken = authToken || token;
    if (!activeToken) return;

    setIsLoadingSpaces(true);
    setErrorNotice(null);
    try {
      const fetchedSpaces = await GoogleChatService.listSpaces(activeToken);
      setSpaces(fetchedSpaces);

      if (fetchedSpaces.length > 0 && !selectedSpace) {
        setSelectedSpace(fetchedSpaces[0]);
        loadMessages(activeToken, fetchedSpaces[0].name);
      }
    } catch (err: any) {
      console.warn('Google Chat spaces notice:', err);
      setErrorNotice(err.message || 'Unable to load spaces from Google Chat.');
    } finally {
      setIsLoadingSpaces(false);
    }
  };

  const loadMessages = async (authToken: string, spaceName: string) => {
    setIsLoadingMessages(true);
    setErrorNotice(null);
    try {
      const fetchedMessages = await GoogleChatService.listMessages(authToken, spaceName);
      setMessages(fetchedMessages);
    } catch (err: any) {
      console.warn('Google Chat messages notice:', err);
      setErrorNotice(err.message || 'Unable to load space messages.');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSelectSpace = (space: ChatSpace) => {
    setSelectedSpace(space);
    if (token) {
      loadMessages(token, space.name);
    }
  };

  const handleLogin = async () => {
    setIsAuthLoading(true);
    setErrorNotice(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        loadSpaces(result.accessToken);
      }
    } catch (err: any) {
      setErrorNotice(err.message || 'Failed to sign in with Google');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setToken(null);
    setSpaces([]);
    setSelectedSpace(null);
    setMessages([]);
  };

  const handleCreateSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newSpaceTitle.trim()) return;

    setIsCreatingSpace(true);
    setErrorNotice(null);
    try {
      const created = await GoogleChatService.createSpace(
        token,
        newSpaceTitle.trim(),
        `WayTogether group space for ${trip.destination} (${trip.start_date} to ${trip.end_date})`
      );
      setSpaces((prev) => [created, ...prev]);
      setSelectedSpace(created);
      setShowCreateSpace(false);
      loadMessages(token, created.name);
    } catch (err: any) {
      setErrorNotice(err.message || 'Failed to create Google Chat space.');
    } finally {
      setIsCreatingSpace(false);
    }
  };

  // Open confirmation modal before sending message (MANDATORY User Confirmation)
  const handleInitiateSend = (text: string) => {
    if (!text.trim()) return;
    setPendingText(text.trim());
    setConfirmModalOpen(true);
  };

  const handleConfirmSend = async () => {
    if (!token || !selectedSpace || !pendingText) return;

    setIsSending(true);
    try {
      const newMsg = await GoogleChatService.sendMessage(token, selectedSpace.name, pendingText);
      setMessages((prev) => [...prev, newMsg]);
      setInputMessage('');
      setConfirmModalOpen(false);
      setPendingText('');
    } catch (err: any) {
      setErrorNotice(err.message || 'Failed to post message to Google Chat.');
      setConfirmModalOpen(false);
    } finally {
      setIsSending(false);
    }
  };

  // Share formatted Itinerary to Google Chat
  const handleShareItinerary = () => {
    const sorted = [...(itinerary || [])].sort((a, b) => {
      if (a.day_number !== b.day_number) return a.day_number - b.day_number;
      return a.order_index - b.order_index;
    });

    const days = [1, 2, 3];
    let text = `🗺️ *${trip.name} Itinerary Summary* (WayTogether)\n`;
    text += `📍 Destination: ${trip.destination} · Budget: ₹${trip.budget}/person\n\n`;

    days.forEach((day) => {
      const dayItems = sorted.filter((i) => i.day_number === day);
      if (dayItems.length > 0) {
        text += `*Day ${day}:*\n`;
        dayItems.forEach((item, idx) => {
          const pName = item.place?.name || 'Stop';
          const dur = item.place?.visit_duration ? ` (${item.place.visit_duration}m)` : '';
          text += `  ${idx + 1}. ${pName}${dur}\n`;
        });
        text += '\n';
      }
    });

    text += `Check out the interactive map and consensus breakdown in WayTogether!`;
    handleInitiateSend(text);
  };

  // Unauthenticated State: Show official Google sign-in
  if (!user || !token) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-xs max-w-2xl mx-auto my-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-bold text-stone-900 mb-2">
          Connect with Google Chat
        </h3>
        <p className="text-sm text-stone-600 max-w-md mx-auto mb-6 leading-relaxed">
          Sign in with your Google Workspace account to coordinate with your travel group,
          share living itineraries into Chat spaces, and receive group consensus alerts.
        </p>

        {errorNotice && (
          <div className="mb-6 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2 text-left max-w-md mx-auto">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{errorNotice}</span>
          </div>
        )}

        <div className="flex justify-center mb-6">
          <GoogleSignInButton onClick={handleLogin} isLoading={isAuthLoading} />
        </div>

        <div className="border-t border-stone-100 pt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 mb-1">
              <Users className="w-3.5 h-3.5 text-amber-600" />
              <span>Trip Spaces</span>
            </div>
            <p className="text-[11px] text-stone-500">
              Create or select dedicated Google Chat rooms for your travel companions.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 mb-1">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span>Itinerary Sync</span>
            </div>
            <p className="text-[11px] text-stone-500">
              Broadcast day schedules and route timings to the space with confirmation.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Group Voting</span>
            </div>
            <p className="text-[11px] text-stone-500">
              Share recommendations and preference consensus reports directly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden flex flex-col md:flex-row h-[640px]">
      {/* Left Sidebar: Spaces List */}
      <div className="w-full md:w-72 bg-stone-50 border-r border-stone-200 flex flex-col">
        {/* User Card */}
        <div className="p-4 border-b border-stone-200/80 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-8 h-8 rounded-full border border-stone-200"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-amber-500 text-stone-950 font-bold text-xs flex items-center justify-center">
                {user.displayName?.charAt(0) || 'U'}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold text-stone-900 truncate">
                {user.displayName || user.email}
              </p>
              <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Connected to Chat
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title="Sign out of Google"
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Spaces Header & Action */}
        <div className="p-3 border-b border-stone-200/60 flex items-center justify-between">
          <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
            Chat Spaces ({spaces.length})
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => loadSpaces()}
              disabled={isLoadingSpaces}
              title="Refresh spaces"
              className="p-1 text-stone-500 hover:text-stone-800 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSpaces ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => setShowCreateSpace(true)}
              title="Create new space"
              className="p-1 text-amber-600 hover:bg-amber-100/60 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Spaces Scroll List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isLoadingSpaces && spaces.length === 0 ? (
            <div className="p-4 text-center text-xs text-stone-400">Loading spaces...</div>
          ) : spaces.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-xs text-stone-500 mb-2">No spaces found in your account.</p>
              <button
                type="button"
                onClick={() => setShowCreateSpace(true)}
                className="px-3 py-1.5 bg-amber-500 text-stone-950 font-bold text-xs rounded-xl shadow-2xs hover:bg-amber-600 transition-colors inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Trip Space</span>
              </button>
            </div>
          ) : (
            spaces.map((space) => {
              const isSelected = selectedSpace?.name === space.name;
              return (
                <button
                  key={space.name}
                  type="button"
                  onClick={() => handleSelectSpace(space)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-2.5 ${
                    isSelected
                      ? 'bg-amber-100/80 text-amber-950 font-bold shadow-2xs'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <MessageSquare className={`w-4 h-4 shrink-0 ${isSelected ? 'text-amber-700' : 'text-stone-400'}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate">{space.displayName || 'Unnamed Space'}</p>
                    <p className="text-[10px] text-stone-400 font-normal">
                      {space.spaceType === 'SPACE' ? 'Group Space' : 'Direct Chat'}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Quick Share Itinerary Button */}
        <div className="p-3 border-t border-stone-200/80 bg-white">
          <button
            type="button"
            onClick={handleShareItinerary}
            disabled={!selectedSpace}
            className="w-full py-2 px-3 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Share Trip Plan to Chat</span>
          </button>
        </div>
      </div>

      {/* Right Area: Active Space Messages & Chat Composer */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedSpace ? (
          <>
            {/* Space Header */}
            <div className="px-5 py-3.5 border-b border-stone-100 flex items-center justify-between bg-white">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-stone-900 truncate">
                    {selectedSpace.displayName || 'Active Space'}
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 font-medium">
                    Google Chat
                  </span>
                </div>
                {selectedSpace.spaceDetails?.description && (
                  <p className="text-xs text-stone-500 truncate mt-0.5">
                    {selectedSpace.spaceDetails.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => token && loadMessages(token, selectedSpace.name)}
                  disabled={isLoadingMessages}
                  className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
                  title="Refresh messages"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMessages ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {errorNotice && (
              <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="flex-1">{errorNotice}</span>
                <button
                  type="button"
                  onClick={() => setErrorNotice(null)}
                  className="text-amber-700 hover:text-amber-950 font-bold"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Messages Viewport */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-stone-50/50">
              {isLoadingMessages && messages.length === 0 ? (
                <div className="text-center py-12 text-xs text-stone-400">
                  Loading conversation from Google Chat...
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12 max-w-sm mx-auto">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-2">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-stone-800 mb-1">No messages in this space yet</p>
                  <p className="text-[11px] text-stone-500 mb-3">
                    Start the conversation or broadcast your trip itinerary to your travel group.
                  </p>
                  <button
                    type="button"
                    onClick={handleShareItinerary}
                    className="px-3 py-1.5 bg-amber-500 text-stone-950 font-bold text-xs rounded-xl hover:bg-amber-600 transition-colors inline-flex items-center gap-1 shadow-2xs"
                  >
                    <Calendar className="w-3 h-3 text-stone-950" />
                    <span>Post Itinerary to Space</span>
                  </button>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isCurrentUser =
                    msg.sender?.displayName?.toLowerCase() === user.displayName?.toLowerCase();

                  return (
                    <div
                      key={msg.name || index}
                      className={`flex gap-2.5 max-w-[85%] ${isCurrentUser ? 'ml-auto flex-row-reverse' : ''}`}
                    >
                      {msg.sender?.avatarUrl ? (
                        <img
                          src={msg.sender.avatarUrl}
                          alt={msg.sender.displayName || 'User'}
                          className="w-7 h-7 rounded-full border border-stone-200 shrink-0 mt-0.5"
                        />
                      ) : (
                        <div
                          className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                            isCurrentUser
                              ? 'bg-amber-500 text-stone-950'
                              : 'bg-stone-200 text-stone-700'
                          }`}
                        >
                          {msg.sender?.displayName?.charAt(0) || 'M'}
                        </div>
                      )}

                      <div>
                        <div className={`flex items-center gap-1.5 mb-1 ${isCurrentUser ? 'justify-end' : ''}`}>
                          <span className="text-[11px] font-bold text-stone-800">
                            {msg.sender?.displayName || 'Group Member'}
                          </span>
                          {msg.createTime && (
                            <span className="text-[10px] text-stone-400">
                              {new Date(msg.createTime).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          )}
                        </div>

                        <div
                          className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                            isCurrentUser
                              ? 'bg-amber-500 text-stone-950 rounded-tr-xs font-medium'
                              : 'bg-white border border-stone-200 text-stone-800 rounded-tl-xs shadow-2xs'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Composer (requires confirmation before dispatch per Workspace guidelines) */}
            <div className="p-3 border-t border-stone-200 bg-white">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleInitiateSend(inputMessage);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={`Message ${selectedSpace.displayName || 'space'}...`}
                  className="flex-1 px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-stone-400"
                />

                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-stone-950 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
              <div className="mt-1.5 flex items-center justify-between text-[10px] text-stone-400 px-1">
                <span>Google Chat workspace integration · Explicit confirmation required before posting</span>
                <span className="text-amber-600 font-medium">WayTogether Sync</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mb-3">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-stone-800 mb-1">Select or Create a Google Chat Space</h4>
            <p className="text-xs text-stone-500 max-w-xs mb-4">
              Choose an existing space from the left column or create a dedicated room for your trip.
            </p>
            <button
              type="button"
              onClick={() => setShowCreateSpace(true)}
              className="px-3.5 py-2 bg-amber-500 text-stone-950 font-bold text-xs rounded-xl shadow-2xs hover:bg-amber-600 transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Space for this Trip</span>
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal (MANDATORY per Workspace guidelines) */}
      <ConfirmSendMessageModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmSend}
        spaceName={selectedSpace?.displayName || 'Google Chat'}
        messageText={pendingText}
        isSending={isSending}
      />

      {/* Create Space Modal */}
      {showCreateSpace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-stone-200">
            <h4 className="text-sm font-bold text-stone-900 mb-1">Create New Google Chat Space</h4>
            <p className="text-xs text-stone-500 mb-4">
              Creates a collaborative Google Chat space under your Google account for this trip.
            </p>

            <form onSubmit={handleCreateSpace} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Space Display Name
                </label>
                <input
                  type="text"
                  value={newSpaceTitle}
                  onChange={(e) => setNewSpaceTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-amber-500"
                  placeholder="e.g. Ahmedabad Heritage Group"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateSpace(false)}
                  disabled={isCreatingSpace}
                  className="px-3.5 py-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingSpace || !newSpaceTitle.trim()}
                  className="px-4 py-1.5 bg-amber-500 text-stone-950 font-bold text-xs rounded-xl shadow-2xs hover:bg-amber-600 transition-colors disabled:opacity-50"
                >
                  {isCreatingSpace ? 'Creating...' : 'Create Space'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
