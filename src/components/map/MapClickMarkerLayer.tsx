"use client";

import { Marker, Popup, useMapEvents } from "react-leaflet";
import type { MarkerPoint } from "@/types/map";

type MapClickMarkerLayerProps = {
  markers: MarkerPoint[];
  onAddMarker: (coords: [number, number]) => void;
  enabled: boolean;
};

export function MapClickMarkerLayer({
  markers,
  onAddMarker,
  enabled,
}: MapClickMarkerLayerProps) {
  useMapEvents({
    click(event) {
      if (!enabled) {
        return;
      }

      onAddMarker([event.latlng.lat, event.latlng.lng]);
    },
  });

  return (
    <>
      {markers.map((marker) => (
        <Marker key={marker.id} position={marker.coords}>
          <Popup>Marcador adicionado no mapa</Popup>
        </Marker>
      ))}
    </>
  );
}
