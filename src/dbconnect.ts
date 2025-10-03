import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || "3306"),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const testConnection = async () => {
  try {
    const [rows] = await pool.query("SELECT 1 + 1 AS result");
    console.log("✅ MySQL connected:", rows);
  } catch (err) {
    console.error("❌ MySQL connection error:", err);
  }
};
