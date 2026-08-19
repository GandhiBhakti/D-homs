require('dotenv').config();
const mysql = require('mysql2/promise');

// Database configuration - production requires all environment variables
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Validate required environment variables
if (!dbConfig.host || !dbConfig.user || !dbConfig.database) {
    throw new Error('Missing required database environment variables: DB_HOST, DB_USER, DB_NAME');
}

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test connection
pool.getConnection()
    .then(connection => {
        console.log('Database connected successfully');
        connection.release();
    })
    .catch(error => {
        console.error('Database connection failed:', error.message);
        if (process.env.NODE_ENV === 'production') {
            console.error('CRITICAL: Database connection failed in production');
        }
    });

module.exports = pool;
