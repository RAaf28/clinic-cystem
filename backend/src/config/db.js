const mysql = require("mysql2/promise");
require("dotenv").config();
/**
 * MySQL Connection Pool
 * Menggunakan mysql2/promise untuk async/await support
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
});
/**
 * Test koneksi database saat server start
 * @returns {Promise<void>}
 */
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Database MySQL terhubung berhasil");
    connection.release();
  } catch (error) {
    console.error("Gagal terhubung ke database:", error.message);
    process.exit(1);
  }
};
module.exports = { pool, testConnection };
