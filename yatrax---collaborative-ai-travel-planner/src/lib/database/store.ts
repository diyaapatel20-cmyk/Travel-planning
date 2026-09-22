import {
  Trip,
  TripMember,
  MemberPreference,
  ItineraryItem,
  ChatMessage,
  TripEvent,
  UserProfile,
  Place,
  AIDecision
} from '../../types';
import { AHMEDABAD_PLACES } from '../../data/places';
import { generateMultiDayItinerary } from '../itinerary/itineraryEngine';

// Seed demo users
export const DEMO_USERS: UserProfile[] = [
  {
    id: 'user-diya',
    full_name: 'Diya Patel',
    email: 'diyaapatel20@gmail.com',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'user-rahul',
    full_name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'user-ananya',
    full_name: 'Ananya Iyer',
    email: 'ananya.iyer@example.com',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'user-dev',
    full_name: 'Dev Mehta',
    email: 'dev.mehta@example.com',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  }
];

export const DEMO_TRIP_ID = 'trip-ahmedabad-sih';

const DEMO_TRIP: Trip = {
  id: DEMO_TRIP_ID,
  name: 'Ahmedabad Heritage & Discovery',
  destination: 'Ahmedabad',
  start_date: '2026-10-12',
  end_date: '2026-10-14',
  budget: 5000,
  currency: 'INR',
  transport: 'Taxi',
  invite_code: 'YTX-8K4P',
  created_by: 'user-diya',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z'
};

const DEMO_MEMBERS: TripMember[] = [
  {
    id: 'tm-diya',
    trip_id: DEMO_TRIP_ID,
    user_id: 'user-diya',
    role: 'OWNER',
    joined_at: '2026-01-01T00:00:00Z',
    profile: DEMO_USERS[0]
  },
  {
    id: 'tm-rahul',
    trip_id: DEMO_TRIP_ID,
    user_id: 'user-rahul',
    role: 'EDITOR',
    joined_at: '2026-01-01T00:00:00Z',
    profile: DEMO_USERS[1]
  },
  {
    id: 'tm-ananya',
    trip_id: DEMO_TRIP_ID,
    user_id: 'user-ananya',
    role: 'EDITOR',
    joined_at: '2026-01-01T00:00:00Z',
    profile: DEMO_USERS[2]
  },
  {
    id: 'tm-dev',
    trip_id: DEMO_TRIP_ID,
    user_id: 'user-dev',
    role: 'EDITOR',
    joined_at: '2026-01-01T00:00:00Z',
    profile: DEMO_USERS[3]
  }
];

const DEMO_PREFERENCES: MemberPreference[] = [
  {
    id: 'pref-diya',
    trip_id: DEMO_TRIP_ID,
    user_id: 'user-diya',
    interests: ['History', 'Culture', 'Photography'],
    interest_scores: { History: 5, Culture: 4, Photography: 4 },
    budget_preference: 'Moderate',
    max_travel_time: 60,
    transport: 'Taxi',
    restrictions: ['Vegetarian'],
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'pref-rahul',
    trip_id: DEMO_TRIP_ID,
    user_id: 'user-rahul',
    interests: ['Nature', 'Photography', 'Adventure'],
    interest_scores: { Nature: 5, Photography: 5, Adventure: 3 },
    budget_preference: 'Moderate',
    max_travel_time: 60,
    transport: 'Taxi',
    restrictions: [],
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'pref-ananya',
    trip_id: DEMO_TRIP_ID,
    user_id: 'user-ananya',
    interests: ['Food', 'Culture', 'Shopping'],
    interest_scores: { Food: 5, Culture: 4, Shopping: 3 },
    budget_preference: 'Budget Friendly',
    max_travel_time: 60,
    transport: 'Public Transport',
    restrictions: ['Vegetarian'],
    updated_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'pref-dev',
    trip_id: DEMO_TRIP_ID,
    user_id: 'user-dev',
    interests: ['History', 'Architecture'],
    interest_scores: { History: 4, Architecture: 4 },
    budget_preference: 'Budget Friendly',
    max_travel_time: 30,
    transport: 'Car',
    restrictions: ['Avoid crowded places'],
    updated_at: '2026-01-01T00:00:00Z'
  }
];

