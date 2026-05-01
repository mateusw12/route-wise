import type { OrsDirectionsDto, RouteInputDto, RouteResponseDto } from "@/libs/dtos/routing.dto";
import { NextResponse } from "next/server";

const ORS_URL = "https://api.openrouteservice.org/v2/directions";

type OrsErrorPayload = {
  error?: {
    code?: number;
    message?: string;
  };
};

function buildDirectionsBody(
  coordinates: number[][],
  withExpandedRadius: boolean,
) {
  if (!withExpandedRadius) {
    return { coordinates };
  }

  return {
    coordinates,
    // Expands snapping radius for each coordinate to reduce "unroutable point" failures.
    radiuses: coordinates.map(() => 1200),
  };
}

async function requestDirections(
  profile: string,
  apiKey: string,
  coordinates: number[][],
  withExpandedRadius: boolean,
) {
  return fetch(`${ORS_URL}/${profile}/geojson`, {
    method: "POST",
    headers: {
      Authorization: apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildDirectionsBody(coordinates, withExpandedRadius)),
    cache: "no-store",
  });
}

function parseUpstreamError(rawError: string): OrsErrorPayload | null {
  try {
    return JSON.parse(rawError) as OrsErrorPayload;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as RouteInputDto;
  const start = body?.start;
  const end = body?.end;
  const waypoints = body?.waypoints ?? [];

  if (!start || !end) {
    return NextResponse.json(
      { message: "Body must include start and end coordinates" },
      { status: 400 },
    );
  }

  const apiKey = process.env.ORS_API_KEY ?? process.env.NEXT_PUBLIC_ORS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { message: "Missing ORS_API_KEY" },
      { status: 500 },
    );
  }

  const profile = body.profile ?? "driving-car";

  const coordinates = [start, ...waypoints, end].map(([lat, lon]) => [lon, lat]);

  let upstream = await requestDirections(profile, apiKey, coordinates, false);

  if (!upstream.ok) {
    const firstErrorRaw = await upstream.text().catch(() => "");
    const parsedError = parseUpstreamError(firstErrorRaw);
    const isUnroutablePoint = parsedError?.error?.code === 2010;

    // Retry once with larger radiuses when ORS cannot find a nearby routable point.
    if (isUnroutablePoint) {
      upstream = await requestDirections(profile, apiKey, coordinates, true);
    } else {
      return NextResponse.json(
        { message: "Could not fetch route", details: firstErrorRaw },
        { status: upstream.status },
      );
    }
  }

  if (!upstream.ok) {
    const rawError = await upstream.text().catch(() => "");
    const parsedError = parseUpstreamError(rawError);
    const isUnroutablePoint = parsedError?.error?.code === 2010;

    return NextResponse.json(
      {
        message: isUnroutablePoint
          ? "Nao foi possivel encontrar uma via trafegavel perto de um dos pontos. Tente ajustar um pouco a origem ou o destino."
          : "Could not fetch route",
        details: rawError,
      },
      { status: upstream.status },
    );
  }

  const data = (await upstream.json()) as OrsDirectionsDto;
  const feature = data.features?.[0];

  if (!feature) {
    return NextResponse.json({ message: "Route not found" }, { status: 404 });
  }

  const response: RouteResponseDto = {
    coordinates: feature.geometry.coordinates.map(([lon, lat]) => [lat, lon]),
    summary: {
      distance: feature.properties.summary.distance,
      duration: feature.properties.summary.duration,
    },
  };

  return NextResponse.json(response);
}
