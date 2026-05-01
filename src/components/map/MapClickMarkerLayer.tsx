"use client";

import { Marker, Popup, useMapEvents } from "react-leaflet";
import type { MarkerPoint } from "@/types/map";

type MapClickMarkerLayerProps = {
  markers: MarkerPoint[];
  onAddMarker: (coords: [number, number]) => void;
};

export function MapClickMarkerLayer({
  markers,
  onAddMarker,
}: MapClickMarkerLayerProps) {
  useMapEvents({
    click(event) {
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
