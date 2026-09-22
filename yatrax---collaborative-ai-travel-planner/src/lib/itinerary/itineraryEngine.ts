import { ItineraryItem, MemberPreference, Place, Trip, TripMember, AIDecisionImpact } from '../../types';
import { scorePlaceForGroup } from '../scoring/groupScoring';
import { optimizeRouteOrder } from '../routing/dijkstra';

export interface BudgetBreakdown {
  totalBudget: number;
  plannedActivitiesCost: number;
  estimatedTransportCost: number;
  estimatedFoodCost: number;
  bufferCost: number;
  totalPlannedCost: number;
  remainingBudget: number;
  isOverBudget: boolean;
}

export interface TimeConflict {
  itemAId: string;
  itemBId: string;
  placeAName: string;
  placeBName: string;
  dayNumber: number;
  message: string;
}

/**
 * Calculates budget breakdown for an itinerary
 */
export function calculateItineraryBudget(
  items: ItineraryItem[] = [],
  totalBudget: number = 5000,
  memberCount: number = 4
): BudgetBreakdown {
  const safeItems = items || [];
  const plannedActivitiesCost = safeItems.reduce((sum, item) => {
    // Activity ticket cost per person * members
    const cost = (item.place?.estimated_cost ?? item.estimated_cost ?? 0) * Math.max(1, memberCount);
    return sum + cost;
  }, 0);

  // Transport: estimate ~₹120 per travel leg between stops for group auto/taxi
  const estimatedTransportCost = Math.max(200, safeItems.length * 110);

  // Food estimate: ~₹250 per person per day (e.g. street food snacks & chai)
  const uniqueDays = new Set(safeItems.map((i) => i.day_number)).size || 1;
  const estimatedFoodCost = uniqueDays * memberCount * 220;

  const bufferCost = Math.round(totalBudget * 0.05); // 5% miscellaneous
  const totalPlannedCost = plannedActivitiesCost + estimatedTransportCost + estimatedFoodCost + bufferCost;
  const remainingBudget = totalBudget - totalPlannedCost;

  return {
    totalBudget,
    plannedActivitiesCost,
    estimatedTransportCost,
    estimatedFoodCost,
    bufferCost,
    totalPlannedCost,
    remainingBudget,
    isOverBudget: remainingBudget < 0
  };
}

/**
 * Validates time constraints and detects overlaps in itinerary schedule
 */
export function validateItinerarySchedule(items: ItineraryItem[] = []): TimeConflict[] {
  const conflicts: TimeConflict[] = [];
  const safeItems = items || [];

  const itemsByDay = new Map<number, ItineraryItem[]>();
  safeItems.forEach((item) => {
    const list = itemsByDay.get(item.day_number) || [];
    list.push(item);
    itemsByDay.set(item.day_number, list);
  });

  itemsByDay.forEach((dayItems, dayNumber) => {
    // Sort by order_index / start_time
    const sorted = [...dayItems].sort((a, b) => a.order_index - b.order_index);

    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];

      const currentEndMin = parseTimeToMinutes(current.end_time);
      const nextStartMin = parseTimeToMinutes(next.start_time);
      const travelRequiredMin = next.travel_duration || 15;

      if (currentEndMin + travelRequiredMin > nextStartMin) {
        conflicts.push({
          itemAId: current.id,
          itemBId: next.id,
          placeAName: current.place?.name || 'Previous stop',
          placeBName: next.place?.name || 'Next stop',
          dayNumber,
          message: `Insufficient travel time between ${current.place?.name || 'Stop'} (${current.end_time}) and ${next.place?.name || 'Next stop'} (${next.start_time}). Requires ${travelRequiredMin}m travel.`
        });
      }
    }
  });

  return conflicts;
}

/**
 * Helper to convert "HH:MM" string to minutes from midnight
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(':')) return 9 * 60;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Formats minutes from midnight to "HH:MM AM/PM" or 24-hour "HH:MM"
 */
