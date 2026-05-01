export type GeocodingSearchInputDto = {
  query: string;
  limit?: number;
};

export type GeocodingResultDto = {
  placeId: number;
  displayName: string;
  lat: number;
  lon: number;
};

export type NominatimResultDto = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
};
