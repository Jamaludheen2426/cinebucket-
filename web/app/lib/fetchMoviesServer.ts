import pool from "./db";
import { Movies, MovieDetails } from "../types/movie";

export async function fetchMoviesServer(startFrom: number = 0, limit: number = 20): Promise<{ movies: Movies, total: number }> {
    try {
        const [rows]: any = await pool.query(
            `SELECT * FROM movies ORDER BY id DESC LIMIT ? OFFSET ?`,
            [limit, startFrom]
        );

        const [countRows]: any = await pool.query('SELECT COUNT(*) as total FROM movies');
        const total = countRows[0]?.total || 0;

        return { movies: rows as Movies, total };
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

        if (conditions.length > 0) {
            const whereClause = ' WHERE ' + conditions.join(' AND ');
            query += whereClause;
            countQuery += whereClause;
        }

        // Get total count first (using same params)
        const [countRows]: any = await pool.query(countQuery, params);
        const total = countRows[0]?.total || 0;

        // Get paginated results
        query += ' ORDER BY m.id DESC LIMIT ? OFFSET ?';
        params.push(limit, startFrom);

        const [rows]: any = await pool.query(query, params);

        return { movies: rows as Movies, total };
    } catch (error) {
        console.error("Database Error fetchMoviesByFiltersServer:", error);
        return { movies: [], total: 0 };
    }
}
