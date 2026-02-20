export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';

export async function GET(request: Request) {
    try {
        console.log('--- Syncing to cinebucketdev via Scraper API ---');

        // 1. Call Scraper API
        const scrapeRes = await fetch('https://mkvking-scraper.vercel.app/api/movies', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ start: 0, limit: 20 })
        });

        if (!scrapeRes.ok) {
            throw new Error(`Scraper API failed with status ${scrapeRes.status}`);
        }

        const data = await scrapeRes.json();
        const movies = data.results || [];
        console.log(`Fetched ${movies.length} movies.`);

        let syncedCount = 0;
        let updatedCount = 0;

        // 2. Upsert to Database
        for (const movie of movies) {
            try {
                const [existing]: any = await pool.query(
                    'SELECT id FROM movies WHERE name = ? AND (year = ? OR year IS NULL)',
                    [movie.name, movie.year]
                );

                let movieId;
                const movieData = [
                    movie.name || 'Unknown',
                    movie.description || null,
                    movie.duration || null,
                    movie.quality || null,
                    movie.rating ? parseFloat(movie.rating) : null,
                    movie.release_date || null,
                    movie.language || null,
                    movie.iframe_src || null,
                    movie.poster || null,
                    movie.poster_alt || null,
                    movie.url || null,
                    movie.year ? parseInt(movie.year) : null,
                    movie.backdrop_path || null
                ];

                if (existing.length > 0) {
                    movieId = existing[0].id;
                    await pool.query(`
                        UPDATE movies SET
                        name = ?, description = ?, duration = ?, quality = ?, 
                        rating = ?, release_date = ?, language = ?, iframe_src = ?, 
                        poster = ?, poster_alt = ?, url = ?, year = ?, backdrop_path = ?
                        WHERE id = ?
                    `, [...movieData, movieId]);
                    updatedCount++;
                } else {
                    const [result]: any = await pool.query(`
                        INSERT INTO movies (
                        name, description, duration, quality, 
                        rating, release_date, language, iframe_src, 
                        poster, poster_alt, url, year, backdrop_path
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `, movieData);
                    movieId = result.insertId;
                    syncedCount++;
                }

                // Upsert Genres
                if (movie.genre && Array.isArray(movie.genre)) {
                    await pool.query('DELETE FROM movie_genres WHERE movie_id = ?', [movieId]);
                    for (const genreName of movie.genre) {
                        try {
                            await pool.query('INSERT IGNORE INTO genres (name) VALUES (?)', [genreName]);
                            const [gRows]: any = await pool.query('SELECT id FROM genres WHERE name = ?', [genreName]);
                            if (gRows.length > 0) {
                                const genreId = gRows[0].id;
                                await pool.query('INSERT IGNORE INTO movie_genres (movie_id, genre_id) VALUES (?, ?)', [movieId, genreId]);
                            }
                        } catch (err) {
                            console.error(`Error saving genre ${genreName}:`, err);
                        }
                    }
                }

                // Upsert Tags
                if (movie.tags && Array.isArray(movie.tags)) {
                    await pool.query('DELETE FROM movie_tags WHERE movie_id = ?', [movieId]);
                    for (const tagName of movie.tags) {
                        try {
                            await pool.query('INSERT IGNORE INTO tags (name) VALUES (?)', [tagName]);
                            const [tRows]: any = await pool.query('SELECT id FROM tags WHERE name = ?', [tagName]);
                            if (tRows.length > 0) {
                                const tagId = tRows[0].id;
                                await pool.query('INSERT IGNORE INTO movie_tags (movie_id, tag_id) VALUES (?, ?)', [movieId, tagId]);
                            }
                        } catch (err) {
                            console.error(`Error saving tag ${tagName}:`, err);
                        }
                    }
                }

                // Upsert Download Links
                if (movie.download_links && Array.isArray(movie.download_links)) {
                    await pool.query('DELETE FROM download_links WHERE movie_id = ?', [movieId]);
                    for (const link of movie.download_links) {
                        try {
                            await pool.query(`
                                INSERT INTO download_links (movie_id, label, url)
                                VALUES (?, ?, ?)
                            `, [movieId, link.label || link.name || link.quality || 'Download', link.url]);
                        } catch (err) {
                            console.error(`Error saving link for movie ${movieId}:`, err);
                        }
                    }
                }
            } catch (err: any) {
                console.error(`Err syncing ${movie.name}:`, err.message);
            }
        }

        console.log('--- Sync completed ---');
        return NextResponse.json({
            success: true,
            message: `Synced: ${syncedCount}, Updated: ${updatedCount}`,
            totalProcessed: movies.length
        });

    } catch (error: any) {
        console.error('API Error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
