// db.js
import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();

// Use GLOBAL pool so we don't create new connections on every request
let pool;

if (!global._mysqlPool) {
  global._mysqlPool = mysql
    .createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    })
    .promise();
}

pool = global._mysqlPool;

// Function to test DB connection
export const testDBConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Database connected successfully...");
    connection.release();
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    throw err;   // IMPORTANT: Do NOT use process.exit() in serverless
  }
};

export default pool;
