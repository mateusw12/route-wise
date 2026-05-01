"use client";

import { useEffect, useState } from "react";

type GeoState = {
  position: [number, number] | null;
  loading: boolean;
  error: string | null;
};

const GEOLOCATION_UNSUPPORTED_ERROR =
  "Geolocalizacao nao suportada neste navegador.";

export function useGeolocation() {
  const supportsGeolocation =
    typeof navigator !== "undefined" && "geolocation" in navigator;

  const [state, setState] = useState<GeoState>({
    position: null,
    loading: supportsGeolocation,
    error: supportsGeolocation ? null : GEOLOCATION_UNSUPPORTED_ERROR,
  });

  useEffect(() => {
    if (!supportsGeolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          position: [pos.coords.latitude, pos.coords.longitude],
          loading: false,
          error: null,
        });
      },
      () => {
        setState({
          position: null,
          loading: false,
          error: "Nao foi possivel acessar sua localizacao.",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 0,
      },
    );
  }, [supportsGeolocation]);

  return state;
}
