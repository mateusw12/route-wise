"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Marker, Popup } from "react-leaflet";
import type { GeocodingResultDto } from "@/libs/dtos/geocoding.dto";
import type { RouteResponseDto } from "@/libs/dtos/routing.dto";
import { RoutingService } from "@/libs/services/routing.service";
import { useGeolocation } from "@/hooks/useGeolocation";
import type { MarkerPoint } from "@/types/map";
import { SearchBox, type SearchTarget } from "@/components/search/SearchBox";
import { RouteLayer } from "@/components/map/RouteLayer";
import { UserLocation } from "@/components/map/UserLocation";
import { MapClickMarkerLayer } from "@/components/map/MapClickMarkerLayer";
import { AuthButton } from "@/components/auth/AuthButton";

const MAX_WAYPOINTS = 4;
const MAX_RECENT_SEARCHES = 8;
const SEARCH_HISTORY_KEY = "routewise:search-history";

const MapView = dynamic(
  () => import("@/components/map/MapView").then((module) => module.MapView),
  { ssr: false },
);

function formatDistanceMeters(distance: number) {
  if (distance < 1000) {
    return `${Math.round(distance)} m`;
  }

  return `${(distance / 1000).toFixed(1)} km`;
}

function formatDurationSeconds(duration: number) {
  const totalMinutes = Math.round(duration / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }

  return `${minutes} min`;
}

export function MapDashboard() {
  const { position, error: geoError } = useGeolocation();
  const [start, setStart] = useState<GeocodingResultDto | null>(null);
  const [end, setEnd] = useState<GeocodingResultDto | null>(null);
  const [waypoints, setWaypoints] = useState<(GeocodingResultDto | null)[]>([]);
  const [recentSearches, setRecentSearches] = useState<GeocodingResultDto[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const raw = window.localStorage.getItem(SEARCH_HISTORY_KEY);
      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw) as GeocodingResultDto[];
      return parsed.slice(0, MAX_RECENT_SEARCHES);
    } catch {
      return [];
    }
  });
  const [route, setRoute] = useState<RouteResponseDto | null>(null);
  const [isRouting, setIsRouting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markers, setMarkers] = useState<MarkerPoint[]>([]);

  function saveRecentSearch(location: GeocodingResultDto) {
    setRecentSearches((current) => {
      const deduplicated = current.filter((item) => item.placeId !== location.placeId);
      const next = [location, ...deduplicated].slice(0, MAX_RECENT_SEARCHES);
      window.localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  }

  const center = useMemo<[number, number]>(() => {
    if (position) {
      return position;
    }

    if (start) {
      return [start.lat, start.lon];
    }

    return [-26.48, -49.07];
  }, [position, start]);

  async function buildRoute() {
    if (!start || !end) {
      setError("Selecione origem e destino para tracar a rota.");
      return;
    }

    try {
      setIsRouting(true);
      setError(null);

      const result = await RoutingService.getRoute({
        start: [start.lat, start.lon],
        end: [end.lat, end.lon],
        waypoints: waypoints
          .filter((item): item is GeocodingResultDto => Boolean(item))
          .map((item) => [item.lat, item.lon]),
      });

      setRoute(result);
    } catch {
      setError("Nao foi possivel calcular a rota agora. Tente novamente.");
    } finally {
      setIsRouting(false);
    }
  }

  function handleSelect(target: SearchTarget, location: GeocodingResultDto) {
    setError(null);
    setRoute(null);
    saveRecentSearch(location);

    if (target.type === "start") {
      setStart(location);
      return;
    }

    if (target.type === "end") {
      setEnd(location);
      return;
    }

    setWaypoints((current) => {
      const next = [...current];
      next[target.index] = location;
      return next;
    });
  }

  function handleAddMarker(coords: [number, number]) {
    const point: MarkerPoint = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      coords,
    };

    setMarkers((current) => [...current, point]);
  }

  function addWaypoint() {
    setRoute(null);
    setWaypoints((current) => {
      if (current.length >= MAX_WAYPOINTS) {
        return current;
      }

      return [...current, null];
    });
  }

  function removeWaypoint(index: number) {
    setRoute(null);
    setWaypoints((current) => current.filter((_, currentIndex) => currentIndex !== index));
  }

  return (
    <main className="page-shell">
      <section className="map-stage">
        <div className="auth-floating">
          <AuthButton />
        </div>

        <SearchBox
          waypointCount={waypoints.length}
          recentSearches={recentSearches}
          onSelect={handleSelect}
          onAddWaypoint={addWaypoint}
          onRemoveWaypoint={removeWaypoint}
          onBuildRoute={buildRoute}
          isRouting={isRouting}
        />

        {geoError && <div className="toast-warning">{geoError}</div>}
        {error && <div className="toast-error">{error}</div>}

        {route && (
          <div className="route-summary">
            <p>
              Distancia: <strong>{formatDistanceMeters(route.summary.distance)}</strong>
            </p>
            <p>
              Tempo estimado: <strong>{formatDurationSeconds(route.summary.duration)}</strong>
            </p>
            <p>
              Paradas: <strong>{waypoints.filter((item) => Boolean(item)).length}</strong>
            </p>
          </div>
        )}

        <MapView center={center}>
          {position && <UserLocation position={position} />}

          {start && (
            <Marker position={[start.lat, start.lon]}>
              <Popup>Origem selecionada</Popup>
            </Marker>
          )}

          {end && (
            <Marker position={[end.lat, end.lon]}>
              <Popup>Destino selecionado</Popup>
            </Marker>
          )}

          {waypoints.map(
            (waypoint, index) =>
              waypoint && (
                <Marker key={`wp-${waypoint.placeId}-${index}`} position={[waypoint.lat, waypoint.lon]}>
                  <Popup>Parada {index + 1}</Popup>
                </Marker>
              ),
          )}

          {route && <RouteLayer route={route} />}
          <MapClickMarkerLayer markers={markers} onAddMarker={handleAddMarker} />
        </MapView>
      </section>
    </main>
  );
}
