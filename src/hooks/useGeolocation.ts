"use client";

import { useEffect, useState } from "react";

type GeoState = {
  position: [number, number] | null;
  loading: boolean;
  error: string | null;
};

export function useGeolocation() {
  const [state, setState] = useState<GeoState>({
    position: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setState({
        position: null,
        loading: false,
        error: "Geolocalizacao nao suportada neste navegador.",
      });
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
  }, []);

  return state;
}
