import express from "express";
import { pool } from "../dbconnect";

export const router = express.Router();

// Get cart ของ user
router.get("/:user_id", async (req, res) => {
  const user_id = Number(req.params.user_id);
  try {
    const [cartRows]: any = await pool.query(
      "SELECT id FROM carts WHERE user_id = ?",
      [user_id]
    );

    if (cartRows.length === 0) {
      return res.json([]);
    }

    const cartId = cartRows[0].id;

    const [items]: any = await pool.query(
      `SELECT ci.id, ci.game_id, ci.quantity, g.name, g.price, g.image_url
       FROM cart_items ci
       JOIN games g ON ci.game_id = g.id
       WHERE ci.cart_id = ?`,
      [cartId]
    );

    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add game to cart
router.post("/add", async (req, res) => {
  const { user_id, game_id, quantity } = req.body;
  if (!user_id || !game_id) return res.status(400).json({ error: "Missing parameters" });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // ตรวจว่ามี cart ของ user หรือยัง
    const [cartRows]: any = await conn.query("SELECT id FROM carts WHERE user_id = ?", [user_id]);
    let cartId: number;
    if (cartRows.length === 0) {
      const [result]: any = await conn.query("INSERT INTO carts (user_id) VALUES (?)", [user_id]);
      cartId = result.insertId;
    } else {
      cartId = cartRows[0].id;
    }

    // ตรวจว่ามีเกมใน cart หรือยัง
    const [itemRows]: any = await conn.query(
      "SELECT quantity FROM cart_items WHERE cart_id = ? AND game_id = ?",
      [cartId, game_id]
    );

    if (itemRows.length === 0) {
      await conn.query(
        "INSERT INTO cart_items (cart_id, game_id, quantity) VALUES (?, ?, ?)",
        [cartId, game_id, quantity || 1]
      );
    } else {
      await conn.query(
        "UPDATE cart_items SET quantity = quantity + ? WHERE cart_id = ? AND game_id = ?",
        [quantity || 1, cartId, game_id]
      );
    }

    await conn.commit();
    res.json({ message: "Added to cart" });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    conn.release();
  }
});

// Remove game from cart
router.post("/remove", async (req, res) => {
  const { user_id, game_id } = req.body;
  if (!user_id || !game_id) return res.status(400).json({ error: "Missing parameters" });

  try {
    const [cartRows]: any = await pool.query("SELECT id FROM carts WHERE user_id = ?", [user_id]);
    if (cartRows.length === 0) return res.status(400).json({ error: "Cart not found" });

    const cartId = cartRows[0].id;

    await pool.query("DELETE FROM cart_items WHERE cart_id = ? AND game_id = ?", [cartId, game_id]);
    res.json({ message: "Removed from cart" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Clear cart
router.post("/clear", async (req, res) => {
  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ error: "Missing user_id" });

  try {
    const [cartRows]: any = await pool.query("SELECT id FROM carts WHERE user_id = ?", [user_id]);
    if (cartRows.length === 0) return res.json({ message: "Cart is already empty" });

    const cartId = cartRows[0].id;
    await pool.query("DELETE FROM cart_items WHERE cart_id = ?", [cartId]);
    res.json({ message: "Cart cleared" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

