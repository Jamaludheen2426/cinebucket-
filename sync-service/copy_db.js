require('dotenv').config();
const mysql = require('mysql2/promise');

async function copyDatabase() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl: {
            rejectUnauthorized: false
        },
        multipleStatements: true
    });

    console.log('Connected to Aiven MySQL. Starting database copy...');

    try {
        // 1. Ensure target exists
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'cinebucketdev'}\``);

        const tables = ['movies', 'genres', 'tags', 'movie_genres', 'movie_tags', 'download_links'];

        // Disable foreign key checks for clean truncation and insertion
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        for (const table of tables) {
            console.log(`Copying table: ${table}...`);

            await connection.query(`TRUNCATE TABLE \`${process.env.DB_NAME || 'cinebucketdev'}\`.${table}`);

            await connection.query(`INSERT INTO \`${process.env.DB_NAME || 'cinebucketdev'}\`.${table} SELECT * FROM cinebucket.${table}`);

            const [count] = await connection.query(`SELECT COUNT(*) as count FROM \`${process.env.DB_NAME || 'cinebucketdev'}\`.${table}`);
            console.log(`Success! Copied ${count[0].count} rows into ${process.env.DB_NAME || 'cinebucketdev'}.${table}`);
        }

        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log(`\n--- Database copy from cinebucket to ${process.env.DB_NAME || 'cinebucketdev'} completed successfully! ---`);

    } catch (error) {
        console.error('Error copying database:', error.message);
    } finally {
        await connection.end();
    }
}

copyDatabase();
