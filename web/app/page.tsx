import { Suspense } from 'react';
import Home from "@/app/components/Home";
import { Movies } from "./types/movie";
import fetchAllMovies from "./lib/fetchAllMovies";
import fetchMoviesByFilters from "./lib/fetchMoviesByFilters";
import HomePageSkeleton from './components/skeletons/HomePageSkeleton';
import { MovieDetails } from './types/movie';

async function PageContent() {

  const extractMovies = (response: any) => {
    if (!response) return [];
    if (response.data) {
      return Array.isArray(response.data) ? response.data : [response.data];
    }
    if (Array.isArray(response)) {
      return response;
    }
    if (typeof response === 'object') {
      for (const key in response) {
        if (Array.isArray(response[key])) {
          return response[key];
        }
      }
    }
    return [];
  };

  const allMoviesResponse = await fetchAllMovies(0, 20);
  const allMovies: Movies = extractMovies(allMoviesResponse);

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
      const response = await fetchMoviesByFilters(0, cat.limit, cat.year, cat.genre, cat.tag);
      const movies = extractMovies(response);
      if (movies && movies.length > 0) {
        return { title: cat.title, movies };
      } else {
        console.warn(`No valid movies found for ${cat.title}`);
        return { title: cat.title, movies: [] };
      }
    } catch (error) {
      console.error(`Error fetching ${cat.title}:`, error);
      return { title: cat.title, movies: [] };
    }
  });

  const settledCategories = await Promise.all(categoryPromises);
  settledCategories.forEach(catResult => {
    categoryMovies[catResult.title] = catResult.movies;
  });


  const featuredMovieData = allMovies && allMovies.length > 0 ? allMovies[0] : null;

  return (
    <>
      <Home
        movies={allMovies}
        categoryMovies={categoryMovies}
        totalMovies={allMoviesResponse.total}
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
