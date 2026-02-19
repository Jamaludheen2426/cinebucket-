import fetchMoviesByFilters from "./fetchMoviesByFilters";
import { Movies, MovieDetails } from "../types/movie";

export interface CategoryConfig {
  title: string;
  year?: number;
  genre?: string;
  tag?: string;
  limit: number;
  imageUrl?: string;
}

type MovieArray = any[];

export async function fetchMoviesByCategories(categories: CategoryConfig[]): Promise<Record<string, MovieArray>> {
  const results: Record<string, MovieArray> = {};

  try {
    for (const category of categories) {
      try {
        const { title, year, genre, tag, limit } = category;

        const response = await fetchMoviesByFilters(0, limit, year, genre, tag);

        if (response && response.data) {
          const movieArray = Array.isArray(response.data) ? response.data : [response.data];
          results[title] = movieArray;
        } else {
          console.warn(`No data returned for category: ${title}`);
          results[title] = [];
        }
      } catch (error) {
        console.error(`Error fetching category ${category.title}:`, error);
        results[category.title] = [];
      }
    }
  } catch (error) {
    console.error('Error in fetchMoviesByCategories:', error);
  }

  return results;
}

export const defaultCategories: CategoryConfig[] = [
  { title: "Action Movies", genre: "Action", limit: 10 },
  { title: "Horror", genre: "Horror", limit: 10 },
  { title: "Adventure", genre: "Adventure", limit: 10 },
  { title: "Comedy", genre: "Comedy", limit: 10 },
  { title: "Sci-Fi", genre: "Science Fiction", limit: 10 },
  { title: "Romantic", genre: "Romance", limit: 10 },
  { title: "Drama", genre: "Drama", limit: 10 },
  { title: "TV Shows", tag: "Tv show", limit: 20 },
  { title: "New Releases", year: new Date().getFullYear(), limit: 10 },
  { title: "Recent Movies", limit: 20 },
  { title: "Animation", genre: "Animation", limit: 10 }
];
