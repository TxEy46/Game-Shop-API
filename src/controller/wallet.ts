import { Router } from "express";
import { pool } from "../dbconnect";

export const router = Router();

// ดูยอดเงิน Wallet
router.get("/:user_id", async (req, res) => {
  const user_id = Number(req.params.user_id);
  try {
    const [rows]: any = await pool.query("SELECT wallet_balance FROM users WHERE id = ?", [user_id]);
    if (!rows.length) return res.status(404).json({ error: "User not found" });
    res.json({ wallet_balance: rows[0].wallet_balance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// เติมเงิน
router.post("/deposit", async (req, res) => {
  const { user_id, amount } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query("UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?", [amount, user_id]);
    await conn.query(
      "INSERT INTO user_transactions (user_id, type, amount, description) VALUES (?, 'deposit', ?, 'Deposit wallet')",
      [user_id, amount]
    );
    await conn.commit();
    res.json({ message: "Deposit successful" });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: "Deposit failed" });
  } finally {
    conn.release();
  }
});

// Transaction History
router.get("/transactions/:user_id", async (req, res) => {
  const user_id = Number(req.params.user_id);
  try {
    const [rows]: any = await pool.query(
      "SELECT type, amount, description, created_at FROM user_transactions WHERE user_id = ? ORDER BY created_at DESC",
      [user_id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});
