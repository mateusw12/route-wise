export type RouteInputDto = {
  start: [number, number];
  end: [number, number];
  waypoints?: [number, number][];
  profile?: "driving-car";
};

export type RouteSummaryDto = {
  distance: number;
  duration: number;
};

export type RouteResponseDto = {
  coordinates: [number, number][];
  summary: RouteSummaryDto;
};

type OrsFeatureDto = {
  geometry: {
    coordinates: [number, number][];
  };
  properties: {
    summary: RouteSummaryDto;
  };
};

export type OrsDirectionsDto = {
  features: OrsFeatureDto[];
};
