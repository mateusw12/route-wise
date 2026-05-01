"use client";

import { useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { GeocodingResultDto } from "@/libs/dtos/geocoding.dto";
import type { RouteResponseDto } from "@/libs/dtos/routing.dto";
import { RoutingService } from "@/libs/services/routing.service";
import { useGeolocation } from "@/hooks/useGeolocation";
import type { MarkerPoint } from "@/types/map";
import { SearchBox, type SearchBoxHandle, type SearchTarget } from "@/components/search/SearchBox";
import { AuthButton } from "@/components/auth/AuthButton";
import { MdAccessTimeFilled, MdOutlinePlace, MdOutlineRoute } from "react-icons/md";

const MAX_WAYPOINTS = 4;

const MapView = dynamic(
  () => import("@/components/map/MapView").then((module) => module.MapView),
  { ssr: false },
);

const Marker = dynamic(() => import("react-leaflet").then((module) => module.Marker), {
  ssr: false,
});

const Popup = dynamic(() => import("react-leaflet").then((module) => module.Popup), {
  ssr: false,
});

const RouteLayer = dynamic(
  () => import("@/components/map/RouteLayer").then((module) => module.RouteLayer),
  { ssr: false },
);

const UserLocation = dynamic(
  () => import("@/components/map/UserLocation").then((module) => module.UserLocation),
  { ssr: false },
);

const MapClickMarkerLayer = dynamic(
  () => import("@/components/map/MapClickMarkerLayer").then((module) => module.MapClickMarkerLayer),
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
  const searchBoxRef = useRef<SearchBoxHandle>(null);
  const { position, error: geoError } = useGeolocation();
  const [start, setStart] = useState<GeocodingResultDto | null>(null);
  const [end, setEnd] = useState<GeocodingResultDto | null>(null);
  const [waypoints, setWaypoints] = useState<(GeocodingResultDto | null)[]>([]);
  const [route, setRoute] = useState<RouteResponseDto | null>(null);
  const [isRouting, setIsRouting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markers, setMarkers] = useState<MarkerPoint[]>([]);
  const [isMarkerModeEnabled, setIsMarkerModeEnabled] = useState(false);

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

    let targetToFill: SearchTarget | null = null;
    if (!start) {
      targetToFill = { type: "start" };
    } else if (!end) {
      targetToFill = { type: "end" };
    }

    if (!targetToFill) {
      return;
    }

    const [lat, lon] = coords;
    const markerLocation: GeocodingResultDto = {
      placeId: Date.now(),
      displayName: `Ponto no mapa (${lat.toFixed(5)}, ${lon.toFixed(5)})`,
      lat,
      lon,
    };

    handleSelect(targetToFill, markerLocation);
    searchBoxRef.current?.setFieldValue(targetToFill, markerLocation.displayName);
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

  function clearRoute() {
    setRoute(null);
    setError(null);
  }

  function toggleMarkerMode() {
    setIsMarkerModeEnabled((current) => !current);
  }

  return (
    <main className="page-shell">
      <section className="map-stage">
        <div className="auth-floating">
          <AuthButton />
        </div>

        <SearchBox
          ref={searchBoxRef}
          waypointCount={waypoints.length}
          onSelect={handleSelect}
          onAddWaypoint={addWaypoint}
          onRemoveWaypoint={removeWaypoint}
          onBuildRoute={buildRoute}
          onClearRoute={clearRoute}
          onToggleMarkerMode={toggleMarkerMode}
          markerModeEnabled={isMarkerModeEnabled}
          isRouting={isRouting}
        />

        {geoError && <div className="toast-warning">{geoError}</div>}
        {error && <div className="toast-error">{error}</div>}

        {route && (
          <div className="route-summary">
            <p className="route-summary-item">
              <MdOutlineRoute className="btn-icon" aria-hidden="true" />
              Distancia: <strong>{formatDistanceMeters(route.summary.distance)}</strong>
            </p>
            <p className="route-summary-item">
              <MdAccessTimeFilled className="btn-icon" aria-hidden="true" />
              Tempo estimado: <strong>{formatDurationSeconds(route.summary.duration)}</strong>
            </p>
            <p className="route-summary-item">
              <MdOutlinePlace className="btn-icon" aria-hidden="true" />
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
          <MapClickMarkerLayer
            markers={markers}
            onAddMarker={handleAddMarker}
            enabled={isMarkerModeEnabled}
          />
        </MapView>
      </section>
    </main>
  );
}
