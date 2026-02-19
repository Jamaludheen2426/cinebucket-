export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '20');
        const start = parseInt(searchParams.get('start') || '0');

        const [rows]: any = await pool.query(
            'SELECT * FROM movies ORDER BY release_date DESC LIMIT ? OFFSET ?',
            [limit, start]
        );

        // Fetch genres for each movie
        for (const movie of rows) {
            const [genres]: any = await pool.query(
                'SELECT g.name FROM genres g JOIN movie_genres mg ON g.id = mg.genre_id WHERE mg.movie_id = ?',
                [movie.id]
            );
            movie.genre = genres.map((g: any) => g.name);
        }

        return NextResponse.json(rows);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
