"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Marker, Popup } from "react-leaflet";
import type { GeocodingResultDto } from "@/libs/dtos/geocoding.dto";
import type { RouteResponseDto } from "@/libs/dtos/routing.dto";
import { RoutingService } from "@/libs/services/routing.service";
import { useGeolocation } from "@/hooks/useGeolocation";
import type { MarkerPoint } from "@/types/map";
import { SearchBox } from "@/components/search/SearchBox";
import { RouteLayer } from "@/components/map/RouteLayer";
import { UserLocation } from "@/components/map/UserLocation";
import { MapClickMarkerLayer } from "@/components/map/MapClickMarkerLayer";
import { AuthButton } from "@/components/auth/AuthButton";

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
  const [route, setRoute] = useState<RouteResponseDto | null>(null);
  const [isRouting, setIsRouting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markers, setMarkers] = useState<MarkerPoint[]>([]);

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
      });

      setRoute(result);
    } catch {
      setError("Nao foi possivel calcular a rota agora. Tente novamente.");
    } finally {
      setIsRouting(false);
    }
  }

  function handleSelect(field: "start" | "end", location: GeocodingResultDto) {
    setError(null);

    if (field === "start") {
      setStart(location);
      return;
    }

    setEnd(location);
  }

  function handleAddMarker(coords: [number, number]) {
    const point: MarkerPoint = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      coords,
    };

    setMarkers((current) => [...current, point]);
  }

  return (
    <main className="page-shell">
      <section className="top-bar">
        <AuthButton />
        <button type="button" className="route-btn" onClick={buildRoute} disabled={isRouting}>
          {isRouting ? "Calculando..." : "Tracar rota"}
        </button>
      </section>

      <section className="map-stage">
        <SearchBox onSelect={handleSelect} />

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

          {route && <RouteLayer route={route} />}
          <MapClickMarkerLayer markers={markers} onAddMarker={handleAddMarker} />
        </MapView>
      </section>
    </main>
  );
}
