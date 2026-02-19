import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';

export async function GET(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        let movie: any;

        if (!isNaN(parseInt(id))) {
            const [rows]: any = await pool.query('SELECT * FROM movies WHERE id = ?', [id]);
            movie = rows[0];
        }

        if (!movie) {
            const [rows]: any = await pool.query('SELECT * FROM movies WHERE url LIKE ?', [`%/${id}/`]);
            movie = rows[0];
        }

        if (!movie) {
            return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
        }

        const [genres]: any = await pool.query(
            'SELECT g.name FROM genres g JOIN movie_genres mg ON g.id = mg.genre_id WHERE mg.movie_id = ?',
            [movie.id]
        );
        movie.genre = genres.map((g: any) => g.name);

        const [tags]: any = await pool.query(
            'SELECT t.name FROM tags t JOIN movie_tags mt ON t.id = mt.tag_id WHERE mt.movie_id = ?',
            [movie.id]
        );
        movie.tags = tags.map((t: any) => t.name);

        const [links]: any = await pool.query(
            'SELECT label as name, url FROM download_links WHERE movie_id = ?',
            [movie.id]
        );
        movie.download_links = links;

        return NextResponse.json(movie);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
