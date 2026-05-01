import type {
  GeocodingResultDto,
  NominatimResultDto,
} from "@/libs/dtos/geocoding.dto";
import { NextResponse } from "next/server";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const limit = Number(searchParams.get("limit") ?? "5");

  if (!q) {
    return NextResponse.json({ message: "Missing query parameter q" }, { status: 400 });
  }

  const upstreamQuery = new URLSearchParams({
    format: "jsonv2",
    q,
    limit: String(Number.isNaN(limit) ? 5 : Math.min(Math.max(limit, 1), 10)),
  });

  const upstream = await fetch(`${NOMINATIM_URL}?${upstreamQuery.toString()}`, {
    headers: {
      "User-Agent": "RouteWise/1.0",
      "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
    },
    cache: "no-store",
  });

  if (!upstream.ok) {
    return NextResponse.json(
      { message: "Could not fetch geocoding data" },
      { status: upstream.status },
    );
  }

  const data = (await upstream.json()) as NominatimResultDto[];

  const mapped: GeocodingResultDto[] = data.map((item) => ({
    placeId: item.place_id,
    displayName: item.display_name,
    lat: Number(item.lat),
    lon: Number(item.lon),
  }));

  return NextResponse.json(mapped);
}
