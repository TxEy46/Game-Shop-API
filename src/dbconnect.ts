import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: "localhost",
  user: "game_shop",
  password: "1",
  database: "game_store",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ทดสอบ connection
export const testConnection = async () => {
  try {
    const [rows] = await pool.query("SELECT 1 + 1 AS result");
    console.log("✅ MySQL connected:", rows);
  } catch (err) {
    console.error("❌ MySQL connection error:", err);
  }
};
