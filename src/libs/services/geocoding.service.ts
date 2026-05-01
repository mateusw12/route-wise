import { fetcher } from "@/libs/api/fetcher";
import type {
  GeocodingResultDto,
  GeocodingSearchInputDto,
} from "@/libs/dtos/geocoding.dto";

export class GeocodingService {
  static async search(
    input: GeocodingSearchInputDto,
  ): Promise<GeocodingResultDto[]> {
    const query = new URLSearchParams({
      q: input.query,
      limit: String(input.limit ?? 5),
    });

    return fetcher<GeocodingResultDto[]>(`/api/geocoding?${query.toString()}`);
  }
}
