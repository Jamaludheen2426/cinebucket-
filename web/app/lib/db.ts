import mysql from 'mysql2/promise';

// Safe DB connection for build time - handles missing env vars gracefully
const pool = process.env.DB_HOST
    ? mysql.createPool({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '21852'),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: {
            rejectUnauthorized: false
        },
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    })
    : {
        // Dummy implementation for build time
        query: async () => { throw new Error('Database connection not initialized. Check environment variables.'); },
        execute: async () => { throw new Error('Database connection not initialized. Check environment variables.'); },
        getConnection: async () => { throw new Error('Database connection not initialized. Check environment variables.'); },
        end: async () => { }
    } as unknown as mysql.Pool;

export default pool;
