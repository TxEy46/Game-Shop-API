import express from "express";
import { pool } from "../dbconnect";
import { updateRanking } from "./ranking";

export const router = express.Router();

// POST /purchase - ซื้อเกม
router.post("/", async (req, res) => {
  const { user_id, game_ids, discount_code_id } = req.body;

  if (!Array.isArray(game_ids) || game_ids.length === 0) {
    return res.status(400).json({ error: "No games to purchase" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // --- ตรวจสอบ wallet ---
    const [userRows]: any = await conn.query(
      "SELECT wallet_balance FROM users WHERE id = ?",
      [user_id]
    );
    if (!userRows.length) throw new Error("User not found");
    let walletBalance = Number(userRows[0].wallet_balance);

    // --- ดึงราคารวมของเกม ---
    const [gameRows]: any = await conn.query(
      "SELECT id, price FROM games WHERE id IN (?)",
      [game_ids]
    );
    const totalAmount = gameRows.reduce((sum: number, g: any) => sum + Number(g.price), 0);
    let finalAmount = totalAmount;

    // --- ตรวจสอบ discount code ---
    if (discount_code_id) {
      const [discountRows]: any = await conn.query(
        "SELECT * FROM discount_codes WHERE id = ? AND active = 1",
        [discount_code_id]
      );
      if (!discountRows.length) throw new Error("Discount code invalid or inactive");

      const discount = discountRows[0];

      // ตรวจสอบ min_total
      if (totalAmount < discount.min_total) {
        throw new Error(`ยอดรวมไม่ถึง ${discount.min_total} บาทสำหรับโค้ดนี้`);
      }

      // ตรวจสอบ single_use_per_user
      if (discount.single_use_per_user) {
        const [usedRows]: any = await conn.query(
          "SELECT id FROM user_discount_codes WHERE user_id = ? AND discount_code_id = ?",
          [user_id, discount_code_id]
        );
        if (usedRows.length) throw new Error("คุณใช้โค้ดนี้แล้ว");
      }

      // ตรวจสอบ usage_limit
      if (discount.usage_limit !== null) {
        const [usedCountRows]: any = await conn.query(
          "SELECT COUNT(*) AS used_count FROM user_discount_codes WHERE discount_code_id = ?",
          [discount_code_id]
        );
        if (usedCountRows[0].used_count >= discount.usage_limit) {
          throw new Error("โค้ดส่วนลดหมดแล้ว");
        }
      }

      // คำนวณ finalAmount
      finalAmount = discount.type === "percent"
        ? totalAmount * (1 - Number(discount.value) / 100)
        : totalAmount - Number(discount.value);
      if (finalAmount < 0) finalAmount = 0;

      // บันทึกการใช้โค้ด
      await conn.query(
        "INSERT INTO user_discount_codes (user_id, discount_code_id) VALUES (?, ?)",
        [user_id, discount_code_id]
      );

      // ปิดโค้ดถ้าเกิน usage_limit
      if (discount.usage_limit !== null) {
        const [usedCountRowsAfter]: any = await conn.query(
          "SELECT COUNT(*) AS used_count FROM user_discount_codes WHERE discount_code_id = ?",
          [discount_code_id]
        );
        if (usedCountRowsAfter[0].used_count >= discount.usage_limit) {
          await conn.query("UPDATE discount_codes SET active = 0 WHERE id = ?", [discount_code_id]);
        }
      }
    }

    // --- ตรวจสอบยอดเงินเพียงพอ ---
    if (walletBalance < finalAmount) throw new Error("Insufficient balance");

    // --- สร้าง purchase ---
    const [purchaseResult]: any = await conn.query(
      "INSERT INTO purchases (user_id, purchase_date, total_amount, discount_code_id, final_amount) VALUES (?, NOW(), ?, ?, ?)",
      [user_id, totalAmount, discount_code_id || null, finalAmount]
    );
    const purchaseId = purchaseResult.insertId;

    // --- เพิ่ม purchase_items และ purchased_games ---
    for (const game of gameRows) {
      await conn.query(
        "INSERT INTO purchase_items (purchase_id, game_id, price_at_purchase) VALUES (?, ?, ?)",
        [purchaseId, game.id, game.price]
      );
      await conn.query(
        "INSERT IGNORE INTO purchased_games (user_id, game_id) VALUES (?, ?)",
        [user_id, game.id]
      );

      // อัปเดต ranking
      await updateRanking(game.id);
    }

    // --- หัก wallet ---
    await conn.query(
      "UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?",
      [finalAmount, user_id]
    );

    // --- เพิ่ม transaction ---
    await conn.query(
      "INSERT INTO user_transactions (user_id, type, amount, description) VALUES (?, 'purchase', ?, 'Purchase games')",
      [user_id, finalAmount]
    );

    // --- ล้างตะกร้า ---
    const [cartRows]: any = await conn.query(
      "SELECT id FROM carts WHERE user_id = ?",
      [user_id]
    );
    if (cartRows.length) {
      const cartId = cartRows[0].id;
      await conn.query("DELETE FROM cart_items WHERE cart_id = ?", [cartId]);
    }

    await conn.commit();
    res.json({ message: "Purchase successful", purchase_id: purchaseId, finalAmount });
  } catch (err: any) {
    await conn.rollback();
    res.status(400).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// GET เกมที่ผู้ใช้ซื้อแล้ว
router.get("/:user_id", async (req, res) => {
  const user_id = Number(req.params.user_id);
  try {
    const [rows]: any = await pool.query(
      `SELECT g.id, g.name, g.image_url
       FROM purchased_games pg
       JOIN games g ON pg.game_id = g.id
       WHERE pg.user_id = ?`,
      [user_id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});
