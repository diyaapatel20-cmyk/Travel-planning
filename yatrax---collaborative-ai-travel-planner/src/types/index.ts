export type Role = 'OWNER' | 'EDITOR' | 'VIEWER';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  start_date: string;
  end_date: string;
  budget: number;
  currency: string;
  transport: 'Walking' | 'Public Transport' | 'Bike' | 'Car' | 'Taxi';
  invite_code: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TripMember {
  id: string;
  trip_id: string;
  user_id: string;
  role: Role;
  joined_at: string;
  profile: UserProfile;
}

export interface MemberPreference {
  id: string;
  trip_id: string;
  user_id: string;
  interests: string[];
  interest_scores: Record<string, number>; // 1-5 scale
  budget_preference: 'Budget Friendly' | 'Moderate' | 'Premium';
  max_travel_time: number; // in minutes (30, 60, 90, 120)
  transport: 'Walking' | 'Public Transport' | 'Bike' | 'Car' | 'Taxi';
  restrictions: string[];
  updated_at: string;
}

export interface Place {
  id: string;
  name: string;
  destination: string;
  category: 'Heritage' | 'Nature' | 'Food' | 'Culture' | 'Architecture' | 'Photography' | 'Adventure' | 'Spiritual';
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  estimated_cost: number; // in INR
  visit_duration: number; // in minutes
  rating: number; // 1-5
  opening_time: string; // e.g. "09:00"
  closing_time: string; // e.g. "18:00"
  tags: string[];
  image_url: string;
  created_at: string;
}

export interface ItineraryItem {
  id: string;
  trip_id: string;
  place_id: string;
  day_number: number; // 1, 2, 3...
  start_time: string; // "09:00"
  end_time: string; // "10:30"
  visit_duration: number; // minutes
  travel_duration: number; // travel time from previous stop in minutes
  estimated_cost: number;
  order_index: number;
  added_by: string;
  place?: Place;
  created_at: string;
  updated_at: string;
}

export interface AIRecommendation {
  place_id: string;
  group_match_score: number; // 0 - 100
  reason: string;
  matched_preferences: string[];
  estimated_cost: number;
  visit_duration: number;
  travel_duration: number;
  place?: Place;
}

export interface AIDecisionImpact {
  budget_change: number; // e.g. -420 (saved 420)
  travel_time_change: number; // e.g. -12 (12 min less)
  match_score_before: number;
  match_score_after: number;
  summary: string;
}

export interface AIAction {
  type: 'ADD_PLACE' | 'REMOVE_PLACE' | 'REPLACE_PLACE' | 'GENERATE_ITINERARY' | 'UPDATE_PREFERENCE' | 'CHANGE_BUDGET' | 'OPTIMIZE_ROUTE';
  target_place_id?: string;
  replacement_place_id?: string;
  day_number?: number;
  new_budget?: number;
  user_id?: string;
  impact?: AIDecisionImpact;
}

export interface AIResponse {
  intent: 'GENERAL_QUERY' | 'GENERATE_ITINERARY' | 'SUGGEST_PLACES' | 'ADD_PLACE' | 'REMOVE_PLACE' | 'REPLACE_PLACE' | 'UPDATE_PREFERENCE' | 'CHANGE_BUDGET' | 'CHANGE_TIME' | 'OPTIMIZE_ITINERARY' | 'ROUTE_REQUEST' | 'CONFIRM_ACTION';
  message: string;
  recommendations?: AIRecommendation[];
  action?: AIAction | null;
  requires_reoptimization: boolean;
  constraints_checked: {
    budget: boolean;
    time: boolean;
    travel: boolean;
    restrictions: boolean;
  };
  impact?: AIDecisionImpact;
}

export interface ChatMessage {
  id: string;
  trip_id: string;
  user_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
  user_name?: string;
  user_avatar?: string;
  recommendations?: AIRecommendation[];
  impact?: AIDecisionImpact;
  action?: AIAction | null;
}

export interface TripEvent {
  id: string;
  trip_id: string;
  user_id: string;
  event_type: 'MEMBER_JOINED' | 'PREFERENCE_UPDATED' | 'ITINERARY_GENERATED' | 'PLACE_ADDED' | 'PLACE_REMOVED' | 'PLACE_REPLACED' | 'BUDGET_CHANGED' | 'ROUTE_OPTIMIZED';
  metadata: {
    description: string;
    details?: string;
    place_name?: string;
    old_place_name?: string;
    amount?: number;
    impact?: AIDecisionImpact;
  };
  created_at: string;
  user_name?: string;
  user_avatar?: string;
}

export interface AIDecision {
  id: string;
  trip_id: string;
  user_id: string;
  intent: string;
  action: string;
  reason: string;
  created_at: string;
}

export interface GroupPreferenceAnalysis {
  top_interests: Array<{ interest: string; score: number; percentage: number; count: number }>;
  shared_interests: string[];
  conflicts: Array<{ conflict: string; explanation: string; suggested_places: string[] }>;
  unique_preferences: Array<{ user_name: string; preference: string }>;
  group_satisfaction_score: number;
  breakdown: {
    coverage: number;
    budget_fit: number;
    time_fit: number;
    route_efficiency: number;
  };
}

export interface GroupAIContextData {
  trip_id: string;
  trip_name: string;
  destination: string;
  dates: string;
  total_budget: number;
  planned_cost: number;
  remaining_budget: number;
  member_count: number;
  top_interests: Array<{ interest: string; percentage: number }>;
  constraints: string[];
  recent_decisions: string[];
  itinerary_count: number;
  group_match_score: number;
}
