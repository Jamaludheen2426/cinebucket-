export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { fetchMoviesByFiltersForCategory, fetchMoviesBySearchServer } from '@/app/lib/fetchMoviesServer';
import { MovieDetails } from '@/app/types/movie';

const ITEMS_PER_PAGE = 20;

function calculateRelevanceScore(movie: MovieDetails, query: string): number {
  const normalizedQuery = query.toLowerCase().trim();
  const movieName = (movie.name || '').toLowerCase();

  if (movieName === normalizedQuery) return 100;
  if (movieName.startsWith(normalizedQuery)) return 90;

  const titleWords = movieName.split(/\s+/);
  if (titleWords.includes(normalizedQuery)) return 80;

  if (movieName.includes(normalizedQuery)) return 70;

  const movieDesc = (movie.description || '').toLowerCase();
  if (movieDesc.includes(normalizedQuery)) return 50;

  const genres = Array.isArray(movie.genre) ? movie.genre.map(g => g.toLowerCase()) : [];
  if (genres.some(g => g === normalizedQuery)) return 30;

  // Tags are not currently fetched in list view, so we skip tag scoring for now
  // unless we update fetchMoviesServer to include tags.

  const words = normalizedQuery.split(/\s+/);
  if (words.some(word => word.length > 3 && movieName.includes(word))) return 10;

  return 0;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query') || '';
    const genre = searchParams.get('genre');
    const yearParam = searchParams.get('year');
    const tag = searchParams.get('tag');
    const pageParam = searchParams.get('page');

    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const year = yearParam ? parseInt(yearParam, 10) : undefined;
    const startFrom = (page - 1) * ITEMS_PER_PAGE;

    // 1. Handle Filter-based Search (Genre, Year, Tag)
    if (genre || year || tag) {
      const effectiveGenre = genre || undefined;
      const effectiveTag = tag || undefined;

      const filteredResponse = await fetchMoviesByFiltersForCategory(startFrom, ITEMS_PER_PAGE, year, effectiveGenre, effectiveTag);

      return NextResponse.json({
        results: filteredResponse.data,
        total: filteredResponse.total,
        page: page,
        totalPages: Math.ceil(filteredResponse.total / ITEMS_PER_PAGE)
      });
    }

    // 2. Handle Text-based Search
    else if (query.trim()) {
      // Fetch pure DB results
      const allMovies = await fetchMoviesBySearchServer(query, 500); // Limit 500 for performance

      if (allMovies && allMovies.length > 0) {
        const normalizedQuery = query.toLowerCase().trim();

        // Score results
        const scoredMovies = allMovies.map((movie: MovieDetails) => ({
          movie,
          score: calculateRelevanceScore(movie, normalizedQuery)
        }));

        // Filter and Sort
        const relevantMovies = scoredMovies
          .filter(item => item.score > 0)
          .sort((a, b) => b.score - a.score);

        const results = relevantMovies.map(item => item.movie);

        return NextResponse.json({
          results: results,
          total: results.length,
          page: 1,
          totalPages: 1
        });
      }
      return NextResponse.json({ results: [], total: 0, page: 1, totalPages: 1 });
    }

    return NextResponse.json({ results: [], total: 0, page: 1, totalPages: 1 });
  } catch (error: any) {
    console.error('[API] Search error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movies', message: error.message },
      { status: 500 }
    );
  }
}