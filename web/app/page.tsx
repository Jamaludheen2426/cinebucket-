export const dynamic = 'force-dynamic';
import { Suspense } from 'react';

import Home from "@/app/components/Home";
import { Movies } from "./types/movie";
import { fetchMoviesServer, fetchMoviesByFiltersServer } from "./lib/fetchMoviesServer"; // Use Server fetching
import HomePageSkeleton from './components/skeletons/HomePageSkeleton';
import { MovieDetails } from './types/movie';

async function PageContent() {

  let allMovies: Movies = [];
  let totalMatches = 0;

  try {
    // Direct DB call - no HTTP fetch needed!
    const response = await fetchMoviesServer(0, 20);
    allMovies = response.movies;
    totalMatches = response.total;
  } catch (error) {
    console.error("Critical Error fetching homepage movies:", error);
  }

  const categoryMovies: Record<string, any> = {};

  const categoriesToFetch = [
    { title: 'Action Movies', genre: 'Action', limit: 10 },
    { title: 'Horror', genre: 'Horror', limit: 10 },
    { title: 'Adventure', genre: 'Adventure', limit: 10 },
    { title: 'Comedy', genre: 'Comedy', limit: 10 },
    { title: 'Sci-Fi', genre: 'Science Fiction', limit: 10 },
    { title: 'Romantic', genre: 'Romance', limit: 10 },
    { title: 'TV Shows', tag: 'Tv show', limit: 10 },
    { title: 'New Releases', year: new Date().getFullYear(), limit: 10 },
    { title: 'Recent Movies', year: new Date().getFullYear() - 1, limit: 10 }
  ];

  const categoryPromises = categoriesToFetch.map(async (cat) => {
    try {
      // Direct DB call
      const response = await fetchMoviesByFiltersServer(0, cat.limit, cat.year, cat.genre, cat.tag);
      return { title: cat.title, movies: response.movies || [] };
    } catch (error) {
      console.error(`Error fetching ${cat.title}:`, error);
      return { title: cat.title, movies: [] };
    }
  });

  const settledCategories = await Promise.all(categoryPromises);
  settledCategories.forEach(catResult => {
    categoryMovies[catResult.title] = catResult.movies;
  });

  return (
    <>
      <Home
        movies={allMovies}
        categoryMovies={categoryMovies}
        totalMovies={totalMatches}
      />
    </>
  );
}

export default function Page() {
  return (
    <main className="bg-slate-900 min-h-screen w-full"> {/* Updated background */}
      <Suspense fallback={<HomePageSkeleton />}>
        <PageContent />
      </Suspense>
    </main>
  );
}
