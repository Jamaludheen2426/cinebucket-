import { Movies } from "../types/movie";
import { fetchApi } from "../utils/fetchApi";

interface FetchMoviesByFiltersResponse {
  data: Movies;
  total: number;
}

export default async function fetchMoviesByFilters(
  startFrom: number = 0,
  limit: number = 10,
  year?: number,
  genre?: string,
  tag?: string
): Promise<FetchMoviesByFiltersResponse> {
  try {

    const res = await fetchApi({
      method: "POST",
      endpoint: "/api/filters",
      body: {
        start: startFrom,
        limit: limit,
        year: year || null,
        genre: genre || null,
        tag: tag || null,
      },
    });

    if (res && res.results && Array.isArray(res.results)) {
      return {
        data: res.results,
        total: res.total || 0,
      };
    }

    return { data: [] as Movies, total: 0 };

  } catch (error) {
    console.error('Error in fetchMoviesByFilters:', error);
    return { data: [] as Movies, total: 0 };
  }
}
