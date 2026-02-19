require('dotenv').config();
const mysql = require('mysql2/promise');
const axios = require('axios');

const SCRAPER_API_URL = process.env.SCRAPER_API_URL || 'http://127.0.0.1:5000';

async function getDbConnection() {
    return await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'cinebucketdev',
        ssl: {
            rejectUnauthorized: false
        }
    });
}

async function upsertMovie(connection, movie) {
    try {
        const [existing] = await connection.query(
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
            await connection.query(`
        UPDATE movies SET
          name = ?, description = ?, duration = ?, quality = ?, 
          rating = ?, release_date = ?, language = ?, iframe_src = ?, 
          poster = ?, poster_alt = ?, url = ?, year = ?, backdrop_path = ?
        WHERE id = ?
      `, [...movieData, movieId]);
            console.log(`Updated: ${movie.name}`);
        } else {
            const [result] = await connection.query(`
        INSERT INTO movies (
          name, description, duration, quality, 
          rating, release_date, language, iframe_src, 
          poster, poster_alt, url, year, backdrop_path
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, movieData);
            movieId = result.insertId;
            console.log(`Synced: ${movie.name}`);
        }

        if (movie.genre && Array.isArray(movie.genre)) {
            await connection.query('DELETE FROM movie_genres WHERE movie_id = ?', [movieId]);
            for (const genreName of movie.genre) {
                await connection.query('INSERT IGNORE INTO genres (name) VALUES (?)', [genreName]);
                const [gRows] = await connection.query('SELECT id FROM genres WHERE name = ?', [genreName]);
                const genreId = gRows[0].id;
                await connection.query('INSERT IGNORE INTO movie_genres (movie_id, genre_id) VALUES (?, ?)', [movieId, genreId]);
            }
        }

        if (movie.download_links && Array.isArray(movie.download_links)) {
            await connection.query('DELETE FROM download_links WHERE movie_id = ?', [movieId]);
            for (const link of movie.download_links) {
                await connection.query(`
          INSERT INTO download_links (movie_id, label, url)
          VALUES (?, ?, ?)
        `, [movieId, link.name || link.quality || 'Download', link.url]);
            }
        }
    } catch (err) { console.error(`Err syncing ${movie.name}:`, err.message); }
}

async function runSync() {
    let connection;
    try {
        connection = await getDbConnection();
        console.log('--- Syncing to cinebucketdev ---');

        const res = await axios.post(`${SCRAPER_API_URL}/api/filters`, { limit: 10 }, { timeout: 30000 });
        const movies = res.data.results || [];
        console.log(`Fetched ${movies.length} movies.`);

        for (const movie of movies) {
            await upsertMovie(connection, movie);
        }
        console.log('--- Sync completed ---');
    } catch (error) {
        if (error.response) console.error('API Error:', error.response.status, error.response.data);
        else console.error('Sync Error:', error.message);
    } finally { if (connection) await connection.end(); }
}

runSync();
