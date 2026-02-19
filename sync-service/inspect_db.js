require('dotenv').config();
const mysql = require('mysql2/promise');

async function inspect() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: 'cinebucket',
        ssl: {
            rejectUnauthorized: false
        }
    });

    console.log('--- Inspecting cinebucket ---');
    try {
        const [tables] = await connection.query('SHOW TABLES');
        for (const tableRow of tables) {
            const tableName = Object.values(tableRow)[0];
            console.log(`\nTable: ${tableName}`);
            const [columns] = await connection.query(`DESCRIBE ${tableName}`);
            console.table(columns);
        }
    } catch (error) {
        console.error('Error inspecting database:', error.message);
    } finally {
        await connection.end();
    }
}

inspect();
