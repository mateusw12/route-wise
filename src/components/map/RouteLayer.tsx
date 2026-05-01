"use client";

import { Marker, Polyline, Popup } from "react-leaflet";
import type { RouteResponseDto } from "@/libs/dtos/routing.dto";

type RouteLayerProps = {
  route: RouteResponseDto;
};

export function RouteLayer({ route }: RouteLayerProps) {
  if (!route.coordinates.length) {
    return null;
  }

  const start = route.coordinates[0];
  const end = route.coordinates[route.coordinates.length - 1];

  return (
    <>
      <Polyline positions={route.coordinates} pathOptions={{ color: "#0f172a", weight: 5 }} />
      <Marker position={start}>
        <Popup>Origem</Popup>
      </Marker>
      <Marker position={end}>
        <Popup>Destino</Popup>
      </Marker>
    </>
  );
}
