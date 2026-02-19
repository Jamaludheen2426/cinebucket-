import { Metadata } from "next";
import MovieDescription from "./MovieDescription";
import { MovieDetails, Movies } from "@/app/types/movie"; // Added Movies type
import fetchMovie from "@/app/lib/fetchMovie";
import fetchMoviesByFilters from "@/app/lib/fetchMoviesByFilters"; // Import fetchMoviesByFilters
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function MoviePage({ params }: Props) {
  const { id } = await params;
  const movieId = id;

  try {
    const movieDetails: MovieDetails = await fetchMovie(movieId);
    let relatedMovies: Movies = [];
    const RELATED_MOVIES_LIMIT = 7;

    if (movieDetails && movieDetails.tags && movieDetails.tags.length > 0) {
      const firstTag = movieDetails.tags[0];
      const response = await fetchMoviesByFilters(0, RELATED_MOVIES_LIMIT, undefined, undefined, firstTag);
      if (response && response.data) {
        relatedMovies = (response.data as Movies).filter(movie => movie.id !== movieDetails.id).slice(0, RELATED_MOVIES_LIMIT - 1);
      }
    }

    if (relatedMovies.length === 0) {
      const currentYear = new Date().getFullYear();
      const response = await fetchMoviesByFilters(0, RELATED_MOVIES_LIMIT, currentYear, undefined, undefined);
      if (response && response.data) {
        relatedMovies = (response.data as Movies).filter(movie => movie.id !== movieDetails.id).slice(0, RELATED_MOVIES_LIMIT - 1);
      }
    }

    return <MovieDescription movieDetails={movieDetails} relatedMovies={relatedMovies} />;
  } catch (error) {
    console.error("Error fetching movie:", error);
    return (
      <div className="min-h-screen bg-[#1e2939] flex items-center justify-center">
        <div className="bg-[#0d0f11] p-8 rounded-lg shadow-lg text-white max-w-md">
          <h2 className="text-2xl font-bold mb-4">Error Loading Movie</h2>
          <p>
            Sorry, we couldn't load the movie details. Please try again later.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }
}
