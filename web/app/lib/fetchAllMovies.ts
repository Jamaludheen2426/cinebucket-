import { Movies } from "../types/movie";
import { fetchApi } from "../utils/fetchApi";

export interface FetchAllMoviesResponse {
  movies: Movies;
  total: number;
}

export default async function fetchAllMovies(
  startFrom: number = 0,
  limit: number | null = null,
  keyword?: string
): Promise<FetchAllMoviesResponse> {
  try {
    const res = await fetchApi({
      method: "GET",
      endpoint: "/api/movies",
      queryParams: {
        start: startFrom.toString(),
        limit: limit ? limit.toString() : "20",
        ...(keyword ? { search: keyword } : {})
      }
    });

    console.log("[fetchAllMovies] API response received", {
      responseType: typeof res,
      isArray: Array.isArray(res),
      dataLength: Array.isArray(res?.results) ? res.results.length : (Array.isArray(res) ? res.length : 'N/A')
    });

    if (res && res.results && Array.isArray(res.results)) {
      return {
        movies: res.results,
        total: res.total || res.results.length
      };
    }

    if (Array.isArray(res)) {
      return {
        movies: res,
        total: res.length
      };
    }

    return {
      movies: [],
      total: 0
    };
  } catch (error) {
    console.error("[fetchAllMovies] API request failed:", error);
    throw error;
  }
}
