// src/controller/game.ts
import express from "express";
import { pool } from "../dbconnect";
import multer from "multer";
import path from "path";
import fs from "fs";

export const router = express.Router();

// ------------------ CONFIG UPLOAD ------------------
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// ------------------ READ ------------------
// Get all games
router.get("/", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT g.*, c.name AS category_name 
       FROM games g 
       LEFT JOIN categories c ON g.category_id = c.id`
    );
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get game by ID
router.get("/:id", async (req, res) => {
  const gameId = Number(req.params.id);
  if (!gameId) return res.status(400).json({ error: "Invalid game ID" });

  try {
    const [rows]: any = await pool.query(
      `SELECT g.*, c.name AS category_name
       FROM games g
       LEFT JOIN categories c ON g.category_id = c.id
       WHERE g.id = ?`,
      [gameId]
    );

    if (rows.length === 0) return res.status(404).json({ error: "Game not found" });

    res.json(rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------ CREATE ------------------
router.post("/", upload.single("image"), async (req, res) => {
  const { name, price, category_id, description, release_date } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  if (!name || !price || !category_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // ถ้า client ไม่ส่ง release_date ให้ใช้วันนี้
  const releaseDateToUse = release_date || new Date().toISOString().split("T")[0];

  try {
    const [result]: any = await pool.query(
      `INSERT INTO games (name, price, category_id, image_url, description, release_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, price, category_id, image_url, description || null, releaseDateToUse]
    );

    res.json({ message: "Game added", game_id: result.insertId, image_url, release_date: releaseDateToUse });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------ UPDATE ------------------
router.put("/:id", upload.single("image"), async (req, res) => {
  const gameId = Number(req.params.id);
  const { name, price, category_id, description, release_date } = req.body;

  if (!gameId) return res.status(400).json({ error: "Invalid game ID" });

  try {
    // ดึง image_url เดิม
    let currentImage: string | null = null;
    const [rows]: any = await pool.query("SELECT image_url FROM games WHERE id = ?", [gameId]);
    if (rows.length > 0) {
      currentImage = rows[0].image_url;
    }

    const image_url = req.file ? `/uploads/${req.file.filename}` : currentImage;

    const fields: string[] = [];
    const params: any[] = [];

    if (name !== undefined) { fields.push("name = ?"); params.push(name); }
    if (price !== undefined) { fields.push("price = ?"); params.push(price); }
    if (category_id !== undefined) { fields.push("category_id = ?"); params.push(category_id); }
    if (description !== undefined) { fields.push("description = ?"); params.push(description); }
    if (release_date !== undefined) { fields.push("release_date = ?"); params.push(release_date); }
    if (image_url !== undefined) { fields.push("image_url = ?"); params.push(image_url); }

    if (fields.length === 0) return res.status(400).json({ error: "No fields to update" });

    params.push(gameId);
    const sql = `UPDATE games SET ${fields.join(", ")} WHERE id = ?`;
    await pool.query(sql, params);

    res.json({ message: "Game updated", image_url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------ DELETE ------------------
router.delete("/:id", async (req, res) => {
  const gameId = Number(req.params.id);
  const conn = await pool.getConnection();
  try {
    const [rows]: any = await conn.query(
      "SELECT COUNT(*) as count FROM purchase_items WHERE game_id = ?",
      [gameId]
    );
    if (rows[0].count > 0) {
      return res.status(400).json({ error: "Cannot delete this game, it has been purchased." });
    }

    await conn.query("DELETE FROM games WHERE id = ?", [gameId]);
    res.json({ message: "Game deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});
