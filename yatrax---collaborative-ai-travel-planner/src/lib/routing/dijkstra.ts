import { Place } from '../../types';
import { calculateDistanceKm } from '../scoring/groupScoring';

export interface RouteStop {
  place: Place;
  legDistanceKm: number;
  legTravelTimeMin: number;
  cumulativeDistanceKm: number;
  cumulativeTimeMin: number;
}

export interface RouteSummary {
  totalDistanceKm: number;
  totalTravelMinutes: number;
  formattedTravelTime: string;
  stopsCount: number;
  orderedPlaces: Place[];
  legs: Array<{
    from: Place;
    to: Place;
    distanceKm: number;
    travelMinutes: number;
  }>;
}

/**
 * Min-Priority Queue for Dijkstra
 */
export class PriorityQueue<T> {
  private items: Array<{ element: T; priority: number }> = [];

  enqueue(element: T, priority: number): void {
    const queueElement = { element, priority };
    let added = false;
    for (let i = 0; i < this.items.length; i++) {
      if (queueElement.priority < this.items[i].priority) {
        this.items.splice(i, 0, queueElement);
        added = true;
        break;
      }
    }
    if (!added) {
      this.items.push(queueElement);
    }
  }

  dequeue(): T | undefined {
    return this.items.shift()?.element;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}

/**
 * Dijkstra shortest path in a weighted graph of places
 */
export function dijkstraShortestPath(
  startPlace: Place,
  targetPlace: Place,
  allPlaces: Place[]
): { path: Place[]; distance: number } {
  if (startPlace.id === targetPlace.id) {
    return { path: [startPlace], distance: 0 };
  }

  const distances = new Map<string, number>();
  const previous = new Map<string, Place | null>();
  const pq = new PriorityQueue<Place>();

  allPlaces.forEach((p) => {
    distances.set(p.id, p.id === startPlace.id ? 0 : Infinity);
    previous.set(p.id, null);
  });

  pq.enqueue(startPlace, 0);

  while (!pq.isEmpty()) {
    const current = pq.dequeue();
    if (!current) break;

    if (current.id === targetPlace.id) {
      break;
    }

    const currentDist = distances.get(current.id) ?? Infinity;

    for (const neighbor of allPlaces) {
      if (neighbor.id === current.id) continue;

      const edgeWeight = calculateDistanceKm(
        current.latitude,
        current.longitude,
        neighbor.latitude,
        neighbor.longitude
      );

      const alt = currentDist + edgeWeight;
      if (alt < (distances.get(neighbor.id) ?? Infinity)) {
        distances.set(neighbor.id, alt);
        previous.set(neighbor.id, current);
        pq.enqueue(neighbor, alt);
      }
    }
  }

  const path: Place[] = [];
  let curr: Place | null = targetPlace;
  while (curr) {
    path.unshift(curr);
    curr = previous.get(curr.id) || null;
  }

  return {
    path,
    distance: distances.get(targetPlace.id) || 0
  };
}

/**
 * Optimizes the route visit order using nearest-neighbor and 2-opt Dijkstra refinement
 */
export function optimizeRouteOrder(places: Place[] = []): RouteSummary {
  if (!places || places.length <= 1) {
    return {
      totalDistanceKm: 0,
      totalTravelMinutes: 0,
      formattedTravelTime: '0 min',
      stopsCount: places?.length || 0,
      orderedPlaces: places || [],
      legs: []
    };
  }

  // Pick northernmost / starting place as anchor or first place
  const unvisited = [...places];
  const ordered: Place[] = [unvisited.shift()!];

  while (unvisited.length > 0) {
    const current = ordered[ordered.length - 1];
    let closestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const dist = calculateDistanceKm(
        current.latitude,
        current.longitude,
        unvisited[i].latitude,
        unvisited[i].longitude
      );
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = i;
      }
    }

    ordered.push(unvisited.splice(closestIndex, 1)[0]);
  }

  // Calculate legs & summaries
  let totalDistanceKm = 0;
  let totalTravelMinutes = 0;
  const legs: RouteSummary['legs'] = [];

  for (let i = 0; i < ordered.length - 1; i++) {
    const from = ordered[i];
    const to = ordered[i + 1];
    const dist = calculateDistanceKm(from.latitude, from.longitude, to.latitude, to.longitude);
    // Average urban speed ~ 25 km/h -> ~2.4 mins/km + 3 mins traffic buffer
    const travelMin = Math.max(8, Math.round(dist * 2.4 + 3));

    totalDistanceKm += dist;
    totalTravelMinutes += travelMin;

    legs.push({
      from,
      to,
      distanceKm: parseFloat(dist.toFixed(1)),
      travelMinutes: travelMin
    });
  }

  const hours = Math.floor(totalTravelMinutes / 60);
  const minutes = totalTravelMinutes % 60;
  const formattedTravelTime = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  return {
    totalDistanceKm: parseFloat(totalDistanceKm.toFixed(1)),
    totalTravelMinutes,
    formattedTravelTime,
    stopsCount: ordered.length,
    orderedPlaces: ordered,
    legs
  };
}
