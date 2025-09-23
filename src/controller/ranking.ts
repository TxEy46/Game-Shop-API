import express from "express";
import { pool } from "../dbconnect";

export const router = express.Router();

// ดึง Top 5 เกมขายดีที่สุดตลอดกาล
router.get("/top", async (req, res) => {
  try {
    // query จาก ranking table โดยตรง
    const [rows]: any = await pool.query(
      `
      SELECT g.id, g.name, g.image_url, r.sales_count
      FROM ranking r
      JOIN games g ON r.game_id = g.id
      ORDER BY r.sales_count DESC
      LIMIT 5
      `
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ฟังก์ชันอัปเดตยอดขายสะสมเมื่อซื้อเกม
export async function updateRanking(gameId: number) {
  try {
    await pool.query(
      `
      INSERT INTO ranking (game_id, sales_count)
      VALUES (?, 1)
      ON DUPLICATE KEY UPDATE
        sales_count = sales_count + 1
      `,
      [gameId]
    );
  } catch (err) {
    console.error("Failed to update ranking:", err);
  }
}
