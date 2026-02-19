import pool from "./db";
import { Movies, MovieDetails } from "../types/movie";

/**
 * Helper to fetch and attach genres to a list of movies.
 * This mimics the API logic where genres are fetched for each movie.
 * Uses a single IN query for efficiency.
 */
async function enrichMoviesWithGenres(movies: MovieDetails[]): Promise<MovieDetails[]> {
    if (!movies || movies.length === 0) return movies;

    // Extract IDs. If any ID is missing, skip it.
    const movieIds = movies.map(m => m.id).filter(id => id != null);
    if (movieIds.length === 0) return movies;

    try {
        // Query genres for these movies
        const [rows]: any = await pool.query(
            `SELECT mg.movie_id, g.name 
             FROM genres g 
             JOIN movie_genres mg ON g.id = mg.genre_id 
             WHERE mg.movie_id IN (?)`,
            [movieIds]
        );

        // Group genres by movie_id
        const genreMap: Record<string, string[]> = {};

        // Initialize map for all movies to ensure empty array if no genres found
        movies.forEach(m => {
            genreMap[String(m.id)] = [];
        });

        rows.forEach((row: any) => {
            const mId = String(row.movie_id);
            if (genreMap[mId]) {
                genreMap[mId].push(row.name);
            }
        });

        // Assign genres back to movie objects
        // We modify the objects in place or return new ones. In-place is fine here.
        movies.forEach(m => {
            m.genre = genreMap[String(m.id)] || [];
        });

    } catch (error) {
        console.error("Error fetching genres for movies:", error);
        // On error, return movies as-is (genres will be undefined or empty)
    }
    return movies;
}

export async function fetchMoviesServer(startFrom: number = 0, limit: number = 20): Promise<{ movies: Movies, total: number }> {
    try {
        const [rows]: any = await pool.query(
            `SELECT * FROM movies WHERE name IS NOT NULL AND name != '' ORDER BY id DESC LIMIT ? OFFSET ?`,
            [limit, startFrom]
        );

        const [countRows]: any = await pool.query('SELECT COUNT(*) as total FROM movies WHERE name IS NOT NULL AND name != \'\'');
        const total = countRows[0]?.total || 0;

        const moviesWithGenres = await enrichMoviesWithGenres(rows as MovieDetails[]);

        return { movies: moviesWithGenres, total };
    } catch (error) {
        console.error("Database Error fetchMoviesServer:", error);
        return { movies: [], total: 0 };
    }
}

export async function fetchMoviesByFiltersServer(
    startFrom: number,
    limit: number,
    year?: number,
    genre?: string,
    tag?: string
): Promise<{ movies: Movies, total: number }> {
    try {
        let query = 'SELECT DISTINCT m.* FROM movies m';
        const baseCondition = "m.name IS NOT NULL AND m.name != ''";
        let countQuery = 'SELECT COUNT(DISTINCT m.id) as total FROM movies m';

        const params: any[] = [];
        const conditions: string[] = [];

        if (genre) {
            const join = ' JOIN movie_genres mg ON m.id = mg.movie_id JOIN genres g ON mg.genre_id = g.id';
            query += join;
            countQuery += join;
            conditions.push('g.name = ?');
            params.push(genre);
        }

        if (tag) {
            const join = ' JOIN movie_tags mt ON m.id = mt.movie_id JOIN tags t ON mt.tag_id = t.id';
            query += join;
            countQuery += join;
            conditions.push('t.name = ?');
            params.push(tag);
        }

        if (year) {
            conditions.push('m.year = ?');
            params.push(year);
        }

        // Always add base condition to skip empty rows
        conditions.unshift(baseCondition);

        if (conditions.length > 0) {
            const whereClause = ' WHERE ' + conditions.join(' AND ');
            query += whereClause;
            countQuery += whereClause;
        }

        // Get total count first
        const [countRows]: any = await pool.query(countQuery, params);
        const total = countRows[0]?.total || 0;

        // Get paginated results
        query += ' ORDER BY m.id DESC LIMIT ? OFFSET ?';
        params.push(limit, startFrom);

        const [rows]: any = await pool.query(query, params);

        const moviesWithGenres = await enrichMoviesWithGenres(rows as MovieDetails[]);

        return { movies: moviesWithGenres, total };
    } catch (error) {
        console.error("Database Error fetchMoviesByFiltersServer:", error);
        return { movies: [], total: 0 };
    }
}
