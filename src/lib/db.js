// src/lib/db.js
import { Pool } from 'pg';

// This ensures your application will not start without a valid database connection string.
if (!process.env.POSTGRES_URL) {
    throw new Error('Database connection string is missing. Please set POSTGRES_URL in your .env.local file');
}

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    // Optional: Add SSL configuration for production environments if needed
    // ssl: {
    //   rejectUnauthorized: false
    // }
});

// Standard usage for simple queries
export const db = {
    query: (text, params) => pool.query(text, params),
};

// Export pool as well for advanced use (like .connect())
export { pool };