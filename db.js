// db.js
import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

// Create a connection pool (recommended for multiple requests)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Create a promise-based pool
const db = pool.promise();

// Function to test database connection
export const testDBConnection = async () => {
  try {
    const connection = await db.getConnection();
    console.log(`✅ Database connected successfully...`);
    connection.release(); // Always release the connection back to the pool
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1); // Stop the server if DB connection fails
  }
};

export default db;
