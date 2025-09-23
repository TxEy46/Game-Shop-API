import express from "express";
import { pool } from "../dbconnect";

export const router = express.Router();

// GET โค้ดส่วนลดตาม code
router.get("/", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).json({ error: "Missing code" });

  try {
    const [rows] = await pool.query(
      "SELECT * FROM discount_codes WHERE code = ? AND active = 1",
      [code]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// ตัวอย่างใน discount router
router.get("/:code", async (req, res) => {
  const code = req.params.code;
  const total = Number(req.query.total) || 0;
  const user_id = Number(req.query.user_id);

  try {
    const [rows]: any = await pool.query(
      "SELECT * FROM discount_codes WHERE code = ? AND active = 1",
      [code]
    );

    if (!rows.length) return res.json([]);

    const discount = rows[0];

    // ตรวจสอบยอดขั้นต่ำ
    if (total < discount.min_total) return res.json([]);

    // ตรวจสอบว่าผู้ใช้ใช้โค้ดนี้ไปแล้วหรือไม่
    let used_by_user = false;
    if (discount.single_use_per_user && user_id) {
      const [usedRows]: any = await pool.query(
        "SELECT id FROM user_discount_codes WHERE user_id = ? AND discount_code_id = ?",
        [user_id, discount.id]
      );
      used_by_user = usedRows.length > 0;
    }

    // คำนวณ finalAmount
    const finalAmount = discount.type === "percent"
      ? total * (1 - Number(discount.value) / 100)
      : total - Number(discount.value);

    res.json([{ ...discount, finalAmount: finalAmount < 0 ? 0 : finalAmount, used_by_user }]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
