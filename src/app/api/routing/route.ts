import type { OrsDirectionsDto, RouteInputDto, RouteResponseDto } from "@/libs/dtos/routing.dto";
import { NextResponse } from "next/server";

const ORS_URL = "https://api.openrouteservice.org/v2/directions";

export async function POST(request: Request) {
  const body = (await request.json()) as RouteInputDto;
  const start = body?.start;
  const end = body?.end;

  if (!start || !end) {
    return NextResponse.json(
      { message: "Body must include start and end coordinates" },
      { status: 400 },
    );
  }

  const apiKey = process.env.NEXT_PUBLIC_ORS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { message: "Missing NEXT_PUBLIC_ORS_API_KEY" },
      { status: 500 },
    );
  }

  const profile = body.profile ?? "driving-car";

  const upstream = await fetch(`${ORS_URL}/${profile}/geojson`, {
    method: "POST",
    headers: {
      Authorization: apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      coordinates: [
        [start[1], start[0]],
        [end[1], end[0]],
      ],
    }),
    cache: "no-store",
  });

  if (!upstream.ok) {
    const rawError = await upstream.text().catch(() => "");
    return NextResponse.json(
      { message: "Could not fetch route", details: rawError },
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
