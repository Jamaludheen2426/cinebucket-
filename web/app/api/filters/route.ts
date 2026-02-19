import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { start = 0, limit = 20, genre, year, tag } = data;

        let query = `
      SELECT DISTINCT m.* 
      FROM movies m
      LEFT JOIN movie_genres mg ON m.id = mg.movie_id
      LEFT JOIN genres g ON mg.genre_id = g.id
      LEFT JOIN movie_tags mt ON m.id = mt.movie_id
      LEFT JOIN tags t ON mt.tag_id = t.id
      WHERE 1=1
    `;
        const params: any[] = [];

        if (genre) {
            query += ` AND g.name = ?`;
            params.push(genre);
        }

        if (year) {
            query += ` AND m.year = ?`;
            params.push(year);
        }

        if (tag) {
            query += ` AND t.name = ?`;
            params.push(tag);
        }

        query += ` ORDER BY m.release_date DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(start));

        const [rows]: any = await pool.query(query, params);

        // Fetch genres for each
        for (const movie of rows) {
            const [genres]: any = await pool.query(
                'SELECT g.name FROM genres g JOIN movie_genres mg ON g.id = mg.genre_id WHERE mg.movie_id = ?',
                [movie.id]
            );
            movie.genre = genres.map((g: any) => g.name);
        }

        // Get total count
        let countQuery = `
      SELECT COUNT(DISTINCT m.id) as total 
      FROM movies m
      LEFT JOIN movie_genres mg ON m.id = mg.movie_id
      LEFT JOIN genres g ON mg.genre_id = g.id
      LEFT JOIN movie_tags mt ON m.id = mt.movie_id
      LEFT JOIN tags t ON mt.tag_id = t.id
      WHERE 1=1
    `;
        const countParams: any[] = [];
        if (genre) { countQuery += ` AND g.name = ?`; countParams.push(genre); }
        if (year) { countQuery += ` AND m.year = ?`; countParams.push(year); }
        if (tag) { countQuery += ` AND t.name = ?`; countParams.push(tag); }

        const [countRows]: any = await pool.query(countQuery, countParams);

        return NextResponse.json({
            results: rows,
            total: countRows[0].total,
            count: rows.length
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