// Initial 3-day itinerary items
const INITIAL_PLACES: Place[] = [
  AHMEDABAD_PLACES[0], // Sabarmati Ashram
  AHMEDABAD_PLACES[4], // Sidi Saiyyed Mosque
  AHMEDABAD_PLACES[6], // Manek Chowk Night Market
  AHMEDABAD_PLACES[2], // Kankaria Lake
  AHMEDABAD_PLACES[8], // Sabarmati Riverfront Promenade
  AHMEDABAD_PLACES[7], // Law Garden Night Bazaar
  AHMEDABAD_PLACES[9]  // Hutheesing Jain Temple
];

const INITIAL_ITINERARY: ItineraryItem[] = generateMultiDayItinerary(
  INITIAL_PLACES,
  DEMO_TRIP,
  DEMO_PREFERENCES,
  'user-diya'
);

const INITIAL_EVENTS: TripEvent[] = [
  {
    id: 'ev-1',
    trip_id: DEMO_TRIP_ID,
    user_id: 'user-diya',
    event_type: 'MEMBER_JOINED',
    metadata: { description: 'Diya Patel created the journey for Ahmedabad' },
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    user_name: 'Diya Patel'
  },
  {
    id: 'ev-2',
    trip_id: DEMO_TRIP_ID,
    user_id: 'user-rahul',
    event_type: 'MEMBER_JOINED',
    metadata: { description: 'Rahul Sharma joined via invite code YTX-8K4P' },
    created_at: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    user_name: 'Rahul Sharma'
  },
  {
    id: 'ev-3',
    trip_id: DEMO_TRIP_ID,
    user_id: 'user-ananya',
    event_type: 'PREFERENCE_UPDATED',
    metadata: { description: 'Ananya added top interest in Food and Gujarati street dining' },
    created_at: new Date(Date.now() - 3600000).toISOString(),
    user_name: 'Ananya Iyer'
  },
  {
    id: 'ev-4',
    trip_id: DEMO_TRIP_ID,
    user_id: 'system',
    event_type: 'ITINERARY_GENERATED',
    metadata: { description: 'WayTogether AI synthesized the initial 3-day living itinerary (7 stops)' },
    created_at: new Date(Date.now() - 1800000).toISOString(),
    user_name: 'WayTogether AI'
  }
];

const INITIAL_CHAT: ChatMessage[] = [
  {
    id: 'msg-1',
    trip_id: DEMO_TRIP_ID,
    user_id: 'system',
    role: 'system',
    content: 'Welcome to your collaborative workspace! WayTogether AI is connected and listening to the whole group.',
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'msg-2',
    trip_id: DEMO_TRIP_ID,
    user_id: 'user-diya',
    role: 'user',
    content: 'Hey everyone! Let’s plan our 3-day Ahmedabad trip under ₹5,000.',
    created_at: new Date(Date.now() - 2400000).toISOString(),
    user_name: 'Diya Patel',
    user_avatar: DEMO_USERS[0].avatar_url
  },
  {
    id: 'msg-3',
    trip_id: DEMO_TRIP_ID,
    user_id: 'assistant',
    role: 'assistant',
    content: 'Hello Diya, Rahul, Ananya, and Dev! I’ve analyzed your shared preferences. Diya and Dev love heritage & architecture (88%), Rahul prioritizes nature & photography (76%), and Ananya wants authentic food (71%). I scheduled Sabarmati Ashram, Sidi Saiyyed Mosque, Riverfront, and Manek Chowk to balance all interests while keeping transport under 60 minutes.',
    created_at: new Date(Date.now() - 2000000).toISOString()
  }
];

// BroadcastChannel for cross-tab multiplayer sync
let realtimeChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    realtimeChannel = new BroadcastChannel('waytogether_realtime_sync');
  }
} catch (e) {
  console.warn('BroadcastChannel not supported in current environment', e);
}

export class AppDataStore {
  private static instance: AppDataStore;
  private subscribers: Set<() => void> = new Set();

