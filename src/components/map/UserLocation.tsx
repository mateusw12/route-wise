"use client";

import { Circle, Marker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";

type UserLocationProps = {
  position: [number, number];
};

export function UserLocation({ position }: UserLocationProps) {
  const map = useMap();

  useEffect(() => {
    map.setView(position, 14, { animate: true });
  }, [map, position]);

  return (
    <>
      <Circle
        center={position}
        radius={120}
        pathOptions={{ color: "#0f766e", fillColor: "#0f766e", fillOpacity: 0.15 }}
      />
      <Marker position={position}>
        <Popup>Voce esta aqui</Popup>
      </Marker>
    </>
  );
}
