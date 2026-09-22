import { MemberPreference, Place, TripMember, GroupPreferenceAnalysis } from '../../types';

export interface ScoringWeights {
  interestMatch: number; // default 0.40
  budgetFit: number;     // default 0.20
  travelFit: number;     // default 0.15
  rating: number;        // default 0.10
  distance: number;      // default 0.10
  variety: number;       // default 0.05
}

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  interestMatch: 0.40,
  budgetFit: 0.20,
  travelFit: 0.15,
  rating: 0.10,
  distance: 0.10,
  variety: 0.05
};

export interface PlaceScoreBreakdown {
  placeId: string;
  interestScore: number; // 0-100
  budgetScore: number;   // 0-100
  travelScore: number;   // 0-100
  ratingScore: number;   // 0-100
  distanceScore: number; // 0-100
  varietyScore: number;  // 0-100
  groupMatchScore: number; // 0-100
  matchedTags: string[];
  matchedMembersCount: number;
}

/**
 * Calculates Haversine distance between two coordinates in kilometers
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

/**
 * Deterministically analyzes group preferences across all members
 */
export function analyzeGroupPreferences(
  members: TripMember[] = [],
  preferences: MemberPreference[] = []
): GroupPreferenceAnalysis {
  if (!preferences || preferences.length === 0) {
    return {
      top_interests: [],
      shared_interests: [],
      conflicts: [],
      unique_preferences: [],
      group_satisfaction_score: 85,
      breakdown: { coverage: 80, budget_fit: 90, time_fit: 85, route_efficiency: 85 }
    };
  }

  const interestTotals: Record<string, { totalScore: number; count: number }> = {};
  const memberInterestMap: Record<string, string[]> = {};

  (preferences || []).forEach((pref) => {
    const memberName = (members || []).find((m) => m.user_id === pref.user_id)?.profile?.full_name || 'Member';
    memberInterestMap[memberName] = pref.interests || [];

    (pref.interests || []).forEach((interest) => {
      const intensity = pref.interest_scores?.[interest] || 3;
      if (!interestTotals[interest]) {
        interestTotals[interest] = { totalScore: 0, count: 0 };
      }
      interestTotals[interest].totalScore += intensity;
      interestTotals[interest].count += 1;
    });
  });

  const maxPossibleScore = Math.max(1, (preferences?.length || 1) * 5);

  const top_interests = Object.entries(interestTotals)
    .map(([interest, data]) => {
      const percentage = Math.min(100, Math.round((data.totalScore / maxPossibleScore) * 100));
      return {
        interest,
        score: parseFloat((data.totalScore / preferences.length).toFixed(1)),
        percentage,
        count: data.count
      };
    })
    .sort((a, b) => b.percentage - a.percentage);

  // Shared interests: chosen by >= 75% of members
  const threshold = Math.ceil(preferences.length * 0.75);
  const shared_interests = top_interests
    .filter((ti) => ti.count >= threshold)
    .map((ti) => ti.interest);

  // Detect conflicts: opposing focus like Nature vs Shopping or High pace vs Relaxation
  const conflicts: Array<{ conflict: string; explanation: string; suggested_places: string[] }> = [];

  const hasNature = top_interests.some((i) => i.interest === 'Nature' && i.percentage >= 60);
  const hasHistory = top_interests.some((i) => i.interest === 'History' && i.percentage >= 60);
  const hasFood = top_interests.some((i) => i.interest === 'Food' && i.percentage >= 60);
  const hasAdventure = top_interests.some((i) => i.interest === 'Adventure' && i.percentage >= 50);

  if (hasNature && hasHistory) {
    conflicts.push({
      conflict: 'Nature ↔ History & Architecture',
      explanation: 'Some members prefer lush outdoor serenity while others prioritize historic monuments and stepwells.',
      suggested_places: ['Adalaj Stepwell', 'Sabarmati Riverfront Promenade', 'Sarkhej Roza']
    });
  }

  if (hasHistory && hasFood) {
    conflicts.push({
      conflict: 'Heritage ↔ Street Food & Nightlife',
      explanation: 'Daytime architectural exploration versus late evening culinary night markets.',
      suggested_places: ['Manek Chowk Night Market', 'Law Garden Night Bazaar']
    });
  }

  if (hasAdventure && !hasNature) {
    conflicts.push({
      conflict: 'High-Energy Attractions ↔ Quiet Contemplation',
      explanation: 'Science City / Kankaria Lake activities contrasted with Gandhi Ashram or Jain Temples.',
      suggested_places: ['Kankaria Lake', 'Gujarat Science City']
    });
  }

  // Unique preferences (interest held by only 1 person)
  const unique_preferences: Array<{ user_name: string; preference: string }> = [];
  top_interests.filter((i) => i.count === 1).forEach((item) => {
    for (const [memberName, list] of Object.entries(memberInterestMap)) {
      if (list.includes(item.interest)) {
        unique_preferences.push({ user_name: memberName, preference: item.interest });
        break;
      }
    }
  });

  // Calculate overall group satisfaction benchmark
  const avgCoverage = Math.round(
    top_interests.slice(0, 4).reduce((acc, curr) => acc + curr.percentage, 0) / Math.max(1, Math.min(4, top_interests.length))
  );

  return {
    top_interests,
    shared_interests,
    conflicts,
    unique_preferences,
    group_satisfaction_score: Math.max(70, Math.min(96, avgCoverage + 5)),
    breakdown: {
      coverage: avgCoverage,
      budget_fit: 94,
      time_fit: 89,
      route_efficiency: 88
    }
  };
}

