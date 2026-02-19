import { NextRequest, NextResponse } from 'next/server';
import fetchAllMovies from '@/app/lib/fetchAllMovies';
import fetchMoviesByFilters from '@/app/lib/fetchMoviesByFilters';
import { MovieDetails, Movies } from '@/app/types/movie';

const ITEMS_PER_PAGE = 20;

function calculateRelevanceScore(movie: MovieDetails, query: string): number {
  const normalizedQuery = query.toLowerCase().trim();
  const movieName = (movie.name || '').toLowerCase();
  
  if (movieName === normalizedQuery) {
    return 100;
  }
  
  
  if (movieName.startsWith(normalizedQuery)) {
    return 90;
  }
  
  
  const titleWords = movieName.split(/\s+/);
  if (titleWords.includes(normalizedQuery)) {
    return 80;
  }
  
  
  if (movieName.includes(normalizedQuery)) {
    return 70;
  }
  
  
  const movieDesc = (movie.description || '').toLowerCase();
  if (movieDesc.includes(normalizedQuery)) {
    return 50;
  }
  
  
  const tags = Array.isArray(movie.tags) ? movie.tags.map(tag => tag.toLowerCase()) : [];
  const genres = Array.isArray(movie.genres) ? movie.genres.map(genre => genre.toLowerCase()) : [];
  
  if (tags.some(tag => tag === normalizedQuery)) {
    return 40;
  }
  
  if (genres.some(genre => genre === normalizedQuery)) {
    return 30;
  }
  
  if (tags.some(tag => tag.includes(normalizedQuery)) || genres.some(genre => genre.includes(normalizedQuery))) {
    return 20;
  }
  
  
  const words = normalizedQuery.split(/\s+/);
  if (words.some(word => word.length > 3 && movieName.includes(word))) {
    return 10;
  }
  
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

    console.log(`[API] Request: query="${query}", genre="${genre}", year="${year}", tag="${tag}", page=${page}`);

    if (genre || year || tag) {
      const effectiveGenre = genre ? genre : undefined;
      const effectiveTag = tag ? tag : undefined;
      console.log(`[API] Fetching with filters: genre=${effectiveGenre}, year=${year}, tag=${effectiveTag}, startFrom=${startFrom}, limit=${ITEMS_PER_PAGE}`);
      const filteredResponse = await fetchMoviesByFilters(startFrom, ITEMS_PER_PAGE, year, effectiveGenre, effectiveTag);
      
      return NextResponse.json({
        results: filteredResponse.data,
        total: filteredResponse.total, 
        page: page,
        totalPages: Math.ceil(filteredResponse.total / ITEMS_PER_PAGE) 
      });
    } else if (query.trim()) {
      console.log(`[API] Fetching with query: "${query}"`);
      const allMoviesForQuery = await fetchAllMovies(0, 1000, query); 

      if (Array.isArray(allMoviesForQuery)) {
        const normalizedQuery = query.toLowerCase().trim();
        console.log(`[API] Ranking ${allMoviesForQuery.length} results for: "${normalizedQuery}"`);
        
        const scoredMovies = allMoviesForQuery.map((movie: MovieDetails) => {
          const score = calculateRelevanceScore(movie, normalizedQuery);
          return { movie, score };
        });
        
        const relevantMovies = scoredMovies.filter(item => item.score > 0);
        console.log(`[API] Found ${relevantMovies.length} relevant matches after scoring`);
        
        relevantMovies.sort((a, b) => b.score - a.score);
        
        const sortedResults = relevantMovies.map(item => item.movie);
        return NextResponse.json({
            results: sortedResults,
            total: sortedResults.length, 
            page: 1, 
            totalPages: 1 
        });
      }
      return NextResponse.json({ results: [], total: 0, page: 1, totalPages: 1 });
    }

    console.log("[API] No query or filters provided.");
    return NextResponse.json({ results: [], total: 0, page: 1, totalPages: 1 });
  } catch (error) {
    console.error('[API] Search error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movies', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}