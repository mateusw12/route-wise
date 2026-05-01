import { fetcher } from "@/libs/api/fetcher";
import type { RouteInputDto, RouteResponseDto } from "@/libs/dtos/routing.dto";

export class RoutingService {
  static async getRoute(input: RouteInputDto): Promise<RouteResponseDto> {
    return fetcher<RouteResponseDto>("/api/routing", {
      method: "POST",
      body: input,
    });
  }
}