/**
 * Computes deterministic score for a place based on all group members
 */
export function scorePlaceForGroup(
  place: Place,
  preferences: MemberPreference[] = [],
  tripBudget: number = 5000,
  existingPlaces: Place[] = [],
  referenceCoords: { lat: number; lon: number } = { lat: 23.0225, lon: 72.5714 }, // Ahmedabad central
  weights: ScoringWeights = DEFAULT_SCORING_WEIGHTS
): PlaceScoreBreakdown {
  if (!preferences || preferences.length === 0) {
    return {
      placeId: place.id,
      interestScore: 80,
      budgetScore: 90,
      travelScore: 85,
      ratingScore: Math.round(((place.rating || 4.5) / 5) * 100),
      distanceScore: 85,
      varietyScore: 85,
      groupMatchScore: 85,
      matchedTags: (place.tags || []).slice(0, 2),
      matchedMembersCount: 1
    };
  }

  // 1. Interest match (40%)
  // For each member, find how many of their interests match place tags/category
  let totalInterestMatchPercent = 0;
  const matchedTagsSet = new Set<string>();
  let membersWithAtLeastOneMatch = 0;

  (preferences || []).forEach((pref) => {
    let memberMatchScore = 0;
    let memberWeightSum = 0;

    (pref.interests || []).forEach((interest) => {
      const intensity = pref.interest_scores?.[interest] || 3;
      memberWeightSum += intensity;

      const isCategoryMatch = (place.category || '').toLowerCase() === interest.toLowerCase();
      const isTagMatch = (place.tags || []).some(
        (t) => t.toLowerCase().includes(interest.toLowerCase()) || interest.toLowerCase().includes(t.toLowerCase())
      );

      if (isCategoryMatch || isTagMatch) {
        memberMatchScore += intensity;
        matchedTagsSet.add(interest);
      }
    });

    if (memberMatchScore > 0) {
      membersWithAtLeastOneMatch++;
      const matchRatio = memberWeightSum > 0 ? memberMatchScore / memberWeightSum : 0;
      totalInterestMatchPercent += Math.min(1, matchRatio * 1.5);
    }
  });

  const interestScore = Math.min(100, Math.round((totalInterestMatchPercent / Math.max(1, preferences.length)) * 100));

  // 2. Budget fit (20%)
  // Cost evaluation against group budget
  let budgetScore = 100;
  if (place.estimated_cost === 0) {
    budgetScore = 100;
  } else {
    // If place cost is > 10% of total trip budget, penalize gradually
    const costRatio = (place.estimated_cost * preferences.length) / Math.max(1000, tripBudget);
    if (costRatio > 0.3) {
      budgetScore = Math.max(30, Math.round(100 - (costRatio - 0.3) * 150));
    } else {
      budgetScore = Math.max(70, Math.round(100 - costRatio * 50));
    }
  }

  // 3. Travel fit (15%)
  // Based on member max_travel_time tolerance
  const avgMaxTravel = (preferences && preferences.length > 0)
    ? preferences.reduce((acc, p) => acc + (p.max_travel_time || 60), 0) / preferences.length
    : 60;
  const distToCenter = calculateDistanceKm(place.latitude, place.longitude, referenceCoords.lat, referenceCoords.lon);
  const estTravelMinutes = Math.round(distToCenter * 2.5); // avg urban speed in minutes
  const travelRatio = estTravelMinutes / Math.max(30, avgMaxTravel);
  const travelScore = Math.min(100, Math.max(40, Math.round(100 - Math.max(0, travelRatio - 0.5) * 60)));

  // 4. Rating score (10%)
  const ratingScore = Math.round(((place.rating || 4.5) / 5) * 100);

  // 5. Distance score (10%)
  const distanceScore = Math.min(100, Math.max(40, Math.round(100 - distToCenter * 2.5)));

  // 6. Variety score (5%)
  // Penalize if category is already heavily represented in itinerary
  const categoryCount = (existingPlaces || []).filter((p) => p.category === place.category).length;
  const varietyScore = Math.max(30, 100 - categoryCount * 25);

  // Final weighted calculation
  const rawScore =
    interestScore * weights.interestMatch +
    budgetScore * weights.budgetFit +
    travelScore * weights.travelFit +
    ratingScore * weights.rating +
    distanceScore * weights.distance +
    varietyScore * weights.variety;

  const groupMatchScore = Math.min(99, Math.max(45, Math.round(rawScore)));

  return {
    placeId: place.id,
    interestScore,
    budgetScore,
    travelScore,
    ratingScore,
    distanceScore,
    varietyScore,
    groupMatchScore,
    matchedTags: Array.from(matchedTagsSet),
    matchedMembersCount: membersWithAtLeastOneMatch
  };
}
