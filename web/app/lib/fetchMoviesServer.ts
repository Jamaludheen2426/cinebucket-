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

/**
 * Fetch a single movie by its numeric ID - direct DB version of fetchMovie()
 */
export async function fetchMovieByIdServer(id: string): Promise<MovieDetails | null> {
    try {
        let movie: any = null;

        // Try numeric ID first
        if (!isNaN(parseInt(id))) {
            const [rows]: any = await pool.query(
                "SELECT * FROM movies WHERE id = ? AND name IS NOT NULL",
                [parseInt(id)]
            );
            movie = rows[0] || null;
        }

        // Fallback: try matching URL slug
        if (!movie) {
            const [rows]: any = await pool.query(
                "SELECT * FROM movies WHERE url LIKE ? AND name IS NOT NULL",
                [`%/${id}/`]
            );
            movie = rows[0] || null;
        }

        if (!movie) return null;

        // Fetch genres
        const [genres]: any = await pool.query(
            "SELECT g.name FROM genres g JOIN movie_genres mg ON g.id = mg.genre_id WHERE mg.movie_id = ?",
            [movie.id]
        );
        movie.genre = genres.map((g: any) => g.name);

        // Fetch tags
        const [tags]: any = await pool.query(
            "SELECT t.name FROM tags t JOIN movie_tags mt ON t.id = mt.tag_id WHERE mt.movie_id = ?",
            [movie.id]
        );
        movie.tags = tags.map((t: any) => t.name);

        // Fetch download links
        const [links]: any = await pool.query(
            "SELECT label as name, url FROM download_links WHERE movie_id = ?",
            [movie.id]
        );
        movie.download_links = links;

        return movie as MovieDetails;
    } catch (error) {
        console.error("Database Error fetchMovieByIdServer:", error);
        return null;
    }
}

/**
 * Fetch movies by filters (genre/year/tag) - direct DB version of fetchMoviesByFilters()
 * Matches the logic in /api/filters/route.ts exactly.
 */
export async function fetchMoviesByFiltersForCategory(
    startFrom: number = 0,
    limit: number = 20,
    year?: number,
    genre?: string,
    tag?: string
): Promise<{ data: Movies; total: number }> {
    try {
        let query = `
            SELECT DISTINCT m.* 
            FROM movies m
            LEFT JOIN movie_genres mg ON m.id = mg.movie_id
            LEFT JOIN genres g ON mg.genre_id = g.id
            LEFT JOIN movie_tags mt ON m.id = mt.movie_id
            LEFT JOIN tags t ON mt.tag_id = t.id
            WHERE m.name IS NOT NULL AND m.name != ''
        `;
        let countQuery = `
            SELECT COUNT(DISTINCT m.id) as total 
            FROM movies m
            LEFT JOIN movie_genres mg ON m.id = mg.movie_id
            LEFT JOIN genres g ON mg.genre_id = g.id
            LEFT JOIN movie_tags mt ON m.id = mt.movie_id
            LEFT JOIN tags t ON mt.tag_id = t.id
            WHERE m.name IS NOT NULL AND m.name != ''
        `;
        const params: any[] = [];
        const countParams: any[] = [];

        if (genre) {
            query += ` AND g.name = ?`;
            countQuery += ` AND g.name = ?`;
            params.push(genre);
            countParams.push(genre);
        }
        if (year) {
            query += ` AND m.year = ?`;
            countQuery += ` AND m.year = ?`;
            params.push(year);
            countParams.push(year);
        }
        if (tag) {
            query += ` AND t.name = ?`;
            countQuery += ` AND t.name = ?`;
            params.push(tag);
            countParams.push(tag);
        }

        query += ` ORDER BY m.release_date DESC LIMIT ? OFFSET ?`;
        params.push(limit, startFrom);

        const [rows]: any = await pool.query(query, params);
        const [countRows]: any = await pool.query(countQuery, countParams);

        const moviesWithGenres = await enrichMoviesWithGenres(rows as MovieDetails[]);

        return {
            data: moviesWithGenres,
            total: countRows[0]?.total || 0
        };
    } catch (error) {
        console.error("Database Error fetchMoviesByFiltersForCategory:", error);
        return { data: [], total: 0 };
    }
}

/**
 * Fetch movies by search query - direct DB version
 */
export async function fetchMoviesBySearchServer(query: string, limit: number = 100): Promise<Movies> {
    try {
        const searchTerm = `%${query}%`;
        const [rows]: any = await pool.query(
            `SELECT * FROM movies 
             WHERE (name LIKE ? OR description LIKE ?) 
             AND name IS NOT NULL AND name != ''
             ORDER BY id DESC LIMIT ?`,
            [searchTerm, searchTerm, limit]
        );

        return await enrichMoviesWithGenres(rows as MovieDetails[]);
    } catch (error) {
        console.error("Database Error fetchMoviesBySearchServer:", error);
        return [];
    }
}
