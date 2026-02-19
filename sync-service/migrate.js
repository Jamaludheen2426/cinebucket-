require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: {
      rejectUnauthorized: false
    }
  });

  console.log(`Connected to Aiven MySQL. Setting up ${process.env.DB_NAME || 'cinebucketdev'}...`);

  try {
    // 1. Create Database
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'cinebucketdev'}\``);
    await connection.query(`USE \`${process.env.DB_NAME || 'cinebucketdev'}\``);
    console.log(`Using database "${process.env.DB_NAME || 'cinebucketdev'}"`);

    // 2. Create tables exactly matching the live structure

    // Movies table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS movies (
        id int NOT NULL AUTO_INCREMENT,
        name varchar(255) DEFAULT NULL,
        description text,
        duration varchar(50) DEFAULT NULL,
        quality varchar(50) DEFAULT NULL,
        rating decimal(3,1) DEFAULT NULL,
        release_date date DEFAULT NULL,
        language varchar(500) DEFAULT NULL,
        iframe_src varchar(500) DEFAULT NULL,
        poster varchar(500) DEFAULT NULL,
        poster_alt varchar(500) DEFAULT NULL,
        url varchar(500) DEFAULT NULL,
        year int DEFAULT NULL,
        backdrop_path varchar(500) DEFAULT NULL,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);
    console.log('Table "movies" created.');

    // Genres table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS genres (
        id int NOT NULL AUTO_INCREMENT,
        name varchar(100) DEFAULT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);
    console.log('Table "genres" created.');

    // Tags table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tags (
        id int NOT NULL AUTO_INCREMENT,
        name varchar(100) DEFAULT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);
    console.log('Table "tags" created.');

    // Movie Genres linking table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS movie_genres (
        movie_id int NOT NULL,
        genre_id int NOT NULL,
        PRIMARY KEY (movie_id, genre_id),
        KEY genre_id (genre_id),
        CONSTRAINT movie_genres_ibfk_1 FOREIGN KEY (movie_id) REFERENCES movies (id) ON DELETE CASCADE,
        CONSTRAINT movie_genres_ibfk_2 FOREIGN KEY (genre_id) REFERENCES genres (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);
    console.log('Table "movie_genres" created.');

    // Movie Tags linking table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS movie_tags (
        movie_id int NOT NULL,
        tag_id int NOT NULL,
        PRIMARY KEY (movie_id, tag_id),
        KEY tag_id (tag_id),
        CONSTRAINT movie_tags_ibfk_1 FOREIGN KEY (movie_id) REFERENCES movies (id) ON DELETE CASCADE,
        CONSTRAINT movie_tags_ibfk_2 FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);
    console.log('Table "movie_tags" created.');

    // Download Links table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS download_links (
        id int NOT NULL AUTO_INCREMENT,
        movie_id int DEFAULT NULL,
        label varchar(255) DEFAULT NULL,
        url varchar(500) DEFAULT NULL,
        PRIMARY KEY (id),
        KEY movie_id (movie_id),
        CONSTRAINT download_links_ibfk_1 FOREIGN KEY (movie_id) REFERENCES movies (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);
    console.log('Table "download_links" created.');

    console.log('\n--- Migration to cinebucketdev successful ---');

  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await connection.end();
  }
}

migrate();
