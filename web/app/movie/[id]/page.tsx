export const dynamic = 'force-dynamic';
import { Metadata } from "next";
import MovieDescription from "./MovieDescription";
import { MovieDetails, Movies } from "@/app/types/movie";
import { fetchMovieByIdServer, fetchMoviesByFiltersForCategory } from "@/app/lib/fetchMoviesServer";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function MoviePage({ params }: Props) {
  const { id } = await params;

  try {
    const movieDetails = await fetchMovieByIdServer(id);

    if (!movieDetails) {
      return (
        <div className="min-h-screen bg-[#1e2939] flex items-center justify-center">
          <div className="bg-[#0d0f11] p-8 rounded-lg shadow-lg text-white max-w-md">
            <h2 className="text-2xl font-bold mb-4">Movie Not Found</h2>
            <p>The movie you are looking for does not exist.</p>
            <Link href="/" className="mt-6 inline-block px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700">
              Return to Home
            </Link>
          </div>
        </div>
      );
    }

    let relatedMovies: Movies = [];
    const RELATED_MOVIES_LIMIT = 7;

    // Try related by genre first
    if (movieDetails.genre && movieDetails.genre.length > 0) {
      const firstGenre = movieDetails.genre[0];
      const response = await fetchMoviesByFiltersForCategory(0, RELATED_MOVIES_LIMIT, undefined, firstGenre);
      if (response && response.data) {
        relatedMovies = response.data.filter((m: any) => m.id !== movieDetails.id).slice(0, RELATED_MOVIES_LIMIT - 1);
      }
    }

    // Fallback: recent movies of same year
    if (relatedMovies.length === 0 && movieDetails.year) {
      const response = await fetchMoviesByFiltersForCategory(0, RELATED_MOVIES_LIMIT, movieDetails.year ? parseInt(movieDetails.year) : undefined);
      if (response && response.data) {
        relatedMovies = response.data.filter((m: any) => m.id !== movieDetails.id).slice(0, RELATED_MOVIES_LIMIT - 1);
      }
    }

    return <MovieDescription movieDetails={movieDetails} relatedMovies={relatedMovies} />;
  } catch (error) {
    console.error("Error fetching movie:", error);
    return (
      <div className="min-h-screen bg-[#1e2939] flex items-center justify-center">
        <div className="bg-[#0d0f11] p-8 rounded-lg shadow-lg text-white max-w-md">
          <h2 className="text-2xl font-bold mb-4">Error Loading Movie</h2>
          <p>Sorry, we couldn't load the movie details. Please try again later.</p>
          <Link href="/" className="mt-6 inline-block px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }
}
