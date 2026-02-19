import { MovieDetails } from "../types/movie";
import { fetchApi } from "../utils/fetchApi";

export default async function fetchMovie(id: string): Promise<MovieDetails> {
  const res = await fetchApi({
    method: "GET",
    endpoint: `/api/movies/${id}`,
  });

  return res;
}