  currentUser: UserProfile = DEMO_USERS[0];
  trips: Trip[] = [DEMO_TRIP];
  members: TripMember[] = [...DEMO_MEMBERS];
  preferences: MemberPreference[] = [...DEMO_PREFERENCES];
  itinerary: ItineraryItem[] = [...INITIAL_ITINERARY];
  chat: ChatMessage[] = [...INITIAL_CHAT];
  events: TripEvent[] = [...INITIAL_EVENTS];
  decisions: AIDecision[] = [];
  places: Place[] = [...AHMEDABAD_PLACES];

  private constructor() {
    this.loadFromStorage();
    if (realtimeChannel) {
      realtimeChannel.onmessage = (event) => {
        if (event.data && event.data.type === 'STATE_SYNC') {
          this.syncFromExternal(event.data.payload);
        }
      };
    }
  }

  static getInstance(): AppDataStore {
    if (!AppDataStore.instance) {
      AppDataStore.instance = new AppDataStore();
    }
    return AppDataStore.instance;
  }

  subscribe(callback: () => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notify() {
    this.saveToStorage();
    this.subscribers.forEach((cb) => cb());
    if (realtimeChannel) {
      realtimeChannel.postMessage({
        type: 'STATE_SYNC',
        payload: {
          trips: this.trips,
          members: this.members,
          preferences: this.preferences,
          itinerary: this.itinerary,
          chat: this.chat,
          events: this.events,
          decisions: this.decisions
        }
      });
    }
  }

  private syncFromExternal(data: any) {
    if (!data) return;
    if (data.trips) this.trips = data.trips;
    if (data.members) this.members = data.members;
    if (data.preferences) this.preferences = data.preferences;
    if (data.itinerary) {
      this.itinerary = data.itinerary.map((item: ItineraryItem) => ({
        ...item,
        place: item.place || this.places.find((p) => p.id === item.place_id)
      }));
    }
    if (data.chat) this.chat = data.chat;
    if (data.events) this.events = data.events;
    if (data.decisions) this.decisions = data.decisions;
    this.subscribers.forEach((cb) => cb());
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('waytogether_db_state') || localStorage.getItem('yatrax_db_state');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.currentUser) this.currentUser = parsed.currentUser;
        if (parsed.trips?.length) this.trips = parsed.trips;
        if (parsed.members?.length) this.members = parsed.members;
        if (parsed.preferences?.length) this.preferences = parsed.preferences;
        if (parsed.itinerary?.length) {
          this.itinerary = parsed.itinerary.map((item: ItineraryItem) => ({
            ...item,
            place: item.place || this.places.find((p) => p.id === item.place_id)
          }));
        }
        if (parsed.chat?.length) this.chat = parsed.chat;
        if (parsed.events?.length) this.events = parsed.events;
        if (parsed.decisions?.length) this.decisions = parsed.decisions;
      }
    } catch (e) {
      console.error('Failed to load from localStorage', e);
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(
        'waytogether_db_state',
        JSON.stringify({
          currentUser: this.currentUser,
          trips: this.trips,
          members: this.members,
          preferences: this.preferences,
          itinerary: this.itinerary,
          chat: this.chat,
          events: this.events,
          decisions: this.decisions
        })
      );
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }

  // Authentication & Profile
  setCurrentUser(user: UserProfile) {
    this.currentUser = user;
    this.notify();
  }

  registerUser(fullName: string, email: string): UserProfile {
    const newUser: UserProfile = {
      id: `user-${Date.now().toString(36)}`,
      full_name: fullName,
      email,
      avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(fullName)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.currentUser = newUser;
    this.notify();
    return newUser;
  }

  // Trip Management
  createTrip(tripData: Omit<Trip, 'id' | 'created_by' | 'created_at' | 'updated_at' | 'invite_code'>): Trip {
    const newTrip: Trip = {
      ...tripData,
      id: `trip-${Date.now().toString(36)}`,
      created_by: this.currentUser.id,
      invite_code: `YTX-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.trips.push(newTrip);

    // Add current user as OWNER member
    const newMember: TripMember = {
      id: `tm-${Date.now().toString(36)}`,
      trip_id: newTrip.id,
      user_id: this.currentUser.id,
      role: 'OWNER',
      joined_at: new Date().toISOString(),
      profile: this.currentUser
    };
    this.members.push(newMember);

    // Add default preference
    this.preferences.push({
      id: `pref-${Date.now().toString(36)}`,
      trip_id: newTrip.id,
      user_id: this.currentUser.id,
      interests: ['History', 'Culture', 'Food'],
      interest_scores: { History: 4, Culture: 4, Food: 4 },
      budget_preference: 'Moderate',
      max_travel_time: 60,
      transport: newTrip.transport,
      restrictions: [],
      updated_at: new Date().toISOString()
    });

    this.addEvent(newTrip.id, 'MEMBER_JOINED', {
      description: `${this.currentUser.full_name} created the journey ${newTrip.name}`
    });

    this.notify();
    return newTrip;
  }

  joinTripByCode(inviteCode: string): Trip | null {
    const trip = this.trips.find((t) => t.invite_code.toUpperCase() === inviteCode.trim().toUpperCase());
    if (!trip) return null;

    const existing = this.members.find((m) => m.trip_id === trip.id && m.user_id === this.currentUser.id);
    if (!existing) {
      this.members.push({
        id: `tm-${Date.now().toString(36)}`,
        trip_id: trip.id,
        user_id: this.currentUser.id,
        role: 'EDITOR',
        joined_at: new Date().toISOString(),
        profile: this.currentUser
      });

      this.preferences.push({
        id: `pref-${Date.now().toString(36)}`,
        trip_id: trip.id,
        user_id: this.currentUser.id,
        interests: ['Nature', 'Culture', 'Food'],
        interest_scores: { Nature: 4, Culture: 3, Food: 4 },
        budget_preference: 'Moderate',
        max_travel_time: 60,
        transport: 'Taxi',
        restrictions: [],
        updated_at: new Date().toISOString()
      });

      this.addEvent(trip.id, 'MEMBER_JOINED', {
        description: `${this.currentUser.full_name} joined the journey`
      });
      this.notify();
    }
    return trip;
  }

  updateTripDetails(tripId: string, updates: Partial<Trip>) {
    const index = this.trips.findIndex((t) => t.id === tripId);
    if (index >= 0) {
      this.trips[index] = { ...this.trips[index], ...updates, updated_at: new Date().toISOString() };
      this.addEvent(tripId, 'BUDGET_CHANGED', {
        description: `Trip details updated (Budget: ₹${this.trips[index].budget})`
      });
      this.notify();
    }
  }

  deleteTrip(tripId: string) {
    this.trips = this.trips.filter((t) => t.id !== tripId);
    this.members = this.members.filter((m) => m.trip_id !== tripId);
    this.preferences = this.preferences.filter((p) => p.trip_id !== tripId);
    this.itinerary = this.itinerary.filter((i) => i.trip_id !== tripId);
    this.events = this.events.filter((e) => e.trip_id !== tripId);
    this.chat = this.chat.filter((c) => c.trip_id !== tripId);
    this.decisions = this.decisions.filter((d) => d.trip_id !== tripId);
    this.notify();
  }

  updateMemberPreference(tripId: string, userId: string, updates: Partial<MemberPreference>) {
    const index = this.preferences.findIndex((p) => p.trip_id === tripId && p.user_id === userId);
    const memberName = this.members.find((m) => m.user_id === userId)?.profile.full_name || 'Member';

    if (index >= 0) {
      this.preferences[index] = { ...this.preferences[index], ...updates, updated_at: new Date().toISOString() };
    } else {
      this.preferences.push({
        id: `pref-${Date.now().toString(36)}`,
        trip_id: tripId,
        user_id: userId,
        interests: updates.interests || ['History'],
        interest_scores: updates.interest_scores || { History: 4 },
        budget_preference: updates.budget_preference || 'Moderate',
        max_travel_time: updates.max_travel_time || 60,
        transport: updates.transport || 'Taxi',
        restrictions: updates.restrictions || [],
        updated_at: new Date().toISOString()
      });
    }

    const updatedInterests = updates.interests?.join(', ') || 'travel priorities';
    this.addEvent(tripId, 'PREFERENCE_UPDATED', {
      description: `${memberName} updated preferences: ${updatedInterests}`
    });

    this.notify();
  }

  // Itinerary operations
  setItinerary(tripId: string, items: ItineraryItem[]) {
    this.itinerary = items;
    this.notify();
  }

  addItineraryItem(tripId: string, placeId: string, dayNumber: number = 1): ItineraryItem | null {
    const place = this.places.find((p) => p.id === placeId);
    if (!place) return null;

    const dayItems = this.itinerary.filter((i) => i.day_number === dayNumber);
    const newItem: ItineraryItem = {
      id: `itin-${dayNumber}-${place.id}-${Date.now().toString(36)}`,
      trip_id: tripId,
      place_id: place.id,
      day_number: dayNumber,
      start_time: '16:00',
      end_time: '17:30',
      visit_duration: place.visit_duration || 60,
      travel_duration: 15,
      estimated_cost: place.estimated_cost,
      order_index: dayItems.length,
      added_by: this.currentUser.id,
      place,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.itinerary.push(newItem);
    this.addEvent(tripId, 'PLACE_ADDED', {
      description: `${this.currentUser.full_name} added ${place.name} to Day ${dayNumber}`,
      place_name: place.name
    });
    this.notify();
    return newItem;
  }

  removeItineraryItem(tripId: string, itemId: string) {
    const item = this.itinerary.find((i) => i.id === itemId);
    const placeName = item?.place?.name || 'Place';
    this.itinerary = this.itinerary.filter((i) => i.id !== itemId);
    this.addEvent(tripId, 'PLACE_REMOVED', {
      description: `${this.currentUser.full_name} removed ${placeName} from the itinerary`,
      place_name: placeName
    });
    this.notify();
  }

  replaceItineraryItem(tripId: string, oldItemId: string, newPlaceId: string) {
    const oldItem = this.itinerary.find((i) => i.id === oldItemId);
    const newPlace = this.places.find((p) => p.id === newPlaceId);
    if (!oldItem || !newPlace) return;

    const oldName = oldItem.place?.name || 'Previous place';
    oldItem.place_id = newPlace.id;
    oldItem.place = newPlace;
    oldItem.estimated_cost = newPlace.estimated_cost;
    oldItem.visit_duration = newPlace.visit_duration;
    oldItem.updated_at = new Date().toISOString();

    this.addEvent(tripId, 'PLACE_REPLACED', {
      description: `Replaced ${oldName} with ${newPlace.name}`,
      place_name: newPlace.name,
      old_place_name: oldName
    });
    this.notify();
  }

  // Chat & Events
  addChatMessage(tripId: string, message: Omit<ChatMessage, 'id' | 'created_at'>): ChatMessage {
    const newMsg: ChatMessage = {
      ...message,
      id: `msg-${Date.now().toString(36)}`,
      created_at: new Date().toISOString()
    };
    this.chat.push(newMsg);
    this.notify();
    return newMsg;
  }

  addEvent(tripId: string, type: TripEvent['event_type'], metadata: TripEvent['metadata']) {
    const newEvent: TripEvent = {
      id: `ev-${Date.now().toString(36)}`,
      trip_id: tripId,
      user_id: this.currentUser.id,
      event_type: type,
      metadata,
      created_at: new Date().toISOString(),
      user_name: this.currentUser.full_name,
      user_avatar: this.currentUser.avatar_url
    };
    this.events.unshift(newEvent);
  }

  addDecision(tripId: string, intent: string, action: string, reason: string) {
    const decision: AIDecision = {
      id: `dec-${Date.now().toString(36)}`,
      trip_id: tripId,
      user_id: this.currentUser.id,
      intent,
      action,
      reason,
      created_at: new Date().toISOString()
    };
    this.decisions.unshift(decision);
    this.notify();
  }

  resetToDemo() {
    this.currentUser = DEMO_USERS[0];
    this.trips = [{ ...DEMO_TRIP }];
    this.members = [...DEMO_MEMBERS];
    this.preferences = JSON.parse(JSON.stringify(DEMO_PREFERENCES));
    this.itinerary = generateMultiDayItinerary(INITIAL_PLACES, DEMO_TRIP, DEMO_PREFERENCES, 'user-diya');
    this.events = [...INITIAL_EVENTS];
    this.chat = [...INITIAL_CHAT];
    this.decisions = [];
    this.notify();
  }
}

export const appStore = AppDataStore.getInstance();