export function formatMinutesToTime(totalMin: number): string {
  const normalized = Math.max(0, Math.min(23 * 60 + 59, Math.round(totalMin)));
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Builds a multi-day living itinerary from candidate places
 */
export function generateMultiDayItinerary(
  places: Place[],
  trip: Trip,
  preferences: MemberPreference[],
  addedByUserId: string
): ItineraryItem[] {
  // Compute trip duration in days
  const start = new Date(trip.start_date);
  const end = new Date(trip.end_date);
  const diffDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  const totalDays = Math.min(5, Math.max(2, isNaN(diffDays) ? 3 : diffDays));

  // Score candidate places for the whole group
  const scoredPlaces = places
    .map((p) => ({
      place: p,
      scoreData: scorePlaceForGroup(p, preferences, trip.budget)
    }))
    .sort((a, b) => b.scoreData.groupMatchScore - a.scoreData.groupMatchScore);

  // Group into days with geographical clustering
  const placesPerDay = Math.max(2, Math.min(4, Math.floor(scoredPlaces.length / totalDays)));
  const itineraryItems: ItineraryItem[] = [];

  let placeCursor = 0;

  for (let day = 1; day <= totalDays; day++) {
    const dayPlaces = scoredPlaces.slice(placeCursor, placeCursor + placesPerDay).map((sp) => sp.place);
    placeCursor += placesPerDay;

    if (dayPlaces.length === 0) break;

    // Optimize visit order with Dijkstra
    const route = optimizeRouteOrder(dayPlaces);

    // Schedule day:
    // Morning start 9:00 AM
    let currentMin = 9 * 60;

    route.orderedPlaces.forEach((place, idx) => {
      const visitDur = place.visit_duration || 60;
      const travelDur = idx === 0 ? 0 : (route.legs[idx - 1]?.travelMinutes || 20);

      currentMin += travelDur;

      // Check if passing lunch hour (13:00 - 14:00)
      if (currentMin >= 13 * 60 && currentMin < 14 * 60) {
        currentMin = 14 * 60; // 1-hour lunch break
      }

      const start_time = formatMinutesToTime(currentMin);
      currentMin += visitDur;
      const end_time = formatMinutesToTime(currentMin);

      itineraryItems.push({
        id: `itin-${day}-${place.id}-${Date.now().toString(36)}`,
        trip_id: trip.id,
        place_id: place.id,
        day_number: day,
        start_time,
        end_time,
        visit_duration: visitDur,
        travel_duration: travelDur,
        estimated_cost: place.estimated_cost,
        order_index: idx,
        added_by: addedByUserId,
        place,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    });
  }

  return itineraryItems;
}

/**
 * Re-optimizes the living itinerary when a member updates preferences or removes/replaces a place
 */
export function reoptimizeItinerary(
  currentItems: ItineraryItem[],
  allPlaces: Place[],
  trip: Trip,
  preferences: MemberPreference[],
  removedPlaceId?: string,
  addedPlaceId?: string
): {
  updatedItems: ItineraryItem[];
  impact: AIDecisionImpact;
  replacedPlaceName?: string;
  newPlaceName?: string;
} {
  const currentPlaces = currentItems.map((i) => i.place).filter(Boolean) as Place[];
  const initialScore = calculateGroupMatchScore(currentPlaces, preferences, trip.budget);
  const initialTravelMin = currentItems.reduce((acc, i) => acc + (i.travel_duration || 0), 0);
  const initialBudget = calculateItineraryBudget(currentItems, trip.budget).totalPlannedCost;

  let activePlaces = [...currentPlaces];

  let replacedName: string | undefined;
  let newName: string | undefined;

  if (removedPlaceId) {
    const removedIndex = activePlaces.findIndex((p) => p.id === removedPlaceId);
    if (removedIndex >= 0) {
      replacedName = activePlaces[removedIndex].name;
      activePlaces.splice(removedIndex, 1);
    }
  }

  if (addedPlaceId) {
    const candidate = allPlaces.find((p) => p.id === addedPlaceId);
    if (candidate && !activePlaces.some((p) => p.id === candidate.id)) {
      newName = candidate.name;
      activePlaces.push(candidate);
    }
  } else if (removedPlaceId && !addedPlaceId) {
    // Automatically find the best replacement candidate from remaining places
    const available = allPlaces.filter((p) => !activePlaces.some((ap) => ap.id === p.id));
    const scoredCandidates = available
      .map((p) => ({
        place: p,
        score: scorePlaceForGroup(p, preferences, trip.budget, activePlaces).groupMatchScore
      }))
      .sort((a, b) => b.score - a.score);

    if (scoredCandidates.length > 0) {
      const best = scoredCandidates[0].place;
      newName = best.name;
      activePlaces.push(best);
    }
  }

  // Re-generate multi-day structure
  const updatedItems = generateMultiDayItinerary(
    activePlaces,
    trip,
    preferences,
    currentItems[0]?.added_by || 'system'
  );

  const newScore = calculateGroupMatchScore(activePlaces, preferences, trip.budget);
  const newTravelMin = updatedItems.reduce((acc, i) => acc + (i.travel_duration || 0), 0);
  const newBudget = calculateItineraryBudget(updatedItems, trip.budget).totalPlannedCost;

  const budget_change = newBudget - initialBudget;
  const travel_time_change = newTravelMin - initialTravelMin;

  const summary = `${replacedName ? `Replaced ${replacedName} with ${newName || 'alternatives'}. ` : ''}${
    budget_change < 0 ? `Saved ₹${Math.abs(budget_change)}. ` : ''
  }${travel_time_change < 0 ? `${Math.abs(travel_time_change)} min less travel. ` : ''}Group consensus: ${initialScore}% → ${newScore}%.`;

  return {
    updatedItems,
    impact: {
      budget_change,
      travel_time_change,
      match_score_before: initialScore,
      match_score_after: newScore,
      summary
    },
    replacedPlaceName: replacedName,
    newPlaceName: newName
  };
}

/**
 * Calculates aggregate group match score across an entire itinerary
 */
export function calculateGroupMatchScore(
  places: Place[] = [],
  preferences: MemberPreference[] = [],
  tripBudget: number = 5000
): number {
  if (!places || places.length === 0) return 85;
  const sum = places.reduce((acc, p) => {
    return acc + scorePlaceForGroup(p, preferences, tripBudget, places).groupMatchScore;
  }, 0);
  return Math.round(sum / places.length);
}
